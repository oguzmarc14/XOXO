import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Sidebar } from '../../../../shared/components/sidebar/sidebar';
import { Topbar } from '../../../../shared/components/topbar/topbar';

import {
  CardResumen,
  CardResumenItem
} from '../../../../shared/components/card-resumen/card-resumen';

@Component({
  selector: 'app-dashboard-gerente',
  standalone: true,
  imports: [
    RouterLink,
    Sidebar,
    Topbar,
    CardResumen
  ],
  templateUrl: './dashboard-gerente.html',
  styleUrl: './dashboard-gerente.css'
})
export class DashboardGerente {
  sucursal: string =
    localStorage.getItem('sucursal') || 'Sucursal #027 - Centro';

  turnoActivo: boolean =
    localStorage.getItem('turnoActivo') === 'true';

  get subtituloTurno(): string {
    const estado = this.turnoActivo ? 'Activo' : 'Inactivo';

    return `Turno: ${estado} · ${this.sucursal}`;
  }

  resumenFinal: CardResumenItem[] = [
    {
      titulo: 'Estado del turno',
      valor: this.turnoActivo ? 'Activo' : 'Inactivo',
      descripcion: this.turnoActivo
        ? 'La sucursal se encuentra operando actualmente.'
        : 'No existe un turno abierto en este momento.',
      icono: '🕐',
      permiso: 'TURNOS_VER',
      ruta: this.turnoActivo ? '/cerrar-turno' : '/abrir-turno',
      textoEnlace: this.turnoActivo
        ? 'Cerrar turno'
        : 'Abrir turno',
      estado: this.turnoActivo ? 'success' : 'danger'
    },
    {
      titulo: 'Hora de apertura',
      valor: this.turnoActivo ? '08:00' : '--:--',
      descripcion: this.turnoActivo
        ? 'Hora en la que comenzó el turno actual.'
        : 'La hora aparecerá cuando se abra un turno.',
      icono: '⏱️',
      permiso: 'TURNOS_VER'
    },
    {
      titulo: 'Cajeros activos',
      valor: this.turnoActivo ? 4 : 0,
      descripcion: this.turnoActivo
        ? 'Cajeros que se encuentran operando en la sucursal.'
        : 'No hay cajeros operando porque el turno está cerrado.',
      icono: '👥',
      permiso: 'VENTAS_HISTORIAL_VER'
    },
    {
      titulo: 'Stock bajo',
      valor: 7,
      descripcion: 'Productos que requieren revisión de existencias.',
      icono: '⚠️',
      permiso: 'INVENTARIO_MOVIMIENTOS_VER',
      ruta: '/lista-inventario',
      textoEnlace: 'Revisar inventario',
      estado: 'warning'
    },
    {
      titulo: 'Movimientos pendientes',
      valor: 3,
      descripcion: 'Movimientos de inventario pendientes de validación.',
      icono: '🔄',
      permiso: 'INVENTARIO_MOVIMIENTOS_VER',
      ruta: '/movimientos-inventario',
      textoEnlace: 'Consultar movimientos'
    }
  ];
}