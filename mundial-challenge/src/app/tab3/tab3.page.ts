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

import { AuthSupabaseService } from '../services/auth-supabase';
import { LigasSupabaseService } from '../services/ligas-supabase';
import { adaptarLigaSupabase, adaptarLigasSupabase } from '../adapters/liga.adapter';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
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
    IonBadge
  ],
})
export class Tab3Page {
  ligas: Liga[] = [];

  constructor(
    private ligasService: LigasService,
    private alertController: AlertController,
    private prediccionesService: PrediccionesService,
    private partidosService: PartidosService,
    private authSupabaseService: AuthSupabaseService,
    private ligasSupabaseService: LigasSupabaseService
  ) {
    this.cargarLigas();
  }

  ionViewWillEnter() {
    this.cargarLigas();
  }

  cargarLigas() {
    this.ligas = this.ligasService.obtenerLigas();

    this.cargarLigasDesdeSupabase();
  }

  async cargarLigasDesdeSupabase() {
    try {
      const usuario = await this.authSupabaseService.obtenerUsuarioActual();

      if (!usuario) {
        return;
      }

      const ligasSupabase = await this.ligasSupabaseService.obtenerMisLigas(usuario.id);

      this.ligas = adaptarLigasSupabase(ligasSupabase);

      console.log('Ligas cargadas desde Supabase:', this.ligas);
    } catch (error) {
      console.error('Error al cargar ligas desde Supabase:', error);

      this.ligas = this.ligasService.obtenerLigas();
    }
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
          handler: async (data) => {
            const nombre = data.nombre?.trim();

            if (!nombre) {
              return false;
            }

            try {
              const usuario = await this.authSupabaseService.obtenerUsuarioActual();

              if (!usuario) {
                return false;
              }

              const ligaSupabase = await this.ligasSupabaseService.crearLiga(
                usuario.id,
                nombre
              );

              const nuevaLiga = adaptarLigaSupabase(ligaSupabase);

              this.ligas = [
                nuevaLiga,
                ...this.ligas.filter(liga => liga.id !== nuevaLiga.id)
              ];

              await this.mostrarLigaCreada(nuevaLiga.nombre, nuevaLiga.codigo);

              return true;
            } catch (error) {
              console.error('Error al crear liga en Supabase:', error);

              const nuevaLiga = this.ligasService.crearLiga(nombre);

              this.cargarLigas();

              await this.mostrarLigaCreada(nuevaLiga.nombre, nuevaLiga.codigo);

              return true;
            }
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
          handler: async (data) => {
            const codigo = data.codigo?.trim();

            if (!codigo) {
              return false;
            }

            try {
              const usuario = await this.authSupabaseService.obtenerUsuarioActual();

              if (!usuario) {
                return false;
              }

              const resultado = await this.ligasSupabaseService.unirseConCodigo(
                usuario.id,
                codigo
              );

              if (resultado.estado === 'no_encontrada') {
                await this.mostrarErrorCodigo();
                return false;
              }

              if (resultado.estado === 'ya_existe' && resultado.liga) {
                await this.mostrarYaPertenece(resultado.liga.nombre);
                return true;
              }

              if (resultado.estado === 'unido' && resultado.liga) {
                const ligaAdaptada = adaptarLigaSupabase(resultado.liga);

                this.ligas = [
                  ligaAdaptada,
                  ...this.ligas.filter(liga => liga.id !== ligaAdaptada.id)
                ];

                await this.mostrarUnionExitosa(resultado.liga.nombre);

                return true;
              }

              return false;
            } catch (error) {
              console.error('Error al unirse a liga en Supabase:', error);

              const resultado = this.ligasService.unirseConCodigo(codigo);

              if (resultado.estado === 'no_encontrada') {
                await this.mostrarErrorCodigo();
                return false;
              }

              if (resultado.estado === 'ya_existe' && resultado.liga) {
                await this.mostrarYaPertenece(resultado.liga.nombre);
                return true;
              }

              if (resultado.estado === 'unido' && resultado.liga) {
                this.cargarLigas();
                await this.mostrarUnionExitosa(resultado.liga.nombre);
                return true;
              }

              return false;
            }
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
      message: 'No encontramos una liga con ese código. Revisa que esté bien escrito.',
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