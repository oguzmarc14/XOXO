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
  telefono: string;
  gerente: string;
  empleados: number;
  estado: EstadoTienda;
  fechaRegistro: string;
}

@Component({
  selector: 'app-lista-tiendas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './lista-tiendas.html',
  styleUrl: './lista-tiendas.css'
})
export class ListaTiendas implements OnInit {
  readonly limiteSucursales = 200;

  busqueda = '';
  estadoSeleccionado = 'todas';
  ubicacionSeleccionada = 'todas';

  tiendas: Tienda[] = [];
  tiendasFiltradas: Tienda[] = [];

  mensajeExito = '';

  modalEliminarAbierto = false;
  tiendaSeleccionada: Tienda | null = null;

  private readonly tiendasBase: Tienda[] = [
    {
      id: 1,
      numero: 27,
      nombre: 'Sucursal Centro',
      ciudad: 'Aguascalientes',
      estadoUbicacion: 'Aguascalientes',
      direccion:
        'Av. Francisco I. Madero 210, Zona Centro',
      telefono: '449 123 4501',
      gerente: 'Laura Hernández',
      empleados: 8,
      estado: 'activa',
      fechaRegistro: '2026-01-15T10:00:00'
    },
    {
      id: 2,
      numero: 43,
      nombre: 'Sucursal Norte',
      ciudad: 'Aguascalientes',
      estadoUbicacion: 'Aguascalientes',
      direccion:
        'Av. Universidad 1450, Bosques del Prado',
      telefono: '449 123 4502',
      gerente: 'Carlos Mendoza',
      empleados: 6,
      estado: 'activa',
      fechaRegistro: '2026-01-20T11:30:00'
    },
    {
      id: 3,
      numero: 82,
      nombre: 'Sucursal Plaza Sur',
      ciudad: 'Aguascalientes',
      estadoUbicacion: 'Aguascalientes',
      direccion:
        'Blvd. José María Chávez 1901, Ciudad Industrial',
      telefono: '449 123 4503',
      gerente: 'Ana Torres',
      empleados: 7,
      estado: 'activa',
      fechaRegistro: '2026-02-04T09:15:00'
    },
    {
      id: 4,
      numero: 115,
      nombre: 'Sucursal Altaria',
      ciudad: 'Aguascalientes',
      estadoUbicacion: 'Aguascalientes',
      direccion:
        'Blvd. a Zacatecas 849, Trojes de Alonso',
      telefono: '449 123 4504',
      gerente: 'Roberto Sánchez',
      empleados: 10,
      estado: 'activa',
      fechaRegistro: '2026-02-18T12:40:00'
    },
    {
      id: 5,
      numero: 128,
      nombre: 'Sucursal San Marcos',
      ciudad: 'Aguascalientes',
      estadoUbicacion: 'Aguascalientes',
      direccion:
        'Calle Nieto 402, Barrio de San Marcos',
      telefono: '449 123 4505',
      gerente: 'Daniela López',
      empleados: 5,
      estado: 'inactiva',
      fechaRegistro: '2026-03-03T13:20:00'
    },
    {
      id: 6,
      numero: 136,
      nombre: 'Sucursal Oriente',
      ciudad: 'Aguascalientes',
      estadoUbicacion: 'Aguascalientes',
      direccion:
        'Av. Siglo XXI 2200, Ojocaliente',
      telefono: '449 123 4506',
      gerente: 'Marco Flores',
      empleados: 6,
      estado: 'activa',
      fechaRegistro: '2026-03-15T08:50:00'
    },
    {
      id: 7,
      numero: 149,
      nombre: 'Sucursal Jesús María',
      ciudad: 'Jesús María',
      estadoUbicacion: 'Aguascalientes',
      direccion:
        'Av. Alejandro de la Cruz 320, Centro',
      telefono: '449 123 4507',
      gerente: 'Fernanda Ruiz',
      empleados: 5,
      estado: 'activa',
      fechaRegistro: '2026-04-02T10:10:00'
    },
    {
      id: 8,
      numero: 158,
      nombre: 'Sucursal Calvillo',
      ciudad: 'Calvillo',
      estadoUbicacion: 'Aguascalientes',
      direccion:
        'Calle Independencia 115, Zona Centro',
      telefono: '495 123 4508',
      gerente: 'Miguel Ramírez',
      empleados: 4,
      estado: 'inactiva',
      fechaRegistro: '2026-04-20T09:35:00'
    },
    {
      id: 9,
      numero: 171,
      nombre: 'Sucursal Zacatecas Centro',
      ciudad: 'Zacatecas',
      estadoUbicacion: 'Zacatecas',
      direccion:
        'Av. Hidalgo 505, Centro Histórico',
      telefono: '492 123 4509',
      gerente: 'Patricia Gómez',
      empleados: 7,
      estado: 'activa',
      fechaRegistro: '2026-05-05T11:45:00'
    },
    {
      id: 10,
      numero: 186,
      nombre: 'Sucursal Guadalupe',
      ciudad: 'Guadalupe',
      estadoUbicacion: 'Zacatecas',
      direccion:
        'Av. Colegio Militar 890, Centro',
      telefono: '492 123 4510',
      gerente: 'José Castillo',
      empleados: 6,
      estado: 'activa',
      fechaRegistro: '2026-05-24T14:05:00'
    }
  ];

  constructor(
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarTiendas();
    this.aplicarFiltros();
  }

  get totalTiendas(): number {
    return this.tiendas.length;
  }

  get tiendasActivas(): number {
    return this.tiendas.filter(
      tienda =>
        tienda.estado === 'activa'
    ).length;
  }

