import { Injectable } from '@angular/core';
import { Liga } from '../models/liga.model';

@Injectable({
  providedIn: 'root'
})
export class LigasService {

  private storageKey = 'mundial_ligas';

  private ligas: Liga[] = [
    {
      id: 1,
      nombre: 'Oficina Madrid',
      tipo: 'Privada',
      codigo: 'MADRID2026',
      miembros: 24,
      posicionUsuario: 3,
      puntosUsuario: 1250
    },
    {
      id: 2,
      nombre: 'Amigos del Barrio',
      tipo: 'Privada',
      codigo: 'BARRIO26',
      miembros: 8,
      posicionUsuario: 1,
      puntosUsuario: 1380
    },
    {
      id: 3,
      nombre: 'Liga Global 2026',
      tipo: 'Publica',
      codigo: 'GLOBAL2026',
      miembros: 1200000,
      posicionUsuario: 420,
      puntosUsuario: 1190
    }
  ];

  private ligasDisponibles: Liga[] = [
    {
      id: 4,
      nombre: 'Familia Mundialera',
      tipo: 'Privada',
      codigo: 'FAMILIA26',
      miembros: 12,
      posicionUsuario: 7,
      puntosUsuario: 0
    },
    {
      id: 5,
      nombre: 'UDD Challenge',
      tipo: 'Privada',
      codigo: 'UDD2026',
      miembros: 32,
      posicionUsuario: 18,
      puntosUsuario: 0
    }
  ];

  private guardarEnStorage(): void {
    localStorage.setItem(this.storageKey, JSON.stringify(this.ligas));
  }

  private cargarDesdeStorage(): void {
    const data = localStorage.getItem(this.storageKey);

    if (data) {
      this.ligas = JSON.parse(data);
    }
  }

  constructor() {
    this.cargarDesdeStorage();
  }

  obtenerLigas(): Liga[] {
    return this.ligas;
  }

  obtenerLigaPorId(id: number): Liga | undefined {
    return this.ligas.find(liga => liga.id === id);
  }

  crearLiga(nombre: string): Liga {
    const nuevaLiga: Liga = {
      id: Date.now(),
      nombre,
      tipo: 'Privada',
      codigo: this.generarCodigo(nombre),
      miembros: 1,
      posicionUsuario: 1,
      puntosUsuario: 0
    };

    this.ligas.push(nuevaLiga);
    this.guardarEnStorage();
    return nuevaLiga;
  }

  unirseConCodigo(codigo: string): { liga?: Liga; estado: 'unido' | 'ya_existe' | 'no_encontrada' } {
    const codigoLimpio = codigo.trim().toUpperCase();

    const yaExiste = this.ligas.find(liga => liga.codigo === codigoLimpio);

    if (yaExiste) {
      return {
        liga: yaExiste,
        estado: 'ya_existe'
      };
    }

    const ligaEncontrada = this.ligasDisponibles.find(
      liga => liga.codigo === codigoLimpio
    );

    if (!ligaEncontrada) {
      return {
        estado: 'no_encontrada'
      };
    }

    const nuevaLiga = {
      ...ligaEncontrada,
      miembros: ligaEncontrada.miembros + 1
    };

    this.ligas.push(nuevaLiga);
    this.guardarEnStorage();

    return {
      liga: nuevaLiga,
      estado: 'unido'
    };
  }

  private generarCodigo(nombre: string): string {
    const base = nombre
      .replace(/[^a-zA-Z0-9]/g, '')
      .substring(0, 6)
      .toUpperCase() || 'LIGA';

    let codigo = '';
    let existe = true;

    while (existe) {
      const numero = Math.floor(Math.random() * 900) + 100;
      codigo = `${base}${numero}`;

      existe = this.ligas.some(liga => liga.codigo === codigo) ||
              this.ligasDisponibles.some(liga => liga.codigo === codigo);
    }

    return codigo;
  }

  limpiarLigasGuardadas(): void {
    localStorage.removeItem(this.storageKey);
  }
}