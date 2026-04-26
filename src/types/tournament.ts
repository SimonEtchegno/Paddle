export type TournamentPhaseType = 'zones' | 'elimination' | 'both';

export interface Pair {
  id: string;
  name: string;
  player1: string;
  player2: string;
}

export interface Match {
  id: string;
  p1: string; // Pair ID or Name
  p2: string; // Pair ID or Name
  score: string; // e.g. "6-4 6-2"
  time?: string;
  date?: string;
  status: 'pending' | 'finished';
  winner?: string;
}

export interface Zone {
  id: string;
  name: string;
  pairs: string[]; // Pair IDs
  matches: Match[];
}

export interface BracketNode {
  id: string;
  stage: string; // e.g. "Final", "Semi", "Quarter"
  p1: string;
  p2: string;
  score: string;
  time?: string;
  winnerTo?: string; // Next node ID
  slot?: 1 | 2; // Which slot in the next node
}

export interface TournamentConfig {
  phaseType: TournamentPhaseType;
  numZones: number;
  pairsPerZone: number;
  qualifiersPerZone: number;
  bracketSize: 'semi' | 'quarter' | 'eighth';
}

export interface TournamentData {
  config: TournamentConfig;
  pairs: Pair[];
  zones: Zone[];
  bracket: BracketNode[];
}
