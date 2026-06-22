import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardContent, IonButton, IonList, IonItem, IonLabel} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PartidosService } from '../services/partidos';
import { Partido } from '../models/partido.model';
import { PrediccionesService } from '../services/predicciones';
import { LigasService } from '../services/ligas';
import { Liga } from '../models/liga.model';
import { UsuarioService } from '../services/usuario';
import { Usuario } from '../models/usuario.model';
import { PartidosSupabaseService } from '../services/partidos-supabase';
import { adaptarPartidosSupabase } from '../adapters/partido.adapter';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
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
  ligas: Liga[] = [];

  usuario!: Usuario;

  constructor(
    private partidosService: PartidosService,
    private prediccionesService: PrediccionesService,
    private ligasService: LigasService,
    private usuarioService: UsuarioService,
    private partidosSupabaseService: PartidosSupabaseService
  ) {
    this.usuario = this.usuarioService.obtenerUsuario();
    this.partidos = this.partidosService.obtenerPartidos();
    this.ligas = this.ligasService.obtenerLigas();

    this.cargarPartidosDesdeSupabase();
  }

  get partidoDestacado(): Partido | undefined {
    return this.partidosService.obtenerProximoPartido();
  }

  tienePrediccion(partidoId: number): boolean {
    return this.prediccionesService.existePrediccion(partidoId, 1);
  }

  textoPrediccion(partidoId: number): string {
    const prediccion = this.prediccionesService.obtenerPrediccionPorPartido(partidoId, 1);

    if (!prediccion) {
      return '';
    }

    return `${prediccion.golesLocal} - ${prediccion.golesVisitante}`;
  }
  obtenerLigasDestacadas(): Liga[] {
    return this.ligas.slice(0, 2);
  }

  puntosCalculados(): number {
    return this.prediccionesService.obtenerPuntosTotales(
      this.partidosService.obtenerPartidos(),
      this.usuario.id
    );
  }
  
  proximosPartidos(): Partido[] {
    return this.partidos
      .filter(partido => partido.estado === 'pendiente')
      .slice(0, 3);
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
}