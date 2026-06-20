import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { UserRole } from '../../../core/models/usuario.model';

interface UsuarioPrueba {
  nombre: string;
  correo: string;
  contrasena: string;
  rol: UserRole;
  sucursal: string;
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

  private readonly usuarios: UsuarioPrueba[] = [
    {
      nombre: 'María López',
      correo: 'cajero@xoxo.com',
      contrasena: '1234',
      rol: 'cajero',
      sucursal: 'Sucursal #027 - Centro',
      dashboard: '/dashboard-cajero'
    },
    {
      nombre: 'Laura Hernández',
      correo: 'gerente@xoxo.com',
      contrasena: '1234',
      rol: 'gerente',
      sucursal: 'Sucursal #027 - Centro',
      dashboard: '/dashboard-gerente'
    },
    {
      nombre: 'Carlos Ramírez',
      correo: 'admin@xoxo.com',
      contrasena: '1234',
      rol: 'admin',
      sucursal: 'Administración general',
      dashboard: '/dashboard-admin'
    }
  ];

  constructor(private router: Router) {}

  iniciarSesion(): void {
    this.error = '';

    const correoNormalizado = this.correo
      .trim()
      .toLowerCase();

    const contrasenaNormalizada = this.contrasena.trim();

    if (!correoNormalizado || !contrasenaNormalizada) {
      this.error =
        'Ingresa el correo electrónico y la contraseña.';
      return;
    }

    const usuarioEncontrado = this.usuarios.find(
      (usuario) =>
        usuario.correo.toLowerCase() === correoNormalizado &&
        usuario.contrasena === contrasenaNormalizada
    );

    if (!usuarioEncontrado) {
      this.error =
        'El correo electrónico o la contraseña son incorrectos.';
      return;
    }

    this.cargando = true;

    this.guardarSesion(usuarioEncontrado);

    this.router
      .navigate([usuarioEncontrado.dashboard])
      .catch(() => {
        this.error =
          'No fue posible abrir el panel del usuario.';
      })
      .finally(() => {
        this.cargando = false;
      });
  }

  alternarContrasena(): void {
    this.mostrarContrasena = !this.mostrarContrasena;
  }

  limpiarError(): void {
    if (this.error) {
      this.error = '';
    }
  }

  private guardarSesion(usuario: UsuarioPrueba): void {
    localStorage.setItem('nombre', usuario.nombre);
    localStorage.setItem('correo', usuario.correo);
    localStorage.setItem('rol', usuario.rol);
    localStorage.setItem('sucursal', usuario.sucursal);

    localStorage.setItem('sesionActiva', 'true');

    localStorage.setItem(
      'usuarioActual',
      JSON.stringify({
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol,
        sucursal: usuario.sucursal
      })
    );
  }
}