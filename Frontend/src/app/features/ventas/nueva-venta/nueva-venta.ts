import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ActivatedRoute,
  RouterLink
} from '@angular/router';

import {
  ProductoVenta,
  Venta
} from '../../../core/models/venta.model';

import { PermissionService } from '../../../core/services/permission';
import { TurnoService } from '../../../core/services/turno';
import { VentasService } from '../../../core/services/ventas';

import { Sidebar } from '../../../shared/components/sidebar/sidebar';
import { Topbar } from '../../../shared/components/topbar/topbar';

type ModoVenta = 'registrar' | 'cancelar';
type MetodoPago = 'efectivo' | 'tarjeta';

interface ProductoCatalogo {
  id: number;
  codigo: string;
  nombre: string;
  categoria: string;
  precio: number;
  stock: number;
  icono: string;
}

interface ProductoCarrito extends ProductoCatalogo {
  cantidad: number;
  subtotal: number;
}

@Component({
  selector: 'app-nueva-venta',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
  ],
  templateUrl: './nueva-venta.html',
  styleUrl: './nueva-venta.css'
})
export class NuevaVenta implements OnInit {
  modoActivo: ModoVenta = 'registrar';

  busquedaProducto = '';
  categoriaSeleccionada = 'todas';

  metodoPago: MetodoPago = 'efectivo';
  montoRecibido: number | null = null;

  mensajeErrorVenta = '';
  mensajeExitoVenta = '';
  ultimaVenta: Venta | null = null;

  folioBusqueda = '';
  ventaEncontrada: Venta | null = null;
  motivoCancelacion = '';
  mensajeErrorCancelacion = '';
  mensajeExitoCancelacion = '';

  carrito: ProductoCarrito[] = [];

  productos: ProductoCatalogo[] = [
    {
      id: 1,
      codigo: 'XO-001',
      nombre: 'Playera XoXO negra',
      categoria: 'Ropa',
      precio: 249,
      stock: 18,
      icono: '👕'
    },
    {
      id: 2,
      codigo: 'XO-002',
      nombre: 'Playera XoXO vino',
      categoria: 'Ropa',
      precio: 249,
      stock: 12,
      icono: '👕'
    },
    {
      id: 3,
      codigo: 'XO-003',
      nombre: 'Sudadera XoXO',
      categoria: 'Ropa',
      precio: 599,
      stock: 7,
      icono: '🧥'
    },
    {
      id: 4,
      codigo: 'XO-004',
      nombre: 'Gorra XoXO',
      categoria: 'Accesorios',
      precio: 189,
      stock: 15,
      icono: '🧢'
    },
    {
      id: 5,
      codigo: 'XO-005',
      nombre: 'Bolsa XoXO',
      categoria: 'Accesorios',
      precio: 329,
      stock: 9,
      icono: '👜'
    },
    {
      id: 6,
      codigo: 'XO-006',
      nombre: 'Taza XoXO',
      categoria: 'Hogar',
      precio: 129,
      stock: 22,
      icono: '☕'
    },
    {
      id: 7,
      codigo: 'XO-007',
      nombre: 'Termo XoXO',
      categoria: 'Hogar',
      precio: 279,
      stock: 11,
      icono: '🥤'
    },
    {
      id: 8,
      codigo: 'XO-008',
      nombre: 'Llavero XoXO',
      categoria: 'Accesorios',
      precio: 79,
      stock: 35,
      icono: '🔑'
    }
  ];

  constructor(
    private ventasService: VentasService,
    private permissionService: PermissionService,
    private turnoService: TurnoService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.configurarModoInicial();
  }

  get sucursal(): string {
    return (
      localStorage.getItem('sucursal') ||
      'Sucursal no asignada'
    );
  }

  get turnoActivo(): boolean {
    return this.turnoService.turnoEstaActivo();
  }

  get puedeRegistrar(): boolean {
    return this.permissionService.tienePermiso(
      'VENTAS_CREAR'
    );
  }

  get puedeCancelar(): boolean {
    return this.permissionService.tienePermiso(
      'VENTAS_CANCELAR'
    );
  }

  get puedeDevolver(): boolean {
    return this.permissionService.tienePermiso(
      'VENTAS_DEVOLVER'
    );
  }

  get puedeVerHistorial(): boolean {
    return this.permissionService.tienePermiso(
      'VENTAS_HISTORIAL_VER'
    );
  }

  get categorias(): string[] {
    return [
      'todas',
      ...new Set(
        this.productos.map(
          (producto) => producto.categoria
        )
      )
    ];
  }

