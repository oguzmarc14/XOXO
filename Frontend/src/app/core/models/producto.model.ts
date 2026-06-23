export interface TiendaProducto {
  _id: string;
  nombre: string;
  direccion?: string;
  ciudad?: string;
  telefono?: string;
}

export interface Producto {
  _id: string;
  codigo: number;
  nombre: string;
  precio: number;
  categoria: string;
  stockMinimo: number;

  /*
    El backend puede devolver:

    - Solo el ID de la tienda.
    - El objeto completo mediante populate().
  */
  tiendaId: string | TiendaProducto;

  createdAt?: string;
  updatedAt?: string;
}

/*
  Datos permitidos al crear o actualizar
  un producto.

  En las peticiones siempre se envía
  únicamente el ID de la tienda.
*/
export interface ProductoPayload {
  codigo: number;
  nombre: string;
  precio: number;
  categoria: string;
  stockMinimo: number;
  tiendaId: string;
}

/*
  Obtiene el ID independientemente de si
  tiendaId llegó como texto o como objeto.
*/
export function obtenerTiendaId(
  producto: Producto
): string {
  if (
    typeof producto.tiendaId ===
    'string'
  ) {
    return producto.tiendaId;
  }

  return producto.tiendaId?._id || '';
}

/*
  Devuelve un nombre legible para mostrarlo
  en tablas y vistas previas.
*/
export function obtenerNombreTienda(
  producto: Producto
): string {
  if (
    typeof producto.tiendaId ===
    'string'
  ) {
    return producto.tiendaId
      ? 'Tienda asignada'
      : 'Sin tienda';
  }

  const tienda = producto.tiendaId;

  if (!tienda) {
    return 'Sin tienda';
  }

  if (
    tienda.nombre &&
    tienda.ciudad
  ) {
    return (
      `${tienda.nombre} - ` +
      `${tienda.ciudad}`
    );
  }

  return (
    tienda.nombre ||
    'Tienda asignada'
  );
}

