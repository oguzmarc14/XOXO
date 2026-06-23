import { Injectable } from '@angular/core';

import { Permission } from '../models/permission.model';
import { UserRole } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private readonly rolePermissions:
    Record<UserRole, Permission[]> = {
      cajero: [
        'DASHBOARD_VER',

        'VENTAS_CREAR',
        'VENTAS_HISTORIAL_VER',
        'VENTAS_DEVOLVER',
        'VENTAS_CANCELAR',

        'INVENTARIO_VER'
      ],

      gerente: [
        'DASHBOARD_VER',

        'VENTAS_CREAR',
        'VENTAS_HISTORIAL_VER',
        'VENTAS_DEVOLVER',
        'VENTAS_CANCELAR',

        'INVENTARIO_VER',
        'INVENTARIO_EDITAR',
        'INVENTARIO_MOVIMIENTOS_VER',

        'TURNOS_VER',
        'TURNOS_ABRIR',
        'TURNOS_CERRAR',

        'PRODUCTOS_VER',
        'PRODUCTOS_GESTIONAR'
      ],

      admin: [
        'DASHBOARD_VER',

        'VENTAS_CREAR',
        'VENTAS_HISTORIAL_VER',
        'VENTAS_DEVOLVER',
        'VENTAS_CANCELAR',

        'PRODUCTOS_VER',
        'PRODUCTOS_GESTIONAR',

        'USUARIOS_VER',
        'USUARIOS_GESTIONAR',

        'TIENDAS_VER',
        'TIENDAS_GESTIONAR',

        'REPORTES_VER'
      ]
    };

  obtenerRolActual(): UserRole {
    const rolGuardado = localStorage.getItem('rol');

    if (
      rolGuardado === 'cajero' ||
      rolGuardado === 'gerente' ||
      rolGuardado === 'admin'
    ) {
      return rolGuardado;
    }

    return 'cajero';
  }

  obtenerPermisosDelRol(
    rol: UserRole
  ): Permission[] {
    return this.rolePermissions[rol];
  }

  obtenerPermisosActuales(): Permission[] {
    return this.obtenerPermisosDelRol(
      this.obtenerRolActual()
    );
  }

  tienePermiso(
    permission: Permission
  ): boolean {
    return this.obtenerPermisosActuales().includes(
      permission
    );
  }

  tieneAlgunPermiso(
    permissions: Permission[]
  ): boolean {
    return permissions.some((permission) =>
      this.tienePermiso(permission)
    );
  }

  tieneTodosLosPermisos(
    permissions: Permission[]
  ): boolean {
    return permissions.every((permission) =>
      this.tienePermiso(permission)
    );
  }
}