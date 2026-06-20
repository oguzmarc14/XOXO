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

type EstadoTienda =
  | 'activa'
  | 'inactiva';

interface Tienda {
  id: number;
  numero: number;
  nombre: string;
  ciudad: string;
  estadoUbicacion: string;
  direccion: string;
  codigoPostal: string;
  telefono: string;
  correo: string;
  gerente: string;
  empleados: number;
  horarioApertura: string;
  horarioCierre: string;
  estado: EstadoTienda;
  fechaRegistro: string;
}

@Component({
  selector: 'app-crear-tienda',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './crear-tienda.html',
  styleUrl: './crear-tienda.css'
})
export class CrearTienda implements OnInit {
  readonly limiteSucursales = 200;

  numero: number | null = null;
  nombre = '';
  ciudad = '';
  estadoUbicacion = '';
  direccion = '';
  codigoPostal = '';
  telefono = '';
  correo = '';
  gerente = '';

  empleados: number | null = null;

  horarioApertura = '09:00';
  horarioCierre = '20:00';

  estado: EstadoTienda = 'activa';

  guardando = false;
  limiteAlcanzado = false;

  mensajeError = '';
  mensajeExito = '';

  estadosDisponibles = [
    'Aguascalientes',
    'Baja California',
    'Baja California Sur',
    'Campeche',
    'Chiapas',
    'Chihuahua',
    'Ciudad de México',
    'Coahuila',
    'Colima',
    'Durango',
    'Estado de México',
    'Guanajuato',
    'Guerrero',
    'Hidalgo',
    'Jalisco',
    'Michoacán',
    'Morelos',
    'Nayarit',
    'Nuevo León',
    'Oaxaca',
    'Puebla',
    'Querétaro',
    'Quintana Roo',
    'San Luis Potosí',
    'Sinaloa',
    'Sonora',
    'Tabasco',
    'Tamaulipas',
    'Tlaxcala',
    'Veracruz',
    'Yucatán',
    'Zacatecas'
  ];

  constructor(
    private router: Router
  ) {}

  ngOnInit(): void {
    const tiendas =
      this.obtenerTiendasGuardadas();

    this.limiteAlcanzado =
      tiendas.length >=
      this.limiteSucursales;

    if (this.limiteAlcanzado) {
      this.mensajeError =
        'Se alcanzó el límite máximo de 200 sucursales.';

      return;
    }

    this.generarNumeroSucursal(
      tiendas
    );
  }

  get totalSucursalesActuales(): number {
    return this.obtenerTiendasGuardadas()
      .length;
  }

  get espaciosDisponibles(): number {
    return Math.max(
      0,
      this.limiteSucursales -
      this.totalSucursalesActuales
    );
  }

  get numeroVistaPrevia(): string {
    return String(
      this.numero || 0
    ).padStart(3, '0');
  }

  get nombreVistaPrevia(): string {
    return (
      this.nombre.trim() ||
      'Nombre de la sucursal'
    );
  }

  get ubicacionVistaPrevia(): string {
    const ciudad =
      this.ciudad.trim();

    const estado =
      this.estadoUbicacion.trim();

    if (ciudad && estado) {
      return `${ciudad}, ${estado}`;
    }

    if (ciudad) {
      return ciudad;
    }

    if (estado) {
      return estado;
    }

    return 'Ubicación no registrada';
  }

  get direccionVistaPrevia(): string {
    return (
      this.direccion.trim() ||
      'Dirección de la sucursal'
    );
  }

  get gerenteVistaPrevia(): string {
    return (
      this.gerente.trim() ||
      'Gerente sin asignar'
    );
  }

  get telefonoVistaPrevia(): string {
    return (
      this.telefono.trim() ||
      'Teléfono no registrado'
    );
  }

  get horarioVistaPrevia(): string {
    return (
      `${this.horarioApertura || '--:--'} - ` +
      `${this.horarioCierre || '--:--'}`
    );
  }

  seleccionarEstadoOperativo(
    estadoSeleccionado:
      EstadoTienda
  ): void {
    this.estado =
      estadoSeleccionado;

    this.limpiarMensajes();
  }

  generarNumeroManual(): void {
    const tiendas =
      this.obtenerTiendasGuardadas();

    this.generarNumeroSucursal(
      tiendas
    );

    this.limpiarMensajes();
  }

