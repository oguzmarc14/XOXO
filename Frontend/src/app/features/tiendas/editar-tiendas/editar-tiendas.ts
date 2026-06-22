import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ActivatedRoute,
  Router
} from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface TiendaBackend {
  _id: string;
  nombre: string;
  direccion: string;
  ciudad: string;
  telefono: string;
}

@Component({
  selector: 'app-editar-tiendas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './editar-tiendas.html',
  styleUrl: './editar-tiendas.css'
})
export class EditarTiendas implements OnInit {
  tiendaId = '';

  nombre = '';
  direccion = '';
  ciudad = '';
  telefono = '';

  cargando = true;
  guardando = false;

  mensajeError = '';
  mensajeExito = '';

  private readonly apiUrl = 'http://localhost:3000/tiendas';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.mensajeError = 'No se recibió el ID de la tienda.';
      this.cargando = false;
      return;
    }

    this.tiendaId = id;
    this.cargarTienda();
  }

  cargarTienda(): void {
    this.http.get<TiendaBackend>(`${this.apiUrl}/${this.tiendaId}`)
      .subscribe({
        next: tienda => {
          this.nombre = tienda.nombre;
          this.direccion = tienda.direccion;
          this.ciudad = tienda.ciudad;
          this.telefono = tienda.telefono;

          this.cargando = false;
        },
        error: error => {
          console.error('Error al cargar tienda:', error);

          this.mensajeError =
            error.error?.message ||
            'No fue posible cargar la tienda.';

          this.cargando = false;
        }
      });
  }

  guardarCambios(): void {
    this.limpiarMensajes();

    if (!this.nombre.trim()) {
      this.mensajeError = 'El nombre es obligatorio.';
      return;
    }

    if (!this.direccion.trim()) {
      this.mensajeError = 'La dirección es obligatoria.';
      return;
    }

    if (!this.ciudad.trim()) {
      this.mensajeError = 'La ciudad es obligatoria.';
      return;
    }

    if (!this.telefono.trim()) {
      this.mensajeError = 'El teléfono es obligatorio.';
      return;
    }

    this.guardando = true;

    const tiendaActualizada = {
      nombre: this.nombre.trim(),
      direccion: this.direccion.trim(),
      ciudad: this.ciudad.trim(),
      telefono: this.telefono.trim()
    };

    this.http.put(`${this.apiUrl}/${this.tiendaId}`, tiendaActualizada)
      .subscribe({
        next: () => {
          this.mensajeExito = 'La tienda se actualizó correctamente.';

          setTimeout(() => {
            this.router.navigate(['/lista-tiendas']);
          }, 900);
        },
        error: error => {
          console.error('Error al actualizar tienda:', error);

          this.mensajeError =
            error.error?.message ||
            'No fue posible actualizar la tienda.';

          this.guardando = false;
        },
        complete: () => {
          this.guardando = false;
        }
      });
  }

  volverAlListado(): void {
    this.router.navigate(['/lista-tiendas']);
  }

  private limpiarMensajes(): void {
    this.mensajeError = '';
    this.mensajeExito = '';
  }
}