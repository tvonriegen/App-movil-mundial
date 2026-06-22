import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase';

export interface PerfilSupabase {
  id: string;
  username: string;
  rol: string | null;
  created_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PerfilSupabaseService {
  constructor(private supabaseService: SupabaseService) {}

  async obtenerPerfil(usuarioId: string): Promise<PerfilSupabase | null> {
    const { data, error } = await this.supabaseService.client
      .from('profiles')
      .select('*')
      .eq('id', usuarioId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data;
  }

  async crearPerfil(
    usuarioId: string,
    username: string,
    rol: string = 'Analista táctico'
  ): Promise<PerfilSupabase> {
    const { data, error } = await this.supabaseService.client
      .from('profiles')
      .insert({
        id: usuarioId,
        username,
        rol
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async actualizarPerfil(
    usuarioId: string,
    username: string,
    rol: string
  ): Promise<PerfilSupabase> {
    const { data, error } = await this.supabaseService.client
      .from('profiles')
      .update({
        username,
        rol
      })
      .eq('id', usuarioId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }
}