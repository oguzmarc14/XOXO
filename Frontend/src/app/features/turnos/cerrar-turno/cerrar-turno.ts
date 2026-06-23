import { CommonModule } from '@angular/common';

import {
  Component,
  OnInit
} from '@angular/core';

import {
  FormsModule
} from '@angular/forms';

import {
  HttpClient
} from '@angular/common/http';

import {
  RouterLink
} from '@angular/router';

import {
  UsuarioActualService
} from '../../../core/services/usuario-actual';

import {
  Usuario
} from '../../../core/models/usuario.model';

interface TiendaPopulada {
  _id: string;
  nombre: string;
  ciudad?: string;
  direccion?: string;
}

interface UsuarioPopulado {
  _id: string;
  nombre: string;
  usuario?: string;
  rol?: string;
}

interface TurnoBackend {
  _id: string;

  tiendaId:
    | string
    | TiendaPopulada;

  usuarioId:
    | string
    | UsuarioPopulado;

  numeroCaja: number;
  montoInicial: number;
  montoFinal?: number;

  estado:
    | 'ABIERTO'
    | 'CERRADO';

  fechaApertura: string;
  fechaCierre?: string;
}

interface TurnoVista extends TurnoBackend {
  montoFinalCapturado: number | null;
  confirmacion: boolean;
  cerrando: boolean;
  mensajeError: string;
}

@Component({
  selector: 'app-cerrar-turno',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './cerrar-turno.html',
  styleUrl: './cerrar-turno.css'
})
export class CerrarTurno implements OnInit {
  usuarioActual!: Usuario;

  tiendaId = '';

  nombreTiendaActual =
    'Tienda no asignada';

  turnosAbiertos: TurnoVista[] = [];

  cargandoTurnos = false;

  mensajeErrorGeneral = '';
  mensajeExito = '';

  private readonly turnosApi =
    'https://xoxo-backend-ewqr.onrender.com/turnos';

  constructor(
    private http: HttpClient,

    private usuarioActualService:
      UsuarioActualService
  ) {}

  ngOnInit(): void {
    this.usuarioActual =
      this.usuarioActualService
        .obtenerUsuario();

    if (
      !this.usuarioActual ||
      this.usuarioActual.id === 0
    ) {
      this.mensajeErrorGeneral =
        'No se encontró una sesión activa.';

      return;
    }

    if (
      this.usuarioActual.rol !==
      'gerente'
    ) {
      this.mensajeErrorGeneral =
        'Solo un gerente puede cerrar turnos.';

      return;
    }

    this.tiendaId =
      this.usuarioActual.tiendaId || '';

    this.nombreTiendaActual =
      this.usuarioActual.sucursal ||
      'Tienda asignada';

    if (!this.tiendaId) {
      this.mensajeErrorGeneral =
        'El gerente no tiene una tienda asignada.';

      return;
    }

    this.cargarTurnosAbiertos();
  }

  get dashboardRuta(): string {
    return '/dashboard-gerente';
  }

  get totalTurnosAbiertos(): number {
    return this.turnosAbiertos.length;
  }

  cargarTurnosAbiertos(): void {
    this.cargandoTurnos = true;
    this.mensajeErrorGeneral = '';

    this.http
      .get<TurnoBackend[]>(
        `${this.turnosApi}/abiertos/${this.tiendaId}`
      )
      .subscribe({
        next: respuesta => {
          const turnos =
            Array.isArray(respuesta)
              ? respuesta
              : [];

          this.turnosAbiertos =
            turnos
              .filter(
                turno =>
                  turno.estado ===
                  'ABIERTO'
              )
              .sort(
                (
                  turnoA,
                  turnoB
                ) =>
                  new Date(
                    turnoB.fechaApertura
                  ).getTime() -
                  new Date(
                    turnoA.fechaApertura
                  ).getTime()
              )
              .map(
                turno => ({
                  ...turno,

                  montoFinalCapturado:
                    null,

                  confirmacion:
                    false,

                  cerrando:
                    false,

                  mensajeError:
                    ''
                })
              );

          this.cargandoTurnos = false;
        },

        error: error => {
          console.error(
            'Error al cargar turnos abiertos:',
            error
          );

          this.turnosAbiertos = [];

          this.mensajeErrorGeneral =
            error.error?.message ||
            'No fue posible consultar los turnos abiertos.';

          this.cargandoTurnos = false;
        }
      });
  }

  cerrarTurno(
    turno: TurnoVista
  ): void {
    turno.mensajeError = '';
    this.mensajeExito = '';
    this.mensajeErrorGeneral = '';

    if (
      this.usuarioActual?.rol !==
      'gerente'
    ) {
      turno.mensajeError =
        'Solo un gerente puede cerrar turnos.';

      return;
    }

    if (
      turno.estado !==
      'ABIERTO'
    ) {
      turno.mensajeError =
        'Este turno ya no se encuentra abierto.';

      return;
    }

    const tiendaTurno =
      this.obtenerTiendaId(
        turno.tiendaId
      );

    if (
      tiendaTurno &&
      tiendaTurno !==
        this.tiendaId
    ) {
      turno.mensajeError =
        'Este turno no pertenece a la tienda del gerente.';

      return;
    }

    if (
      turno.montoFinalCapturado ===
        null ||
      turno.montoFinalCapturado ===
        undefined
    ) {
      turno.mensajeError =
        'Ingresa el efectivo final de la caja.';

      return;
    }

    const montoFinal =
      Number(
        turno.montoFinalCapturado
      );

    if (
      Number.isNaN(montoFinal) ||
      montoFinal < 0
    ) {
      turno.mensajeError =
        'El efectivo final no puede ser negativo.';

      return;
    }

    if (!turno.confirmacion) {
      turno.mensajeError =
        'Confirma que revisaste el efectivo antes de cerrar el turno.';

      return;
    }

    turno.cerrando = true;

    this.http
      .put<{
        message?: string;
        turno?: TurnoBackend;
      }>(
        `${this.turnosApi}/cerrar/${turno._id}`,
        {
          montoFinal
        }
      )
      .subscribe({
        next: respuesta => {
          this.mensajeExito =
            respuesta.message ||
            `El turno de la caja ${turno.numeroCaja} se cerró correctamente.`;

          /*
            Se elimina de la pantalla únicamente
            el turno que acaba de cerrarse.
          */
          this.turnosAbiertos =
            this.turnosAbiertos.filter(
              turnoActual =>
                turnoActual._id !==
                turno._id
            );
        },

        error: error => {
          console.error(
            'Error al cerrar turno:',
            error
          );

          turno.mensajeError =
            error.error?.message ||
            'No fue posible cerrar el turno.';

          turno.cerrando = false;
        },

        complete: () => {
          turno.cerrando = false;
        }
      });
  }

  obtenerNombreCajero(
    turno: TurnoVista
  ): string {
    if (
      turno.usuarioId &&
      typeof turno.usuarioId ===
      'object'
    ) {
      return (
        turno.usuarioId.nombre ||
        'Cajero sin nombre'
      );
    }

    return 'Cajero no disponible';
  }

  obtenerUsuarioCajero(
    turno: TurnoVista
  ): string {
    if (
      turno.usuarioId &&
      typeof turno.usuarioId ===
      'object'
    ) {
      return (
        turno.usuarioId.usuario ||
        ''
      );
    }

    return '';
  }

  private obtenerTiendaId(
    tienda:
      | string
      | TiendaPopulada
      | null
      | undefined
  ): string {
    if (
      typeof tienda ===
      'string'
    ) {
      return tienda;
    }

    return tienda?._id || '';
  }
}