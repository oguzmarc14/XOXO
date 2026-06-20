import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Permission } from '../../../core/models/permission.model';
import { PermissionService } from '../../../core/services/permission';

export interface CardResumenItem {
  titulo: string;
  valor: string | number;
  descripcion: string;
  icono: string;

  permiso?: Permission;

  ruta?: string;
  textoEnlace?: string;

  estado?: 'normal' | 'success' | 'warning' | 'danger' | 'featured';
}

@Component({
  selector: 'app-card-resumen',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './card-resumen.html',
  styleUrl: './card-resumen.css'
})
export class CardResumen {
  @Input() titulo = 'Resumen';
  @Input() subtitulo = '';
  @Input() items: CardResumenItem[] = [];

  constructor(
    private permissionService: PermissionService
  ) {}

  get itemsVisibles(): CardResumenItem[] {
    return this.items.filter((item) => {
      if (!item.permiso) {
        return true;
      }

      return this.permissionService.tienePermiso(item.permiso);
    });
  }

  obtenerClaseEstado(item: CardResumenItem): string {
    return item.estado || 'normal';
  }
}