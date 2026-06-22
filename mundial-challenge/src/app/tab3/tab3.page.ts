import { Component } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardContent,
  IonButton,
  IonBadge,
  AlertController
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LigasService } from '../services/ligas';
import { Liga } from '../models/liga.model';
import { PrediccionesService } from '../services/predicciones';
import { PartidosService } from '../services/partidos';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
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
    IonBadge
  ],
})
export class Tab3Page {
  ligas: Liga[] = [];

  constructor(
    private ligasService: LigasService,
    private alertController: AlertController,
    private prediccionesService: PrediccionesService,
    private partidosService: PartidosService
  ) {
    this.cargarLigas();
  }

  cargarLigas() {
    this.ligas = this.ligasService.obtenerLigas();
  }

  async abrirCrearLiga() {
    const alert = await this.alertController.create({
      header: 'Crear liga',
      message: 'Ingresa un nombre para tu nueva liga privada.',
      inputs: [
        {
          name: 'nombre',
          type: 'text',
          placeholder: 'Ej: Amigos del Mundial'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Crear',
          handler: (data) => {
            const nombre = data.nombre?.trim();

            if (!nombre) {
              return false;
            }

            const nuevaLiga = this.ligasService.crearLiga(nombre);
            this.cargarLigas();
            this.mostrarLigaCreada(nuevaLiga.nombre, nuevaLiga.codigo);
            return true;
          }
        }
      ]
    });

    await alert.present();
  }

  async abrirUnirseConCodigo() {
    const alert = await this.alertController.create({
      header: 'Unirme con código',
      message: 'Ingresa el código de la liga privada.',
      inputs: [
        {
          name: 'codigo',
          type: 'text',
          placeholder: 'Ej: FAMILIA26'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Unirme',
          handler: (data) => {
            const codigo = data.codigo?.trim();

            if (!codigo) {
              return false;
            }

            const resultado = this.ligasService.unirseConCodigo(codigo);

            if (resultado.estado === 'no_encontrada') {
              this.mostrarErrorCodigo();
              return false;
            }

            if (resultado.estado === 'ya_existe' && resultado.liga) {
              this.mostrarYaPertenece(resultado.liga.nombre);
              return true;
            }

            if (resultado.estado === 'unido' && resultado.liga) {
              this.cargarLigas();
              this.mostrarUnionExitosa(resultado.liga.nombre);
              return true;
            }

            return false;
          }
        }
      ]
    });

    await alert.present();
  }

  async mostrarLigaCreada(nombre: string, codigo?: string) {
    const alert = await this.alertController.create({
      header: 'Liga creada correctamente',
      message: `Creaste la liga "${nombre}".\n\nCódigo: ${codigo}`,
      buttons: ['Entendido'],
      cssClass: 'resultado-alerta'
    });

    await alert.present();
  }

  async mostrarUnionExitosa(nombre: string) {
    const alert = await this.alertController.create({
      header: 'Te uniste a una liga',
      message: `Ahora formas parte de "${nombre}".`,
      buttons: ['Entendido'],
      cssClass: 'resultado-alerta'
    });

    await alert.present();
  }

  async mostrarErrorCodigo() {
    const alert = await this.alertController.create({
      header: 'Código no encontrado',
      message: 'No encontramos una liga con ese código. Prueba con FAMILIA26 o UDD2026.',
      buttons: ['Entendido']
    });

    await alert.present();
  }

  async copiarCodigo(codigo: string) {
    await navigator.clipboard.writeText(codigo);

    const alert = await this.alertController.create({
      header: 'Código copiado',
      message: `Copiaste el código: ${codigo}`,
      buttons: ['Entendido']
    });

    await alert.present();
  }

  async mostrarYaPertenece(nombre: string) {
    const alert = await this.alertController.create({
      header: 'Ya perteneces a esta liga',
      message: `Ya estás dentro de "${nombre}".`,
      buttons: ['Entendido']
    });

    await alert.present();
  }

  puntosCalculados(): number {
    return this.prediccionesService.obtenerPuntosTotales(
      this.partidosService.obtenerPartidos(),
      1
    );
  }  
}