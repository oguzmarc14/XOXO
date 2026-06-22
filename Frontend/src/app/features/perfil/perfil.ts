import { CommonModule } from '@angular/common';

import {
  Component,
  OnInit
} from '@angular/core';

import {
  FormsModule
} from '@angular/forms';

import {
  Router
} from '@angular/router';

import {
  SexoUsuario,
  Usuario
} from '../../core/models/usuario.model';

import {
  UsuarioActualService
} from '../../core/services/usuario-actual';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css'
})
export class Perfil implements OnInit {
  usuario!: Usuario;

  nombre = '';
  user = '';
  sexo: SexoUsuario = 'hombre';
  cargo = '';
  sucursal = '';
  avatar = '';

  mensajeError = '';
  mensajeExito = '';

  guardando = false;

  constructor(
    private usuarioActualService:
      UsuarioActualService,

    private router:
      Router
  ) {}

  ngOnInit(): void {
    const sesionActiva =
      localStorage.getItem(
        'sesionActiva'
      ) === 'true';

    if (!sesionActiva) {
      this.router.navigate([
        '/login'
      ]);

      return;
    }

    this.cargarUsuarioActual();
  }

  get rolTexto(): string {
    if (!this.usuario) {
      return 'Usuario';
    }

    if (this.usuario.rol === 'admin') {
      return this.sexo === 'mujer'
        ? 'Administradora'
        : 'Administrador';
    }

    if (this.usuario.rol === 'gerente') {
      return 'Gerente';
    }

    return this.sexo === 'mujer'
      ? 'Cajera'
      : 'Cajero';
  }

  get sexoTexto(): string {
    return this.sexo === 'mujer'
      ? 'Mujer'
      : 'Hombre';
  }

  get iniciales(): string {
    const partes =
      this.nombre
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (partes.length === 0) {
      return 'XO';
    }

    if (partes.length === 1) {
      return partes[0]
        .substring(0, 2)
        .toUpperCase();
    }

    return (
      partes[0].charAt(0) +
      partes[1].charAt(0)
    ).toUpperCase();
  }

  cambiarSexo(
    sexoSeleccionado:
      SexoUsuario
  ): void {
    this.sexo =
      sexoSeleccionado;

    this.actualizarVistaPreviaAvatar();

    this.limpiarMensajes();
  }

  guardarCambios(): void {
    this.limpiarMensajes();

    const nombreNormalizado =
      this.nombre.trim();

    const usuarioNormalizado =
      this.user
        .trim()
        .toLowerCase();

    if (!nombreNormalizado) {
      this.mensajeError =
        'El nombre completo es obligatorio.';

      return;
    }

    if (
      nombreNormalizado.length < 3
    ) {
      this.mensajeError =
        'El nombre debe contener al menos 3 caracteres.';

      return;
    }

    if (!usuarioNormalizado) {
      this.mensajeError =
        'El usuario es obligatorio.';

      return;
    }

    if (
      !this.usuarioValido(
        usuarioNormalizado
      )
    ) {
      this.mensajeError =
        'El usuario debe tener al menos 3 caracteres y solo puede contener letras, números, punto, guion o guion bajo.';

      return;
    }

    if (
      this.sexo !== 'hombre' &&
      this.sexo !== 'mujer'
    ) {
      this.mensajeError =
        'Selecciona un sexo válido.';

      return;
    }

    if (!this.cargo.trim()) {
      this.mensajeError =
        'El cargo es obligatorio.';

      return;
    }

    if (!this.sucursal.trim()) {
      this.mensajeError =
        'La sucursal es obligatoria.';

      return;
    }

    this.guardando = true;

    try {
      this.usuario =
        this.usuarioActualService
          .actualizarUsuario({
            nombre:
              nombreNormalizado,

            user:
              usuarioNormalizado,

            sexo:
              this.sexo,

            cargo:
              this.cargo.trim(),

            sucursal:
              this.sucursal.trim()
          });

      this.cargarFormulario();

      this.mensajeExito =
        'Los datos del perfil se actualizaron correctamente.';
    } catch (error) {
      console.error(
        'Error al actualizar el perfil:',
        error
      );

      this.mensajeError =
        'No fue posible actualizar el perfil.';
    } finally {
      this.guardando = false;
    }
  }