  get tiendasInactivas(): number {
    return this.tiendas.filter(
      tienda =>
        tienda.estado === 'inactiva'
    ).length;
  }

  get totalEmpleados(): number {
    return this.tiendas.reduce(
      (total, tienda) =>
        total + tienda.empleados,
      0
    );
  }

  get porcentajeCapacidad(): number {
    return Math.min(
      100,
      Math.round(
        (
          this.totalTiendas /
          this.limiteSucursales
        ) * 100
      )
    );
  }

  get puedeCrearTienda(): boolean {
    return (
      this.totalTiendas <
      this.limiteSucursales
    );
  }

  get espaciosDisponibles(): number {
    return Math.max(
      0,
      this.limiteSucursales -
      this.totalTiendas
    );
  }

  get ubicaciones(): string[] {
    return [
      ...new Set(
        this.tiendas.map(
          tienda =>
            tienda.estadoUbicacion
        )
      )
    ].sort();
  }

  aplicarFiltros(): void {
    const texto =
      this.normalizarTexto(
        this.busqueda
      );

    this.tiendasFiltradas =
      this.tiendas.filter(
        tienda => {
          const coincideBusqueda =
            !texto ||
            this.normalizarTexto(
              tienda.nombre
            ).includes(texto) ||
            this.normalizarTexto(
              tienda.numero.toString()
            ).includes(texto) ||
            this.normalizarTexto(
              tienda.ciudad
            ).includes(texto) ||
            this.normalizarTexto(
              tienda.estadoUbicacion
            ).includes(texto) ||
            this.normalizarTexto(
              tienda.direccion
            ).includes(texto) ||
            this.normalizarTexto(
              tienda.gerente
            ).includes(texto);

          const coincideEstado =
            this.estadoSeleccionado ===
              'todas' ||
            tienda.estado ===
              this.estadoSeleccionado;

          const coincideUbicacion =
            this.ubicacionSeleccionada ===
              'todas' ||
            tienda.estadoUbicacion ===
              this.ubicacionSeleccionada;

          return (
            coincideBusqueda &&
            coincideEstado &&
            coincideUbicacion
          );
        }
      );
  }

  limpiarFiltros(): void {
    this.busqueda = '';
    this.estadoSeleccionado = 'todas';
    this.ubicacionSeleccionada = 'todas';

    this.aplicarFiltros();
  }

  crearTienda(): void {
    if (!this.puedeCrearTienda) {
      return;
    }

    this.router.navigate([
      '/crear-tienda'
    ]);
  }

  editarTienda(
    tienda: Tienda
  ): void {
    localStorage.setItem(
      'xoxo_tienda_editar',
      JSON.stringify(tienda)
    );

    /*
      La ruta de edición puede agregarse
      posteriormente cuando exista el componente.
    */
  }

  cambiarEstado(
    tienda: Tienda
  ): void {
    tienda.estado =
      tienda.estado === 'activa'
        ? 'inactiva'
        : 'activa';

    this.guardarTiendas();
    this.aplicarFiltros();

    this.mensajeExito =
      tienda.estado === 'activa'
        ? 'La sucursal fue activada correctamente.'
        : 'La sucursal fue desactivada correctamente.';

    this.ocultarMensaje();
  }

  abrirEliminar(
    tienda: Tienda
  ): void {
    this.tiendaSeleccionada =
      tienda;

    this.modalEliminarAbierto =
      true;
  }

  cerrarEliminar(): void {
    this.modalEliminarAbierto =
      false;

    this.tiendaSeleccionada =
      null;
  }

  confirmarEliminar(): void {
    if (!this.tiendaSeleccionada) {
      return;
    }

    this.tiendas =
      this.tiendas.filter(
        tienda =>
          tienda.id !==
          this.tiendaSeleccionada?.id
      );

    this.guardarTiendas();
    this.aplicarFiltros();

    this.mensajeExito =
      'La sucursal fue eliminada correctamente.';

    this.cerrarEliminar();
    this.ocultarMensaje();
  }

  obtenerNumeroSucursal(
    tienda: Tienda
  ): string {
    return String(
      tienda.numero
    ).padStart(3, '0');
  }

  obtenerIniciales(
    nombre: string
  ): string {
    const partes =
      nombre
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (partes.length === 0) {
      return 'XO';
    }

    if (partes.length === 1) {
      return partes[0]
        .substring(0, 2)
        .toUpperCase();
    }

    return (
      partes[0].charAt(0) +
      partes[1].charAt(0)
    ).toUpperCase();
  }

  private cargarTiendas(): void {
    const informacion =
      localStorage.getItem(
        'xoxo_tiendas'
      );

    if (!informacion) {
      this.tiendas = [
        ...this.tiendasBase
      ];

      this.guardarTiendas();

      return;
    }

    try {
      const tiendasLocales =
        JSON.parse(
          informacion
        ) as Tienda[];

      /*
        También se protege el límite al cargar
        información desde localStorage.
      */
      this.tiendas =
        tiendasLocales.slice(
          0,
          this.limiteSucursales
        );
    } catch {
      this.tiendas = [
        ...this.tiendasBase
      ];

      this.guardarTiendas();
    }
  }

  private guardarTiendas(): void {
    const tiendasPermitidas =
      this.tiendas.slice(
        0,
        this.limiteSucursales
      );

    localStorage.setItem(
      'xoxo_tiendas',
      JSON.stringify(
        tiendasPermitidas
      )
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

  private ocultarMensaje(): void {
    setTimeout(() => {
      this.mensajeExito = '';
    }, 2500);
  }
}