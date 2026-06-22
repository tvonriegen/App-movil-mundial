import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardContent,
  IonButtons,
  IonBackButton,
  IonBadge
} from '@ionic/angular/standalone';

import { LigasService } from '../services/ligas';
import { PrediccionesService } from '../services/predicciones';
import { PartidosService } from '../services/partidos';

import { Liga } from '../models/liga.model';
import { Partido } from '../models/partido.model';
import { Prediccion } from '../models/prediccion.model';

import { PartidosSupabaseService } from '../services/partidos-supabase';
import { adaptarPartidosSupabase } from '../adapters/partido.adapter';

import { AuthSupabaseService } from '../services/auth-supabase';
import {
  LigasSupabaseService,
  MiembroLigaSupabase,
  PrediccionRankingSupabase
} from '../services/ligas-supabase';

interface JugadorRanking {
  posicion: number;
  nombre: string;
  puntos: number;
  avatar: string;
  esUsuario?: boolean;
  usuarioId?: string;
}

@Component({
  selector: 'app-ranking',
  templateUrl: './ranking.page.html',
  styleUrls: ['./ranking.page.scss'],
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
    IonButtons,
    IonBackButton,
    IonBadge
  ]
})
export class RankingPage {
  liga?: Liga;
  ranking: JugadorRanking[] = [];

  partidos: Partido[] = [];
  predicciones: Prediccion[] = [];

  ligaId: number;
  usuarioActualId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private ligasService: LigasService,
    private prediccionesService: PrediccionesService,
    private partidosService: PartidosService,
    private partidosSupabaseService: PartidosSupabaseService,
    private authSupabaseService: AuthSupabaseService,
    private ligasSupabaseService: LigasSupabaseService
  ) {
    this.ligaId = Number(this.route.snapshot.paramMap.get('id'));

    this.liga = this.ligasService.obtenerLigaPorId(this.ligaId);

    this.partidos = this.partidosService.obtenerPartidos();

    this.predicciones = this.prediccionesService.obtenerPredicciones()
      .filter(prediccion => prediccion.usuarioId === 1);

    this.cargarRankingDemo();

    this.cargarDatosRankingDesdeSupabase();
  }

  ionViewWillEnter() {
    this.partidos = this.partidosService.obtenerPartidos();

    this.predicciones = this.prediccionesService.obtenerPredicciones()
      .filter(prediccion => prediccion.usuarioId === 1);

    this.cargarRankingDemo();

    this.cargarDatosRankingDesdeSupabase();
  }

  cargarRankingDemo() {
    if (!this.liga) {
      return;
    }

    const participantesSinPosicion = [
      {
        nombre: 'Tú',
        puntos: this.puntosUsuarioCalculadosLocal(),
        avatar: 'T',
        esUsuario: true
      }
    ];

    this.ranking = participantesSinPosicion
      .sort((a, b) => b.puntos - a.puntos)
      .map((jugador, index) => ({
        ...jugador,
        posicion: index + 1
      }));
  }

  async cargarDatosRankingDesdeSupabase() {
    try {
      const usuario = await this.authSupabaseService.obtenerUsuarioActual();

      if (!usuario) {
        return;
      }

      this.usuarioActualId = usuario.id;

      const [partidosSupabase, ligaSupabase, miembros] = await Promise.all([
        this.partidosSupabaseService.obtenerPartidos(),
        this.ligasSupabaseService.obtenerLigaPorId(this.ligaId),
        this.ligasSupabaseService.obtenerMiembrosLiga(this.ligaId)
      ]);

      this.partidos = adaptarPartidosSupabase(partidosSupabase);

      if (ligaSupabase) {
        this.liga = {
          id: ligaSupabase.id,
          nombre: ligaSupabase.nombre,
          tipo: ligaSupabase.tipo,
          codigo: ligaSupabase.codigo ?? undefined,
          miembros: miembros.length,
          posicionUsuario: 1,
          puntosUsuario: 0
        };
      }

      const usuariosIds = miembros.map(miembro => miembro.usuario_id);

      const prediccionesSupabase = await this.ligasSupabaseService.obtenerPrediccionesPorUsuarios(
        usuariosIds
      );

      this.construirRankingReal(miembros, prediccionesSupabase);

    } catch (error) {
      console.error('Error al cargar ranking real desde Supabase:', error);

      this.cargarRankingDemo();
    }
  }

  construirRankingReal(
    miembros: MiembroLigaSupabase[],
    prediccionesSupabase: PrediccionRankingSupabase[]
  ) {
    const participantes = miembros.map((miembro) => {
      const prediccionesUsuario = prediccionesSupabase.filter(
        prediccion => prediccion.usuario_id === miembro.usuario_id
      );

      const puntos = this.calcularPuntosUsuarioSupabase(prediccionesUsuario);

      const nombre = miembro.nombre_visible || miembro.nombre_usuario || 'Usuario';

      return {
        nombre,
        puntos,
        avatar: this.obtenerAvatar(nombre),
        esUsuario: miembro.usuario_id === this.usuarioActualId,
        usuarioId: miembro.usuario_id
      };
    });

    this.ranking = participantes
      .sort((a, b) => b.puntos - a.puntos)
      .map((jugador, index) => ({
        ...jugador,
        posicion: index + 1
      }));
  }

  calcularPuntosUsuarioSupabase(prediccionesUsuario: PrediccionRankingSupabase[]): number {
    let total = 0;

    for (const partido of this.partidos) {
      if (partido.estado !== 'finalizado') {
        continue;
      }

      const prediccion = prediccionesUsuario.find(
        prediccionUsuario => prediccionUsuario.partido_id === partido.id
      );

      if (!prediccion) {
        continue;
      }

      const puntos = this.prediccionesService.calcularPuntosPrediccion(
        prediccion.goles_local,
        prediccion.goles_visitante,
        partido.golesLocal ?? 0,
        partido.golesVisitante ?? 0
      );

      total += puntos;
    }

    return total;
  }

  puntosUsuarioCalculadosLocal(): number {
    let total = 0;

    for (const partido of this.partidos) {
      if (partido.estado !== 'finalizado') {
        continue;
      }

      const prediccion = this.predicciones.find(
        prediccionLocal => prediccionLocal.partidoId === partido.id
      );

      if (!prediccion) {
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

  posicionUsuarioActual(): number {
    const usuario = this.ranking.find(jugador => jugador.esUsuario);

    if (!usuario) {
      return 0;
    }

    return usuario.posicion;
  }

  puntosUsuarioActual(): number {
    const usuario = this.ranking.find(jugador => jugador.esUsuario);

    if (!usuario) {
      return 0;
    }

    return usuario.puntos;
  }

  obtenerAvatar(nombre: string): string {
    if (!nombre || nombre.trim().length === 0) {
      return 'U';
    }

    return nombre.trim().charAt(0).toUpperCase();
  }
}