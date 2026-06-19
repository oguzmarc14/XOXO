import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard-cajero',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-cajero.html',
  styleUrl: './dashboard-cajero.css'
})
export class DashboardCajero {
  menuUsuarioAbierto: boolean = false;

  usuario = {
    nombre: 'María López',
    correo: localStorage.getItem('correo') || 'cajero@xoxo.com',
    rol: 'Cajero',
    sucursal: 'Sucursal #027 - Centro'
  };

  constructor(private router: Router) {}

  abrirMenuUsuario() {
    this.menuUsuarioAbierto = !this.menuUsuarioAbierto;
  }

  irANuevaVenta() {
    this.router.navigate(['/nueva-venta']);
  }

  irADevoluciones() {
    this.router.navigate(['/historial-ventas']);
  }

  irAInventario() {
    this.router.navigate(['/lista-inventario']);
  }

  cerrarSesion() {
    localStorage.removeItem('correo');
    localStorage.removeItem('rol');
    this.router.navigate(['/']);
  }
}