export interface Reserva {
  id: string;
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
  created_at: string;
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
}
