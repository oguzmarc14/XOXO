import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Sidebar } from '../../../../shared/components/sidebar/sidebar';
import { Topbar } from '../../../../shared/components/topbar/topbar';
import {
  CardResumen,
  CardResumenItem
} from '../../../../shared/components/card-resumen/card-resumen';

@Component({
  selector: 'app-dashboard-cajero',
  standalone: true,
  imports: [
    RouterLink,
    CardResumen
  ],
  templateUrl: './dashboard-cajero.html',
  styleUrl: './dashboard-cajero.css'
})
export class DashboardCajero {
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
        ? 'El turno actual se encuentra abierto.'
        : 'No hay un turno abierto actualmente.',
      icono: '🕐',
      estado: this.turnoActivo ? 'success' : 'danger'
    },
    {
      titulo: 'Hora de inicio',
      valor: this.turnoActivo ? '08:00' : '--:--',
      descripcion: this.turnoActivo
        ? 'Hora en la que comenzó el turno actual.'
        : 'La hora aparecerá cuando se abra el turno.',
      icono: '⏱️'
    },
    {
      titulo: 'Última venta',
      valor: '14:35',
      descripcion: 'Hora de la venta más reciente registrada.',
      icono: '🧾',
      permiso: 'VENTAS_HISTORIAL_VER',
      ruta: '/historial-ventas',
      textoEnlace: 'Consultar historial'
    },
    {
      titulo: 'Productos con stock bajo',
      valor: 6,
      descripcion: 'Productos disponibles con pocas existencias.',
      icono: '⚠️',
      permiso: 'INVENTARIO_VER',
      ruta: '/lista-inventario',
      textoEnlace: 'Revisar inventario',
      estado: 'warning'
    }
  ];
}