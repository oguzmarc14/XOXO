import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ProductosService } from '../../../core/services/productos';

@Component({
  selector: 'app-crear-producto',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './crear-producto.html',
  styleUrl: './crear-producto.css'
})
export class CrearProducto {
  nombre = '';
  codigo: number | null = null;
  categoria = '';
  precio: number | null = null;

  guardando = false;
  mensajeError = '';
  mensajeExito = '';

  categorias = [
    { nombre: 'Playeras', icono: '👕' },
    { nombre: 'Sudaderas', icono: '🧥' },
    { nombre: 'Accesorios', icono: '👜' },
    { nombre: 'Coleccionables', icono: '🎁' },
    { nombre: 'Gorras', icono: '🧢' },
    { nombre: 'Otros', icono: '📦' }
  ];

  constructor(
    private productosService: ProductosService,
    private router: Router
  ) {}

  get nombreVistaPrevia(): string {
    return this.nombre.trim() || 'Nombre del producto';
  }

  get categoriaVistaPrevia(): string {
    return this.categoria || 'Categoría sin seleccionar';
  }

  get precioVistaPrevia(): number {
    return Number(this.precio) || 0;
  }

  get codigoVistaPrevia(): string {
    return this.codigo?.toString() || 'Sin código';
  }

  get iconoCategoria(): string {
    return (
      this.categorias.find(
        c => c.nombre === this.categoria
      )?.icono ?? '📦'
    );
  }

  seleccionarCategoria(
    categoria: {
      nombre: string;
      icono: string;
    }
  ): void {
    this.categoria = categoria.nombre;
    this.mensajeError = '';
    this.mensajeExito = '';
  }

  guardarProducto(): void {
    this.mensajeError = '';
    this.mensajeExito = '';

    if (!this.nombre.trim()) {
      this.mensajeError =
        'El nombre del producto es obligatorio.';
      return;
    }

    if (this.nombre.trim().length < 3) {
      this.mensajeError =
        'El nombre debe contener al menos 3 caracteres.';
      return;
    }

    if (
      this.codigo === null ||
      this.codigo <= 0
    ) {
      this.mensajeError =
        'El código del producto es obligatorio.';
      return;
    }

    if (!this.categoria) {
      this.mensajeError =
        'Selecciona una categoría.';
      return;
    }

    if (
      this.precio === null ||
      Number(this.precio) <= 0
    ) {
      this.mensajeError =
        'El precio debe ser mayor a cero.';
      return;
    }

    this.guardando = true;

    this.productosService.create({
      nombre: this.nombre.trim(),
      codigo: Number(this.codigo),
      categoria: this.categoria,
      precio: Number(this.precio)
    }).subscribe({
      next: () => {
        this.mensajeExito =
          'El producto se registró correctamente.';

        setTimeout(() => {
          this.router.navigate([
            '/lista-productos'
          ]);
        }, 900);
      },

      error: (error) => {
        console.error(error);

        this.mensajeError =
          'No fue posible guardar el producto.';

        this.guardando = false;
      }
    });
  }

  limpiarFormulario(): void {
    this.nombre = '';
    this.codigo = null;
    this.categoria = '';
    this.precio = null;
    this.mensajeError = '';
    this.mensajeExito = '';
  }
}