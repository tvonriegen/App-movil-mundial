import { Liga } from '../models/liga.model';
import { LigaSupabase } from '../services/ligas-supabase';

export function adaptarLigaSupabase(liga: LigaSupabase): Liga {
  return {
    id: liga.id,
    nombre: liga.nombre,
    tipo: liga.tipo,
    codigo: liga.codigo ?? undefined,
    miembros: liga.miembros_count ?? 0,
    posicionUsuario: 1,
    puntosUsuario: 0
  };
}

export function adaptarLigasSupabase(ligas: LigaSupabase[]): Liga[] {
  return ligas.map(liga => adaptarLigaSupabase(liga));
}