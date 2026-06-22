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
import { RouterModule } from '@angular/router';
import { PartidosService } from '../services/partidos';
import { Partido } from '../models/partido.model';
import { PrediccionesService } from '../services/predicciones';
import { PartidosSupabaseService } from '../services/partidos-supabase';
import { adaptarPartidosSupabase } from '../adapters/partido.adapter';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
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
  filtroActual: 'hoy' | 'proximos' | 'grupos' = 'hoy';

  constructor(
    private partidosService: PartidosService,
    private prediccionesService: PrediccionesService,
    private alertController: AlertController,
    private partidosSupabaseService: PartidosSupabaseService
  ) {
    this.partidos = this.partidosService.obtenerPartidos();

    this.cargarPartidosDesdeSupabase();
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

  async verResultado(partido: Partido) {
    const prediccion = this.prediccionesService.obtenerPrediccionPorPartido(partido.id, 1);

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
}