  get productosFiltrados(): ProductoCatalogo[] {
    const texto = this.busquedaProducto
      .trim()
      .toLowerCase();

    return this.productos.filter((producto) => {
      const coincideBusqueda =
        !texto ||
        producto.nombre.toLowerCase().includes(texto) ||
        producto.codigo.toLowerCase().includes(texto) ||
        producto.categoria.toLowerCase().includes(texto);

      const coincideCategoria =
        this.categoriaSeleccionada === 'todas' ||
        producto.categoria ===
          this.categoriaSeleccionada;

      return coincideBusqueda && coincideCategoria;
    });
  }

  get cantidadArticulos(): number {
    return this.carrito.reduce(
      (total, producto) =>
        total + producto.cantidad,
      0
    );
  }

  get subtotalVenta(): number {
    return this.carrito.reduce(
      (total, producto) =>
        total + producto.subtotal,
      0
    );
  }

  get totalVenta(): number {
    return this.subtotalVenta;
  }

  get cambio(): number {
    if (
      this.metodoPago !== 'efectivo' ||
      this.montoRecibido === null
    ) {
      return 0;
    }

    return Math.max(
      this.montoRecibido - this.totalVenta,
      0
    );
  }

  cambiarModo(modo: ModoVenta): void {
    if (
      modo === 'registrar' &&
      !this.puedeRegistrar
    ) {
      this.mensajeErrorVenta =
        'No tienes permiso para registrar ventas.';
      return;
    }

    if (
      modo === 'cancelar' &&
      !this.puedeCancelar
    ) {
      this.mensajeErrorCancelacion =
        'No tienes permiso para cancelar ventas.';
      return;
    }

    this.modoActivo = modo;
    this.limpiarMensajes();
  }

  agregarProducto(
    producto: ProductoCatalogo
  ): void {
    this.mensajeErrorVenta = '';
    this.mensajeExitoVenta = '';

    if (!this.puedeRegistrar) {
      this.mensajeErrorVenta =
        'No tienes permiso para registrar ventas.';
      return;
    }

    if (!this.turnoActivo) {
      this.mensajeErrorVenta =
        'Debes tener un turno activo para registrar ventas.';
      return;
    }

    if (producto.stock <= 0) {
      this.mensajeErrorVenta =
        'El producto seleccionado no tiene existencias.';
      return;
    }

    const productoExistente = this.carrito.find(
      (item) => item.id === producto.id
    );

    if (productoExistente) {
      if (
        productoExistente.cantidad >=
        producto.stock
      ) {
        this.mensajeErrorVenta =
          'No hay más existencias disponibles.';
        return;
      }

      productoExistente.cantidad++;

      productoExistente.subtotal =
        productoExistente.precio *
        productoExistente.cantidad;

      return;
    }

    this.carrito.push({
      ...producto,
      cantidad: 1,
      subtotal: producto.precio
    });
  }

  aumentarCantidad(
    producto: ProductoCarrito
  ): void {
    this.mensajeErrorVenta = '';

    if (
      producto.cantidad >= producto.stock
    ) {
      this.mensajeErrorVenta =
        `Solo hay ${producto.stock} unidades disponibles.`;
      return;
    }

    producto.cantidad++;

    producto.subtotal =
      producto.precio * producto.cantidad;
  }

  disminuirCantidad(
    producto: ProductoCarrito
  ): void {
    if (producto.cantidad <= 1) {
      this.eliminarProducto(producto.id);
      return;
    }

    producto.cantidad--;

    producto.subtotal =
      producto.precio * producto.cantidad;
  }

  eliminarProducto(productoId: number): void {
    this.carrito = this.carrito.filter(
      (producto) => producto.id !== productoId
    );
  }

  vaciarCarrito(): void {
    this.carrito = [];
    this.montoRecibido = null;
    this.mensajeErrorVenta = '';
    this.mensajeExitoVenta = '';
    this.ultimaVenta = null;
  }

  seleccionarMetodoPago(
    metodo: MetodoPago
  ): void {
    this.metodoPago = metodo;

    if (metodo === 'tarjeta') {
      this.montoRecibido = null;
    }

    this.mensajeErrorVenta = '';
  }

  registrarVenta(): void {
    this.mensajeErrorVenta = '';
    this.mensajeExitoVenta = '';
    this.ultimaVenta = null;

    if (!this.puedeRegistrar) {
      this.mensajeErrorVenta =
        'No tienes permiso para registrar ventas.';
      return;
    }

    if (!this.turnoActivo) {
      this.mensajeErrorVenta =
        'No se puede registrar una venta sin un turno activo.';
      return;
    }

    if (this.carrito.length === 0) {
      this.mensajeErrorVenta =
        'Agrega al menos un producto a la venta.';
      return;
    }

    if (
      this.metodoPago === 'efectivo' &&
      (
        this.montoRecibido === null ||
        this.montoRecibido < this.totalVenta
      )
    ) {
      this.mensajeErrorVenta =
        'El monto recibido debe ser igual o mayor al total.';
      return;
    }

    const productosVenta: ProductoVenta[] =
      this.carrito.map((producto) => ({
        id: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        cantidad: producto.cantidad,
        subtotal: producto.subtotal
      }));

    try {
      const ventaRegistrada =
        this.ventasService.registrarVenta(
          productosVenta,
          this.metodoPago
        );

      this.descontarExistencias();

      this.ultimaVenta = ventaRegistrada;

      this.mensajeExitoVenta =
        `Venta ${ventaRegistrada.folio} registrada correctamente.`;

      this.carrito = [];
      this.montoRecibido = null;
      this.metodoPago = 'efectivo';
    } catch (error) {
      this.mensajeErrorVenta =
        error instanceof Error
          ? error.message
          : 'No fue posible registrar la venta.';
    }
  }

