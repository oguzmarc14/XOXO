import { Injectable } from '@angular/core';

export interface TurnoActual {
  activo: boolean;
  fechaApertura: string | null;
  fechaCierre: string | null;
  montoInicial: number;
  montoFinal: number | null;
  usuario: string;
  sucursal: string;
}

@Injectable({
  providedIn: 'root'
})
export class TurnoService {
  private readonly claveTurno = 'turnoActual';

  obtenerTurno(): TurnoActual {
    const turnoGuardado = localStorage.getItem(this.claveTurno);

    if (turnoGuardado) {
      try {
        return JSON.parse(turnoGuardado) as TurnoActual;
      } catch {
        this.eliminarTurnoInvalido();
      }
    }

    return this.crearTurnoVacio();
  }

  turnoEstaActivo(): boolean {
    return this.obtenerTurno().activo;
  }

  abrirTurno(montoInicial: number): TurnoActual {
    if (this.turnoEstaActivo()) {
      throw new Error('Ya existe un turno activo.');
    }

    if (montoInicial < 0) {
      throw new Error('El monto inicial no puede ser negativo.');
    }

    const turno: TurnoActual = {
      activo: true,
      fechaApertura: new Date().toISOString(),
      fechaCierre: null,
      montoInicial,
      montoFinal: null,
      usuario:
        localStorage.getItem('nombre') || 'Usuario sin identificar',
      sucursal:
        localStorage.getItem('sucursal') || 'Sucursal no asignada'
    };

    localStorage.setItem(
      this.claveTurno,
      JSON.stringify(turno)
    );

    // Se conserva para que los dashboards actuales sigan funcionando.
    localStorage.setItem('turnoActivo', 'true');

    return turno;
  }

  cerrarTurno(montoFinal: number): TurnoActual {
    const turnoActual = this.obtenerTurno();

    if (!turnoActual.activo) {
      throw new Error('No existe un turno activo para cerrar.');
    }

    if (montoFinal < 0) {
      throw new Error('El monto final no puede ser negativo.');
    }

    const turnoCerrado: TurnoActual = {
      ...turnoActual,
      activo: false,
      fechaCierre: new Date().toISOString(),
      montoFinal
    };

    localStorage.setItem(
      this.claveTurno,
      JSON.stringify(turnoCerrado)
    );

    localStorage.setItem('turnoActivo', 'false');

    return turnoCerrado;
  }

  calcularDiferencia(turno: TurnoActual): number {
    return (turno.montoFinal ?? 0) - turno.montoInicial;
  }

  private crearTurnoVacio(): TurnoActual {
    return {
      activo: false,
      fechaApertura: null,
      fechaCierre: null,
      montoInicial: 0,
      montoFinal: null,
      usuario:
        localStorage.getItem('nombre') || 'Usuario sin identificar',
      sucursal:
        localStorage.getItem('sucursal') || 'Sucursal no asignada'
    };
  }

  private eliminarTurnoInvalido(): void {
    localStorage.removeItem(this.claveTurno);
    localStorage.setItem('turnoActivo', 'false');
  }
}