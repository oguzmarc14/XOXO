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

interface TiendaBackend {
  _id: string;
  nombre: string;
  direccion: string;
  ciudad: string;
  telefono: string;
}

interface UsuarioPopulado {
  _id: string;
  nombre: string;
  usuario: string;
  rol: string;
}

interface TurnoBackend {
  _id: string;
  tiendaId: string;
  usuarioId: UsuarioPopulado;
  numeroCaja: number;
  montoInicial: number;
  montoFinal: number;
  estado: 'ABIERTO' | 'CERRADO';
  fechaApertura: string;
  fechaCierre?: string;
}

@Component({
  selector: 'app-cerrar-turno',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './cerrar-turno.html',
  styleUrl: './cerrar-turno.css'
})
export class CerrarTurno implements OnInit {
  tiendaId = '';
  turnoId = '';
  montoFinal: number | null = null;
  confirmacion = false;

  tiendas: TiendaBackend[] = [];
  turnosAbiertos: TurnoBackend[] = [];
  turnoSeleccionado: TurnoBackend | null = null;

  mensajeError = '';
  mensajeExito = '';
  enviando = false;
  cargandoTurnos = false;

  private readonly tiendasApi = 'http://localhost:3000/tiendas';
  private readonly turnosApi = 'http://localhost:3000/turnos';

  constructor(
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
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

  cargarTurnosAbiertos(): void {
    this.limpiarMensajes();
    this.turnosAbiertos = [];
    this.turnoSeleccionado = null;
    this.turnoId = '';

    if (!this.tiendaId) {
      return;
    }

    this.cargandoTurnos = true;

    this.http.get<TurnoBackend[]>(`${this.turnosApi}/abiertos/${this.tiendaId}`)
      .subscribe({
        next: turnos => {
          this.turnosAbiertos = turnos;
          this.cargandoTurnos = false;

          if (turnos.length === 0) {
            this.mensajeError = 'No hay turnos abiertos en esta tienda.';
          }
        },
        error: error => {
          console.error('Error al cargar turnos abiertos:', error);
          this.mensajeError = 'No fue posible cargar los turnos abiertos.';
          this.cargandoTurnos = false;
        }
      });
  }

  seleccionarTurno(): void {
    this.turnoSeleccionado =
      this.turnosAbiertos.find(
        turno => turno._id === this.turnoId
      ) || null;

    this.limpiarMensajes();
  }

  cerrarTurno(): void {
    this.limpiarMensajes();

    if (!this.tiendaId) {
      this.mensajeError = 'Selecciona una tienda.';
      return;
    }

    if (!this.turnoId || !this.turnoSeleccionado) {
      this.mensajeError = 'Selecciona un turno abierto.';
      return;
    }

    if (
      this.montoFinal === null ||
      this.montoFinal === undefined
    ) {
      this.mensajeError = 'Ingresa el efectivo final de caja.';
      return;
    }

    if (Number(this.montoFinal) < 0) {
      this.mensajeError = 'El efectivo final no puede ser negativo.';
      return;
    }

    if (!this.confirmacion) {
      this.mensajeError =
        'Debes confirmar que revisaste la información del cierre.';
      return;
    }

    this.enviando = true;

    const cierreTurno = {
      montoFinal: Number(this.montoFinal)
    };

    this.http.put(`${this.turnosApi}/cerrar/${this.turnoId}`, cierreTurno)
      .subscribe({
        next: () => {
          this.mensajeExito = 'El turno se cerró correctamente.';

          setTimeout(() => {
            this.router.navigate([this.dashboardRuta]);
          }, 900);
        },
        error: error => {
          console.error('Error al cerrar turno:', error);

          this.mensajeError =
            error.error?.message ||
            'No fue posible cerrar el turno.';

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