  restaurarDatos(): void {
    this.cargarUsuarioActual();
    this.limpiarMensajes();
  }

  volver(): void {
    const ruta =
      this.usuarioActualService
        .obtenerRutaDashboard();

    this.router.navigate([
      ruta
    ]);
  }

  manejarErrorImagen(): void {
    this.avatar =
      this.obtenerAvatarRespaldo();
  }

  private cargarUsuarioActual(): void {
    this.usuario =
      this.usuarioActualService
        .obtenerUsuario();

    if (
      !this.usuario ||
      this.usuario.id === 0
    ) {
      this.router.navigate([
        '/login'
      ]);

      return;
    }

    this.cargarFormulario();
  }

  private cargarFormulario(): void {
    this.nombre =
      this.usuario.nombre || '';

    this.user =
      this.obtenerNombreUsuario(
        this.usuario
      );

    this.sexo =
      this.usuario.sexo ||
      'hombre';

    this.cargo =
      this.usuario.cargo ||
      this.rolTexto;

    this.sucursal =
      this.obtenerNombreSucursal(
        this.usuario.sucursal
      );

    this.actualizarVistaPreviaAvatar();
  }

  private obtenerNombreUsuario(
    usuarioActual: Usuario
  ): string {
    const usuarioFlexible =
      usuarioActual as Usuario & {
        correo?: string;
        usuario?: string;
        user?: string;
      };

    return (
      usuarioFlexible.user ||
      usuarioFlexible.usuario ||
      usuarioFlexible.correo ||
      ''
    );
  }

  private obtenerNombreSucursal(
    sucursalActual: unknown
  ): string {
    if (
      typeof sucursalActual ===
      'string'
    ) {
      return sucursalActual;
    }

    if (
      sucursalActual &&
      typeof sucursalActual ===
      'object'
    ) {
      const tienda =
        sucursalActual as {
          nombre?: string;
          ciudad?: string;
          direccion?: string;
        };

      if (
        tienda.nombre &&
        tienda.ciudad
      ) {
        return (
          `${tienda.nombre} - ` +
          `${tienda.ciudad}`
        );
      }

      if (tienda.nombre) {
        return tienda.nombre;
      }

      if (tienda.direccion) {
        return tienda.direccion;
      }
    }

    if (
      this.usuario?.rol ===
      'admin'
    ) {
      return 'Administración general';
    }

    return 'Sucursal no asignada';
  }

  private actualizarVistaPreviaAvatar():
    void {
    if (!this.usuario) {
      this.avatar =
        this.obtenerAvatarRespaldo();

      return;
    }

    this.avatar =
      this.usuarioActualService
        .obtenerAvatarPorRolYSexo(
          this.usuario.rol,
          this.sexo
        );
  }

  private obtenerAvatarRespaldo():
    string {
    if (!this.usuario) {
      return '/XoXO.png';
    }

    if (
      this.usuario.rol === 'admin'
    ) {
      return this.sexo === 'mujer'
        ? '/Administradora.png'
        : '/Administrador.png';
    }

    if (
      this.usuario.rol ===
      'gerente'
    ) {
      return this.sexo === 'mujer'
        ? '/GerenteF.png'
        : '/GerenteM.png';
    }

    return this.sexo === 'mujer'
      ? '/Cajera.png'
      : '/Cajero.png';
  }

  private usuarioValido(
    nombreUsuario: string
  ): boolean {
    const expresionUsuario =
      /^[a-zA-Z0-9._-]{3,50}$/;

    return expresionUsuario.test(
      nombreUsuario
    );
  }

  private limpiarMensajes(): void {
    this.mensajeError = '';
    this.mensajeExito = '';
  }
}
