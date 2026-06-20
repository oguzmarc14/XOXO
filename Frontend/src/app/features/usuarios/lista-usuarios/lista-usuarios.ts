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
  UserRole
} from '../../../core/models/usuario.model';

type EstadoUsuario =
  | 'activo'
  | 'inactivo';

interface UsuarioListado {
  id: number;
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

  usuarioSeleccionado:
    UsuarioListado | null = null;

  private readonly usuariosBase:
    UsuarioListado[] = [
      {
        id: 1,
        nombre: 'María López',
        sexo: 'mujer',
        correo: 'cajero@xoxo.com',
        rol: 'cajero',
        cargo: 'Cajera',
        sucursal:
          'Sucursal #027 - Centro',
        avatar: '/Cajera.png',
        telefono: '449 123 4561',
        estado: 'activo',
        ultimoAcceso:
          '2026-06-19T10:30:00',
        fechaRegistro:
          '2026-01-15T09:00:00'
      },
      {
        id: 2,
        nombre: 'Laura Hernández',
        sexo: 'mujer',
        correo: 'gerente@xoxo.com',
        rol: 'gerente',
        cargo: 'Gerente',
        sucursal:
          'Sucursal #027 - Centro',
        avatar: '/GerenteF.png',
        telefono: '449 123 4562',
        estado: 'activo',
        ultimoAcceso:
          '2026-06-19T10:18:00',
        fechaRegistro:
          '2026-01-10T11:15:00'
      },
      {
        id: 3,
        nombre: 'Carlos Ramírez',
        sexo: 'hombre',
        correo: 'admin@xoxo.com',
        rol: 'admin',
        cargo: 'Administrador',
        sucursal:
          'Administración general',
        avatar: '/Administrador.png',
        telefono: '449 123 4563',
        estado: 'activo',
        ultimoAcceso:
          '2026-06-19T09:55:00',
        fechaRegistro:
          '2026-01-05T08:30:00'
      },
      {
        id: 4,
        nombre: 'Juan Martínez',
        sexo: 'hombre',
        correo: 'juan.martinez@xoxo.com',
        rol: 'cajero',
        cargo: 'Cajero',
        sucursal:
          'Sucursal #043 - Norte',
        avatar: '/Cajero.png',
        telefono: '449 123 4564',
        estado: 'activo',
        ultimoAcceso:
          '2026-06-18T18:20:00',
        fechaRegistro:
          '2026-02-08T10:00:00'
      },
      {
        id: 5,
        nombre: 'Andrea Torres',
        sexo: 'mujer',
        correo: 'andrea.torres@xoxo.com',
        rol: 'gerente',
        cargo: 'Gerente',
        sucursal:
          'Sucursal #115 - Sur',
        avatar: '/GerenteF.png',
        telefono: '449 123 4565',
        estado: 'activo',
        ultimoAcceso:
          '2026-06-18T17:45:00',
        fechaRegistro:
          '2026-02-14T12:10:00'
      },
      {
        id: 6,
        nombre: 'Roberto Sánchez',
        sexo: 'hombre',
        correo: 'roberto.sanchez@xoxo.com',
        rol: 'gerente',
        cargo: 'Gerente',
        sucursal:
          'Sucursal #043 - Norte',
        avatar: '/GerenteM.png',
        telefono: '449 123 4566',
        estado: 'inactivo',
        ultimoAcceso:
          '2026-05-30T13:25:00',
        fechaRegistro:
          '2026-02-20T09:40:00'
      },
      {
        id: 7,
        nombre: 'Fernanda Ruiz',
        sexo: 'mujer',
        correo: 'fernanda.ruiz@xoxo.com',
        rol: 'cajero',
        cargo: 'Cajera',
        sucursal:
          'Sucursal #115 - Sur',
        avatar: '/Cajera.png',
        telefono: '449 123 4567',
        estado: 'activo',
        ultimoAcceso:
          '2026-06-18T16:15:00',
        fechaRegistro:
          '2026-03-02T14:20:00'
      },
      {
        id: 8,
        nombre: 'Miguel Castillo',
        sexo: 'hombre',
        correo: 'miguel.castillo@xoxo.com',
        rol: 'cajero',
        cargo: 'Cajero',
        sucursal:
          'Sucursal #027 - Centro',
        avatar: '/Cajero.png',
        telefono: '449 123 4568',
        estado: 'inactivo',
        ultimoAcceso:
          '2026-05-22T11:40:00',
        fechaRegistro:
          '2026-03-15T08:55:00'
      }
    ];

  constructor(
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarUsuarios();
    this.aplicarFiltros();
  }

  get totalUsuarios(): number {
    return this.usuarios.length;
  }

  get usuariosActivos(): number {
    return this.usuarios.filter(
      usuario =>
        usuario.estado === 'activo'
    ).length;
  }

  get usuariosInactivos(): number {
    return this.usuarios.filter(
      usuario =>
        usuario.estado === 'inactivo'
    ).length;
  }

