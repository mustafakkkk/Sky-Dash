import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trophy, Medal, Star, Coins, User, Clock, TrendingUp, TrendingDown, Minus, Globe } from 'lucide-react';
import { LeaderboardEntry, League } from '../types';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  leaderboard: LeaderboardEntry[];
  t: any;
  countdown: string;
  currentLeague: League;
  season: number;
}

export default function LeaderboardModal({ isOpen, onClose, leaderboard, t, countdown, currentLeague, season }: LeaderboardModalProps) {
  // Sort leaderboard by score descending
  const sortedLeaderboard = useMemo(() => [...leaderboard].sort((a, b) => b.score - a.score), [leaderboard]);

  const getRankTrend = (entry: LeaderboardEntry, currentRank: number) => {
    if (!entry.previousRank) return <Minus className="w-3 h-3 text-slate-500" />;
    if (currentRank < entry.previousRank) return <TrendingUp className="w-3 h-3 text-emerald-400" />;
    if (currentRank > entry.previousRank) return <TrendingDown className="w-3 h-3 text-rose-400" />;
    return <Minus className="w-3 h-3 text-slate-500" />;
  };

  const formatLastActive = (timestamp?: number) => {
    if (!timestamp) return t.offline || 'Offline';
    const diff = Date.now() - timestamp;
    if (diff < 60000) return <span className="text-emerald-400 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /> {t.online || 'Online'}</span>;
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ${t.ago || 'ago'}`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ${t.ago || 'ago'}`;
    return `${Math.floor(hours / 24)}d ${t.ago || 'ago'}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            className="bg-slate-900 w-full max-w-2xl h-[85vh] rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col relative"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/20 rounded-xl">
                  <Globe className="text-indigo-400 w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-xl text-white">{t[`${currentLeague}League`] || currentLeague}</h2>
                    <span className="text-[10px] bg-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30 font-bold uppercase tracking-wider">
                      {t.season || 'Season'} {season}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Clock className="w-3 h-3 text-amber-500" />
                    <span>{t.leaderboardResetIn} <span className="text-amber-400 font-bold">{countdown}</span></span>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-400"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Rewards Info */}
            <div className="px-6 py-3 bg-indigo-500/10 border-b border-white/5 flex items-center justify-around">
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-1 text-amber-400 font-bold text-sm">
                  <Medal className="w-4 h-4" /> {t.firstPlace}
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1 text-yellow-500"><Coins className="w-3 h-3 fill-yellow-500" /> 2,000</span>
                </div>
              </div>
              <div className="flex flex-col items-center gap-1 opacity-80">
                <div className="flex items-center gap-1 text-slate-300 font-bold text-sm">
                  <Medal className="w-4 h-4" /> {t.secondPlace}
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1 text-yellow-500"><Coins className="w-3 h-3 fill-yellow-500" /> 1,500</span>
                </div>
              </div>
              <div className="flex flex-col items-center gap-1 opacity-60">
                <div className="flex items-center gap-1 text-amber-700 font-bold text-sm">
                  <Medal className="w-4 h-4" /> {t.thirdPlace}
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1 text-yellow-500"><Coins className="w-3 h-3 fill-yellow-500" /> 1,000</span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
              {sortedLeaderboard.map((entry, index) => {
                const rank = index + 1;
                const isTop3 = rank <= 3;
                
                // Zone Logic
                let zoneLabel = '';
                let zoneColor = '';
                if (rank === 1) {
                  zoneLabel = t.promotionZone;
                  zoneColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                } else if (rank === 11) {
                  zoneLabel = t.stayZone;
                  zoneColor = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
                } else if (rank === 31) {
                  zoneLabel = t.relegationZone;
                  zoneColor = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
                }

                return (
                  <React.Fragment key={entry.id}>
                    {zoneLabel && (
                      <div className={`flex items-center gap-2 px-4 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest mb-2 mt-4 ${zoneColor}`}>
                        <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                        {zoneLabel}
                      </div>
                    )}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.01 }}
                      className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                        entry.isPlayer 
                          ? 'bg-indigo-500/20 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.2)]' 
                          : isTop3 
                            ? 'bg-slate-800/60 border-white/10' 
                            : 'bg-slate-800/30 border-white/5 hover:border-white/10'
                      }`}
                    >
                      {/* Rank & Trend */}
                      <div className="w-12 flex flex-col items-center justify-center">
                        <div className="font-black text-lg leading-none">
                          {rank === 1 ? <Medal className="text-amber-400 w-6 h-6" /> :
                           rank === 2 ? <Medal className="text-slate-300 w-6 h-6" /> :
                           rank === 3 ? <Medal className="text-amber-700 w-6 h-6" /> :
                           <span className="text-slate-400">{rank}</span>}
                        </div>
                        <div className="mt-1">
                          {getRankTrend(entry, rank)}
                        </div>
                      </div>

                      {/* Avatar & Name */}
                      <div className="flex-1 flex items-center gap-3">
                        <div className="relative">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 ${
                            entry.isPlayer ? 'bg-indigo-500 border-indigo-300' : 'bg-slate-700 border-slate-600'
                          } shadow-lg`}>
                            {entry.avatar ? (
                              <span className="text-2xl">{entry.avatar}</span>
                            ) : (
                              <User className="w-6 h-6 text-white/50" />
                            )}
                          </div>
                          {entry.country && (
                            <div className="absolute -bottom-1 -right-1 text-sm bg-slate-900 rounded-md px-0.5 border border-white/10">
                              {entry.country}
                            </div>
                          )}
                        </div>
                        <div className="overflow-hidden">
                          <div className="flex items-center gap-2">
                            <span className={`font-bold truncate ${entry.isPlayer ? 'text-indigo-300' : 'text-slate-200'}`}>
                              {entry.name}
                            </span>
                            {entry.isPlayer && (
                              <span className="text-[9px] bg-indigo-500 text-white px-1.5 py-0.5 rounded-md uppercase font-black shrink-0">
                                {t.you}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
                            <span className="uppercase tracking-wider">{entry.isPlayer ? t.player : t.bot}</span>
                            <span>•</span>
                            <span>{formatLastActive(entry.lastActive)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-4 sm:gap-8">
                        <div className="hidden sm:flex flex-col items-end">
                          <div className="flex items-center gap-1 text-amber-400 font-bold">
                            <Star className="w-3 h-3 fill-amber-400" />
                            <span className="text-xs">{entry.stars.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1 text-yellow-500 font-medium">
                            <Coins className="w-3 h-3 fill-yellow-500" />
                            <span className="text-[9px]">{entry.coins.toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="w-20 text-right">
                          <div className="text-[9px] text-slate-500 uppercase font-black tracking-tighter">{t.score}</div>
                          <div className={`text-lg font-black leading-none ${isTop3 ? 'text-amber-400' : 'text-white'}`}>
                            {entry.score.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </React.Fragment>
                );
              })}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-800/80 border-t border-white/10 text-center">
              <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">
                {t.leaderboardFooter || 'لوحة صدارة حية وتنافسية'}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