  buscarVentaParaCancelar(): void {
    this.mensajeErrorCancelacion = '';
    this.mensajeExitoCancelacion = '';
    this.ventaEncontrada = null;
    this.motivoCancelacion = '';

    if (!this.puedeCancelar) {
      this.mensajeErrorCancelacion =
        'No tienes permiso para cancelar ventas.';
      return;
    }

    if (!this.folioBusqueda.trim()) {
      this.mensajeErrorCancelacion =
        'Ingresa el folio de la venta.';
      return;
    }

    const venta =
      this.ventasService.obtenerVentaPorFolio(
        this.folioBusqueda
      );

    if (!venta) {
      this.mensajeErrorCancelacion =
        'No se encontró una venta con ese folio.';
      return;
    }

    this.ventaEncontrada = venta;

    if (venta.estado === 'cancelada') {
      this.mensajeErrorCancelacion =
        'La venta seleccionada ya fue cancelada.';
      return;
    }

    if (venta.estado === 'devuelta') {
      this.mensajeErrorCancelacion =
        'No se puede cancelar una venta devuelta.';
    }
  }

  cancelarVenta(): void {
    this.mensajeErrorCancelacion = '';
    this.mensajeExitoCancelacion = '';

    if (!this.puedeCancelar) {
      this.mensajeErrorCancelacion =
        'No tienes permiso para cancelar ventas.';
      return;
    }

    if (!this.ventaEncontrada) {
      this.mensajeErrorCancelacion =
        'Primero debes buscar una venta.';
      return;
    }

    if (
      this.ventaEncontrada.estado !==
      'completada'
    ) {
      this.mensajeErrorCancelacion =
        'Solo se pueden cancelar ventas completadas.';
      return;
    }

    if (!this.motivoCancelacion.trim()) {
      this.mensajeErrorCancelacion =
        'Escribe el motivo de la cancelación.';
      return;
    }

    const confirmacion = window.confirm(
      `¿Confirmas la cancelación de la venta ${this.ventaEncontrada.folio}?`
    );

    if (!confirmacion) {
      return;
    }

    try {
      const ventaCancelada =
        this.ventasService.cancelarVenta(
          this.ventaEncontrada.id,
          this.motivoCancelacion
        );

      this.ventaEncontrada = ventaCancelada;

      this.mensajeExitoCancelacion =
        `La venta ${ventaCancelada.folio} fue cancelada correctamente.`;

      this.motivoCancelacion = '';
    } catch (error) {
      this.mensajeErrorCancelacion =
        error instanceof Error
          ? error.message
          : 'No fue posible cancelar la venta.';
    }
  }

  limpiarCancelacion(): void {
    this.folioBusqueda = '';
    this.ventaEncontrada = null;
    this.motivoCancelacion = '';
    this.mensajeErrorCancelacion = '';
    this.mensajeExitoCancelacion = '';
  }

  obtenerTextoEstado(
    estado: Venta['estado']
  ): string {
    if (estado === 'completada') {
      return 'Completada';
    }

    if (estado === 'cancelada') {
      return 'Cancelada';
    }

    return 'Devuelta';
  }

  private configurarModoInicial(): void {
    const modoSolicitado =
      this.route.snapshot.queryParamMap.get('modo');

    if (
      modoSolicitado === 'cancelar' &&
      this.puedeCancelar
    ) {
      this.modoActivo = 'cancelar';
      return;
    }

    if (this.puedeRegistrar) {
      this.modoActivo = 'registrar';
      return;
    }

    if (this.puedeCancelar) {
      this.modoActivo = 'cancelar';
    }
  }

  private descontarExistencias(): void {
    this.carrito.forEach(
      (productoCarrito) => {
        const productoCatalogo =
          this.productos.find(
            (producto) =>
              producto.id === productoCarrito.id
          );

        if (productoCatalogo) {
          productoCatalogo.stock -=
            productoCarrito.cantidad;
        }
      }
    );
  }

  private limpiarMensajes(): void {
    this.mensajeErrorVenta = '';
    this.mensajeExitoVenta = '';
    this.mensajeErrorCancelacion = '';
    this.mensajeExitoCancelacion = '';
  }
}