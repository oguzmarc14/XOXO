import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

type UserRole =
  | 'cajero'
  | 'gerente'
  | 'admin';

interface OpcionRol {
  valor: UserRole;
  nombre: string;
  descripcion: string;
  icono: string;
}

interface TiendaBackend {
  _id: string;
  nombre: string;
  direccion: string;
  ciudad: string;
  telefono: string;
}

@Component({
  selector: 'app-crear-usuario',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './crear-usuario.html',
  styleUrl: './crear-usuario.css'
})
export class CrearUsuario implements OnInit {
  nombre = '';
  usuario = '';
  tiendaId = '';

  rol: UserRole = 'cajero';

  contrasena = '';
  confirmarContrasena = '';

  mostrarContrasena = false;
  mostrarConfirmacion = false;

  guardando = false;
  cargandoTiendas = false;

  mensajeError = '';
  mensajeExito = '';

  tiendas: TiendaBackend[] = [];

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
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.cargarTiendas();
  }

  get cargo(): string {
    if (this.rol === 'admin') {
      return 'Administrador';
    }

    if (this.rol === 'gerente') {
      return 'Gerente';
    }

    return 'Cajero';
  }

  get avatar(): string {
    if (this.rol === 'admin') {
      return '/Administrador.png';
    }

    if (this.rol === 'gerente') {
      return '/GerenteM.png';
    }

    return '/Cajero.png';
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
    if (this.rol === 'admin') {
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

    return (
      `${tienda.nombre} - ` +
      `${tienda.ciudad}`
    );
  }

  get rolTexto(): string {
    return this.cargo;
  }

  seleccionarRol(
    rolSeleccionado: UserRole
  ): void {
    this.rol = rolSeleccionado;

    /*
      Si cambia a administrador,
      se elimina cualquier tienda
      seleccionada anteriormente.
    */
    if (this.rol === 'admin') {
      this.tiendaId = '';
    }

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

  cargarTiendas(): void {
    this.cargandoTiendas = true;

    this.http
      .get<TiendaBackend[]>(
        this.tiendasApi
      )
      .subscribe({
        next: tiendas => {
          this.tiendas = tiendas;
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

  guardarUsuario(): void {
    this.limpiarMensajes();

    if (!this.nombre.trim()) {
      this.mensajeError =
        'El nombre completo es obligatorio.';

      return;
    }

    if (
      this.nombre.trim().length < 3
    ) {
      this.mensajeError =
        'El nombre debe contener al menos 3 caracteres.';

      return;
    }

    if (!this.usuario.trim()) {
      this.mensajeError =
        'El usuario es obligatorio.';

      return;
    }

    if (
      this.usuario.trim().length < 3
    ) {
      this.mensajeError =
        'El usuario debe contener al menos 3 caracteres.';

      return;
    }

    /*
      La tienda solo es obligatoria
      para gerente y cajero.
    */
    if (
      this.rol !== 'admin' &&
      !this.tiendaId
    ) {
      this.mensajeError =
        'Selecciona la tienda asignada.';

      return;
    }

    if (!this.contrasena) {
      this.mensajeError =
        'La contraseña es obligatoria.';

      return;
    }

    if (
      this.contrasena.length < 4
    ) {
      this.mensajeError =
        'La contraseña debe tener al menos 4 caracteres.';

      return;
    }

    if (
      this.contrasena !==
      this.confirmarContrasena
    ) {
      this.mensajeError =
        'Las contraseñas no coinciden.';

      return;
    }

    this.guardando = true;

    /*
      Para administrador no se agrega
      tiendaId al objeto enviado.
    */
    const usuarioNuevo = {
      nombre:
        this.nombre.trim(),

      usuario:
        this.usuario
          .trim()
          .toLowerCase(),

      password:
        this.contrasena,

      rol:
        this.rol.toUpperCase(),

      ...(
        this.rol !== 'admin'
          ? {
              tiendaId:
                this.tiendaId
            }
          : {}
      )
    };

    this.http
      .post(
        this.usuariosApi,
        usuarioNuevo
      )
      .subscribe({
        next: () => {
          this.mensajeExito =
            'El usuario se registró correctamente.';

          setTimeout(() => {
            this.router.navigate([
              '/lista-usuarios'
            ]);
          }, 900);
        },

        error: error => {
          console.error(
            'Error al crear usuario:',
            error
          );

          this.mensajeError =
            error.error?.message ||
            'No fue posible registrar el usuario.';

          this.guardando = false;
        },

        complete: () => {
          this.guardando = false;
        }
      });
  }

  limpiarFormulario(): void {
    this.nombre = '';
    this.usuario = '';
    this.tiendaId = '';
    this.rol = 'cajero';
    this.contrasena = '';
    this.confirmarContrasena = '';
    this.mostrarContrasena = false;
    this.mostrarConfirmacion = false;

    this.limpiarMensajes();
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

  private limpiarMensajes(): void {
    this.mensajeError = '';
    this.mensajeExito = '';
  }
}
