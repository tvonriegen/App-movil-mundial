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

import { AuthSupabaseService } from '../services/auth-supabase';
import { UsuariosSupabaseService } from '../services/usuarios-supabase';
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
  email = '';
  password = '';
  nombreUsuario = '';

  modoRegistro = false;

  constructor(
    private router: Router,
    private authSupabaseService: AuthSupabaseService,
    private usuariosSupabaseService: UsuariosSupabaseService,
    private usuarioService: UsuarioService,
    private toastController: ToastController
  ) {}

  cambiarModoRegistro() {
    this.modoRegistro = !this.modoRegistro;
  }

  async iniciarSesion() {
    const emailLimpio = this.email.trim().toLowerCase();
    const passwordLimpia = this.password.trim();

    if (!emailLimpio || !passwordLimpia) {
      await this.mostrarToast('Ingresa email y contraseña.', 'danger');
      return;
    }

    try {
      const data = await this.authSupabaseService.iniciarSesion(
        emailLimpio,
        passwordLimpia
      );

      const usuario = data.user;

      if (!usuario) {
        await this.mostrarToast('No se pudo obtener el usuario.', 'danger');
        return;
      }

      const perfil = await this.usuariosSupabaseService.obtenerUsuarioPorId(usuario.id);

      if (perfil) {
        this.usuarioService.actualizarPerfil(
          perfil.nombre_visible || perfil.nombre_usuario,
          'Analista táctico'
        );
      } else {
        this.usuarioService.actualizarPerfil(
          usuario.email || 'Usuario',
          'Analista táctico'
        );
      }

      this.usuarioService.iniciarSesion();

      await this.mostrarToast('Sesión iniciada correctamente.', 'success');

      this.router.navigate(['/tabs/tab1']);
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      await this.mostrarToast('Email o contraseña incorrectos.', 'danger');
    }
  }

  async crearCuenta() {
    const emailLimpio = this.email.trim().toLowerCase();
    const passwordLimpia = this.password.trim();
    const nombreLimpio = this.nombreUsuario.trim();

    if (!emailLimpio || !passwordLimpia || !nombreLimpio) {
      await this.mostrarToast('Ingresa email, contraseña y nombre de usuario.', 'danger');
      return;
    }

    if (passwordLimpia.length < 6) {
      await this.mostrarToast('La contraseña debe tener al menos 6 caracteres.', 'danger');
      return;
    }

    try {
      const data = await this.authSupabaseService.registrar(
        emailLimpio,
        passwordLimpia
      );

      const usuario = data.user;

      if (!usuario) {
        await this.mostrarToast('No se pudo crear el usuario.', 'danger');
        return;
      }

      await this.usuariosSupabaseService.obtenerOCrearPerfil(
        usuario.id,
        nombreLimpio,
        usuario.email ?? emailLimpio
      );

      this.usuarioService.actualizarPerfil(nombreLimpio, 'Analista táctico');
      this.usuarioService.iniciarSesion();

      await this.mostrarToast('Cuenta creada correctamente.', 'success');

      this.router.navigate(['/tabs/tab1']);
    } catch (error) {
      console.error('Error al crear cuenta:', error);
      await this.mostrarToast('No se pudo crear la cuenta. Revisa los datos.', 'danger');
    }
  }

  async mostrarToast(message: string, color: 'success' | 'danger' | 'medium') {
    const toast = await this.toastController.create({
      message,
      duration: 2200,
      position: 'bottom',
      color
    });

    await toast.present();
  }

  async loginDemoPrueba1() {
    this.email = 'prueba1@gmail.com';
    this.password = 'prueba1234';

    await this.iniciarSesion();
  }

  async loginDemoPrueba2() {
    this.email = 'prueba2@gmail.com';
    this.password = 'prueba1234';

    await this.iniciarSesion();
  }
}