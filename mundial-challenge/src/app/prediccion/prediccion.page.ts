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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private partidosService: PartidosService,
    private prediccionesService: PrediccionesService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.partido = this.partidosService.obtenerPartidoPorId(id);

    const prediccionExistente = this.prediccionesService.obtenerPrediccionPorPartido(id, 1);

    if (prediccionExistente) {
      this.golesLocal = prediccionExistente.golesLocal;
      this.golesVisitante = prediccionExistente.golesVisitante;
    }
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

  async guardarPrediccion() {
    if (!this.partido || !this.partidoEditable()) {
      return;
    }

    this.prediccionesService.guardarPrediccion({
      id: Date.now(),
      partidoId: this.partido.id,
      usuarioId: 1,
      golesLocal: this.golesLocal,
      golesVisitante: this.golesVisitante,
      fechaCreacion: new Date().toISOString()
    });

    await this.mostrarPrediccionGuardada();

    this.router.navigate(['/tabs/tab2']);
  }
  
  partidoEditable(): boolean {
    return this.partido?.estado === 'pendiente';
  }
  
  tienePrediccionGuardada(): boolean {
    if (!this.partido) {
      return false;
    }

    return this.prediccionesService.existePrediccion(this.partido.id, 1);
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

    this.prediccionesService.eliminarPrediccion(this.partido.id, 1);

    await this.mostrarPrediccionEliminada();

    this.router.navigate(['/tabs/tab2']);
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
}