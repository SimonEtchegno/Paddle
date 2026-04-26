'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '@/types';

interface ProfileContextType {
  profile: UserProfile | null;
  saveProfile: (newProfile: UserProfile) => void;
  logout: () => void;
  loading: boolean;
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

  const saveProfile = (newProfile: UserProfile) => {
    const profileWithUid = {
      ...newProfile,
      uid: newProfile.uid || profile?.uid || generateUUID()
    };
    setProfile(profileWithUid);
    localStorage.setItem('paddle_guest_info', JSON.stringify(profileWithUid));
  };

  const logout = () => {
    setProfile(null);
    localStorage.removeItem('paddle_guest_info');
  };

  return (
    <ProfileContext.Provider value={{ profile, saveProfile, logout, loading }}>
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
