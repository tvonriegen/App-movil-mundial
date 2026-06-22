import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonCard,
  IonCardContent,
  IonBadge,
  AlertController
} from '@ionic/angular/standalone';

import { RouterModule, Router } from '@angular/router';

import { UsuarioService } from '../services/usuario';
import { Usuario } from '../models/usuario.model';

import { PrediccionesService } from '../services/predicciones';
import { Prediccion } from '../models/prediccion.model';

import { LigasService } from '../services/ligas';

import { PartidosService } from '../services/partidos';
import { Partido } from '../models/partido.model';

import { PartidosSupabaseService } from '../services/partidos-supabase';
import { adaptarPartidosSupabase } from '../adapters/partido.adapter';

import { AuthSupabaseService } from '../services/auth-supabase';
import { PrediccionesSupabaseService } from '../services/predicciones-supabase';
import { adaptarPrediccionesSupabase } from '../adapters/prediccion.adapter';

import { UsuariosSupabaseService } from '../services/usuarios-supabase';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonCard,
    IonCardContent,
    IonBadge
  ],
})
export class PerfilPage {
  usuario: Usuario;
  partidos: Partido[] = [];
  predicciones: Prediccion[] = [];

  constructor(
    private usuarioService: UsuarioService,
    private prediccionesService: PrediccionesService,
    private ligasService: LigasService,
    private partidosService: PartidosService,
    private alertController: AlertController,
    private router: Router,
    private partidosSupabaseService: PartidosSupabaseService,
    private authSupabaseService: AuthSupabaseService,
    private prediccionesSupabaseService: PrediccionesSupabaseService,
    private usuariosSupabaseService: UsuariosSupabaseService
  ) {
    this.usuario = this.usuarioService.obtenerUsuario();

    this.partidos = this.partidosService.obtenerPartidos();

    this.predicciones = this.prediccionesService.obtenerPredicciones()
      .filter(prediccion => prediccion.usuarioId === this.usuario.id);

    this.cargarPerfilDesdeSupabase();
    this.cargarPartidosDesdeSupabase();
    this.cargarPrediccionesDesdeSupabase();
  }

  ionViewWillEnter() {
    this.usuario = this.usuarioService.obtenerUsuario();

    this.partidos = this.partidosService.obtenerPartidos();

    this.predicciones = this.prediccionesService.obtenerPredicciones()
      .filter(prediccion => prediccion.usuarioId === this.usuario.id);

    this.cargarPerfilDesdeSupabase();
    this.cargarPartidosDesdeSupabase();
    this.cargarPrediccionesDesdeSupabase();
  }

  async cargarPerfilDesdeSupabase() {
    try {
      const usuarioSupabase = await this.authSupabaseService.obtenerUsuarioActual();

      if (!usuarioSupabase) {
        return;
      }

      const perfil = await this.usuariosSupabaseService.obtenerUsuarioPorId(
        usuarioSupabase.id
      );

      if (!perfil) {
        return;
      }

      const nombre = perfil.nombre_visible || perfil.nombre_usuario;
      const rol = perfil.rol || 'Analista táctico';

      this.usuarioService.actualizarPerfil(nombre, rol);
      this.usuario = this.usuarioService.obtenerUsuario();

      console.log('Perfil cargó usuario desde Supabase:', perfil);
    } catch (error) {
      console.error('Error al cargar perfil desde Supabase:', error);
    }
  }

  async cargarPartidosDesdeSupabase() {
    try {
      const partidosSupabase = await this.partidosSupabaseService.obtenerPartidos();

      this.partidos = adaptarPartidosSupabase(partidosSupabase);

      console.log('Perfil cargó partidos desde Supabase:', this.partidos);
    } catch (error) {
      console.error('Error al cargar partidos en Perfil desde Supabase:', error);

      this.partidos = this.partidosService.obtenerPartidos();
    }
  }

  async cargarPrediccionesDesdeSupabase() {
    try {
      const usuario = await this.authSupabaseService.obtenerUsuarioActual();

      if (!usuario) {
        console.log('Perfil: no hay usuario Supabase actual');
        return;
      }

      const prediccionesSupabase = await this.prediccionesSupabaseService.obtenerMisPredicciones(
        usuario.id
      );

      this.predicciones = adaptarPrediccionesSupabase(prediccionesSupabase);

      console.log('Perfil cargó predicciones adaptadas:', this.predicciones);
    } catch (error) {
      console.error('Error al cargar predicciones en Perfil desde Supabase:', error);

      this.predicciones = this.prediccionesService.obtenerPredicciones()
        .filter(prediccion => prediccion.usuarioId === this.usuario.id);
    }
  }

  cantidadPredicciones(): number {
    return this.predicciones.length;
  }

  cantidadLigas(): number {
    return this.ligasService.obtenerLigas().length;
  }

  puntosCalculados(): number {
    let total = 0;

    for (const prediccion of this.predicciones) {
      const partido = this.obtenerPartido(prediccion.partidoId);

      if (!partido || partido.estado !== 'finalizado') {
        continue;
      }

      const puntos = this.prediccionesService.calcularPuntosPrediccion(
        prediccion.golesLocal,
        prediccion.golesVisitante,
        partido.golesLocal ?? 0,
        partido.golesVisitante ?? 0
      );

      total += puntos;
    }

    return total;
  }

