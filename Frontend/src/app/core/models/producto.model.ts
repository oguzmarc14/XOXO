export interface Producto {
  _id: string;
  codigo: number;
  nombre: string;
  precio: number;
  categoria: string;
  stockMinimo: number;
  tiendaId?: string;
}
