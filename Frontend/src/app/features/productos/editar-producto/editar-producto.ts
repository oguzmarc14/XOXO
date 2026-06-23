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
  ActivatedRoute,
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
  Producto,
  obtenerTiendaId
} from '../../../core/models/producto.model';

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
export class EditarProducto
  implements OnInit {

  productoOriginal:
    Producto | null = null;

  usuarioActual!: Usuario;

  codigo: number | null = null;
  nombre = '';
  categoria = '';
  precio: number | null = null;
  stockMinimo: number | null = null;
  tiendaId = '';

  tiendas: TiendaProducto[] = [];

  cargandoProducto = true;
  cargandoTiendas = false;
  guardando = false;

  productoEncontrado = false;

  mensajeError = '';
  mensajeExito = '';

  private readonly tiendasUrl =
    'http://localhost:3000/tiendas';

  readonly categorias:
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
    private productosService:
      ProductosService,

    private usuarioActualService:
      UsuarioActualService,

    private http:
      HttpClient,

    private route:
      ActivatedRoute,

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

      this.cargandoProducto = false;

      return;
    }

    if (this.esAdministrador) {
      this.cargarTiendas();
    }

    const id =
      this.route.snapshot
        .paramMap
        .get('id');

    if (!id) {
      this.mensajeError =
        'No se seleccionó ningún producto para editar.';

      this.cargandoProducto = false;

      return;
    }

    this.cargarProducto(id);
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

  get nombreVistaPrevia(): string {
    return (
      this.nombre.trim() ||
      'Nombre del producto'
    );
  }

  get codigoVistaPrevia(): string {
    return (
      this.codigo?.toString() ||
      'Sin código'
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

  get stockMinimoVistaPrevia(): number {
    return Number(this.stockMinimo) || 0;
  }

  get iconoCategoria(): string {
    return (
      this.categorias.find(
        item =>
          item.nombre ===
          this.categoria
      )?.icono ?? '📦'
    );
  }

  get nombreTiendaSeleccionada():
    string {
    if (!this.tiendaId) {
      return 'Tienda no asignada';
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

    if (
      this.productoOriginal &&
      typeof
        this.productoOriginal
          .tiendaId === 'object'
    ) {
      const tiendaProducto =
        this.productoOriginal
          .tiendaId;

      if (
        tiendaProducto._id ===
        this.tiendaId
      ) {
        return tiendaProducto.ciudad
          ? `${tiendaProducto.nombre} - ${tiendaProducto.ciudad}`
          : tiendaProducto.nombre;
      }
    }

    return (
      this.usuarioActual?.sucursal ||
      'Tienda asignada'
    );
  }

  get hayCambios(): boolean {
    if (!this.productoOriginal) {
      return false;
    }

    const tiendaOriginal =
      obtenerTiendaId(
        this.productoOriginal
      );

    return (
      Number(this.codigo) !==
        this.productoOriginal.codigo ||

      this.nombre.trim() !==
        this.productoOriginal.nombre ||

      this.categoria !==
        this.productoOriginal.categoria ||

      Number(this.precio) !==
        this.productoOriginal.precio ||

      Number(this.stockMinimo) !==
        (
          this.productoOriginal
            .stockMinimo ?? 5
        ) ||

      this.tiendaId !==
        tiendaOriginal
    );
  }

  seleccionarCategoria(
    categoria:
      CategoriaProducto
  ): void {
    this.categoria =
      categoria.nombre;

    this.limpiarMensajes();
  }

  cargarTiendas(): void {
    this.cargandoTiendas = true;

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

  guardarCambios(): void {
    this.limpiarMensajes();

    if (!this.productoOriginal) {
      this.mensajeError =
        'No se encontró el producto que deseas editar.';

      return;
    }

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
          ? 'Selecciona la tienda del producto.'
          : 'Tu usuario no tiene una tienda asignada.';

      return;
    }

    if (!this.hayCambios) {
      this.mensajeError =
        'No se detectaron cambios para guardar.';

      return;
    }

    /*
      Un gerente o cajero no debe cambiar
      la tienda del producto.
    */
    if (!this.esAdministrador) {
      const tiendaUsuario =
        this.usuarioActual.tiendaId ||
        '';

      if (
        !tiendaUsuario ||
        this.tiendaId !==
          tiendaUsuario
      ) {
        this.mensajeError =
          'No tienes permiso para cambiar la tienda de este producto.';

        return;
      }
    }

    this.guardando = true;

    this.productosService
      .update(
        this.productoOriginal._id,
        {
          codigo:
            Number(this.codigo),

          nombre:
            this.nombre.trim(),

          categoria:
            this.categoria,

          precio:
            Number(this.precio),

          stockMinimo:
            Number(this.stockMinimo),

          tiendaId:
            this.tiendaId
        }
      )
      .subscribe({
        next: productoActualizado => {
          this.productoOriginal =
            productoActualizado;

          this.mensajeExito =
            'Los cambios del producto se guardaron correctamente.';

          setTimeout(() => {
            this.router.navigate([
              '/lista-productos'
            ]);
          }, 900);
        },

        error: error => {
          console.error(
            'Error al actualizar producto:',
            error
          );

          this.mensajeError =
            error.error?.message ||
            'No fue posible actualizar el producto.';

          this.guardando = false;
        },

        complete: () => {
          this.guardando = false;
        }
      });
  }

  restaurarDatos(): void {
    if (!this.productoOriginal) {
      return;
    }

    this.cargarFormulario(
      this.productoOriginal
    );

    this.limpiarMensajes();
  }

  volverAlListado(): void {
    this.router.navigate([
      '/lista-productos'
    ]);
  }

  private cargarProducto(
    id: string
  ): void {
    this.cargandoProducto = true;

    this.productosService
      .getById(id)
      .subscribe({
        next: producto => {
          const tiendaProducto =
            obtenerTiendaId(producto);

          /*
            Gerente y cajero solo pueden
            abrir productos de su tienda.
          */
          if (
            !this.esAdministrador &&
            tiendaProducto !==
              (
                this.usuarioActual
                  .tiendaId || ''
              )
          ) {
            this.productoEncontrado =
              false;

            this.mensajeError =
              'No tienes permiso para editar productos de otra tienda.';

            this.cargandoProducto =
              false;

            return;
          }

          this.productoOriginal =
            producto;

          this.productoEncontrado =
            true;

          this.cargarFormulario(
            producto
          );

          this.cargandoProducto =
            false;
        },

        error: error => {
          console.error(
            'Error al cargar producto:',
            error
          );

          this.productoEncontrado =
            false;

          this.mensajeError =
            'No fue posible cargar la información del producto.';

          this.cargandoProducto =
            false;
        }
      });
  }

  private cargarFormulario(
    producto: Producto
  ): void {
    this.codigo =
      producto.codigo;

    this.nombre =
      producto.nombre;

    this.categoria =
      producto.categoria;

    this.precio =
      producto.precio;

    this.stockMinimo =
      producto.stockMinimo ?? 5;

    this.tiendaId =
      obtenerTiendaId(producto);
  }

  private limpiarMensajes(): void {
    this.mensajeError = '';
    this.mensajeExito = '';
  }
}
