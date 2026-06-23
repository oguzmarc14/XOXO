import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { SexoUsuario, Usuario, UserRole } from '../../../core/models/usuario.model';
import { UsuarioActualService } from '../../../core/services/usuario-actual';

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
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  correo = '';
  contrasena = '';

  error = '';
  cargando = false;
  mostrarContrasena = false;

  private readonly authApi = 'https://xoxo-backend-ewqr.onrender.com/auth/login';

  constructor(
    private router: Router,
    private http: HttpClient,
    private usuarioActualService: UsuarioActualService
  ) {}

  iniciarSesion(): void {
    this.error = '';

    const usuarioIngresado = this.correo.trim();
    const password = this.contrasena.trim();

    if (!usuarioIngresado || !password) {
      this.error = 'Ingresa el usuario y la contraseña.';
      return;
    }

    this.cargando = true;

    this.http.post<LoginResponse>(this.authApi, {
      usuario: usuarioIngresado,
      password
    }).subscribe({
      next: async (data) => {
        if (!data.usuario) {
          this.error = 'El servidor no devolvió los datos del usuario.';
          this.cargando = false;
          return;
        }

        const rol = this.convertirRol(data.usuario.rol);
        const sexo = this.convertirSexo(data.usuario.sexo);

        const usuarioSesion: Usuario = {
          id: this.convertirId(data.usuario.id || data.usuario._id),
          nombre: data.usuario.nombre,
          sexo,
          user: data.usuario.usuario,
          rol,
          cargo: this.obtenerCargo(rol, sexo),
          sucursal: this.obtenerSucursal(rol, data.usuario.tiendaId),
          tiendaId: this.extraerTiendaId(data.usuario.tiendaId),
          avatar: this.usuarioActualService.obtenerAvatarPorRolYSexo(rol, sexo),
        };

        this.usuarioActualService.establecerUsuario(usuarioSesion);
        localStorage.setItem('sesionActiva', 'true');

        await this.router.navigateByUrl(this.obtenerRutaDashboard(rol));

        this.cargando = false;
      },
      error: (error) => {
        console.error('Error login:', error);

        this.error =
          error.error?.message ||
          'Usuario o contraseña incorrectos.';

        this.cargando = false;
      }
    });
  }

  alternarContrasena(): void {
    this.mostrarContrasena = !this.mostrarContrasena;
  }

  limpiarError(): void {
    this.error = '';
  }

  private convertirRol(rolBackend: 'ADMIN' | 'GERENTE' | 'CAJERO'): UserRole {
    if (rolBackend === 'ADMIN') return 'admin';
    if (rolBackend === 'GERENTE') return 'gerente';
    return 'cajero';
  }

  private convertirSexo(
    sexoBackend: 'HOMBRE' | 'MUJER' | 'hombre' | 'mujer' | undefined
  ): SexoUsuario {
    return sexoBackend === 'MUJER' || sexoBackend === 'mujer'
      ? 'mujer'
      : 'hombre';
  }

  private obtenerCargo(rol: UserRole, sexo: SexoUsuario): string {
    if (rol === 'admin') {
      return sexo === 'mujer' ? 'Administradora' : 'Administrador';
    }

    if (rol === 'gerente') return 'Gerente';

    return sexo === 'mujer' ? 'Cajera' : 'Cajero';
  }

  private obtenerSucursal(
    rol: UserRole,
    tienda: TiendaLogin | string | null | undefined
  ): string {
    if (rol === 'admin') return 'Administración general';

    if (tienda && typeof tienda === 'object' && tienda.nombre) {
      return tienda.ciudad
        ? `${tienda.nombre} - ${tienda.ciudad}`
        : tienda.nombre;
    }

    if (typeof tienda === 'string' && tienda.trim()) return tienda;

    return 'Sucursal no asignada';
  }

  private obtenerRutaDashboard(rol: UserRole): string {
    if (rol === 'admin') return '/dashboard-admin';
    if (rol === 'gerente') return '/dashboard-gerente';
    return '/dashboard-cajero';
  }

  private extraerTiendaId(
    tienda: TiendaLogin | string | null | undefined
  ): string | undefined {
    if (!tienda) return undefined;
    if (typeof tienda === 'object' && tienda._id) return tienda._id;
    if (typeof tienda === 'string') return tienda;
    return undefined;
  }

  private convertirId(id: string | undefined): number {
    if (!id) return Date.now();

    const parteHexadecimal = id.replace(/[^a-fA-F0-9]/g, '').slice(-8);
    const idConvertido = Number.parseInt(parteHexadecimal, 16);

    return Number.isFinite(idConvertido) && idConvertido > 0
      ? idConvertido
      : Date.now();
  }
}