import React from 'react';
import { motion } from 'motion/react';
import { ListTodo, MousePointer2, Keyboard, Smartphone, Shield, Zap, Magnet, Timer, Star, Flame } from 'lucide-react';

interface InstructionsScreenProps {
  t: any;
  setGameState: (state: any) => void;
  playClickSound: () => void;
}

const InstructionsScreen = React.memo(({ t, setGameState, playClickSound }: InstructionsScreenProps) => (
  <motion.div
    key="instructions"
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 1.05 }}
    className="flex flex-col items-center gap-6 p-8 bg-slate-900/90 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-2xl max-w-md w-full mx-4 max-h-[85vh] overflow-hidden will-change-transform"
  >
    <div className="flex items-center gap-3">
      <ListTodo className="w-8 h-8 text-indigo-400" />
      <h2 className="text-3xl font-black tracking-tight">{t.instructions}</h2>
    </div>

    <div className="w-full overflow-y-auto pr-2 space-y-6 custom-scrollbar">
      <section className="space-y-3">
        <h3 className="text-sm font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
          <MousePointer2 className="w-4 h-4" />
          {t.controls}
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-slate-800/50 rounded-2xl border border-white/5 flex flex-col items-center gap-2 text-center">
            <Smartphone className="w-6 h-6 text-slate-400" />
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">{t.touchControls}</span>
            <p className="text-[9px] text-slate-500 leading-tight">{t.touchDesc}</p>
          </div>
          <div className="p-3 bg-slate-800/50 rounded-2xl border border-white/5 flex flex-col items-center gap-2 text-center">
            <Keyboard className="w-6 h-6 text-slate-400" />
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">{t.keyboardControls}</span>
            <p className="text-[9px] text-slate-500 leading-tight">{t.keyboardDesc}</p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-black text-pink-400 uppercase tracking-widest flex items-center gap-2">
          <Zap className="w-4 h-4" />
          {t.powerups}
        </h3>
        <div className="grid grid-cols-1 gap-2">
          {[
            { icon: <Shield className="w-4 h-4 text-emerald-400" />, name: t.powerupNames.shield, desc: t.powerupDescs.shield },
            { icon: <Magnet className="w-4 h-4 text-indigo-400" />, name: t.powerupNames.magnet, desc: t.powerupDescs.magnet },
            { icon: <Timer className="w-4 h-4 text-amber-400" />, name: t.powerupNames.slowmo, desc: t.powerupDescs.slowmo },
            { icon: <Star className="w-4 h-4 text-yellow-400" />, name: t.powerupNames.doublePoints, desc: t.powerupDescs.doublePoints },
            { icon: <Flame className="w-4 h-4 text-orange-500" />, name: t.powerupNames.fireAsteroid, desc: t.powerupDescs.fireAsteroid }
          ].map((p, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-xl border border-white/5">
              <div className="p-2 bg-slate-700 rounded-lg">{p.icon}</div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white">{p.name}</span>
                <span className="text-[9px] text-slate-500 leading-tight">{p.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-black text-amber-400 uppercase tracking-widest flex items-center gap-2">
          <Star className="w-4 h-4" />
          {t.objective}
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed bg-slate-800/30 p-4 rounded-2xl border border-white/5 italic">
          {t.objectiveDesc}
        </p>
      </section>
    </div>

    <button
      onClick={() => { playClickSound(); setGameState('SETTINGS'); }}
      className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl transition-all mt-2"
    >
      {t.back}
    </button>
  </motion.div>
));

export default InstructionsScreen;
