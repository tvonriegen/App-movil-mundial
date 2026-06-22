import { Component } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardContent,
  IonButton,
  IonList,
  IonItem,
  IonLabel
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { PartidosService } from '../services/partidos';
import { Partido } from '../models/partido.model';

import { PrediccionesService } from '../services/predicciones';
import { Prediccion } from '../models/prediccion.model';

import { LigasService } from '../services/ligas';
import { Liga } from '../models/liga.model';

import { UsuarioService } from '../services/usuario';
import { Usuario } from '../models/usuario.model';

import { PartidosSupabaseService } from '../services/partidos-supabase';
import { adaptarPartidosSupabase } from '../adapters/partido.adapter';

import { AuthSupabaseService } from '../services/auth-supabase';

import { PrediccionesSupabaseService } from '../services/predicciones-supabase';
import { adaptarPrediccionesSupabase } from '../adapters/prediccion.adapter';

import { LigasSupabaseService } from '../services/ligas-supabase';
import { adaptarLigasSupabase } from '../adapters/liga.adapter';

import { UsuariosSupabaseService } from '../services/usuarios-supabase';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardContent,
    IonButton,
    IonList,
    IonItem,
    IonLabel
  ],
})
export class Tab1Page {
  partidos: Partido[] = [];
  predicciones: Prediccion[] = [];
  ligas: Liga[] = [];

  usuario!: Usuario;

  constructor(
    private partidosService: PartidosService,
    private prediccionesService: PrediccionesService,
    private ligasService: LigasService,
    private usuarioService: UsuarioService,
    private partidosSupabaseService: PartidosSupabaseService,
    private authSupabaseService: AuthSupabaseService,
    private prediccionesSupabaseService: PrediccionesSupabaseService,
    private ligasSupabaseService: LigasSupabaseService,
    private usuariosSupabaseService: UsuariosSupabaseService
  ) {
    this.cargarDatosIniciales();
  }

  ionViewWillEnter() {
    this.cargarDatosIniciales();
  }

  cargarDatosIniciales() {
    this.usuario = this.usuarioService.obtenerUsuario();

    this.partidos = this.partidosService.obtenerPartidos();

    this.predicciones = this.prediccionesService.obtenerPredicciones()
      .filter(prediccion => prediccion.usuarioId === this.usuario.id);

    this.ligas = this.ligasService.obtenerLigas();

    this.cargarPerfilDesdeSupabase();
    this.cargarPartidosDesdeSupabase();
    this.cargarPrediccionesDesdeSupabase();
    this.cargarLigasDesdeSupabase();
  }

  get partidoDestacado(): Partido | undefined {
    return this.partidos.find(partido => partido.estado === 'pendiente');
  }

  tienePrediccion(partidoId: number): boolean {
    return this.obtenerPrediccionMasReciente(partidoId) !== undefined;
  }

  textoPrediccion(partidoId: number): string {
    const prediccion = this.obtenerPrediccionMasReciente(partidoId);

    if (!prediccion) {
      return '';
    }

    return `${prediccion.golesLocal} - ${prediccion.golesVisitante}`;
  }

  obtenerPrediccionMasReciente(partidoId: number): Prediccion | undefined {
    const prediccionesPartido = this.predicciones
      .filter(prediccion => prediccion.partidoId === partidoId)
      .sort((a, b) => {
        const fechaA = new Date(a.fechaCreacion).getTime();
        const fechaB = new Date(b.fechaCreacion).getTime();

        return fechaB - fechaA;
      });

    return prediccionesPartido[0];
  }

  obtenerLigasDestacadas(): Liga[] {
    return this.ligas.slice(0, 2);
  }

  puntosCalculados(): number {
    let total = 0;

    for (const prediccion of this.predicciones) {
      const partido = this.partidos.find(
        partido => partido.id === prediccion.partidoId
      );

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

  proximosPartidos(): Partido[] {
    return this.partidos
      .filter(partido => partido.estado === 'pendiente')
      .slice(0, 3);
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

      console.log('Inicio cargó perfil desde Supabase:', perfil);
    } catch (error) {
      console.error('Error al cargar perfil en Inicio desde Supabase:', error);
    }
  }

  async cargarPartidosDesdeSupabase() {
    try {
      const partidosSupabase = await this.partidosSupabaseService.obtenerPartidos();

      this.partidos = adaptarPartidosSupabase(partidosSupabase);

      console.log('Inicio cargó partidos desde Supabase:', this.partidos);
    } catch (error) {
      console.error('Error al cargar partidos en Inicio desde Supabase:', error);

      this.partidos = this.partidosService.obtenerPartidos();
    }
  }

  async cargarPrediccionesDesdeSupabase() {
    try {
      const usuarioSupabase = await this.authSupabaseService.obtenerUsuarioActual();

      if (!usuarioSupabase) {
        return;
      }

      const prediccionesSupabase = await this.prediccionesSupabaseService.obtenerMisPredicciones(
        usuarioSupabase.id
      );

      this.predicciones = adaptarPrediccionesSupabase(prediccionesSupabase);

      console.log('Inicio cargó predicciones desde Supabase:', this.predicciones);
    } catch (error) {
      console.error('Error al cargar predicciones en Inicio desde Supabase:', error);

      this.predicciones = this.prediccionesService.obtenerPredicciones()
        .filter(prediccion => prediccion.usuarioId === this.usuario.id);
    }
  }

  async cargarLigasDesdeSupabase() {
    try {
      const usuarioSupabase = await this.authSupabaseService.obtenerUsuarioActual();

      if (!usuarioSupabase) {
        return;
      }

      const ligasSupabase = await this.ligasSupabaseService.obtenerMisLigas(
        usuarioSupabase.id
      );

      const ligasAdaptadas = adaptarLigasSupabase(ligasSupabase);

      const ligasConMiembros = await Promise.all(
        ligasAdaptadas.map(async (liga) => {
          const miembros = await this.ligasSupabaseService.obtenerMiembrosLiga(liga.id);

          return {
            ...liga,
            miembros: miembros.length
          };
        })
      );

      this.ligas = ligasConMiembros;

      console.log('Inicio cargó ligas con miembros reales:', this.ligas);
    } catch (error) {
      console.error('Error al cargar ligas en Inicio desde Supabase:', error);

      this.ligas = [];
    }
  }
}