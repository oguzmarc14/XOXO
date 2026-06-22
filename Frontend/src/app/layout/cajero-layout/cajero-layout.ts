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
} from '../../core/models/usuario.model';

import {
  UsuarioActualService
} from '../../core/services/usuario-actual';

import {
  Sidebar
} from '../../shared/components/sidebar/sidebar';

import {
  Topbar
} from '../../shared/components/topbar/topbar';

@Component({
  selector: 'app-cajero-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
  ],
  templateUrl:
    './cajero-layout.html',
  styleUrl:
    './cajero-layout.css'
})
export class CajeroLayout
  implements OnInit, OnDestroy {

  usuario!: Usuario;

  titulo = 'Panel Cajero';

  subtitulo =
    'Operaciones y ventas de la sucursal';

  menuMovilAbierto = false;

  private usuarioSubscription?:
    Subscription;

  private routerSubscription?:
    Subscription;

  constructor(
    private usuarioActualService:
      UsuarioActualService,

    private router: Router
  ) {}

  ngOnInit(): void {
    this.validarSesion();

    this.usuarioSubscription =
      this.usuarioActualService
        .usuario$
        .subscribe((usuario) => {
          this.usuario = usuario;

          this.actualizarEncabezado();
        });

    this.routerSubscription =
      this.router.events
        .pipe(
          filter(
            (evento) =>
              evento instanceof
              NavigationEnd
          )
        )
        .subscribe(() => {
          this.menuMovilAbierto =
            false;

          this.actualizarEncabezado();
        });
  }

  ngOnDestroy(): void {
    this.usuarioSubscription
      ?.unsubscribe();

    this.routerSubscription
      ?.unsubscribe();
  }

  revisarPerfil(): void {
    this.router.navigate([
      '/cajero/perfil'
    ]);
  }

  cerrarSesion(): void {
    this.usuarioActualService
      .cerrarSesion();

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

  private validarSesion(): void {
    const sesionActiva =
      localStorage.getItem(
        'sesionActiva'
      );

    const usuarioActual =
      this.usuarioActualService
        .obtenerUsuario();

    if (
      sesionActiva !== 'true' ||
      !usuarioActual ||
      usuarioActual.id === 0
    ) {
      this.router.navigate([
        '/login'
      ]);

      return;
    }

    if (
      usuarioActual.rol !==
      'cajero'
    ) {
      this.redirigirSegunRol(
        usuarioActual.rol
      );
    }
  }

  private redirigirSegunRol(
    rol: Usuario['rol']
  ): void {
    if (rol === 'admin') {
      this.router.navigate([
        '/admin/inicio'
      ]);

      return;
    }

    if (rol === 'gerente') {
      this.router.navigate([
        '/gerente/inicio'
      ]);

      return;
    }

    this.router.navigate([
      '/cajero/inicio'
    ]);
  }

  private actualizarEncabezado(): void {
    const url = this.router.url;

    if (
      url.includes('/perfil')
    ) {
      this.titulo = 'Mi perfil';

      this.subtitulo =
        'Consulta y actualiza los datos de tu cuenta';

      return;
    }

    if (
      url.includes(
        '/nueva-venta'
      )
    ) {
      this.titulo =
        'Gestión de ventas';

      this.subtitulo =
        'Registra o cancela operaciones de venta';

      return;
    }

    if (
      url.includes(
        '/historial-ventas'
      )
    ) {
      this.titulo =
        'Historial de ventas';

      this.subtitulo =
        'Consulta las operaciones registradas';

      return;
    }

    if (
      url.includes('/inventario')
    ) {
      this.titulo = 'Inventario';

      this.subtitulo =
        'Consulta las existencias disponibles';

      return;
    }

    this.titulo = 'Panel Cajero';

    this.subtitulo =
      this.usuario?.sucursal
        ? `Operaciones · ${this.usuario.sucursal}`
        : 'Operaciones y ventas de la sucursal';
  }
}