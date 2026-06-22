import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase';

export interface UsuarioSupabase {
  id: string;
  nombre_usuario: string;
  email: string | null;
  nombre_visible: string | null;
  avatar_url: string | null;
  created_at?: string;
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

  async crearPerfil(
    usuarioId: string,
    nombreUsuario: string,
    email: string | null
  ): Promise<UsuarioSupabase | null> {
    const { data, error } = await this.supabaseService.client
      .from('usuarios')
      .insert({
        id: usuarioId,
        nombre_usuario: nombreUsuario.trim().toLowerCase(),
        email,
        nombre_visible: nombreUsuario.trim(),
        avatar_url: null
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
    nombreUsuario: string,
    nombreVisible: string
  ): Promise<UsuarioSupabase | null> {
    const { data, error } = await this.supabaseService.client
      .from('usuarios')
      .update({
        nombre_usuario: nombreUsuario.trim().toLowerCase(),
        nombre_visible: nombreVisible.trim()
      })
      .eq('id', usuarioId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async obtenerOCrearPerfil(
    usuarioId: string,
    nombreUsuario: string,
    email: string | null
  ): Promise<UsuarioSupabase | null> {
    const perfilExistente = await this.obtenerUsuarioPorId(usuarioId);

    if (perfilExistente) {
      return perfilExistente;
    }

    return this.crearPerfil(usuarioId, nombreUsuario, email);
  }
}