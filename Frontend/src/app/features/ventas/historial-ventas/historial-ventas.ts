import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  Router,
  RouterLink
} from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface TiendaBackend {
  _id: string;
  nombre: string;
  direccion?: string;
  ciudad?: string;
  telefono?: string;
}

interface ProductoBackend {
  _id: string;
  codigo?: number;
  nombre: string;
  precio: number;
  categoria: string;
  stockMinimo?: number;
}

interface ProductoVentaBackend {
  productoId: ProductoBackend;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  stockAnterior?: number;
  stockNuevo?: number;
}

interface VentaBackend {
  _id: string;
  tiendaId: TiendaBackend;
  productos: ProductoVentaBackend[];
  total: number;
  fecha: string;
}

@Component({
  selector: 'app-historial-ventas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './historial-ventas.html',
  styleUrl: './historial-ventas.css'
})
export class HistorialVentas implements OnInit {
  ventas: VentaBackend[] = [];
  ventasFiltradas: VentaBackend[] = [];

  busqueda = '';
  fechaSeleccionada = '';

  ventaSeleccionada: VentaBackend | null = null;
  modalDetalleAbierto = false;

  mensajeError = '';
  cargando = false;

  private readonly ventasApi = 'http://localhost:3000/ventas';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarVentas();
  }

  get totalVentas(): number {
    return this.ventas.length;
  }

  get totalVendido(): number {
    return this.ventas.reduce(
      (total, venta) => total + venta.total,
      0
    );
  }

  get totalProductosVendidos(): number {
    return this.ventas.reduce(
      (total, venta) => total + this.obtenerCantidadProductos(venta),
      0
    );
  }

  get totalTiendas(): number {
    return new Set(
      this.ventas.map(venta => venta.tiendaId?._id)
    ).size;
  }

  cargarVentas(): void {
    this.cargando = true;
    this.mensajeError = '';

    this.http.get<VentaBackend[]>(this.ventasApi)
      .subscribe({
        next: ventas => {
          this.ventas = ventas.sort(
            (a, b) =>
              new Date(b.fecha).getTime() -
              new Date(a.fecha).getTime()
          );

          this.aplicarFiltros();
          this.cargando = false;
        },
        error: error => {
          console.error('Error al cargar ventas:', error);
          this.mensajeError =
            error.error?.message ||
            'No fue posible cargar las ventas.';
          this.ventas = [];
          this.ventasFiltradas = [];
          this.cargando = false;
        }
      });
  }

  aplicarFiltros(): void {
    const texto = this.normalizarTexto(this.busqueda);

    this.ventasFiltradas = this.ventas.filter(venta => {
      const folio = this.obtenerFolio(venta);
      const tienda = this.obtenerNombreTienda(venta);
      const productos = venta.productos
        .map(item => item.productoId?.nombre || '')
        .join(' ');

      const coincideBusqueda =
        !texto ||
        this.normalizarTexto(folio).includes(texto) ||
        this.normalizarTexto(tienda).includes(texto) ||
        this.normalizarTexto(productos).includes(texto);

      const coincideFecha =
        !this.fechaSeleccionada ||
        this.obtenerFechaInput(venta.fecha) === this.fechaSeleccionada;

      return coincideBusqueda && coincideFecha;
    });
  }

  limpiarFiltros(): void {
    this.busqueda = '';
    this.fechaSeleccionada = '';
    this.aplicarFiltros();
  }

  abrirDetalle(venta: VentaBackend): void {
    this.ventaSeleccionada = venta;
    this.modalDetalleAbierto = true;
  }

  cerrarDetalle(): void {
    this.ventaSeleccionada = null;
    this.modalDetalleAbierto = false;
  }

  irANuevaVenta(): void {
    this.router.navigate(['/nueva-venta']);
  }

  obtenerFolio(venta: VentaBackend): string {
    return `#V-${venta._id.slice(-6).toUpperCase()}`;
  }

  obtenerNombreTienda(venta: VentaBackend): string {
    if (!venta.tiendaId) {
      return 'Tienda no disponible';
    }

    return venta.tiendaId.ciudad
      ? `${venta.tiendaId.nombre} - ${venta.tiendaId.ciudad}`
      : venta.tiendaId.nombre;
  }

  obtenerCantidadProductos(venta: VentaBackend): number {
    return venta.productos.reduce(
      (total, producto) => total + producto.cantidad,
      0
    );
  }

  obtenerHora(fecha: string): string {
    return new Date(fecha).toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  private obtenerFechaInput(fecha: string): string {
    return new Date(fecha).toISOString().split('T')[0];
  }

  private normalizarTexto(texto: string): string {
    return (texto || '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}