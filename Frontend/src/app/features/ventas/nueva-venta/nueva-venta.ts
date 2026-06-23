import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface TiendaBackend {
  _id: string;
  nombre: string;
  ciudad?: string;
}

interface UsuarioTurno {
  _id: string;
  nombre: string;
  usuario?: string;
  rol?: string;
}

interface TurnoBackend {
  _id: string;
  tiendaId: string | TiendaBackend;
  usuarioId: string | UsuarioTurno;
  numeroCaja: number;
  montoInicial: number;
  estado: 'ABIERTO' | 'CERRADO';
  fechaApertura: string;
}

interface ProductoBackend {
  _id: string;
  codigo: number;
  nombre: string;
  precio: number;
  categoria: string;
  stockMinimo?: number;
}

interface InventarioBackend {
  _id: string;
  tiendaId: string | TiendaBackend;
  productoId: string | ProductoBackend;
  piezas: number;
}

interface ProductoVenta {
  productoId: string;
  codigo: number;
  nombre: string;
  precio: number;
  categoria: string;
  stock: number;
}

interface ProductoCarrito extends ProductoVenta {
  cantidad: number;
  subtotal: number;
}

@Component({
  selector: 'app-nueva-venta',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './nueva-venta.html',
  styleUrl: './nueva-venta.css',
})
export class NuevaVenta implements OnInit {
  tiendaId = '';
  tiendaNombre = 'Tienda no asignada';

  turnoActivo = false;
  turnoId = '';
  numeroCaja: number | null = null;
  cajeroNombre = 'Cajero no asignado';
  cajeroUsuario = '';
  fechaAperturaTurno = '';

  mostrarResumenVenta = false;
  fechaActual = new Date();

  busquedaProducto = '';
  categoriaSeleccionada = 'todas';
  codigoBusqueda: number | null = null;

  productos: ProductoVenta[] = [];
  carrito: ProductoCarrito[] = [];

  mensajeErrorVenta = '';
  mensajeExitoVenta = '';

  cargandoProductos = false;
  registrandoVenta = false;

