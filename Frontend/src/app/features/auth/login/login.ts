import { CommonModule } from '@angular/common';
import {
  Component
} from '@angular/core';

import {
  FormsModule
} from '@angular/forms';

import {
  Router
} from '@angular/router';

import {
  Usuario,
  UserRole
} from '../../../core/models/usuario.model';

import {
  UsuarioActualService
} from '../../../core/services/usuario-actual';

interface UsuarioPrueba extends Usuario {
  contrasena: string;
  dashboard: string;
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

  private readonly usuarios:
    UsuarioPrueba[] = [
      {
        id: 1,
        nombre: 'María López',
        sexo: 'mujer',
        correo: 'cajero@xoxo.com',
        contrasena: '1234',
        rol: 'cajero',
        cargo: 'Cajera',
        sucursal:
          'Sucursal #027 - Centro',
        avatar: '/Cajera.png',
        dashboard:
          '/dashboard-cajero'
      },
      {
        id: 2,
        nombre: 'Laura Hernández',
        sexo: 'mujer',
        correo: 'gerente@xoxo.com',
        contrasena: '1234',
        rol: 'gerente',
        cargo: 'Gerente',
        sucursal:
          'Sucursal #027 - Centro',
        avatar: '/GerenteF.png',
        dashboard:
          '/dashboard-gerente'
      },
      {
        id: 3,
        nombre: 'Carlos Ramírez',
        sexo: 'hombre',
        correo: 'admin@xoxo.com',
        contrasena: '1234',
        rol: 'admin',
        cargo: 'Administrador',
        sucursal:
          'Administración general',
        avatar: '/Administrador.png',
        dashboard:
          '/dashboard-admin'
      }
    ];

  constructor(
    private router: Router,

    private usuarioActualService:
      UsuarioActualService
  ) {}

  iniciarSesion(): void {
    this.error = '';

    const correoNormalizado =
      this.correo
        .trim()
        .toLowerCase();

    const contrasenaNormalizada =
      this.contrasena.trim();

    if (
      !correoNormalizado ||
      !contrasenaNormalizada
    ) {
      this.error =
        'Ingresa el correo electrónico y la contraseña.';

      return;
    }

    const usuarioEncontrado =
      this.usuarios.find(
        usuario =>
          usuario.correo
            .trim()
            .toLowerCase() ===
            correoNormalizado &&
          usuario.contrasena ===
            contrasenaNormalizada
      );

    if (!usuarioEncontrado) {
      this.error =
        'El correo electrónico o la contraseña son incorrectos.';

      return;
    }

    this.cargando = true;

    const usuarioSesion:
      Usuario = {
        id:
          usuarioEncontrado.id,

        nombre:
          usuarioEncontrado.nombre,

        sexo:
          usuarioEncontrado.sexo,

        correo:
          usuarioEncontrado.correo,

        rol:
          usuarioEncontrado.rol,

        cargo:
          usuarioEncontrado.cargo,

        sucursal:
          usuarioEncontrado.sucursal,

        avatar:
          usuarioEncontrado.avatar
      };

    try {
      localStorage.setItem(
        'sesionActiva',
        'true'
      );

      this.usuarioActualService
        .establecerUsuario(
          usuarioSesion
        );

      this.router
        .navigateByUrl(
          usuarioEncontrado.dashboard
        )
        .then(
          navegacionExitosa => {
            if (!navegacionExitosa) {
              this.error =
                'No fue posible abrir el panel del usuario.';

              this.cargando = false;
            }
          }
        )
        .catch(() => {
          this.error =
            'Ocurrió un error al abrir el panel.';

          this.cargando = false;
        });
    } catch {
      this.error =
        'No fue posible iniciar la sesión.';

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
    rol: UserRole
  ): void {
    const usuario =
      this.usuarios.find(
        item =>
          item.rol === rol
      );

    if (!usuario) {
      return;
    }

    this.correo =
      usuario.correo;

    this.contrasena =
      usuario.contrasena;

    this.error = '';
  }
}