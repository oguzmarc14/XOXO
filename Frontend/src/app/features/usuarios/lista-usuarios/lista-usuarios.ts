import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import {
  SexoUsuario,
  UserRole
} from '../../../core/models/usuario.model';

type EstadoUsuario = 'activo' | 'inactivo';

interface UsuarioBackend {
  _id: string;
  nombre: string;
  usuario: string;
  correo?: string;
  telefono?: string;
  sexo?: SexoUsuario;
  password?: string;
  rol: 'ADMIN' | 'GERENTE' | 'CAJERO';
  tiendaId?: {
    _id: string;
    nombre?: string;
    nombreTienda?: string;
    sucursal?: string;
  } | null;
  activo: boolean;
  ultimoAcceso?: string;
  fechaCreacion: string;
}

interface UsuarioListado {
  id: string;
  nombre: string;
  sexo: SexoUsuario;
  correo: string;
  rol: UserRole;
  cargo: string;
  sucursal: string;
  avatar: string;
  telefono: string;
  estado: EstadoUsuario;
  ultimoAcceso: string;
  fechaRegistro: string;
}

@Component({
  selector: 'app-lista-usuarios',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './lista-usuarios.html',
  styleUrl: './lista-usuarios.css'
})
export class ListaUsuarios implements OnInit {
  busqueda = '';

  rolSeleccionado = 'todos';
  estadoSeleccionado = 'todos';
  sucursalSeleccionada = 'todas';

  usuarios: UsuarioListado[] = [];
  usuariosFiltrados: UsuarioListado[] = [];

  mensajeExito = '';
  modalEliminarAbierto = false;

  usuarioSeleccionado: UsuarioListado | null = null;

  private readonly apiUrl = 'http://localhost:3000/usuarios';

