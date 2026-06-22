import { Injectable } from '@angular/core';
import { Usuario } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private storageKey = 'mundial_usuario';
  private sesionKey = 'mundial_sesion';

  private usuario: Usuario = {
    id: 1,
    nombre: 'Player 1',
    rol: 'Analista táctico',
    puntos: 4850,
    posicion: 42,
    ligas: 3,
    predicciones: 124,
    aciertos: 38,
    racha: 5
  };

  private guardarEnStorage(): void {
    localStorage.setItem(this.storageKey, JSON.stringify(this.usuario));
  }

  private cargarDesdeStorage(): void {
    const data = localStorage.getItem(this.storageKey);

    if (data) {
      this.usuario = JSON.parse(data);
    }
  }

  constructor() {
    this.cargarDesdeStorage();
  }
  obtenerUsuario(): Usuario {
    return this.usuario;
  }

  actualizarPerfil(nombre: string, rol: string): void {
    this.usuario.nombre = nombre;
    this.usuario.rol = rol;
    this.guardarEnStorage();
  }

  limpiarUsuarioGuardado(): void {
    localStorage.removeItem(this.storageKey);
    localStorage.removeItem(this.sesionKey);
  }

  iniciarSesion(): void {
    localStorage.setItem(this.sesionKey, 'activa');
  }

  cerrarSesion(): void {
    localStorage.removeItem(this.sesionKey);
  }

  sesionActiva(): boolean {
    return localStorage.getItem(this.sesionKey) === 'activa';
  }
}