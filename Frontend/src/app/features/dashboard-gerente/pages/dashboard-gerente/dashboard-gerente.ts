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

interface ProductoBackend {
  _id: string;
  nombre: string;
  precio: number;
  categoria: string;
}

interface VentaBackend {
  _id: string;
  tiendaId: TiendaBackend | string | null;
  productos: {
    productoId: ProductoBackend;
    cantidad: number;
  }[];
  total?: number;
  totalVenta?: number;
  fecha?: string;
  fechaVenta?: string;
  createdAt?: string;
  estado?: string;
}

interface AlertaBackend {
  _id: string;
  tiendaId: TiendaBackend | string | null;
  productoId: ProductoBackend | null;
  mensaje: string;
  stockAnterior: number;
  cantidadVendida: number;
  stockNuevo: number;
  estado: 'PENDIENTE' | 'RESUELTA';
  fecha?: string;
  createdAt?: string;
}

interface TurnoBackend {
  _id: string;
  tiendaId: TiendaBackend | string;
  usuarioId: any;
  numeroCaja: number;
  estado: 'ABIERTO' | 'CERRADO';
  fechaApertura: string;
}

@Component({
  selector: 'app-dashboard-gerente',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    CardResumen
  ],
  templateUrl: './dashboard-gerente.html',
  styleUrl: './dashboard-gerente.css'
})
export class DashboardGerente implements OnInit {
  sucursal = 'Tienda no asignada';
  tiendaId = '';

  turnoActivo = false;

  alertas: AlertaBackend[] = [];
  ventas: VentaBackend[] = [];
  turnosAbiertos: TurnoBackend[] = [];

  resumenFinal: CardResumenItem[] = [];

  private readonly turnosApi = 'https://xoxo-backend-ewqr.onrender.com/turnos';
  private readonly alertasApi = 'https://xoxo-backend-ewqr.onrender.com/alertas';
  private readonly ventasApi = 'https://xoxo-backend-ewqr.onrender.com/ventas';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.cargarTurnosGlobales();
  }

  get subtituloTurno(): string {
    const estado = this.turnoActivo ? 'Activo' : 'Inactivo';
    return `Turno: ${estado} · ${this.sucursal}`;
  }

  cargarTurnosGlobales(): void {
    this.http.get<TurnoBackend[]>(`${this.turnosApi}/abiertos`)
      .subscribe({
        next: turnos => {
          this.turnosAbiertos = turnos || [];

          if (this.turnosAbiertos.length === 0) {
            this.turnoActivo = false;
            this.cargarResumen();
            return;
          }

          const turno = this.turnosAbiertos[0];

          this.turnoActivo = true;
          this.tiendaId = this.obtenerTiendaId(turno.tiendaId);
          this.sucursal = this.obtenerNombreTienda(turno.tiendaId);

          this.turnosAbiertos = this.turnosAbiertos.filter(
            item => this.obtenerTiendaId(item.tiendaId) === this.tiendaId
          );

          this.cargarAlertas();
          this.cargarVentas();
          this.cargarResumen();
        },
        error: error => {
          console.error('Error al cargar turnos:', error);
          this.turnosAbiertos = [];
          this.turnoActivo = false;
          this.cargarResumen();
        }
      });
  }

  cargarAlertas(): void {
    this.http.get<AlertaBackend[]>(this.alertasApi)
      .subscribe({
        next: alertas => {
          this.alertas = (alertas || [])
            .filter(alerta =>
              alerta.estado !== 'RESUELTA' &&
              this.obtenerTiendaId(alerta.tiendaId) === this.tiendaId
            )
            .sort((a, b) =>
              new Date(this.obtenerFecha(a)).getTime() -
              new Date(this.obtenerFecha(b)).getTime()
            )
            .reverse()
            .slice(0, 3);

          this.cargarResumen();
        },
        error: error => {
          console.error('Error al cargar alertas:', error);
          this.alertas = [];
          this.cargarResumen();
        }
      });
  }

  cargarVentas(): void {
    this.http.get<VentaBackend[]>(this.ventasApi)
      .subscribe({
        next: ventas => {
          this.ventas = (ventas || [])
            .filter(venta =>
              this.obtenerTiendaId(venta.tiendaId) === this.tiendaId
            )
            .sort((a, b) =>
              new Date(this.obtenerFechaVenta(a)).getTime() -
              new Date(this.obtenerFechaVenta(b)).getTime()
            )
            .reverse()
            .slice(0, 4);

          this.cargarResumen();
        },
        error: error => {
          console.error('Error al cargar ventas:', error);
          this.ventas = [];
          this.cargarResumen();
        }
      });
  }

  obtenerFolioVenta(venta: VentaBackend): string {
    return `#${venta._id.slice(-6).toUpperCase()}`;
  }

  obtenerHoraVenta(fecha: string): string {
    if (!fecha) {
      return '--:--';
    }

    return new Date(fecha).toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  obtenerProductosVenta(venta: VentaBackend): number {
    return venta.productos?.reduce(
      (total, producto) => total + Number(producto.cantidad || 0),
      0
    ) || 0;
  }

  obtenerNombreProductoAlerta(alerta: AlertaBackend): string {
    return alerta.productoId?.nombre || 'Producto no disponible';
  }

  cargarResumen(): void {
    this.resumenFinal = [
      {
        titulo: 'Estado del turno',
        valor: this.turnoActivo ? 'Activo' : 'Inactivo',
        descripcion: this.turnoActivo
          ? `La sucursal ${this.sucursal} se encuentra operando actualmente.`
          : 'No existe un turno abierto en este momento.',
        icono: '🕐',
        permiso: 'TURNOS_VER',
        ruta: this.turnoActivo ? '/cerrar-turno' : '/abrir-turno',
        textoEnlace: this.turnoActivo ? 'Cerrar turno' : 'Abrir turno',
        estado: this.turnoActivo ? 'success' : 'danger'
      },
      {
        titulo: 'Cajeros activos',
        valor: this.turnosAbiertos.length,
        descripcion: 'Cajas o turnos activos actualmente.',
        icono: '👥',
        permiso: 'VENTAS_HISTORIAL_VER'
      },
      {
        titulo: 'Alertas pendientes',
        valor: this.alertas.length,
        descripcion: 'Alertas de inventario que requieren revisión.',
        icono: '⚠️',
        permiso: 'INVENTARIO_MOVIMIENTOS_VER',
        ruta: '/lista-inventario',
        textoEnlace: 'Revisar alertas',
        estado: this.alertas.length > 0 ? 'warning' : 'success'
      },
      {
        titulo: 'Ventas recientes',
        valor: this.ventas.length,
        descripcion: 'Ventas registradas en esta tienda.',
        icono: '🧾',
        permiso: 'VENTAS_HISTORIAL_VER',
        ruta: '/historial-ventas',
        textoEnlace: 'Ver historial'
      }
    ];
  }

  private obtenerTiendaId(tienda: TiendaBackend | string | null): string {
    if (!tienda) {
      return '';
    }

    return typeof tienda === 'string'
      ? tienda
      : tienda._id || '';
  }

  private obtenerNombreTienda(tienda: TiendaBackend | string | null): string {
    if (!tienda || typeof tienda === 'string') {
      return 'Tienda asignada';
    }

    return tienda.ciudad
      ? `${tienda.nombre} - ${tienda.ciudad}`
      : tienda.nombre;
  }

  private obtenerFecha(alerta: AlertaBackend): string {
    return alerta.fecha || alerta.createdAt || '';
  }

  private obtenerFechaVenta(venta: VentaBackend): string {
    return venta.fechaVenta || venta.fecha || venta.createdAt || '';
  }
}