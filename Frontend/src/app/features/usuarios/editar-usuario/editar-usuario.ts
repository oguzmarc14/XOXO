import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  HttpClient
} from '@angular/common/http';
import {
  ActivatedRoute,
  Router
} from '@angular/router';

type RolUsuario =
  | 'admin'
  | 'gerente'
  | 'cajero';

type SexoUsuario =
  | 'hombre'
  | 'mujer';

interface Tienda {
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
    | Tienda
    | null;

  activo?: boolean;
}

interface OpcionRol {
  valor: RolUsuario;
  nombre: string;
  descripcion: string;
  icono: string;
}

@Component({
  selector: 'app-editar-usuario',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './editar-usuario.html',

  /*
    Reutiliza el diseño de Crear usuario.
    editar-usuario.css queda disponible
    para pequeños ajustes particulares.
  */
  styleUrls: [
    '../crear-usuario/crear-usuario.css',
    './editar-usuario.css'
  ]
})
export class EditarUsuario implements OnInit {
  usuarioId = '';

  nombre = '';
  usuario = '';

  rol: RolUsuario = 'cajero';
  sexo: SexoUsuario = 'hombre';

  tiendaId = '';

  nuevaContrasena = '';
  confirmarContrasena = '';

  mostrarContrasena = false;
  mostrarConfirmacion = false;

  tiendas: Tienda[] = [];

  cargandoUsuario = true;
  cargandoTiendas = false;
  guardando = false;

  usuarioEncontrado = false;

  mensajeError = '';
  mensajeExito = '';

  private readonly usuariosApi =
    'http://localhost:3000/usuarios';

  private readonly tiendasApi =
    'http://localhost:3000/tiendas';

  readonly roles: OpcionRol[] = [
    {
      valor: 'cajero',
      nombre: 'Cajero',
      descripcion:
        'Registra ventas y administra su turno.',
      icono: '🧾'
    },
    {
      valor: 'gerente',
      nombre: 'Gerente',
      descripcion:
        'Supervisa la sucursal y sus operaciones.',
      icono: '🏪'
    },
    {
      valor: 'admin',
      nombre: 'Administrador',
      descripcion:
        'Administra usuarios, tiendas y catálogo.',
      icono: '🛡️'
    }
  ];

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id =
      this.route.snapshot
        .paramMap
        .get('id');

    if (!id) {
      this.cargandoUsuario = false;

      this.mensajeError =
        'No se recibió el identificador del usuario.';

      return;
    }

    this.usuarioId = id;

