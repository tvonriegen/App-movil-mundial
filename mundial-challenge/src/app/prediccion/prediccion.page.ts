import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PrediccionesService } from '../services/predicciones';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonCard,
  IonCardContent,
  IonButtons,
  IonBackButton,
  AlertController,
  ToastController
} from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';
import { PartidosService } from '../services/partidos';
import { Partido } from '../models/partido.model';
import { PartidosSupabaseService } from '../services/partidos-supabase';
import { adaptarPartidoSupabase } from '../adapters/partido.adapter';
import { AuthSupabaseService } from '../services/auth-supabase';
import { PrediccionesSupabaseService } from '../services/predicciones-supabase';

@Component({
  selector: 'app-prediccion',
  templateUrl: './prediccion.page.html',
  styleUrls: ['./prediccion.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonCard,
    IonCardContent,
    IonButtons,
    IonBackButton
  ]
})
export class PrediccionPage {
  partido?: Partido;
  golesLocal = 0;
  golesVisitante = 0;

  usuarioSupabaseId: string | null = null;
  prediccionCargadaDesdeSupabase = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private partidosService: PartidosService,
    private prediccionesService: PrediccionesService,
    private alertController: AlertController,
    private toastController: ToastController,
    private partidosSupabaseService: PartidosSupabaseService,
    private authSupabaseService: AuthSupabaseService,
    private prediccionesSupabaseService: PrediccionesSupabaseService
  ) {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.partido = this.partidosService.obtenerPartidoPorId(id);

    const prediccionExistente = this.prediccionesService.obtenerPrediccionPorPartido(id, 1);

    if (prediccionExistente) {
      this.golesLocal = prediccionExistente.golesLocal;
      this.golesVisitante = prediccionExistente.golesVisitante;
    }

    this.cargarPartidoDesdeSupabase(id);
    this.cargarPrediccionDesdeSupabase(id);
  }

  sumarLocal() {
    if (!this.partidoEditable()) {
      return;
    }

    this.golesLocal++;
  }

  restarLocal() {
    if (!this.partidoEditable()) {
      return;
    }

    if (this.golesLocal > 0) {
      this.golesLocal--;
    }
  }

  sumarVisitante() {
    if (!this.partidoEditable()) {
      return;
    }

    this.golesVisitante++;
  }

  restarVisitante() {
    if (!this.partidoEditable()) {
      return;
    }

    if (this.golesVisitante > 0) {
      this.golesVisitante--;
    }
  }

  partidoEditable(): boolean {
    return this.partido?.estado === 'pendiente';
  }

  tienePrediccionGuardada(): boolean {
    if (!this.partido) {
      return false;
    }

    return this.prediccionCargadaDesdeSupabase ||
      this.prediccionesService.existePrediccion(this.partido.id, 1);
  }

  async guardarPrediccion() {
    if (!this.partido) {
      return;
    }

    try {
      const usuario = await this.authSupabaseService.obtenerUsuarioActual();

      if (!usuario) {
        await this.mostrarPrediccionError('No se pudo obtener el usuario actual.');
        return;
      }

      this.usuarioSupabaseId = usuario.id;

      await this.prediccionesSupabaseService.guardarPrediccion(
        usuario.id,
        this.partido.id,
        this.golesLocal,
        this.golesVisitante
      );

      this.prediccionCargadaDesdeSupabase = true;

      this.guardarPrediccionLocal();

      await this.mostrarPrediccionGuardada();

      this.volverAPartidosConRefresh();
    } catch (error) {
      console.error('Error al guardar predicción en Supabase:', error);

      this.guardarPrediccionLocal();

      await this.mostrarPrediccionGuardada();

      this.volverAPartidosConRefresh();
    }
  }

  guardarPrediccionLocal() {
    if (!this.partido) {
      return;
    }

    this.prediccionesService.eliminarPrediccion(this.partido.id, 1);

    this.prediccionesService.guardarPrediccion({
      id: Date.now(),
      partidoId: this.partido.id,
      usuarioId: 1,
      golesLocal: this.golesLocal,
      golesVisitante: this.golesVisitante,
      fechaCreacion: new Date().toISOString()
    });
  }

  async confirmarEliminarPrediccion() {
    if (!this.partido || !this.partidoEditable()) {
      return;
    }

    const alert = await this.alertController.create({
      header: 'Eliminar predicción',
      message: '¿Seguro que quieres eliminar tu predicción para este partido?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.eliminarPrediccion();
          }
        }
      ]
    });

    await alert.present();
  }

  async eliminarPrediccion() {
    if (!this.partido) {
      return;
    }

    try {
      const usuario = await this.authSupabaseService.obtenerUsuarioActual();

      if (usuario) {
        await this.prediccionesSupabaseService.eliminarPrediccion(
          usuario.id,
          this.partido.id
        );
      }

      this.prediccionCargadaDesdeSupabase = false;

      this.prediccionesService.eliminarPrediccion(this.partido.id, 1);

      await this.mostrarPrediccionEliminada();

      this.volverAPartidosConRefresh();
    } catch (error) {
      console.error('Error al eliminar predicción en Supabase:', error);

      this.prediccionCargadaDesdeSupabase = false;

      this.prediccionesService.eliminarPrediccion(this.partido.id, 1);

      await this.mostrarPrediccionEliminada();

      this.volverAPartidosConRefresh();
    }
  }

  volverAPartidosConRefresh() {
    this.router.navigateByUrl('/tabs/tab2?refresh=' + Date.now());
  }

  async cargarPartidoDesdeSupabase(id: number) {
    try {
      const partidoSupabase = await this.partidosSupabaseService.obtenerPartidoPorId(id);

      if (!partidoSupabase) {
        return;
      }

      this.partido = adaptarPartidoSupabase(partidoSupabase);

    } catch (error) {
      console.error('Error al cargar partido desde Supabase:', error);

      this.partido = this.partidosService.obtenerPartidoPorId(id);
    }
  }

  async cargarPrediccionDesdeSupabase(partidoId: number) {
    try {
      const usuario = await this.authSupabaseService.obtenerUsuarioActual();

      if (!usuario) {
        return;
      }

      this.usuarioSupabaseId = usuario.id;

      const prediccion = await this.prediccionesSupabaseService.obtenerPrediccionPorPartido(
        usuario.id,
        partidoId
      );

      if (!prediccion) {
        this.prediccionCargadaDesdeSupabase = false;
        return;
      }

      this.golesLocal = prediccion.goles_local;
      this.golesVisitante = prediccion.goles_visitante;
      this.prediccionCargadaDesdeSupabase = true;

    } catch (error) {
      console.error('Error al cargar predicción desde Supabase:', error);
    }
  }

  async mostrarPrediccionGuardada() {
    if (!this.partido) {
      return;
    }

    const toast = await this.toastController.create({
      message: `Predicción guardada: ${this.partido.local} ${this.golesLocal} - ${this.golesVisitante} ${this.partido.visitante}`,
      duration: 2200,
      position: 'bottom',
      color: 'success'
    });

    await toast.present();
  }

  async mostrarPrediccionEliminada() {
    if (!this.partido) {
      return;
    }

    const toast = await this.toastController.create({
      message: `Predicción eliminada: ${this.partido.local} vs ${this.partido.visitante}`,
      duration: 2200,
      position: 'bottom',
      color: 'medium'
    });

    await toast.present();
  }

  async mostrarPrediccionError(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2200,
      position: 'bottom',
      color: 'danger'
    });

    await toast.present();
  }
}