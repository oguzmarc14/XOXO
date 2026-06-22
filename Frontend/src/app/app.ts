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
    private usuarioActualService:
      UsuarioActualService
  ) {}

  ngOnInit(): void {
    /*
      Escucha los cambios del usuario actual.

      Cuando el login utiliza
      establecerUsuario(), este observable
      recibe inmediatamente el usuario.
    */
    this.usuarioSubscription =
      this.usuarioActualService
        .usuario$
        .subscribe(usuario => {
          const sesionActiva =
            localStorage.getItem(
              'sesionActiva'
            ) === 'true';

          this.usuario =
            sesionActiva &&
            usuario.id !== 0
              ? usuario
              : null;

          this.actualizarVista();
        });

    /*
      Cada vez que cambia la ruta,
      se vuelve a comprobar si debe
      mostrarse la navegación.
    */
    this.routerSubscription =
      this.router.events
        .pipe(
          filter(
            evento =>
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
    this.usuarioSubscription
      ?.unsubscribe();

    this.routerSubscription
      ?.unsubscribe();
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

    this.router.navigate([
      rutasPerfil[this.usuario.rol]
    ]);
  }

  cerrarSesion(): void {
    this.usuarioActualService
      .cerrarSesion();

    this.usuario = null;
    this.mostrarNavegacion = false;
    this.menuMovilAbierto = false;

    this.router.navigate([
      '/login'
    ]);
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

    /*
      La navegación solamente se muestra
      cuando:

      1. No está en el login.
      2. Existe una sesión activa.
      3. Existe un usuario cargado.
    */
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
      url.includes(
        'dashboard-gerente'
      )
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
      url.includes(
        'dashboard-cajero'
      )
    ) {
      this.titulo =
        'Panel Cajero';

      this.subtitulo =
        this.usuario?.sucursal
          ? `Operaciones · ${this.usuario.sucursal}`
          : 'Operaciones y ventas de la sucursal';

      return;
    }

    if (
      url.includes(
        'dashboard-admin'
      )
    ) {
      this.titulo =
        'Panel Administrador';

      this.subtitulo =
        'Administración general del sistema';

      return;
    }

    if (
      url.includes('/perfil')
    ) {
      this.titulo =
        'Mi perfil';

      this.subtitulo =
        'Consulta y actualiza los datos de tu cuenta';

      return;
    }

    if (
      url.includes(
        'historial-ventas'
      )
    ) {
      this.titulo =
        'Historial de ventas';

      this.subtitulo =
        'Consulta las operaciones registradas';

      return;
    }

    if (
      url.includes(
        'nueva-venta'
      )
    ) {
      this.titulo =
        'Nueva venta';

      this.subtitulo =
        'Registra una nueva operación';

      return;
    }

    if (
      url.includes(
        'lista-inventario'
      )
    ) {
      this.titulo =
        'Listado de inventario';

      this.subtitulo =
        'Consulta las existencias disponibles';

      return;
    }

    if (
      url.includes(
        'movimientos-inventario'
      )
    ) {
      this.titulo =
        'Movimientos de inventario';

      this.subtitulo =
        'Consulta entradas, salidas y ajustes';

      return;
    }

    if (
      url.includes(
        'lista-productos'
      )
    ) {
      this.titulo =
        'Productos';

      this.subtitulo =
        'Consulta y administra el catálogo';

      return;
    }

    if (
      url.includes(
        'crear-producto'
      )
    ) {
      this.titulo =
        'Crear producto';

      this.subtitulo =
        'Registra un producto en el catálogo';

      return;
    }

    if (
      url.includes(
        'editar-producto'
      )
    ) {
      this.titulo =
        'Editar producto';

      this.subtitulo =
        'Actualiza la información del producto';

      return;
    }

    if (
      url.includes(
        'lista-tiendas'
      )
    ) {
      this.titulo =
        'Sucursales';

      this.subtitulo =
        'Consulta y administra las sucursales';

      return;
    }

    if (
      url.includes(
        'crear-tienda'
      )
    ) {
      this.titulo =
        'Crear sucursal';

      this.subtitulo =
        'Registra una nueva sucursal';

      return;
    }

    if (
      url.includes(
        'lista-usuarios'
      )
    ) {
      this.titulo =
        'Usuarios';

      this.subtitulo =
        'Consulta y administra las cuentas';

      return;
    }

    if (
      url.includes(
        'crear-usuario'
      )
    ) {
      this.titulo =
        'Crear usuario';

      this.subtitulo =
        'Registra una nueva cuenta';

      return;
    }

    if (
      url.includes(
        'abrir-turno'
      )
    ) {
      this.titulo =
        'Abrir turno';

      this.subtitulo =
        'Inicia las operaciones de caja';

      return;
    }

    if (
      url.includes(
        'cerrar-turno'
      )
    ) {
      this.titulo =
        'Cerrar turno';

      this.subtitulo =
        'Finaliza las operaciones de caja';

      return;
    }

    this.titulo = 'XoXO';

    this.subtitulo =
      this.usuario?.sucursal ||
      'Sistema administrativo';
  }
}