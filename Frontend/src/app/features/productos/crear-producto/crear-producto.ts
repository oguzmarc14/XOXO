import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ProductosService } from '../../../core/services/productos';
import { UsuarioActualService } from '../../../core/services/usuario-actual';

@Component({
  selector: 'app-crear-producto',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './crear-producto.html',
  styleUrl: './crear-producto.css'
})
export class CrearProducto implements OnInit {
  codigo: number | null = null;
  nombre = '';
  categoria = '';
  precio: number | null = null;
  stockMinimo: number | null = 5;

  guardando = false;
  mensajeError = '';
  mensajeExito = '';

  private tiendaId: string | undefined;

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
    private usuarioActualService: UsuarioActualService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const usuario = this.usuarioActualService.obtenerUsuario();
    if (usuario.rol === 'gerente') {
      this.tiendaId = usuario.tiendaId;
    }
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

  seleccionarCategoria(categoria: { nombre: string; icono: string }): void {
    this.categoria = categoria.nombre;
    this.mensajeError = '';
    this.mensajeExito = '';
  }

  guardarProducto(): void {
    this.mensajeError = '';
    this.mensajeExito = '';

    if (this.codigo === null || Number(this.codigo) <= 0) {
      this.mensajeError = 'El código del producto es obligatorio y debe ser mayor a cero.';
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

    if (this.stockMinimo === null || Number(this.stockMinimo) < 0) {
      this.mensajeError = 'El stock mínimo no puede ser negativo.';
      return;
    }

    this.guardando = true;

    this.productosService.create({
      codigo: Number(this.codigo),
      nombre: this.nombre.trim(),
      categoria: this.categoria,
      precio: Number(this.precio),
      stockMinimo: Number(this.stockMinimo),
      tiendaId: this.tiendaId
    }).subscribe({
      next: () => {
        this.mensajeExito = 'El producto se registró correctamente.';
        setTimeout(() => this.router.navigate(['/lista-productos']), 900);
      },
      error: () => {
        this.mensajeError = 'No fue posible guardar el producto. Verifica que el código no esté duplicado.';
        this.guardando = false;
      }
    });
  }

  limpiarFormulario(): void {
    this.codigo = null;
    this.nombre = '';
    this.categoria = '';
    this.precio = null;
    this.stockMinimo = 5;
    this.mensajeError = '';
    this.mensajeExito = '';
  }
}
