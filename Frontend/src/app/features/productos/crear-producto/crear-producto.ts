import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit
} from '@angular/core';
import {
  FormsModule
} from '@angular/forms';
import {
  HttpClient
} from '@angular/common/http';
import {
  Router,
  RouterLink
} from '@angular/router';

import {
  ProductosService
} from '../../../core/services/productos';

import {
  UsuarioActualService
} from '../../../core/services/usuario-actual';

import {
  Usuario
} from '../../../core/models/usuario.model';

interface TiendaProducto {
  _id: string;
  nombre: string;
  direccion?: string;
  ciudad?: string;
  telefono?: string;
}

interface CategoriaProducto {
  nombre: string;
  icono: string;
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
  codigo: number | null = null;
  nombre = '';
  categoria = '';
  precio: number | null = null;
  stockMinimo: number | null = 5;
  tiendaId = '';

  tiendas: TiendaProducto[] = [];
  usuarioActual!: Usuario;

  cargandoTiendas = false;
  guardando = false;

  mensajeError = '';
  mensajeExito = '';

  private readonly tiendasUrl =
    'http://localhost:3000/tiendas';

  readonly categorias: CategoriaProducto[] = [
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
    private productosService: ProductosService,
    private usuarioActualService: UsuarioActualService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.usuarioActual =
      this.usuarioActualService.obtenerUsuario();

    if (
      !this.usuarioActual ||
      this.usuarioActual.id === 0
    ) {
      this.mensajeError =
        'No se encontró una sesión activa.';

      return;
    }

    if (this.esAdministrador) {
      this.cargarTiendas();
      return;
    }

    this.tiendaId =
      this.usuarioActual.tiendaId || '';

    if (!this.tiendaId) {
      this.mensajeError =
        'El usuario no tiene una tienda asignada. No es posible registrar productos.';
    }
  }

  get esAdministrador(): boolean {
    return this.usuarioActual?.rol === 'admin';
  }

  get esGerente(): boolean {
    return this.usuarioActual?.rol === 'gerente';
  }

  get esCajero(): boolean {
    return this.usuarioActual?.rol === 'cajero';
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

  get precioVistaPrevia(): number {
    return Number(this.precio) || 0;
  }

  get iconoCategoria(): string {
    return (
      this.categorias.find(
        item =>
          item.nombre === this.categoria
      )?.icono ?? '📦'
    );
  }

  get nombreTiendaSeleccionada(): string {
    if (!this.tiendaId) {
      return this.esAdministrador
        ? 'Tienda sin seleccionar'
        : 'Tienda no asignada';
    }

    const tienda =
      this.tiendas.find(
        item =>
          item._id === this.tiendaId
      );

    if (tienda) {
      return tienda.ciudad
        ? `${tienda.nombre} - ${tienda.ciudad}`
        : tienda.nombre;
    }

    return (
      this.usuarioActual?.sucursal ||
      'Tienda asignada'
    );
  }

  seleccionarCategoria(
    categoria: CategoriaProducto
  ): void {
    this.categoria =
      categoria.nombre;

    this.limpiarMensajes();
  }

  cargarTiendas(): void {
    this.cargandoTiendas = true;
    this.mensajeError = '';

    this.http
      .get<TiendaProducto[]>(
        this.tiendasUrl
      )
      .subscribe({
        next: tiendas => {
          this.tiendas =
            Array.isArray(tiendas)
              ? tiendas
              : [];

          this.cargandoTiendas = false;

          if (this.tiendas.length === 0) {
            this.mensajeError =
              'No existen tiendas disponibles para asignar el producto.';
          }
        },

        error: error => {
          console.error(
            'Error al cargar tiendas:',
            error
          );

          this.mensajeError =
            'No fue posible cargar las tiendas.';

          this.cargandoTiendas = false;
        }
      });
  }

  guardarProducto(): void {
    this.limpiarMensajes();

    if (
      this.codigo === null ||
      Number(this.codigo) <= 0
    ) {
      this.mensajeError =
        'El código del producto es obligatorio y debe ser mayor a cero.';

      return;
    }

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

    if (
      this.stockMinimo === null ||
      Number(this.stockMinimo) < 0
    ) {
      this.mensajeError =
        'El stock mínimo no puede ser negativo.';

      return;
    }

    if (!this.tiendaId) {
      this.mensajeError =
        this.esAdministrador
          ? 'Selecciona la tienda a la que pertenecerá el producto.'
          : 'Tu usuario no tiene una tienda asignada.';

      return;
    }

    this.guardando = true;

    this.productosService
      .create({
        codigo: Number(this.codigo),
        nombre: this.nombre.trim(),
        categoria: this.categoria,
        precio: Number(this.precio),
        stockMinimo: Number(this.stockMinimo),
        tiendaId: this.tiendaId
      })
      .subscribe({
        next: () => {
          this.mensajeExito =
            'El producto se registró correctamente.';

          setTimeout(() => {
            this.router.navigate([
              '/lista-productos'
            ]);
          }, 900);
        },

        error: error => {
          console.error(
            'Error al guardar producto:',
            error
          );

          this.mensajeError =
            error.error?.message ||
            'No fue posible guardar el producto. Verifica que el código no esté duplicado en esa tienda.';

          this.guardando = false;
        },

        complete: () => {
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

    if (this.esAdministrador) {
      this.tiendaId = '';
    } else {
      this.tiendaId =
        this.usuarioActual?.tiendaId ||
        '';
    }

    this.limpiarMensajes();
  }

  private limpiarMensajes(): void {
    this.mensajeError = '';
    this.mensajeExito = '';
  }
}