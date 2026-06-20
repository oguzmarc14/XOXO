import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface LoginResponse {
  message: string;
  usuario: {
    id: string;
    nombre: string;
    usuario: string;
    rol: 'ADMIN' | 'GERENTE' | 'CAJERO';
    tiendaId: any;
  };
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  correo = '';
  contrasena = '';

  error = '';
  cargando = false;
  mostrarContrasena = false;

  constructor(private router: Router) {}

  async iniciarSesion(): Promise<void> {
    this.error = '';

    const usuario = this.correo.trim();
    const password = this.contrasena.trim();

    if (!usuario || !password) {
      this.error = 'Ingresa el usuario y la contraseña.';
      return;
    }

    this.cargando = true;

    try {
      const respuesta = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          usuario,
          password
        })
      });

      const data: LoginResponse = await respuesta.json();

      if (!respuesta.ok) {
        this.error = data.message || 'Usuario o contraseña incorrectos.';
        this.cargando = false;
        return;
      }

      localStorage.setItem('sesionActiva', 'true');
      localStorage.setItem('usuario', JSON.stringify(data.usuario));

      const rol = data.usuario.rol;

      if (rol === 'GERENTE') {
        await this.router.navigateByUrl('/dashboard-gerente');
      } else if (rol === 'CAJERO') {
        await this.router.navigateByUrl('/dashboard-cajero');
      } else if (rol === 'ADMIN') {
        await this.router.navigateByUrl('/dashboard-admin');
      } else {
        this.error = 'Rol no reconocido.';
        this.cargando = false;
      }

    } catch {
      this.error = 'No se pudo conectar con el servidor.';
      this.cargando = false;
    }
  }

  alternarContrasena(): void {
    this.mostrarContrasena = !this.mostrarContrasena;
  }

  limpiarError(): void {
    this.error = '';
  }

  seleccionarUsuarioPrueba(rol: 'CAJERO' | 'GERENTE' | 'ADMIN'): void {
    if (rol === 'GERENTE') {
      this.correo = 'marco';
      this.contrasena = '1234';
    }

    this.error = '';
  }
}