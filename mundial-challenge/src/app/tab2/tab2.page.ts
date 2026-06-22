import { Component } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardContent,
  IonButton,
  IonChip,
  IonBadge,
  AlertController
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';

import { PartidosService } from '../services/partidos';
import { Partido } from '../models/partido.model';

import { PrediccionesService } from '../services/predicciones';
import { Prediccion } from '../models/prediccion.model';

import { PartidosSupabaseService } from '../services/partidos-supabase';
import { adaptarPartidosSupabase } from '../adapters/partido.adapter';

import { AuthSupabaseService } from '../services/auth-supabase';
import { PrediccionesSupabaseService } from '../services/predicciones-supabase';
import { adaptarPrediccionesSupabase } from '../adapters/prediccion.adapter';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
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
    IonChip,
    IonBadge,
  ],
  providers: [AlertController]
})
export class Tab2Page {
  partidos: Partido[] = [];
  predicciones: Prediccion[] = [];

  filtroActual: 'hoy' | 'proximos' | 'grupos' = 'hoy';

  constructor(
    private partidosService: PartidosService,
    private prediccionesService: PrediccionesService,
    private alertController: AlertController,
    private partidosSupabaseService: PartidosSupabaseService,
    private authSupabaseService: AuthSupabaseService,
    private prediccionesSupabaseService: PrediccionesSupabaseService,
    private route: ActivatedRoute
  ) {
    this.actualizarDatosPantalla();

    this.route.queryParams.subscribe(() => {
      this.actualizarDatosPantalla();
    });
  }

  ionViewWillEnter() {
    this.actualizarDatosPantalla();
  }

  actualizarDatosPantalla() {
    this.partidos = this.partidosService.obtenerPartidos();

    this.predicciones = this.prediccionesService.obtenerPredicciones()
      .filter(prediccion => prediccion.usuarioId === 1);

    this.cargarPartidosDesdeSupabase();
    this.cargarPrediccionesDesdeSupabase();
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

  async verResultado(partido: Partido) {
    const prediccion = this.obtenerPrediccionMasReciente(partido.id);

    const resultadoReal = `${partido.golesLocal} - ${partido.golesVisitante}`;

    let lineas: string[] = [
      'Resultado real:',
      `${partido.local} ${resultadoReal} ${partido.visitante}`,
      ''
    ];

    if (prediccion) {
      const puntos = this.prediccionesService.calcularPuntosPrediccion(
        prediccion.golesLocal,
        prediccion.golesVisitante,
        partido.golesLocal ?? 0,
        partido.golesVisitante ?? 0
      );

      lineas = [
        ...lineas,
        'Tu predicción:',
        `${prediccion.golesLocal} - ${prediccion.golesVisitante}`,
        '',
        `Puntos obtenidos: ${puntos}`
      ];
    } else {
      lineas = [
        ...lineas,
        'No hiciste predicción para este partido.'
      ];
    }

    const alert = await this.alertController.create({
      header: 'Resultado del partido',
      cssClass: 'resultado-alerta',
      message: lineas.join('\n'),
      buttons: ['Cerrar']
    });

    await alert.present();
  }

  cambiarFiltro(filtro: 'hoy' | 'proximos' | 'grupos') {
    this.filtroActual = filtro;
  }

  partidosFiltrados(): Partido[] {
    if (this.filtroActual === 'hoy') {
      return this.partidos.filter(partido => partido.fecha === 'Hoy');
    }

    if (this.filtroActual === 'proximos') {
      return this.partidos.filter(partido => partido.estado === 'pendiente');
    }

    return this.partidos;
  }

  async cargarPartidosDesdeSupabase() {
    try {
      const partidosSupabase = await this.partidosSupabaseService.obtenerPartidos();

      this.partidos = adaptarPartidosSupabase(partidosSupabase);

      console.log('Partidos cargados desde Supabase:', this.partidos);
    } catch (error) {
      console.error('Error al cargar partidos desde Supabase:', error);

      this.partidos = this.partidosService.obtenerPartidos();
    }
  }

  async cargarPrediccionesDesdeSupabase() {
    try {
      const usuario = await this.authSupabaseService.obtenerUsuarioActual();

      if (!usuario) {
        return;
      }

      const prediccionesSupabase = await this.prediccionesSupabaseService.obtenerMisPredicciones(
        usuario.id
      );

      this.predicciones = adaptarPrediccionesSupabase(prediccionesSupabase);

      console.log('Partidos cargó predicciones desde Supabase:', this.predicciones);
    } catch (error) {
      console.error('Error al cargar predicciones en Partidos desde Supabase:', error);

      this.predicciones = this.prediccionesService.obtenerPredicciones()
        .filter(prediccion => prediccion.usuarioId === 1);
    }
  }
}