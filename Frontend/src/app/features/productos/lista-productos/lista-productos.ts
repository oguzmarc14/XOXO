import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductosService } from '../../../core/services/productos';
import { UsuarioActualService } from '../../../core/services/usuario-actual';
import { Producto } from '../../../core/models/producto.model';

@Component({
  selector: 'app-lista-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lista-productos.html',
  styleUrl: './lista-productos.css'
})
export class ListaProductos implements OnInit {
  busqueda = '';
  categoriaSeleccionada = 'todas';

  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];

  cargando = false;
  mensajeExito = '';
  mensajeError = '';

  modalEliminarAbierto = false;
  productoSeleccionado: Producto | null = null;

  private tiendaId: string | undefined;

  constructor(
    private productosService: ProductosService,
    private usuarioActualService: UsuarioActualService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const usuario = this.usuarioActualService.obtenerUsuario();
    if (usuario.rol === 'gerente') {
      this.tiendaId = usuario.tiendaId;
    }
    this.cargarProductos();
  }

  get categorias(): string[] {
    return [...new Set(this.productos.map(p => p.categoria))].sort();
  }

  get totalProductos(): number {
    return this.productos.length;
  }

  aplicarFiltros(): void {
    const texto = this.normalizarTexto(this.busqueda);
    this.productosFiltrados = this.productos.filter(producto => {
      const coincideBusqueda =
        !texto ||
        this.normalizarTexto(producto.nombre).includes(texto) ||
        this.normalizarTexto(producto.categoria).includes(texto) ||
        String(producto.codigo).includes(texto);

      const coincideCategoria =
        this.categoriaSeleccionada === 'todas' ||
        producto.categoria === this.categoriaSeleccionada;

      return coincideBusqueda && coincideCategoria;
    });
  }

  limpiarFiltros(): void {
    this.busqueda = '';
    this.categoriaSeleccionada = 'todas';
    this.aplicarFiltros();
  }

  crearProducto(): void {
    this.router.navigate(['/crear-producto']);
  }

  editarProducto(producto: Producto): void {
    this.router.navigate(['/editar-producto', producto._id]);
  }

  abrirEliminar(producto: Producto): void {
    this.productoSeleccionado = producto;
    this.modalEliminarAbierto = true;
  }

  cerrarEliminar(): void {
    this.modalEliminarAbierto = false;
    this.productoSeleccionado = null;
  }

  confirmarEliminar(): void {
    if (!this.productoSeleccionado) return;

    const id = this.productoSeleccionado._id;
    this.cerrarEliminar();

    this.productosService.delete(id).subscribe({
      next: () => {
        this.productos = this.productos.filter(p => p._id !== id);
        this.aplicarFiltros();
        this.mensajeExito = 'El producto fue eliminado correctamente.';
        this.ocultarMensaje();
      },
      error: () => {
        this.mensajeError = 'No fue posible eliminar el producto.';
        this.ocultarMensaje();
      }
    });
  }

  private cargarProductos(): void {
    this.cargando = true;
    this.productosService.getAll(this.tiendaId).subscribe({
      next: (productos) => {
        this.productos = productos;
        this.aplicarFiltros();
        this.cargando = false;
      },
      error: () => {
        this.mensajeError = 'No fue posible cargar los productos.';
        this.cargando = false;
      }
    });
  }

  private normalizarTexto(texto: string): string {
    return texto
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '');
  }

  private ocultarMensaje(): void {
    setTimeout(() => {
      this.mensajeExito = '';
      this.mensajeError = '';
    }, 2500);
  }
}
