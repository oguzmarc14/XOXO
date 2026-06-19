import { Routes } from '@angular/router';

import { Login } from './features/auth/login/login';

import { DashboardGerente } from './features/dashboard-gerente/pages/dashboard-gerente/dashboard-gerente';
import { DashboardCajero } from './features/dashboard-cajero/pages/dashboard-cajero/dashboard-cajero';

export const routes: Routes = [
  {
    path: '',
    component: Login
  },
  {
    path: 'dashboard-gerente',
    component: DashboardGerente
  },
  {
    path: 'dashboard-cajero',
    component: DashboardCajero
  },
  {
    path: '**',
    redirectTo: ''
  }
];