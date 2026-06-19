import { Routes } from '@angular/router';

import { Login } from './features/auth/login/login';

import { DashboardCajero } from './features/dashboard-cajero/pages/dashboard-cajero/dashboard-cajero';
import { DashboardGerente } from './features/dashboard-gerente/pages/dashboard-gerente/dashboard-gerente';

import { NuevaVenta } from './features/ventas/nueva-venta/nueva-venta';
import { HistorialVentas } from './features/ventas/historial-ventas/historial-ventas';
import { ListaInventario } from './features/inventario/lista-inventario/lista-inventario';

export const routes: Routes = [
  {
    path: '',
    component: Login
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
    path: 'nueva-venta',
    component: NuevaVenta
  },
  {
    path: 'historial-ventas',
    component: HistorialVentas
  },
  {
    path: 'lista-inventario',
    component: ListaInventario
  },
  {
    path: '**',
    redirectTo: ''
  }
];