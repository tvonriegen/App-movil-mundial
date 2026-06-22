import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase';

export interface PartidoSupabase {
  id: number;
  grupo: string;
  fecha: string;
  hora: string;

  local: string;
  visitante: string;

  bandera_local: string | null;
  bandera_visitante: string | null;

  estado: 'pendiente' | 'en_vivo' | 'finalizado';

  goles_local: number | null;
  goles_visitante: number | null;

  created_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PartidosSupabaseService {

  constructor(
    private supabaseService: SupabaseService
  ) {}

  async obtenerPartidos(): Promise<PartidoSupabase[]> {
    const { data, error } = await this.supabaseService.client
      .from('partidos')
      .select('*')
      .order('fecha', { ascending: true })
      .order('hora', { ascending: true });

    if (error) {
      throw error;
    }

    return data ?? [];
  }

  async obtenerPartidoPorId(id: number): Promise<PartidoSupabase | null> {
    const { data, error } = await this.supabaseService.client
      .from('partidos')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async obtenerPartidosPendientes(): Promise<PartidoSupabase[]> {
    const { data, error } = await this.supabaseService.client
      .from('partidos')
      .select('*')
      .eq('estado', 'pendiente')
      .order('fecha', { ascending: true })
      .order('hora', { ascending: true });

    if (error) {
      throw error;
    }

    return data ?? [];
  }

  async obtenerPartidosFinalizados(): Promise<PartidoSupabase[]> {
    const { data, error } = await this.supabaseService.client
      .from('partidos')
      .select('*')
      .eq('estado', 'finalizado')
      .order('fecha', { ascending: true })
      .order('hora', { ascending: true });

    if (error) {
      throw error;
    }

    return data ?? [];
  }
}