  constructor(
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  get totalUsuarios(): number {
    return this.usuarios.length;
  }

  get usuariosActivos(): number {
    return this.usuarios.filter(usuario => usuario.estado === 'activo').length;
  }

  get usuariosInactivos(): number {
    return this.usuarios.filter(usuario => usuario.estado === 'inactivo').length;
  }

  get totalCajeros(): number {
    return this.usuarios.filter(usuario => usuario.rol === 'cajero').length;
  }

  get totalGerentes(): number {
    return this.usuarios.filter(usuario => usuario.rol === 'gerente').length;
  }

  get totalAdministradores(): number {
    return this.usuarios.filter(usuario => usuario.rol === 'admin').length;
  }

  get sucursales(): string[] {
    return [
      ...new Set(
        this.usuarios.map(usuario => usuario.sucursal)
      )
    ].sort();
  }

  aplicarFiltros(): void {
    const texto = this.normalizarTexto(this.busqueda);

    this.usuariosFiltrados = this.usuarios.filter(usuario => {
      const coincideBusqueda =
        !texto ||
        this.normalizarTexto(usuario.nombre).includes(texto) ||
        this.normalizarTexto(usuario.correo).includes(texto) ||
        this.normalizarTexto(usuario.cargo).includes(texto) ||
        this.normalizarTexto(usuario.sucursal).includes(texto) ||
        this.normalizarTexto(usuario.telefono).includes(texto);

      const coincideRol =
        this.rolSeleccionado === 'todos' ||
        usuario.rol === this.rolSeleccionado;

      const coincideEstado =
        this.estadoSeleccionado === 'todos' ||
        usuario.estado === this.estadoSeleccionado;

      const coincideSucursal =
        this.sucursalSeleccionada === 'todas' ||
        usuario.sucursal === this.sucursalSeleccionada;

      return (
        coincideBusqueda &&
        coincideRol &&
        coincideEstado &&
        coincideSucursal
      );
    });
  }

  limpiarFiltros(): void {
    this.busqueda = '';
    this.rolSeleccionado = 'todos';
    this.estadoSeleccionado = 'todos';
    this.sucursalSeleccionada = 'todas';

    this.aplicarFiltros();
  }

  crearUsuario(): void {
    this.router.navigate(['/crear-usuario']);
  }

  editarUsuario(usuario: UsuarioListado): void {
    localStorage.setItem(
      'xoxo_usuario_editar',
      JSON.stringify(usuario)
    );
  }

  cambiarEstado(usuario: UsuarioListado): void {
    usuario.estado =
      usuario.estado === 'activo'
        ? 'inactivo'
        : 'activo';

    this.aplicarFiltros();

    this.mensajeExito =
      usuario.estado === 'activo'
        ? 'El usuario fue activado correctamente.'
        : 'El usuario fue desactivado correctamente.';

    this.ocultarMensaje();
  }

  abrirEliminar(usuario: UsuarioListado): void {
    this.usuarioSeleccionado = usuario;
    this.modalEliminarAbierto = true;
  }

  cerrarEliminar(): void {
    this.modalEliminarAbierto = false;
    this.usuarioSeleccionado = null;
  }

  confirmarEliminar(): void {
    if (!this.usuarioSeleccionado) {
      return;
    }

    this.usuarios = this.usuarios.filter(
      usuario => usuario.id !== this.usuarioSeleccionado?.id
    );

    this.aplicarFiltros();

    this.mensajeExito = 'El usuario fue eliminado correctamente.';

    this.cerrarEliminar();
    this.ocultarMensaje();
  }

  obtenerTextoRol(usuario: UsuarioListado): string {
    if (usuario.rol === 'admin') {
      return usuario.sexo === 'mujer'
        ? 'Administradora'
        : 'Administrador';
    }

    if (usuario.rol === 'gerente') {
      return 'Gerente';
    }

    return usuario.sexo === 'mujer'
      ? 'Cajera'
      : 'Cajero';
  }

  obtenerClaseRol(rol: UserRole): string {
    if (rol === 'admin') {
      return 'admin';
    }

    if (rol === 'gerente') {
      return 'gerente';
    }

    return 'cajero';
  }

  manejarErrorImagen(
    event: Event,
    usuario: UsuarioListado
  ): void {
    const imagen = event.target as HTMLImageElement;

    imagen.src = this.obtenerAvatar(
      usuario.rol,
      usuario.sexo
    );
  }

  private cargarUsuarios(): void {
    this.http.get<UsuarioBackend[]>(this.apiUrl)
      .subscribe({
        next: usuariosBackend => {
          this.usuarios = usuariosBackend.map(usuario =>
            this.mapearUsuarioBackend(usuario)
          );

          this.aplicarFiltros();
        },
        error: error => {
          console.error('Error al cargar usuarios:', error);

          this.usuarios = [];
          this.aplicarFiltros();
        }
      });
  }

  private mapearUsuarioBackend(
    usuario: UsuarioBackend
  ): UsuarioListado {
    const rol = usuario.rol.toLowerCase() as UserRole;

    const sexo: SexoUsuario =
      usuario.sexo || 'hombre';

    return {
      id: usuario._id,
      nombre: usuario.nombre,
      sexo,
      correo: usuario.correo || usuario.usuario,
      rol,
      cargo: this.obtenerCargoDesdeRol(rol),
      sucursal: this.obtenerNombreSucursal(usuario),
      avatar: this.obtenerAvatar(rol, sexo),
      telefono: usuario.telefono || 'Sin teléfono',
      estado: usuario.activo ? 'activo' : 'inactivo',
      ultimoAcceso: usuario.ultimoAcceso || usuario.fechaCreacion,
      fechaRegistro: usuario.fechaCreacion
    };
  }

  private obtenerNombreSucursal(
    usuario: UsuarioBackend
  ): string {
    if (!usuario.tiendaId) {
      return 'Sin sucursal';
    }

    return (
      usuario.tiendaId.nombre ||
      usuario.tiendaId.nombreTienda ||
      usuario.tiendaId.sucursal ||
      'Sucursal asignada'
    );
  }

  private obtenerCargoDesdeRol(rol: UserRole): string {
    if (rol === 'admin') {
      return 'Administrador';
    }

    if (rol === 'gerente') {
      return 'Gerente';
    }

    return 'Cajero';
  }

  private obtenerAvatar(
    rol: UserRole,
    sexo: SexoUsuario
  ): string {
    if (rol === 'admin') {
      return sexo === 'mujer'
        ? '/Administradora.png'
        : '/Administrador.png';
    }

    if (rol === 'gerente') {
      return sexo === 'mujer'
        ? '/GerenteF.png'
        : '/GerenteM.png';
    }

    return sexo === 'mujer'
      ? '/Cajera.png'
      : '/Cajero.png';
  }

  private normalizarTexto(texto: string): string {
    return texto
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  private ocultarMensaje(): void {
    setTimeout(() => {
      this.mensajeExito = '';
    }, 2500);
  }
}