  guardarSucursal(): void {
    this.limpiarMensajes();

    const tiendas =
      this.obtenerTiendasGuardadas();

    if (
      tiendas.length >=
      this.limiteSucursales
    ) {
      this.limiteAlcanzado = true;

      this.mensajeError =
        'No es posible registrar más sucursales porque se alcanzó el límite de 200.';

      return;
    }

    if (
      this.numero === null ||
      Number(this.numero) <= 0
    ) {
      this.mensajeError =
        'El número de sucursal debe ser mayor a cero.';

      return;
    }

    const numeroDuplicado =
      tiendas.some(
        tienda =>
          tienda.numero ===
          Number(this.numero)
      );

    if (numeroDuplicado) {
      this.mensajeError =
        'Ya existe una sucursal con ese número.';

      return;
    }

    if (!this.nombre.trim()) {
      this.mensajeError =
        'El nombre de la sucursal es obligatorio.';

      return;
    }

    if (
      this.nombre.trim().length < 3
    ) {
      this.mensajeError =
        'El nombre debe contener al menos 3 caracteres.';

      return;
    }

    const nombreDuplicado =
      tiendas.some(
        tienda =>
          this.normalizarTexto(
            tienda.nombre
          ) ===
          this.normalizarTexto(
            this.nombre
          )
      );

    if (nombreDuplicado) {
      this.mensajeError =
        'Ya existe una sucursal con ese nombre.';

      return;
    }

    if (!this.estadoUbicacion) {
      this.mensajeError =
        'Selecciona el estado donde se encuentra la sucursal.';

      return;
    }

    if (!this.ciudad.trim()) {
      this.mensajeError =
        'La ciudad es obligatoria.';

      return;
    }

    if (!this.direccion.trim()) {
      this.mensajeError =
        'La dirección es obligatoria.';

      return;
    }

    if (!this.codigoPostal.trim()) {
      this.mensajeError =
        'El código postal es obligatorio.';

      return;
    }

    if (
      !/^\d{5}$/.test(
        this.codigoPostal.trim()
      )
    ) {
      this.mensajeError =
        'El código postal debe contener 5 dígitos.';

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

    if (
      telefonoLimpio.length < 10
    ) {
      this.mensajeError =
        'El teléfono debe contener al menos 10 dígitos.';

      return;
    }

    if (
      this.correo.trim() &&
      !this.correoValido(
        this.correo
      )
    ) {
      this.mensajeError =
        'Ingresa un correo electrónico válido.';

      return;
    }

    if (!this.gerente.trim()) {
      this.mensajeError =
        'El nombre del gerente es obligatorio.';

      return;
    }

    if (
      this.empleados === null ||
      Number(this.empleados) < 0
    ) {
      this.mensajeError =
        'El número de empleados no puede ser negativo.';

      return;
    }

    if (!this.horarioApertura) {
      this.mensajeError =
        'Selecciona el horario de apertura.';

      return;
    }

    if (!this.horarioCierre) {
      this.mensajeError =
        'Selecciona el horario de cierre.';

      return;
    }

    if (
      this.horarioCierre <=
      this.horarioApertura
    ) {
      this.mensajeError =
        'El horario de cierre debe ser posterior al horario de apertura.';

      return;
    }

    this.guardando = true;

    try {
      const nuevaSucursal:
        Tienda = {
          id: Date.now(),

          numero:
            Number(this.numero),

          nombre:
            this.nombre.trim(),

          ciudad:
            this.ciudad.trim(),

          estadoUbicacion:
            this.estadoUbicacion,

          direccion:
            this.direccion.trim(),

          codigoPostal:
            this.codigoPostal.trim(),

          telefono:
            this.telefono.trim(),

          correo:
            this.correo
              .trim()
              .toLowerCase(),

          gerente:
            this.gerente.trim(),

          empleados:
            Number(this.empleados),

          horarioApertura:
            this.horarioApertura,

          horarioCierre:
            this.horarioCierre,

          estado:
            this.estado,

          fechaRegistro:
            new Date().toISOString()
        };

      const tiendasActualizadas = [
        nuevaSucursal,
        ...tiendas
      ].slice(
        0,
        this.limiteSucursales
      );

      localStorage.setItem(
        'xoxo_tiendas',
        JSON.stringify(
          tiendasActualizadas
        )
      );

      this.mensajeExito =
        'La sucursal se registró correctamente.';

      setTimeout(() => {
        this.router.navigate([
          '/lista-tiendas'
        ]);
      }, 900);
    } catch {
      this.mensajeError =
        'No fue posible registrar la sucursal.';
    } finally {
      this.guardando = false;
    }
  }

  limpiarFormulario(): void {
    if (this.limiteAlcanzado) {
      return;
    }

    this.nombre = '';
    this.ciudad = '';
    this.estadoUbicacion = '';
    this.direccion = '';
    this.codigoPostal = '';
    this.telefono = '';
    this.correo = '';
    this.gerente = '';

    this.empleados = null;

    this.horarioApertura = '09:00';
    this.horarioCierre = '20:00';

    this.estado = 'activa';

    this.limpiarMensajes();

    this.generarNumeroSucursal(
      this.obtenerTiendasGuardadas()
    );
  }

  volverAlListado(): void {
    this.router.navigate([
      '/lista-tiendas'
    ]);
  }

  private generarNumeroSucursal(
    tiendas: Tienda[]
  ): void {
    const numerosUsados =
      new Set(
        tiendas.map(
          tienda => tienda.numero
        )
      );

    let numeroDisponible = 1;

    while (
      numerosUsados.has(
        numeroDisponible
      )
    ) {
      numeroDisponible++;
    }

    this.numero =
      numeroDisponible;
  }

  private obtenerTiendasGuardadas():
    Tienda[] {
    const informacion =
      localStorage.getItem(
        'xoxo_tiendas'
      );

    if (!informacion) {
      return [];
    }

    try {
      const tiendas =
        JSON.parse(
          informacion
        ) as Tienda[];

      return tiendas.slice(
        0,
        this.limiteSucursales
      );
    } catch {
      return [];
    }
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

  private limpiarMensajes(): void {
    this.mensajeError = '';
    this.mensajeExito = '';
  }
}