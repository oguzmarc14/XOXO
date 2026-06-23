import { CommonModule } from '@angular/common';

import {
  Component,
  OnInit
} from '@angular/core';

import {
  FormsModule
} from '@angular/forms';

import {
  Router
} from '@angular/router';

import {
  ProductosService
} from '../../../core/services/productos';

import {
  UsuarioActualService
} from '../../../core/services/usuario-actual';

import {
  Producto,
  obtenerNombreTienda,
  obtenerTiendaId
} from '../../../core/models/producto.model';

import {
  Usuario
} from '../../../core/models/usuario.model';

@Component({
  selector: 'app-lista-productos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './lista-productos.html',
  styleUrl: './lista-productos.css'
})
export class ListaProductos
  implements OnInit {

  busqueda = '';
  categoriaSeleccionada = 'todas';

  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];

  usuarioActual!: Usuario;

  cargando = false;

  mensajeExito = '';
  mensajeError = '';

  modalEliminarAbierto = false;

  productoSeleccionado:
    Producto | null = null;

  constructor(
    private productosService:
      ProductosService,

    private usuarioActualService:
      UsuarioActualService,

    private router:
      Router
  ) {}

  ngOnInit(): void {
    this.usuarioActual =
      this.usuarioActualService
        .obtenerUsuario();

    if (
      !this.usuarioActual ||
      this.usuarioActual.id === 0
    ) {
      this.mensajeError =
        'No se encontró una sesión activa.';

      return;
    }

    /*
      Administrador:
      consulta todos los productos.

      Gerente y cajero:
      consultan únicamente los productos
      de la tienda asociada a su sesión.
    */
    if (
      !this.esAdministrador &&
      !this.usuarioActual.tiendaId
    ) {
      this.mensajeError =
        'Tu usuario no tiene una tienda asignada. No es posible consultar productos.';

      this.productos = [];
      this.productosFiltrados = [];

      return;
    }

    this.cargarProductos();
  }

  get esAdministrador(): boolean {
    return (
      this.usuarioActual?.rol ===
      'admin'
    );
  }

  get esGerente(): boolean {
    return (
      this.usuarioActual?.rol ===
      'gerente'
    );
  }

  get esCajero(): boolean {
    return (
      this.usuarioActual?.rol ===
      'cajero'
    );
  }

  get categorias(): string[] {
    return [
      ...new Set(
        this.productos
          .map(
            producto =>
              producto.categoria
          )
          .filter(Boolean)
      )
    ].sort(
      (
        categoriaA,
        categoriaB
      ) =>
        categoriaA.localeCompare(
          categoriaB,
          'es'
        )
    );
  }

  get totalProductos(): number {
    return this.productos.length;
  }

  get textoCatalogo(): string {
    if (this.esAdministrador) {
      return 'Catálogo general de todas las tiendas';
    }

    return (
      this.usuarioActual?.sucursal ||
      'Productos de la tienda asignada'
    );
  }

  get puedeCrearProductos(): boolean {
    if (this.esAdministrador) {
      return true;
    }

    return Boolean(
      this.usuarioActual?.tiendaId
    );
  }

  aplicarFiltros(): void {
    const texto =
      this.normalizarTexto(
        this.busqueda
      );

    this.productosFiltrados =
      this.productos.filter(
        producto => {
          const tienda =
            this.normalizarTexto(
              this.obtenerNombreTienda(
                producto
              )
            );

          const coincideBusqueda =
            !texto ||
            this.normalizarTexto(
              producto.nombre
            ).includes(texto) ||
            this.normalizarTexto(
              producto.categoria
            ).includes(texto) ||
            String(
              producto.codigo
            ).includes(texto) ||
            (
              this.esAdministrador &&
              tienda.includes(texto)
            );

          const coincideCategoria =
            this.categoriaSeleccionada ===
              'todas' ||
            producto.categoria ===
              this.categoriaSeleccionada;

          return (
            coincideBusqueda &&
            coincideCategoria
          );
        }
      );
  }

  limpiarFiltros(): void {
    this.busqueda = '';
    this.categoriaSeleccionada =
      'todas';

    this.aplicarFiltros();
  }

  crearProducto(): void {
    if (
      !this.puedeCrearProductos
    ) {
      this.mensajeError =
        'Tu usuario no tiene una tienda asignada.';

      this.ocultarMensaje();

      return;
    }

    this.router.navigate([
      '/crear-producto'
    ]);
  }

  editarProducto(
    producto: Producto
  ): void {
    if (
      !this.puedeAdministrarProducto(
        producto
      )
    ) {
      this.mensajeError =
        'No tienes permiso para editar productos de otra tienda.';

      this.ocultarMensaje();

      return;
    }

    this.router.navigate([
      '/editar-producto',
      producto._id
    ]);
  }

  abrirEliminar(
    producto: Producto
  ): void {
    if (
      !this.puedeAdministrarProducto(
        producto
      )
    ) {
      this.mensajeError =
        'No tienes permiso para eliminar productos de otra tienda.';

      this.ocultarMensaje();

      return;
    }

    this.productoSeleccionado =
      producto;

    this.modalEliminarAbierto =
      true;
  }

  cerrarEliminar(): void {
    this.modalEliminarAbierto =
      false;

    this.productoSeleccionado =
      null;
  }

  confirmarEliminar(): void {
    if (
      !this.productoSeleccionado
    ) {
      return;
    }

    if (
      !this.puedeAdministrarProducto(
        this.productoSeleccionado
      )
    ) {
      this.cerrarEliminar();

      this.mensajeError =
        'No tienes permiso para eliminar este producto.';

      this.ocultarMensaje();

      return;
    }

    const id =
      this.productoSeleccionado._id;

    this.cerrarEliminar();

    this.productosService
      .delete(id)
      .subscribe({
        next: () => {
          this.productos =
            this.productos.filter(
              producto =>
                producto._id !== id
            );

          this.aplicarFiltros();

          this.mensajeExito =
            'El producto fue eliminado correctamente.';

          this.ocultarMensaje();
        },

        error: error => {
          console.error(
            'Error al eliminar producto:',
            error
          );

          this.mensajeError =
            error.error?.message ||
            'No fue posible eliminar el producto.';

          this.ocultarMensaje();
        }
      });
  }

  obtenerNombreTienda(
    producto: Producto
  ): string {
    return obtenerNombreTienda(
      producto
    );
  }

  private cargarProductos(): void {
    this.cargando = true;
    this.mensajeError = '';

    const tiendaId =
      this.esAdministrador
        ? undefined
        : this.usuarioActual
            .tiendaId;

    this.productosService
      .getAll(tiendaId)
      .subscribe({
        next: productos => {
          this.productos =
            Array.isArray(productos)
              ? productos
              : [];

          /*
            Esta segunda validación evita que
            un usuario no administrador vea
            productos ajenos aunque el backend
            devolviera datos incorrectos.
          */
          if (
            !this.esAdministrador &&
            tiendaId
          ) {
            this.productos =
              this.productos.filter(
                producto =>
                  obtenerTiendaId(
                    producto
                  ) === tiendaId
              );
          }

          this.aplicarFiltros();

          this.cargando = false;
        },

        error: error => {
          console.error(
            'Error al cargar productos:',
            error
          );

          this.productos = [];
          this.productosFiltrados = [];

          this.mensajeError =
            error.error?.message ||
            'No fue posible cargar los productos.';

          this.cargando = false;
        }
      });
  }

  private puedeAdministrarProducto(
    producto: Producto
  ): boolean {
    if (this.esAdministrador) {
      return true;
    }

    const tiendaUsuario =
      this.usuarioActual?.tiendaId ||
      '';

    const tiendaProducto =
      obtenerTiendaId(producto);

    return Boolean(
      tiendaUsuario &&
      tiendaProducto &&
      tiendaUsuario ===
        tiendaProducto
    );
  }

  private normalizarTexto(
    texto: string
  ): string {
    return String(texto || '')
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
      this.mensajeError = '';
    }, 2500);
  }
}