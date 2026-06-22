import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

type UserRole = 'admin' | 'gerente' | 'cajero';
type EstadoUsuario = 'activo' | 'inactivo';

interface TiendaBackend {
  _id: string;
  nombre: string;
  direccion?: string;
  ciudad?: string;
  telefono?: string;
}

interface UsuarioBackend {
  _id: string;
  nombre: string;
  usuario: string;
  password?: string;
  rol: 'ADMIN' | 'GERENTE' | 'CAJERO';
  tiendaId?: TiendaBackend | string | null;
  activo: boolean;
  fechaCreacion: string;
}

interface UsuarioListado {
  id: string;
  nombre: string;
  usuario: string;
  rol: UserRole;
  cargo: string;
  tienda: string;
  tiendaId: string;
  estado: EstadoUsuario;
  fechaRegistro: string;
  avatar: string;
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
  tiendaSeleccionada = 'todas';

  usuarios: UsuarioListado[] = [];
  usuariosFiltrados: UsuarioListado[] = [];

  mensajeExito = '';
  mensajeError = '';

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

  get tiendas(): string[] {
    return [
      ...new Set(
        this.usuarios.map(usuario => usuario.tienda)
      )
    ].sort();
  }

  aplicarFiltros(): void {
    const texto = this.normalizarTexto(this.busqueda);

    this.usuariosFiltrados = this.usuarios.filter(usuario => {
      const coincideBusqueda =
        !texto ||
        this.normalizarTexto(usuario.nombre).includes(texto) ||
        this.normalizarTexto(usuario.usuario).includes(texto) ||
        this.normalizarTexto(usuario.cargo).includes(texto) ||
        this.normalizarTexto(usuario.tienda).includes(texto);

      const coincideRol =
        this.rolSeleccionado === 'todos' ||
        usuario.rol === this.rolSeleccionado;

      const coincideEstado =
        this.estadoSeleccionado === 'todos' ||
        usuario.estado === this.estadoSeleccionado;

      const coincideTienda =
        this.tiendaSeleccionada === 'todas' ||
        usuario.tienda === this.tiendaSeleccionada;

      return (
        coincideBusqueda &&
        coincideRol &&
        coincideEstado &&
        coincideTienda
      );
    });
  }

  limpiarFiltros(): void {
    this.busqueda = '';
    this.rolSeleccionado = 'todos';
    this.estadoSeleccionado = 'todos';
    this.tiendaSeleccionada = 'todas';

    this.aplicarFiltros();
  }

  crearUsuario(): void {
    this.router.navigate(['/crear-usuario']);
  }

  editarUsuario(usuario: UsuarioListado): void {
    this.router.navigate(['/editar-usuario', usuario.id]);
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
      return 'Administrador';
    }

    if (usuario.rol === 'gerente') {
      return 'Gerente';
    }

    return 'Cajero';
  }

  obtenerClaseRol(rol: UserRole): string {
    return rol;
  }

  manejarErrorImagen(
    event: Event,
    usuario: UsuarioListado
  ): void {
    const imagen = event.target as HTMLImageElement;
    imagen.src = usuario.avatar;
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

          this.mensajeError =
            error.error?.message ||
            'No fue posible cargar los usuarios.';

          this.usuarios = [];
          this.aplicarFiltros();
        }
      });
  }

  private mapearUsuarioBackend(
    usuario: UsuarioBackend
  ): UsuarioListado {
    const rol = usuario.rol.toLowerCase() as UserRole;

    return {
      id: usuario._id,
      nombre: usuario.nombre,
      usuario: usuario.usuario,
      rol,
      cargo: this.obtenerCargoDesdeRol(rol),
      tienda: this.obtenerNombreTienda(usuario.tiendaId),
      tiendaId: this.obtenerIdTienda(usuario.tiendaId),
      estado: usuario.activo ? 'activo' : 'inactivo',
      fechaRegistro: usuario.fechaCreacion,
      avatar: this.obtenerAvatar(rol)
    };
  }

  private obtenerNombreTienda(
    tienda: TiendaBackend | string | null | undefined
  ): string {
    if (!tienda) {
      return 'Sin tienda';
    }

    if (typeof tienda === 'string') {
      return tienda;
    }

    return tienda.ciudad
      ? `${tienda.nombre} - ${tienda.ciudad}`
      : tienda.nombre;
  }

  private obtenerIdTienda(
    tienda: TiendaBackend | string | null | undefined
  ): string {
    if (!tienda) {
      return '';
    }

    if (typeof tienda === 'string') {
      return tienda;
    }

    return tienda._id;
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

  private obtenerAvatar(rol: UserRole): string {
    if (rol === 'admin') {
      return '/Administrador.png';
    }

    if (rol === 'gerente') {
      return '/GerenteM.png';
    }

    return '/Cajero.png';
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
      this.mensajeError = '';
    }, 2500);
  }
}