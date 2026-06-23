import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { ProductosService } from '../../../core/services/productos';
import { UsuarioActualService } from '../../../core/services/usuario-actual';

interface TiendaOpcion {
  _id: string;
  nombre: string;
  ciudad: string;
}

@Component({
  selector: 'app-crear-producto',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './crear-producto.html',
  styleUrl: './crear-producto.css',
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

  esAdmin = false;
  tiendas: TiendaOpcion[] = [];
  tiendaSeleccionada = '';

  private tiendaIdGerente = '';

  categorias = [
    { nombre: 'Playeras', icono: '👕' },
    { nombre: 'Sudaderas', icono: '🧥' },
    { nombre: 'Accesorios', icono: '👜' },
    { nombre: 'Coleccionables', icono: '🎁' },
    { nombre: 'Gorras', icono: '🧢' },
    { nombre: 'Otros', icono: '📦' },
  ];

  constructor(
    private productosService: ProductosService,
    private usuarioActualService: UsuarioActualService,
    private http: HttpClient,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const usuario = this.usuarioActualService.obtenerUsuario();

    if (usuario.rol === 'admin') {
      this.esAdmin = true;
      this.http.get<TiendaOpcion[]>('http://localhost:3000/tiendas').subscribe({
        next: (tiendas) => {
          this.tiendas = tiendas;
        },
        error: () => {
          this.mensajeError = 'No se pudieron cargar las tiendas.';
        },
      });
    } else if (usuario.rol === 'gerente') {
      this.tiendaIdGerente = usuario.tiendaId || '';
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
    return this.categorias.find((c) => c.nombre === this.categoria)?.icono ?? '📦';
  }

  get tiendaVistaPrevia(): string {
    if (!this.esAdmin) return '';
    const tienda = this.tiendas.find((t) => t._id === this.tiendaSeleccionada);
    return tienda ? `${tienda.nombre} — ${tienda.ciudad}` : 'Sin tienda asignada';
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

    if (this.esAdmin && !this.tiendaSeleccionada) {
      this.mensajeError = 'Selecciona la tienda a la que pertenece el producto.';
      return;
    }

    this.guardando = true;

    const tiendaId = this.esAdmin ? this.tiendaSeleccionada : this.tiendaIdGerente || '';

    if (!tiendaId) {
      this.mensajeError = this.esAdmin
        ? 'Selecciona la tienda a la que pertenece el producto.'
        : 'Tu usuario no tiene una tienda asignada.';

      this.guardando = false;
      return;
    }

    this.productosService
      .create({
        codigo: Number(this.codigo),
        nombre: this.nombre.trim(),
        categoria: this.categoria,
        precio: Number(this.precio),
        stockMinimo: Number(this.stockMinimo),
        tiendaId,
      })
      .subscribe({
        next: () => {
          this.mensajeExito = 'El producto se registró correctamente.';
          setTimeout(() => this.router.navigate(['/lista-productos']), 900);
        },
        error: () => {
          this.mensajeError =
            'No fue posible guardar el producto. Verifica que el código no esté duplicado.';
          this.guardando = false;
        },
      });
  }

  limpiarFormulario(): void {
    this.codigo = null;
    this.nombre = '';
    this.categoria = '';
    this.precio = null;
    this.stockMinimo = 5;
    this.tiendaSeleccionada = '';
    this.mensajeError = '';
    this.mensajeExito = '';
  }
}
