export interface Reserva {
  id: string;
  club_id: string;
  fecha: string;
  hora: string;
  cancha: number;
  nombre: string;
  telefono: string;
  created_at: string;
}

export interface PartidoAbierto {
  id: string;
  creador_id: string;
  nombre_creador: string;
  fecha: string;
  hora: string;
  jugadores_faltantes: number;
  nivel: string;
  contacto_whatsapp: string;
  avatar_url?: string;
  nivel_num?: number;
  created_at: string;
  avatar_emoji?: string;
  paleta_modelo?: string;
}

export interface UnionPartido {
  id: string;
  partido_id: string;
  user_id: string;
  nombre_interesado: string;
  whatsapp_interesado: string;
  estado: 'pendiente' | 'confirmado';
  created_at: string;
  partidos_abiertos?: PartidoAbierto;
}

export interface ListaEspera {
  id: string;
  user_id: string;
  email: string; // Used for name in waitlist
  fecha: string;
  hora: string;
  cancha: number;
  created_at: string;
}

export interface UserProfile {
  uid?: string;
  nombre: string;
  apellido: string;
  telefono: string;
  localidad: string;
  nivel?: number; // 1.0 to 7.0
  posicion?: 'Drive' | 'Revés' | 'Ambos';
  categoria?: string;
  paleta?: string;
  avatar_emoji?: string;
  paleta_emoji?: string;
  paleta_modelo?: string;
  avatar_url?: string;
}
