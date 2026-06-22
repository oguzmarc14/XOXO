export type UserRole =
  | 'cajero'
  | 'gerente'
  | 'admin';

export type SexoUsuario =
  | 'hombre'
  | 'mujer';

export interface Usuario {
  id: number;
  nombre: string;
  sexo: SexoUsuario;
  user: string;
  rol: UserRole;
  cargo: string;
  sucursal: string;
  avatar: string;
}