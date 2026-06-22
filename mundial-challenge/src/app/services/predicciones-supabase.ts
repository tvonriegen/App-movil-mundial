import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase';

export interface PrediccionSupabase {
  id: number;
  usuario_id: string;
  partido_id: number;

  goles_local: number;
  goles_visitante: number;

  puntos_obtenidos: number | null;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PrediccionesSupabaseService {

  constructor(
    private supabaseService: SupabaseService
  ) {}

  async obtenerMisPredicciones(usuarioId: string): Promise<PrediccionSupabase[]> {
    const { data, error } = await this.supabaseService.client
      .from('predicciones')
      .select('*')
      .eq('usuario_id', usuarioId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data ?? [];
  }

  async obtenerPrediccionPorPartido(
    usuarioId: string,
    partidoId: number
  ): Promise<PrediccionSupabase | null> {
    const { data, error } = await this.supabaseService.client
      .from('predicciones')
      .select('*')
      .eq('usuario_id', usuarioId)
      .eq('partido_id', partidoId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data;
  }

  async guardarPrediccion(
    usuarioId: string,
    partidoId: number,
    golesLocal: number,
    golesVisitante: number
  ): Promise<PrediccionSupabase> {
    const { data, error } = await this.supabaseService.client
      .from('predicciones')
      .upsert(
        {
          usuario_id: usuarioId,
          partido_id: partidoId,
          goles_local: golesLocal,
          goles_visitante: golesVisitante,
          updated_at: new Date().toISOString()
        },
        {
          onConflict: 'usuario_id,partido_id'
        }
      )
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async eliminarPrediccion(
    usuarioId: string,
    partidoId: number
  ): Promise<void> {
    const { error } = await this.supabaseService.client
      .from('predicciones')
      .delete()
      .eq('usuario_id', usuarioId)
      .eq('partido_id', partidoId);

    if (error) {
      throw error;
    }
  }
}