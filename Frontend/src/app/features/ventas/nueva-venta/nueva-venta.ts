import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface TiendaBackend {
  _id: string;
  nombre: string;
  ciudad: string;
}

interface ProductoBackend {
  _id: string;
  nombre: string;
  precio: number;
  categoria: string;
}

interface InventarioBackend {
  _id: string;
  tiendaId: string;
  productoId: string;
  piezas: number;
}

interface ProductoVenta {
  productoId: string;
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
  imports: [
    CommonModule,
    FormsModule,

  ],
  templateUrl: './nueva-venta.html',
  styleUrl: './nueva-venta.css'
})
export class NuevaVenta implements OnInit {
  tiendaId = '';
  busquedaProducto = '';
  categoriaSeleccionada = 'todas';

  productos: ProductoVenta[] = [];
  carrito: ProductoCarrito[] = [];

  mensajeErrorVenta = '';
  mensajeExitoVenta = '';

  tiendas: TiendaBackend[] = [];

  cargandoProductos = false;
  registrandoVenta = false;

  private readonly tiendasApi = 'http://localhost:3000/tiendas';
  private readonly productosApi = 'http://localhost:3000/productos';
  private readonly inventarioApi = 'http://localhost:3000/inventario';
  private readonly ventasApi = 'http://localhost:3000/ventas';

  constructor(
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.cargarTiendas();
  }

  get categorias(): string[] {
    return [
      'todas',
      ...new Set(
        this.productos.map(producto => producto.categoria)
      )
    ];
  }

  get productosFiltrados(): ProductoVenta[] {
    const texto = this.normalizarTexto(this.busquedaProducto);

    return this.productos.filter(producto => {
      const coincideBusqueda =
        !texto ||
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

  cargarTiendas(): void {
    this.http.get<TiendaBackend[]>(this.tiendasApi)
      .subscribe({
        next: tiendas => {
          this.tiendas = tiendas;
        },
        error: error => {
          console.error('Error al cargar tiendas:', error);
          this.mensajeErrorVenta = 'No fue posible cargar las tiendas.';
        }
      });
  }

  cargarProductosPorTienda(): void {
    this.limpiarVenta();

    if (!this.tiendaId) {
      this.productos = [];
      return;
    }

    this.cargandoProductos = true;

    this.http.get<ProductoBackend[]>(this.productosApi)
      .subscribe({
        next: productosBackend => {
          this.http.get<InventarioBackend[]>(this.inventarioApi)
            .subscribe({
              next: inventarioBackend => {
                const inventarioTienda =
                  inventarioBackend.filter(
                    item => item.tiendaId === this.tiendaId
                  );

                this.productos =
                  inventarioTienda
                    .map(item => {
                      const producto =
                        productosBackend.find(
                          prod => prod._id === item.productoId
                        );

                      if (!producto) {
                        return null;
                      }

                      return {
                        productoId: producto._id,
                        nombre: producto.nombre,
                        precio: producto.precio,
                        categoria: producto.categoria,
                        stock: item.piezas
                      };
                    })
                    .filter(
                      (producto): producto is ProductoVenta =>
                        producto !== null
                    );

                this.cargandoProductos = false;
              },
              error: error => {
                console.error('Error al cargar inventario:', error);
                this.mensajeErrorVenta = 'No fue posible cargar el inventario.';
                this.cargandoProductos = false;
              }
            });
        },
        error: error => {
          console.error('Error al cargar productos:', error);
          this.mensajeErrorVenta = 'No fue posible cargar los productos.';
          this.cargandoProductos = false;
        }
      });
  }

  agregarProducto(producto: ProductoVenta): void {
    this.mensajeErrorVenta = '';
    this.mensajeExitoVenta = '';

    if (!this.tiendaId) {
      this.mensajeErrorVenta = 'Selecciona una tienda.';
      return;
    }

    if (producto.stock <= 0) {
      this.mensajeErrorVenta = 'Este producto no tiene stock disponible.';
      return;
    }

    const productoExistente =
      this.carrito.find(
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
      subtotal: producto.precio
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
    this.carrito =
      this.carrito.filter(
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

    if (!this.tiendaId) {
      this.mensajeErrorVenta = 'Selecciona una tienda.';
      return;
    }

    if (this.carrito.length === 0) {
      this.mensajeErrorVenta = 'Agrega al menos un producto.';
      return;
    }

    const venta = {
      tiendaId: this.tiendaId,
      productos: this.carrito.map(producto => ({
        productoId: producto.productoId,
        cantidad: producto.cantidad
      }))
    };

    this.registrandoVenta = true;

    this.http.post(this.ventasApi, venta)
      .subscribe({
        next: () => {
          this.mensajeExitoVenta = 'Venta registrada correctamente.';
          this.carrito = [];
          this.cargarProductosPorTienda();
        },
        error: error => {
          console.error('Error al registrar venta:', error);
          this.mensajeErrorVenta =
            error.error?.message ||
            'No fue posible registrar la venta.';
        },
        complete: () => {
          this.registrandoVenta = false;
        }
      });
  }

  private limpiarVenta(): void {
    this.carrito = [];
    this.productos = [];
    this.busquedaProducto = '';
    this.categoriaSeleccionada = 'todas';
    this.mensajeErrorVenta = '';
    this.mensajeExitoVenta = '';
  }

  private normalizarTexto(texto: string): string {
    return texto
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}