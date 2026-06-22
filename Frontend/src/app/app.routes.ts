import { Routes } from '@angular/router';

/* Autenticación */
import {
  Login
} from './features/auth/login/login';

/* Perfil */
import {
  Perfil
} from './features/perfil/perfil';

/* Dashboards */
import {
  DashboardCajero
} from './features/dashboard-cajero/pages/dashboard-cajero/dashboard-cajero';

import {
  DashboardGerente
} from './features/dashboard-gerente/pages/dashboard-gerente/dashboard-gerente';

import {
  DashboardAdmin
} from './features/dashboard-admin/pages/dashboard-admin/dashboard-admin';

/* Inventario */
import {
  ListaInventario
} from './features/inventario/lista-inventario/lista-inventario';

import {
  MovimientosInventario
} from './features/inventario/movimientos-inventario/movimientos-inventario';

/* Productos */
import {
  CrearProducto
} from './features/productos/crear-producto/crear-producto';

import {
  EditarProducto
} from './features/productos/editar-producto/editar-producto';

import {
  ListaProductos
} from './features/productos/lista-productos/lista-productos';

/* Tiendas */
import {
  CrearTienda
} from './features/tiendas/crear-tienda/crear-tienda';

import {
  ListaTiendas
} from './features/tiendas/lista-tiendas/lista-tiendas';

/* Turnos */
import {
  AbrirTurno
} from './features/turnos/abrir-turno/abrir-turno';

import {
  CerrarTurno
} from './features/turnos/cerrar-turno/cerrar-turno';

/* Usuarios */
import {
  CrearUsuario
} from './features/usuarios/crear-usuario/crear-usuario';

import {
  ListaUsuarios
} from './features/usuarios/lista-usuarios/lista-usuarios';

/* Ventas */
import {
  HistorialVentas
} from './features/ventas/historial-ventas/historial-ventas';

import {
  NuevaVenta
} from './features/ventas/nueva-venta/nueva-venta';

export const routes: Routes = [
  /* Login */
  {
    path: '',
    component: Login,
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: Login
  },

  /* Dashboards */
  {
    path: 'dashboard-admin',
    component: DashboardAdmin
  },
  {
    path: 'dashboard-gerente',
    component: DashboardGerente
  },
  {
    path: 'dashboard-cajero',
    component: DashboardCajero
  },

  /* Perfiles */
  {
    path: 'admin/perfil',
    component: Perfil
  },
  {
    path: 'gerente/perfil',
    component: Perfil
  },
  {
    path: 'cajero/perfil',
    component: Perfil
  },

  /* Inventario */
  {
    path: 'lista-inventario',
    component: ListaInventario
  },
  {
    path: 'movimientos-inventario',
    component: MovimientosInventario
  },

  /* Productos */
  {
    path: 'lista-productos',
    component: ListaProductos
  },
  {
    path: 'crear-producto',
    component: CrearProducto
  },
  {
    path: 'editar-producto',
    component: EditarProducto
  },

  /* Tiendas */
  {
    path: 'lista-tiendas',
    component: ListaTiendas
  },
  {
    path: 'crear-tienda',
    component: CrearTienda
  },

  /* Usuarios */
  {
    path: 'lista-usuarios',
    component: ListaUsuarios
  },
  {
    path: 'crear-usuario',
    component: CrearUsuario
  },

  /* Turnos */
  {
    path: 'abrir-turno',
    component: AbrirTurno
  },
  {
    path: 'cerrar-turno',
    component: CerrarTurno
  },

  /* Ventas */
  {
    path: 'nueva-venta',
    component: NuevaVenta
  },
  {
    path: 'historial-ventas',
    component: HistorialVentas
  },

  /* Ruta inexistente */
  {
    path: '**',
    redirectTo: 'login'
  }
];