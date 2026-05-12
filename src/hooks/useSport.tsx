'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Sport = 'padel' | 'futbol' | null;

interface SportContextType {
  sport: Sport;
  setSport: (sport: Sport) => void;
  isLoading: boolean;
}

const SportContext = createContext<SportContextType | undefined>(undefined);

// Simple cookie helpers
const setCookie = (name: string, value: string, days: number) => {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/`;
};

const getCookie = (name: string) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
};

const removeCookie = (name: string) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

export function SportProvider({ children }: { children: React.ReactNode }) {
  const [sport, setSportState] = useState<Sport>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedSport = getCookie('selected_sport') as Sport;
    if (savedSport) {
      setSportState(savedSport);
    }
    setIsLoading(false);
  }, []);

  const setSport = (newSport: Sport) => {
    setSportState(newSport);
    if (newSport) {
      setCookie('selected_sport', newSport, 365);
    } else {
      removeCookie('selected_sport');
    }
  };

  return (
    <SportContext.Provider value={{ sport, setSport, isLoading }}>
      {children}
    </SportContext.Provider>
  );
}

export function useSport() {
  const context = useContext(SportContext);
  if (context === undefined) {
    throw new Error('useSport must be used within a SportProvider');
  }
  return context;
}
