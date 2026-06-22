import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface TiendaBackend {
  nombre: string;
  direccion: string;
  ciudad: string;
  telefono: string;
}

@Component({
  selector: 'app-crear-tienda',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './crear-tienda.html',
  styleUrl: './crear-tienda.css'
})
export class CrearTienda {
  nombre = '';
  direccion = '';
  ciudad = '';
  telefono = '';

  guardando = false;

  mensajeError = '';
  mensajeExito = '';

  private readonly apiUrl = 'http://localhost:3000/tiendas';

  constructor(
    private router: Router,
    private http: HttpClient
  ) {}

  guardarSucursal(): void {
    this.limpiarMensajes();

    if (!this.nombre.trim()) {
      this.mensajeError = 'El nombre de la tienda es obligatorio.';
      return;
    }

    if (this.nombre.trim().length < 3) {
      this.mensajeError = 'El nombre debe contener al menos 3 caracteres.';
      return;
    }

    if (!this.ciudad.trim()) {
      this.mensajeError = 'La ciudad es obligatoria.';
      return;
    }

    if (!this.direccion.trim()) {
      this.mensajeError = 'La dirección es obligatoria.';
      return;
    }

    if (!this.telefono.trim()) {
      this.mensajeError = 'El teléfono es obligatorio.';
      return;
    }

    const telefonoLimpio = this.telefono.replace(/\D/g, '');

    if (telefonoLimpio.length < 10) {
      this.mensajeError = 'El teléfono debe contener al menos 10 dígitos.';
      return;
    }

    this.guardando = true;

    const nuevaTienda: TiendaBackend = {
      nombre: this.nombre.trim(),
      direccion: this.direccion.trim(),
      ciudad: this.ciudad.trim(),
      telefono: this.telefono.trim()
    };

    this.http.post<TiendaBackend>(this.apiUrl, nuevaTienda)
      .subscribe({
        next: () => {
          this.mensajeExito = 'La tienda se registró correctamente.';

          setTimeout(() => {
            this.router.navigate(['/lista-tiendas']);
          }, 900);
        },
        error: error => {
          console.error('Error al crear tienda:', error);

          this.mensajeError =
            error.error?.message ||
            'No fue posible registrar la tienda.';
        },
        complete: () => {
          this.guardando = false;
        }
      });
  }

  limpiarFormulario(): void {
    this.nombre = '';
    this.direccion = '';
    this.ciudad = '';
    this.telefono = '';

    this.limpiarMensajes();
  }

  volverAlListado(): void {
    this.router.navigate(['/lista-tiendas']);
  }

  private limpiarMensajes(): void {
    this.mensajeError = '';
    this.mensajeExito = '';
  }
}