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

  usuarios: UsuarioBackend[] = [];

  usuarioActual!: Usuario;

  nombreTiendaActual =
    'Tienda no asignada';

  mensajeError = '';
  mensajeExito = '';

  cargandoUsuarios = false;
  enviando = false;

  fechaActual = new Date();

  private readonly usuariosApi =
    'http://localhost:3000/usuarios';

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
        'Solo un gerente puede abrir turnos.';

      return;
    }

    /*
      La tienda se obtiene directamente
      del usuario guardado en la sesión.
    */
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

    this.cargarCajeros();
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

  cargarCajeros(): void {
    this.cargandoUsuarios = true;
    this.mensajeError = '';

    this.http
      .get<UsuarioBackend[]>(
        this.usuariosApi
      )
      .subscribe({
        next: respuesta => {
          const usuarios =
            Array.isArray(respuesta)
              ? respuesta
              : [];

          this.usuarios =
            usuarios.filter(
              usuario => {
                const rol =
                  String(usuario.rol)
                    .toLowerCase();

                const tiendaId =
                  this.obtenerTiendaId(
                    usuario.tiendaId
                  );

                const estaActivo =
                  usuario.activo !== false;

                return (
                  rol === 'cajero' &&
                  estaActivo &&
                  tiendaId ===
                    this.tiendaId
                );
              }
            );

          this.cargandoUsuarios =
            false;

          if (
            this.usuarios.length === 0
          ) {
            this.mensajeError =
              'No hay cajeros activos asignados a la tienda del gerente.';
          }
        },

        error: error => {
          console.error(
            'Error al cargar cajeros:',
            error
          );

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

    if (!this.tiendaId) {
      this.mensajeError =
        'El gerente no tiene una tienda asignada.';

      return;
    }

    if (!this.usuarioId) {
      this.mensajeError =
        'Selecciona un cajero.';

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
        'El cajero seleccionado no es válido.';

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

    if (
      this.numeroCaja === null ||
      Number(this.numeroCaja) <= 0
    ) {
      this.mensajeError =
        'Ingresa un número de caja válido.';

      return;
    }

    if (
      this.montoInicial === null
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
      usuarioId:
        this.usuarioId,

      tiendaId:
        this.tiendaId,

      numeroCaja:
        Number(this.numeroCaja),

      montoInicial:
        Number(this.montoInicial)
    };

    this.http
      .post(
        `${this.turnosApi}/abrir`,
        nuevoTurno
      )
      .subscribe({
        next: () => {
          this.mensajeExito =
            'El turno se abrió correctamente.';

          setTimeout(() => {
            this.router.navigate([
              this.dashboardRuta
            ]);
          }, 900);
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