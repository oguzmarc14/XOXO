import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';

import {
  UsuarioActualService
} from '../../../core/services/usuario-actual';

import {
  Usuario
} from '../../../core/models/usuario.model';

type EstadoInventario =
  | 'disponible'
  | 'bajo'
  | 'agotado';

interface ProductoBackend {
  _id: string;
  nombre: string;
  codigo?: string;
  precio: number;
  categoria: string;
  stockMinimo?: number;

  tiendaId?:
    | string
    | TiendaBackend;
}

interface TiendaBackend {
  _id: string;
  nombre: string;
  direccion?: string;
  ciudad?: string;
  telefono?: string;
}

interface InventarioBackend {
  _id: string;

  tiendaId:
    | string
    | TiendaBackend;

  productoId:
    | string
    | ProductoBackend;

  piezas: number;
  fechaGeneracion?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ProductoInventario {
  id: string;
  productoId: string;
  tiendaId: string;

  nombre: string;
  codigo: string;
  categoria: string;
  sucursal: string;

  existencia: number;
  minimo: number;
  precio: number;

  estado: EstadoInventario;
  fechaGeneracion?: string;
}

interface RespuestaReemplazoInventario {
  message?: string;

  tienda?: {
    _id: string;
    nombre: string;
  };

  productosRegistrados?: number;
  fechaGeneracion?: string;
  inventario?: InventarioBackend[];
}

@Component({
  selector: 'app-lista-inventario',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './lista-inventario.html',
  styleUrl: './lista-inventario.css'
})
export class ListaInventario implements OnInit {
  busqueda = '';

  categoriaSeleccionada =
    'todas';

  sucursalSeleccionada =
    'todas';

  estadoSeleccionado =
    'todos';

  productos:
    ProductoInventario[] = [];

  productosFiltrados:
    ProductoInventario[] = [];

  usuarioActual!: Usuario;

  tiendaIdActual = '';

  nombreTiendaActual =
    'Todas las tiendas';

  cargando = false;
  reemplazandoInventario = false;

  mensajeError = '';
  mensajeExito = '';

  private readonly inventarioApi =
    'https://xoxo-backend-ewqr.onrender.com/inventario';

  constructor(
    private http: HttpClient,

    private usuarioActualService:
      UsuarioActualService
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

    const rol =
      this.obtenerRolActual();

    if (
      rol !== 'admin' &&
      rol !== 'gerente'
    ) {
      this.mensajeError =
        'No tienes permisos para consultar el inventario.';

      return;
    }

    if (rol === 'gerente') {
      this.tiendaIdActual =
        this.usuarioActual.tiendaId || '';

      this.nombreTiendaActual =
        this.usuarioActual.sucursal ||
        'Tienda asignada';

      if (!this.tiendaIdActual) {
        this.mensajeError =
          'El gerente no tiene una tienda asignada.';

        return;
      }

      /*
        El gerente solo tiene una tienda,
        por lo que no necesita este filtro.
      */
      this.sucursalSeleccionada =
        'todas';
    }

    this.cargarInventario();
  }

  /*
    Solo el gerente puede crear o reemplazar
    el inventario de su tienda.
  */
  get puedeCrearInventario(): boolean {
    return (
      this.obtenerRolActual() ===
        'gerente' &&
      Boolean(this.tiendaIdActual)
    );
  }

  /*
    Se conserva para los botones existentes
    del HTML.
  */
  get puedeAdministrar(): boolean {
    const rol =
      this.obtenerRolActual();

    return (
      rol === 'admin' ||
      rol === 'gerente'
    );
  }

  get puedeVerMovimientos(): boolean {
    const rol =
      this.obtenerRolActual();

    return (
      rol === 'admin' ||
      rol === 'gerente'
    );
  }

  get esGerente(): boolean {
    return (
      this.obtenerRolActual() ===
      'gerente'
    );
  }

  get esAdmin(): boolean {
    return (
      this.obtenerRolActual() ===
      'admin'
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
          categoriaB
        )
    );
  }

  get sucursales(): string[] {
    return [
      ...new Set(
        this.productos
          .map(
            producto =>
              producto.sucursal
          )
          .filter(Boolean)
      )
    ].sort(
      (
        sucursalA,
        sucursalB
      ) =>
        sucursalA.localeCompare(
          sucursalB
        )
    );
  }

  get totalProductos(): number {
    return this.productos.length;
  }

  get totalUnidades(): number {
    return this.productos.reduce(
      (
        total,
        producto
      ) =>
        total +
        producto.existencia,
      0
    );
  }

