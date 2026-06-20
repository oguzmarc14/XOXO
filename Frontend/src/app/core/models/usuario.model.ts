export type UserRole =
  | 'cajero'
  | 'gerente'
  | 'admin';

export interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  rol: UserRole;
  cargo: string;
  sucursal: string;
  avatar: string;
}