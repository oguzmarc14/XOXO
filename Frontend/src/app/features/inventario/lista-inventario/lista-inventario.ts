import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

type EstadoInventario = 'disponible' | 'bajo' | 'agotado';

interface ProductoBackend {
  _id: string;
  codigo: number;
  nombre: string;
  precio: number;
  categoria: string;
  stockMinimo?: number;
}

interface TiendaBackend {
  _id: string;
  nombre: string;
  direccion?: string;
  ciudad?: string;
  telefono?: string;
}

interface InventarioBackend {
  _id: string;
  tiendaId: TiendaBackend;
  productoId: ProductoBackend;
  piezas: number;
}

interface ProductoInventario {
  id: string;
  productoId: string;
  tiendaId: string;
  nombre: string;
  categoria: string;
  sucursal: string;
  existencia: number;
  minimo: number;
  precio: number;
  estado: EstadoInventario;
}

@Component({
  selector: 'app-lista-inventario',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './lista-inventario.html',
  styleUrl: './lista-inventario.css',
})
export class ListaInventario implements OnInit {
  busqueda = '';
  categoriaSeleccionada = 'todas';
  sucursalSeleccionada = 'todas';
  estadoSeleccionado = 'todos';

  productos: ProductoInventario[] = [];
  productosFiltrados: ProductoInventario[] = [];

  cargando = false;
  mensajeError = '';

  private readonly inventarioApi = 'http://localhost:3000/inventario';
  private readonly productosApi = 'http://localhost:3000/productos';
  private readonly tiendasApi = 'http://localhost:3000/tiendas';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.cargarInventario();
  }

  get categorias(): string[] {
    return [...new Set(this.productos.map((p) => p.categoria))].sort();
  }

  get sucursales(): string[] {
    return [...new Set(this.productos.map((p) => p.sucursal))].sort();
  }

  get totalProductos(): number {
    return this.productos.length;
  }

  get totalUnidades(): number {
    return this.productos.reduce((total, p) => total + p.existencia, 0);
  }

  get productosStockBajo(): number {
    return this.productos.filter((p) => p.estado === 'bajo').length;
  }

  get productosAgotados(): number {
    return this.productos.filter((p) => p.estado === 'agotado').length;
  }

  get valorInventario(): number {
    return this.productos.reduce((total, p) => total + p.existencia * p.precio, 0);
  }

  cargarInventario(): void {
  this.cargando = true;
  this.mensajeError = '';

  this.http.get<InventarioBackend[]>(this.inventarioApi).subscribe({
    next: (inventario) => {
      console.log('Inventario recibido:', inventario);

      this.productos = inventario
        .map((item) => this.mapearInventario(item))
        .filter((item): item is ProductoInventario => item !== null);

      this.aplicarFiltros();
      this.cargando = false;
    },
    error: (error) => {
      console.error(error);
      this.mensajeError = 'No fue posible cargar el inventario.';
      this.cargando = false;
    },
  });
}

  aplicarFiltros(): void {
    const texto = this.normalizarTexto(this.busqueda);

    this.productosFiltrados = this.productos.filter((producto) => {
      const coincideBusqueda =
        !texto ||
        this.normalizarTexto(producto.nombre).includes(texto) ||
        this.normalizarTexto(producto.categoria).includes(texto) ||
        this.normalizarTexto(producto.sucursal).includes(texto);

      const coincideCategoria =
        this.categoriaSeleccionada === 'todas' || producto.categoria === this.categoriaSeleccionada;

      const coincideSucursal =
        this.sucursalSeleccionada === 'todas' || producto.sucursal === this.sucursalSeleccionada;

      const coincideEstado =
        this.estadoSeleccionado === 'todos' || producto.estado === this.estadoSeleccionado;

      return coincideBusqueda && coincideCategoria && coincideSucursal && coincideEstado;
    });
  }

  limpiarFiltros(): void {
    this.busqueda = '';
    this.categoriaSeleccionada = 'todas';
    this.sucursalSeleccionada = 'todas';
    this.estadoSeleccionado = 'todos';
    this.aplicarFiltros();
  }

  obtenerTextoEstado(estado: EstadoInventario): string {
    if (estado === 'agotado') return 'Agotado';
    if (estado === 'bajo') return 'Stock bajo';
    return 'Disponible';
  }

  obtenerClaseEstado(estado: EstadoInventario): string {
    return estado;
  }

  obtenerIconoCategoria(categoria: string): string {
    const texto = this.normalizarTexto(categoria);

    if (texto.includes('bebida') || texto.includes('refresco') || texto.includes('agua')) {
      return '🥤';
    }

    if (texto.includes('botana') || texto.includes('snack') || texto.includes('papas')) {
      return '🍟';
    }

    if (texto.includes('dulce') || texto.includes('chocolate')) {
      return '🍫';
    }

    if (texto.includes('pan') || texto.includes('galleta')) {
      return '🍪';
    }

    if (texto.includes('leche') || texto.includes('lacteo')) {
      return '🥛';
    }

    if (texto.includes('limpieza')) {
      return '🧼';
    }

    return '📦';
  }

  private mapearInventario(item: InventarioBackend): ProductoInventario | null {
    if (!item.productoId || !item.tiendaId) {
      return null;
    }

    const producto = item.productoId;
    const tienda = item.tiendaId;

    const minimo = Number(producto.stockMinimo ?? 5);
    const existencia = Number(item.piezas ?? 0);
    const precio = Number(producto.precio ?? 0);

    return {
      id: item._id,
      productoId: producto._id,
      tiendaId: tienda._id,
      nombre: producto.codigo ? `${producto.codigo} - ${producto.nombre}` : producto.nombre,
      categoria: producto.categoria,
      sucursal: tienda.ciudad ? `${tienda.nombre} - ${tienda.ciudad}` : tienda.nombre,
      existencia,
      minimo,
      precio,
      estado: this.calcularEstado(existencia, minimo),
    };
  }

  private calcularEstado(existencia: number, minimo: number): EstadoInventario {
    if (existencia <= 0) return 'agotado';
    if (existencia <= minimo) return 'bajo';
    return 'disponible';
  }

  private normalizarTexto(texto: string): string {
    return (texto || '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}
