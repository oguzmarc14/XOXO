import { Routes } from '@angular/router';

/* Layouts */
import { AdminLayout } from './layouts/admin-layout/admin-layout';

/* Autenticación */
import { Login } from './features/auth/login/login';

/* Perfil */
import { Perfil } from './features/perfil/perfil';

/* Dashboards */
import { DashboardCajero } from './features/dashboard-cajero/pages/dashboard-cajero/dashboard-cajero';
import { DashboardGerente } from './features/dashboard-gerente/pages/dashboard-gerente/dashboard-gerente';
import { DashboardAdmin } from './features/dashboard-admin/pages/dashboard-admin/dashboard-admin';

/* Inventario */
import { ListaInventario } from './features/inventario/lista-inventario/lista-inventario';
import { MovimientosInventario } from './features/inventario/movimientos-inventario/movimientos-inventario';

/* Productos */
import { CrearProducto } from './features/productos/crear-producto/crear-producto';
import { EditarProducto } from './features/productos/editar-producto/editar-producto';
import { ListaProductos } from './features/productos/lista-productos/lista-productos';

/* Tiendas */
import { CrearTienda } from './features/tiendas/crear-tienda/crear-tienda';
import { ListaTiendas } from './features/tiendas/lista-tiendas/lista-tiendas';

/* Turnos */
import { AbrirTurno } from './features/turnos/abrir-turno/abrir-turno';
import { CerrarTurno } from './features/turnos/cerrar-turno/cerrar-turno';

/* Usuarios */
import { CrearUsuario } from './features/usuarios/crear-usuario/crear-usuario';
import { ListaUsuarios } from './features/usuarios/lista-usuarios/lista-usuarios';

/* Ventas */
import { HistorialVentas } from './features/ventas/historial-ventas/historial-ventas';
import { NuevaVenta } from './features/ventas/nueva-venta/nueva-venta';

export const routes: Routes = [
  {
    path: '',
    component: Login,
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: Login
  },

  {
    path: '',
    component: AdminLayout,
    children: [
      {
        path: 'dashboard-admin',
        component: DashboardAdmin
      },
      {
        path: 'admin/perfil',
        component: Perfil
      },

      {
        path: 'lista-inventario',
        component: ListaInventario
      },
      {
        path: 'movimientos-inventario',
        component: MovimientosInventario
      },

      {
        path: 'crear-producto',
        component: CrearProducto
      },
      {
        path: 'editar-producto/:id',
        component: EditarProducto
      },
      {
        path: 'lista-productos',
        component: ListaProductos
      },

      {
        path: 'crear-tienda',
        component: CrearTienda
      },
      {
        path: 'lista-tiendas',
        component: ListaTiendas
      },

      {
        path: 'abrir-turno',
        component: AbrirTurno
      },
      {
        path: 'cerrar-turno',
        component: CerrarTurno
      },

      {
        path: 'crear-usuario',
        component: CrearUsuario
      },
      {
        path: 'lista-usuarios',
        component: ListaUsuarios
      },

      {
        path: 'historial-ventas',
        component: HistorialVentas
      },
      {
        path: 'nueva-venta',
        component: NuevaVenta
      }
    ]
  },

  {
    path: 'dashboard-cajero',
    component: DashboardCajero
  },
  {
    path: 'dashboard-gerente',
    component: DashboardGerente
  },
  {
    path: 'cajero/perfil',
    component: Perfil
  },
  {
    path: 'gerente/perfil',
    component: Perfil
  },

  {
    path: '**',
    redirectTo: ''
  }
];