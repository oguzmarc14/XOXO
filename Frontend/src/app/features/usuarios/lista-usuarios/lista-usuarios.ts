import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit
} from '@angular/core';
import {
  FormsModule
} from '@angular/forms';
import {
  HttpClient
} from '@angular/common/http';
import {
  Router
} from '@angular/router';

type RolUsuario =
  | 'admin'
  | 'gerente'
  | 'cajero';

type SexoUsuario =
  | 'hombre'
  | 'mujer';

interface TiendaUsuario {
  _id: string;
  nombre: string;
  ciudad?: string;
  direccion?: string;
}

interface UsuarioBackend {
  _id: string;
  nombre: string;
  usuario: string;

  rol:
    | 'ADMIN'
    | 'GERENTE'
    | 'CAJERO'
    | 'admin'
    | 'gerente'
    | 'cajero';

  sexo?:
    | 'HOMBRE'
    | 'MUJER'
    | 'hombre'
    | 'mujer';

  tiendaId?:
    | string
    | TiendaUsuario
    | null;

  activo?: boolean;

  createdAt?: string;
  updatedAt?: string;
}

interface UsuarioVista {
  _id: string;
  nombre: string;
  usuario: string;

  rol: RolUsuario;
  rolTexto: string;

  sexo: SexoUsuario;

  tiendaId: string;
  tiendaTexto: string;

  avatar: string;

  activo: boolean;
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
  usuarios: UsuarioVista[] = [];
  usuariosFiltrados: UsuarioVista[] = [];

  busqueda = '';
  rolSeleccionado = 'todos';
  estadoSeleccionado = 'todos';
  tiendaSeleccionada = 'todas';

  cargando = false;

  mensajeError = '';
  mensajeExito = '';

  usuarioSeleccionado:
    UsuarioVista | null = null;

  modalEliminarAbierto = false;
  modalEstadoAbierto = false;

  private readonly usuariosApi =
    'https://xoxo-backend-ewqr.onrender.com/usuarios';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  get totalUsuarios(): number {
    return this.usuarios.length;
  }

  get totalAdministradores(): number {
    return this.usuarios.filter(
      usuario =>
        usuario.rol === 'admin'
    ).length;
  }

  get totalGerentes(): number {
    return this.usuarios.filter(
      usuario =>
        usuario.rol === 'gerente'
    ).length;
  }

  get totalCajeros(): number {
    return this.usuarios.filter(
      usuario =>
        usuario.rol === 'cajero'
    ).length;
  }

  get tiendasDisponibles(): string[] {
    return [
      ...new Set(
        this.usuarios
          .map(
            usuario =>
              usuario.tiendaTexto
          )
          .filter(
            tienda =>
              tienda !==
              'No requiere tienda'
          )
      )
    ].sort(
      (
        tiendaA,
        tiendaB
      ) =>
        tiendaA.localeCompare(
          tiendaB,
          'es'
        )
    );
  }

  cargarUsuarios(): void {
    this.cargando = true;
    this.mensajeError = '';

    this.http
      .get<UsuarioBackend[]>(
        this.usuariosApi
      )
      .subscribe({
        next: respuesta => {
          const usuarios =
            Array.isArray(respuesta)
              ? respuesta
              : [];

          this.usuarios =
            usuarios.map(
              usuario =>
                this.convertirUsuario(
                  usuario
                )
            );

          this.aplicarFiltros();

          this.cargando = false;
        },

        error: error => {
          console.error(
            'Error al cargar usuarios:',
            error
          );

          this.usuarios = [];
          this.usuariosFiltrados = [];

          this.mensajeError =
            error.error?.message ||
            'No fue posible cargar los usuarios.';

          this.cargando = false;
        }
      });
  }

