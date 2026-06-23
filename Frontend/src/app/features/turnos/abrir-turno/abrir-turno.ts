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

interface TiendaBackend {
  _id: string;
  nombre: string;
  ciudad?: string;
  direccion?: string;
  telefono?: string;
}

interface UsuarioBackend {
  _id: string;
  nombre: string;
  usuario: string;

  rol:
    | 'ADMIN'
    | 'GERENTE'
    | 'CAJERO'
    | 'admin'
    | 'gerente'
    | 'cajero';

  tiendaId?:
    | string
    | TiendaBackend
    | null;

  activo?: boolean;
}

interface UsuarioTurno {
  _id: string;
  nombre: string;
  usuario?: string;
  rol?: string;
}

interface TurnoAbierto {
  _id: string;

  tiendaId:
    | string
    | TiendaBackend;

  usuarioId:
    | string
    | UsuarioTurno;

  numeroCaja: number;
  montoInicial: number;

  estado:
    | 'ABIERTO'
    | 'CERRADO';

  fechaApertura: string;
}

@Component({
  selector: 'app-abrir-turno',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './abrir-turno.html',
  styleUrl: './abrir-turno.css'
})
export class AbrirTurno implements OnInit {
  usuarioId = '';
  tiendaId = '';

  numeroCaja: number | null = null;
  montoInicial: number | null = null;

  /*
    Todos los cajeros activos de la tienda.
  */
  cajerosTienda: UsuarioBackend[] = [];

  /*
    Solo los cajeros que todavía no tienen
    un turno abierto.
  */
  usuarios: UsuarioBackend[] = [];

  /*
    Turnos que permanecen abiertos
    en la tienda del gerente.
  */
  turnosAbiertos: TurnoAbierto[] = [];

  usuarioActual!: Usuario;

  nombreTiendaActual =
    'Tienda no asignada';

  mensajeError = '';
  mensajeExito = '';

  cargandoUsuarios = false;
  cargandoTurnos = false;
  enviando = false;

  fechaActual = new Date();

  private readonly usuariosApi =
    'https://xoxo-backend-ewqr.onrender.com/usuarios';

  private readonly turnosApi =
    'https://xoxo-backend-ewqr.onrender.com/turnos';

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

    /*
      Esta pantalla es exclusiva
      para el gerente.
    */
    if (
      this.usuarioActual.rol !==
      'gerente'
    ) {
      this.mensajeError =
        'Solo un gerente puede abrir turnos.';

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

    /*
      Primero se obtienen los turnos abiertos.
      Después se cargan y filtran los cajeros.
    */
    this.cargarTurnosAbiertos();
  }

  get dashboardRuta(): string {
    return '/dashboard-gerente';
  }

  get hayCajerosDisponibles(): boolean {
    return this.usuarios.length > 0;
  }

  get totalTurnosAbiertos(): number {
    return this.turnosAbiertos.length;
  }

  get cajasOcupadas(): number[] {
    return this.turnosAbiertos
      .map(
        turno =>
          Number(turno.numeroCaja)
      )
      .filter(
        numeroCaja =>
          Number.isFinite(numeroCaja)
      );
  }

  cargarTurnosAbiertos(): void {
    this.cargandoTurnos = true;
    this.mensajeError = '';

    this.http
      .get<TurnoAbierto[]>(
        `${this.turnosApi}/abiertos/${this.tiendaId}`
      )
      .subscribe({
        next: respuesta => {
          this.turnosAbiertos =
            (
              Array.isArray(respuesta)
                ? respuesta
                : []
            ).filter(
              turno =>
                turno.estado ===
                'ABIERTO'
            );

          this.cargandoTurnos = false;

          this.cargarCajeros();
        },

        error: error => {
          console.error(
            'Error al cargar turnos abiertos:',
            error
          );

          this.turnosAbiertos = [];
          this.cargandoTurnos = false;

          this.mensajeError =
            error.error?.message ||
            'No fue posible consultar los turnos abiertos.';

          /*
            Aun si falla la consulta de turnos,
            se intenta cargar la lista de cajeros.
          */
          this.cargarCajeros();
        }
      });
  }

  cargarCajeros(): void {
    this.cargandoUsuarios = true;

    this.http
      .get<UsuarioBackend[]>(
        this.usuariosApi
      )
      .subscribe({
        next: respuesta => {
          const usuariosBackend =
            Array.isArray(respuesta)
              ? respuesta
              : [];

          /*
            Solo cajeros activos de la misma tienda.
          */
          this.cajerosTienda =
            usuariosBackend.filter(
              usuario => {
                const rol =
                  String(usuario.rol)
                    .toLowerCase();

                const tiendaUsuario =
                  this.obtenerTiendaId(
                    usuario.tiendaId
                  );

                const activo =
                  usuario.activo !== false;

                return (
                  rol === 'cajero' &&
                  activo &&
                  tiendaUsuario ===
                    this.tiendaId
                );
              }
            );

          /*
            Elimina del selector los cajeros
            que ya tienen un turno abierto.
          */
          this.usuarios =
            this.cajerosTienda.filter(
              cajero =>
                !this.turnosAbiertos
                  .some(
                    turno =>
                      this.obtenerUsuarioIdTurno(
                        turno.usuarioId
                      ) === cajero._id
                  )
            );

          /*
            Si el cajero seleccionado dejó de estar
            disponible, se limpia el selector.
          */
          const seleccionadoDisponible =
            this.usuarios.some(
              cajero =>
                cajero._id ===
                this.usuarioId
            );

          if (!seleccionadoDisponible) {
            this.usuarioId = '';
          }

          this.cargandoUsuarios =
            false;

          if (
            this.cajerosTienda.length === 0
          ) {
            this.mensajeError =
              'No hay cajeros activos asignados a esta tienda.';
          } else if (
            this.usuarios.length === 0
          ) {
            this.mensajeError =
              'Todos los cajeros de esta tienda ya tienen un turno abierto.';
          }
        },

        error: error => {
          console.error(
            'Error al cargar cajeros:',
            error
          );

          this.cajerosTienda = [];
          this.usuarios = [];

          this.mensajeError =
            error.error?.message ||
            'No fue posible cargar los cajeros.';

          this.cargandoUsuarios =
            false;
        }
      });
  }

