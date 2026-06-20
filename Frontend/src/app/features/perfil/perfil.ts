
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
  correo = '';
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
      this.router.navigate(['/login']);
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

    this.mensajeError = '';
    this.mensajeExito = '';
  }

  guardarCambios(): void {
    this.mensajeError = '';
    this.mensajeExito = '';

    if (!this.nombre.trim()) {
      this.mensajeError =
        'El nombre completo es obligatorio.';

      return;
    }

    if (
      this.nombre
        .trim()
        .length < 3
    ) {
      this.mensajeError =
        'El nombre debe contener al menos 3 caracteres.';

      return;
    }

    if (!this.correo.trim()) {
      this.mensajeError =
        'El correo electrónico es obligatorio.';

      return;
    }

    if (!this.correoValido(this.correo)) {
      this.mensajeError =
        'Ingresa un correo electrónico válido.';

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
              this.nombre.trim(),

            correo:
              this.correo
                .trim()
                .toLowerCase(),

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
    } catch {
      this.mensajeError =
        'No fue posible actualizar el perfil.';
    } finally {
      this.guardando = false;
    }
  }

  restaurarDatos(): void {
    this.cargarUsuarioActual();

    this.mensajeError = '';
    this.mensajeExito = '';
  }

  volver(): void {
    const ruta =
      this.usuarioActualService
        .obtenerRutaDashboard();

    this.router.navigate([ruta]);
  }

  manejarErrorImagen(): void {
    this.actualizarVistaPreviaAvatar();
  }

  private cargarUsuarioActual(): void {
    this.usuario =
      this.usuarioActualService
        .obtenerUsuario();

    this.cargarFormulario();
  }

  private cargarFormulario(): void {
    this.nombre =
      this.usuario.nombre;

    this.correo =
      this.usuario.correo;

    this.sexo =
      this.usuario.sexo;

    this.cargo =
      this.usuario.cargo;

    this.sucursal =
      this.usuario.sucursal;

    this.actualizarVistaPreviaAvatar();
  }

  private actualizarVistaPreviaAvatar():
    void {
    if (!this.usuario) {
      this.avatar = '/Cajero.png';
      return;
    }

    this.avatar =
      this.usuarioActualService
        .obtenerAvatarPorRolYSexo(
          this.usuario.rol,
          this.sexo
        );
  }

  private correoValido(
    correo: string
  ): boolean {
    const expresionCorreo =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return expresionCorreo.test(
      correo.trim()
    );
  }
}

