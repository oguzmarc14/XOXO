import { CommonModule } from '@angular/common';

import {
  Component,
  OnInit
} from '@angular/core';

import {
  FormsModule
} from '@angular/forms';

import {
  Router,
  RouterLink
} from '@angular/router';

interface ProductoNuevo {
  id: number;
  codigo: string;
  nombre: string;
  categoria: string;
  descripcion: string;
  precio: number;
  stockInicial: number;
  stockMinimo: number;
  estado: 'activo' | 'inactivo';
  icono: string;
  fechaCreacion: string;
}

@Component({
  selector: 'app-crear-producto',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './crear-producto.html',
  styleUrl: './crear-producto.css'
})
export class CrearProducto implements OnInit {
  codigo = '';
  nombre = '';
  categoria = '';
  descripcion = '';

  precio: number | null = null;
  stockInicial: number | null = null;
  stockMinimo: number | null = null;

  estado: 'activo' | 'inactivo' =
    'activo';

  icono = '📦';

  guardando = false;

  mensajeError = '';
  mensajeExito = '';

  categorias = [
    {
      nombre: 'Playeras',
      icono: '👕'
    },
    {
      nombre: 'Sudaderas',
      icono: '🧥'
    },
    {
      nombre: 'Accesorios',
      icono: '👜'
    },
    {
      nombre: 'Coleccionables',
      icono: '🎁'
    },
    {
      nombre: 'Gorras',
      icono: '🧢'
    },
    {
      nombre: 'Otros',
      icono: '📦'
    }
  ];

  constructor(
    private router: Router
  ) {}

  ngOnInit(): void {
    this.generarCodigo();
  }

  get nombreVistaPrevia(): string {
    return this.nombre.trim() ||
      'Nombre del producto';
  }

  get categoriaVistaPrevia(): string {
    return this.categoria ||
      'Categoría sin seleccionar';
  }

  get descripcionVistaPrevia(): string {
    return this.descripcion.trim() ||
      'Agrega una descripción para mostrar los detalles del producto.';
  }

  get precioVistaPrevia(): number {
    return Number(this.precio) || 0;
  }

  get stockVistaPrevia(): number {
    return Number(this.stockInicial) || 0;
  }

  get stockMinimoVistaPrevia(): number {
    return Number(this.stockMinimo) || 0;
  }

  get estadoStock(): string {
    if (this.stockVistaPrevia <= 0) {
      return 'agotado';
    }

    if (
      this.stockVistaPrevia <=
      this.stockMinimoVistaPrevia
    ) {
      return 'bajo';
    }

    return 'disponible';
  }

  get textoEstadoStock(): string {
    if (this.estadoStock === 'agotado') {
      return 'Agotado';
    }

    if (this.estadoStock === 'bajo') {
      return 'Stock bajo';
    }

    return 'Disponible';
  }

  seleccionarCategoria(
    categoria: {
      nombre: string;
      icono: string;
    }
  ): void {
    this.categoria = categoria.nombre;
    this.icono = categoria.icono;

    this.actualizarCodigoPorCategoria();

    this.mensajeError = '';
    this.mensajeExito = '';
  }

  seleccionarEstado(
    estadoSeleccionado:
      'activo' | 'inactivo'
  ): void {
    this.estado = estadoSeleccionado;
  }

  generarCodigo(): void {
    const consecutivo =
      Math.floor(
        1000 + Math.random() * 9000
      );

    this.codigo =
      `XO-PR-${consecutivo}`;
  }

  guardarProducto(): void {
    this.mensajeError = '';
    this.mensajeExito = '';

    if (!this.codigo.trim()) {
      this.mensajeError =
        'El código del producto es obligatorio.';

      return;
    }

    if (!this.nombre.trim()) {
      this.mensajeError =
        'El nombre del producto es obligatorio.';

      return;
    }

    if (
      this.nombre.trim().length < 3
    ) {
      this.mensajeError =
        'El nombre debe contener al menos 3 caracteres.';

      return;
    }

    if (!this.categoria) {
      this.mensajeError =
        'Selecciona una categoría.';

      return;
    }

    if (!this.descripcion.trim()) {
      this.mensajeError =
        'La descripción del producto es obligatoria.';

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

    if (
      this.stockInicial === null ||
      Number(this.stockInicial) < 0
    ) {
      this.mensajeError =
        'El stock inicial no puede ser negativo.';

      return;
    }

    if (
      this.stockMinimo === null ||
      Number(this.stockMinimo) < 0
    ) {
      this.mensajeError =
        'El stock mínimo no puede ser negativo.';

      return;
    }

    this.guardando = true;

    try {
      const producto:
        ProductoNuevo = {
          id: Date.now(),

          codigo:
            this.codigo
              .trim()
              .toUpperCase(),

          nombre:
            this.nombre.trim(),

          categoria:
            this.categoria,

          descripcion:
            this.descripcion.trim(),

          precio:
            Number(this.precio),

          stockInicial:
            Number(this.stockInicial),

          stockMinimo:
            Number(this.stockMinimo),

          estado:
            this.estado,

          icono:
            this.icono,

          fechaCreacion:
            new Date().toISOString()
        };

      const productosGuardados =
        this.obtenerProductosGuardados();

      productosGuardados.unshift(
        producto
      );

      localStorage.setItem(
        'xoxo_productos',
        JSON.stringify(
          productosGuardados
        )
      );

      this.mensajeExito =
        'El producto se registró correctamente.';

      setTimeout(() => {
        this.router.navigate([
          '/lista-productos'
        ]);
      }, 900);
    } catch {
      this.mensajeError =
        'No fue posible guardar el producto.';
    } finally {
      this.guardando = false;
    }
  }

  limpiarFormulario(): void {
    this.nombre = '';
    this.categoria = '';
    this.descripcion = '';

    this.precio = null;
    this.stockInicial = null;
    this.stockMinimo = null;

    this.estado = 'activo';
    this.icono = '📦';

    this.mensajeError = '';
    this.mensajeExito = '';

    this.generarCodigo();
  }

  private actualizarCodigoPorCategoria():
    void {
    const prefijos:
      Record<string, string> = {
        Playeras: 'PL',
        Sudaderas: 'SD',
        Accesorios: 'AC',
        Coleccionables: 'CL',
        Gorras: 'GR',
        Otros: 'OT'
      };

    const prefijo =
      prefijos[this.categoria] || 'PR';

    const consecutivo =
      Math.floor(
        1000 + Math.random() * 9000
      );

    this.codigo =
      `XO-${prefijo}-${consecutivo}`;
  }

  private obtenerProductosGuardados():
    ProductoNuevo[] {
    const informacion =
      localStorage.getItem(
        'xoxo_productos'
      );

    if (!informacion) {
      return [];
    }

    try {
      return JSON.parse(
        informacion
      ) as ProductoNuevo[];
    } catch {
      return [];
    }
  }
}