    this.cargarTiendas();
    this.cargarUsuario();
  }

  get esAdministrador(): boolean {
    return this.rol === 'admin';
  }

  get cargo(): string {
    if (this.rol === 'admin') {
      return this.sexo === 'mujer'
        ? 'Administradora'
        : 'Administrador';
    }

    if (this.rol === 'gerente') {
      return 'Gerente';
    }

    return this.sexo === 'mujer'
      ? 'Cajera'
      : 'Cajero';
  }

  get rolTexto(): string {
    return this.cargo;
  }

  get sexoTexto(): string {
    return this.sexo === 'mujer'
      ? 'Mujer'
      : 'Hombre';
  }

  get avatar(): string {
    if (this.rol === 'admin') {
      return this.sexo === 'mujer'
        ? '/Administradora.png'
        : '/Administrador.png';
    }

    if (this.rol === 'gerente') {
      return this.sexo === 'mujer'
        ? '/GerenteF.png'
        : '/GerenteM.png';
    }

    return this.sexo === 'mujer'
      ? '/Cajera.png'
      : '/Cajero.png';
  }

  get nombreVistaPrevia(): string {
    return (
      this.nombre.trim() ||
      'Nombre del usuario'
    );
  }

  get usuarioVistaPrevia(): string {
    return (
      this.usuario.trim() ||
      'usuario'
    );
  }

  get tiendaVistaPrevia(): string {
    if (this.esAdministrador) {
      return 'No requiere tienda';
    }

    const tienda =
      this.tiendas.find(
        item =>
          item._id === this.tiendaId
      );

    if (!tienda) {
      return 'Tienda no seleccionada';
    }

    return tienda.ciudad
      ? `${tienda.nombre} - ${tienda.ciudad}`
      : tienda.nombre;
  }

  seleccionarRol(
    rolSeleccionado: RolUsuario
  ): void {
    this.rol = rolSeleccionado;

    if (this.esAdministrador) {
      /*
        Se limpia la tienda al convertir
        un usuario en administrador.
      */
      this.tiendaId = '';
    }

    this.limpiarMensajes();
  }

  cambiarSexo(
    sexoSeleccionado: SexoUsuario
  ): void {
    this.sexo = sexoSeleccionado;
    this.limpiarMensajes();
  }

  alternarContrasena(): void {
    this.mostrarContrasena =
      !this.mostrarContrasena;
  }

  alternarConfirmacion(): void {
    this.mostrarConfirmacion =
      !this.mostrarConfirmacion;
  }

  guardarCambios(): void {
    this.limpiarMensajes();

    const nombre =
      this.nombre.trim();

    const usuario =
      this.usuario
        .trim()
        .toLowerCase();

    if (nombre.length < 3) {
      this.mensajeError =
        'El nombre debe contener al menos 3 caracteres.';

      return;
    }

    if (
      !/^[a-zA-Z0-9._-]{3,50}$/
        .test(usuario)
    ) {
      this.mensajeError =
        'El usuario debe tener al menos 3 caracteres y solo puede contener letras, números, punto, guion o guion bajo.';

      return;
    }

    if (
      !this.esAdministrador &&
      !this.tiendaId
    ) {
      this.mensajeError =
        'Selecciona una tienda para el usuario.';

      return;
    }

    if (
      this.nuevaContrasena &&
      this.nuevaContrasena.length < 4
    ) {
      this.mensajeError =
        'La nueva contraseña debe tener al menos 4 caracteres.';

      return;
    }

    if (
      this.nuevaContrasena !==
      this.confirmarContrasena
    ) {
      this.mensajeError =
        'Las contraseñas no coinciden.';

      return;
    }

    const datosActualizados: {
      nombre: string;
      usuario: string;
      rol: string;
      sexo: string;
      tiendaId: string | null;
      password?: string;
    } = {
      nombre,
      usuario,

      rol:
        this.rol.toUpperCase(),

      sexo:
        this.sexo.toUpperCase(),

      /*
        Al cambiar a administrador se envía null
        para eliminar una tienda anterior.
      */
      tiendaId:
        this.esAdministrador
          ? null
          : this.tiendaId
    };

    /*
      La contraseña solamente se envía cuando
      el administrador escribió una nueva.
    */
    if (this.nuevaContrasena) {
      datosActualizados.password =
        this.nuevaContrasena;
    }

    this.guardando = true;

    this.http
      .put<UsuarioBackend>(
        `${this.usuariosApi}/${this.usuarioId}`,
        datosActualizados
      )
      .subscribe({
        next: () => {
          this.mensajeExito =
            'El usuario se actualizó correctamente.';

          setTimeout(() => {
            this.router.navigate([
              '/lista-usuarios'
            ]);
          }, 900);
        },

        error: error => {
          console.error(
            'Error al actualizar usuario:',
            error
          );

          this.mensajeError =
            error.error?.message ||
            'No fue posible actualizar el usuario.';

          this.guardando = false;
        },

        complete: () => {
          this.guardando = false;
        }
      });
  }

  volverAlListado(): void {
    this.router.navigate([
      '/lista-usuarios'
    ]);
  }

  manejarErrorImagen(
    event: Event
  ): void {
    const imagen =
      event.target as HTMLImageElement;

    imagen.src = '/XoXO.png';
  }

  private cargarUsuario(): void {
    this.cargandoUsuario = true;

    this.http
      .get<UsuarioBackend>(
        `${this.usuariosApi}/${this.usuarioId}`
      )
      .subscribe({
        next: usuario => {
          this.nombre =
            usuario.nombre || '';

          this.usuario =
            usuario.usuario || '';

          this.rol =
            this.convertirRol(
              usuario.rol
            );

          this.sexo =
            this.convertirSexo(
              usuario.sexo
            );

          this.tiendaId =
            this.obtenerTiendaId(
              usuario.tiendaId
            );

          /*
            Un administrador no conserva tienda,
            incluso si un registro antiguo la tenía.
          */
          if (this.esAdministrador) {
            this.tiendaId = '';
          }

          this.usuarioEncontrado = true;
          this.cargandoUsuario = false;
        },

        error: error => {
          console.error(
            'Error al cargar usuario:',
            error
          );

          this.usuarioEncontrado = false;

          this.mensajeError =
            error.error?.message ||
            'No fue posible cargar el usuario.';

          this.cargandoUsuario = false;
        }
      });
  }

  private cargarTiendas(): void {
    this.cargandoTiendas = true;

    this.http
      .get<Tienda[]>(
        this.tiendasApi
      )
      .subscribe({
        next: tiendas => {
          this.tiendas =
            Array.isArray(tiendas)
              ? tiendas
              : [];

          this.cargandoTiendas = false;
        },

        error: error => {
          console.error(
            'Error al cargar tiendas:',
            error
          );

          this.mensajeError =
            'No fue posible cargar las tiendas.';

          this.cargandoTiendas = false;
        }
      });
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

  private limpiarMensajes(): void {
    this.mensajeError = '';
    this.mensajeExito = '';
  }
}
