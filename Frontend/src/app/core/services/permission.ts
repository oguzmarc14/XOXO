import { Injectable } from '@angular/core';
import { Permission } from '../models/permission.model';
import { UserRole } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private readonly rolePermissions: Record<UserRole, Permission[]> = {
    cajero: [
     'DASHBOARD_VER',

     'VENTAS_CREAR',
     'VENTAS_DEVOLVER',
     'VENTAS_HISTORIAL_VER',

     'INVENTARIO_VER'
    ],

    gerente: [
      'DASHBOARD_VER',

      'VENTAS_CREAR',
      'VENTAS_DEVOLVER',
      'VENTAS_HISTORIAL_VER',
      'VENTAS_CANCELAR',

      'INVENTARIO_VER',
      'INVENTARIO_MOVIMIENTOS_VER',
      'INVENTARIO_EDITAR',

      'PRODUCTOS_VER',

      'TURNOS_VER',
      'TURNOS_ABRIR',
      'TURNOS_CERRAR'
    ],

    admin: [
      'DASHBOARD_VER',

      'VENTAS_CREAR',
      'VENTAS_DEVOLVER',
      'VENTAS_HISTORIAL_VER',
      'VENTAS_CANCELAR',

      'INVENTARIO_VER',
      'INVENTARIO_MOVIMIENTOS_VER',
      'INVENTARIO_EDITAR',

      'PRODUCTOS_VER',
      'PRODUCTOS_CREAR',
      'PRODUCTOS_EDITAR',
      'PRODUCTOS_ELIMINAR',

      'TURNOS_VER',
      'TURNOS_ABRIR',
      'TURNOS_CERRAR',

      'USUARIOS_VER',
      'USUARIOS_CREAR',
      'USUARIOS_EDITAR',
      'USUARIOS_ELIMINAR',

      'TIENDAS_VER',
      'TIENDAS_CREAR',
      'TIENDAS_EDITAR',
      'TIENDAS_ELIMINAR',

      'REPORTES_VER'
    ]
  };

  obtenerRolActual(): UserRole {
    const rol = localStorage.getItem('rol');

    if (rol === 'gerente' || rol === 'admin') {
      return rol;
    }

    return 'cajero';
  }

  tienePermiso(permission: Permission): boolean {
    const rol = this.obtenerRolActual();

    return this.rolePermissions[rol].includes(permission);
  }

  tieneAlgunPermiso(permissions: Permission[]): boolean {
    return permissions.some((permission) =>
      this.tienePermiso(permission)
    );
  }

  tieneTodosLosPermisos(permissions: Permission[]): boolean {
    return permissions.every((permission) =>
      this.tienePermiso(permission)
    );
  }

  obtenerPermisosActuales(): Permission[] {
    const rol = this.obtenerRolActual();

    return [...this.rolePermissions[rol]];
  }
}