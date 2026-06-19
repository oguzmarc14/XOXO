import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

type RolUsuario = 'cajero' | 'gerente' | 'admin';

interface UsuarioLocal {
  nombre: string;
  correo: string;
  password: string;
  rol: RolUsuario;
  sucursal: string;
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
  password = '';
  error = '';

  private readonly usuarios: UsuarioLocal[] = [
    {
      nombre: 'Carlos Ramírez',
      correo: 'admin@xoxo.com',
      password: '1234',
      rol: 'admin',
      sucursal: 'Administración general'
    },
    {
      nombre: 'Laura Hernández',
      correo: 'gerente@xoxo.com',
      password: '1234',
      rol: 'gerente',
      sucursal: 'Sucursal #027 - Centro'
    },
    {
      nombre: 'María López',
      correo: 'cajero@xoxo.com',
      password: '1234',
      rol: 'cajero',
      sucursal: 'Sucursal #027 - Centro'
    }
  ];

  constructor(private router: Router) {}

  iniciarSesion(): void {
    this.error = '';

    const correoNormalizado = this.correo.trim().toLowerCase();

    const usuarioEncontrado = this.usuarios.find(
      (usuario) =>
        usuario.correo === correoNormalizado &&
        usuario.password === this.password
    );

    if (!usuarioEncontrado) {
      this.error = 'Correo o contraseña incorrectos.';
      return;
    }

    localStorage.setItem('nombre', usuarioEncontrado.nombre);
    localStorage.setItem('correo', usuarioEncontrado.correo);
    localStorage.setItem('rol', usuarioEncontrado.rol);
    localStorage.setItem('sucursal', usuarioEncontrado.sucursal);

    if (usuarioEncontrado.rol === 'admin') {
      this.router.navigate(['/dashboard-admin']);
      return;
    }

    if (usuarioEncontrado.rol === 'gerente') {
      this.router.navigate(['/dashboard-gerente']);
      return;
    }

    this.router.navigate(['/dashboard-cajero']);
  }
}