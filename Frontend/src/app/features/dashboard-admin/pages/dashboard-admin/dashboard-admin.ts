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

interface AlertaBackend {
  _id: string;
  tiendaId: TiendaBackend | string;
  productoId: ProductoBackend;
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
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    CardResumen
  ],
  templateUrl: './dashboard-admin.html',
  styleUrl: './dashboard-admin.css'
})
export class DashboardAdmin implements OnInit {
  sistemaActivo = true;

  alertas: AlertaBackend[] = [];
  resumenFinal: CardResumenItem[] = [];

  private readonly alertasApi = 'http://localhost:3000/alertas';

  constructor(
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.cargarAlertas();
  }

  get subtituloSistema(): string {
    const estado = this.sistemaActivo ? 'Operativo' : 'Con incidencias';
    return `Estado general: ${estado} · Administración global`;
  }

  cargarAlertas(): void {
    this.http.get<AlertaBackend[]>(this.alertasApi)
      .subscribe({
        next: alertas => {
          this.alertas = alertas
            .filter(alerta => alerta.estado !== 'RESUELTA')
            .slice(0, 5);

          this.cargarResumen();
        },
        error: () => {
          this.alertas = [];
          this.cargarResumen();
        }
      });
  }

  esTiendaObjeto(
    tienda: TiendaBackend | string
  ): tienda is TiendaBackend {
    return typeof tienda !== 'string';
  }

  cargarResumen(): void {
    this.resumenFinal = [
      {
        titulo: 'Sucursales activas',
        valor: 200,
        descripcion: 'Sucursales registradas y disponibles en el sistema.',
        icono: '🏪',
        permiso: 'TIENDAS_VER',
        ruta: '/lista-tiendas',
        textoEnlace: 'Gestionar sucursales',
        estado: 'featured'
      },
      {
        titulo: 'Usuarios activos',
        valor: 864,
        descripcion: 'Administradores, gerentes y cajeros registrados.',
        icono: '👥',
        permiso: 'USUARIOS_VER',
        ruta: '/lista-usuarios',
        textoEnlace: 'Gestionar usuarios'
      },
      {
        titulo: 'Productos registrados',
        valor: '4,382',
        descripcion: 'Productos disponibles en el catálogo general.',
        icono: '🏷️',
        permiso: 'PRODUCTOS_VER',
        ruta: '/lista-productos',
        textoEnlace: 'Gestionar productos'
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
        titulo: 'Estado del sistema',
        valor: this.sistemaActivo ? 'Operativo' : 'Incidencia',
        descripcion: this.sistemaActivo
          ? 'Los servicios principales se encuentran disponibles.'
          : 'Existen servicios que requieren revisión.',
        icono: '🖥️',
        permiso: 'REPORTES_VER',
        ruta: '/reportes',
        textoEnlace: 'Consultar reportes',
        estado: this.sistemaActivo ? 'success' : 'danger'
      }
    ];
  }
}