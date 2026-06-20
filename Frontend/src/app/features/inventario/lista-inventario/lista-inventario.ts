import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit
} from '@angular/core';

import {
  FormsModule
} from '@angular/forms';

import {
  RouterLink
} from '@angular/router';

import {
  Usuario
} from '../../../core/models/usuario.model';

import {
  UsuarioActualService
} from '../../../core/services/usuario-actual';

type EstadoInventario =
  | 'disponible'
  | 'bajo'
  | 'agotado';

interface ProductoInventario {
  id: number;
  codigo: string;
  nombre: string;
  categoria: string;
  sucursal: string;
  existencia: number;
  minimo: number;
  precio: number;
  ultimaActualizacion: Date;
  estado: EstadoInventario;
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
  usuario!: Usuario;

  busqueda = '';
  categoriaSeleccionada = 'todas';
  sucursalSeleccionada = 'todas';
  estadoSeleccionado = 'todos';

  productos: ProductoInventario[] = [
    {
      id: 1,
      codigo: 'XO-PL-001',
      nombre: 'Playera negra XoXO',
      categoria: 'Playeras',
      sucursal: 'Sucursal #027 - Centro',
      existencia: 18,
      minimo: 5,
      precio: 249,
      ultimaActualizacion:
        new Date('2026-06-19T15:30:00'),
      estado: 'disponible'
    },
    {
      id: 2,
      codigo: 'XO-PL-002',
      nombre: 'Playera blanca XoXO',
      categoria: 'Playeras',
      sucursal: 'Sucursal #027 - Centro',
      existencia: 4,
      minimo: 5,
      precio: 249,
      ultimaActualizacion:
        new Date('2026-06-19T14:20:00'),
      estado: 'bajo'
    },
    {
      id: 3,
      codigo: 'XO-SD-001',
      nombre: 'Sudadera vino',
      categoria: 'Sudaderas',
      sucursal: 'Sucursal #027 - Centro',
      existencia: 2,
      minimo: 4,
      precio: 599,
      ultimaActualizacion:
        new Date('2026-06-19T13:10:00'),
      estado: 'bajo'
    },
    {
      id: 4,
      codigo: 'XO-SD-002',
      nombre: 'Sudadera negra',
      categoria: 'Sudaderas',
      sucursal: 'Sucursal #043 - Norte',
      existencia: 12,
      minimo: 4,
      precio: 599,
      ultimaActualizacion:
        new Date('2026-06-18T17:45:00'),
      estado: 'disponible'
    },
    {
      id: 5,
      codigo: 'XO-BL-001',
      nombre: 'Bolsa XoXO edición especial',
      categoria: 'Accesorios',
      sucursal: 'Sucursal #027 - Centro',
      existencia: 1,
      minimo: 3,
      precio: 189,
      ultimaActualizacion:
        new Date('2026-06-18T16:15:00'),
      estado: 'bajo'
    },
    {
      id: 6,
      codigo: 'XO-GR-001',
      nombre: 'Gorra bordada XoXO',
      categoria: 'Accesorios',
      sucursal: 'Sucursal #043 - Norte',
      existencia: 0,
      minimo: 4,
      precio: 219,
      ultimaActualizacion:
        new Date('2026-06-18T12:30:00'),
      estado: 'agotado'
    },
    {
      id: 7,
      codigo: 'XO-TZ-001',
      nombre: 'Taza oficial XoXO',
      categoria: 'Coleccionables',
      sucursal: 'Sucursal #115 - Sur',
      existencia: 24,
      minimo: 6,
      precio: 159,
      ultimaActualizacion:
        new Date('2026-06-17T11:00:00'),
      estado: 'disponible'
    },
    {
      id: 8,
      codigo: 'XO-LL-001',
      nombre: 'Llavero metálico XoXO',
      categoria: 'Coleccionables',
      sucursal: 'Sucursal #115 - Sur',
      existencia: 0,
      minimo: 8,
      precio: 89,
      ultimaActualizacion:
        new Date('2026-06-17T09:40:00'),
      estado: 'agotado'
    }
  ];

  productosFiltrados:
    ProductoInventario[] = [];

  constructor(
    private usuarioActualService:
      UsuarioActualService
  ) {}

  ngOnInit(): void {
    this.usuario =
      this.usuarioActualService
        .obtenerUsuario();

    this.actualizarEstados();
    this.aplicarFiltros();
  }

  get puedeAdministrar(): boolean {
    return (
      this.usuario.rol === 'admin' ||
      this.usuario.rol === 'gerente'
    );
  }

  get puedeVerMovimientos(): boolean {
    return (
      this.usuario.rol === 'admin' ||
      this.usuario.rol === 'gerente'
    );
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

  get sucursales(): string[] {
    return [
      ...new Set(
        this.productos.map(
          producto => producto.sucursal
        )
      )
    ].sort();
  }

  get totalProductos(): number {
    return this.productos.length;
  }

  get totalUnidades(): number {
    return this.productos.reduce(
      (acumulado, producto) =>
        acumulado + producto.existencia,
      0
    );
  }

  get productosStockBajo(): number {
    return this.productos.filter(
      producto =>
        producto.estado === 'bajo'
    ).length;
  }

  get productosAgotados(): number {
    return this.productos.filter(
      producto =>
        producto.estado === 'agotado'
    ).length;
  }

  get valorInventario(): number {
    return this.productos.reduce(
      (acumulado, producto) =>
        acumulado +
        producto.existencia *
        producto.precio,
      0
    );
  }

  aplicarFiltros(): void {
    const texto =
      this.normalizarTexto(this.busqueda);

    this.productosFiltrados =
      this.productos.filter(producto => {
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
      });
  }

  limpiarFiltros(): void {
    this.busqueda = '';
    this.categoriaSeleccionada = 'todas';
    this.sucursalSeleccionada = 'todas';
    this.estadoSeleccionado = 'todos';

    this.aplicarFiltros();
  }

  obtenerTextoEstado(
    estado: EstadoInventario
  ): string {
    const textos:
      Record<EstadoInventario, string> = {
        disponible: 'Disponible',
        bajo: 'Stock bajo',
        agotado: 'Agotado'
      };

    return textos[estado];
  }

  obtenerClaseEstado(
    estado: EstadoInventario
  ): string {
    return estado;
  }

  private actualizarEstados(): void {
    this.productos =
      this.productos.map(producto => ({
        ...producto,
        estado:
          this.calcularEstado(producto)
      }));
  }

  private calcularEstado(
    producto: ProductoInventario
  ): EstadoInventario {
    if (producto.existencia <= 0) {
      return 'agotado';
    }

    if (
      producto.existencia <=
      producto.minimo
    ) {
      return 'bajo';
    }

    return 'disponible';
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
}
