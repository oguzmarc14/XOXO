import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import {
  SexoUsuario,
  Usuario,
  UserRole
} from '../../../core/models/usuario.model';

import {
  UsuarioActualService
} from '../../../core/services/usuario-actual';

interface TiendaLogin {
  _id?: string;
  nombre?: string;
  direccion?: string;
  ciudad?: string;
}

interface UsuarioBackend {
  id?: string;
  _id?: string;
  nombre: string;
  usuario: string;
  rol: 'ADMIN' | 'GERENTE' | 'CAJERO';
  tiendaId?: TiendaLogin | string | null;
  sexo?: 'HOMBRE' | 'MUJER' | 'hombre' | 'mujer';
}

interface LoginResponse {
  message: string;
  usuario?: UsuarioBackend;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  correo = '';
  contrasena = '';

  error = '';
  cargando = false;
  mostrarContrasena = false;

  constructor(
    private router: Router,
    private usuarioActualService:
      UsuarioActualService
  ) {}

  async iniciarSesion(): Promise<void> {
    this.error = '';

    const usuarioIngresado =
      this.correo.trim();

    const password =
      this.contrasena.trim();

    if (
      !usuarioIngresado ||
      !password
    ) {
      this.error =
        'Ingresa el usuario y la contraseña.';

      return;
    }

    this.cargando = true;

    try {
      const respuesta =
        await fetch(
          'http://localhost:3000/auth/login',
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json'
            },

            body: JSON.stringify({
              usuario: usuarioIngresado,
              password
            })
          }
        );

      const data =
        await this.leerRespuesta(
          respuesta
        );

      if (
        !respuesta.ok ||
        !data.usuario
      ) {
        this.error =
          data.message ||
          'Usuario o contraseña incorrectos.';

        return;
      }

      const rol =
        this.convertirRol(
          data.usuario.rol
        );

      const sexo =
        this.convertirSexo(
          data.usuario.sexo
        );

      const usuarioSesion:
        Usuario = {
          id:
            this.convertirId(
              data.usuario.id ||
              data.usuario._id
            ),

          nombre:
            data.usuario.nombre,

          sexo,

          correo:
            data.usuario.usuario,

          rol,

          cargo:
            this.obtenerCargo(
              rol,
              sexo
            ),

          sucursal:
            this.obtenerSucursal(
              rol,
              data.usuario.tiendaId
            ),

          avatar:
            this.usuarioActualService
              .obtenerAvatarPorRolYSexo(
                rol,
                sexo
              )
        };

      /*
        Esta línea registra el usuario
        en el servicio que utiliza App,
        Topbar y Sidebar.
      */
      this.usuarioActualService
        .establecerUsuario(
          usuarioSesion
        );

      /*
        Esta bandera permite que App
        muestre la navegación global.
      */
      localStorage.setItem(
        'sesionActiva',
        'true'
      );

      const rutaDashboard =
        this.obtenerRutaDashboard(
          rol
        );

      const navegacionExitosa =
        await this.router
          .navigateByUrl(
            rutaDashboard
          );

      if (!navegacionExitosa) {
        this.usuarioActualService
          .cerrarSesion();

        this.error =
          'No fue posible abrir el panel del usuario.';
      }
    } catch (error) {
      console.error(
        'Error de inicio de sesión:',
        error
      );

      this.error =
        'No se pudo conectar con el servidor. Verifica que el backend esté encendido.';
    } finally {
      this.cargando = false;
    }
  }

  alternarContrasena(): void {
    this.mostrarContrasena =
      !this.mostrarContrasena;
  }

  limpiarError(): void {
    this.error = '';
  }

  seleccionarUsuarioPrueba(
    rol:
      | 'CAJERO'
      | 'GERENTE'
      | 'ADMIN'
  ): void {
    const usuariosPrueba: Record<
      'CAJERO' | 'GERENTE' | 'ADMIN',
      string
    > = {
      CAJERO: 'cajero',
      GERENTE: 'marco',
      ADMIN: 'admin'
    };

    this.correo =
      usuariosPrueba[rol];

    this.contrasena = '1234';
    this.error = '';
  }

  private async leerRespuesta(
    respuesta: Response
  ): Promise<LoginResponse> {
    try {
      return await respuesta
        .json() as LoginResponse;
    } catch {
      return {
        message:
          'El servidor devolvió una respuesta inválida.'
      };
    }
  }

  private convertirRol(
    rolBackend:
      'ADMIN' |
      'GERENTE' |
      'CAJERO'
  ): UserRole {
    if (rolBackend === 'ADMIN') {
      return 'admin';
    }

    if (
      rolBackend === 'GERENTE'
    ) {
      return 'gerente';
    }

    return 'cajero';
  }

  private convertirSexo(
    sexoBackend:
      | 'HOMBRE'
      | 'MUJER'
      | 'hombre'
      | 'mujer'
      | undefined
  ): SexoUsuario {
    if (
      sexoBackend === 'MUJER' ||
      sexoBackend === 'mujer'
    ) {
      return 'mujer';
    }

    return 'hombre';
  }

  private obtenerCargo(
    rol: UserRole,
    sexo: SexoUsuario
  ): string {
    if (rol === 'admin') {
      return sexo === 'mujer'
        ? 'Administradora'
        : 'Administrador';
    }

    if (rol === 'gerente') {
      return 'Gerente';
    }

    return sexo === 'mujer'
      ? 'Cajera'
      : 'Cajero';
  }

  private obtenerSucursal(
    rol: UserRole,
    tienda:
      | TiendaLogin
      | string
      | null
      | undefined
  ): string {
    if (rol === 'admin') {
      return 'Administración general';
    }

    if (
      tienda &&
      typeof tienda === 'object' &&
      tienda.nombre
    ) {
      return tienda.nombre;
    }

    if (
      typeof tienda === 'string' &&
      tienda.trim()
    ) {
      return tienda;
    }

    return 'Sucursal no asignada';
  }

  private obtenerRutaDashboard(
    rol: UserRole
  ): string {
    if (rol === 'admin') {
      return '/dashboard-admin';
    }

    if (rol === 'gerente') {
      return '/dashboard-gerente';
    }

    return '/dashboard-cajero';
  }

  private convertirId(
    id: string | undefined
  ): number {
    if (!id) {
      return Date.now();
    }

    const parteHexadecimal =
      id
        .replace(
          /[^a-fA-F0-9]/g,
          ''
        )
        .slice(-8);

    const idConvertido =
      Number.parseInt(
        parteHexadecimal,
        16
      );

    if (
      Number.isFinite(
        idConvertido
      ) &&
      idConvertido > 0
    ) {
      return idConvertido;
    }

    return Date.now();
  }
}