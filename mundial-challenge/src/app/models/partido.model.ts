export interface Partido {
  id: number;
  grupo: string;
  fecha: string;
  hora: string;

  local: string;
  visitante: string;

  banderaLocal: string;
  banderaVisitante: string;

  estado: 'pendiente' | 'en_vivo' | 'finalizado';

  golesLocal?: number;
  golesVisitante?: number;
}