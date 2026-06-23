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
    precioUnitario: number;
    subtotal: number;
    stockAnterior: number;
    stockNuevo: number;
  }[];
  total: number;
  fecha: string;
}

interface AlertaBackend {
  _id: string;
  tiendaId: TiendaBackend | string | null;
  productoId: ProductoBackend | null;
  ventaId?: string;
  tipo: string;
  mensaje: string;
  stockAnterior: number;
  cantidadVendida: number;
  stockNuevo: number;
  estado: 'PENDIENTE' | 'RESUELTA';
  fechaResolucion?: string;
  fecha: string;
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
  turnosAbiertos: any[] = [];

  resumenFinal: CardResumenItem[] = [];

  private readonly turnosApi = 'http://localhost:3000/turnos';
  private readonly alertasApi = 'http://localhost:3000/alertas';
  private readonly ventasApi = 'http://localhost:3000/ventas';

  constructor(
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const usuario = JSON.parse(
      localStorage.getItem('usuario') || '{}'
    );

    this.tiendaId =
      usuario.tiendaId?._id ||
      usuario.tiendaId ||
      '';

    this.sucursal =
      usuario.tiendaId?.ciudad
        ? `${usuario.tiendaId.nombre} - ${usuario.tiendaId.ciudad}`
        : usuario.tiendaId?.nombre || 'Tienda no asignada';

    if (!this.tiendaId) {
      this.cargarResumen();
      return;
    }

    this.cargarTurnos();
    this.cargarAlertas();
    this.cargarVentas();
  }

  get subtituloTurno(): string {
    const estado = this.turnoActivo ? 'Activo' : 'Inactivo';
    return `Turno: ${estado} · ${this.sucursal}`;
  }

  cargarTurnos(): void {
    this.http.get<any[]>(`${this.turnosApi}/abiertos/${this.tiendaId}`)
      .subscribe({
        next: turnos => {
          this.turnosAbiertos = turnos;
          this.turnoActivo = turnos.length > 0;

          localStorage.setItem(
            'turnoActivo',
            String(this.turnoActivo)
          );

          this.cargarResumen();
        },
        error: () => {
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
          this.alertas = alertas
            .filter(alerta => {
              const alertaTiendaId = this.obtenerTiendaId(alerta.tiendaId);

              return (
                alerta.estado !== 'RESUELTA' &&
                alertaTiendaId === this.tiendaId
              );
            })
            .sort((a, b) => {
              return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
            })
            .slice(0, 3);

          this.cargarResumen();
        },
        error: () => {
          this.alertas = [];
          this.cargarResumen();
        }
      });
  }

  cargarVentas(): void {
    this.http.get<VentaBackend[]>(this.ventasApi)
      .subscribe({
        next: ventas => {
          this.ventas = ventas
            .filter(venta => {
              const ventaTiendaId = this.obtenerTiendaId(venta.tiendaId);

              return ventaTiendaId === this.tiendaId;
            })
            .sort((a, b) => {
              return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
            })
            .slice(0, 4);

          this.cargarResumen();
        },
        error: () => {
          this.ventas = [];
          this.cargarResumen();
        }
      });
  }

  obtenerFolioVenta(venta: VentaBackend): string {
    return `#${venta._id.slice(-6).toUpperCase()}`;
  }

  obtenerHoraVenta(fecha: string): string {
    return new Date(fecha).toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  obtenerProductosVenta(venta: VentaBackend): number {
    return venta.productos.reduce(
      (total, producto) => total + producto.cantidad,
      0
    );
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
          ? 'La sucursal se encuentra operando actualmente.'
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

  private obtenerTiendaId(
    tienda: TiendaBackend | string | null
  ): string {
    if (!tienda) {
      return '';
    }

    if (typeof tienda === 'string') {
      return tienda;
    }

    return tienda._id || '';
  }
}