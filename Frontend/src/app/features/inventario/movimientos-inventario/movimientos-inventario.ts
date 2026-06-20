import { CommonModule } from '@angular/common';

import {
  Component,
  OnInit
} from '@angular/core';

import {
  FormsModule
} from '@angular/forms';

import {
  RouterLink
} from '@angular/router';

import {
  Usuario
} from '../../../core/models/usuario.model';

import {
  UsuarioActualService
} from '../../../core/services/usuario-actual';

type TipoMovimiento =
  | 'entrada'
  | 'salida'
  | 'ajuste';

interface MovimientoInventario {
  id: number;
  folio: string;
  fecha: Date;
  hora: string;
  tipo: TipoMovimiento;
  producto: string;
  codigoProducto: string;
  sucursal: string;
  cantidad: number;
  existenciaAnterior: number;
  existenciaNueva: number;
  responsable: string;
  motivo: string;
}

interface ProductoMovimiento {
  id: number;
  codigo: string;
  nombre: string;
  existencia: number;
}

@Component({
  selector: 'app-movimientos-inventario',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './movimientos-inventario.html',
  styleUrl: './movimientos-inventario.css'
})
export class MovimientosInventario
  implements OnInit {

  usuario!: Usuario;

  busqueda = '';
  tipoSeleccionado = 'todos';
  sucursalSeleccionada = 'todas';
  fechaSeleccionada = '';

  modalMovimientoAbierto = false;
  guardando = false;

  productoSeleccionadoId = 0;
  tipoNuevoMovimiento:
    TipoMovimiento = 'entrada';

  cantidadMovimiento: number | null = null;
  motivoMovimiento = '';
  sucursalMovimiento = '';

  mensajeError = '';
  mensajeExito = '';

  productos: ProductoMovimiento[] = [
    {
      id: 1,
      codigo: 'XO-PL-001',
      nombre: 'Playera negra XoXO',
      existencia: 18
    },
    {
      id: 2,
      codigo: 'XO-PL-002',
      nombre: 'Playera blanca XoXO',
      existencia: 4
    },
    {
      id: 3,
      codigo: 'XO-SD-001',
      nombre: 'Sudadera vino',
      existencia: 2
    },
    {
      id: 4,
      codigo: 'XO-SD-002',
      nombre: 'Sudadera negra',
      existencia: 12
    },
    {
      id: 5,
      codigo: 'XO-BL-001',
      nombre: 'Bolsa XoXO edición especial',
      existencia: 1
    },
    {
      id: 6,
      codigo: 'XO-GR-001',
      nombre: 'Gorra bordada XoXO',
      existencia: 0
    }
  ];

  movimientos: MovimientoInventario[] = [
    {
      id: 1,
      folio: 'MOV-0008',
      fecha: new Date('2026-06-19T16:45:00'),
      hora: '16:45',
      tipo: 'entrada',
      producto: 'Playera negra XoXO',
      codigoProducto: 'XO-PL-001',
      sucursal: 'Sucursal #027 - Centro',
      cantidad: 10,
      existenciaAnterior: 8,
      existenciaNueva: 18,
      responsable: 'Laura Hernández',
      motivo: 'Recepción de mercancía'
    },
    {
      id: 2,
      folio: 'MOV-0007',
      fecha: new Date('2026-06-19T15:20:00'),
      hora: '15:20',
      tipo: 'salida',
      producto: 'Playera blanca XoXO',
      codigoProducto: 'XO-PL-002',
      sucursal: 'Sucursal #027 - Centro',
      cantidad: 2,
      existenciaAnterior: 6,
      existenciaNueva: 4,
      responsable: 'María López',
      motivo: 'Venta registrada'
    },
    {
      id: 3,
      folio: 'MOV-0006',
      fecha: new Date('2026-06-19T13:40:00'),
      hora: '13:40',
      tipo: 'ajuste',
      producto: 'Sudadera vino',
      codigoProducto: 'XO-SD-001',
      sucursal: 'Sucursal #027 - Centro',
      cantidad: 1,
      existenciaAnterior: 3,
      existenciaNueva: 2,
      responsable: 'Laura Hernández',
      motivo: 'Producto dañado'
    },
    {
      id: 4,
      folio: 'MOV-0005',
      fecha: new Date('2026-06-18T18:10:00'),
      hora: '18:10',
      tipo: 'entrada',
      producto: 'Sudadera negra',
      codigoProducto: 'XO-SD-002',
      sucursal: 'Sucursal #043 - Norte',
      cantidad: 8,
      existenciaAnterior: 4,
      existenciaNueva: 12,
      responsable: 'Carlos Mendoza',
      motivo: 'Reabastecimiento'
    },
    {
      id: 5,
      folio: 'MOV-0004',
      fecha: new Date('2026-06-18T16:30:00'),
      hora: '16:30',
      tipo: 'salida',
      producto: 'Bolsa XoXO edición especial',
      codigoProducto: 'XO-BL-001',
      sucursal: 'Sucursal #027 - Centro',
      cantidad: 1,
      existenciaAnterior: 2,
      existenciaNueva: 1,
      responsable: 'María López',
      motivo: 'Venta registrada'
    },
    {
      id: 6,
      folio: 'MOV-0003',
      fecha: new Date('2026-06-18T12:15:00'),
      hora: '12:15',
      tipo: 'ajuste',
      producto: 'Gorra bordada XoXO',
      codigoProducto: 'XO-GR-001',
      sucursal: 'Sucursal #043 - Norte',
      cantidad: 2,
      existenciaAnterior: 2,
      existenciaNueva: 0,
      responsable: 'Carlos Mendoza',
      motivo: 'Diferencia en conteo físico'
    }
  ];

  movimientosFiltrados:
    MovimientoInventario[] = [];

  constructor(
    private usuarioActualService:
      UsuarioActualService
  ) {}

  ngOnInit(): void {
    this.usuario =
      this.usuarioActualService
        .obtenerUsuario();

    this.sucursalMovimiento =
      this.usuario.sucursal;

    this.aplicarFiltros();
  }

  get puedeRegistrarMovimiento(): boolean {
    return (
      this.usuario.rol === 'admin' ||
      this.usuario.rol === 'gerente'
    );
  }

  get sucursales(): string[] {
    return [
      ...new Set(
        this.movimientos.map(
          movimiento => movimiento.sucursal
        )
      )
    ].sort();
  }

  get totalMovimientos(): number {
    return this.movimientos.length;
  }

  get totalEntradas(): number {
    return this.movimientos
      .filter(
        movimiento =>
          movimiento.tipo === 'entrada'
      )
      .reduce(
        (total, movimiento) =>
          total + movimiento.cantidad,
        0
      );
  }

  get totalSalidas(): number {
    return this.movimientos
      .filter(
        movimiento =>
          movimiento.tipo === 'salida'
      )
      .reduce(
        (total, movimiento) =>
          total + movimiento.cantidad,
        0
      );
  }

  get totalAjustes(): number {
    return this.movimientos
      .filter(
        movimiento =>
          movimiento.tipo === 'ajuste'
      )
      .reduce(
        (total, movimiento) =>
          total + movimiento.cantidad,
        0
      );
  }

  get unidadesMovidas(): number {
    return this.movimientos.reduce(
      (total, movimiento) =>
        total + movimiento.cantidad,
      0
    );
  }

  get productoSeleccionado():
    ProductoMovimiento | undefined {
    return this.productos.find(
      producto =>
        producto.id ===
        Number(this.productoSeleccionadoId)
    );
  }

  aplicarFiltros(): void {
    const texto =
      this.normalizarTexto(this.busqueda);

    this.movimientosFiltrados =
      this.movimientos.filter(
        movimiento => {
          const coincideBusqueda =
            !texto ||
            this.normalizarTexto(
              movimiento.folio
            ).includes(texto) ||
            this.normalizarTexto(
              movimiento.producto
            ).includes(texto) ||
            this.normalizarTexto(
              movimiento.codigoProducto
            ).includes(texto) ||
            this.normalizarTexto(
              movimiento.responsable
            ).includes(texto) ||
            this.normalizarTexto(
              movimiento.motivo
            ).includes(texto);

          const coincideTipo =
            this.tipoSeleccionado ===
              'todos' ||
            movimiento.tipo ===
              this.tipoSeleccionado;

          const coincideSucursal =
            this.sucursalSeleccionada ===
              'todas' ||
            movimiento.sucursal ===
              this.sucursalSeleccionada;

          const coincideFecha =
            !this.fechaSeleccionada ||
            this.obtenerFechaISO(
              movimiento.fecha
            ) === this.fechaSeleccionada;

          return (
            coincideBusqueda &&
            coincideTipo &&
            coincideSucursal &&
            coincideFecha
          );
        }
      );
  }

  limpiarFiltros(): void {
    this.busqueda = '';
    this.tipoSeleccionado = 'todos';
    this.sucursalSeleccionada = 'todas';
    this.fechaSeleccionada = '';

    this.aplicarFiltros();
  }

  abrirModalMovimiento(): void {
    this.limpiarFormularioMovimiento();
    this.modalMovimientoAbierto = true;
  }

  cerrarModalMovimiento(): void {
    if (this.guardando) {
      return;
    }

    this.modalMovimientoAbierto = false;
    this.mensajeError = '';
  }

  registrarMovimiento(): void {
    this.mensajeError = '';
    this.mensajeExito = '';

    const producto =
      this.productoSeleccionado;

    if (!producto) {
      this.mensajeError =
        'Selecciona un producto.';
      return;
    }

    if (
      !this.cantidadMovimiento ||
      this.cantidadMovimiento <= 0
    ) {
      this.mensajeError =
        'Ingresa una cantidad mayor a cero.';
      return;
    }

    if (!this.sucursalMovimiento.trim()) {
      this.mensajeError =
        'Selecciona o ingresa una sucursal.';
      return;
    }

    if (!this.motivoMovimiento.trim()) {
      this.mensajeError =
        'El motivo del movimiento es obligatorio.';
      return;
    }

    const cantidad =
      Number(this.cantidadMovimiento);

    const existenciaAnterior =
      producto.existencia;

    let existenciaNueva =
      existenciaAnterior;

    if (
      this.tipoNuevoMovimiento ===
      'entrada'
    ) {
      existenciaNueva =
        existenciaAnterior + cantidad;
    }

    if (
      this.tipoNuevoMovimiento ===
      'salida'
    ) {
      if (cantidad > existenciaAnterior) {
        this.mensajeError =
          'La cantidad de salida supera la existencia disponible.';
        return;
      }

      existenciaNueva =
        existenciaAnterior - cantidad;
    }

    if (
      this.tipoNuevoMovimiento ===
      'ajuste'
    ) {
      existenciaNueva = cantidad;
    }

    this.guardando = true;

    try {
      const ahora = new Date();

      const movimiento:
        MovimientoInventario = {
          id:
            this.movimientos.length + 1,

          folio:
            `MOV-${String(
              this.movimientos.length + 9
            ).padStart(4, '0')}`,

          fecha: ahora,

          hora:
            ahora.toLocaleTimeString(
              'es-MX',
              {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              }
            ),

          tipo:
            this.tipoNuevoMovimiento,

          producto:
            producto.nombre,

          codigoProducto:
            producto.codigo,

          sucursal:
            this.sucursalMovimiento.trim(),

          cantidad:
            this.tipoNuevoMovimiento ===
              'ajuste'
              ? Math.abs(
                  existenciaNueva -
                  existenciaAnterior
                )
              : cantidad,

          existenciaAnterior,

          existenciaNueva,

          responsable:
            this.usuario.nombre,

          motivo:
            this.motivoMovimiento.trim()
        };

      producto.existencia =
        existenciaNueva;

      this.movimientos = [
        movimiento,
        ...this.movimientos
      ];

      this.aplicarFiltros();

      this.mensajeExito =
        'El movimiento se registró correctamente.';

      this.modalMovimientoAbierto = false;
    } finally {
      this.guardando = false;
    }
  }

  obtenerTextoTipo(
    tipo: TipoMovimiento
  ): string {
    const textos:
      Record<TipoMovimiento, string> = {
        entrada: 'Entrada',
        salida: 'Salida',
        ajuste: 'Ajuste'
      };

    return textos[tipo];
  }

  obtenerSignoCantidad(
    movimiento: MovimientoInventario
  ): string {
    if (movimiento.tipo === 'entrada') {
      return `+${movimiento.cantidad}`;
    }

    if (movimiento.tipo === 'salida') {
      return `-${movimiento.cantidad}`;
    }

    return `${movimiento.cantidad}`;
  }

  private limpiarFormularioMovimiento():
    void {
    this.productoSeleccionadoId = 0;
    this.tipoNuevoMovimiento = 'entrada';
    this.cantidadMovimiento = null;
    this.motivoMovimiento = '';
    this.sucursalMovimiento =
      this.usuario.sucursal;
    this.mensajeError = '';
  }

  private obtenerFechaISO(
    fecha: Date
  ): string {
    const anio =
      fecha.getFullYear();

    const mes =
      String(
        fecha.getMonth() + 1
      ).padStart(2, '0');

    const dia =
      String(
        fecha.getDate()
      ).padStart(2, '0');

    return `${anio}-${mes}-${dia}`;
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
}