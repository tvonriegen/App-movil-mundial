import { Injectable } from '@angular/core';
import { Prediccion } from '../models/prediccion.model';
import { Partido } from '../models/partido.model';

@Injectable({
  providedIn: 'root'
})
export class PrediccionesService {

  private predicciones: Prediccion[] = [];
  private storageKey = 'mundial_predicciones';
  private guardarEnStorage(): void {
    localStorage.setItem(this.storageKey, JSON.stringify(this.predicciones));
  }

  private cargarDesdeStorage(): void {
    const data = localStorage.getItem(this.storageKey);

    if (!data) {
      return;
    }

    try {
      this.predicciones = JSON.parse(data);
    } catch (error) {
      console.error('Error al cargar predicciones desde localStorage:', error);
      this.predicciones = [];
    }
  }

  constructor() {
    this.cargarDesdeStorage();
  }

  guardarPrediccion(prediccion: Prediccion): void {
    const index = this.predicciones.findIndex(
      p => p.partidoId === prediccion.partidoId && p.usuarioId === prediccion.usuarioId
    );

    if (index >= 0) {
      this.predicciones[index] = prediccion;
    } else {
      this.predicciones.push(prediccion);
    }
    this.guardarEnStorage();
  }

  obtenerPredicciones(): Prediccion[] {
    return this.predicciones;
  }

  obtenerPrediccionPorPartido(partidoId: number, usuarioId: number): Prediccion | undefined {
    return this.predicciones.find(
      p => p.partidoId === partidoId && p.usuarioId === usuarioId
    );
  }

  existePrediccion(partidoId: number, usuarioId: number): boolean {
    return this.predicciones.some(
      p => p.partidoId === partidoId && p.usuarioId === usuarioId
    );
  }

  calcularPuntosPrediccion(
    predLocal: number,
    predVisitante: number,
    realLocal: number,
    realVisitante: number
  ): number {
    const exacto = predLocal === realLocal && predVisitante === realVisitante;

    if (exacto) {
      return 10;
    }

    const diferenciaPrediccion = predLocal - predVisitante;
    const diferenciaReal = realLocal - realVisitante;

    const signoPrediccion = Math.sign(diferenciaPrediccion);
    const signoReal = Math.sign(diferenciaReal);

    const aciertaGanadorOEmpate = signoPrediccion === signoReal;

    let puntos = 0;

    if (aciertaGanadorOEmpate) {
      puntos += 5;

      const esEmpate = signoReal === 0;

      if (!esEmpate && diferenciaPrediccion === diferenciaReal) {
        puntos += 3;
      }
    }

    if (predLocal === realLocal) {
      puntos += 1;
    }

    if (predVisitante === realVisitante) {
      puntos += 1;
    }

    return puntos;
  }

  obtenerPuntosTotales(partidos: Partido[], usuarioId: number): number {
    let total = 0;

    for (const prediccion of this.predicciones) {
      if (prediccion.usuarioId !== usuarioId) {
        continue;
      }

      const partido = partidos.find(p => p.id === prediccion.partidoId);

      if (!partido || partido.estado !== 'finalizado') {
        continue;
      }

      total += this.calcularPuntosPrediccion(
        prediccion.golesLocal,
        prediccion.golesVisitante,
        partido.golesLocal ?? 0,
        partido.golesVisitante ?? 0
      );
    }

    return total;
  }

  obtenerAciertosExactos(partidos: Partido[], usuarioId: number): number {
    let aciertos = 0;

    for (const prediccion of this.predicciones) {
      if (prediccion.usuarioId !== usuarioId) {
        continue;
      }

      const partido = partidos.find(p => p.id === prediccion.partidoId);

      if (!partido || partido.estado !== 'finalizado') {
        continue;
      }

      const esExacto =
        prediccion.golesLocal === partido.golesLocal &&
        prediccion.golesVisitante === partido.golesVisitante;

      if (esExacto) {
        aciertos++;
      }
    }

    return aciertos;
  }

  obtenerPrediccionesFinalizadas(partidos: Partido[], usuarioId: number): Prediccion[] {
    return this.predicciones.filter(prediccion => {
      const partido = partidos.find(p => p.id === prediccion.partidoId);

      return prediccion.usuarioId === usuarioId &&
             partido?.estado === 'finalizado';
    });
  }

  eliminarPrediccion(partidoId: number, usuarioId: number): void {
    this.predicciones = this.predicciones.filter(
      prediccion => !(prediccion.partidoId === partidoId && prediccion.usuarioId === usuarioId)
    );

    this.guardarEnStorage();
  }

  limpiarPredicciones(): void {
    this.predicciones = [];
    localStorage.removeItem(this.storageKey);
  }
}