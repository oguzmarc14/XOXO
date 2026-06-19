import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { HasPermissionDirective } from '../../directives/has-permission';

type UserRole = 'cajero' | 'gerente' | 'admin';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    HasPermissionDirective
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar {
  rol: UserRole =
    (localStorage.getItem('rol') as UserRole) || 'cajero';

  get dashboardRuta(): string {
    if (this.rol === 'admin') {
      return '/dashboard-admin';
    }

    if (this.rol === 'gerente') {
      return '/dashboard-gerente';
    }

    return '/dashboard-cajero';
  }

  get nombrePanel(): string {
    if (this.rol === 'admin') {
      return 'Panel Administrador';
    }

    if (this.rol === 'gerente') {
      return 'Panel Gerente';
    }

    return 'Panel Cajero';
  }
}