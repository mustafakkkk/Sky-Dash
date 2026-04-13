import React from 'react';
import { motion } from 'motion/react';
import { RotateCcw, Home } from 'lucide-react';

interface GameOverScreenProps {
  t: any;
  score: number;
  stats: any;
  startGame: () => void;
  goToMenu: () => void;
  playClickSound: () => void;
}

const GameOverScreen = React.memo(({ t, score, stats, startGame, goToMenu, playClickSound }: GameOverScreenProps) => (
  <motion.div
    key="gameover"
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 1.05 }}
    className="flex flex-col items-center gap-8 p-10 bg-slate-900/80 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 shadow-2xl max-w-sm w-full mx-4 text-center will-change-transform"
  >
    <div className="flex flex-col gap-2">
      <h2 className="text-4xl font-black text-red-500 tracking-tight">{t.gameOver}</h2>
      <p className="text-slate-400 font-medium">{t.greatJob}</p>
    </div>

    <div className="flex flex-col gap-6 w-full">
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-slate-800/50 rounded-3xl border border-white/5">
          <div className="text-xs text-slate-500 uppercase font-bold mb-1">{t.score}</div>
          <div className="text-3xl font-black text-white">{score}</div>
        </div>
        <div className="p-4 bg-slate-800/50 rounded-3xl border border-white/5">
          <div className="text-xs text-slate-500 uppercase font-bold mb-1">{t.highScore}</div>
          <div className="text-3xl font-black text-amber-400">{stats.highScore}</div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <button
          onClick={() => { playClickSound(); startGame(); }}
          className="flex items-center justify-center gap-3 w-full py-4 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-500/20"
        >
          <RotateCcw className="w-5 h-5" />
          <span>{t.tryAgain}</span>
        </button>
        <button
          onClick={() => { playClickSound(); goToMenu(); }}
          className="flex items-center justify-center gap-3 w-full py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl transition-all"
        >
          <Home className="w-5 h-5" />
          <span>{t.home}</span>
        </button>
      </div>
    </div>
  </motion.div>
));

export default GameOverScreen;
