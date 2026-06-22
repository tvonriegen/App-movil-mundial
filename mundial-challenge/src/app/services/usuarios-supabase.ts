import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase';

export interface UsuarioSupabase {
  id: string;
  nombre_usuario: string;
  nombre_visible: string | null;
  email: string | null;
  rol: string | null;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsuariosSupabaseService {

  constructor(
    private supabaseService: SupabaseService
  ) {}

  async obtenerUsuarioPorId(usuarioId: string): Promise<UsuarioSupabase | null> {
    const { data, error } = await this.supabaseService.client
      .from('usuarios')
      .select('*')
      .eq('id', usuarioId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data;
  }

  async obtenerOCrearPerfil(
    usuarioId: string,
    nombreUsuario: string,
    email: string
  ): Promise<UsuarioSupabase> {
    const usuarioExistente = await this.obtenerUsuarioPorId(usuarioId);

    if (usuarioExistente) {
      return usuarioExistente;
    }

    const { data, error } = await this.supabaseService.client
      .from('usuarios')
      .insert({
        id: usuarioId,
        nombre_usuario: nombreUsuario,
        nombre_visible: nombreUsuario,
        email,
        rol: 'Analista táctico'
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
    nombreVisible: string,
    rol: string
  ): Promise<UsuarioSupabase> {
    const { data, error } = await this.supabaseService.client
      .from('usuarios')
      .update({
        nombre_visible: nombreVisible,
        rol,
        updated_at: new Date().toISOString()
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