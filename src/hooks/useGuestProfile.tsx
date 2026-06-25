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
        
        // Sincronización inteligente en segundo plano (Read-first)
        const syncProfile = async () => {
          try {
            const { supabase } = await import('@/lib/supabase');
            
            // 1. Intentar buscar por ID
            let { data: dbProfile } = await supabase
              .from('perfiles')
              .select('*')
              .eq('id', parsed.uid)
              .maybeSingle();
              
            // 2. Si no se encuentra por ID, intentar buscar por teléfono limpio
            if (!dbProfile && parsed.telefono) {
              const cleanTel = parsed.telefono.replace(/\D/g, '');
              if (cleanTel) {
                const { data: telProfile } = await supabase
                  .from('perfiles')
                  .select('*')
                  .eq('telefono', cleanTel)
                  .limit(1);
                if (telProfile && telProfile.length > 0) {
                  dbProfile = telProfile[0];
                }
              }
            }
            
            if (dbProfile) {
              // Si existe en la BD, usamos la versión de la BD como fuente de verdad
              const updatedProfile = {
                uid: dbProfile.id,
                nombre: dbProfile.nombre || '',
                apellido: dbProfile.apellido || '',
                telefono: dbProfile.telefono || '',
                localidad: dbProfile.localidad || '',
                categoria: dbProfile.categoria || '7ma',
                posicion: dbProfile.posicion || 'Drive',
                avatar_url: dbProfile.avatar_url || '',
                paleta: dbProfile.paleta || '',
                paleta_modelo: dbProfile.paleta_modelo || 'carbono'
              };
              setProfile(updatedProfile);
              localStorage.setItem('paddle_guest_info', JSON.stringify(updatedProfile));
            } else {
              // Si no existe en la BD, lo creamos
              await saveProfile(parsed);
            }
          } catch (err) {
            console.error('Error in syncProfile:', err);
          }
        };

        setTimeout(syncProfile, 1000);
      } catch (e) {
        console.error('Error parsing profile', e);
      }
    }
    setLoading(false);
  }, []);

  const saveProfile = async (newProfile: UserProfile) => {
    try {
      const { supabase } = await import('@/lib/supabase');
      
      const cleanTelefono = newProfile.telefono ? newProfile.telefono.replace(/\D/g, '') : '';
      let targetUid = newProfile.uid || profile?.uid;
      let existingDbProfile: any = null;

      if (cleanTelefono !== "") {
        // Buscar si existe un perfil con este teléfono
        const { data: existingProfiles } = await supabase
          .from('perfiles')
          .select('*')
          .eq('telefono', cleanTelefono);

        if (existingProfiles && existingProfiles.length > 0) {
          existingDbProfile = existingProfiles[0];
          targetUid = existingDbProfile.id;
        }
      }

      // Si el teléfono pertenece a otra cuenta en la BD, cargamos esa cuenta existente en lugar de sobreescribirla
      if (existingDbProfile && existingDbProfile.id !== (profile?.uid || newProfile.uid)) {
        const loadedProfile = {
          uid: existingDbProfile.id,
          nombre: existingDbProfile.nombre || '',
          apellido: existingDbProfile.apellido || '',
          telefono: existingDbProfile.telefono || '',
          localidad: existingDbProfile.localidad || '',
          categoria: existingDbProfile.categoria || '7ma',
          posicion: existingDbProfile.posicion || 'Drive',
          avatar_url: existingDbProfile.avatar_url || '',
          paleta: existingDbProfile.paleta || '',
          paleta_modelo: existingDbProfile.paleta_modelo || 'carbono'
        };
        setProfile(loadedProfile);
        localStorage.setItem('paddle_guest_info', JSON.stringify(loadedProfile));
        return; // Detener el guardado y cargar el perfil existente
      }

      if (!targetUid) {
        targetUid = generateUUID();
      }

      const profileWithUid = {
        ...newProfile,
        telefono: cleanTelefono,
        uid: targetUid
      };

      const { error } = await supabase.from('perfiles').upsert({
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
      
      if (error) throw error;

      setProfile(profileWithUid);
      localStorage.setItem('paddle_guest_info', JSON.stringify(profileWithUid));
    } catch (e) {
      console.error('Error syncing profile:', e);
      throw e;
    }
  };

  const logout = () => {
    setProfile(null);
    localStorage.removeItem('paddle_guest_info');
  };

  useEffect(() => {
    if (profile?.uid) {
      const fetchRealPoints = async () => {
        let pts = 0;
        const nUpper = profile.nombre.toUpperCase();
        const aUpper = profile.apellido.toUpperCase();

        // 1. Verificar si el perfil aún existe en Supabase (por si el admin lo borró)
        const { supabase } = await import('@/lib/supabase');
        const { data: exists } = await supabase.from('perfiles').select('id').eq('id', profile.uid).single();
        
        if (!exists && !loading) {
          console.log('El perfil fue eliminado por administración.');
          logout();
          return;
        }

        // 2. Buscar en data del Drive (y fallback a data estática si falla)
        let liveRankingData: any = null;
        try {
          const res = await fetch('/api/ranking');
          if (res.ok) {
            const data = await res.json();
            if (data && !data.error && Object.keys(data).length > 0) {
              liveRankingData = data;
            }
          }
        } catch (e) {
          console.error("Error fetching live ranking:", e);
        }

        const processRankingData = (rData: any) => {
          Object.values(rData).forEach((cat: any) => {
            cat.forEach((p: any) => {
              const pName = p.name.toUpperCase();
              if (pName.includes(nUpper) && pName.includes(aUpper) && nUpper && aUpper) {
                pts += p.pts;
              } else if (nUpper && !aUpper && pName === nUpper) {
                pts += p.pts;
              }
            });
          });
        };

        if (liveRankingData) {
          processRankingData(liveRankingData);
          // 3. Buscar en Supabase (historial dinámico)
          const { data, error } = await supabase.from('ranking_historial')
            .select('puntos')
            .ilike('nombre', `%${profile.nombre}%`)
            .ilike('nombre', `%${profile.apellido}%`);
            
          if (!error && data) {
            data.forEach(row => {
              pts += row.puntos;
            });
          }
          setRealPoints(pts > 0 ? pts : null);
        } else {
          import('@/lib/rankingData').then(({ rankingData }) => {
            processRankingData(rankingData);
            
            // 3. Buscar en Supabase (historial dinámico)
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
        }
      };
      fetchRealPoints();
    } else {
      setRealPoints(null);
    }
  }, [profile?.uid, profile?.nombre, profile?.apellido]);

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
