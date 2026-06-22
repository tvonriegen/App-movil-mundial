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
    const { data, error } = await this.supabaseService.client
      .from('liga_miembros')
      .select(`
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
      .map((registro: any) => registro.ligas)
      .filter((liga: LigaSupabase | null) => liga !== null);
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