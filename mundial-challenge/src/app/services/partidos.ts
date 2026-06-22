import { Injectable } from '@angular/core';
import { Partido } from '../models/partido.model';

@Injectable({
  providedIn: 'root'
})
export class PartidosService {

  private partidos: Partido[] = [
    {
      id: 1,
      grupo: 'Grupo A',
      fecha: 'Hoy',
      hora: '15:00',
      local: 'Argentina',
      visitante: 'Canadá',
      banderaLocal: '🇦🇷',
      banderaVisitante: '🇨🇦',
      estado: 'pendiente'
    },
    {
      id: 2,
      grupo: 'Grupo B',
      fecha: 'Hoy',
      hora: '18:00',
      local: 'España',
      visitante: 'Croacia',
      banderaLocal: '🇪🇸',
      banderaVisitante: '🇭🇷',
      estado: 'finalizado',
      golesLocal: 2,
      golesVisitante: 1
    },
    {
      id: 3,
      grupo: 'Grupo C',
      fecha: 'Mañana',
      hora: '20:00',
      local: 'Brasil',
      visitante: 'México',
      banderaLocal: '🇧🇷',
      banderaVisitante: '🇲🇽',
      estado: 'pendiente'
    },
    {
      id: 4,
      grupo: 'Grupo D',
      fecha: 'Jueves',
      hora: '16:00',
      local: 'Francia',
      visitante: 'Alemania',
      banderaLocal: '🇫🇷',
      banderaVisitante: '🇩🇪',
      estado: 'pendiente'
    }
  ];

  constructor() {}

  obtenerPartidos(): Partido[] {
    return this.partidos;
  }

  obtenerPartidoPorId(id: number): Partido | undefined {
    return this.partidos.find(partido => partido.id === id);
  }

  obtenerProximoPartido(): Partido | undefined {
    return this.partidos.find(partido => partido.estado === 'pendiente');
  }
}