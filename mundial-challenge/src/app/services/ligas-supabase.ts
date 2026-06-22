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

export interface MiembroLigaSupabase {
  usuario_id: string;
  nombre_usuario: string;
  nombre_visible: string | null;
}

export interface PrediccionRankingSupabase {
  id: number;
  usuario_id: string;
  partido_id: number;
  goles_local: number;
  goles_visitante: number;
  puntos_obtenidos: number | null;
  created_at?: string;
}

export interface ResultadoUnionSupabase {
  estado: 'unido' | 'ya_existe' | 'no_encontrada';
  liga?: LigaSupabase;
}

@Injectable({
  providedIn: 'root'
})
export class LigasSupabaseService {

  constructor(
    private supabaseService: SupabaseService
  ) {}

  async obtenerMisLigas(usuarioId: string): Promise<LigaSupabase[]> {
    const { data: membresias, error: errorMembresias } = await this.supabaseService.client
      .from('liga_miembros')
      .select('liga_id')
      .eq('usuario_id', usuarioId);

    if (errorMembresias) {
      throw errorMembresias;
    }

    const idsLigas = (membresias ?? []).map((registro: any) => registro.liga_id);

    if (idsLigas.length === 0) {
      return [];
    }

    const { data: ligas, error: errorLigas } = await this.supabaseService.client
      .from('ligas')
      .select('*')
      .in('id', idsLigas)
      .order('created_at', { ascending: false });

    if (errorLigas) {
      throw errorLigas;
    }

    return ligas ?? [];
  }

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

  async obtenerMiembrosLiga(ligaId: number): Promise<MiembroLigaSupabase[]> {
    const { data, error } = await this.supabaseService.client
      .from('liga_miembros')
      .select(`
        usuario_id,
        usuarios (
          nombre_usuario,
          nombre_visible
        )
      `)
      .eq('liga_id', ligaId);

    if (error) {
      throw error;
    }

    return (data ?? []).map((registro: any) => {
      const usuario = Array.isArray(registro.usuarios)
        ? registro.usuarios[0]
        : registro.usuarios;

      return {
        usuario_id: registro.usuario_id,
        nombre_usuario: usuario?.nombre_usuario ?? 'Usuario',
        nombre_visible: usuario?.nombre_visible ?? null
      };
    });
  }

  async obtenerPrediccionesPorUsuarios(
    usuariosIds: string[]
  ): Promise<PrediccionRankingSupabase[]> {
    if (usuariosIds.length === 0) {
      return [];
    }

    const { data, error } = await this.supabaseService.client
      .from('predicciones')
      .select('*')
      .in('usuario_id', usuariosIds);

    if (error) {
      throw error;
    }

    return data ?? [];
  }

  async crearLiga(usuarioId: string, nombre: string): Promise<LigaSupabase> {
    const codigo = this.generarCodigoLiga(nombre);

    const { data: liga, error: errorLiga } = await this.supabaseService.client
      .from('ligas')
      .insert({
        nombre,
        tipo: 'Privada',
        codigo,
        creador_id: usuarioId
      })
      .select()
      .single();

    if (errorLiga) {
      throw errorLiga;
    }

    const { error: errorMiembro } = await this.supabaseService.client
      .from('liga_miembros')
      .insert({
        liga_id: liga.id,
        usuario_id: usuarioId
      });

    if (errorMiembro) {
      console.error('La liga se creó, pero falló insertar el miembro:', errorMiembro);
      throw errorMiembro;
    }

    return liga;
  }

  async unirseConCodigo(
    usuarioId: string,
    codigo: string
  ): Promise<ResultadoUnionSupabase> {
    const codigoLimpio = codigo.trim().toUpperCase();

    const { data: liga, error: errorLiga } = await this.supabaseService.client
      .from('ligas')
      .select('*')
      .eq('codigo', codigoLimpio)
      .maybeSingle();

    if (errorLiga) {
      throw errorLiga;
    }

    if (!liga) {
      return {
        estado: 'no_encontrada'
      };
    }

    const { data: miembroExistente, error: errorMiembroExistente } = await this.supabaseService.client
      .from('liga_miembros')
      .select('*')
      .eq('liga_id', liga.id)
      .eq('usuario_id', usuarioId)
      .maybeSingle();

    if (errorMiembroExistente) {
      throw errorMiembroExistente;
    }

    if (miembroExistente) {
      return {
        estado: 'ya_existe',
        liga
      };
    }

    const { error: errorInsertarMiembro } = await this.supabaseService.client
      .from('liga_miembros')
      .insert({
        liga_id: liga.id,
        usuario_id: usuarioId
      });

    if (errorInsertarMiembro) {
      throw errorInsertarMiembro;
    }

    return {
      estado: 'unido',
      liga
    };
  }

  private generarCodigoLiga(nombre: string): string {
    const base = nombre
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 6);

    const aleatorio = Math.floor(1000 + Math.random() * 9000);

    return `${base || 'LIGA'}${aleatorio}`;
  }
}