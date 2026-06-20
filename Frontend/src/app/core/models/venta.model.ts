export type EstadoVenta =
  | 'completada'
  | 'cancelada'
  | 'devuelta';

export interface ProductoVenta {
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
  subtotal: number;
}

export interface Venta {
  id: number;
  folio: string;
  fecha: string;
  hora: string;

  cajero: string;
  correoCajero: string;

  sucursal: string;

  productos: ProductoVenta[];

  cantidadProductos: number;
  subtotal: number;
  total: number;

  metodoPago: 'efectivo' | 'tarjeta';

  estado: EstadoVenta;

  motivoCancelacion?: string;
  fechaCancelacion?: string;
  canceladaPor?: string;
}