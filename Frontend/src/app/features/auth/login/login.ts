import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  correo: string = '';
  password: string = '';
  error: string = '';

  constructor(private router: Router) {}

  iniciarSesion() {
    const usuarios = [
      {
        correo: 'gerente@xoxo.com',
        password: '1234',
        rol: 'gerente'
      },
      {
        correo: 'cajero@xoxo.com',
        password: '1234',
        rol: 'cajero'
      }
    ];

    const usuarioEncontrado = usuarios.find(
      usuario =>
        usuario.correo === this.correo.trim().toLowerCase() &&
        usuario.password === this.password
    );

    if (!usuarioEncontrado) {
      this.error = 'Correo o contraseña incorrectos.';
      return;
    }

    localStorage.setItem('correo', usuarioEncontrado.correo);
    localStorage.setItem('rol', usuarioEncontrado.rol);

    if (usuarioEncontrado.rol === 'gerente') {
      this.router.navigate(['/dashboard-gerente']);
    } else {
      this.router.navigate(['/dashboard-cajero']);
    }
  }
}