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

interface ProductoListado {
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
}

@Component({
  selector: 'app-lista-productos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './lista-productos.html',
  styleUrl: './lista-productos.css'
})
export class ListaProductos implements OnInit {
  busqueda = '';
  categoriaSeleccionada = 'todas';
  estadoSeleccionado = 'todos';
  stockSeleccionado = 'todos';

  productos: ProductoListado[] = [];
  productosFiltrados: ProductoListado[] = [];

  mensajeExito = '';

  modalEliminarAbierto = false;
  productoSeleccionado:
    ProductoListado | null = null;

  private productosBase:
    ProductoListado[] = [
      {
        id: 1,
        codigo: 'XO-PL-001',
        nombre: 'Playera negra XoXO',
        categoria: 'Playeras',
        descripcion:
          'Playera negra con diseño oficial de XoXO.',
        precio: 249,
        stockInicial: 18,
        stockMinimo: 5,
        estado: 'activo',
        icono: '👕',
        fechaCreacion:
          '2026-06-10T12:00:00'
      },
      {
        id: 2,
        codigo: 'XO-PL-002',
        nombre: 'Playera blanca XoXO',
        categoria: 'Playeras',
        descripcion:
          'Playera blanca de algodón con logotipo XoXO.',
        precio: 249,
        stockInicial: 4,
        stockMinimo: 5,
        estado: 'activo',
        icono: '👕',
        fechaCreacion:
          '2026-06-10T12:20:00'
      },
      {
        id: 3,
        codigo: 'XO-SD-001',
        nombre: 'Sudadera vino',
        categoria: 'Sudaderas',
        descripcion:
          'Sudadera color vino con estampado frontal.',
        precio: 599,
        stockInicial: 2,
        stockMinimo: 4,
        estado: 'activo',
        icono: '🧥',
        fechaCreacion:
          '2026-06-11T09:30:00'
      },
      {
        id: 4,
        codigo: 'XO-SD-002',
        nombre: 'Sudadera negra',
        categoria: 'Sudaderas',
        descripcion:
          'Sudadera negra de manga larga con diseño XoXO.',
        precio: 599,
        stockInicial: 12,
        stockMinimo: 4,
        estado: 'activo',
        icono: '🧥',
        fechaCreacion:
          '2026-06-11T10:00:00'
      },
      {
        id: 5,
        codigo: 'XO-AC-001',
        nombre: 'Bolsa XoXO edición especial',
        categoria: 'Accesorios',
        descripcion:
          'Bolsa reutilizable de edición especial.',
        precio: 189,
        stockInicial: 1,
        stockMinimo: 3,
        estado: 'activo',
        icono: '👜',
        fechaCreacion:
          '2026-06-12T13:45:00'
      },
      {
        id: 6,
        codigo: 'XO-GR-001',
        nombre: 'Gorra bordada XoXO',
        categoria: 'Gorras',
        descripcion:
          'Gorra ajustable con logotipo bordado.',
        precio: 219,
        stockInicial: 0,
        stockMinimo: 4,
        estado: 'inactivo',
        icono: '🧢',
        fechaCreacion:
          '2026-06-12T15:20:00'
      },
      {
        id: 7,
        codigo: 'XO-CL-001',
        nombre: 'Taza oficial XoXO',
        categoria: 'Coleccionables',
        descripcion:
          'Taza de cerámica con diseño oficial.',
        precio: 159,
        stockInicial: 24,
        stockMinimo: 6,
        estado: 'activo',
        icono: '🎁',
        fechaCreacion:
          '2026-06-13T11:10:00'
      },
      {
        id: 8,
        codigo: 'XO-CL-002',
        nombre: 'Llavero metálico XoXO',
        categoria: 'Coleccionables',
        descripcion:
          'Llavero metálico con acabado brillante.',
        precio: 89,
        stockInicial: 0,
        stockMinimo: 8,
        estado: 'activo',
        icono: '🎁',
        fechaCreacion:
          '2026-06-13T12:00:00'
      }
    ];

  constructor(
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarProductos();
    this.aplicarFiltros();
  }

  get categorias(): string[] {
    return [
      ...new Set(
        this.productos.map(
          producto => producto.categoria
        )
      )
    ].sort();
  }

  get totalProductos(): number {
    return this.productos.length;
  }

  get productosActivos(): number {
    return this.productos.filter(
      producto =>
        producto.estado === 'activo'
    ).length;
  }

  get productosInactivos(): number {
    return this.productos.filter(
      producto =>
        producto.estado === 'inactivo'
    ).length;
  }

  get productosStockBajo(): number {
    return this.productos.filter(
      producto =>
        producto.stockInicial > 0 &&
        producto.stockInicial <=
          producto.stockMinimo
    ).length;
  }

  get productosAgotados(): number {
    return this.productos.filter(
      producto =>
        producto.stockInicial <= 0
    ).length;
  }

  get valorCatalogo(): number {
    return this.productos.reduce(
      (total, producto) =>
        total +
        producto.precio *
        producto.stockInicial,
      0
    );
  }