  abrirTurno(): void {
    this.limpiarMensajes();

    if (
      this.usuarioActual?.rol !==
      'gerente'
    ) {
      this.mensajeError =
        'Solo un gerente puede abrir turnos.';

      return;
    }

    if (!this.tiendaId) {
      this.mensajeError =
        'El gerente no tiene una tienda asignada.';

      return;
    }

    if (!this.usuarioId) {
      this.mensajeError =
        'Selecciona un cajero disponible.';

      return;
    }

    const cajeroSeleccionado =
      this.usuarios.find(
        usuario =>
          usuario._id ===
          this.usuarioId
      );

    if (!cajeroSeleccionado) {
      this.mensajeError =
        'El cajero seleccionado no está disponible.';

      return;
    }

    const tiendaCajero =
      this.obtenerTiendaId(
        cajeroSeleccionado.tiendaId
      );

    if (
      tiendaCajero !==
      this.tiendaId
    ) {
      this.mensajeError =
        'El cajero seleccionado no pertenece a la tienda del gerente.';

      return;
    }

    const cajeroConTurno =
      this.turnosAbiertos.some(
        turno =>
          this.obtenerUsuarioIdTurno(
            turno.usuarioId
          ) === this.usuarioId
      );

    if (cajeroConTurno) {
      this.mensajeError =
        'El cajero seleccionado ya tiene un turno abierto.';

      return;
    }

    if (
      this.numeroCaja === null ||
      !Number.isInteger(
        Number(this.numeroCaja)
      ) ||
      Number(this.numeroCaja) <= 0
    ) {
      this.mensajeError =
        'Ingresa un número de caja entero mayor a cero.';

      return;
    }

    const cajaOcupada =
      this.turnosAbiertos.some(
        turno =>
          Number(turno.numeroCaja) ===
          Number(this.numeroCaja)
      );

    if (cajaOcupada) {
      this.mensajeError =
        `La caja ${this.numeroCaja} ya tiene un turno abierto.`;

      return;
    }

    if (
      this.montoInicial === null ||
      this.montoInicial === undefined
    ) {
      this.mensajeError =
        'Ingresa el fondo inicial de caja.';

      return;
    }

    if (
      Number(this.montoInicial) < 0
    ) {
      this.mensajeError =
        'El fondo inicial no puede ser negativo.';

      return;
    }

    this.enviando = true;

    const nuevoTurno = {
      tiendaId:
        this.tiendaId,

      usuarioId:
        this.usuarioId,

      numeroCaja:
        Number(this.numeroCaja),

      montoInicial:
        Number(this.montoInicial)
    };

    this.http
      .post<{
        message?: string;
        turno?: TurnoAbierto;
      }>(
        `${this.turnosApi}/abrir`,
        nuevoTurno
      )
      .subscribe({
        next: respuesta => {
          this.mensajeExito =
            respuesta.message ||
            'El turno se abrió correctamente.';

          /*
            Limpia solo los campos del nuevo turno.
            La tienda permanece fija.
          */
          this.usuarioId = '';
          this.numeroCaja = null;
          this.montoInicial = null;

          /*
            Actualiza los turnos y los cajeros
            disponibles sin abandonar la pantalla.
          */
          this.cargarTurnosAbiertos();
        },

        error: error => {
          console.error(
            'Error al abrir turno:',
            error
          );

          this.mensajeError =
            error.error?.message ||
            'No fue posible abrir el turno.';

          this.enviando = false;
        },

        complete: () => {
          this.enviando = false;
        }
      });
  }

  obtenerNombreCajeroTurno(
    turno: TurnoAbierto
  ): string {
    if (
      turno.usuarioId &&
      typeof turno.usuarioId ===
      'object'
    ) {
      return (
        turno.usuarioId.nombre ||
        'Cajero'
      );
    }

    return 'Cajero';
  }

  obtenerUsuarioCajeroTurno(
    turno: TurnoAbierto
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

  private obtenerUsuarioIdTurno(
    usuario:
      | string
      | UsuarioTurno
      | null
      | undefined
  ): string {
    if (
      typeof usuario ===
      'string'
    ) {
      return usuario;
    }

    return usuario?._id || '';
  }

  private obtenerTiendaId(
    tienda:
      | string
      | TiendaBackend
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