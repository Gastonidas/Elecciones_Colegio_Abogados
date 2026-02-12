
export interface Lawyer {
  tomo: string;
  folio: string;
  apellido: string;
  nombre: string;
}

export interface GreenVote extends Lawyer {
  referentes: string[];
}

export interface VoterStatus {
  voted: boolean;
  timestamp?: number;
}

export type AppView = 'dashboard' | 'padron' | 'votos-verdes' | 'votar' | 'reportes';
