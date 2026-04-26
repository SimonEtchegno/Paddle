import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, Trophy, Users, Globe, Layout, Save, Clock } from 'lucide-react';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TutorialModal({ isOpen, onClose }: TutorialModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-xl"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-4xl max-h-[90vh] glass rounded-[3rem] border border-white/10 overflow-hidden flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                  <BookOpen size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-tighter italic">Manual del Admin</h2>
                  <p className="text-xs font-bold uppercase tracking-widest opacity-40 text-primary">Gestión de Torneos</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all border border-white/5"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-8 overflow-y-auto custom-scrollbar space-y-12">
              
              {/* Sección 1 */}
              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/5 rounded-xl border border-white/10"><Trophy size={18} className="text-primary"/></div>
                  <h3 className="text-lg font-black uppercase tracking-widest text-white">1. Crear y Publicar</h3>
                </div>
                <div className="pl-12 space-y-3 text-sm opacity-60 font-medium">
                  <p>• Completa el formulario con el Nombre, Fechas, Categoría y Precio.</p>
                  <p>• Al tocar "Publicar Torneo", se crea en estado <strong>Visible</strong> y con las <strong>Inscripciones Abiertas</strong> por defecto.</p>
                </div>
              </section>

              {/* Sección 2 */}
              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/5 rounded-xl border border-white/10"><Globe size={18} className="text-primary"/></div>
                  <h3 className="text-lg font-black uppercase tracking-widest text-white">2. Botones Rápidos (Lista de Torneos)</h3>
                </div>
                <div className="pl-12 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                    <div className="flex items-center gap-2 text-green-400 font-bold text-[10px] uppercase tracking-widest">
                      <Users size={14} /> Botón Usuarios
                    </div>
                    <p className="text-xs opacity-60">Controla las inscripciones. Si está verde, la gente puede anotarse. Si está gris, dice "Inscripciones Cerradas".</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                    <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-widest">
                      <Globe size={14} /> Botón Mundito
                    </div>
                    <p className="text-xs opacity-60">Controla la visibilidad. Si está verde, es Público. Si está gris, es Privado (nadie lo ve excepto vos).</p>
                  </div>
                </div>
              </section>

              {/* Sección 3 */}
              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/5 rounded-xl border border-white/10"><Layout size={18} className="text-primary"/></div>
                  <h3 className="text-lg font-black uppercase tracking-widest text-white">3. Gestión Pro (Zonas y Partidos)</h3>
                </div>
                <div className="pl-12 space-y-6">
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-primary">A. Cargar Parejas</h4>
                    <p className="text-sm opacity-60 font-medium">En la pestaña "Config", tocá <strong>Importar Inscriptos Reales</strong> para traer a los que pagaron por la web. Si alguien pagó en el club, agregalo a mano en la pestaña "Parejas".</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-primary">B. Armar Zonas</h4>
                    <p className="text-sm opacity-60 font-medium">En la pestaña "Zonas", <strong>arrastrá</strong> las parejas desde la Lista de Espera (arriba) hacia las zonas (A, B, C...) con el mouse o el dedo.</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-primary">C. Scoreboard y Cuadro Final</h4>
                    <p className="text-sm opacity-60 font-medium">Agregá partidos dentro de cada zona. Hacé clic en los números grandes para anotar los games (ej: 6-4). Los ganadores se marcan solos. Luego pasá a "Llave Final" para armar los cruces eliminatorios.</p>
                  </div>
                </div>
              </section>

              {/* Sección 4 */}
              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/5 rounded-xl border border-white/10"><Save size={18} className="text-primary"/></div>
                  <h3 className="text-lg font-black uppercase tracking-widest text-white">4. Guardado Seguro</h3>
                </div>
                <div className="pl-12 bg-primary/10 border border-primary/20 rounded-2xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10"><Clock size={100} /></div>
                  <ul className="space-y-3 text-sm font-medium relative z-10 text-primary/80">
                    <li className="flex items-start gap-2">
                      <strong className="text-primary mt-1">•</strong> 
                      <span><strong>Botón Verde:</strong> Siempre tocá "Guardar Cambios" arriba a la derecha antes de salir de la pantalla negra para subir todo a la nube.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <strong className="text-primary mt-1">•</strong> 
                      <span><strong>El Relojito (Backups):</strong> Si te equivocás feo, tocá el ícono del reloj al lado del botón de guardar. Ahí podés "viajar en el tiempo" y cargar una versión vieja de tu torneo.</span>
                    </li>
                  </ul>
                </div>
              </section>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
