import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import {
  CardResumen,
  CardResumenItem
} from '../../../../shared/components/card-resumen/card-resumen';

interface TiendaBackend {
  _id: string;
  nombre: string;
  ciudad?: string;
}

interface UsuarioTurno {
  _id: string;
  nombre: string;
  usuario?: string;
  rol?: string;
}

interface TurnoBackend {
  _id: string;
  tiendaId: string | TiendaBackend;
  usuarioId: string | UsuarioTurno;
  numeroCaja: number;
  montoInicial: number;
  estado: 'ABIERTO' | 'CERRADO';
  fechaApertura: string;
}

interface VentaBackend {
  _id: string;
  tiendaId: string | TiendaBackend;
  productos?: any[];
  total?: number;
  totalVenta?: number;
  estado?: string;
  fecha?: string;
  fechaVenta?: string;
  createdAt?: string;
}

interface InventarioBackend {
  _id: string;
  piezas: number;
  productoId?: {
    _id: string;
    nombre: string;
    stockMinimo?: number;
  };
}

@Component({
  selector: 'app-dashboard-cajero',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    CardResumen
  ],
  templateUrl: './dashboard-cajero.html',
  styleUrl: './dashboard-cajero.css'
})
export class DashboardCajero implements OnInit {
  turnoActivo = false;
  tiendaId = '';
  sucursal = 'Tienda no asignada';
  horaInicio = '--:--';

  ventasRecientes: VentaBackend[] = [];
  productosStockBajo = 0;

  resumenFinal: CardResumenItem[] = [];

  private readonly turnosApi = 'https://xoxo-backend-ewqr.onrender.com/turnos';
  private readonly ventasApi = 'https://xoxo-backend-ewqr.onrender.com/ventas';
  private readonly inventarioApi = 'https://xoxo-backend-ewqr.onrender.com/inventario';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.cargarTurnoActivo();
  }

  get subtituloTurno(): string {
    return `Turno: ${this.turnoActivo ? 'Activo' : 'Inactivo'} · ${this.sucursal}`;
  }

  cargarTurnoActivo(): void {
    this.http.get<TurnoBackend[]>(`${this.turnosApi}/abiertos`)
      .subscribe({
        next: turnos => {
          if (!turnos.length) {
            this.turnoActivo = false;
            this.actualizarResumen();
            return;
          }

          const turno = turnos[0];

          this.turnoActivo = true;

          this.tiendaId =
            typeof turno.tiendaId === 'string'
              ? turno.tiendaId
              : turno.tiendaId._id;

          this.sucursal =
            typeof turno.tiendaId === 'string'
              ? 'Tienda asignada'
              : turno.tiendaId.ciudad
                ? `${turno.tiendaId.nombre} - ${turno.tiendaId.ciudad}`
                : turno.tiendaId.nombre;

          this.horaInicio = this.formatearHora(turno.fechaApertura);

          this.cargarVentasRecientes();
          this.cargarStockBajo();
          this.actualizarResumen();
        },
        error: error => {
          console.error('Error al cargar turno activo:', error);
          this.turnoActivo = false;
          this.actualizarResumen();
        }
      });
  }

  cargarVentasRecientes(): void {
    this.http.get<VentaBackend[]>(this.ventasApi)
      .subscribe({
        next: ventas => {
          this.ventasRecientes = ventas
            .filter(venta => this.obtenerTiendaId(venta.tiendaId) === this.tiendaId)
            .sort((a, b) => {
              const fechaA = new Date(this.obtenerFechaVenta(a)).getTime();
              const fechaB = new Date(this.obtenerFechaVenta(b)).getTime();

              return fechaB - fechaA;
            })
            .slice(0, 4);

          this.actualizarResumen();
        },
        error: error => {
          console.error('Error al cargar ventas:', error);
          this.ventasRecientes = [];
          this.actualizarResumen();
        }
      });
  }

  cargarStockBajo(): void {
    this.http.get<InventarioBackend[]>(`${this.inventarioApi}/tienda/${this.tiendaId}`)
      .subscribe({
        next: inventario => {
          this.productosStockBajo = inventario.filter(item => {
            const piezas = Number(item.piezas || 0);
            const stockMinimo = Number(item.productoId?.stockMinimo || 5);

            return piezas > 0 && piezas <= stockMinimo;
          }).length;

          this.actualizarResumen();
        },
        error: error => {
          console.error('Error al cargar inventario:', error);
          this.productosStockBajo = 0;
          this.actualizarResumen();
        }
      });
  }

  actualizarResumen(): void {
    const ultimaVenta = this.ventasRecientes[0];

    this.resumenFinal = [
      {
        titulo: 'Estado del turno',
        valor: this.turnoActivo ? 'Activo' : 'Inactivo',
        descripcion: this.turnoActivo
          ? 'El turno actual se encuentra abierto.'
          : 'No hay un turno abierto actualmente.',
        icono: '🕐',
        estado: this.turnoActivo ? 'success' : 'danger'
      },
      {
        titulo: 'Hora de inicio',
        valor: this.horaInicio,
        descripcion: this.turnoActivo
          ? 'Hora en la que comenzó el turno actual.'
          : 'La hora aparecerá cuando se abra el turno.',
        icono: '⏱️'
      },
      {
        titulo: 'Última venta',
        valor: ultimaVenta
          ? this.formatearHora(this.obtenerFechaVenta(ultimaVenta))
          : '--:--',
        descripcion: ultimaVenta
          ? 'Hora de la venta más reciente registrada.'
          : 'Todavía no hay ventas registradas.',
        icono: '🧾',
        permiso: 'VENTAS_HISTORIAL_VER',
        ruta: '/historial-ventas',
        textoEnlace: 'Consultar historial'
      },
      {
        titulo: 'Productos con stock bajo',
        valor: this.productosStockBajo,
        descripcion: 'Productos disponibles con pocas existencias.',
        icono: '⚠️',
        permiso: 'INVENTARIO_VER',
        ruta: '/lista-inventario',
        textoEnlace: 'Revisar inventario',
        estado: this.productosStockBajo > 0 ? 'warning' : 'success'
      }
    ];
  }

  obtenerFolio(venta: VentaBackend): string {
    return `#V-${venta._id.slice(-4).toUpperCase()}`;
  }

  obtenerHoraVenta(venta: VentaBackend): string {
    return this.formatearHora(this.obtenerFechaVenta(venta));
  }

  obtenerCantidadProductos(venta: VentaBackend): number {
    return venta.productos?.reduce(
      (total, producto) => total + Number(producto.cantidad || 0),
      0
    ) || 0;
  }

  obtenerTotalVenta(venta: VentaBackend): number {
    return Number(venta.total || venta.totalVenta || 0);
  }

  obtenerEstadoVenta(venta: VentaBackend): string {
    return venta.estado || 'COMPLETADA';
  }

  private obtenerTiendaId(tienda: string | TiendaBackend): string {
    return typeof tienda === 'string'
      ? tienda
      : tienda?._id || '';
  }

  private obtenerFechaVenta(venta: VentaBackend): string {
    return venta.fechaVenta || venta.fecha || venta.createdAt || '';
  }

  private formatearHora(fecha: string): string {
    if (!fecha) {
      return '--:--';
    }

    return new Date(fecha).toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}