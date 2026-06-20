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

interface UsuarioGuardado {
  id: number;
  nombre: string;
  sexo: SexoUsuario;
  correo: string;
  contrasena: string;
  rol: UserRole;
  cargo: string;
  sucursal: string;
  avatar: string;
  telefono: string;
  estado: EstadoUsuario;
  ultimoAcceso: string;
  fechaRegistro: string;
}

interface TiendaGuardada {
  id: number;
  numero: number;
  nombre: string;
  ciudad: string;
  estadoUbicacion: string;
  estado: 'activa' | 'inactiva';
}

interface OpcionRol {
  valor: UserRole;
  nombre: string;
  descripcion: string;
  icono: string;
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
  sexo: SexoUsuario = 'hombre';
  correo = '';
  telefono = '';

  rol: UserRole = 'cajero';
  cargo = 'Cajero';
  sucursal = '';

  contrasena = '';
  confirmarContrasena = '';

  estado: EstadoUsuario = 'activo';

  mostrarContrasena = false;
  mostrarConfirmacion = false;

  guardando = false;

  mensajeError = '';
  mensajeExito = '';

  sucursales: string[] = [];

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
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarSucursales();
    this.actualizarCargo();
  }

  get avatar(): string {
    return this.obtenerAvatar(
      this.rol,
      this.sexo
    );
  }

  get nombreVistaPrevia(): string {
    return (
      this.nombre.trim() ||
      'Nombre del usuario'
    );
  }

  get correoVistaPrevia(): string {
    return (
      this.correo.trim() ||
      'correo@xoxo.com'
    );
  }

  get telefonoVistaPrevia(): string {
    return (
      this.telefono.trim() ||
      'Teléfono no registrado'
    );
  }

  get sucursalVistaPrevia(): string {
    if (this.rol === 'admin') {
      return 'Administración general';
    }

    return (
      this.sucursal ||
      'Sucursal no asignada'
    );
  }

  get rolTexto(): string {
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

  get contrasenaSegura(): boolean {
    return (
      this.contrasena.length >= 8 &&
      /[A-Z]/.test(this.contrasena) &&
      /[a-z]/.test(this.contrasena) &&
      /\d/.test(this.contrasena)
    );
  }

  seleccionarSexo(
    sexoSeleccionado: SexoUsuario
  ): void {
    this.sexo = sexoSeleccionado;
    this.actualizarCargo();
    this.limpiarMensajes();
  }

  seleccionarRol(
    rolSeleccionado: UserRole
  ): void {
    this.rol = rolSeleccionado;

    if (this.rol === 'admin') {
      this.sucursal =
        'Administración general';
    } else if (
      this.sucursal ===
      'Administración general'
    ) {
      this.sucursal = '';
    }

    this.actualizarCargo();
    this.limpiarMensajes();
  }

  seleccionarEstado(
    estadoSeleccionado: EstadoUsuario
  ): void {
    this.estado = estadoSeleccionado;
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

    const usuarios =
      this.obtenerUsuariosGuardados();

    const correoNormalizado =
      this.correo
        .trim()
        .toLowerCase();

    const correoDuplicado =
      usuarios.some(
        usuario =>
          usuario.correo
            .trim()
            .toLowerCase() ===
          correoNormalizado
      );

    if (correoDuplicado) {
      this.mensajeError =
        'Ya existe un usuario registrado con ese correo.';

      return;
    }

    if (!this.telefono.trim()) {
      this.mensajeError =
        'El teléfono es obligatorio.';

      return;
    }

    const telefonoLimpio =
      this.telefono.replace(
        /\D/g,
        ''
      );

    if (telefonoLimpio.length < 10) {
      this.mensajeError =
        'El teléfono debe contener al menos 10 dígitos.';

      return;
    }

    if (
      this.rol !== 'admin' &&
      !this.sucursal
    ) {
      this.mensajeError =
        'Selecciona la sucursal asignada.';

      return;
    }

    if (!this.contrasena) {
      this.mensajeError =
        'La contraseña es obligatoria.';

      return;
    }

    if (!this.contrasenaSegura) {
      this.mensajeError =
        'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.';

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

    try {
      const ahora =
        new Date().toISOString();

      const nuevoUsuario:
        UsuarioGuardado = {
          id: Date.now(),

          nombre:
            this.nombre.trim(),

          sexo:
            this.sexo,

          correo:
            correoNormalizado,

          contrasena:
            this.contrasena,

          rol:
            this.rol,

          cargo:
            this.cargo,

          sucursal:
            this.rol === 'admin'
              ? 'Administración general'
              : this.sucursal,

          avatar:
            this.avatar,

          telefono:
            this.telefono.trim(),

          estado:
            this.estado,

          ultimoAcceso:
            '',

          fechaRegistro:
            ahora
        };

      const usuariosActualizados = [
        nuevoUsuario,
        ...usuarios
      ];

      localStorage.setItem(
        'xoxo_usuarios',
        JSON.stringify(
          usuariosActualizados
        )
      );

      this.mensajeExito =
        'El usuario se registró correctamente.';

      setTimeout(() => {
        this.router.navigate([
          '/lista-usuarios'
        ]);
      }, 900);
    } catch {
      this.mensajeError =
        'No fue posible registrar el usuario.';
    } finally {
      this.guardando = false;
    }
  }

  limpiarFormulario(): void {
    this.nombre = '';
    this.sexo = 'hombre';
    this.correo = '';
    this.telefono = '';

    this.rol = 'cajero';
    this.cargo = 'Cajero';
    this.sucursal = '';

    this.contrasena = '';
    this.confirmarContrasena = '';

    this.estado = 'activo';

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

  private cargarSucursales(): void {
    const informacion =
      localStorage.getItem(
        'xoxo_tiendas'
      );

    if (!informacion) {
      this.sucursales = [
        'Sucursal #027 - Centro',
        'Sucursal #043 - Norte',
        'Sucursal #115 - Sur'
      ];

      return;
    }

    try {
      const tiendas =
        JSON.parse(
          informacion
        ) as TiendaGuardada[];

      this.sucursales =
        tiendas
          .filter(
            tienda =>
              tienda.estado === 'activa'
          )
          .map(
            tienda =>
              `Sucursal #${String(
                tienda.numero
              ).padStart(3, '0')} - ${this.obtenerNombreCorto(
                tienda.nombre
              )}`
          )
          .sort();

      if (
        this.sucursales.length === 0
      ) {
        this.sucursales = [
          'Sucursal #027 - Centro'
        ];
      }
    } catch {
      this.sucursales = [
        'Sucursal #027 - Centro',
        'Sucursal #043 - Norte',
        'Sucursal #115 - Sur'
      ];
    }
  }

  private actualizarCargo(): void {
    if (this.rol === 'admin') {
      this.cargo =
        this.sexo === 'mujer'
          ? 'Administradora'
          : 'Administrador';

      return;
    }

    if (this.rol === 'gerente') {
      this.cargo = 'Gerente';
      return;
    }

    this.cargo =
      this.sexo === 'mujer'
        ? 'Cajera'
        : 'Cajero';
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

  private obtenerUsuariosGuardados():
    UsuarioGuardado[] {
    const informacion =
      localStorage.getItem(
        'xoxo_usuarios'
      );

    if (!informacion) {
      return [];
    }

    try {
      return JSON.parse(
        informacion
      ) as UsuarioGuardado[];
    } catch {
      return [];
    }
  }

  private obtenerNombreCorto(
    nombre: string
  ): string {
    return nombre
      .replace(
        /^Sucursal\s+/i,
        ''
      )
      .trim();
  }

  private correoValido(
    correo: string
  ): boolean {
    const expresion =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return expresion.test(
      correo.trim()
    );
  }

  private limpiarMensajes(): void {
    this.mensajeError = '';
    this.mensajeExito = '';
  }
}