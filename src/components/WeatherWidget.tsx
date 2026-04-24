'use client';

import { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, Thermometer, Wind } from 'lucide-react';

export function WeatherWidget({ date }: { date: string }) {
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWeather() {
      try {
        // Coordenadas de Coronel Suárez / Pigüé (Peñarol Pádel)
        const lat = -37.4589;
        const lon = -61.9332;
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,precipitation_probability_max,weathercode&timezone=auto`);
        const data = await res.json();
        
        // Buscar el índice para la fecha seleccionada
        const dateIdx = data.daily.time.indexOf(date);
        if (dateIdx !== -1) {
          setWeather({
            temp: Math.round(data.daily.temperature_2m_max[dateIdx]),
            prob: data.daily.precipitation_probability_max[dateIdx],
            code: data.daily.weathercode[dateIdx]
          });
        } else {
          setWeather(null);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchWeather();
  }, [date]);

  if (loading) return (
    <div className="glass p-5 rounded-3xl border border-white/5 mx-4 flex items-center gap-4 animate-pulse">
      <div className="w-10 h-10 bg-white/5 rounded-2xl" />
      <div className="space-y-2">
        <div className="h-2 w-16 bg-white/5 rounded" />
        <div className="h-4 w-12 bg-white/5 rounded" />
      </div>
    </div>
  );

  if (!weather) return null;

  const getIcon = (code: number) => {
    if (code === 0) return <Sun className="text-primary" size={24} />;
    if (code >= 1 && code <= 3) return <Cloud className="text-blue-300" size={24} />;
    if (code >= 51) return <CloudRain className="text-blue-500" size={24} />;
    return <Sun className="text-primary" size={24} />;
  };

  const getCondition = (code: number) => {
    if (code === 0) return 'Despejado';
    if (code >= 1 && code <= 3) return 'Nublado';
    if (code >= 51) return 'Prob. Lluvia';
    return 'Soleado';
  };

  return (
    <div className="glass p-5 rounded-3xl border border-white/5 mx-4 flex items-center justify-between shadow-2xl bg-white/[0.02] border-l-primary/30">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-white/5 rounded-2xl shadow-inner">
          {getIcon(weather.code)}
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest opacity-40 leading-none mb-1">{getCondition(weather.code)}</p>
          <p className="text-2xl font-black text-white leading-none tracking-tighter">{weather.temp}°C</p>
        </div>
      </div>
      <div className="text-right">
        <div className="flex items-center gap-1.5 justify-end text-blue-400 mb-1">
          <CloudRain size={12} className="animate-bounce" />
          <span className="text-[11px] font-black tracking-tighter">{weather.prob}% Lluvia</span>
        </div>
        <p className="text-[8px] font-black uppercase tracking-widest opacity-20">Open-Meteo API</p>
      </div>
    </div>
  );
}
