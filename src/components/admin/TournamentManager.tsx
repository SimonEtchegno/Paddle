'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, Users, Layout, Plus, X, Save, ChevronLeft,
  CheckCircle2, Search, Trash2, Calendar, Clock,
  ChevronRight, Camera, Settings2, GripVertical, Sparkles, Share2, Globe, Crown
} from 'lucide-react';
import {
  DndContext as DndKitContext,
  DragEndEvent,
  DragStartEvent,
  PointerSensor as DndPointerSensor,
  useSensor as useDndSensor,
  useSensors as useDndSensors,
  rectIntersection,
  useDroppable,
  DragOverlay as DndDragOverlay
} from '@dnd-kit/core';
import {
  SortableContext as DndSortableContext,
  verticalListSortingStrategy as dndVerticalListSortingStrategy,
  arrayMove as dndArrayMove,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { clsx } from 'clsx';
import { toast } from 'react-hot-toast';
import { toPng } from 'html-to-image';
import { useTutorial } from '@/hooks/useTutorial';
import { TournamentPhaseType, Pair, Zone, Match, BracketNode, TournamentConfig } from '@/types/tournament';

interface TournamentManagerProps {
  tournament: any;
  inscripciones: any[];
  onSave: (data: any) => Promise<void>;
  onClose: () => void;
}

type ManagementStep = 'config' | 'pairs' | 'assignment' | 'groups' | 'bracket' | 'champions';

export default function TournamentManager({ tournament, inscripciones, onSave, onClose }: TournamentManagerProps) {
  // --- STATE ---
  const [step, setStep] = useState<ManagementStep>(() => {
    if (tournament.cuadro_data && tournament.cuadro_data.length > 0) return 'bracket';
    if (tournament.zonas_data && tournament.zonas_data.length > 0) return 'groups';
    if (tournament.parejas_data && tournament.parejas_data.length > 0) return 'pairs';
    return 'config';
  });

  const [unlockedSteps, setUnlockedSteps] = useState<string[]>(() => {
    const all = ['config', 'pairs', 'assignment', 'groups', 'bracket', 'champions'];
    const isExisting = tournament.id && tournament.id !== 'new';
    if (isExisting) return all;

    const unlocked = ['config'];
    if (tournament.parejas_data && tournament.parejas_data.length > 0) unlocked.push('pairs');
    if (tournament.zonas_data && tournament.zonas_data.length > 0) unlocked.push('assignment', 'groups');
    if (tournament.cuadro_data && tournament.cuadro_data.length > 0) unlocked.push('bracket');
    return unlocked;
  });

  const unlock = (s: string) => {
    if (!unlockedSteps.includes(s)) setUnlockedSteps(prev => [...prev, s]);
  };

  const [loading, setLoading] = useState(false);

  const [config, setConfig] = useState<TournamentConfig>(() => {
    const defaultCfg: TournamentConfig = {
      phaseType: 'both',
      numZones: tournament.zonas_data?.length || 4,
      pairsPerZone: 4,
      qualifiersPerZone: 2,
      bracketSize: 'semi'
    };
    if (!tournament.config || Object.keys(tournament.config).length === 0) {
      return defaultCfg;
    }
    return { ...defaultCfg, ...tournament.config };
  });

  const [pairs, setPairs] = useState<Pair[]>(() => {
    console.log("Initializing pairs with:", tournament.parejas_data);
    return Array.isArray(tournament.parejas_data) ? tournament.parejas_data : [];
  });
  const [zones, setZones] = useState<Zone[]>(() => {
    console.log("Initializing zones with:", tournament.zonas_data);
    return Array.isArray(tournament.zonas_data) ? tournament.zonas_data : [];
  });
  const [bracket, setBracket] = useState<BracketNode[]>(() => {
    console.log("Initializing bracket with:", tournament.cuadro_data);
    return Array.isArray(tournament.cuadro_data) ? tournament.cuadro_data : [];
  });
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [backupsList, setBackupsList] = useState<Record<string, any>>({});

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveName, setSaveName] = useState('');
  const { startTournamentAdminTour } = useTutorial();
  const [currentVersionName, setCurrentVersionName] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isVisible, setIsVisible] = useState(tournament.visible !== false);

  const [champions, setChampions] = useState<any>(() => {
    return tournament.champions_data || {
      winner: '',
      runnerUp: '',
      score: '',
      photoUrl: '',
      runnerUpPhotoUrl: ''
    };
  });

  const [isUploading, setIsUploading] = useState<'winner' | 'runnerUp' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const runnerUpFileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'winner' | 'runnerUp') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo y tamaño
    if (!file.type.startsWith('image/')) return toast.error('El archivo debe ser una imagen');
    if (file.size > 5 * 1024 * 1024) return toast.error('La imagen no puede pesar más de 5MB');

    setIsUploading(type);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${tournament.id || 'new'}_${type}_${Date.now()}.${fileExt}`;
      const filePath = `champions/${fileName}`;

      const { data, error } = await supabase.storage
        .from('torneos')
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('torneos')
        .getPublicUrl(filePath);

      setChampions({ ...champions, [type === 'winner' ? 'photoUrl' : 'runnerUpPhotoUrl']: publicUrl });
      toast.success(`¡Foto de ${type === 'winner' ? 'campeones' : 'subcampeones'} subida!`);
    } catch (e: any) {
      toast.error('Error al subir: ' + e.message);
    } finally {
      setIsUploading(null);
    }
  };

  const detectChampionsFromBracket = () => {
    const finalMatch = bracket.find(n => n.id === 'final');
    if (!finalMatch || !finalMatch.score) {
      return toast.error('Cargá el resultado de la Final primero');
    }

    const score = parseScore(finalMatch.score);
    if (!score) return;

    const winner = score.p1Sets > score.p2Sets ? 1 : (score.p2Sets > score.p1Sets ? 2 : 0);

    if (winner === 0) {
      return toast.error('La final no tiene un ganador claro aún');
    }

    setChampions({
      ...champions,
      winner: winner === 1 ? finalMatch.p1 : finalMatch.p2,
      runnerUp: winner === 1 ? finalMatch.p2 : finalMatch.p1,
      score: finalMatch.score
    });

    toast.success('¡Resultados sincronizados!');
  };

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    isPrompt?: boolean;
    promptValue?: string;
    promptPlaceholder?: string;
    confirmText?: string;
    cancelText?: string;
    isDanger?: boolean;
    onConfirm: (val?: string) => void;
  } | null>(null);

  useEffect(() => {
    setIsVisible(tournament.visible !== false);
  }, [tournament.id, tournament.visible]);

  const resetTournament = () => {
    setConfirmDialog({
      isOpen: true,
      title: '¿Resetear Torneo?',
      message: 'Vas a borrar TODO el progreso de este torneo. No se puede deshacer.',
      isDanger: true,
      confirmText: 'Sí, Borrar Todo',
      onConfirm: () => {
        setPairs([]);
        setZones([]);
        setBracket([]);
        setUnlockedSteps(['config']);
        setStep('config');
        localStorage.removeItem(`tournament_auto_${tournament.id}`);
        toast.success('Torneo reseteado');
      }
    });
  };

  // --- AUTO-SAVE & BACKUP LOGIC ---
  useEffect(() => {
    // Auto-save to local storage on every change
    const autoSaveData = {
      timestamp: new Date().toISOString(),
      config,
      pairs,
      zones,
      bracket
    };
    localStorage.setItem(`tournament_auto_${tournament.id}`, JSON.stringify(autoSaveData));
  }, [config, pairs, zones, bracket]);

  // Try to recover auto-save on mount if current state is empty
  useEffect(() => {
    const saved = localStorage.getItem(`tournament_auto_${tournament.id}`);
    if (saved && (!tournament.parejas_data || tournament.parejas_data.length === 0)) {
      try {
        const data = JSON.parse(saved);
        setPairs(data.pairs);
        setZones(data.zones);
        setBracket(data.bracket);
        setConfig(data.config);
        toast('Progreso recuperado automáticamente', { icon: '🔄' });
      } catch (e) {
        console.error("Failed to load auto-save", e);
      }
    }
  }, []);

  // Sincronizar número de zonas con el estado zones
  useEffect(() => {
    if (config.numZones > 0 && config.phaseType !== 'elimination') {
      setZones(prev => {
        const currentZones = [...prev];
        if (currentZones.length < config.numZones) {
          // Agregar zonas faltantes
          for (let i = currentZones.length; i < config.numZones; i++) {
            currentZones.push({
              id: `zone-${i}-${Date.now()}`,
              name: `Zona ${String.fromCharCode(65 + i)}`,
              pairs: [],
              matches: []
            });
          }
          return currentZones;
        } else if (currentZones.length > config.numZones) {
          // Quitar zonas sobrantes
          return currentZones.slice(0, config.numZones);
        }
        return prev;
      });
    } else if (config.phaseType === 'elimination') {
      setZones([]);
    }
  }, [config.numZones, config.phaseType]);

  const generateId = () => {
    return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
  };

  const handleBracketScoreUpdate = (nodeId: string, newScore: string) => {
    const newBracket = [...bracket];
    const curr = newBracket.find(n => n.id === nodeId)!;
    curr.score = newScore;

    if (curr.winnerTo) {
      const s = parseScore(newScore);
      const nextNode = newBracket.find(n => n.id === curr.winnerTo);

      if (nextNode) {
        if (s && (s.p1Sets !== s.p2Sets)) {
          const winningPair = s.p1Sets > s.p2Sets ? curr.p1 : curr.p2;
          if (curr.slot === 1) nextNode.p1 = winningPair;
          else nextNode.p2 = winningPair;
        } else {
          // Si el score no está definido o hay empate, limpiamos el slot del siguiente partido
          if (curr.slot === 1) nextNode.p1 = '?';
          else nextNode.p2 = '?';
        }
      }
    }
    setBracket(newBracket);
  };

  const updateGameString = (currentScore: string, setIdx: number, playerIdx: 1 | 2, val: string) => {
    const sets = currentScore.split(/[\s,]+/).filter(s => s.includes('-'));
    const parsed = [0, 1, 2].map(i => {
      const [g1, g2] = (sets[i] || '-').split('-');
      return { g1: g1 === '-' ? '' : g1, g2: g2 === '-' ? '' : g2 };
    });
    if (playerIdx === 1) parsed[setIdx].g1 = val;
    else parsed[setIdx].g2 = val;

    return parsed
      .map(s => (s.g1 || s.g2) ? `${s.g1 || '0'}-${s.g2 || '0'}` : '-')
      .filter(s => s !== '-')
      .join(' ');
  };

  const exportRef = useRef<HTMLDivElement>(null);

  // --- HELPERS ---
  const sensors = useDndSensors(useDndSensor(DndPointerSensor));

  const handleSave = async (customName?: string) => {
    const finalName = customName || saveName || `Torneo ${new Date().toLocaleTimeString()}`;
    setIsSyncing(true);
    try {
      // 1. Save to Database
      await onSave({
        config,
        parejas_data: pairs,
        zonas_data: zones,
        cuadro_data: bracket,
        champions_data: champions,
        visible: isVisible
      });

      // 2. Save Local Version (Backup)
      const backupData = {
        timestamp: new Date().toISOString(),
        config,
        pairs,
        zones,
        bracket
      };
      const backups = JSON.parse(localStorage.getItem('tournament_backups') || '{}');
      backups[finalName] = backupData;
      localStorage.setItem('tournament_backups', JSON.stringify(backups));

      setCurrentVersionName(finalName);
      toast.success(backups[finalName] ? `Versión "${finalName}" actualizada` : `Versión "${finalName}" guardada`);
      setShowSaveModal(false);
    } catch (e: any) {
      console.error(e);
      toast.error(`Error al guardar: ${e.message || 'Desconocido'}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const saveLocalBackup = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Guardar Backup Local',
      message: 'Ingresá un nombre para identificar esta versión',
      isPrompt: true,
      promptPlaceholder: 'Ej: Zonas listas',
      confirmText: 'Guardar',
      onConfirm: (name) => {
        if (!name) return;
        const backupData = {
          timestamp: new Date().toISOString(),
          config,
          pairs,
          zones,
          bracket
        };

        const backups = JSON.parse(localStorage.getItem('tournament_backups') || '{}');
        backups[name] = backupData;
        localStorage.setItem('tournament_backups', JSON.stringify(backups));
        toast.success('Backup guardado localmente');
      }
    });
  };

  const loadLocalBackup = (name: string) => {
    console.log("Attempting to load backup:", name);
    try {
      const backupsRaw = localStorage.getItem('tournament_backups');
      if (!backupsRaw) {
        toast.error('No se encontró la base de datos de backups');
        return;
      }

      const backups = JSON.parse(backupsRaw);
      const data = backups[name];
      if (!data) {
        toast.error('El backup seleccionado ya no existe');
        return;
      }

      console.log("Data found for backup:", name, data);

      // Restaurar estados con validación
      if (data.config) setConfig(data.config);
      if (data.pairs) setPairs(Array.isArray(data.pairs) ? data.pairs : []);
      if (data.zones) setZones(Array.isArray(data.zones) ? data.zones : []);
      if (data.bracket) setBracket(Array.isArray(data.bracket) ? data.bracket : []);

      setUnlockedSteps(['config', 'pairs', 'assignment', 'groups', 'bracket']);
      setCurrentVersionName(name);
      setSaveName(name);

      if (data.bracket && data.bracket.length > 0) setStep('bracket');
      else if (data.zones && data.zones.length > 0) setStep('groups');
      else if (data.pairs && data.pairs.length > 0) setStep('pairs');

      setShowLoadModal(false);
      toast.success('¡Backup restaurado con éxito!');
    } catch (e: any) {
      console.error("Error loading backup:", e);
      toast.error('Fallo crítico al restaurar: ' + (e.message || 'Error desconocido'));
      setShowLoadModal(false);
    }
  };

  const openLoadModal = () => {
    const backups = JSON.parse(localStorage.getItem('tournament_backups') || '{}');
    setBackupsList(backups);
    setShowLoadModal(true);
  };

  const nextStep = () => {
    if (step === 'config') {
      setStep('pairs');
      unlock('pairs');
    }
    else if (step === 'pairs') {
      if (pairs.length < 2) return toast.error('Carga al menos 2 parejas para continuar');

      // Auto-generate zones if they don't exist or adjust count without wiping existing ones
      if (zones.length < config.numZones) {
        const newZones = [...zones];
        for (let i = zones.length; i < config.numZones; i++) {
          newZones.push({
            id: `zone-${i}-${Date.now()}`,
            name: `Zona ${String.fromCharCode(65 + i)}`,
            pairs: [],
            matches: []
          });
        }
        setZones(newZones);
      } else if (zones.length > config.numZones) {
        setZones(zones.slice(0, config.numZones));
      }
      setStep('assignment');
      unlock('assignment');
    }
    else if (step === 'assignment') {
      const totalAssigned = zones.reduce((acc, z) => acc + z.pairs.length, 0);
      if (totalAssigned < 2) {
        return toast.error('Debes asignar al menos 2 parejas entre todas las zonas');
      }

      const unassignedCount = pairs.filter(p => !zones.some(z => z.pairs.includes(p.id))).length;
      if (unassignedCount > 0) {
        toast(`Continuando con ${unassignedCount} parejas sin asignar`, { icon: 'ℹ️' });
      }
      setStep('groups');
      unlock('groups');
    }
    else if (step === 'groups') {
      const hasEmptyFixtures = zones.some(z => z.matches.length === 0);
      if (hasEmptyFixtures) return toast.error('Debes generar los fixtures de todas las zonas');

      const hasPendingMatches = zones.some(z => z.matches.some(m => m.status !== 'finished'));
      if (hasPendingMatches) return toast.error('Todos los partidos de zona deben tener resultado para avanzar');

      setStep('bracket');
      unlock('bracket');
    }
  };

  const prevStep = () => {
    if (step === 'pairs') setStep('config');
    else if (step === 'assignment') setStep('pairs');
    else if (step === 'groups') setStep('assignment');
    else if (step === 'bracket') setStep('groups');
  };

  const autoAssignPairs = () => {
    const unassigned = pairs.filter(p => !zones.some(z => z.pairs.includes(p.id)));
    if (unassigned.length === 0) return toast.error('No hay parejas sin asignar');

    const newZones = [...zones];
    unassigned.forEach((pair, idx) => {
      // Find the zone with fewest pairs
      const targetZone = newZones.reduce((prev, curr) =>
        prev.pairs.length <= curr.pairs.length ? prev : curr
      );
      targetZone.pairs.push(pair.id);
    });

    setZones(newZones);
    toast.success(`${unassigned.length} parejas asignadas automáticamente`);
  };

  // --- RENDERING HELPERS ---
  const steps = [
    { id: 'config', label: 'Configuración', icon: Settings2 },
    { id: 'pairs', label: 'Parejas', icon: Users },
    { id: 'assignment', label: 'Asignación', icon: Layout },
    { id: 'groups', label: 'Zonas', icon: Trophy },
    { id: 'bracket', label: 'Cuadro', icon: Layout },
    { id: 'champions', label: 'Premiación', icon: Crown },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 bg-surface/30 p-4 md:p-10 rounded-[3rem] border border-white/5 min-h-[85vh] flex flex-col"
    >
      <div id="tutorial-tourney-header" className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-white/5 pb-8">
        <div className="flex items-center gap-4 md:gap-6 w-full lg:w-auto">
          <button onClick={onClose} className="p-3 md:p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/5 group">
            <ChevronLeft size={20} className="md:size-[24px] group-hover:-translate-x-1 transition-transform" />
          </button>
          <div className="flex-1">
            <h2 className="text-2xl md:text-4xl font-black uppercase italic tracking-tighter leading-none">
              Gestión <span className="text-primary">Pro</span>
            </h2>
            <p className="text-[9px] md:text-[10px] font-black opacity-40 uppercase tracking-[0.3em] mt-1 md:mt-2 truncate max-w-[200px] md:max-w-none">
              {tournament.nombre}
            </p>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-3 rounded-2xl hover:bg-white/5 transition-all text-white/40 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        {/* Stepper & Actions Container */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-center lg:justify-end">
          <button
            id="tutorial-tourney-load"
            onClick={openLoadModal}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all text-white/40 hover:text-white"
          >
            <Clock size={14} /> Cargar
          </button>

          <button
            onClick={() => startTournamentAdminTour((s) => setStep(s as ManagementStep))}
            className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-black transition-all text-primary"
          >
            <Sparkles size={16} /> ¿Cómo organizar mi torneo?
          </button>

          <button
            onClick={() => {
              const url = `${window.location.origin}/torneos/${tournament.id}`;
              navigator.clipboard.writeText(url);
              toast.success('¡Link público copiado!');
            }}
            className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all text-white/60 hover:text-white"
          >
            <Share2 size={16} /> Compartir
          </button>

          <button
            id="tutorial-tourney-save"
            onClick={() => handleSave()}
            disabled={isSyncing}
            className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-primary text-black text-[10px] font-black uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-[0_0_20px_rgba(200,255,0,0.3)] disabled:opacity-50"
          >
            {isSyncing ? (
              <Clock className="animate-spin" size={16} />
            ) : (
              <Save size={16} />
            )}
            {isSyncing ? 'Guardando...' : 'Guardar Cambios'}
          </button>

          <div className="w-px h-8 bg-white/10 mx-2" />

          <div id="tutorial-tourney-visibility" className="flex items-center gap-4 bg-black/20 px-6 py-3 rounded-2xl border border-white/5 mr-4">
            <div className="flex flex-col items-end">
              <span className="text-[8px] font-black uppercase tracking-widest opacity-40">Estado Público</span>
              <span className={clsx("text-[9px] font-black uppercase tracking-widest", isVisible ? "text-primary" : "text-white/20")}>
                {isVisible ? 'Visible para todos' : 'Privado (Solo Admin)'}
              </span>
            </div>
            <button
              onClick={() => setIsVisible(!isVisible)}
              className={clsx(
                "w-12 h-6 rounded-full transition-all relative p-1",
                isVisible ? "bg-primary" : "bg-white/10"
              )}
            >
              <motion.div
                animate={{ x: isVisible ? 24 : 0 }}
                className="w-4 h-4 bg-white rounded-full shadow-lg"
              />
            </button>
          </div>

          <div className="w-px h-8 bg-white/10 mx-2" />

          <div className="flex items-center gap-1 bg-black/40 backdrop-blur-2xl p-1 rounded-[1.8rem] border border-white/5 shadow-2xl relative">
            {steps.map((s, idx) => {
              const Icon = s.icon;
              const isActive = step === s.id;
              const isCompleted = unlockedSteps.includes(s.id);
              const isLocked = !isCompleted && !isActive;

              return (
                <div key={s.id} className="flex items-center">
                  <button
                    id={`tutorial-tourney-step-${s.id}`}
                    disabled={isLocked}
                    onClick={() => setStep(s.id as ManagementStep)}
                    className={clsx(
                      "flex items-center gap-2.5 px-4 py-3 rounded-[1.3rem] transition-all relative group",
                      isActive ? "text-black" : "text-white/40 hover:text-white"
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="active-pill"
                        className="absolute inset-0 bg-primary rounded-[1.3rem] shadow-[0_0_20px_rgba(136,130,220,0.4)]"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                      />
                    )}

                    <div className="relative z-10 flex items-center gap-2">
                      <div className={clsx(
                        "p-1.5 rounded-lg transition-all",
                        isActive ? "bg-black/10" : "bg-white/5"
                      )}>
                        <Icon size={14} className={clsx(isActive && "animate-pulse")} />
                      </div>
                      {/* Only show text on active step or very wide screens to save space */}
                      <span className={clsx(
                        "text-[9px] font-black uppercase tracking-widest transition-all",
                        isActive ? "block" : "hidden 2xl:block"
                      )}>
                        {s.label}
                      </span>
                    </div>
                  </button>

                  {idx < steps.length - 1 && (
                    <div className="px-1">
                      <div className={clsx(
                        "w-4 h-[1px] rounded-full transition-all duration-500",
                        unlockedSteps.includes(steps[idx + 1].id) ? "bg-primary/40" : "bg-white/5"
                      )} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-4">
            {!isVisible && (
              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-error/20 border border-error/30 rounded-xl animate-pulse">
                <Globe size={14} className="text-error" />
                <span className="text-[9px] font-black uppercase tracking-widest text-error">Torneo Oculto (Privado)</span>
              </div>
            )}
            <button
              onClick={onClose}
              className="p-3 rounded-2xl hover:bg-white/5 transition-all text-white/40 hover:text-white"
            >
              <X size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {step === 'config' && (
            <motion.div
              id="tutorial-step-config"
              key="config"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-4xl mx-auto space-y-12 py-10"
            >
              <div className="text-center space-y-4">
                <h3 className="text-5xl font-black uppercase italic tracking-tighter">Configura tu Torneo</h3>
                <p className="text-sm opacity-40 font-bold uppercase tracking-widest">Define las reglas y la estructura base</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="glass p-10 rounded-[3rem] border border-white/5 space-y-8">
                  <div className="space-y-6">
                    <label className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 ml-1">Tipo de Fase</label>
                    <div className="grid grid-cols-1 gap-3">
                      {[
                        { id: 'zones', label: 'Solo Zonas', desc: 'Fase de grupos sin eliminación' },
                        { id: 'both', label: 'Zonas + Eliminatoria', desc: 'Grupos y luego llaves finales' },
                        { id: 'elimination', label: 'Solo Eliminatoria', desc: 'Cuadro directo desde el inicio' },
                      ].map((type) => (
                        <button
                          key={type.id}
                          onClick={() => setConfig({ ...config, phaseType: type.id as any })}
                          className={clsx(
                            "p-6 rounded-[2rem] border text-left transition-all group",
                            config.phaseType === type.id ? "bg-primary border-primary text-black" : "bg-white/5 border-white/5 hover:border-primary/40 hover:bg-white/10"
                          )}
                        >
                          <p className="font-black uppercase italic text-lg">{type.label}</p>
                          <p className={clsx("text-[10px] font-bold uppercase opacity-40", config.phaseType === type.id && "text-black/60")}>{type.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="glass p-10 rounded-[3rem] border border-white/5 space-y-10">
                  {config.phaseType !== 'elimination' && (
                    <div className="space-y-8">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-black uppercase italic">Cantidad de Zonas</p>
                          <p className="text-[10px] opacity-40 font-bold uppercase mt-1">¿Cuántos grupos habrá?</p>
                        </div>
                        <div className="flex items-center gap-4 bg-black/40 p-2 rounded-2xl border border-white/5">
                          <button onClick={() => setConfig({ ...config, numZones: Math.max(1, config.numZones - 1) })} className="w-10 h-10 rounded-xl bg-white/5 hover:bg-primary hover:text-black transition-all font-black">-</button>
                          <span className="text-xl font-black w-8 text-center">{config.numZones}</span>
                          <button onClick={() => setConfig({ ...config, numZones: config.numZones + 1 })} className="w-10 h-10 rounded-xl bg-white/5 hover:bg-primary hover:text-black transition-all font-black">+</button>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-black uppercase italic">Clasifican por Zona</p>
                          <p className="text-[10px] opacity-40 font-bold uppercase mt-1">A la fase final</p>
                        </div>
                        <div className="flex items-center gap-4 bg-black/40 p-2 rounded-2xl border border-white/5">
                          <button onClick={() => setConfig({ ...config, qualifiersPerZone: Math.max(1, config.qualifiersPerZone - 1) })} className="w-10 h-10 rounded-xl bg-white/5 hover:bg-primary hover:text-black transition-all font-black">-</button>
                          <span className="text-xl font-black w-8 text-center">{config.qualifiersPerZone}</span>
                          <button onClick={() => setConfig({ ...config, qualifiersPerZone: config.qualifiersPerZone + 1 })} className="w-10 h-10 rounded-xl bg-white/5 hover:bg-primary hover:text-black transition-all font-black">+</button>
                        </div>
                      </div>
                    </div>
                  )}

                  {config.phaseType !== 'zones' && (
                    <div className="space-y-6">
                      <label className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 ml-1">Tamaño del Cuadro</label>
                      <select
                        value={config.bracketSize}
                        onChange={(e) => setConfig({ ...config, bracketSize: e.target.value as any })}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-xs font-black uppercase tracking-widest outline-none focus:border-primary transition-all"
                      >
                        <option value="semi">Semifinales (4)</option>
                        <option value="quarter">Cuartos de Final (8)</option>
                        <option value="eighth">Octavos de Final (16)</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-center pt-8">
                <button
                  onClick={nextStep}
                  className="bg-primary text-black px-16 py-6 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-[0_20px_40px_rgba(136,130,220,0.3)] flex items-center gap-4 group"
                >
                  Siguiente Paso <ChevronRight size={20} className="group-hover:translate-x-2 transition-transform" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 'pairs' && (
            <motion.div
              key="pairs"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-10 h-full flex flex-col"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
                <div className="space-y-2">
                  <h3 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter">Gestión de Parejas</h3>
                  <p className="text-xs md:text-sm opacity-40 font-bold uppercase tracking-widest">Carga y edita los participantes</p>
                </div>
                <div className="flex flex-wrap gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      const testData = [
                        ['Los Galácticos', 'Juan Pérez', 'Diego Gómez'],
                        ['Pádel Pro', 'Lucas Martínez', 'Mateo Rodríguez'],
                        ['El Muro', 'Carlos Sánchez', 'Roberto Díaz'],
                        ['Saque As', 'Fernando López', 'Jorge Ruiz'],
                        ['La Red', 'Santi García', 'Nico Torres'],
                        ['Top Spin', 'Mariano Castro', 'Enzo Silva'],
                        ['Smash It', 'Hugo Romero', 'Beto Sosa'],
                        ['Volea Letal', 'Fede Blanco', 'Ramiro Jara']
                      ];
                      const newPairs = testData.map(([name, p1, p2]) => ({
                        id: generateId(),
                        name,
                        player1: p1,
                        player2: p2
                      }));
                      setPairs(prev => [...prev, ...newPairs]);
                      toast.success('Parejas de prueba cargadas');
                    }}
                    className="flex-1 sm:flex-none bg-white/5 border border-white/10 px-6 py-3.5 rounded-2xl font-black text-[9px] uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2 text-primary/60 hover:text-primary"
                  >
                    <Sparkles size={16} /> Demo
                  </button>
                  <button
                    onClick={() => {
                      const newPair: Pair = { id: generateId(), name: '', player1: '', player2: '' };
                      setPairs([...pairs, newPair]);
                    }}
                    className="flex-1 sm:flex-none bg-white/5 border border-white/10 px-6 py-3.5 rounded-2xl font-black text-[9px] uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2 text-primary"
                  >
                    <Plus size={16} /> Añadir
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 overflow-y-auto pr-2 flex-1 custom-scrollbar pb-10">
                {pairs.map((p, idx) => (
                  <motion.div
                    layout
                    key={p.id}
                    className="glass p-8 rounded-[2.5rem] border border-white/5 space-y-6 relative group"
                  >
                    <button
                      onClick={() => setPairs(pairs.filter(x => x.id !== p.id))}
                      className="absolute top-6 right-6 p-2 text-error/20 hover:text-error hover:bg-error/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>

                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-widest opacity-30 ml-1">Nombre Pareja</label>
                      <input
                        className="w-full bg-transparent text-xl font-black uppercase italic outline-none focus:text-primary transition-all tracking-tighter"
                        placeholder="EJ: LOS NINJAS"
                        value={p.name}
                        onChange={(e) => {
                          const newPairs = [...pairs];
                          newPairs[idx].name = e.target.value;
                          setPairs(newPairs);
                        }}
                      />
                    </div>

                    <div className="space-y-4 pt-2">
                      <div className="space-y-1">
                        <label className="text-[8px] font-black uppercase tracking-widest opacity-20 ml-1">Jugador 1</label>
                        <input
                          className="w-full bg-black/20 border border-white/5 rounded-xl p-3 text-[11px] font-bold outline-none focus:border-primary/40 transition-all"
                          placeholder="Nombre..."
                          value={p.player1}
                          onChange={(e) => {
                            const newPairs = [...pairs];
                            newPairs[idx].player1 = e.target.value;
                            setPairs(newPairs);
                          }}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-black uppercase tracking-widest opacity-20 ml-1">Jugador 2</label>
                        <input
                          className="w-full bg-black/20 border border-white/5 rounded-xl p-3 text-[11px] font-bold outline-none focus:border-primary/40 transition-all"
                          placeholder="Nombre..."
                          value={p.player2}
                          onChange={(e) => {
                            const newPairs = [...pairs];
                            newPairs[idx].player2 = e.target.value;
                            setPairs(newPairs);
                          }}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}

                <div className="glass p-8 rounded-[2.5rem] border border-white/5 border-dashed flex flex-col items-center justify-center text-center space-y-6 opacity-40 hover:opacity-100 transition-all">
                  <div className="p-5 bg-white/5 rounded-3xl">
                    <Users size={32} />
                  </div>
                  <div>
                    <p className="font-black uppercase italic">Importar Inscriptos</p>
                    <p className="text-[9px] font-bold uppercase mt-1">Cargar parejas desde inscripciones</p>
                  </div>
                  <button
                    onClick={() => {
                      const newFromInsc = inscripciones
                        .filter(i => i.torneo_id === tournament.id)
                        .map(i => ({
                          id: generateId(),
                          name: `${i.jugador1.split(' ')[0]} / ${i.jugador2.split(' ')[0]}`,
                          player1: i.jugador1,
                          player2: i.jugador2
                        }));
                      setPairs([...pairs, ...newFromInsc]);
                      toast.success(`${newFromInsc.length} parejas importadas`);
                    }}
                    className="bg-primary text-black px-6 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest hover:scale-105 transition-all"
                  >
                    Importar Todo
                  </button>
                </div>
              </div>

              <div className="flex justify-between pt-10 mt-auto">
                <button onClick={prevStep} className="flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest opacity-40 hover:opacity-100 transition-all">
                  <ChevronLeft size={18} /> Volver
                </button>
                <button onClick={nextStep} className="bg-primary text-black px-12 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-3">
                  Siguiente Paso <ChevronRight size={18} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 'assignment' && (
            <DndKitContext
              sensors={sensors}
              collisionDetection={rectIntersection}
              onDragStart={(e) => setActiveDragId(e.active.id as string)}
              onDragEnd={(e) => {
                const { active, over } = e;
                setActiveDragId(null);
                if (!over) return;

                const pairId = active.id as string;
                const overId = over.id as string;

                setZones(prev => prev.map(z => {
                  if (z.id === overId) {
                    if (z.pairs.includes(pairId)) return z;
                    return { ...z, pairs: [...z.pairs, pairId] };
                  }
                  return { ...z, pairs: z.pairs.filter(p => p !== pairId) };
                }));
              }}
            >
              <motion.div
                id="tutorial-step-assignment"
                key="assignment"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-10 h-full flex-1"
              >
                <div className="lg:col-span-3 flex flex-col gap-6 h-full">
                  <div className="flex items-center justify-between px-2">
                    <div className="space-y-1">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Sin Asignar ({pairs.filter(p => !zones.some(z => z.pairs.includes(p.id))).length})</h3>
                      <button
                        onClick={autoAssignPairs}
                        className="text-[9px] font-black uppercase text-primary hover:underline flex items-center gap-1 transition-all"
                      >
                        <Sparkles size={12} /> Auto-Asignar Todo
                      </button>
                    </div>
                    <div className="p-1 bg-white/5 rounded-lg"><Users size={14} className="opacity-40" /></div>
                  </div>
                  <div className="space-y-2 flex-1 overflow-y-auto pr-3 custom-scrollbar">
                    {pairs.filter(p => !zones.some(z => z.pairs.includes(p.id))).map((p) => (
                      <DraggablePair key={p.id} pair={p} />
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-9 space-y-8 overflow-y-auto pr-2 custom-scrollbar pb-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {zones.map((z) => (
                      <ZoneDroppable
                        key={z.id}
                        zone={z}
                        allPairs={pairs}
                        onRemovePair={(pairId) => {
                          setZones(prev => prev.map(zone => zone.id === z.id ? { ...zone, pairs: zone.pairs.filter(id => id !== pairId) } : zone));
                        }}
                        onDeleteZone={() => {
                          setConfirmDialog({
                            isOpen: true,
                            title: '¿Borrar Zona?',
                            message: `Vas a eliminar la ${z.name}. Las parejas volverán a estar sin asignar.`,
                            isDanger: true,
                            confirmText: 'Sí, Borrar',
                            onConfirm: () => {
                              setZones(prev => prev.filter(zone => zone.id !== z.id));
                              setConfig(prev => ({ ...prev, numZones: Math.max(1, prev.numZones - 1) }));
                              toast.success(`${z.name} eliminada`);
                            }
                          });
                        }}
                      />
                    ))}
                  </div>
                </div>

                <DndDragOverlay>
                  {activeDragId ? (
                    <div className="bg-primary text-black p-4 rounded-2xl shadow-2xl font-black uppercase italic text-xs w-64 border border-white/20">
                      {pairs.find(p => p.id === activeDragId)?.name || 'Pareja'}
                    </div>
                  ) : null}
                </DndDragOverlay>
              </motion.div>

              <div className="flex justify-between pt-10 mt-auto">
                <button onClick={prevStep} className="flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest opacity-40 hover:opacity-100 transition-all">
                  <ChevronLeft size={18} /> Volver
                </button>
                <button onClick={nextStep} className="bg-primary text-black px-12 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-3">
                  Siguiente Paso <ChevronRight size={18} />
                </button>
              </div>
            </DndKitContext>
          )}

          {step === 'groups' && (
            <motion.div
              id="tutorial-step-groups"
              key="groups"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-10 flex-1 flex flex-col h-full"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-2">
                  <h3 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter">Fase de Grupos</h3>
                  <p className="text-xs md:text-sm opacity-40 font-bold uppercase tracking-widest">Gestiona los partidos y mira las posiciones</p>
                </div>
                <button
                  id="tutorial-gen-fixtures"
                  onClick={() => {
                    const newZones = zones.map(z => {
                      if (z.matches.length > 0) return z;
                      const matches: Match[] = [];
                      for (let i = 0; i < z.pairs.length; i++) {
                        for (let j = i + 1; j < z.pairs.length; j++) {
                          matches.push({
                            id: generateId(),
                            p1: z.pairs[i],
                            p2: z.pairs[j],
                            score: '',
                            status: 'pending'
                          });
                        }
                      }
                      return { ...z, matches };
                    });
                    setZones(newZones);
                    toast.success('Fixtures generados');
                  }}
                  className="w-full md:w-auto bg-primary/10 text-primary border border-primary/30 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:text-black transition-all flex items-center justify-center gap-3"
                >
                  ⚡ Generar Fixtures
                </button>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 overflow-y-auto pr-2 custom-scrollbar flex-1 pb-10">
                {zones.map((z, zIdx) => {
                  const standings = calculateStandings(z, pairs);
                  return (
                    <div key={z.id} className="space-y-8">
                      <div className="glass p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-white/5 space-y-6 md:space-y-8 h-full flex flex-col">
                        <h4 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter text-primary">{z.name}</h4>

                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-[11px]">
                            <thead>
                              <tr className="border-b border-white/10 opacity-30 uppercase font-black">
                                <th className="pb-5">Pareja</th>
                                <th className="pb-5 text-center">PJ</th>
                                <th className="pb-5 text-center">PTS</th>
                                <th className="pb-5 text-center">SET</th>
                                <th className="pb-5 text-center">GAME</th>
                              </tr>
                            </thead>
                            <tbody className="font-bold">
                              {standings.map((s, idx) => (
                                <tr key={idx} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors text-[10px] md:text-[11px]">
                                  <td className="py-4 md:py-5 flex items-center gap-2 md:gap-3 italic uppercase min-w-[150px] md:min-w-[200px]">
                                    <span className={clsx("w-4 h-4 md:w-5 md:h-5 flex items-center justify-center rounded-full text-[7px] md:text-[8px]", idx < config.qualifiersPerZone ? "bg-primary text-black" : "bg-white/5 opacity-30")}>{idx + 1}</span>
                                    <span className="truncate">{s.name}</span>
                                  </td>
                                  <td className="py-4 md:py-5 text-center opacity-40">{s.pj}</td>
                                  <td className="py-4 md:py-5 text-center text-primary font-black">{s.pts}</td>
                                  <td className="py-5 text-center">{s.sf - s.sc > 0 ? '+' : ''}{s.sf - s.sc}</td>
                                  <td className="py-5 text-center opacity-40">{s.gf - s.gc > 0 ? '+' : ''}{s.gf - s.gc}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        <div className="space-y-4 pt-6 border-t border-white/5 flex-1">
                          <p className="text-[10px] font-black uppercase tracking-widest opacity-30">Partidos</p>
                          <div className="space-y-4">
                            {z.matches.map((m, mIdx) => (
                              <div key={m.id} className="space-y-2">
                                <p className="text-[8px] font-black uppercase opacity-20 ml-2 italic tracking-widest">Partido {mIdx + 1}</p>
                                <MatchRow
                                  match={m}
                                  pairs={pairs}
                                  onUpdate={(data) => {
                                    const newZones = [...zones];
                                    const zone = newZones.find(x => x.id === z.id)!;
                                    const match = zone.matches.find(x => x.id === m.id)!;
                                    Object.assign(match, data);
                                    setZones(newZones);
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between pt-10 mt-auto">
                <button onClick={prevStep} className="flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest opacity-40 hover:opacity-100 transition-all">
                  <ChevronLeft size={18} /> Volver
                </button>
                <button onClick={nextStep} className="bg-primary text-black px-12 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-3">
                  Siguiente Paso <ChevronRight size={18} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 'bracket' && (
            <motion.div
              key="bracket"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-12 h-full flex flex-col"
            >
              <div className="flex flex-col md:flex-row justify-between items-center bg-white/5 p-8 rounded-[3rem] border border-white/10 gap-6 backdrop-blur-xl">
                <div>
                  <h3 className="text-3xl font-black uppercase italic tracking-tighter">Eliminatoria Final</h3>
                  <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest mt-1 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" /> Camino a la Gloria
                  </p>
                </div>
                <button
                  onClick={() => {
                    const classified: string[] = [];
                    zones.forEach((z, idx) => {
                      const top = calculateStandings(z, pairs).slice(0, config.qualifiersPerZone);
                      top.forEach(p => classified.push(p.name));
                    });

                    const newBracket: BracketNode[] = [];

                    if (config.bracketSize === 'eighth') {
                      // 8 Octavos -> 4 Cuartos -> 2 Semis -> 1 Final
                      for (let i = 1; i <= 8; i++) {
                        newBracket.push({
                          id: `eighth-${i}`, stage: 'Octavos',
                          p1: classified[(i - 1) * 2] || `Pareja ${(i - 1) * 2 + 1}`,
                          p2: classified[(i - 1) * 2 + 1] || `Pareja ${(i - 1) * 2 + 2}`,
                          score: '', winnerTo: `quarter-${Math.ceil(i / 2)}`, slot: (i % 2 === 1 ? 1 : 2)
                        });
                      }
                      for (let i = 1; i <= 4; i++) {
                        newBracket.push({ id: `quarter-${i}`, stage: 'Cuartos', p1: '?', p2: '?', score: '', winnerTo: `semi-${Math.ceil(i / 2)}`, slot: (i % 2 === 1 ? 1 : 2) });
                      }
                      for (let i = 1; i <= 2; i++) {
                        newBracket.push({ id: `semi-${i}`, stage: 'Semifinal', p1: '?', p2: '?', score: '', winnerTo: 'final', slot: (i % 2 === 1 ? 1 : 2) });
                      }
                      newBracket.push({ id: 'final', stage: 'Final', p1: '?', p2: '?', score: '' });
                    }
                    else if (config.bracketSize === 'quarter') {
                      // 4 Cuartos -> 2 Semis -> 1 Final
                      for (let i = 1; i <= 4; i++) {
                        newBracket.push({
                          id: `quarter-${i}`, stage: 'Cuartos',
                          p1: classified[(i - 1) * 2] || `Pareja ${(i - 1) * 2 + 1}`,
                          p2: classified[(i - 1) * 2 + 1] || `Pareja ${(i - 1) * 2 + 2}`,
                          score: '', winnerTo: `semi-${Math.ceil(i / 2)}`, slot: (i % 2 === 1 ? 1 : 2)
                        });
                      }
                      for (let i = 1; i <= 2; i++) {
                        newBracket.push({ id: `semi-${i}`, stage: 'Semifinal', p1: '?', p2: '?', score: '', winnerTo: 'final', slot: (i % 2 === 1 ? 1 : 2) });
                      }
                      newBracket.push({ id: 'final', stage: 'Final', p1: '?', p2: '?', score: '' });
                    }
                    else {
                      // Semifinales (config.bracketSize === 'semi')
                      newBracket.push({ id: 'semi-1', stage: 'Semifinal', p1: classified[0] || '1° Zona A', p2: classified[3] || '2° Zona B', score: '', winnerTo: 'final', slot: 1 });
                      newBracket.push({ id: 'semi-2', stage: 'Semifinal', p1: classified[2] || '1° Zona B', p2: classified[1] || '2° Zona A', score: '', winnerTo: 'final', slot: 2 });
                      newBracket.push({ id: 'final', stage: 'Final', p1: '?', p2: '?', score: '' });
                    }

                    setBracket(newBracket);
                    toast.success(`Cuadro de ${config.bracketSize === 'semi' ? '4' : config.bracketSize === 'quarter' ? '8' : '16'} parejas generado`);
                  }}
                  className="bg-primary text-black px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-[0_20px_40px_rgba(136,130,220,0.3)] flex items-center gap-3"
                >
                  <Trophy size={18} /> Generar Cuadro
                </button>
              </div>

              <div className="flex-1 overflow-x-auto custom-scrollbar pb-20">
                <div className="flex gap-12 md:gap-32 min-w-max px-6 md:px-20 h-full items-center justify-center">
                  {(config.bracketSize === 'eighth'
                    ? ['Octavos', 'Cuartos', 'Semifinal', 'Final']
                    : config.bracketSize === 'quarter'
                      ? ['Cuartos', 'Semifinal', 'Final']
                      : ['Semifinal', 'Final']
                  ).map((stage, sIdx) => (
                    <div key={stage} className="space-y-16 flex flex-col justify-around h-full py-10 relative">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-10 whitespace-nowrap">
                        <span className="text-[11px] font-black uppercase tracking-[0.5em] text-primary/40 bg-primary/5 px-6 py-2 rounded-full border border-primary/10">{stage}</span>
                      </div>

                      <div className="space-y-24">
                        {bracket.filter(n => n.stage === stage).map((node, nIdx) => {
                          const score = parseScore(node.score);
                          const winner = score ? (score.p1Sets > score.p2Sets ? 1 : score.p2Sets > score.p1Sets ? 2 : 0) : 0;
                          const isFinal = node.stage === 'Final';

                          return (
                            <div key={node.id} className="relative group">
                              <p className="text-[8px] font-black uppercase opacity-20 mb-2 ml-4 italic tracking-widest">{node.stage} - Partido {nIdx + 1}</p>
                              <motion.div
                                whileHover={{ scale: 1.02, y: -5 }}
                                className={clsx(
                                  "w-[280px] md:w-[320px] glass border rounded-[2rem] md:rounded-[2.5rem] overflow-hidden transition-all duration-500 shadow-2xl relative z-10",
                                  winner !== 0 ? "border-primary/40" : "border-white/10",
                                  isFinal && winner !== 0 && "ring-4 ring-primary/20 shadow-[0_0_50px_rgba(136,130,220,0.4)]"
                                )}
                              >
                                {isFinal && winner !== 0 && (
                                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-black px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl animate-bounce">
                                    CHAMPION
                                  </div>
                                )}

                                {/* Player 1 */}
                                <div className={clsx(
                                  "p-6 flex justify-between items-center transition-all duration-500",
                                  winner === 1 ? "bg-primary text-black" : "bg-transparent"
                                )}>
                                  <div className="flex items-center gap-3 flex-1 min-w-0 pr-4">
                                    {winner === 1 && <Trophy size={16} className="shrink-0" />}
                                    <input
                                      className={clsx(
                                        "bg-transparent text-sm font-black uppercase italic w-full outline-none transition-all",
                                        winner === 1 ? "text-black" : "text-white opacity-60 focus:opacity-100"
                                      )}
                                      value={node.p1}
                                      onChange={(e) => {
                                        const newBracket = [...bracket];
                                        newBracket.find(n => n.id === node.id)!.p1 = e.target.value;
                                        setBracket(newBracket);
                                      }}
                                    />
                                  </div>
                                  <div className="flex gap-2">
                                    {[0, 1, 2].map((i) => (
                                      <input
                                        key={i}
                                        placeholder="0"
                                        value={parseScore(node.score)?.sets?.[i]?.g1 || ''}
                                        onChange={(e) => {
                                          const newScore = updateGameString(node.score, i, 1, e.target.value);
                                          handleBracketScoreUpdate(node.id, newScore);
                                        }}
                                        className={clsx(
                                          "w-10 h-10 rounded-xl text-center text-xs font-black border transition-all outline-none",
                                          winner === 1 ? "bg-black/20 border-black/10 text-black" : "bg-white/5 border-white/5 text-white opacity-40 focus:opacity-100"
                                        )}
                                      />
                                    ))}
                                  </div>
                                </div>

                                <div className="h-[1px] bg-white/5 mx-6" />

                                {/* Player 2 */}
                                <div className={clsx(
                                  "p-6 flex justify-between items-center transition-all duration-500",
                                  winner === 2 ? "bg-primary text-black" : "bg-transparent"
                                )}>
                                  <div className="flex items-center gap-3 flex-1 min-w-0 pr-4">
                                    {winner === 2 && <Trophy size={16} className="shrink-0" />}
                                    <input
                                      className={clsx(
                                        "bg-transparent text-sm font-black uppercase italic w-full outline-none transition-all",
                                        winner === 2 ? "text-black" : "text-white opacity-60 focus:opacity-100"
                                      )}
                                      value={node.p2}
                                      onChange={(e) => {
                                        const newBracket = [...bracket];
                                        newBracket.find(n => n.id === node.id)!.p2 = e.target.value;
                                        setBracket(newBracket);
                                      }}
                                    />
                                  </div>
                                  <div className="flex gap-2">
                                    {[0, 1, 2].map((i) => (
                                      <input
                                        key={i}
                                        placeholder="0"
                                        value={parseScore(node.score)?.sets?.[i]?.g2 || ''}
                                        onChange={(e) => {
                                          const newScore = updateGameString(node.score, i, 2, e.target.value);
                                          handleBracketScoreUpdate(node.id, newScore);
                                        }}
                                        className={clsx(
                                          "w-10 h-10 rounded-xl text-center text-xs font-black border transition-all outline-none",
                                          winner === 2 ? "bg-black/20 border-black/10 text-black" : "bg-white/5 border-white/5 text-white opacity-40 focus:opacity-100"
                                        )}
                                      />
                                    ))}
                                  </div>
                                </div>
                              </motion.div>

                              {node.winnerTo && (
                                <>
                                  <div className="absolute -right-16 top-1/2 -translate-y-[1px] w-16 h-[2px] bg-white/10" />
                                  <div className={clsx(
                                    "absolute -right-16 w-[2px] bg-white/10 transition-all duration-500",
                                    node.slot === 1 ? "top-1/2 h-[120px]" : "bottom-1/2 h-[120px]",
                                    winner !== 0 && "bg-primary/40"
                                  )} />
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-white/5 pt-8 mt-auto">
                <button onClick={prevStep} className="flex items-center gap-3 px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest opacity-40 hover:opacity-100 transition-all hover:bg-white/5">
                  <ChevronLeft size={20} /> Volver a Zonas
                </button>
                <button
                  onClick={() => {
                    setStep('champions');
                    unlock('champions');
                  }}
                  className="bg-primary text-black px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-[0_20px_40px_rgba(136,130,220,0.3)] flex items-center gap-3"
                >
                  Ir a Premiación <Crown size={18} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 'champions' && (
            <motion.div
              key="champions"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-4xl mx-auto space-y-12 py-10"
            >
              <div className="text-center space-y-4">
                <h3 className="text-5xl font-black uppercase italic tracking-tighter flex items-center justify-center gap-6">
                  <Crown size={48} className="text-primary" /> Galería de <span className="text-primary">Campeones</span>
                </h3>
                <div className="flex flex-col items-center gap-4">
                  <p className="text-sm opacity-40 font-bold uppercase tracking-widest text-center max-w-lg mx-auto">
                    Inmortalizá a los ganadores del torneo. Esta información se mostrará públicamente como el Hall of Fame.
                  </p>
                  <button
                    onClick={detectChampionsFromBracket}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-black transition-all"
                  >
                    <Sparkles size={14} /> Sincronizar desde el Cuadro
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="glass p-10 rounded-[3.5rem] border border-white/5 space-y-8">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 ml-1">Pareja Campeona</label>
                      <div className="relative group">
                        <Trophy className="absolute left-5 top-1/2 -translate-y-1/2 text-primary" size={20} />
                        <input
                          className="w-full bg-black/40 border border-white/10 rounded-2xl py-6 pl-16 pr-6 text-xl font-black uppercase italic tracking-tight outline-none focus:border-primary transition-all"
                          placeholder="EJ: BELASTEGUÍN / COELLO"
                          value={champions.winner}
                          onChange={(e) => setChampions({ ...champions, winner: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 ml-1">Pareja Subcampeona</label>
                      <div className="relative group">
                        <Users className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={20} />
                        <input
                          className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 pl-16 pr-6 text-sm font-black uppercase italic tracking-tight outline-none focus:border-primary transition-all opacity-60 focus:opacity-100"
                          placeholder="EJ: GALÁN / LEBRÓN"
                          value={champions.runnerUp}
                          onChange={(e) => setChampions({ ...champions, runnerUp: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 ml-1">Resultado de la Final</label>
                      <input
                        className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 px-8 text-center text-sm font-black uppercase tracking-widest outline-none focus:border-primary transition-all"
                        placeholder="EJ: 6-4 / 7-5"
                        value={champions.score}
                        onChange={(e) => setChampions({ ...champions, score: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* FOTO CAMPEONES */}
                  <div className="glass p-8 rounded-[3rem] border border-white/5 space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Foto de los Campeones</label>
                    <div
                      onClick={() => isUploading !== 'winner' && fileInputRef.current?.click()}
                      className={clsx(
                        "aspect-video relative rounded-[2rem] border-2 border-dashed overflow-hidden group flex flex-col items-center justify-center gap-2 transition-all bg-black/20 cursor-pointer",
                        champions.photoUrl ? "border-primary/20" : "border-white/10 hover:border-primary/40"
                      )}
                    >
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => handlePhotoUpload(e, 'winner')} />
                      {isUploading === 'winner' ? (
                        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                      ) : champions.photoUrl ? (
                        <>
                          <img src={champions.photoUrl} className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity" />
                          <button onClick={(e) => { e.stopPropagation(); setChampions({ ...champions, photoUrl: '' }); }} className="relative z-10 p-3 bg-red-500/20 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={18} /></button>
                        </>
                      ) : (
                        <div className="flex flex-col items-center gap-2 opacity-20"><Camera size={32} /><p className="text-[9px] font-black uppercase">Subir Foto Ganadores</p></div>
                      )}
                    </div>
                  </div>

                  {/* FOTO SUBCAMPEONES */}
                  <div className="glass p-8 rounded-[3rem] border border-white/5 space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Foto de los Subcampeones</label>
                    <div
                      onClick={() => isUploading !== 'runnerUp' && runnerUpFileInputRef.current?.click()}
                      className={clsx(
                        "aspect-video relative rounded-[2rem] border-2 border-dashed overflow-hidden group flex flex-col items-center justify-center gap-2 transition-all bg-black/20 cursor-pointer",
                        champions.runnerUpPhotoUrl ? "border-white/40" : "border-white/10 hover:border-white/20"
                      )}
                    >
                      <input type="file" ref={runnerUpFileInputRef} className="hidden" accept="image/*" onChange={(e) => handlePhotoUpload(e, 'runnerUp')} />
                      {isUploading === 'runnerUp' ? (
                        <div className="w-8 h-8 border-3 border-white/40 border-t-transparent rounded-full animate-spin" />
                      ) : champions.runnerUpPhotoUrl ? (
                        <>
                          <img src={champions.runnerUpPhotoUrl} className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity" />
                          <button onClick={(e) => { e.stopPropagation(); setChampions({ ...champions, runnerUpPhotoUrl: '' }); }} className="relative z-10 p-3 bg-red-500/20 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={18} /></button>
                        </>
                      ) : (
                        <div className="flex flex-col items-center gap-2 opacity-20"><Camera size={32} /><p className="text-[9px] font-black uppercase">Subir Foto Podio</p></div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-8">
                <button onClick={() => setStep('bracket')} className="flex items-center gap-3 px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest opacity-40 hover:opacity-100 transition-all hover:bg-white/5">
                  <ChevronLeft size={20} /> Volver al Cuadro
                </button>
                <div className="flex items-center gap-6">
                  <p className="text-[9px] font-black uppercase opacity-30 italic">No te olvides de guardar los cambios arriba ↑</p>
                  <button
                    onClick={() => handleSave('Hall of Fame')}
                    className="bg-primary text-black px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-[0_20px_40px_rgba(136,130,220,0.3)] flex items-center gap-3"
                  >
                    Guardar Hall of Fame <Save size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Save Progress Modal */}
      <AnimatePresence>
        {showSaveModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-surface p-12 rounded-[4rem] border border-white/10 w-full max-w-xl space-y-10 shadow-[0_50px_100px_rgba(0,0,0,0.5)] relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-white/5">
                {isSyncing && (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="h-full bg-primary shadow-[0_0_20px_rgba(136,130,220,0.8)]"
                  />
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-primary/10 rounded-2xl">
                    <Save size={32} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="text-4xl font-black uppercase italic tracking-tighter">
                      {backupsList[saveName] ? 'Actualizar Versión' : 'Guardar Versión'}
                    </h3>
                    <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">
                      {backupsList[saveName] ? `Se sobreescribirá "${saveName}"` : 'Crea un punto de restauración'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Nombre de la versión</label>
                  <input
                    autoFocus
                    placeholder="Ej: Zonas Listas / Sábado Mañana"
                    className="w-full bg-white/5 border border-white/10 rounded-3xl p-8 text-xl font-black uppercase italic outline-none focus:border-primary/50 focus:bg-primary/5 transition-all"
                    value={saveName}
                    onChange={(e) => setSaveName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && saveName && handleSave(saveName)}
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setShowSaveModal(false)}
                    className="flex-1 px-8 py-6 rounded-3xl font-black text-[11px] uppercase tracking-widest opacity-40 hover:opacity-100 hover:bg-white/5 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    disabled={!saveName || isSyncing}
                    onClick={() => handleSave(saveName)}
                    className="flex-[2] bg-primary text-black px-8 py-6 rounded-3xl font-black text-[11px] uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-[0_20px_40px_rgba(136,130,220,0.3)] disabled:opacity-30 flex items-center justify-center gap-3"
                  >
                    {isSyncing ? (
                      <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                    ) : (
                      <>Sincronizar Ahora <CheckCircle2 size={18} /></>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLoadModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-surface p-10 rounded-[3rem] border border-white/10 w-full max-w-lg space-y-8 shadow-2xl"
            >
              <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
                <div>
                  <h3 className="text-3xl font-black uppercase italic tracking-tighter">Historial de Versiones</h3>
                  <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest mt-1">Recupera cualquier punto guardado</p>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                  {Object.keys(backupsList).length > 0 && (
                    <button
                      onClick={() => {
                        setConfirmDialog({
                          isOpen: true,
                          title: '¿Limpiar Historial?',
                          message: 'Se borrarán TODAS las versiones guardadas permanentemente.',
                          isDanger: true,
                          confirmText: 'Sí, Limpiar',
                          onConfirm: () => {
                            localStorage.removeItem('tournament_backups');
                            setBackupsList({});
                            toast.success('Historial limpiado');
                          }
                        });
                      }}
                      className="flex-1 md:flex-none p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                      <Trash2 size={16} /> Limpiar
                    </button>
                  )}
                  <button onClick={() => setShowLoadModal(false)} className="flex-1 md:flex-none p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all flex justify-center">
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {Object.keys(backupsList).length === 0 ? (
                  <div className="text-center py-10 opacity-20 font-black uppercase tracking-widest text-[10px]">No hay versiones guardadas</div>
                ) : (
                  Object.entries(backupsList)
                    .sort((a, b) => new Date(b[1].timestamp).getTime() - new Date(a[1].timestamp).getTime())
                    .map(([name, data]) => (
                      <div
                        key={name}
                        className="w-full text-left p-6 bg-white/5 border border-white/10 rounded-2xl hover:border-primary hover:bg-primary/5 transition-all flex justify-between items-center group"
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            loadLocalBackup(name);
                          }}
                          className="flex-1 text-left"
                        >
                          <p className="text-lg font-black uppercase italic tracking-tight group-hover:text-primary transition-colors">{name}</p>
                          <p className="text-[9px] opacity-30 font-bold mt-1 uppercase">
                            {new Date(data.timestamp).toLocaleString()}
                          </p>
                        </button>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setConfirmDialog({
                                isOpen: true,
                                title: '¿Borrar Versión?',
                                message: `Se eliminará permanentemente el backup "${name}".`,
                                isDanger: true,
                                confirmText: 'Sí, Borrar',
                                onConfirm: () => {
                                  const newBackups = { ...backupsList };
                                  delete newBackups[name];
                                  localStorage.setItem('tournament_backups', JSON.stringify(newBackups));
                                  setBackupsList(newBackups);
                                  toast.success('Versión eliminada');
                                }
                              });
                            }}
                            className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={16} />
                          </button>
                          <ChevronRight size={18} className="opacity-0 group-hover:opacity-100 transition-all text-primary translate-x-[-10px] group-hover:translate-x-0" />
                        </div>
                      </div>
                    ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>



      {/* Footer Actions */}
      <div className="p-8 border-t border-white/5 bg-black/40 backdrop-blur-xl flex justify-between items-center">
        <button
          onClick={() => resetTournament()}
          className="flex items-center gap-2 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-error/40 hover:text-error hover:bg-error/10 transition-all border border-white/5"
        >
          <Trash2 size={16} /> Borrar Todo el Progreso
        </button>

        <div className="flex gap-4">
          <button
            onClick={() => {
              const name = currentVersionName || `Torneo ${new Date().toLocaleDateString()}`;
              setSaveName(name);
              const backups = JSON.parse(localStorage.getItem('tournament_backups') || '{}');
              setBackupsList(backups);
              setShowSaveModal(true);
            }}
            disabled={isSyncing}
            className="bg-primary text-black px-12 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-[0_20px_40px_rgba(136,130,220,0.3)] disabled:opacity-50 flex items-center gap-3"
          >
            {isSyncing ? <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" /> : <Save size={18} />}
            {isSyncing ? 'Sincronizando...' : 'Guardar Configuración'}
          </button>
        </div>
      </div>
      {/* Custom Confirm Dialog */}
      <AnimatePresence>
        {confirmDialog?.isOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-surface p-8 rounded-[2.5rem] border border-white/10 w-full max-w-sm space-y-6 shadow-2xl relative overflow-hidden"
            >
              {/* Subtle background glow */}
              <div className={clsx(
                "absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-20 pointer-events-none",
                confirmDialog.isDanger ? "bg-red-500" : "bg-primary"
              )} />

              <div className="relative z-10 space-y-2 text-center">
                <h3 className="text-2xl font-black uppercase italic tracking-tight">{confirmDialog.title}</h3>
                <p className="text-[11px] font-bold opacity-50 uppercase tracking-widest">{confirmDialog.message}</p>
              </div>

              {confirmDialog.isPrompt && (
                <div className="relative z-10">
                  <input
                    autoFocus
                    type="text"
                    value={confirmDialog.promptValue || ''}
                    onChange={e => setConfirmDialog({ ...confirmDialog, promptValue: e.target.value })}
                    placeholder={confirmDialog.promptPlaceholder}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm font-black uppercase outline-none focus:border-primary/50 transition-all text-center"
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        confirmDialog.onConfirm(confirmDialog.promptValue);
                      }
                    }}
                  />
                </div>
              )}

              <div className="flex gap-3 relative z-10 pt-2">
                <button
                  onClick={() => setConfirmDialog(null)}
                  className="flex-1 py-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all text-[10px] font-black uppercase tracking-widest opacity-60 hover:opacity-100"
                >
                  {confirmDialog.cancelText || 'Cancelar'}
                </button>
                <button
                  onClick={() => {
                    confirmDialog.onConfirm(confirmDialog.promptValue);
                    setConfirmDialog(null);
                  }}
                  className={clsx(
                    "flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg",
                    confirmDialog.isDanger
                      ? "bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white"
                      : "bg-primary text-black hover:scale-105"
                  )}
                >
                  {confirmDialog.confirmText || 'Confirmar'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}

// --- HELPER COMPONENTS ---

function DraggablePair({ pair }: { pair: Pair }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useSortable({
    id: pair.id,
  });

  const style = {
    transform: transform ? CSS.Translate.toString(transform) : undefined,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="w-full p-5 rounded-[1.5rem] border bg-white/5 border-white/5 hover:border-primary/40 hover:bg-primary/5 transition-all text-left flex items-center justify-between group cursor-grab active:cursor-grabbing"
    >
      <div className="min-w-0 pr-4">
        <p className="text-xs font-black uppercase italic leading-tight truncate">{pair.name || 'Sin Nombre'}</p>
        <p className="text-[9px] font-bold opacity-30 uppercase truncate mt-1">{pair.player1} / {pair.player2}</p>
      </div>
      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
        <GripVertical size={14} className="text-primary" />
      </div>
    </div>
  );
}

function ZoneDroppable({ zone, allPairs, onRemovePair, onDeleteZone }: { zone: Zone, allPairs: Pair[], onRemovePair: (id: string) => void, onDeleteZone?: () => void }) {
  const { isOver, setNodeRef } = useDroppable({
    id: zone.id,
  });

  return (
    <div
      ref={setNodeRef}
      className={clsx(
        "glass p-8 rounded-[3rem] border transition-all h-[400px] flex flex-col group/zone",
        isOver ? "border-primary bg-primary/10 scale-[1.02]" : "border-white/5"
      )}
    >
      <div className="flex justify-between items-center mb-6">
        <h4 className="text-xl font-black uppercase italic tracking-tighter">{zone.name}</h4>
        {onDeleteZone && (
          <button
            onClick={onDeleteZone}
            className="p-2 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover/zone:opacity-100"
            title="Borrar Zona"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
        {zone.pairs.map(pId => {
          const pair = allPairs.find(x => x.id === pId);
          if (!pair) return null;
          return (
            <div key={pId} className="bg-white/5 border border-white/5 rounded-2xl p-4 flex justify-between items-center group/pair">
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase truncate">{pair.name}</p>
                <p className="text-[8px] opacity-30 truncate">{pair.player1} / {pair.player2}</p>
              </div>
              <button onClick={() => onRemovePair(pId)} className="p-2 text-error/20 hover:text-error hover:bg-error/10 rounded-xl transition-all opacity-0 group-hover/pair:opacity-100">
                <X size={14} />
              </button>
            </div>
          );
        })}
        {zone.pairs.length === 0 && (
          <div className="h-full flex items-center justify-center border-2 border-dashed border-white/5 rounded-[2rem] opacity-20 text-[9px] font-black uppercase text-center p-6">
            Arrastra parejas aquí
          </div>
        )}
      </div>
    </div>
  );
}
function MatchRow({ match, pairs, onUpdate }: { match: Match, pairs: Pair[], onUpdate: (data: Partial<Match>) => void }) {
  const p1 = pairs.find(p => p.id === match.p1);
  const p2 = pairs.find(p => p.id === match.p2);

  const sets = (match.score || '').split(/[\s,]+/).filter(s => s.includes('-'));
  const parsedSets = [0, 1, 2].map(i => {
    const [g1, g2] = (sets[i] || '-').split('-');
    return { g1: g1 === '-' ? '' : g1, g2: g2 === '-' ? '' : g2 };
  });

  let p1Sets = 0;
  let p2Sets = 0;
  parsedSets.forEach(s => {
    const g1 = parseInt(s.g1);
    const g2 = parseInt(s.g2);
    if (!isNaN(g1) && !isNaN(g2)) {
      if (g1 > g2) p1Sets++;
      else if (g2 > g1) p2Sets++;
    }
  });

  const p1Wins = p1Sets > p2Sets;
  const p2Wins = p2Sets > p1Sets;

  const updateGame = (setIdx: number, playerIdx: 1 | 2, val: string) => {
    // Solo permitir números
    if (val !== '' && !/^\d+$/.test(val)) return;

    // Si meten más de 1 número, agarrar el último
    const cleanVal = val.slice(-1);

    const newParsed = [...parsedSets];
    if (playerIdx === 1) newParsed[setIdx].g1 = cleanVal;
    else newParsed[setIdx].g2 = cleanVal;

    const newScoreString = newParsed
      .map(s => (s.g1 || s.g2) ? `${s.g1 || '0'}-${s.g2 || '0'}` : '-')
      .filter(s => s !== '-')
      .join(' ');

    onUpdate({ score: newScoreString, status: newScoreString.length > 0 ? 'finished' : 'pending' });
  };

  return (
    <div className={clsx(
      "border rounded-[1rem] overflow-hidden shadow-lg transition-all",
      (p1Wins || p2Wins) ? "border-primary/40 shadow-primary/10" : "border-primary/20 bg-primary/5"
    )}>
      {/* Header Numbers */}
      <div className="flex bg-black/40 border-b border-primary/20">
        <div className="flex-1 py-1 px-4"></div>
        <div className="w-12 text-center text-[10px] font-black uppercase tracking-widest text-primary/60 py-1.5 border-l border-primary/20">1</div>
        <div className="w-12 text-center text-[10px] font-black uppercase tracking-widest text-primary/60 py-1.5 border-l border-primary/20">2</div>
        <div className="w-12 text-center text-[10px] font-black uppercase tracking-widest text-primary/60 py-1.5 border-l border-primary/20">3</div>
      </div>

      {/* Player 1 Row */}
      <div className="flex border-b border-primary/10">
        <div className={clsx(
          "flex-1 py-3 px-4 flex flex-col justify-center min-w-0 transition-all border-l-4",
          p1Wins ? "bg-primary/20 border-primary" : "bg-primary/10 border-transparent",
          p2Wins ? "opacity-40" : ""
        )}>
          <p className="text-[11px] font-black uppercase truncate tracking-tight text-white">{p1?.name || '??'}</p>
          <p className="text-[8px] opacity-50 font-bold uppercase truncate text-white">{p1?.player1} / {p1?.player2}</p>
        </div>
        {[0, 1, 2].map(i => {
          const g1 = parseInt(parsedSets[i].g1);
          const g2 = parseInt(parsedSets[i].g2);
          const wonSet = !isNaN(g1) && !isNaN(g2) && g1 > g2;
          return (
            <div key={`p1-s${i}`} className={clsx("w-12 border-l border-primary/20", p1Wins ? "bg-primary/20" : "bg-primary/10")}>
              <input
                type="text"
                inputMode="numeric"
                value={parsedSets[i].g1}
                onChange={(e) => updateGame(i, 1, e.target.value)}
                onFocus={e => e.target.select()}
                className={clsx(
                  "w-full h-full py-3 bg-transparent text-center text-lg font-black outline-none transition-all placeholder:text-white/20",
                  wonSet ? "text-primary focus:bg-primary/40" : "text-white focus:bg-primary/30"
                )}
                placeholder=""
              />
            </div>
          );
        })}
      </div>

      {/* Player 2 Row */}
      <div className="flex">
        <div className={clsx(
          "flex-1 py-3 px-4 flex flex-col justify-center min-w-0 transition-all border-l-4",
          p2Wins ? "bg-primary/20 border-primary" : "bg-primary/5 border-transparent",
          p1Wins ? "opacity-40" : ""
        )}>
          <p className="text-[11px] font-black uppercase truncate tracking-tight text-white">{p2?.name || '??'}</p>
          <p className="text-[8px] opacity-50 font-bold uppercase truncate text-white">{p2?.player1} / {p2?.player2}</p>
        </div>
        {[0, 1, 2].map(i => {
          const g1 = parseInt(parsedSets[i].g1);
          const g2 = parseInt(parsedSets[i].g2);
          const wonSet = !isNaN(g1) && !isNaN(g2) && g2 > g1;
          return (
            <div key={`p2-s${i}`} className={clsx("w-12 border-l border-primary/20", p2Wins ? "bg-primary/20" : "bg-primary/5")}>
              <input
                type="text"
                inputMode="numeric"
                value={parsedSets[i].g2}
                onChange={(e) => updateGame(i, 2, e.target.value)}
                onFocus={e => e.target.select()}
                className={clsx(
                  "w-full h-full py-3 bg-transparent text-center text-lg font-black outline-none transition-all placeholder:text-white/20",
                  wonSet ? "text-primary focus:bg-primary/40" : "text-white focus:bg-primary/30"
                )}
                placeholder=""
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function calculateStandings(zone: Zone, allPairs: Pair[]) {
  const standingsMap: Record<string, { pj: number, pts: number, sf: number, sc: number, gf: number, gc: number }> = {};

  zone.pairs.forEach(pId => {
    standingsMap[pId] = { pj: 0, pts: 0, sf: 0, sc: 0, gf: 0, gc: 0 };
  });

  zone.matches.forEach(m => {
    if (m.status === 'finished' && m.score) {
      const score = parseScore(m.score);
      if (!score) return;

      const { p1Sets, p2Sets, p1Games, p2Games } = score;

      // Update P1
      standingsMap[m.p1].pj += 1;
      standingsMap[m.p1].sf += p1Sets;
      standingsMap[m.p1].sc += p2Sets;
      standingsMap[m.p1].gf += p1Games;
      standingsMap[m.p1].gc += p2Games;

      // Update P2
      standingsMap[m.p2].pj += 1;
      standingsMap[m.p2].sf += p2Sets;
      standingsMap[m.p2].sc += p1Sets;
      standingsMap[m.p2].gf += p2Games;
      standingsMap[m.p2].gc += p1Games;

      if (p1Sets > p2Sets) standingsMap[m.p1].pts += 3;
      else if (p2Sets > p1Sets) standingsMap[m.p2].pts += 3;
    }
  });

  return Object.entries(standingsMap)
    .map(([id, stats]) => ({
      id,
      name: allPairs.find(p => p.id === id)?.name || '??',
      ...stats
    }))
    .sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      if ((b.sf - b.sc) !== (a.sf - a.sc)) return (b.sf - b.sc) - (a.sf - a.sc);
      return (b.gf - b.gc) - (a.gf - a.gc);
    });
}

function parseScore(scoreStr: string) {
  if (!scoreStr) return { p1Sets: 0, p2Sets: 0, p1Games: 0, p2Games: 0, sets: [] };
  try {
    const setsStrings = (scoreStr || '').split(/[\s,]+/).filter(s => s.includes('-'));
    const sets = setsStrings.map(s => {
      const [g1, g2] = s.split('-').map(Number);
      return { g1, g2 };
    });

    let p1Sets = 0;
    let p2Sets = 0;
    let p1Games = 0;
    let p2Games = 0;

    sets.forEach(({ g1, g2 }) => {
      if (isNaN(g1) || isNaN(g2)) return;
      p1Games += g1;
      p2Games += g2;
      if (g1 > g2) p1Sets += 1;
      else if (g2 > g1) p2Sets += 1;
    });

    return { p1Sets, p2Sets, p1Games, p2Games, sets };
  } catch (e) {
    return null;
  }
}
