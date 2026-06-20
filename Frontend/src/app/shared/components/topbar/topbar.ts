import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  Usuario
} from '../../../core/models/usuario.model';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './topbar.html',
  styleUrl: './topbar.css'
})
export class Topbar {
  @Input() titulo = '';
  @Input() subtitulo = '';

  @Input() usuario!: Usuario;

  @Output() revisarPerfil =
    new EventEmitter<void>();

  @Output() cerrarSesion =
    new EventEmitter<void>();

  menuUsuarioAbierto = false;

  constructor(
    private elementRef:
      ElementRef<HTMLElement>
  ) {}

  alternarMenuUsuario(
    event: MouseEvent
  ): void {
    event.stopPropagation();

    this.menuUsuarioAbierto =
      !this.menuUsuarioAbierto;
  }

  abrirPerfil(): void {
    this.menuUsuarioAbierto = false;

    this.revisarPerfil.emit();
  }

  salir(): void {
    this.menuUsuarioAbierto = false;

    this.cerrarSesion.emit();
  }

  manejarErrorImagen(
    event: Event
  ): void {
    const imagen =
      event.target as HTMLImageElement;

    imagen.src = '/XoXO.png';
  }

  @HostListener(
    'document:click',
    ['$event']
  )
  cerrarMenuAlHacerClickFuera(
    event: MouseEvent
  ): void {
    const objetivo =
      event.target as Node;

    const clickDentro =
      this.elementRef
        .nativeElement
        .contains(objetivo);

    if (!clickDentro) {
      this.menuUsuarioAbierto = false;
    }
  }

  @HostListener(
    'document:keydown.escape'
  )
  cerrarMenuConEscape(): void {
    this.menuUsuarioAbierto = false;
  }
}
