import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase';

export interface LigaSupabase {
  id: number;
  nombre: string;
  tipo: 'Privada' | 'Publica';
  codigo: string | null;
  creador_id: string;
  created_at?: string;
}

export interface LigaMiembroSupabase {
  id: number;
  liga_id: number;
  usuario_id: string;
  rol: 'admin' | 'miembro';
  created_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LigasSupabaseService {

  constructor(
    private supabaseService: SupabaseService
  ) {}

  async obtenerLigaPorId(ligaId: number): Promise<LigaSupabase | null> {
    const { data, error } = await this.supabaseService.client
      .from('ligas')
      .select('*')
      .eq('id', ligaId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data;
  }

  async obtenerMisLigas(usuarioId: string): Promise<LigaSupabase[]> {
    const { data, error } = await this.supabaseService.client
      .from('liga_miembros')
      .select(`
        liga_id,
        ligas (
          id,
          nombre,
          tipo,
          codigo,
          creador_id,
          created_at
        )
      `)
      .eq('usuario_id', usuarioId);

    if (error) {
      throw error;
    }

    return (data ?? [])
      .map((item: any) => item.ligas)
      .filter((liga: LigaSupabase | null) => liga !== null);
  }

  async crearLiga(
    usuarioId: string,
    nombre: string,
    tipo: 'Privada' | 'Publica' = 'Privada'
  ): Promise<LigaSupabase | null> {
    const codigo = tipo === 'Privada'
      ? this.generarCodigo(nombre)
      : null;

    const { data: liga, error: ligaError } = await this.supabaseService.client
      .from('ligas')
      .insert({
        nombre,
        tipo,
        codigo,
        creador_id: usuarioId
      })
      .select()
      .single();

    if (ligaError) {
      throw ligaError;
    }

    const { error: miembroError } = await this.supabaseService.client
      .from('liga_miembros')
      .insert({
        liga_id: liga.id,
        usuario_id: usuarioId,
        rol: 'admin'
      });

    if (miembroError) {
      throw miembroError;
    }

    return liga;
  }

  async unirseConCodigo(
    usuarioId: string,
    codigo: string
  ): Promise<{ liga?: LigaSupabase; estado: 'unido' | 'ya_existe' | 'no_encontrada' }> {
    const codigoLimpio = codigo.trim().toUpperCase();

    const { data: liga, error: ligaError } = await this.supabaseService.client
      .from('ligas')
      .select('*')
      .eq('codigo', codigoLimpio)
      .maybeSingle();

    if (ligaError) {
      throw ligaError;
    }

    if (!liga) {
      return {
        estado: 'no_encontrada'
      };
    }

    const { data: miembroExistente, error: miembroExisteError } = await this.supabaseService.client
      .from('liga_miembros')
      .select('*')
      .eq('liga_id', liga.id)
      .eq('usuario_id', usuarioId)
      .maybeSingle();

    if (miembroExisteError) {
      throw miembroExisteError;
    }

    if (miembroExistente) {
      return {
        liga,
        estado: 'ya_existe'
      };
    }

    const { error: insertarError } = await this.supabaseService.client
      .from('liga_miembros')
      .insert({
        liga_id: liga.id,
        usuario_id: usuarioId,
        rol: 'miembro'
      });

    if (insertarError) {
      throw insertarError;
    }

    return {
      liga,
      estado: 'unido'
    };
  }

  async obtenerCantidadMiembros(ligaId: number): Promise<number> {
    const { count, error } = await this.supabaseService.client
      .from('liga_miembros')
      .select('*', { count: 'exact', head: true })
      .eq('liga_id', ligaId);

    if (error) {
      throw error;
    }

    return count ?? 0;
  }

  private generarCodigo(nombre: string): string {
    const base = nombre
      .replace(/[^a-zA-Z0-9]/g, '')
      .substring(0, 6)
      .toUpperCase() || 'LIGA';

    const numero = Math.floor(Math.random() * 9000) + 1000;

    return `${base}${numero}`;
  }
}