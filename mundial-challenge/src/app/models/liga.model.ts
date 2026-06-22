export interface Liga {
  id: number;
  nombre: string;
  tipo: 'Privada' | 'Publica';

  codigo?: string;
  miembros: number;

  posicionUsuario: number;
  puntosUsuario: number;
}