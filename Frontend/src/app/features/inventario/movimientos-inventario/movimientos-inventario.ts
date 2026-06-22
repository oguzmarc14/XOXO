import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface ProductoBackend {
  _id: string;
  nombre: string;
  precio: number;
  categoria: string;
  stockMinimo?: number;
}

interface TiendaBackend {
  _id: string;
  nombre: string;
  direccion: string;
  ciudad: string;
  telefono: string;
}

interface InventarioBackend {
  _id: string;
  tiendaId: string;
  productoId: string;
  piezas: number;
}

interface InventarioListado {
  _id: string;
  tiendaId: string;
  productoId: string;
  tienda: string;
  producto: string;
  categoria: string;
  precio: number;
  piezas: number;
}

@Component({
  selector: 'app-movimientos-inventario',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './movimientos-inventario.html',
  styleUrl: './movimientos-inventario.css'
})
export class MovimientosInventario implements OnInit {
  busqueda = '';
  tiendaSeleccionada = 'todas';
  productoSeleccionado = '';

  tiendaId = '';
  productoId = '';
  piezas: number | null = null;

  inventario: InventarioListado[] = [];
  inventarioFiltrado: InventarioListado[] = [];

  productos: ProductoBackend[] = [];
  tiendas: TiendaBackend[] = [];

  modalMovimientoAbierto = false;
  guardando = false;
  cargando = false;

  mensajeError = '';
  mensajeExito = '';

  private readonly inventarioApi = 'http://localhost:3000/inventario';
  private readonly productosApi = 'http://localhost:3000/productos';
  private readonly tiendasApi = 'http://localhost:3000/tiendas';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  get totalRegistros(): number {
    return this.inventario.length;
  }

  get totalPiezas(): number {
    return this.inventario.reduce(
      (total, item) => total + item.piezas,
      0
    );
  }

  get productosDistintos(): number {
    return new Set(
      this.inventario.map(item => item.productoId)
    ).size;
  }

  get tiendasDistintas(): number {
    return new Set(
      this.inventario.map(item => item.tiendaId)
    ).size;
  }

  get valorInventario(): number {
    return this.inventario.reduce(
      (total, item) => total + item.piezas * item.precio,
      0
    );
  }

  get tiendasFiltro(): string[] {
    return [
      ...new Set(
        this.inventario.map(item => item.tienda)
      )
    ].sort();
  }

  cargarDatos(): void {
    this.cargando = true;
    this.mensajeError = '';

    this.http.get<ProductoBackend[]>(this.productosApi).subscribe({
      next: productos => {
        this.productos = productos;

        this.http.get<TiendaBackend[]>(this.tiendasApi).subscribe({
          next: tiendas => {
            this.tiendas = tiendas;
            this.cargarInventario();
          },
          error: error => {
            console.error(error);
            this.mensajeError = 'No fue posible cargar las tiendas.';
            this.cargando = false;
          }
        });
      },
      error: error => {
        console.error(error);
        this.mensajeError = 'No fue posible cargar los productos.';
        this.cargando = false;
      }
    });
  }

  cargarInventario(): void {
    this.http.get<InventarioBackend[]>(this.inventarioApi).subscribe({
      next: inventarioBackend => {
        this.inventario = inventarioBackend
          .map(item => this.mapearInventario(item))
          .filter(
            (item): item is InventarioListado => item !== null
          );

        this.aplicarFiltros();
        this.cargando = false;
      },
      error: error => {
        console.error(error);
        this.mensajeError = 'No fue posible cargar el inventario.';
        this.cargando = false;
      }
    });
  }

  aplicarFiltros(): void {
    const texto = this.normalizarTexto(this.busqueda);

    this.inventarioFiltrado = this.inventario.filter(item => {
      const coincideBusqueda =
        !texto ||
        this.normalizarTexto(item.producto).includes(texto) ||
        this.normalizarTexto(item.categoria).includes(texto) ||
        this.normalizarTexto(item.tienda).includes(texto);

      const coincideTienda =
        this.tiendaSeleccionada === 'todas' ||
        item.tienda === this.tiendaSeleccionada;

      return coincideBusqueda && coincideTienda;
    });
  }

  limpiarFiltros(): void {
    this.busqueda = '';
    this.tiendaSeleccionada = 'todas';
    this.aplicarFiltros();
  }

  abrirModalMovimiento(): void {
    this.limpiarFormulario();
    this.modalMovimientoAbierto = true;
  }

  cerrarModalMovimiento(): void {
    if (this.guardando) return;

    this.modalMovimientoAbierto = false;
    this.mensajeError = '';
  }

  registrarMovimiento(): void {
    this.mensajeError = '';
    this.mensajeExito = '';

    if (!this.tiendaId) {
      this.mensajeError = 'Selecciona una tienda.';
      return;
    }

    if (!this.productoId) {
      this.mensajeError = 'Selecciona un producto.';
      return;
    }

    if (
      this.piezas === null ||
      this.piezas === undefined ||
      Number(this.piezas) < 0
    ) {
      this.mensajeError = 'Ingresa una cantidad válida de piezas.';
      return;
    }

    const nuevoInventario = {
      tiendaId: this.tiendaId,
      productoId: this.productoId,
      piezas: Number(this.piezas)
    };

    this.guardando = true;

    this.http.post<InventarioBackend>(this.inventarioApi, nuevoInventario)
      .subscribe({
        next: () => {
          this.mensajeExito = 'Inventario registrado correctamente.';
          this.modalMovimientoAbierto = false;
          this.cargarInventario();
        },
        error: error => {
          console.error(error);

          this.mensajeError =
            error.error?.message ||
            'No fue posible registrar el inventario.';

          this.guardando = false;
        },
        complete: () => {
          this.guardando = false;
        }
      });
  }

  obtenerIconoCategoria(categoria: string): string {
    const texto = this.normalizarTexto(categoria);

    if (texto.includes('bebida') || texto.includes('refresco') || texto.includes('agua')) return '🥤';
    if (texto.includes('botana') || texto.includes('snack') || texto.includes('papas')) return '🍟';
    if (texto.includes('dulce') || texto.includes('chocolate')) return '🍫';
    if (texto.includes('pan') || texto.includes('galleta')) return '🍪';
    if (texto.includes('leche') || texto.includes('lacteo')) return '🥛';
    if (texto.includes('limpieza')) return '🧼';

    return '📦';
  }

  private mapearInventario(
    item: InventarioBackend
  ): InventarioListado | null {
    const producto = this.productos.find(
      prod => prod._id === item.productoId
    );

    const tienda = this.tiendas.find(
      sucursal => sucursal._id === item.tiendaId
    );

    if (!producto || !tienda) return null;

    return {
      _id: item._id,
      tiendaId: item.tiendaId,
      productoId: item.productoId,
      tienda: `${tienda.nombre} - ${tienda.ciudad}`,
      producto: producto.nombre,
      categoria: producto.categoria,
      precio: producto.precio,
      piezas: item.piezas
    };
  }

  private limpiarFormulario(): void {
    this.tiendaId = '';
    this.productoId = '';
    this.piezas = null;
    this.mensajeError = '';
    this.mensajeExito = '';
  }

  private normalizarTexto(texto: string): string {
    return texto
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}