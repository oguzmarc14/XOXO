import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

type UserRole = 'cajero' | 'gerente' | 'admin';

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
export class CrearUsuario {
  nombre = '';
  usuario = '';
  tiendaId = '';

  rol: UserRole = 'cajero';

  contrasena = '';
  confirmarContrasena = '';

  mostrarContrasena = false;
  mostrarConfirmacion = false;

  guardando = false;

  mensajeError = '';
  mensajeExito = '';

  private readonly apiUrl = 'http://localhost:3000/usuarios';

  readonly roles: OpcionRol[] = [
    {
      valor: 'cajero',
      nombre: 'Cajero',
      descripcion: 'Registra ventas y administra su turno.',
      icono: '🧾'
    },
    {
      valor: 'gerente',
      nombre: 'Gerente',
      descripcion: 'Supervisa la sucursal y sus operaciones.',
      icono: '🏪'
    },
    {
      valor: 'admin',
      nombre: 'Administrador',
      descripcion: 'Administra usuarios, tiendas y catálogo.',
      icono: '🛡️'
    }
  ];

  constructor(
    private router: Router,
    private http: HttpClient
  ) {}

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
    return this.nombre.trim() || 'Nombre del usuario';
  }

  get usuarioVistaPrevia(): string {
    return this.usuario.trim() || 'usuario';
  }

  get tiendaVistaPrevia(): string {
    if (this.rol === 'admin') {
      return 'Sin tienda';
    }

    return this.tiendaId.trim() || 'Sin tienda asignada';
  }

  get rolTexto(): string {
    return this.cargo;
  }

  get contrasenaSegura(): boolean {
    return (
      this.contrasena.length >= 8 &&
      /[A-Z]/.test(this.contrasena) &&
      /[a-z]/.test(this.contrasena) &&
      /\d/.test(this.contrasena)
    );
  }

  seleccionarRol(rolSeleccionado: UserRole): void {
    this.rol = rolSeleccionado;

    if (this.rol === 'admin') {
      this.tiendaId = '';
    }

    this.limpiarMensajes();
  }

  alternarContrasena(): void {
    this.mostrarContrasena = !this.mostrarContrasena;
  }

  alternarConfirmacion(): void {
    this.mostrarConfirmacion = !this.mostrarConfirmacion;
  }

  guardarUsuario(): void {
    this.limpiarMensajes();

    if (!this.nombre.trim()) {
      this.mensajeError = 'El nombre completo es obligatorio.';
      return;
    }

    if (this.nombre.trim().length < 3) {
      this.mensajeError = 'El nombre debe contener al menos 3 caracteres.';
      return;
    }

    if (!this.usuario.trim()) {
      this.mensajeError = 'El usuario es obligatorio.';
      return;
    }

    if (this.usuario.trim().length < 3) {
      this.mensajeError = 'El usuario debe contener al menos 3 caracteres.';
      return;
    }

    if (!this.contrasena) {
      this.mensajeError = 'La contraseña es obligatoria.';
      return;
    }

    if (!this.contrasenaSegura) {
      this.mensajeError =
        'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.';
      return;
    }

    if (this.contrasena !== this.confirmarContrasena) {
      this.mensajeError = 'Las contraseñas no coinciden.';
      return;
    }

    this.guardando = true;

    const usuarioNuevo = {
      nombre: this.nombre.trim(),
      usuario: this.usuario.trim().toLowerCase(),
      password: this.contrasena,
      rol: this.rol.toUpperCase(),
      tiendaId:
        this.rol === 'admin' || !this.tiendaId.trim()
          ? undefined
          : this.tiendaId.trim()
    };

    this.http.post(this.apiUrl, usuarioNuevo)
      .subscribe({
        next: () => {
          this.mensajeExito = 'El usuario se registró correctamente.';

          setTimeout(() => {
            this.router.navigate(['/lista-usuarios']);
          }, 900);
        },
        error: error => {
          console.error('Error al crear usuario:', error);

          this.mensajeError =
            error.error?.message ||
            'No fue posible registrar el usuario.';
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
    this.router.navigate(['/lista-usuarios']);
  }

  manejarErrorImagen(event: Event): void {
    const imagen = event.target as HTMLImageElement;
    imagen.src = '/XoXO.png';
  }

  private limpiarMensajes(): void {
    this.mensajeError = '';
    this.mensajeExito = '';
  }
}