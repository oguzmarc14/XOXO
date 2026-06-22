import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductosService } from '../../../core/services/productos';
import { Producto } from '../../../core/models/producto.model';

@Component({
  selector: 'app-editar-producto',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './editar-producto.html',
  styleUrl: './editar-producto.css'
})
export class EditarProducto implements OnInit {
  productoOriginal: Producto | null = null;

  nombre = '';
  categoria = '';
  precio: number | null = null;

  guardando = false;
  productoEncontrado = false;
  mensajeError = '';
  mensajeExito = '';

  categorias = [
    { nombre: 'Playeras',       icono: '👕' },
    { nombre: 'Sudaderas',      icono: '🧥' },
    { nombre: 'Accesorios',     icono: '👜' },
    { nombre: 'Coleccionables', icono: '🎁' },
    { nombre: 'Gorras',         icono: '🧢' },
    { nombre: 'Otros',          icono: '📦' }
  ];

  constructor(
    private productosService: ProductosService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.mensajeError = 'No se seleccionó ningún producto para editar.';
      return;
    }
    this.cargarProducto(id);
  }

  get nombreVistaPrevia(): string {
    return this.nombre.trim() || 'Nombre del producto';
  }

  get categoriaVistaPrevia(): string {
    return this.categoria || 'Categoría sin seleccionar';
  }

  get precioVistaPrevia(): number {
    return Number(this.precio) || 0;
  }

  get iconoCategoria(): string {
    return this.categorias.find(c => c.nombre === this.categoria)?.icono ?? '📦';
  }

  get hayCambios(): boolean {
    if (!this.productoOriginal) return false;
    return (
      this.nombre.trim() !== this.productoOriginal.nombre ||
      this.categoria !== this.productoOriginal.categoria ||
      Number(this.precio) !== this.productoOriginal.precio
    );
  }

  seleccionarCategoria(categoria: { nombre: string; icono: string }): void {
    this.categoria = categoria.nombre;
    this.mensajeError = '';
    this.mensajeExito = '';
  }

  guardarCambios(): void {
    this.mensajeError = '';
    this.mensajeExito = '';

    if (!this.productoOriginal) {
      this.mensajeError = 'No se encontró el producto que deseas editar.';
      return;
    }

    if (!this.nombre.trim()) {
      this.mensajeError = 'El nombre del producto es obligatorio.';
      return;
    }

    if (this.nombre.trim().length < 3) {
      this.mensajeError = 'El nombre debe contener al menos 3 caracteres.';
      return;
    }

    if (!this.categoria) {
      this.mensajeError = 'Selecciona una categoría.';
      return;
    }

    if (this.precio === null || Number(this.precio) <= 0) {
      this.mensajeError = 'El precio debe ser mayor a cero.';
      return;
    }

    if (!this.hayCambios) {
      this.mensajeError = 'No se detectaron cambios para guardar.';
      return;
    }

    this.guardando = true;

    this.productosService.update(this.productoOriginal._id, {
      nombre: this.nombre.trim(),
      categoria: this.categoria,
      precio: Number(this.precio)
    }).subscribe({
      next: () => {
        this.mensajeExito = 'Los cambios del producto se guardaron correctamente.';
        setTimeout(() => this.router.navigate(['/lista-productos']), 900);
      },
      error: () => {
        this.mensajeError = 'No fue posible actualizar el producto.';
        this.guardando = false;
      }
    });
  }

  restaurarDatos(): void {
    if (!this.productoOriginal) return;
    this.cargarFormulario(this.productoOriginal);
    this.mensajeError = '';
    this.mensajeExito = '';
  }

  volverAlListado(): void {
    this.router.navigate(['/lista-productos']);
  }

  private cargarProducto(id: string): void {
    this.productosService.getById(id).subscribe({
      next: (producto) => {
        this.productoOriginal = producto;
        this.productoEncontrado = true;
        this.cargarFormulario(producto);
      },
      error: () => {
        this.productoEncontrado = false;
        this.mensajeError = 'No fue posible cargar la información del producto.';
      }
    });
  }

  private cargarFormulario(producto: Producto): void {
    this.nombre = producto.nombre;
    this.categoria = producto.categoria;
    this.precio = producto.precio;
  }
}
