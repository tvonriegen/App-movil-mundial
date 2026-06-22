export interface Prediccion {
  id: number;
  partidoId: number;
  usuarioId: number;

  golesLocal: number;
  golesVisitante: number;

  puntosObtenidos?: number;
  fechaCreacion: string;
}