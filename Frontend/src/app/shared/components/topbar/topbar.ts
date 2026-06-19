import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

type UserRole = 'cajero' | 'gerente' | 'admin';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './topbar.html',
  styleUrl: './topbar.css'
})
export class Topbar {
  @Input() titulo = 'Bienvenido al sistema de ventas de XoXO';
  @Input() subtitulo = '';

  menuUsuarioAbierto = false;

  private readonly rolActual: UserRole =
    (localStorage.getItem('rol') as UserRole) || 'cajero';

  usuario = {
    nombre: this.obtenerNombre(),
    correo: localStorage.getItem('correo') || 'usuario@xoxo.com',
    rol: this.obtenerNombreRol(),
    sucursal:
      localStorage.getItem('sucursal') || 'Sucursal #027 - Centro',
    avatar: this.obtenerAvatar()
  };

  constructor(private router: Router) {}

  alternarMenuUsuario(): void {
    this.menuUsuarioAbierto = !this.menuUsuarioAbierto;
  }

  cerrarMenuUsuario(): void {
    this.menuUsuarioAbierto = false;
  }

  cerrarSesion(): void {
    localStorage.removeItem('correo');
    localStorage.removeItem('rol');
    localStorage.removeItem('nombre');
    localStorage.removeItem('sucursal');

    this.router.navigate(['/']);
  }

  private obtenerNombre(): string {
    const nombreGuardado = localStorage.getItem('nombre');

    if (nombreGuardado) {
      return nombreGuardado;
    }

    if (this.rolActual === 'admin') {
      return 'Carlos Ramírez';
    }

    if (this.rolActual === 'gerente') {
      return 'Laura Hernández';
    }

    return 'María López';
  }

  private obtenerNombreRol(): string {
    if (this.rolActual === 'admin') {
      return 'Administrador';
    }

    if (this.rolActual === 'gerente') {
      return 'Gerente';
    }

    return 'Cajero';
  }

  private obtenerAvatar(): string {
    if (this.rolActual === 'admin') {
      return '/Administradores.png';
    }

    if (this.rolActual === 'gerente') {
      return '/Gerentes.png';
    }

    return '/Cajeros.png';
  }
}