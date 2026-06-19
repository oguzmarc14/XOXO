import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Sidebar } from '../../../../shared/components/sidebar/sidebar';
import { Topbar } from '../../../../shared/components/topbar/topbar';

@Component({
  selector: 'app-dashboard-gerente',
  standalone: true,
  imports: [
    RouterLink,
    Sidebar,
    Topbar
  ],
  templateUrl: './dashboard-gerente.html',
  styleUrl: './dashboard-gerente.css'
})
export class DashboardGerente {
  sucursal: string =
    localStorage.getItem('sucursal') || 'Sucursal #027 - Centro';

  turnoActivo: boolean = true;
}