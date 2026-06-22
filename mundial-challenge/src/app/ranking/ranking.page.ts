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
import { PartidosSupabaseService } from '../services/partidos-supabase';
import { adaptarPartidosSupabase } from '../adapters/partido.adapter';

interface JugadorRanking {
  posicion: number;
  nombre: string;
  puntos: number;
  avatar: string;
  esUsuario?: boolean;
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

  constructor(
    private route: ActivatedRoute,
    private ligasService: LigasService,
    private prediccionesService: PrediccionesService,
    private partidosService: PartidosService,
    private partidosSupabaseService: PartidosSupabaseService
  ) {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.liga = this.ligasService.obtenerLigaPorId(id);

    this.partidos = this.partidosService.obtenerPartidos();
    this.cargarRanking();

    this.cargarPartidosDesdeSupabase();
  }

  cargarRanking() {
    if (!this.liga) {
      return;
    }

    const participantesSinPosicion = [
      {
        nombre: 'Martina',
        puntos: 42,
        avatar: 'M'
      },
      {
        nombre: 'Carlos',
        puntos: 35,
        avatar: 'C'
      },
      {
        nombre: 'Luis',
        puntos: 28,
        avatar: 'L'
      },
      {
        nombre: 'Elena',
        puntos: 24,
        avatar: 'E'
      },
      {
        nombre: 'Javier',
        puntos: 18,
        avatar: 'J'
      },
      {
        nombre: 'Sofía',
        puntos: 12,
        avatar: 'S'
      },
      {
        nombre: 'Laura',
        puntos: 6,
        avatar: 'L'
      },
      {
        nombre: 'Tú',
        puntos: this.puntosUsuarioCalculados(),
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

  puntosUsuarioCalculados(): number {
    let total = 0;

    for (const partido of this.partidos) {
      if (partido.estado !== 'finalizado') {
        continue;
      }

      const prediccion = this.prediccionesService.obtenerPrediccionPorPartido(partido.id, 1);

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

  async cargarPartidosDesdeSupabase() {
    try {
      const partidosSupabase = await this.partidosSupabaseService.obtenerPartidos();

      this.partidos = adaptarPartidosSupabase(partidosSupabase);

      this.cargarRanking();

      console.log('Ranking cargó partidos desde Supabase:', this.partidos);
    } catch (error) {
      console.error('Error al cargar partidos en Ranking desde Supabase:', error);

      this.partidos = this.partidosService.obtenerPartidos();
      this.cargarRanking();
    }
  }
}