  private readonly inventarioApi = 'https://xoxo-backend-ewqr.onrender.com/inventario';
  private readonly ventasApi = 'https://xoxo-backend-ewqr.onrender.com/ventas';
  private readonly turnosApi = 'https://xoxo-backend-ewqr.onrender.com/turnos';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.cargarTurnosAbiertosBackend();
  }

  get categorias(): string[] {
    return [
      'todas',
      ...new Set(this.productos.map(producto => producto.categoria)),
    ];
  }

  get productosFiltrados(): ProductoVenta[] {
    const texto = this.normalizarTexto(this.busquedaProducto);

    return this.productos.filter(producto => {
      const coincideBusqueda =
        !texto ||
        producto.codigo.toString().includes(texto) ||
        this.normalizarTexto(producto.nombre).includes(texto) ||
        this.normalizarTexto(producto.categoria).includes(texto);

      const coincideCategoria =
        this.categoriaSeleccionada === 'todas' ||
        producto.categoria === this.categoriaSeleccionada;

      return coincideBusqueda && coincideCategoria;
    });
  }

  get cantidadArticulos(): number {
    return this.carrito.reduce(
      (total, producto) => total + producto.cantidad,
      0
    );
  }

  get totalVenta(): number {
    return this.carrito.reduce(
      (total, producto) => total + producto.subtotal,
      0
    );
  }

  cargarTurnosAbiertosBackend(): void {
    this.http.get<TurnoBackend[]>(`${this.turnosApi}/abiertos`).subscribe({
      next: turnos => {
        if (!turnos.length) {
          this.turnoActivo = false;
          this.mensajeErrorVenta =
            'No hay turnos abiertos. Debes abrir turno antes de vender.';
          return;
        }

        const turno = turnos[0];

        this.turnoActivo = true;
        this.turnoId = turno._id;
        this.numeroCaja = turno.numeroCaja;
        this.fechaAperturaTurno = turno.fechaApertura;

        this.tiendaId =
          typeof turno.tiendaId === 'string'
            ? turno.tiendaId
            : turno.tiendaId._id;

        this.tiendaNombre =
          typeof turno.tiendaId === 'string'
            ? 'Tienda asignada'
            : turno.tiendaId.ciudad
              ? `${turno.tiendaId.nombre} - ${turno.tiendaId.ciudad}`
              : turno.tiendaId.nombre;

        if (typeof turno.usuarioId === 'object') {
          this.cajeroNombre = turno.usuarioId.nombre || 'Cajero';
          this.cajeroUsuario = turno.usuarioId.usuario || '';
        }

        this.cargarProductosPorTienda();
      },
      error: error => {
        console.error('Error al obtener turnos abiertos:', error);
        this.mensajeErrorVenta =
          'No fue posible consultar los turnos abiertos.';
      },
    });
  }

  cargarProductosPorTienda(): void {
    this.cargandoProductos = true;
    this.mensajeErrorVenta = '';
    this.productos = [];

    this.http
      .get<InventarioBackend[]>(`${this.inventarioApi}/tienda/${this.tiendaId}`)
      .subscribe({
        next: inventario => {
          this.productos = inventario
            .map(item => this.mapearProductoInventario(item))
            .filter((producto): producto is ProductoVenta => producto !== null);

          this.cargandoProductos = false;
        },
        error: error => {
          console.error('Error al cargar inventario:', error);
          this.mensajeErrorVenta = 'No fue posible cargar el inventario.';
          this.cargandoProductos = false;
        },
      });
  }

  abrirResumenVenta(): void {
    this.mensajeErrorVenta = '';
    this.mensajeExitoVenta = '';
    this.fechaActual = new Date();

    if (!this.turnoActivo) {
      this.mensajeErrorVenta = 'No hay turno abierto para cobrar.';
      return;
    }

    if (this.carrito.length === 0) {
      this.mensajeErrorVenta = 'Agrega al menos un producto.';
      return;
    }

    this.mostrarResumenVenta = true;
  }

  cerrarResumenVenta(): void {
    this.mostrarResumenVenta = false;
  }

  agregarPorCodigo(): void {
    this.mensajeErrorVenta = '';
    this.mensajeExitoVenta = '';

    if (!this.codigoBusqueda || this.codigoBusqueda <= 0) {
      this.mensajeErrorVenta = 'Ingresa un código válido.';
      return;
    }

    const producto = this.productos.find(
      item => item.codigo === Number(this.codigoBusqueda)
    );

    if (!producto) {
      this.mensajeErrorVenta =
        'No se encontró un producto con ese código en esta tienda.';
      return;
    }

    this.agregarProducto(producto);
    this.codigoBusqueda = null;
  }

  agregarProducto(producto: ProductoVenta): void {
    this.mensajeErrorVenta = '';
    this.mensajeExitoVenta = '';

    if (!this.turnoActivo) {
      this.mensajeErrorVenta = 'Debes abrir turno antes de vender.';
      return;
    }

    if (producto.stock <= 0) {
      this.mensajeErrorVenta = 'Este producto no tiene stock disponible.';
      return;
    }

    const productoExistente = this.carrito.find(
      item => item.productoId === producto.productoId
    );

    if (productoExistente) {
      if (productoExistente.cantidad >= producto.stock) {
        this.mensajeErrorVenta =
          `Solo hay ${producto.stock} pieza(s) disponibles.`;
        return;
      }

      productoExistente.cantidad++;
      productoExistente.subtotal =
        productoExistente.cantidad * productoExistente.precio;

      return;
    }

    this.carrito.push({
      ...producto,
      cantidad: 1,
      subtotal: producto.precio,
    });
  }

  aumentarCantidad(producto: ProductoCarrito): void {
    if (producto.cantidad >= producto.stock) {
      this.mensajeErrorVenta =
        `Solo hay ${producto.stock} pieza(s) disponibles.`;
      return;
    }

    producto.cantidad++;
    producto.subtotal = producto.cantidad * producto.precio;
  }

  disminuirCantidad(producto: ProductoCarrito): void {
    if (producto.cantidad <= 1) {
      this.eliminarProducto(producto.productoId);
      return;
    }

    producto.cantidad--;
    producto.subtotal = producto.cantidad * producto.precio;
  }

  eliminarProducto(productoId: string): void {
    this.carrito = this.carrito.filter(
      producto => producto.productoId !== productoId
    );
  }

  vaciarCarrito(): void {
    this.carrito = [];
    this.mensajeErrorVenta = '';
    this.mensajeExitoVenta = '';
  }

  registrarVenta(): void {
    this.mensajeErrorVenta = '';
    this.mensajeExitoVenta = '';

    if (!this.turnoActivo) {
      this.mensajeErrorVenta = 'No hay turno abierto para registrar venta.';
      return;
    }

    if (!this.tiendaId) {
      this.mensajeErrorVenta = 'No se encontró la tienda.';
      return;
    }

    if (this.carrito.length === 0) {
      this.mensajeErrorVenta = 'Agrega al menos un producto.';
      return;
    }

    const venta = {
      tiendaId: this.tiendaId,
      turnoId: this.turnoId,
      productos: this.carrito.map(producto => ({
        productoId: producto.productoId,
        cantidad: producto.cantidad,
      })),
    };

    this.registrandoVenta = true;

    this.http.post(this.ventasApi, venta).subscribe({
      next: () => {
        this.mostrarResumenVenta = false;
        this.mensajeExitoVenta = 'Venta registrada correctamente.';
        this.carrito = [];
        this.cargarProductosPorTienda();
      },
      error: error => {
        console.error('Error al registrar venta:', error);
        this.mensajeErrorVenta =
          error.error?.message || 'No fue posible registrar la venta.';
      },
      complete: () => {
        this.registrandoVenta = false;
      },
    });
  }

  private mapearProductoInventario(item: InventarioBackend): ProductoVenta | null {
    if (!item.productoId || typeof item.productoId === 'string') {
      return null;
    }

    const producto = item.productoId;

    return {
      productoId: producto._id,
      codigo: producto.codigo,
      nombre: producto.nombre,
      precio: producto.precio,
      categoria: producto.categoria,
      stock: Number(item.piezas || 0),
    };
  }

  private normalizarTexto(texto: string): string {
    return (texto || '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}