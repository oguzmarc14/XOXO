import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  Router,
  RouterLink
} from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface UsuarioBackend {
  _id: string;
  nombre: string;
  usuario: string;
  rol: string;
}

interface TiendaBackend {
  _id: string;
  nombre: string;
  direccion: string;
  ciudad: string;
  telefono: string;
}

@Component({
  selector: 'app-abrir-turno',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './abrir-turno.html',
  styleUrl: './abrir-turno.css'
})
export class AbrirTurno implements OnInit {
  usuarioId = '';
  tiendaId = '';
  numeroCaja: number | null = null;
  montoInicial: number | null = null;

  usuarios: UsuarioBackend[] = [];
  tiendas: TiendaBackend[] = [];

  mensajeError = '';
  mensajeExito = '';

  enviando = false;
  fechaActual = new Date();

  private readonly usuariosApi = 'http://localhost:3000/usuarios';
  private readonly tiendasApi = 'http://localhost:3000/tiendas';
  private readonly turnosApi = 'http://localhost:3000/turnos';

  constructor(
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.cargarUsuarios();
    this.cargarTiendas();
  }

  get rolActual(): string {
    return localStorage.getItem('rol') || 'cajero';
  }

  get dashboardRuta(): string {
    if (this.rolActual === 'admin') {
      return '/dashboard-admin';
    }

    if (this.rolActual === 'gerente') {
      return '/dashboard-gerente';
    }

    return '/dashboard-cajero';
  }

  cargarUsuarios(): void {
    this.http.get<UsuarioBackend[]>(this.usuariosApi)
      .subscribe({
        next: usuarios => {
          this.usuarios = usuarios;
        },
        error: error => {
          console.error('Error al cargar usuarios:', error);
          this.mensajeError = 'No fue posible cargar los usuarios.';
        }
      });
  }

  cargarTiendas(): void {
    this.http.get<TiendaBackend[]>(this.tiendasApi)
      .subscribe({
        next: tiendas => {
          this.tiendas = tiendas;
        },
        error: error => {
          console.error('Error al cargar tiendas:', error);
          this.mensajeError = 'No fue posible cargar las tiendas.';
        }
      });
  }

  abrirTurno(): void {
    this.limpiarMensajes();

    if (!this.usuarioId) {
      this.mensajeError = 'Selecciona un usuario.';
      return;
    }

    if (!this.tiendaId) {
      this.mensajeError = 'Selecciona una tienda.';
      return;
    }

    if (
      this.numeroCaja === null ||
      this.numeroCaja === undefined ||
      Number(this.numeroCaja) <= 0
    ) {
      this.mensajeError = 'Ingresa un número de caja válido.';
      return;
    }

    if (
      this.montoInicial === null ||
      this.montoInicial === undefined
    ) {
      this.mensajeError = 'Ingresa el monto inicial de caja.';
      return;
    }

    if (Number(this.montoInicial) < 0) {
      this.mensajeError = 'El monto inicial no puede ser negativo.';
      return;
    }

    this.enviando = true;

    const nuevoTurno = {
      usuarioId: this.usuarioId,
      tiendaId: this.tiendaId,
      numeroCaja: Number(this.numeroCaja),
      montoInicial: Number(this.montoInicial)
    };

    this.http.post(`${this.turnosApi}/abrir`, nuevoTurno)
      .subscribe({
        next: () => {
          this.mensajeExito = 'El turno se abrió correctamente.';

          setTimeout(() => {
            this.router.navigate([this.dashboardRuta]);
          }, 900);
        },
        error: error => {
          console.error('Error al abrir turno:', error);

          this.mensajeError =
            error.error?.message ||
            'No fue posible abrir el turno.';

          this.enviando = false;
        },
        complete: () => {
          this.enviando = false;
        }
      });
  }

  private limpiarMensajes(): void {
    this.mensajeError = '';
    this.mensajeExito = '';
  }
}