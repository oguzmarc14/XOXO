import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { Sidebar } from '../../../shared/components/sidebar/sidebar';
import { Topbar } from '../../../shared/components/topbar/topbar';
import {
  TurnoActual,
  TurnoService
} from '../../../core/services/turno';

@Component({
  selector: 'app-abrir-turno',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
  ],
  templateUrl: './abrir-turno.html',
  styleUrl: './abrir-turno.css'
})
export class AbrirTurno {
  montoInicial: number | null = null;
  mensajeError = '';
  turnoActual: TurnoActual;
  enviando = false;
  fechaActual = new Date();

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
    return this.turnoActual.activo
      ? `Turno activo · ${this.turnoActual.sucursal}`
      : `Turno inactivo · ${this.turnoActual.sucursal}`;
  }

  abrirTurno(): void {
    this.mensajeError = '';

    if (
      this.montoInicial === null ||
      this.montoInicial === undefined
    ) {
      this.mensajeError = 'Ingresa el monto inicial de caja.';
      return;
    }

    if (this.montoInicial < 0) {
      this.mensajeError =
        'El monto inicial no puede ser negativo.';
      return;
    }

    try {
      this.enviando = true;

      this.turnoActual =
        this.turnoService.abrirTurno(this.montoInicial);

      this.router.navigate([this.dashboardRuta]);
    } catch (error) {
      this.mensajeError =
        error instanceof Error
          ? error.message
          : 'No fue posible abrir el turno.';
    } finally {
      this.enviando = false;
    }
  }
}