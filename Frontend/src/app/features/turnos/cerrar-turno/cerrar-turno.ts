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
  Router,
  RouterLink
} from '@angular/router';

import {
  UsuarioActualService
} from '../../../core/services/usuario-actual';

import {
  Usuario
} from '../../../core/models/usuario.model';

interface UsuarioPopulado {
  _id: string;
  nombre: string;
  usuario: string;
  rol: string;
}

interface TiendaPopulada {
  _id: string;
  nombre: string;
  ciudad?: string;
  direccion?: string;
}

interface TurnoBackend {
  _id: string;

  tiendaId:
    | string
    | TiendaPopulada;

  usuarioId:
    UsuarioPopulado;

  numeroCaja: number;
  montoInicial: number;

  montoFinal?: number;

  estado:
    | 'ABIERTO'
    | 'CERRADO';

  fechaApertura: string;
  fechaCierre?: string;
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
  tiendaId = '';
  nombreTiendaActual =
    'Tienda no asignada';

  turnoSeleccionado:
    TurnoBackend | null = null;

  montoFinal: number | null = null;
  confirmacion = false;

  usuarioActual!: Usuario;

  mensajeError = '';
  mensajeExito = '';

  cargandoTurno = false;
  enviando = false;

  private readonly turnosApi =
    'http://localhost:3000/turnos';

  constructor(
    private router: Router,

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
      this.mensajeError =
        'No se encontró una sesión activa.';

      return;
    }

    if (
      this.usuarioActual.rol !==
      'gerente'
    ) {
      this.mensajeError =
        'Solo un gerente puede cerrar turnos.';

      return;
    }

    this.tiendaId =
      this.usuarioActual.tiendaId || '';

    this.nombreTiendaActual =
      this.usuarioActual.sucursal ||
      'Tienda asignada';

    if (!this.tiendaId) {
      this.mensajeError =
        'El gerente no tiene una tienda asignada.';

      return;
    }

    this.cargarTurnoAbierto();
  }

  get dashboardRuta(): string {
    if (
      this.usuarioActual?.rol ===
      'admin'
    ) {
      return '/dashboard-admin';
    }

    if (
      this.usuarioActual?.rol ===
      'gerente'
    ) {
      return '/dashboard-gerente';
    }

    return '/dashboard-cajero';
  }

  get nombreCajero(): string {
    return (
      this.turnoSeleccionado
        ?.usuarioId
        ?.nombre ||
      'Cajero no disponible'
    );
  }

  get usuarioCajero(): string {
    return (
      this.turnoSeleccionado
        ?.usuarioId
        ?.usuario ||
      'Sin usuario'
    );
  }

  cargarTurnoAbierto(): void {
    this.limpiarMensajes();

    this.turnoSeleccionado = null;

    if (!this.tiendaId) {
      this.mensajeError =
        'El gerente no tiene una tienda asignada.';

      return;
    }

    this.cargandoTurno = true;

    this.http
      .get<TurnoBackend[]>(
        `${this.turnosApi}/abiertos/${this.tiendaId}`
      )
      .subscribe({
        next: turnos => {
          const turnosAbiertos =
            (
              Array.isArray(turnos)
                ? turnos
                : []
            )
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
              );

          /*
            Se selecciona automáticamente
            el turno abierto más reciente
            de la tienda del gerente.
          */
          this.turnoSeleccionado =
            turnosAbiertos[0] || null;

          this.cargandoTurno = false;

          if (
            !this.turnoSeleccionado
          ) {
            this.mensajeError =
              'No hay ningún turno abierto en la tienda del gerente.';
          }
        },

        error: error => {
          console.error(
            'Error al cargar el turno abierto:',
            error
          );

          this.turnoSeleccionado = null;

          this.mensajeError =
            error.error?.message ||
            'No fue posible cargar el turno abierto.';

          this.cargandoTurno = false;
        }
      });
  }

  cerrarTurno(): void {
    this.limpiarMensajes();

    if (!this.tiendaId) {
      this.mensajeError =
        'El gerente no tiene una tienda asignada.';

      return;
    }

    if (!this.turnoSeleccionado) {
      this.mensajeError =
        'No existe un turno abierto para cerrar.';

      return;
    }

    if (
      this.turnoSeleccionado.estado !==
      'ABIERTO'
    ) {
      this.mensajeError =
        'El turno seleccionado ya no se encuentra abierto.';

      return;
    }

    const tiendaTurno =
      this.obtenerTiendaId(
        this.turnoSeleccionado
          .tiendaId
      );

    if (
      tiendaTurno &&
      tiendaTurno !==
        this.tiendaId
    ) {
      this.mensajeError =
        'El turno abierto no pertenece a la tienda del gerente.';

      return;
    }

    if (
      this.montoFinal === null ||
      this.montoFinal === undefined
    ) {
      this.mensajeError =
        'Ingresa el efectivo final de caja.';

      return;
    }

    if (
      Number(this.montoFinal) < 0
    ) {
      this.mensajeError =
        'El efectivo final no puede ser negativo.';

      return;
    }

    if (!this.confirmacion) {
      this.mensajeError =
        'Debes confirmar que revisaste el efectivo y la información del turno.';

      return;
    }

    this.enviando = true;

    const cierreTurno = {
      montoFinal:
        Number(this.montoFinal)
    };

    this.http
      .put(
        `${this.turnosApi}/cerrar/${this.turnoSeleccionado._id}`,
        cierreTurno
      )
      .subscribe({
        next: () => {
          this.mensajeExito =
            'El turno se cerró correctamente.';

          setTimeout(() => {
            this.router.navigate([
              this.dashboardRuta
            ]);
          }, 900);
        },

        error: error => {
          console.error(
            'Error al cerrar turno:',
            error
          );

          this.mensajeError =
            error.error?.message ||
            'No fue posible cerrar el turno.';

          this.enviando = false;
        },

        complete: () => {
          this.enviando = false;
        }
      });
  }

  private obtenerTiendaId(
    tienda:
      | string
      | TiendaPopulada
      | null
      | undefined
  ): string {
    if (
      typeof tienda === 'string'
    ) {
      return tienda;
    }

    return tienda?._id || '';
  }

  private limpiarMensajes(): void {
    this.mensajeError = '';
    this.mensajeExito = '';
  }
}