  aplicarFiltros(): void {
    const texto =
      this.normalizarTexto(
        this.busqueda
      );

    this.usuariosFiltrados =
      this.usuarios.filter(
        usuario => {
          const coincideBusqueda =
            !texto ||
            this.normalizarTexto(
              usuario.nombre
            ).includes(texto) ||
            this.normalizarTexto(
              usuario.usuario
            ).includes(texto) ||
            this.normalizarTexto(
              usuario.rolTexto
            ).includes(texto) ||
            this.normalizarTexto(
              usuario.tiendaTexto
            ).includes(texto);

          const coincideRol =
            this.rolSeleccionado ===
              'todos' ||
            usuario.rol ===
              this.rolSeleccionado;

          const coincideEstado =
            this.estadoSeleccionado ===
              'todos' ||
            (
              this.estadoSeleccionado ===
                'activos' &&
              usuario.activo
            ) ||
            (
              this.estadoSeleccionado ===
                'inactivos' &&
              !usuario.activo
            );

          const coincideTienda =
            this.tiendaSeleccionada ===
              'todas' ||
            usuario.tiendaTexto ===
              this.tiendaSeleccionada;

          return (
            coincideBusqueda &&
            coincideRol &&
            coincideEstado &&
            coincideTienda
          );
        }
      );
  }

  limpiarFiltros(): void {
    this.busqueda = '';
    this.rolSeleccionado = 'todos';
    this.estadoSeleccionado = 'todos';
    this.tiendaSeleccionada = 'todas';

    this.aplicarFiltros();
  }

  crearUsuario(): void {
    this.router.navigate([
      '/crear-usuario'
    ]);
  }

  editarUsuario(
    usuario: UsuarioVista
  ): void {
    this.router.navigate([
      '/editar-usuario',
      usuario._id
    ]);
  }

  abrirCambioEstado(
    usuario: UsuarioVista
  ): void {
    this.usuarioSeleccionado =
      usuario;

    this.modalEstadoAbierto = true;
  }

  cerrarCambioEstado(): void {
    this.modalEstadoAbierto = false;
    this.usuarioSeleccionado = null;
  }

  confirmarCambioEstado(): void {
    if (!this.usuarioSeleccionado) {
      return;
    }

    const usuario =
      this.usuarioSeleccionado;

    const nuevoEstado =
      !usuario.activo;

    this.http
      .put<UsuarioBackend>(
        `${this.usuariosApi}/${usuario._id}`,
        {
          activo:
            nuevoEstado
        }
      )
      .subscribe({
        next: () => {
          usuario.activo =
            nuevoEstado;

          this.aplicarFiltros();
          this.cerrarCambioEstado();

          this.mensajeExito =
            nuevoEstado
              ? 'El usuario fue activado correctamente.'
              : 'El usuario fue desactivado correctamente.';

          this.ocultarMensajes();
        },

        error: error => {
          console.error(
            'Error al cambiar estado:',
            error
          );

          this.cerrarCambioEstado();

          this.mensajeError =
            error.error?.message ||
            'No fue posible cambiar el estado del usuario.';

          this.ocultarMensajes();
        }
      });
  }

  abrirEliminar(
    usuario: UsuarioVista
  ): void {
    this.usuarioSeleccionado =
      usuario;

    this.modalEliminarAbierto =
      true;
  }

  cerrarEliminar(): void {
    this.modalEliminarAbierto =
      false;

    this.usuarioSeleccionado =
      null;
  }

  confirmarEliminar(): void {
    if (!this.usuarioSeleccionado) {
      return;
    }

    const usuario =
      this.usuarioSeleccionado;

    this.http
      .delete<{
        message?: string;
      }>(
        `${this.usuariosApi}/${usuario._id}`
      )
      .subscribe({
        next: () => {
          this.usuarios =
            this.usuarios.filter(
              item =>
                item._id !==
                usuario._id
            );

          this.aplicarFiltros();
          this.cerrarEliminar();

          this.mensajeExito =
            'El usuario fue eliminado correctamente.';

          this.ocultarMensajes();
        },

        error: error => {
          console.error(
            'Error al eliminar usuario:',
            error
          );

          this.cerrarEliminar();

          this.mensajeError =
            error.error?.message ||
            'No fue posible eliminar el usuario.';

          this.ocultarMensajes();
        }
      });
  }