  get productosStockBajo(): number {
    return this.productos.filter(
      producto =>
        producto.estado ===
        'bajo'
    ).length;
  }

  get productosAgotados(): number {
    return this.productos.filter(
      producto =>
        producto.estado ===
        'agotado'
    ).length;
  }

  get valorInventario(): number {
    return this.productos.reduce(
      (
        total,
        producto
      ) =>
        total +
        (
          producto.existencia *
          producto.precio
        ),
      0
    );
  }

  cargarInventario(): void {
    this.cargando = true;
    this.mensajeError = '';

    let url =
      this.inventarioApi;

    /*
      El administrador consulta todos.
      El gerente consulta solo su tienda.
    */
    if (
      this.esGerente &&
      this.tiendaIdActual
    ) {
      url +=
        `?tiendaId=${encodeURIComponent(
          this.tiendaIdActual
        )}`;
    }

    this.http
      .get<InventarioBackend[]>(
        url
      )
      .subscribe({
        next: respuesta => {
          const inventario =
            Array.isArray(respuesta)
              ? respuesta
              : [];

          this.productos =
            inventario
              .map(
                item =>
                  this.mapearInventario(
                    item
                  )
              )
              .filter(
                (
                  producto
                ): producto is ProductoInventario =>
                  producto !== null
              );

          this.aplicarFiltros();

          this.cargando = false;
        },

        error: error => {
          console.error(
            'Error al cargar inventario:',
            error
          );

          this.productos = [];
          this.productosFiltrados = [];

          this.mensajeError =
            error.error?.message ||
            'No fue posible cargar el inventario.';

          this.cargando = false;
        }
      });
  }

  crearOReemplazarInventario(): void {
    this.limpiarMensajes();

    if (!this.puedeCrearInventario) {
      this.mensajeError =
        'Solo el gerente puede crear o reemplazar el inventario de su tienda.';

      return;
    }

    if (!this.tiendaIdActual) {
      this.mensajeError =
        'El gerente no tiene una tienda asignada.';

      return;
    }

    const yaExisteInventario =
      this.productos.length > 0;

    const mensajeConfirmacion =
      yaExisteInventario
        ? (
          'El inventario actual de esta tienda será eliminado ' +
          'y reemplazado completamente. Todas las existencias ' +
          'del nuevo inventario comenzarán en 0. ¿Deseas continuar?'
        )
        : (
          'Se creará un inventario con todos los productos ' +
          'actuales de la tienda. Las existencias comenzarán ' +
          'en 0. ¿Deseas continuar?'
        );

    const confirmado =
      window.confirm(
        mensajeConfirmacion
      );

    if (!confirmado) {
      return;
    }

    this.reemplazandoInventario =
      true;

    this.http
      .post<RespuestaReemplazoInventario>(
        `${this.inventarioApi}/reemplazar/${this.tiendaIdActual}`,
        {}
      )
      .subscribe({
        next: respuesta => {
          const cantidad =
            respuesta
              .productosRegistrados ??
            respuesta
              .inventario
              ?.length ??
            0;

          this.mensajeExito =
            respuesta.message ||
            (
              `El inventario fue generado correctamente ` +
              `con ${cantidad} producto(s).`
            );

          /*
            Se actualiza la tabla después
            de reemplazar el inventario.
          */
          this.cargarInventario();
        },

        error: error => {
          console.error(
            'Error al reemplazar inventario:',
            error
          );

          this.mensajeError =
            error.error?.message ||
            'No fue posible crear o reemplazar el inventario.';

          this.reemplazandoInventario =
            false;
        },

        complete: () => {
          this.reemplazandoInventario =
            false;
        }
      });
  }

  aplicarFiltros(): void {
    const texto =
      this.normalizarTexto(
        this.busqueda
      );

    this.productosFiltrados =
      this.productos.filter(
        producto => {
          const coincideBusqueda =
            !texto ||
            this.normalizarTexto(
              producto.nombre
            ).includes(texto) ||
            this.normalizarTexto(
              producto.codigo
            ).includes(texto) ||
            this.normalizarTexto(
              producto.categoria
            ).includes(texto) ||
            this.normalizarTexto(
              producto.sucursal
            ).includes(texto);

          const coincideCategoria =
            this.categoriaSeleccionada ===
              'todas' ||
            producto.categoria ===
              this.categoriaSeleccionada;

          const coincideSucursal =
            this.sucursalSeleccionada ===
              'todas' ||
            producto.sucursal ===
              this.sucursalSeleccionada;

          const coincideEstado =
            this.estadoSeleccionado ===
              'todos' ||
            producto.estado ===
              this.estadoSeleccionado;

          return (
            coincideBusqueda &&
            coincideCategoria &&
            coincideSucursal &&
            coincideEstado
          );
        }
      );
  }

