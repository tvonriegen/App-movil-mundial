import { Prediccion } from '../models/prediccion.model';
import { PrediccionSupabase } from '../services/predicciones-supabase';

export function adaptarPrediccionSupabase(prediccion: PrediccionSupabase): Prediccion {
  return {
    id: prediccion.id,
    partidoId: prediccion.partido_id,
    usuarioId: 1,
    golesLocal: prediccion.goles_local,
    golesVisitante: prediccion.goles_visitante,
    puntosObtenidos: prediccion.puntos_obtenidos ?? undefined,
    fechaCreacion: prediccion.created_at ?? new Date().toISOString()
  };
}

export function adaptarPrediccionesSupabase(predicciones: PrediccionSupabase[]): Prediccion[] {
  return predicciones.map(prediccion => adaptarPrediccionSupabase(prediccion));
}