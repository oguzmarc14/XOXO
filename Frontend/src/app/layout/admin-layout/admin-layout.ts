import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';

import { NavigationEnd, Router, RouterOutlet } from '@angular/router';

import { filter, Subscription } from 'rxjs';

import { Usuario } from '../../core/models/usuario.model';

import { UsuarioActualService } from '../../core/services/usuario-actual';

import { Sidebar } from '../../shared/components/sidebar/sidebar';

import { Topbar } from '../../shared/components/topbar/topbar';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, Sidebar, Topbar],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css',
})
export class AdminLayout implements OnInit, OnDestroy {
  usuario!: Usuario;

  titulo = 'Panel Administrador';

  subtitulo = 'Administración general del sistema';

  menuMovilAbierto = false;

  private usuarioSubscription?: Subscription;

  private routerSubscription?: Subscription;

  constructor(
    private usuarioActualService: UsuarioActualService,

    private router: Router,
  ) {}

  ngOnInit(): void {
    this.validarSesion();

    this.usuarioSubscription = this.usuarioActualService.usuario$.subscribe((usuario) => {
      this.usuario = usuario;

      this.actualizarEncabezado();
    });

    this.routerSubscription = this.router.events
      .pipe(filter((evento) => evento instanceof NavigationEnd))
      .subscribe(() => {
        this.menuMovilAbierto = false;

        this.actualizarEncabezado();
      });
  }

  ngOnDestroy(): void {
    this.usuarioSubscription?.unsubscribe();

    this.routerSubscription?.unsubscribe();
  }

  revisarPerfil(): void {
    this.router.navigate(['/admin/perfil']);
  }

  cerrarSesion(): void {
    this.usuarioActualService.cerrarSesion();

    this.router.navigate(['/login']);
  }

  alternarMenuMovil(): void {
    this.menuMovilAbierto = !this.menuMovilAbierto;
  }

  cerrarMenuMovil(): void {
    this.menuMovilAbierto = false;
  }

  manejarErrorAvatar(): void {
    if (!this.usuario) {
      return;
    }

    this.usuario = {
      ...this.usuario,
      avatar: this.usuarioActualService.obtenerAvatarPorRolYSexo(
        this.usuario.rol,
        this.usuario.sexo,
      ),
    };
  }

  private validarSesion(): void {
    const sesionActiva = localStorage.getItem('sesionActiva');

    const usuarioActual = this.usuarioActualService.obtenerUsuario();

    if (sesionActiva !== 'true' || !usuarioActual || usuarioActual.id === 0) {
      this.router.navigate(['/login']);

      return;
    }

    if (usuarioActual.rol !== 'admin') {
      this.redirigirSegunRol(usuarioActual.rol);
    }
  }

  private redirigirSegunRol(rol: Usuario['rol']): void {
    if (rol === 'gerente') {
      this.router.navigate(['/dashboard-gerente']);

      return;
    }

    if (rol === 'cajero') {
      this.router.navigate(['/dashboard-cajero']);

      return;
    }

    this.router.navigate(['/dashboard-admin']);
  }

  private actualizarEncabezado(): void {
    const url = this.router.url;

    if (url.includes('/perfil')) {
      this.titulo = 'Mi perfil';

      this.subtitulo = 'Consulta y actualiza los datos de tu cuenta';

      return;
    }

    if (url.includes('/lista-usuarios') || url.includes('/usuarios')) {
      this.titulo = 'Gestión de usuarios';

      this.subtitulo = 'Consulta y administra las cuentas del sistema';

      return;
    }

    if (url.includes('/crear-usuario')) {
      this.titulo = 'Crear usuario';

      this.subtitulo = 'Registra una nueva cuenta de acceso';

      return;
    }

    if (url.includes('/editar-usuario')) {
      this.titulo = 'Editar usuario';

      this.subtitulo = 'Actualiza los datos y permisos del usuario';

      return;
    }

    if (url.includes('/tiendas') || url.includes('/sucursales')) {
      this.titulo = 'Gestión de tiendas';

      this.subtitulo = 'Consulta y administra las sucursales registradas';

      return;
    }

    if (url.includes('/reportes')) {
      this.titulo = 'Reportes';

      this.subtitulo = 'Consulta indicadores y resultados del sistema';

      return;
    }

    if (url.includes('/nueva-venta')) {
      this.titulo = 'Gestión de ventas';

      this.subtitulo = 'Registra o cancela operaciones de venta';

      return;
    }

    if (url.includes('/historial-ventas')) {
      this.titulo = 'Historial de ventas';

      this.subtitulo = 'Consulta todas las operaciones registradas';

      return;
    }

    if (url.includes('/inventario')) {
      this.titulo = 'Inventario';

      this.subtitulo = 'Consulta y administra las existencias';

      return;
    }

    if (url.includes('/movimientos-inventario')) {
      this.titulo = 'Movimientos de inventario';

      this.subtitulo = 'Consulta entradas, salidas y ajustes';

      return;
    }

    if (url.includes('/productos')) {
      this.titulo = 'Gestión de productos';

      this.subtitulo = 'Consulta y administra el catálogo de productos';

      return;
    }

    if (url.includes('/abrir-turno')) {
      this.titulo = 'Apertura de turno';

      this.subtitulo = 'Registra el fondo inicial de caja';

      return;
    }

    if (url.includes('/cerrar-turno')) {
      this.titulo = 'Cierre de turno';

      this.subtitulo = 'Registra y verifica el cierre de caja';

      return;
    }

    if (url.includes('/historial-turnos')) {
      this.titulo = 'Historial de turnos';

      this.subtitulo = 'Consulta las aperturas y cierres registrados';

      return;
    }

    if (url.includes('/eventos')) {
      this.titulo = 'Eventos';

      this.subtitulo = 'Consulta y administra los eventos registrados';

      return;
    }

    this.titulo = 'Panel Administrador';

    this.subtitulo = this.usuario?.sucursal
      ? `Administración general · ${this.usuario.sucursal}`
      : 'Administración general del sistema';
  }
}
