import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import {
  CardResumen,
  CardResumenItem
} from '../../../../shared/components/card-resumen/card-resumen';

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
  sucursal = 'Sucursal #027 - Centro';

  turnoActivo = false;

  alertas: any[] = [];
  ventas: any[] = [];
  turnosAbiertos: any[] = [];

  resumenFinal: CardResumenItem[] = [];

  ngOnInit(): void {
    const usuario = JSON.parse(
      localStorage.getItem('usuario') || '{}'
    );

    const tiendaId =
      usuario.tiendaId?._id || usuario.tiendaId;

    this.sucursal =
      usuario.tiendaId?.nombre ||
      'Sucursal #027 - Centro';

    if (!tiendaId) {
      this.cargarResumen();
      return;
    }

    this.cargarTurnos(tiendaId);
    this.cargarAlertas();
    this.cargarVentas();
  }

  get subtituloTurno(): string {
    const estado = this.turnoActivo ? 'Activo' : 'Inactivo';

    return `Turno: ${estado} · ${this.sucursal}`;
  }

  async cargarTurnos(tiendaId: string): Promise<void> {
    try {
      const res = await fetch(
        `http://localhost:3000/turnos/abiertos/${tiendaId}`
      );

      this.turnosAbiertos = await res.json();
      this.turnoActivo = this.turnosAbiertos.length > 0;

      localStorage.setItem(
        'turnoActivo',
        String(this.turnoActivo)
      );

      this.cargarResumen();
    } catch {
      this.turnoActivo = false;
      this.cargarResumen();
    }
  }

  async cargarAlertas(): Promise<void> {
    try {
      const res = await fetch('http://localhost:3000/alertas');
      const data = await res.json();

      this.alertas = data.filter(
        (alerta: any) => alerta.estado !== 'RESUELTA'
      );
    } catch {
      this.alertas = [];
    }
  }

  async cargarVentas(): Promise<void> {
    try {
      const res = await fetch('http://localhost:3000/ventas');
      this.ventas = await res.json();
    } catch {
      this.ventas = [];
    }
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
        textoEnlace: this.turnoActivo
          ? 'Cerrar turno'
          : 'Abrir turno',
        estado: this.turnoActivo ? 'success' : 'danger'
      },
      {
        titulo: 'Hora de apertura',
        valor: this.turnoActivo && this.turnosAbiertos[0]?.fechaApertura
          ? new Date(this.turnosAbiertos[0].fechaApertura)
              .toLocaleTimeString('es-MX', {
                hour: '2-digit',
                minute: '2-digit'
              })
          : '--:--',
        descripcion: this.turnoActivo
          ? 'Hora en la que comenzó el turno actual.'
          : 'La hora aparecerá cuando se abra un turno.',
        icono: '⏱️',
        permiso: 'TURNOS_VER'
      },
      {
        titulo: 'Cajeros activos',
        valor: this.turnosAbiertos.length,
        descripcion: this.turnoActivo
          ? 'Cajas o turnos activos actualmente en la sucursal.'
          : 'No hay cajeros operando porque el turno está cerrado.',
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
        descripcion: 'Ventas registradas en el sistema.',
        icono: '🧾',
        permiso: 'VENTAS_HISTORIAL_VER',
        ruta: '/historial-ventas',
        textoEnlace: 'Ver historial'
      }
    ];
  }
}