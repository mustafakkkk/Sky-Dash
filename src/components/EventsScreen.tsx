import React from 'react';
import { motion } from 'motion/react';
import { Calendar, Moon, Clock, Shield, Sparkles } from 'lucide-react';

interface EventsScreenProps {
  t: any;
  isEid: boolean;
  eidCountdown: string | null;
  goToMenu: () => void;
  playClickSound: () => void;
}

const EventsScreen = React.memo(({ t, isEid, eidCountdown, goToMenu, playClickSound }: EventsScreenProps) => (
  <motion.div
    key="events"
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    className="flex flex-col items-center gap-6 p-6 bg-slate-900/90 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-2xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden will-change-transform"
  >
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-center gap-3">
        <Calendar className="w-8 h-8 text-amber-400" />
        <h2 className="text-3xl font-black tracking-tight">{t.events}</h2>
      </div>
      <p className="text-slate-500 text-xs font-medium uppercase tracking-widest">{t.activeEvents}</p>
    </div>

    <div className="w-full space-y-4 overflow-y-auto pr-2 custom-scrollbar">
      {isEid ? (
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="p-5 rounded-3xl bg-gradient-to-br from-amber-500/20 to-purple-500/20 border border-amber-500/30 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <Moon className="w-16 h-16 text-amber-400 fill-current" />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 bg-amber-500 text-slate-950 text-[10px] font-black rounded-full uppercase tracking-tighter">
                {t.activeEvents}
              </span>
              <div className="flex items-center gap-1 text-amber-400 text-[10px] font-bold">
                <Clock className="w-3 h-3" />
                <span>{t.eventEndsIn} {eidCountdown}</span>
              </div>
            </div>
            
            <h3 className="text-xl font-black text-amber-400 mb-1">{t.eidEventTitle}</h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">{t.eidEventDesc}</p>
            
            <div className="flex items-center gap-3 p-3 bg-slate-950/50 rounded-2xl border border-white/5">
              <div className="p-2 bg-amber-500/20 rounded-xl">
                <Shield className="w-5 h-5 text-amber-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white">{t.freeShield}</span>
                <span className="text-[10px] text-slate-500">{t.eidEventDesc}</span>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-slate-500 gap-4">
          <Calendar className="w-12 h-12 opacity-20" />
          <p className="text-sm font-medium">{t.noActiveEvents}</p>
        </div>
      )}
    </div>

    <button
      onClick={() => { playClickSound(); goToMenu(); }}
      className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl transition-all mt-2"
    >
      {t.back}
    </button>
  </motion.div>
));

export default EventsScreen;
