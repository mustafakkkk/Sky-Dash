import React from 'react';
import { motion } from 'motion/react';
import { Zap, VolumeX, Volume2, ZapOff, Star, ListTodo } from 'lucide-react';
import { GraphicsQuality, Language } from '../types';

interface SettingsScreenProps {
  t: any;
  stats: any;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  setLanguage: (lang: Language) => void;
  toggleAnimations: () => void;
  setGraphicsQuality: (quality: GraphicsQuality) => void;
  setGameState: (state: any) => void;
  playClickSound: () => void;
}

const SettingsScreen = React.memo(({ t, stats, isMuted, setIsMuted, setLanguage, toggleAnimations, setGraphicsQuality, setGameState, playClickSound }: SettingsScreenProps) => (
  <motion.div
    key="settings"
    initial={{ opacity: 0, x: 10 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -10 }}
    className="flex flex-col items-center gap-8 p-8 bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl max-w-md w-full mx-4 will-change-transform"
  >
    <h2 className="text-3xl font-bold">{t.settings}</h2>
    
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-col gap-2 p-4 bg-slate-800 rounded-2xl">
        <div className="flex items-center gap-3 mb-2">
          <Zap className="text-pink-400 w-5 h-5" />
          <span className="font-semibold">{t.graphicsQuality}</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {(['very-low', 'low', 'medium', 'high'] as GraphicsQuality[]).map((q) => (
            <button
              key={q}
              onClick={() => setGraphicsQuality(q)}
              className={`py-2 px-1 rounded-xl text-[10px] font-bold transition-all border ${
                stats.graphicsQuality === q
                  ? 'bg-pink-500 border-pink-400 text-white shadow-lg shadow-pink-500/20'
                  : 'bg-slate-700 border-white/5 text-slate-400 hover:bg-slate-600'
              }`}
            >
              {(t as any)[q] || (q === 'very-low' ? t.veryLow : q)}
            </button>
          ))}
        </div>
        <p className="text-[9px] text-slate-500 mt-1 text-center italic">
          {stats.graphicsQuality === 'very-low' && t.veryLowDesc}
          {stats.graphicsQuality === 'low' && t.lowDesc}
          {stats.graphicsQuality === 'medium' && t.mediumDesc}
          {stats.graphicsQuality === 'high' && t.highDesc}
        </p>
      </div>

      <div className="flex items-center justify-between p-4 bg-slate-800 rounded-2xl">
        <div className="flex items-center gap-3">
          {isMuted ? <VolumeX className="text-red-400" /> : <Volume2 className="text-indigo-400" />}
          <span className="font-semibold">{t.sound}</span>
        </div>
        <button
          onClick={() => { playClickSound(); setIsMuted(!isMuted); }}
          className={`w-12 h-6 rounded-full transition-colors relative ${isMuted ? 'bg-slate-600' : 'bg-indigo-500'}`}
        >
          <motion.div
            animate={{ x: isMuted ? 2 : 26 }}
            className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-sm"
          />
        </button>
      </div>

      <div className="flex items-center justify-between p-4 bg-slate-800 rounded-2xl">
        <div className="flex items-center gap-3">
          {stats.animationsEnabled ? <Zap className="text-amber-400" /> : <ZapOff className="text-slate-400" />}
          <div className="flex flex-col">
            <span className="font-semibold">{t.animations}</span>
            <span className="text-[10px] text-slate-500">{t.powerSaving}</span>
          </div>
        </div>
        <button
          onClick={toggleAnimations}
          className={`w-12 h-6 rounded-full transition-colors relative ${!stats.animationsEnabled ? 'bg-slate-600' : 'bg-amber-500'}`}
        >
          <motion.div
            animate={{ x: !stats.animationsEnabled ? 2 : 26 }}
            className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-sm"
          />
        </button>
      </div>

      <div className="flex flex-col gap-2 p-4 bg-slate-800 rounded-2xl">
        <div className="flex items-center gap-3 mb-2">
          <Star className="text-indigo-400 w-5 h-5" />
          <span className="font-semibold">{t.language}</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {(['ar', 'en'] as Language[]).map((l) => (
            <button
              key={l}
              onClick={() => setLanguage(l)}
              className={`py-2 px-1 rounded-xl text-xs font-bold transition-all border ${
                stats.language === l
                  ? 'bg-indigo-500 border-indigo-400 text-white shadow-lg shadow-indigo-500/20'
                  : 'bg-slate-700 border-white/5 text-slate-400 hover:bg-slate-600'
              }`}
            >
              {l === 'ar' ? t.arabic : t.english}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => { playClickSound(); setGameState('INSTRUCTIONS'); }}
        className="flex items-center justify-center gap-3 p-4 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 rounded-2xl transition-all group"
      >
        <ListTodo className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
        <span className="font-bold text-indigo-100">{t.instructionsBtn}</span>
      </button>
    </div>

    <button
      onClick={() => { playClickSound(); setGameState('MENU'); }}
      className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl transition-all"
    >
      {t.back}
    </button>
  </motion.div>
));

export default SettingsScreen;
