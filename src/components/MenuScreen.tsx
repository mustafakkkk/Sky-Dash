import React from 'react';
import { motion } from 'motion/react';
import { Play, Trophy, ListTodo, ShoppingBag, Bot, Settings, Calendar, Moon, Star, Sparkles, Coins, Inbox, Building2, Factory } from 'lucide-react';

interface MenuScreenProps {
  t: any;
  isEid: boolean;
  stats: any;
  startGame: () => void;
  setIsLeaderboardOpen: (open: boolean) => void;
  setGameState: (state: any) => void;
  playClickSound: () => void;
  setIsAIModalOpen: (open: boolean) => void;
  setIsForgeOpen: (open: boolean) => void;
  setIsEconomyHubOpen: (open: boolean) => void;
  setIsSkyPassOpen: (open: boolean) => void;
}

const MenuScreen = React.memo(({ t, isEid, stats, startGame, setIsLeaderboardOpen, setGameState, playClickSound, setIsAIModalOpen, setIsForgeOpen, setIsEconomyHubOpen, setIsSkyPassOpen }: MenuScreenProps) => (
  <motion.div
    key="menu"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.95 }}
    className={`flex flex-col items-center gap-8 p-8 ${isEid ? 'bg-slate-900/40 border-amber-500/30' : 'bg-slate-900/50 border-white/10'} backdrop-blur-xl rounded-3xl border shadow-2xl max-w-md w-full mx-4 relative will-change-transform`}
  >
    <div className="flex flex-col items-center gap-2 relative w-full">
      <motion.div
        animate={stats.animationsEnabled ? { rotate: [0, 10, -10, 0] } : {}}
        transition={{ repeat: Infinity, duration: 4 }}
        className={`p-4 ${isEid ? 'bg-amber-500' : 'bg-indigo-500'} rounded-2xl shadow-lg ${isEid ? 'shadow-amber-500/20' : 'shadow-indigo-500/20'}`}
      >
        {isEid ? (
          <Moon className="w-12 h-12 text-white fill-white" />
        ) : (
          <Star className="w-12 h-12 text-white fill-white" />
        )}
      </motion.div>
      <h1 className="text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-500 mt-4 text-center">
        {t.gameTitle}
      </h1>
      {isEid && (
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center mt-2"
        >
          <div className="flex items-center gap-2 text-amber-400 font-bold text-lg animate-pulse">
            <Moon className="w-5 h-5 fill-current" />
            <span>{t.eidMubarak}</span>
            <Sparkles className="w-5 h-5 fill-current" />
          </div>
        </motion.div>
      )}
      <p className="text-slate-400 font-medium tracking-wide uppercase text-xs">{t.skyDashAdventure}</p>
    </div>

    <div className="flex flex-col gap-4 w-full">
      <button
        onClick={() => { playClickSound(); startGame(); }}
        className={`group relative flex items-center justify-center gap-3 w-full py-4 ${isEid ? 'bg-amber-400 text-slate-950' : 'bg-white text-slate-950'} font-bold rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-xl shadow-white/10`}
      >
        <Play className={`w-6 h-6 fill-current ${stats.language === 'ar' ? 'rotate-180' : ''}`} />
        <span className="text-xl">{t.play}</span>
      </button>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => { playClickSound(); setIsEconomyHubOpen(true); }}
          className="flex flex-col items-center justify-center gap-1 py-3 bg-indigo-600/20 hover:bg-indigo-600/30 rounded-2xl transition-colors border border-indigo-500/30"
        >
          <Building2 className="w-5 h-5 text-indigo-400" />
          <span className="text-xs font-bold">{stats.language === 'ar' ? 'مركز الاقتصاد' : 'Economy Hub'}</span>
        </button>
        <button
          onClick={() => { playClickSound(); setIsForgeOpen(true); }}
          className="flex flex-col items-center justify-center gap-1 py-3 bg-purple-600/20 hover:bg-purple-600/30 rounded-2xl transition-colors border border-purple-500/30"
        >
          <Factory className="w-5 h-5 text-purple-400" />
          <span className="text-xs font-bold">{stats.language === 'ar' ? 'مصنع النجوم' : 'Star Forge'}</span>
        </button>
      </div>

      <button
        onClick={() => { playClickSound(); setIsSkyPassOpen(true); }}
        className="group relative flex items-center justify-center gap-3 w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-black rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-amber-500/20"
      >
        <Trophy className="w-5 h-5" />
        <span>{stats.language === 'ar' ? 'سكاي باس' : 'Sky Pass'}</span>
        <div className="bg-slate-950 text-white text-[10px] px-2 py-0.5 rounded-full">
          LVL {stats.skyPass.level}
        </div>
      </button>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => { playClickSound(); setGameState('WEEKLY_TASKS'); }}
          className="flex flex-col items-center justify-center gap-1 py-3 bg-slate-800 hover:bg-slate-700 rounded-2xl transition-colors border border-white/5"
        >
          <Trophy className="w-5 h-5 text-indigo-400" />
          <span className="text-xs font-semibold">{t.weeklyTasks}</span>
        </button>
        <button
          onClick={() => { playClickSound(); setGameState('DAILY_TASKS'); }}
          className="flex flex-col items-center justify-center gap-1 py-3 bg-slate-800 hover:bg-slate-700 rounded-2xl transition-colors border border-white/5"
        >
          <ListTodo className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-semibold">{t.dailyTasks}</span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => { playClickSound(); setGameState('STORE'); }}
          className="flex flex-col items-center justify-center gap-1 py-3 bg-slate-800 hover:bg-slate-700 rounded-2xl transition-colors border border-white/5"
        >
          <ShoppingBag className="w-5 h-5 text-pink-400" />
          <span className="text-xs font-semibold">{t.store}</span>
        </button>
        <button
          onClick={() => { playClickSound(); setGameState('INSTRUCTIONS'); }}
          className="flex flex-col items-center justify-center gap-1 py-3 bg-slate-800 hover:bg-slate-700 rounded-2xl transition-colors border border-white/5"
        >
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span className="text-xs font-semibold">{t.instructionsBtn}</span>
        </button>
      </div>

      <button
        onClick={() => { playClickSound(); setIsAIModalOpen(true); }}
        className="flex items-center justify-center gap-3 w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-500/20"
      >
        <Bot className="w-5 h-5" />
        <span className="text-sm">{t.aiAssistant}</span>
      </button>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => { playClickSound(); setGameState('SETTINGS'); }}
          className="flex items-center justify-center gap-2 py-3 bg-slate-800 hover:bg-slate-700 rounded-2xl transition-colors border border-white/5"
        >
          <Settings className="w-5 h-5 text-slate-400" />
          <span className="text-xs font-semibold">{t.settings}</span>
        </button>
        <div className="flex items-center justify-center gap-2 py-3 bg-slate-800/50 rounded-2xl border border-white/5">
          <Trophy className="w-5 h-5 text-amber-400" />
          <span className="text-xs font-bold">{stats.highScore}</span>
        </div>
      </div>

      <button
        onClick={() => { playClickSound(); setGameState('EVENTS'); }}
        className={`flex items-center justify-center gap-2 py-3 ${isEid ? 'bg-amber-500/20 border-amber-500/30 text-amber-400' : 'bg-slate-800 border-white/5 text-indigo-400'} hover:bg-slate-700 rounded-2xl transition-colors border w-full`}
      >
        <Calendar className="w-5 h-5" />
        <span className="text-xs font-bold uppercase tracking-wider">{t.events}</span>
        {isEid && <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-ping" />}
      </button>
    </div>

    <div className="text-slate-500 text-[10px] uppercase tracking-widest font-bold">
      {t.versionInfo}
    </div>
  </motion.div>
));

export default MenuScreen;
