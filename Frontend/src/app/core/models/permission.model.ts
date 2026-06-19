export type Permission =
  // Inicio
  | 'DASHBOARD_VER'

  // Ventas
  | 'VENTAS_CREAR'
  | 'VENTAS_DEVOLVER'
  | 'VENTAS_HISTORIAL_VER'
  | 'VENTAS_CANCELAR'

  // Inventario
  | 'INVENTARIO_VER'
  | 'INVENTARIO_MOVIMIENTOS_VER'
  | 'INVENTARIO_EDITAR'

  // Productos
  | 'PRODUCTOS_VER'
  | 'PRODUCTOS_CREAR'
  | 'PRODUCTOS_EDITAR'
  | 'PRODUCTOS_ELIMINAR'

  // Turnos
  | 'TURNOS_VER'
  | 'TURNOS_ABRIR'
  | 'TURNOS_CERRAR'

  // Usuarios
  | 'USUARIOS_VER'
  | 'USUARIOS_CREAR'
  | 'USUARIOS_EDITAR'
  | 'USUARIOS_ELIMINAR'

  // Tiendas o sucursales
  | 'TIENDAS_VER'
  | 'TIENDAS_CREAR'
  | 'TIENDAS_EDITAR'
  | 'TIENDAS_ELIMINAR'

  // Reportes
  | 'REPORTES_VER';