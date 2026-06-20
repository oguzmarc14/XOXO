
import { CommonModule } from '@angular/common';
import {
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';

import {
  NavigationEnd,
  Router,
  RouterOutlet
} from '@angular/router';

import {
  filter,
  Subscription
} from 'rxjs';

import {
  Usuario
} from './core/models/usuario.model';

import {
  UsuarioActualService
} from './core/services/usuario-actual';

import {
  Sidebar
} from './shared/components/sidebar/sidebar';

import {
  Topbar
} from './shared/components/topbar/topbar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    Sidebar,
    Topbar
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {
  usuario: Usuario | null = null;

  mostrarNavegacion = false;
  menuMovilAbierto = false;

  titulo = '';
  subtitulo = '';

  private usuarioSubscription?: Subscription;
  private routerSubscription?: Subscription;

  constructor(
    private router: Router,
    private usuarioActualService: UsuarioActualService
  ) {}

  ngOnInit(): void {
    this.usuarioSubscription =
      this.usuarioActualService.usuario$
        .subscribe((usuario) => {
          const sesionActiva =
            localStorage.getItem('sesionActiva') === 'true';

          this.usuario =
            sesionActiva && usuario.id !== 0
              ? usuario
              : null;

          this.actualizarVista();
        });

    this.routerSubscription =
      this.router.events
        .pipe(
          filter(
            (evento) =>
              evento instanceof NavigationEnd
          )
        )
        .subscribe(() => {
          this.menuMovilAbierto = false;
          this.actualizarVista();
        });

    this.actualizarVista();
  }

  ngOnDestroy(): void {
    this.usuarioSubscription?.unsubscribe();
    this.routerSubscription?.unsubscribe();
  }

  revisarPerfil(): void {
    if (!this.usuario) {
      return;
    }

    const rutasPerfil: Record<
      Usuario['rol'],
      string
    > = {
      admin: '/admin/perfil',
      gerente: '/gerente/perfil',
      cajero: '/cajero/perfil'
    };

    const ruta =
      rutasPerfil[this.usuario.rol];

    this.router.navigate([ruta]);
  }

  cerrarSesion(): void {
    this.usuarioActualService.cerrarSesion();

    this.usuario = null;
    this.mostrarNavegacion = false;
    this.menuMovilAbierto = false;

    this.router.navigate(['/login']);
  }

  alternarMenuMovil(): void {
    this.menuMovilAbierto =
      !this.menuMovilAbierto;
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
      avatar:
        this.usuarioActualService
          .obtenerAvatarPorRolYSexo(
            this.usuario.rol,
            this.usuario.sexo
          )
    };
  }

  private actualizarVista(): void {
    const url =
      this.router.url
        .split('?')[0]
        .split('#')[0];

    const esPantallaLogin =
      url === '/' ||
      url === '/login';

    const sesionActiva =
      localStorage.getItem(
        'sesionActiva'
      ) === 'true';

    this.mostrarNavegacion =
      !esPantallaLogin &&
      sesionActiva &&
      this.usuario !== null;

    this.actualizarEncabezado(url);
  }

  private actualizarEncabezado(
    url: string
  ): void {
    if (
      url.includes('dashboard-gerente') ||
      url.includes('/gerente/inicio')
    ) {
      this.titulo =
        'Panel de gestión de la sucursal';

      this.subtitulo =
        this.usuario?.sucursal
          ? `Administración · ${this.usuario.sucursal}`
          : 'Administración y supervisión de la sucursal';

      return;
    }

    if (
      url.includes('dashboard-cajero') ||
      url.includes('/cajero/inicio')
    ) {
      this.titulo = 'Panel Cajero';

      this.subtitulo =
        this.usuario?.sucursal
          ? `Operaciones · ${this.usuario.sucursal}`
          : 'Operaciones y ventas de la sucursal';

      return;
    }

    if (
      url.includes('dashboard-admin') ||
      url.includes('/admin/inicio')
    ) {
      this.titulo =
        'Panel Administrador';

      this.subtitulo =
        'Administración general del sistema';

      return;
    }

    if (url.includes('/perfil')) {
      this.titulo = 'Mi perfil';

      this.subtitulo =
        'Consulta y actualiza los datos de tu cuenta';

      return;
    }

    if (url.includes('historial-ventas')) {
      this.titulo =
        'Historial de ventas';

      this.subtitulo =
        'Consulta las operaciones registradas';

      return;
    }

    if (url.includes('nueva-venta')) {
      this.titulo =
        'Gestión de ventas';

      this.subtitulo =
        'Registra o cancela operaciones de venta';

      return;
    }

    if (url.includes('abrir-turno')) {
      this.titulo =
        'Apertura de turno';

      this.subtitulo =
        'Registra el fondo inicial de caja';

      return;
    }

    if (url.includes('cerrar-turno')) {
      this.titulo =
        'Cierre de turno';

      this.subtitulo =
        'Registra y verifica el cierre de caja';

      return;
    }

    if (url.includes('historial-turnos')) {
      this.titulo =
        'Historial de turnos';

      this.subtitulo =
        'Consulta las aperturas y cierres registrados';

      return;
    }

    if (
      url.includes('movimientos') &&
      url.includes('inventario')
    ) {
      this.titulo =
        'Movimientos de inventario';

      this.subtitulo =
        'Consulta entradas, salidas y ajustes';

      return;
    }

    if (url.includes('inventario')) {
      this.titulo = 'Inventario';

      this.subtitulo =
        'Consulta y administra las existencias';

      return;
    }

    if (url.includes('productos')) {
      this.titulo =
        'Gestión de productos';

      this.subtitulo =
        'Consulta y administra el catálogo';

      return;
    }

    if (url.includes('crear-usuario')) {
      this.titulo = 'Crear usuario';

      this.subtitulo =
        'Registra una nueva cuenta de acceso';

      return;
    }

    if (url.includes('editar-usuario')) {
      this.titulo = 'Editar usuario';

      this.subtitulo =
        'Actualiza los datos de la cuenta';

      return;
    }

    if (
      url.includes('lista-usuarios') ||
      url.includes('/usuarios')
    ) {
      this.titulo =
        'Gestión de usuarios';

      this.subtitulo =
        'Consulta y administra las cuentas del sistema';

      return;
    }

    if (
      url.includes('tiendas') ||
      url.includes('sucursales')
    ) {
      this.titulo =
        'Gestión de tiendas';

      this.subtitulo =
        'Consulta y administra las sucursales';

      return;
    }

    if (url.includes('eventos')) {
      this.titulo = 'Eventos';

      this.subtitulo =
        'Consulta y administra los eventos';

      return;
    }

    if (url.includes('reportes')) {
      this.titulo = 'Reportes';

      this.subtitulo =
        'Consulta indicadores y resultados';

      return;
    }

    this.titulo =
      this.obtenerTituloPorRol();

    this.subtitulo =
      this.usuario?.sucursal || '';
  }

  private obtenerTituloPorRol(): string {
    if (!this.usuario) {
      return '';
    }

    if (this.usuario.rol === 'admin') {
      return 'Panel Administrador';
    }

    if (this.usuario.rol === 'gerente') {
      return 'Panel Gerente';
    }

    return 'Panel Cajero';
  }
}