  aplicarFiltros(): void {
    const texto =
      this.normalizarTexto(this.busqueda);

    this.productosFiltrados =
      this.productos.filter(
        producto => {
          const coincideBusqueda =
            !texto ||
            this.normalizarTexto(
              producto.codigo
            ).includes(texto) ||
            this.normalizarTexto(
              producto.nombre
            ).includes(texto) ||
            this.normalizarTexto(
              producto.categoria
            ).includes(texto) ||
            this.normalizarTexto(
              producto.descripcion
            ).includes(texto);

          const coincideCategoria =
            this.categoriaSeleccionada ===
              'todas' ||
            producto.categoria ===
              this.categoriaSeleccionada;

          const coincideEstado =
            this.estadoSeleccionado ===
              'todos' ||
            producto.estado ===
              this.estadoSeleccionado;

          const coincideStock =
            this.coincideFiltroStock(
              producto
            );

          return (
            coincideBusqueda &&
            coincideCategoria &&
            coincideEstado &&
            coincideStock
          );
        }
      );
  }

  limpiarFiltros(): void {
    this.busqueda = '';
    this.categoriaSeleccionada = 'todas';
    this.estadoSeleccionado = 'todos';
    this.stockSeleccionado = 'todos';

    this.aplicarFiltros();
  }

  crearProducto(): void {
    this.router.navigate([
      '/crear-producto'
    ]);
  }

  editarProducto(
    producto: ProductoListado
  ): void {
    localStorage.setItem(
      'xoxo_producto_editar',
      JSON.stringify(producto)
    );

    this.router.navigate([
      '/editar-producto'
    ]);
  }

  cambiarEstado(
    producto: ProductoListado
  ): void {
    producto.estado =
      producto.estado === 'activo'
        ? 'inactivo'
        : 'activo';

    this.guardarProductos();

    this.mensajeExito =
      producto.estado === 'activo'
        ? 'El producto fue activado correctamente.'
        : 'El producto fue desactivado correctamente.';

    this.aplicarFiltros();

    this.ocultarMensaje();
  }

  abrirEliminar(
    producto: ProductoListado
  ): void {
    this.productoSeleccionado =
      producto;

    this.modalEliminarAbierto = true;
  }

  cerrarEliminar(): void {
    this.modalEliminarAbierto = false;
    this.productoSeleccionado = null;
  }

  confirmarEliminar(): void {
    if (!this.productoSeleccionado) {
      return;
    }

    this.productos =
      this.productos.filter(
        producto =>
          producto.id !==
          this.productoSeleccionado?.id
      );

    this.guardarProductos();
    this.aplicarFiltros();

    this.mensajeExito =
      'El producto fue eliminado correctamente.';

    this.cerrarEliminar();
    this.ocultarMensaje();
  }

  obtenerEstadoStock(
    producto: ProductoListado
  ): string {
    if (producto.stockInicial <= 0) {
      return 'agotado';
    }

    if (
      producto.stockInicial <=
      producto.stockMinimo
    ) {
      return 'bajo';
    }

    return 'disponible';
  }

  obtenerTextoStock(
    producto: ProductoListado
  ): string {
    const estado =
      this.obtenerEstadoStock(producto);

    if (estado === 'agotado') {
      return 'Agotado';
    }

    if (estado === 'bajo') {
      return 'Stock bajo';
    }

    return 'Disponible';
  }

  private cargarProductos(): void {
    const productosGuardados =
      localStorage.getItem(
        'xoxo_productos'
      );

    if (!productosGuardados) {
      this.productos = [
        ...this.productosBase
      ];

      this.guardarProductos();

      return;
    }

    try {
      const productosLocales =
        JSON.parse(
          productosGuardados
        ) as ProductoListado[];

      const mapaProductos =
        new Map<number, ProductoListado>();

      this.productosBase.forEach(
        producto => {
          mapaProductos.set(
            producto.id,
            producto
          );
        }
      );

      productosLocales.forEach(
        producto => {
          mapaProductos.set(
            producto.id,
            producto
          );
        }
      );

      this.productos = [
        ...mapaProductos.values()
      ];
    } catch {
      this.productos = [
        ...this.productosBase
      ];

      this.guardarProductos();
    }
  }

  private guardarProductos(): void {
    localStorage.setItem(
      'xoxo_productos',
      JSON.stringify(
        this.productos
      )
    );
  }

  private coincideFiltroStock(
    producto: ProductoListado
  ): boolean {
    if (
      this.stockSeleccionado ===
      'todos'
    ) {
      return true;
    }

    return (
      this.obtenerEstadoStock(
        producto
      ) === this.stockSeleccionado
    );
  }

  private normalizarTexto(
    texto: string
  ): string {
    return texto
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(
        /[\u0300-\u036f]/g,
        ''
      );
  }

  private ocultarMensaje(): void {
    setTimeout(() => {
      this.mensajeExito = '';
    }, 2500);
  }
}
