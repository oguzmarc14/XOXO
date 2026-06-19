import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Sidebar } from '../../../../shared/components/sidebar/sidebar';
import { Topbar } from '../../../../shared/components/topbar/topbar';

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [
    RouterLink,
    Sidebar,
    Topbar
  ],
  templateUrl: './dashboard-admin.html',
  styleUrl: './dashboard-admin.css'
})
export class DashboardAdmin {
  totalSucursales = 200;
  usuariosActivos = 864;
  ventasDelDia = 1284;
  totalVendido = 286450;
}