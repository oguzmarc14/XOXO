import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface TiendaBackend {
  _id: string;
  nombre: string;
  direccion: string;
  ciudad: string;
  telefono: string;
}

@Component({
  selector: 'app-lista-tiendas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lista-tiendas.html',
  styleUrl: './lista-tiendas.css',
})
export class ListaTiendas implements OnInit {
  busqueda = '';
  ciudadSeleccionada = 'todas';

  tiendas: TiendaBackend[] = [];
  tiendasFiltradas: TiendaBackend[] = [];

  mensajeExito = '';
  mensajeError = '';

  modalEliminarAbierto = false;
  tiendaSeleccionada: TiendaBackend | null = null;

  private readonly apiUrl = 'https://xoxo-backend-ewqr.onrender.com/tiendas';

  constructor(
    private router: Router,
    private http: HttpClient,
  ) {}

  ngOnInit(): void {
    this.cargarTiendas();
  }

  get totalTiendas(): number {
    return this.tiendas.length;
  }

  get ciudades(): string[] {
    return [...new Set(this.tiendas.map((tienda) => tienda.ciudad))].sort();
  }

  cargarTiendas(): void {
    this.http.get<TiendaBackend[]>(this.apiUrl).subscribe({
      next: (tiendasBackend) => {
        this.tiendas = tiendasBackend;
        this.aplicarFiltros();
      },
      error: (error) => {
        console.error('Error al cargar tiendas:', error);

        this.mensajeError = error.error?.message || 'No fue posible cargar las tiendas.';

        this.tiendas = [];
        this.aplicarFiltros();
      },
    });
  }

  aplicarFiltros(): void {
    const texto = this.normalizarTexto(this.busqueda);

    this.tiendasFiltradas = this.tiendas.filter((tienda) => {
      const coincideBusqueda =
        !texto ||
        this.normalizarTexto(tienda.nombre).includes(texto) ||
        this.normalizarTexto(tienda.ciudad).includes(texto) ||
        this.normalizarTexto(tienda.direccion).includes(texto) ||
        this.normalizarTexto(tienda.telefono).includes(texto);

      const coincideCiudad =
        this.ciudadSeleccionada === 'todas' || tienda.ciudad === this.ciudadSeleccionada;

      return coincideBusqueda && coincideCiudad;
    });
  }

  limpiarFiltros(): void {
    this.busqueda = '';
    this.ciudadSeleccionada = 'todas';

    this.aplicarFiltros();
  }

  crearTienda(): void {
    this.router.navigate(['/crear-tienda']);
  }

  editarTienda(tienda: TiendaBackend): void {
    this.router.navigate(['/editar-tiendas', tienda._id]);
  }

  abrirEliminar(tienda: TiendaBackend): void {
    this.tiendaSeleccionada = tienda;
    this.modalEliminarAbierto = true;
  }

  cerrarEliminar(): void {
    this.modalEliminarAbierto = false;
    this.tiendaSeleccionada = null;
  }

  confirmarEliminar(): void {
    if (!this.tiendaSeleccionada) {
      return;
    }

    this.http.delete(`${this.apiUrl}/${this.tiendaSeleccionada._id}`).subscribe({
      next: () => {
        this.mensajeExito = 'La tienda fue eliminada correctamente.';

        this.cerrarEliminar();
        this.cargarTiendas();
        this.ocultarMensaje();
      },
      error: (error) => {
        console.error('Error al eliminar tienda:', error);

        this.mensajeError = error.error?.message || 'No fue posible eliminar la tienda.';
      },
    });
  }

  private normalizarTexto(texto: string): string {
    return texto
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  private ocultarMensaje(): void {
    setTimeout(() => {
      this.mensajeExito = '';
      this.mensajeError = '';
    }, 2500);
  }
}
