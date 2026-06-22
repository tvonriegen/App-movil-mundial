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

  constructor(
    private usuarioService: UsuarioService,
    private prediccionesService: PrediccionesService,
    private ligasService: LigasService,
    private partidosService: PartidosService,
    private alertController: AlertController,
    private router: Router,
    private partidosSupabaseService: PartidosSupabaseService,
    private authSupabaseService: AuthSupabaseService
  ) {
    this.usuario = this.usuarioService.obtenerUsuario();

    // Respaldo local inicial por si Supabase falla
    this.partidos = this.partidosService.obtenerPartidos();

    // Luego intenta cargar desde Supabase
    this.cargarPartidosDesdeSupabase();
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

  cantidadPredicciones(): number {
    return this.prediccionesService.obtenerPredicciones()
      .filter(prediccion => prediccion.usuarioId === this.usuario.id)
      .length;
  }

  cantidadLigas(): number {
    return this.ligasService.obtenerLigas().length;
  }

  puntosCalculados(): number {
    return this.prediccionesService.obtenerPuntosTotales(
      this.partidos,
      this.usuario.id
    );
  }

  aciertosCalculados(): number {
    return this.prediccionesService.obtenerAciertosExactos(
      this.partidos,
      this.usuario.id
    );
  }

  obtenerPartido(partidoId: number): Partido | undefined {
    return this.partidos.find(partido => partido.id === partidoId);
  }

  misPredicciones(): Prediccion[] {
    return this.prediccionesService.obtenerPredicciones()
      .filter(prediccion => prediccion.usuarioId === this.usuario.id);
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
          handler: (data) => {
            const nombre = data.nombre?.trim();
            const rol = data.rol?.trim();

            if (!nombre || !rol) {
              return false;
            }

            this.usuarioService.actualizarPerfil(nombre, rol);
            this.usuario = this.usuarioService.obtenerUsuario();

            return true;
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