import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Sidebar } from '../../../../shared/components/sidebar/sidebar';
import { Topbar } from '../../../../shared/components/topbar/topbar';

import {
  CardResumen,
  CardResumenItem
} from '../../../../shared/components/card-resumen/card-resumen';

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [
    RouterLink,
    CardResumen
  ],
  templateUrl: './dashboard-admin.html',
  styleUrl: './dashboard-admin.css'
})
export class DashboardAdmin {
  sistemaActivo: boolean = true;

  get subtituloSistema(): string {
    const estado = this.sistemaActivo ? 'Operativo' : 'Con incidencias';

    return `Estado general: ${estado} · Administración global`;
  }

  resumenFinal: CardResumenItem[] = [
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
      titulo: 'Turnos sin cerrar',
      valor: 3,
      descripcion: 'Turnos que requieren revisión administrativa.',
      icono: '🕐',
      permiso: 'TURNOS_VER',
      ruta: '/cerrar-turno',
      textoEnlace: 'Revisar turnos',
      estado: 'danger'
    },
    {
      titulo: 'Stock crítico',
      valor: 12,
      descripcion: 'Productos con existencias bajas en distintas sucursales.',
      icono: '⚠️',
      permiso: 'INVENTARIO_MOVIMIENTOS_VER',
      ruta: '/lista-inventario',
      textoEnlace: 'Revisar inventario',
      estado: 'warning'
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