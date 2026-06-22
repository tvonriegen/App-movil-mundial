import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonButton,
  IonInput,
  IonItem,
  IonLabel,
  ToastController
} from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuarioService } from '../services/usuario';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonButton,
    IonInput,
    IonItem,
    IonLabel
  ]
})
export class LoginPage {
  nombreUsuario = '';
  password = '';

  constructor(
    private router: Router,
    private usuarioService: UsuarioService,
    private toastController: ToastController
  ) {}

  async iniciarSesion() {
    const usuarioLimpio = this.nombreUsuario.trim();
    const passwordLimpia = this.password.trim();

    if (!usuarioLimpio || !passwordLimpia) {
      await this.mostrarErrorLogin();
      return;
    }

    const usuarioActual = this.usuarioService.obtenerUsuario();

    this.usuarioService.actualizarPerfil(usuarioLimpio, usuarioActual.rol);
    this.usuarioService.iniciarSesion();

    this.router.navigate(['/tabs/tab1']);
  }

  crearCuenta() {
    this.iniciarSesion();
  }

  async mostrarErrorLogin() {
    const toast = await this.toastController.create({
      message: 'Ingresa tu nombre de usuario y contraseña para continuar.',
      duration: 2200,
      position: 'bottom',
      color: 'danger'
    });

    await toast.present();
  }
}