  aciertosCalculados(): number {
    let total = 0;

    for (const prediccion of this.predicciones) {
      const partido = this.obtenerPartido(prediccion.partidoId);

      if (!partido || partido.estado !== 'finalizado') {
        continue;
      }

      if (
        prediccion.golesLocal === partido.golesLocal &&
        prediccion.golesVisitante === partido.golesVisitante
      ) {
        total++;
      }
    }

    return total;
  }

  obtenerPartido(partidoId: number): Partido | undefined {
    return this.partidos.find(partido => partido.id === partidoId);
  }

  misPredicciones(): Prediccion[] {
    return this.predicciones;
  }

  textoEstadoPartido(partidoId: number): string {
    const partido = this.obtenerPartido(partidoId);

    if (!partido) {
      return 'Partido no encontrado';
    }

    if (partido.estado === 'finalizado') {
      return 'Finalizado';
    }

    if (partido.estado === 'en_vivo') {
      return 'En vivo';
    }

    return 'Pendiente';
  }

  puntosPrediccion(prediccion: Prediccion): number | null {
    const partido = this.obtenerPartido(prediccion.partidoId);

    if (!partido || partido.estado !== 'finalizado') {
      return null;
    }

    return this.prediccionesService.calcularPuntosPrediccion(
      prediccion.golesLocal,
      prediccion.golesVisitante,
      partido.golesLocal ?? 0,
      partido.golesVisitante ?? 0
    );
  }

  partidoEstaFinalizado(partidoId: number): boolean {
    const partido = this.obtenerPartido(partidoId);
    return partido?.estado === 'finalizado';
  }

  async editarPerfil() {
    const alert = await this.alertController.create({
      header: 'Editar perfil',
      inputs: [
        {
          name: 'nombre',
          type: 'text',
          placeholder: 'Nombre',
          value: this.usuario.nombre
        },
        {
          name: 'rol',
          type: 'text',
          placeholder: 'Rol o descripción',
          value: this.usuario.rol
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Guardar',
          handler: async (data) => {
            const nombre = data.nombre?.trim();
            const rol = data.rol?.trim();

            if (!nombre || !rol) {
              return false;
            }

            try {
              const usuarioSupabase = await this.authSupabaseService.obtenerUsuarioActual();

              if (!usuarioSupabase) {
                return false;
              }

              await this.usuariosSupabaseService.actualizarPerfil(
                usuarioSupabase.id,
                nombre,
                rol
              );

              this.usuarioService.actualizarPerfil(nombre, rol);
              this.usuario = this.usuarioService.obtenerUsuario();

              return true;
            } catch (error) {
              console.error('Error al actualizar perfil en Supabase:', error);

              this.usuarioService.actualizarPerfil(nombre, rol);
              this.usuario = this.usuarioService.obtenerUsuario();

              return true;
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async verResultadoPrediccion(prediccion: Prediccion) {
    const partido = this.obtenerPartido(prediccion.partidoId);

    if (!partido) {
      return;
    }

    const puntos = this.puntosPrediccion(prediccion);

    const lineas: string[] = [
      'Resultado real:',
      `${partido.local} ${partido.golesLocal} - ${partido.golesVisitante} ${partido.visitante}`,
      '',
      'Tu predicción:',
      `${prediccion.golesLocal} - ${prediccion.golesVisitante}`,
      '',
      `Puntos obtenidos: ${puntos ?? 0}`
    ];

    const alert = await this.alertController.create({
      header: 'Resultado de tu predicción',
      cssClass: 'resultado-alerta',
      message: lineas.join('\n'),
      buttons: ['Cerrar']
    });

    await alert.present();
  }

  async cerrarSesion() {
    const alert = await this.alertController.create({
      header: 'Cerrar sesión',
      message: '¿Quieres volver a la pantalla de inicio?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Cerrar sesión',
          handler: async () => {
            try {
              await this.authSupabaseService.cerrarSesion();
            } catch (error) {
              console.error('Error al cerrar sesión en Supabase:', error);
            }

            this.usuarioService.cerrarSesion();
            this.router.navigate(['/login']);
          }
        }
      ]
    });

    await alert.present();
  }

  async limpiarDatosPrueba() {
    const alert = await this.alertController.create({
      header: 'Restablecer demo',
      message: 'Esto borrará tus predicciones, ligas creadas y cambios del perfil para volver al estado inicial de la demo.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Restablecer',
          role: 'destructive',
          handler: async () => {
            try {
              await this.authSupabaseService.cerrarSesion();
            } catch (error) {
              console.error('Error al cerrar sesión en Supabase:', error);
            }

            this.prediccionesService.limpiarPredicciones();
            this.ligasService.limpiarLigasGuardadas();
            this.usuarioService.limpiarUsuarioGuardado();

            this.router.navigate(['/login']);
          }
        }
      ]
    });

    await alert.present();
  }
}