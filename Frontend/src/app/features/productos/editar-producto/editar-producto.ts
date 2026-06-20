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

type EstadoProducto =
  | 'activo'
  | 'inactivo';

interface ProductoEditable {
  id: number;
  codigo: string;
  nombre: string;
  categoria: string;
  descripcion: string;
  precio: number;
  stockInicial: number;
  stockMinimo: number;
  estado: EstadoProducto;
  icono: string;
  fechaCreacion: string;
  fechaActualizacion?: string;
}

interface CategoriaProducto {
  nombre: string;
  icono: string;
}

@Component({
  selector: 'app-editar-producto',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './editar-producto.html',
  styleUrl: './editar-producto.css'
})
export class EditarProducto implements OnInit {
  productoOriginal:
    ProductoEditable | null = null;

  codigo = '';
  nombre = '';
  categoria = '';
  descripcion = '';

  precio: number | null = null;
  stockInicial: number | null = null;
  stockMinimo: number | null = null;

  estado: EstadoProducto = 'activo';
  icono = '📦';

  guardando = false;
  productoEncontrado = false;

  mensajeError = '';
  mensajeExito = '';

  categorias:
    CategoriaProducto[] = [
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
    this.cargarProducto();
  }

  get nombreVistaPrevia(): string {
    return (
      this.nombre.trim() ||
      'Nombre del producto'
    );
  }

  get categoriaVistaPrevia(): string {
    return (
      this.categoria ||
      'Categoría sin seleccionar'
    );
  }

  get descripcionVistaPrevia(): string {
    return (
      this.descripcion.trim() ||
      'Agrega una descripción para mostrar los detalles del producto.'
    );
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

  get hayCambios(): boolean {
    if (!this.productoOriginal) {
      return false;
    }

    return (
      this.codigo.trim().toUpperCase() !==
        this.productoOriginal.codigo ||
      this.nombre.trim() !==
        this.productoOriginal.nombre ||
      this.categoria !==
        this.productoOriginal.categoria ||
      this.descripcion.trim() !==
        this.productoOriginal.descripcion ||
      Number(this.precio) !==
        this.productoOriginal.precio ||
      Number(this.stockInicial) !==
        this.productoOriginal.stockInicial ||
      Number(this.stockMinimo) !==
        this.productoOriginal.stockMinimo ||
      this.estado !==
        this.productoOriginal.estado ||
      this.icono !==
        this.productoOriginal.icono
    );
  }

  seleccionarCategoria(
    categoriaSeleccionada:
      CategoriaProducto
  ): void {
    this.categoria =
      categoriaSeleccionada.nombre;

    this.icono =
      categoriaSeleccionada.icono;

    this.mensajeError = '';
    this.mensajeExito = '';
  }

  seleccionarEstado(
    estadoSeleccionado:
      EstadoProducto
  ): void {
    this.estado =
      estadoSeleccionado;

    this.mensajeError = '';
    this.mensajeExito = '';
  }

  guardarCambios(): void {
    this.mensajeError = '';
    this.mensajeExito = '';

    if (!this.productoOriginal) {
      this.mensajeError =
        'No se encontró el producto que deseas editar.';

      return;
    }

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
        'La existencia no puede ser negativa.';

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

    if (!this.hayCambios) {
      this.mensajeError =
        'No se detectaron cambios para guardar.';

      return;
    }

    const productos =
      this.obtenerProductosGuardados();

    const indiceProducto =
      productos.findIndex(
        producto =>
          producto.id ===
          this.productoOriginal?.id
      );

    if (indiceProducto === -1) {
      this.mensajeError =
        'El producto ya no existe en el catálogo.';

      return;
    }

    const codigoNormalizado =
      this.codigo
        .trim()
        .toUpperCase();

    const codigoDuplicado =
      productos.some(
        producto =>
          producto.id !==
            this.productoOriginal?.id &&
          producto.codigo
            .trim()
            .toUpperCase() ===
            codigoNormalizado
      );

    if (codigoDuplicado) {
      this.mensajeError =
        'Ya existe otro producto con ese código.';

      return;
    }

    this.guardando = true;

    try {
      const productoActualizado:
        ProductoEditable = {
          ...this.productoOriginal,

          codigo:
            codigoNormalizado,

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

          fechaActualizacion:
            new Date().toISOString()
        };

      productos[indiceProducto] =
        productoActualizado;

      localStorage.setItem(
        'xoxo_productos',
        JSON.stringify(productos)
      );

      localStorage.setItem(
        'xoxo_producto_editar',
        JSON.stringify(
          productoActualizado
        )
      );

      this.productoOriginal = {
        ...productoActualizado
      };

      this.mensajeExito =
        'Los cambios del producto se guardaron correctamente.';

      setTimeout(() => {
        this.router.navigate([
          '/lista-productos'
        ]);
      }, 900);
    } catch {
      this.mensajeError =
        'No fue posible actualizar el producto.';
    } finally {
      this.guardando = false;
    }
  }

  restaurarDatos(): void {
    if (!this.productoOriginal) {
      return;
    }

    this.cargarFormulario(
      this.productoOriginal
    );

    this.mensajeError = '';
    this.mensajeExito = '';
  }

  volverAlListado(): void {
    this.router.navigate([
      '/lista-productos'
    ]);
  }

  private cargarProducto(): void {
    const productoGuardado =
      localStorage.getItem(
        'xoxo_producto_editar'
      );

    if (!productoGuardado) {
      this.productoEncontrado = false;

      this.mensajeError =
        'No se seleccionó ningún producto para editar.';

      return;
    }

    try {
      const producto =
        JSON.parse(
          productoGuardado
        ) as ProductoEditable;

      if (
        !producto ||
        producto.id === undefined
      ) {
        throw new Error(
          'Producto inválido'
        );
      }

      this.productoOriginal = {
        ...producto
      };

      this.productoEncontrado = true;

      this.cargarFormulario(
        producto
      );
    } catch {
      this.productoEncontrado = false;

      this.mensajeError =
        'No fue posible cargar la información del producto.';
    }
  }

  private cargarFormulario(
    producto: ProductoEditable
  ): void {
    this.codigo =
      producto.codigo;

    this.nombre =
      producto.nombre;

    this.categoria =
      producto.categoria;

    this.descripcion =
      producto.descripcion;

    this.precio =
      producto.precio;

    this.stockInicial =
      producto.stockInicial;

    this.stockMinimo =
      producto.stockMinimo;

    this.estado =
      producto.estado;

    this.icono =
      producto.icono || '📦';
  }

  private obtenerProductosGuardados():
    ProductoEditable[] {
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
      ) as ProductoEditable[];
    } catch {
      return [];
    }
  }
}