  limpiarFiltros(): void {
    this.busqueda = '';

    this.categoriaSeleccionada =
      'todas';

    this.sucursalSeleccionada =
      'todas';

    this.estadoSeleccionado =
      'todos';

    this.aplicarFiltros();
  }

  obtenerTextoEstado(
    estado: EstadoInventario
  ): string {
    if (estado === 'agotado') {
      return 'Agotado';
    }

    if (estado === 'bajo') {
      return 'Stock bajo';
    }

    return 'Disponible';
  }

  obtenerClaseEstado(
    estado: EstadoInventario
  ): string {
    return estado;
  }

  obtenerIconoCategoria(
    categoria: string
  ): string {
    const texto =
      this.normalizarTexto(
        categoria
      );

    if (
      texto.includes('bebida') ||
      texto.includes('refresco') ||
      texto.includes('agua')
    ) {
      return '🥤';
    }

    if (
      texto.includes('botana') ||
      texto.includes('snack') ||
      texto.includes('papas')
    ) {
      return '🍟';
    }

    if (
      texto.includes('dulce') ||
      texto.includes('chocolate')
    ) {
      return '🍫';
    }

    if (
      texto.includes('pan') ||
      texto.includes('galleta')
    ) {
      return '🍪';
    }

    if (
      texto.includes('leche') ||
      texto.includes('lacteo')
    ) {
      return '🥛';
    }

    if (
      texto.includes('limpieza')
    ) {
      return '🧼';
    }

    if (
      texto.includes('gorra') ||
      texto.includes('ropa') ||
      texto.includes('accesorio')
    ) {
      return '🧢';
    }

    return '📦';
  }

  private mapearInventario(
    item: InventarioBackend
  ): ProductoInventario | null {
    if (
      !item ||
      !item._id
    ) {
      return null;
    }

    const productoId =
      this.obtenerId(
        item.productoId
      );

    const tiendaId =
      this.obtenerId(
        item.tiendaId
      );

    /*
      La nueva ruta del backend devuelve
      ambos campos con populate.
    */
    const producto =
      typeof item.productoId ===
        'object'
        ? item.productoId
        : null;

    const tienda =
      typeof item.tiendaId ===
        'object'
        ? item.tiendaId
        : null;

    if (
      !producto ||
      !tienda ||
      !productoId ||
      !tiendaId
    ) {
      console.warn(
        'Registro de inventario incompleto:',
        item
      );

      return null;
    }

    const existencia =
      this.normalizarNumero(
        item.piezas,
        0
      );

    const minimo =
      this.normalizarNumero(
        producto.stockMinimo,
        5
      );

    const precio =
      this.normalizarNumero(
        producto.precio,
        0
      );

    const nombreSucursal =
      tienda.ciudad
        ? `${tienda.nombre} - ${tienda.ciudad}`
        : tienda.nombre;

    return {
      id:
        item._id,

      productoId:
        productoId,

      tiendaId:
        tiendaId,

      nombre:
        producto.nombre ||
        'Producto sin nombre',

      codigo:
        producto.codigo ||
        'Sin código',

      categoria:
        producto.categoria ||
        'Sin categoría',

      sucursal:
        nombreSucursal,

      existencia:
        existencia,

      minimo:
        minimo,

      precio:
        precio,

      estado:
        this.calcularEstado(
          existencia,
          minimo
        ),

      fechaGeneracion:
        item.fechaGeneracion ||
        item.createdAt
    };
  }

  private calcularEstado(
    existencia: number,
    minimo: number
  ): EstadoInventario {
    if (existencia <= 0) {
      return 'agotado';
    }

    if (existencia <= minimo) {
      return 'bajo';
    }

    return 'disponible';
  }

  private obtenerRolActual(): string {
    return String(
      this.usuarioActual?.rol || ''
    )
      .trim()
      .toLowerCase();
  }

  private obtenerId(
    elemento:
      | string
      | { _id: string }
      | null
      | undefined
  ): string {
    if (
      typeof elemento ===
      'string'
    ) {
      return elemento;
    }

    return elemento?._id || '';
  }

  private normalizarNumero(
    valor:
      | number
      | null
      | undefined,
    valorPredeterminado: number
  ): number {
    const numero =
      Number(valor);

    return Number.isFinite(numero)
      ? numero
      : valorPredeterminado;
  }

  private limpiarMensajes(): void {
    this.mensajeError = '';
    this.mensajeExito = '';
  }

  private normalizarTexto(
    texto:
      | string
      | null
      | undefined
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
}