  private convertirUsuario(
    usuario:
      UsuarioBackend
  ): UsuarioVista {
    const rol =
      this.convertirRol(
        usuario.rol
      );

    const sexo =
      this.convertirSexo(
        usuario.sexo
      );

    return {
      _id:
        usuario._id,

      nombre:
        usuario.nombre ||
        'Usuario sin nombre',

      usuario:
        usuario.usuario ||
        'Sin usuario',

      rol,

      rolTexto:
        this.obtenerRolTexto(
          rol,
          sexo
        ),

      sexo,

      tiendaId:
        this.obtenerTiendaId(
          usuario.tiendaId
        ),

      tiendaTexto:
        this.obtenerTiendaTexto(
          rol,
          usuario.tiendaId
        ),

      avatar:
        this.obtenerAvatar(
          rol,
          sexo
        ),

      activo:
        usuario.activo !== false,

      fechaRegistro:
        this.formatearFecha(
          usuario.createdAt
        )
    };
  }

  private convertirRol(
    rol:
      UsuarioBackend['rol']
  ): RolUsuario {
    const rolNormalizado =
      String(rol)
        .toLowerCase();

    if (
      rolNormalizado === 'admin'
    ) {
      return 'admin';
    }

    if (
      rolNormalizado === 'gerente'
    ) {
      return 'gerente';
    }

    return 'cajero';
  }

  private convertirSexo(
    sexo:
      UsuarioBackend['sexo']
  ): SexoUsuario {
    return String(sexo)
      .toLowerCase() === 'mujer'
        ? 'mujer'
        : 'hombre';
  }

  private obtenerRolTexto(
    rol: RolUsuario,
    sexo: SexoUsuario
  ): string {
    if (rol === 'admin') {
      return sexo === 'mujer'
        ? 'Administradora'
        : 'Administrador';
    }

    if (rol === 'gerente') {
      return 'Gerente';
    }

    return sexo === 'mujer'
      ? 'Cajera'
      : 'Cajero';
  }

  private obtenerAvatar(
    rol: RolUsuario,
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

  private obtenerTiendaId(
    tienda:
      UsuarioBackend['tiendaId']
  ): string {
    if (
      typeof tienda === 'string'
    ) {
      return tienda;
    }

    return tienda?._id || '';
  }

  private obtenerTiendaTexto(
    rol: RolUsuario,
    tienda:
      UsuarioBackend['tiendaId']
  ): string {
    if (rol === 'admin') {
      return 'No requiere tienda';
    }

    if (
      tienda &&
      typeof tienda === 'object'
    ) {
      if (
        tienda.nombre &&
        tienda.ciudad
      ) {
        return (
          `${tienda.nombre} - ` +
          `${tienda.ciudad}`
        );
      }

      return (
        tienda.nombre ||
        'Tienda asignada'
      );
    }

    if (
      typeof tienda === 'string' &&
      tienda
    ) {
      return 'Tienda asignada';
    }

    return 'Sin tienda asignada';
  }

  private formatearFecha(
    fecha?: string
  ): string {
    if (!fecha) {
      return 'Sin fecha';
    }

    const fechaConvertida =
      new Date(fecha);

    if (
      Number.isNaN(
        fechaConvertida.getTime()
      )
    ) {
      return 'Sin fecha';
    }

    return new Intl.DateTimeFormat(
      'es-MX',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }
    ).format(
      fechaConvertida
    );
  }

  private normalizarTexto(
    texto: string
  ): string {
    return String(texto || '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(
        /[\u0300-\u036f]/g,
        ''
      );
  }

  private ocultarMensajes(): void {
    setTimeout(() => {
      this.mensajeError = '';
      this.mensajeExito = '';
    }, 2500);
  }
}