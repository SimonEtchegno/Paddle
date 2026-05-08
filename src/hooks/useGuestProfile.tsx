'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '@/types';

interface ProfileContextType {
  profile: UserProfile | null;
  saveProfile: (newProfile: UserProfile) => void;
  logout: () => void;
  loading: boolean;
  realPoints: number | null;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

// Generador de UUID compatible
const generateUUID = () => {
  try {
    return crypto.randomUUID();
  } catch (e) {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
};

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [realPoints, setRealPoints] = useState<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('paddle_guest_info');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!parsed.uid) {
          parsed.uid = generateUUID();
          localStorage.setItem('paddle_guest_info', JSON.stringify(parsed));
        }
        setProfile(parsed);
      } catch (e) {
        console.error('Error parsing profile', e);
      }
    }
    setLoading(false);
  }, []);

  const saveProfile = async (newProfile: UserProfile) => {
    const profileWithUid = {
      ...newProfile,
      uid: newProfile.uid || profile?.uid || generateUUID()
    };
    setProfile(profileWithUid);
    localStorage.setItem('paddle_guest_info', JSON.stringify(profileWithUid));

    // Sincronizar con Supabase para que el admin pueda verlo
    try {
      const { supabase } = await import('@/lib/supabase');
      await supabase.from('perfiles').upsert({
        id: profileWithUid.uid,
        nombre: profileWithUid.nombre,
        apellido: profileWithUid.apellido,
        telefono: profileWithUid.telefono,
        localidad: profileWithUid.localidad,
        categoria: profileWithUid.categoria,
        posicion: profileWithUid.posicion,
        avatar_url: profileWithUid.avatar_url,
        last_seen: new Date().toISOString()
      }, { onConflict: 'id' });
    } catch (e) {
      console.error('Error syncing profile:', e);
    }
  };

  const logout = () => {
    setProfile(null);
    localStorage.removeItem('paddle_guest_info');
  };

  useEffect(() => {
    if (profile?.nombre && profile?.apellido) {
      const fetchRealPoints = async () => {
        let pts = 0;
        const nUpper = profile.nombre.toUpperCase();
        const aUpper = profile.apellido.toUpperCase();

        // 1. Buscar en data estática
        import('@/lib/rankingData').then(({ rankingData }) => {
          Object.values(rankingData).forEach(cat => {
            cat.forEach(p => {
              const pName = p.name.toUpperCase();
              // A veces los anotan "APELLIDO NOMBRE" o "NOMBRE APELLIDO"
              if (pName.includes(nUpper) && pName.includes(aUpper)) {
                pts += p.pts;
              }
            });
          });

          // 2. Buscar en Supabase
          import('@/lib/supabase').then(({ supabase }) => {
            supabase.from('ranking_historial')
              .select('puntos')
              .ilike('nombre', `%${profile.nombre}%`)
              .ilike('nombre', `%${profile.apellido}%`)
              .then(({ data, error }) => {
                if (!error && data) {
                  data.forEach(row => {
                    pts += row.puntos;
                  });
                }
                setRealPoints(pts > 0 ? pts : null);
              });
          });
        });
      };
      fetchRealPoints();
    } else {
      setRealPoints(null);
    }
  }, [profile?.nombre, profile?.apellido]);

  return (
    <ProfileContext.Provider value={{ profile, saveProfile, logout, loading, realPoints }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useGuestProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useGuestProfile must be used within a ProfileProvider');
  }
  return context;
}