  get totalCajeros(): number {
    return this.usuarios.filter(
      usuario =>
        usuario.rol === 'cajero'
    ).length;
  }

  get totalGerentes(): number {
    return this.usuarios.filter(
      usuario =>
        usuario.rol === 'gerente'
    ).length;
  }

  get totalAdministradores(): number {
    return this.usuarios.filter(
      usuario =>
        usuario.rol === 'admin'
    ).length;
  }

  get sucursales(): string[] {
    return [
      ...new Set(
        this.usuarios.map(
          usuario => usuario.sucursal
        )
      )
    ].sort();
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
              usuario.correo
            ).includes(texto) ||
            this.normalizarTexto(
              usuario.cargo
            ).includes(texto) ||
            this.normalizarTexto(
              usuario.sucursal
            ).includes(texto) ||
            this.normalizarTexto(
              usuario.telefono
            ).includes(texto);

          const coincideRol =
            this.rolSeleccionado ===
              'todos' ||
            usuario.rol ===
              this.rolSeleccionado;

          const coincideEstado =
            this.estadoSeleccionado ===
              'todos' ||
            usuario.estado ===
              this.estadoSeleccionado;

          const coincideSucursal =
            this.sucursalSeleccionada ===
              'todas' ||
            usuario.sucursal ===
              this.sucursalSeleccionada;

          return (
            coincideBusqueda &&
            coincideRol &&
            coincideEstado &&
            coincideSucursal
          );
        }
      );
  }

  limpiarFiltros(): void {
    this.busqueda = '';
    this.rolSeleccionado = 'todos';
    this.estadoSeleccionado = 'todos';
    this.sucursalSeleccionada = 'todas';

    this.aplicarFiltros();
  }

  crearUsuario(): void {
    this.router.navigate([
      '/crear-usuario'
    ]);
  }

  editarUsuario(
    usuario: UsuarioListado
  ): void {
    localStorage.setItem(
      'xoxo_usuario_editar',
      JSON.stringify(usuario)
    );

    /*
      Cuando exista el componente de edición,
      aquí podrá navegarse a /editar-usuario.
    */
  }

  cambiarEstado(
    usuario: UsuarioListado
  ): void {
    usuario.estado =
      usuario.estado === 'activo'
        ? 'inactivo'
        : 'activo';

    this.guardarUsuarios();
    this.aplicarFiltros();

    this.mensajeExito =
      usuario.estado === 'activo'
        ? 'El usuario fue activado correctamente.'
        : 'El usuario fue desactivado correctamente.';

    this.ocultarMensaje();
  }

  abrirEliminar(
    usuario: UsuarioListado
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

    this.usuarios =
      this.usuarios.filter(
        usuario =>
          usuario.id !==
          this.usuarioSeleccionado?.id
      );

    this.guardarUsuarios();
    this.aplicarFiltros();

    this.mensajeExito =
      'El usuario fue eliminado correctamente.';

    this.cerrarEliminar();
    this.ocultarMensaje();
  }

  obtenerTextoRol(
    usuario: UsuarioListado
  ): string {
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

  obtenerClaseRol(
    rol: UserRole
  ): string {
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
    const imagen =
      event.target as HTMLImageElement;

    imagen.src =
      this.obtenerAvatar(
        usuario.rol,
        usuario.sexo
      );
  }

  private cargarUsuarios(): void {
    const informacion =
      localStorage.getItem(
        'xoxo_usuarios'
      );

    if (!informacion) {
      this.usuarios = [
        ...this.usuariosBase
      ];

      this.guardarUsuarios();

      return;
    }

    try {
      const usuariosLocales =
        JSON.parse(
          informacion
        ) as UsuarioListado[];

      const mapaUsuarios =
        new Map<
          number,
          UsuarioListado
        >();

      this.usuariosBase.forEach(
        usuario => {
          mapaUsuarios.set(
            usuario.id,
            usuario
          );
        }
      );

      usuariosLocales.forEach(
        usuario => {
          mapaUsuarios.set(
            usuario.id,
            {
              ...usuario,
              avatar:
                usuario.avatar ||
                this.obtenerAvatar(
                  usuario.rol,
                  usuario.sexo
                )
            }
          );
        }
      );

      this.usuarios = [
        ...mapaUsuarios.values()
      ];
    } catch {
      this.usuarios = [
        ...this.usuariosBase
      ];

      this.guardarUsuarios();
    }
  }

  private guardarUsuarios(): void {
    localStorage.setItem(
      'xoxo_usuarios',
      JSON.stringify(
        this.usuarios
      )
    );
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

  private normalizarTexto(
    texto: string
  ): string {
    return texto
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(
        /[\u0300-\u036f]/g,
        ''
      );
  }

  private ocultarMensaje(): void {
    setTimeout(() => {
      this.mensajeExito = '';
    }, 2500);
  }
}