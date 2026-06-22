export interface Usuario {
  id: number;
  nombre: string;
  rol: string;

  puntos: number;
  posicion: number;
  ligas: number;

  predicciones: number;
  aciertos: number;
  racha: number;
}