import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  Router,
  RouterLink
} from '@angular/router';

import {
  EstadoVenta,
  Venta
} from '../../../core/models/venta.model';

import { PermissionService } from '../../../core/services/permission';
import { VentasService } from '../../../core/services/ventas';

import { Sidebar } from '../../../shared/components/sidebar/sidebar';
import { Topbar } from '../../../shared/components/topbar/topbar';

@Component({
  selector: 'app-historial-ventas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
  ],
  templateUrl: './historial-ventas.html',
  styleUrl: './historial-ventas.css'
})
export class HistorialVentas implements OnInit {
  ventas: Venta[] = [];
  ventasFiltradas: Venta[] = [];

  busqueda = '';
  estadoSeleccionado: EstadoVenta | 'todos' = 'todos';
  fechaSeleccionada = '';

  ventaSeleccionada: Venta | null = null;

  modalDetalleAbierto = false;
  modalCancelacionAbierto = false;

  motivoCancelacion = '';
  mensajeError = '';
  mensajeExito = '';

  constructor(
    private ventasService: VentasService,
    private permissionService: PermissionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.puedeVerHistorial) {
      this.redirigirAlDashboard();
      return;
    }

    this.cargarVentas();
  }

  get sucursal(): string {
    return (
      localStorage.getItem('sucursal') ||
      'Sucursal no asignada'
    );
  }

  get rolActual(): string {
    return localStorage.getItem('rol') || 'cajero';
  }

  get puedeVerHistorial(): boolean {
    return this.permissionService.tienePermiso(
      'VENTAS_HISTORIAL_VER'
    );
  }

  get puedeRegistrar(): boolean {
    return this.permissionService.tienePermiso(
      'VENTAS_CREAR'
    );
  }

  get puedeCancelar(): boolean {
    return this.permissionService.tienePermiso(
      'VENTAS_CANCELAR'
    );
  }

  get puedeDevolver(): boolean {
    return this.permissionService.tienePermiso(
      'VENTAS_DEVOLVER'
    );
  }

  get totalVentas(): number {
    return this.ventas.length;
  }

  get ventasCompletadas(): number {
    return this.ventas.filter(
      (venta) => venta.estado === 'completada'
    ).length;
  }

  get ventasCanceladas(): number {
    return this.ventas.filter(
      (venta) => venta.estado === 'cancelada'
    ).length;
  }

  get ventasDevueltas(): number {
    return this.ventas.filter(
      (venta) => venta.estado === 'devuelta'
    ).length;
  }

  get totalVendido(): number {
    return this.ventas
      .filter(
        (venta) => venta.estado === 'completada'
      )
      .reduce(
        (acumulado, venta) =>
          acumulado + venta.total,
        0
      );
  }

  cargarVentas(): void {
    this.ventas =
      this.ventasService.obtenerVentas();

    this.ordenarVentasPorFecha();

    this.aplicarFiltros();
  }

  aplicarFiltros(): void {
    const textoBusqueda = this.busqueda
      .trim()
      .toLowerCase();

    this.ventasFiltradas = this.ventas.filter(
      (venta) => {
        const coincideBusqueda =
          !textoBusqueda ||
          venta.folio
            .toLowerCase()
            .includes(textoBusqueda) ||
          venta.cajero
            .toLowerCase()
            .includes(textoBusqueda) ||
          venta.correoCajero
            .toLowerCase()
            .includes(textoBusqueda) ||
          venta.sucursal
            .toLowerCase()
            .includes(textoBusqueda) ||
          venta.productos.some((producto) =>
            producto.nombre
              .toLowerCase()
              .includes(textoBusqueda)
          );

        const coincideEstado =
          this.estadoSeleccionado === 'todos' ||
          venta.estado ===
            this.estadoSeleccionado;

        const coincideFecha =
          !this.fechaSeleccionada ||
          venta.fecha === this.fechaSeleccionada;

        return (
          coincideBusqueda &&
          coincideEstado &&
          coincideFecha
        );
      }
    );
  }

  limpiarFiltros(): void {
    this.busqueda = '';
    this.estadoSeleccionado = 'todos';
    this.fechaSeleccionada = '';

    this.aplicarFiltros();
  }

  abrirDetalle(venta: Venta): void {
    this.ventaSeleccionada = venta;
    this.modalDetalleAbierto = true;

    this.mensajeError = '';
    this.mensajeExito = '';
  }

  cerrarDetalle(): void {
    this.modalDetalleAbierto = false;
    this.ventaSeleccionada = null;
  }

  abrirCancelacion(venta: Venta): void {
    this.mensajeError = '';
    this.mensajeExito = '';

    if (!this.puedeCancelar) {
      this.mensajeError =
        'No tienes permiso para cancelar ventas.';
      return;
    }

    if (venta.estado === 'cancelada') {
      this.mensajeError =
        'La venta seleccionada ya está cancelada.';
      return;
    }

    if (venta.estado === 'devuelta') {
      this.mensajeError =
        'No se puede cancelar una venta devuelta.';
      return;
    }

    this.ventaSeleccionada = venta;
    this.motivoCancelacion = '';
    this.modalCancelacionAbierto = true;
  }

  cerrarCancelacion(): void {
    this.modalCancelacionAbierto = false;
    this.ventaSeleccionada = null;
    this.motivoCancelacion = '';

    this.mensajeError = '';
    this.mensajeExito = '';
  }

  confirmarCancelacion(): void {
    this.mensajeError = '';
    this.mensajeExito = '';

    if (!this.puedeCancelar) {
      this.mensajeError =
        'No tienes permiso para cancelar ventas.';
      return;
    }

    if (!this.ventaSeleccionada) {
      this.mensajeError =
        'No hay una venta seleccionada.';
      return;
    }

    if (
      this.ventaSeleccionada.estado !==
      'completada'
    ) {
      this.mensajeError =
        'Solo se pueden cancelar ventas completadas.';
      return;
    }

    if (!this.motivoCancelacion.trim()) {
      this.mensajeError =
        'Debes escribir el motivo de la cancelación.';
      return;
    }

    const confirmacion = window.confirm(
      `¿Confirmas la cancelación de la venta ${this.ventaSeleccionada.folio}?`
    );

    if (!confirmacion) {
      return;
    }

    try {
      const ventaCancelada =
        this.ventasService.cancelarVenta(
          this.ventaSeleccionada.id,
          this.motivoCancelacion
        );

      this.mensajeExito =
        `La venta ${ventaCancelada.folio} fue cancelada correctamente.`;

      this.modalCancelacionAbierto = false;
      this.ventaSeleccionada = null;
      this.motivoCancelacion = '';

      this.cargarVentas();
    } catch (error) {
      this.mensajeError =
        error instanceof Error
          ? error.message
          : 'No fue posible cancelar la venta.';
    }
  }

  devolverVenta(venta: Venta): void {
    this.mensajeError = '';
    this.mensajeExito = '';

    if (!this.puedeDevolver) {
      this.mensajeError =
        'No tienes permiso para procesar devoluciones.';
      return;
    }

    if (venta.estado !== 'completada') {
      this.mensajeError =
        'Solo se pueden devolver ventas completadas.';
      return;
    }

    const confirmacion = window.confirm(
      `¿Deseas marcar la venta ${venta.folio} como devuelta?`
    );

    if (!confirmacion) {
      return;
    }

    try {
      const ventaDevuelta =
        this.ventasService.devolverVenta(
          venta.id
        );

      this.mensajeExito =
        `La venta ${ventaDevuelta.folio} fue marcada como devuelta.`;

      this.cargarVentas();
    } catch (error) {
      this.mensajeError =
        error instanceof Error
          ? error.message
          : 'No fue posible procesar la devolución.';
    }
  }

  irANuevaVenta(): void {
    if (!this.puedeRegistrar) {
      this.mensajeError =
        'No tienes permiso para registrar ventas.';
      return;
    }

    this.router.navigate(['/nueva-venta'], {
      queryParams: {
        modo: 'registrar'
      }
    });
  }

  irACancelarVenta(venta?: Venta): void {
    if (!this.puedeCancelar) {
      this.mensajeError =
        'No tienes permiso para cancelar ventas.';
      return;
    }

    const queryParams: {
      modo: string;
      folio?: string;
    } = {
      modo: 'cancelar'
    };

    if (venta) {
      queryParams.folio = venta.folio;
    }

    this.router.navigate(
      ['/nueva-venta'],
      { queryParams }
    );
  }

  obtenerClaseEstado(
    estado: EstadoVenta
  ): string {
    return estado;
  }

  obtenerTextoEstado(
    estado: EstadoVenta
  ): string {
    switch (estado) {
      case 'completada':
        return 'Completada';

      case 'cancelada':
        return 'Cancelada';

      case 'devuelta':
        return 'Devuelta';

      default:
        return estado;
    }
  }

  obtenerMetodoPago(
    metodoPago: Venta['metodoPago']
  ): string {
    return metodoPago === 'efectivo'
      ? 'Efectivo'
      : 'Tarjeta';
  }

  cerrarMensajes(): void {
    this.mensajeError = '';
    this.mensajeExito = '';
  }

  private ordenarVentasPorFecha(): void {
    this.ventas = [...this.ventas].sort(
      (ventaA, ventaB) => {
        const fechaA = new Date(
          `${ventaA.fecha}T${ventaA.hora}`
        ).getTime();

        const fechaB = new Date(
          `${ventaB.fecha}T${ventaB.hora}`
        ).getTime();

        return fechaB - fechaA;
      }
    );
  }

  private redirigirAlDashboard(): void {
    if (this.rolActual === 'admin') {
      this.router.navigate(['/dashboard-admin']);
      return;
    }

    if (this.rolActual === 'gerente') {
      this.router.navigate(['/dashboard-gerente']);
      return;
    }

    this.router.navigate(['/dashboard-cajero']);
  }
}