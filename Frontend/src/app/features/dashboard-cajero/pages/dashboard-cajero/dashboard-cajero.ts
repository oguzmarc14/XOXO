import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Sidebar } from '../../../../shared/components/sidebar/sidebar';
import { Topbar } from '../../../../shared/components/topbar/topbar';

@Component({
  selector: 'app-dashboard-cajero',
  standalone: true,
  imports: [
    RouterLink,
    Sidebar,
    Topbar
  ],
  templateUrl: './dashboard-cajero.html',
  styleUrl: './dashboard-cajero.css'
})
export class DashboardCajero {
  sucursal: string =
    localStorage.getItem('sucursal') || 'Sucursal #027 - Centro';
}