'use client';

import { useState } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays, isBefore, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

interface CalendarProps {
  selectedDate: Date;
  onChange: (date: Date) => void;
  isAdmin?: boolean;
}

export function Calendar({ selectedDate, onChange, isAdmin = false }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate));

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between px-4 py-4 border-b border-white/5">
        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">
          {format(currentMonth, 'MMMM yyyy', { locale: es })}
        </h3>
        <div className="flex gap-1">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 hover:bg-white/5 rounded-full transition-colors text-primary"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 hover:bg-white/5 rounded-full transition-colors text-primary"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    return (
      <div className="grid grid-cols-7 mb-2">
        {days.map((day) => (
          <div key={day} className="text-center text-[10px] font-black uppercase tracking-widest opacity-30 py-3">
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = "";

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, "d");
        const cloneDay = day;
        const isSelected = isSameDay(day, selectedDate);
        const isToday = isSameDay(day, new Date());
        const isPast = isBefore(day, startOfDay(new Date()));
        const isCurrentMonth = isSameMonth(day, monthStart);

        days.push(
          <button
            key={day.toString()}
            disabled={isAdmin ? false : isPast}
            className={clsx(
              "relative h-12 flex items-center justify-center text-sm font-bold transition-all rounded-xl",
              !isCurrentMonth && "opacity-10",
              (isPast && !isAdmin) && "cursor-not-allowed opacity-10",
              isSelected ? "bg-primary text-white shadow-[0_0_20px_rgba(136,130,220,0.6)] scale-110 z-10" : "hover:bg-white/5",
              isToday && !isSelected && "text-primary border border-primary/30"
            )}
            onClick={() => onChange(cloneDay)}
          >
            <span>{formattedDate}</span>
            {isToday && !isSelected && (
              <div className="absolute bottom-1.5 w-1 h-1 bg-primary rounded-full" />
            )}
          </button>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }
    return <div className="px-2 pb-4">{rows}</div>;
  };

  return (
    <div className="glass rounded-[2rem] border border-white/5 overflow-hidden shadow-2xl animate-fade-in w-full max-w-sm mx-auto">
      {renderHeader()}
      {renderDays()}
      {renderCells()}
    </div>
  );
}
