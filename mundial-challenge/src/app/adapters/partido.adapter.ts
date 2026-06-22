import { Partido } from '../models/partido.model';
import { PartidoSupabase } from '../services/partidos-supabase';

export function adaptarPartidoSupabase(partido: PartidoSupabase): Partido {
  return {
    id: partido.id,
    grupo: partido.grupo,
    fecha: formatearFecha(partido.fecha),
    hora: formatearHora(partido.hora),

    local: partido.local,
    visitante: partido.visitante,

    banderaLocal: partido.bandera_local ?? '',
    banderaVisitante: partido.bandera_visitante ?? '',

    estado: partido.estado,

    golesLocal: partido.goles_local ?? undefined,
    golesVisitante: partido.goles_visitante ?? undefined
  };
}

export function adaptarPartidosSupabase(partidos: PartidoSupabase[]): Partido[] {
  return partidos.map(partido => adaptarPartidoSupabase(partido));
}

function formatearFecha(fecha: string): string {
  const hoy = new Date().toISOString().split('T')[0];

  if (fecha === hoy) {
    return 'Hoy';
  }

  return fecha;
}

function formatearHora(hora: string): string {
  return hora.substring(0, 5);
}