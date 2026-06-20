import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { TurnoActual, TurnoService } from '../../../core/services/turno';
import { Sidebar } from '../../../shared/components/sidebar/sidebar';
import { Topbar } from '../../../shared/components/topbar/topbar';

@Component({
  selector: 'app-cerrar-turno',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    Sidebar,
    Topbar
  ],
  templateUrl: './cerrar-turno.html',
  styleUrl: './cerrar-turno.css'
})
export class CerrarTurno {
  montoFinal: number | null = null;
  confirmacion = false;
  mensajeError = '';
  enviando = false;

  turnoActual: TurnoActual;

  constructor(
    private turnoService: TurnoService,
    private router: Router
  ) {
    this.turnoActual = this.turnoService.obtenerTurno();
  }

  get rolActual(): string {
    return localStorage.getItem('rol') || 'cajero';
  }

  get dashboardRuta(): string {
    if (this.rolActual === 'admin') {
      return '/dashboard-admin';
    }

    if (this.rolActual === 'gerente') {
      return '/dashboard-gerente';
    }

    return '/dashboard-cajero';
  }

  get subtitulo(): string {
    const estado = this.turnoActual.activo
      ? 'Turno activo'
      : 'Turno inactivo';

    return `${estado} · ${this.turnoActual.sucursal}`;
  }

  cerrarTurno(): void {
    this.mensajeError = '';

    if (!this.turnoActual.activo) {
      this.mensajeError = 'No existe un turno activo para cerrar.';
      return;
    }

    if (
      this.montoFinal === null ||
      this.montoFinal === undefined
    ) {
      this.mensajeError = 'Ingresa el efectivo final de caja.';
      return;
    }

    if (this.montoFinal < 0) {
      this.mensajeError =
        'El efectivo final no puede ser negativo.';
      return;
    }

    if (!this.confirmacion) {
      this.mensajeError =
        'Debes confirmar que revisaste la información del cierre.';
      return;
    }

    try {
      this.enviando = true;

      this.turnoActual = this.turnoService.cerrarTurno(
        this.montoFinal
      );

      this.router.navigate([this.dashboardRuta]);
    } catch (error) {
      this.mensajeError =
        error instanceof Error
          ? error.message
          : 'No fue posible cerrar el turno.';
    } finally {
      this.enviando = false;
    }
  }
}