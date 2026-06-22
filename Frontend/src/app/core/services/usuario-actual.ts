import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  Observable
} from 'rxjs';

import {
  SexoUsuario,
  Usuario,
  UserRole
} from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class UsuarioActualService {
  private readonly claveUsuario =
    'usuarioActual';

  private readonly usuarioSubject =
    new BehaviorSubject<Usuario>(
      this.obtenerUsuarioGuardado()
    );

  readonly usuario$: Observable<Usuario> =
    this.usuarioSubject.asObservable();

  obtenerUsuario(): Usuario {
    return this.usuarioSubject.value;
  }

  establecerUsuario(
    usuario: Usuario
  ): void {
    const usuarioCompleto: Usuario = {
      ...usuario,
      avatar: this.obtenerAvatarPorRolYSexo(
        usuario.rol,
        usuario.sexo
      )
    };

    this.guardarUsuario(usuarioCompleto);
  }

  actualizarUsuario(
    cambios: Partial<Usuario>
  ): Usuario {
    const usuarioActual =
      this.obtenerUsuario();

    const rolActualizado =
      cambios.rol ?? usuarioActual.rol;

    const sexoActualizado =
      cambios.sexo ?? usuarioActual.sexo;

    const usuarioActualizado: Usuario = {
      ...usuarioActual,
      ...cambios,
      rol: rolActualizado,
      sexo: sexoActualizado,
      avatar: this.obtenerAvatarPorRolYSexo(
        rolActualizado,
        sexoActualizado
      )
    };

    this.guardarUsuario(
      usuarioActualizado
    );

    return usuarioActualizado;
  }

  obtenerAvatarPorRolYSexo(
    rol: UserRole,
    sexo: SexoUsuario
  ): string {
    if (rol === 'admin') {
      return sexo === 'mujer'
        ? '/Administradora.png'
        : '/Administrador.png';
    }

    if (rol === 'gerente') {
      return sexo === 'mujer'
        ? '/GerenteF.png'
        : '/GerenteM.png';
    }

    return sexo === 'mujer'
      ? '/Cajera.png'
      : '/Cajero.png';
  }

  obtenerRutaPerfil(): string {
    const rol =
      this.obtenerUsuario().rol;

    if (rol === 'admin') {
      return '/admin/perfil';
    }

    if (rol === 'gerente') {
      return '/gerente/perfil';
    }

    return '/cajero/perfil';
  }

  obtenerRutaDashboard(): string {
    const rol =
      this.obtenerUsuario().rol;

    if (rol === 'admin') {
      return '/admin/inicio';
    }

    if (rol === 'gerente') {
      return '/gerente/inicio';
    }

    return '/cajero/inicio';
  }

  cerrarSesion(): void {
    localStorage.removeItem(
      this.claveUsuario
    );

    localStorage.removeItem('id');
    localStorage.removeItem('nombre');
    localStorage.removeItem('sexo');
    localStorage.removeItem('correo');
    localStorage.removeItem('rol');
    localStorage.removeItem('cargo');
    localStorage.removeItem('sucursal');
    localStorage.removeItem('avatar');
    localStorage.removeItem(
      'sesionActiva'
    );

    this.usuarioSubject.next(
      this.crearUsuarioVacio()
    );
  }

  private guardarUsuario(
    usuario: Usuario
  ): void {
    localStorage.setItem(
      this.claveUsuario,
      JSON.stringify(usuario)
    );

    localStorage.setItem(
      'id',
      usuario.id.toString()
    );

    localStorage.setItem(
      'nombre',
      usuario.nombre
    );

    localStorage.setItem(
      'sexo',
      usuario.sexo
    );

    localStorage.setItem(
      'correo',
      usuario.correo
    );

    localStorage.setItem(
      'rol',
      usuario.rol
    );

    localStorage.setItem(
      'cargo',
      usuario.cargo
    );

    localStorage.setItem(
      'sucursal',
      usuario.sucursal
    );

    localStorage.setItem(
      'avatar',
      usuario.avatar
    );

    if (usuario.tiendaId) {
      localStorage.setItem(
        'tiendaId',
        usuario.tiendaId
      );
    } else {
      localStorage.removeItem('tiendaId');
    }

    this.usuarioSubject.next(usuario);
  }

  private obtenerUsuarioGuardado(): Usuario {
    const usuarioJson =
      localStorage.getItem(
        this.claveUsuario
      );

    if (usuarioJson) {
      try {
        const usuarioGuardado =
          JSON.parse(usuarioJson) as Usuario;

        const rol =
          this.validarRol(
            usuarioGuardado.rol
          );

        const sexo =
          this.validarSexo(
            usuarioGuardado.sexo
          );

        return {
          ...usuarioGuardado,
          rol,
          sexo,
          avatar:
            this.obtenerAvatarPorRolYSexo(
              rol,
              sexo
            )
        };
      } catch {
        localStorage.removeItem(
          this.claveUsuario
        );
      }
    }

    const rol =
      this.obtenerRolGuardado();

    const sexo =
      this.obtenerSexoGuardado();

    return {
      id: Number(
        localStorage.getItem('id')
      ) || 0,

      nombre:
        localStorage.getItem('nombre') ||
        'Usuario XoXO',

      sexo,

      correo:
        localStorage.getItem('correo') ||
        'usuario@xoxo.com',

      rol,

      cargo:
        localStorage.getItem('cargo') ||
        this.obtenerCargoPorRol(rol),

      sucursal:
        localStorage.getItem('sucursal') ||
        'Sucursal no asignada',

      tiendaId:
        localStorage.getItem('tiendaId') ||
        undefined,

      avatar:
        this.obtenerAvatarPorRolYSexo(
          rol,
          sexo
        )
    };
  }

  private obtenerRolGuardado(): UserRole {
    return this.validarRol(
      localStorage.getItem('rol')
    );
  }

  private obtenerSexoGuardado():
    SexoUsuario {
    return this.validarSexo(
      localStorage.getItem('sexo')
    );
  }

  private validarRol(
    rol: string | null | undefined
  ): UserRole {
    if (
      rol === 'admin' ||
      rol === 'gerente' ||
      rol === 'cajero'
    ) {
      return rol;
    }

    return 'cajero';
  }

  private validarSexo(
    sexo: string | null | undefined
  ): SexoUsuario {
    if (
      sexo === 'hombre' ||
      sexo === 'mujer'
    ) {
      return sexo;
    }

    return 'hombre';
  }

  private obtenerCargoPorRol(
    rol: UserRole
  ): string {
    if (rol === 'admin') {
      return 'Administrador';
    }

    if (rol === 'gerente') {
      return 'Gerente';
    }

    return 'Cajero';
  }

  private crearUsuarioVacio(): Usuario {
    return {
      id: 0,
      nombre: 'Usuario XoXO',
      sexo: 'hombre',
      correo: 'usuario@xoxo.com',
      rol: 'cajero',
      cargo: 'Cajero',
      sucursal:
        'Sucursal no asignada',
      avatar: '/Cajero.png'
    };
  }
}