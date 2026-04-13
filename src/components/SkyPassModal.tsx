import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Star, Coins, Sparkles, Lock, CheckCircle2, X, Zap, Crown, Info, Gift, Gem } from 'lucide-react';
import { GameStats, SkyPass, SkyPassTier } from '../types';

interface SkyPassModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: GameStats;
  onUpdateStats: (updater: (prev: GameStats) => GameStats) => void;
  t: any;
}

const SkyPassModal: React.FC<SkyPassModalProps> = ({ isOpen, onClose, stats, onUpdateStats, t }) => {
  const skyPass = stats.skyPass;
  const language = stats.language;
  const [selectedTask, setSelectedTask] = React.useState<{ar: string, en: string} | null>(null);
  const [selectedReward, setSelectedReward] = React.useState<{ title: string, amount: string } | null>(null);

  const handleClaim = (tierLevel: number, isPro: boolean) => {
    onUpdateStats(prev => {
      const tierIndex = prev.skyPass.tiers.findIndex(t => t.level === tierLevel);
      if (tierIndex === -1) return prev;

      const tier = prev.skyPass.tiers[tierIndex];
      if (isPro && (!prev.skyPass.isPro || tier.isProClaimed)) return prev;
      if (!isPro && tier.isClaimed) return prev;
      if (prev.skyPass.level < tierLevel) return prev;

      const reward = isPro ? tier.proReward : tier.reward;
      if (!reward) return prev;

      let nextStats = { ...prev };
      
      // Apply reward
      if (reward.type === 'coins') nextStats.coins += reward.amount || 0;
      if (reward.type === 'stars') nextStats.totalStars += reward.amount || 0;
      if (reward.type === 'stardust') nextStats.forgeStats.stardust += reward.amount || 0;
      if (reward.type === 'powerup' && reward.id) {
        nextStats.fireAsteroids += reward.amount || 1;
      }
      if (reward.type === 'skin' && reward.id) {
        nextStats.forgeStats.skins = nextStats.forgeStats.skins.map(s => 
          s.id === reward.id ? { ...s, isUnlocked: true } : s
        );
      }
      if (reward.type === 'artifact' && reward.id) {
        nextStats.forgeStats.artifacts = nextStats.forgeStats.artifacts.map(a => 
          a.id === reward.id ? { ...a, isRestored: true } : a
        );
      }

      // Mark as claimed
      nextStats.skyPass.tiers = nextStats.skyPass.tiers.map((t, i) => 
        i === tierIndex ? { ...t, [isPro ? 'isProClaimed' : 'isClaimed']: true } : t
      );

      return nextStats;
    });
  };

  const handleBuyPro = () => {
    if (stats.coins < 4500 || skyPass.isPro) return;
    onUpdateStats(prev => ({
      ...prev,
      coins: prev.coins - 4500,
      skyPass: { ...prev.skyPass, isPro: true }
    }));
  };

  const currentTier = skyPass.tiers.find(t => t.level === skyPass.level) || skyPass.tiers[skyPass.tiers.length - 1];
  const nextTier = skyPass.tiers.find(t => t.level === skyPass.level + 1);
  const progress = nextTier ? (skyPass.exp / nextTier.requiredExp) * 100 : 100;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Task Tooltip Overlay */}
            <AnimatePresence>
              {selectedTask && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute inset-0 z-[110] flex items-center justify-center p-6"
                  onClick={() => setSelectedTask(null)}
                >
                  <div className="bg-slate-900/95 backdrop-blur-xl border border-indigo-500/50 p-8 rounded-[2rem] shadow-2xl max-w-sm w-full text-center relative">
                    <div className="w-16 h-16 bg-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-500/30">
                      <Info className="w-8 h-8 text-indigo-400" />
                    </div>
                    <h3 className="text-xl font-black text-white mb-2">
                      {language === 'ar' ? 'مهمة المستوى' : 'Tier Mission'}
                    </h3>
                    <p className="text-slate-300 font-medium leading-relaxed">
                      {language === 'ar' ? selectedTask.ar : selectedTask.en}
                    </p>
                    <button 
                      className="mt-6 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all"
                      onClick={() => setSelectedTask(null)}
                    >
                      {language === 'ar' ? 'فهمت' : 'Got it'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Header */}
            <div className="p-6 bg-gradient-to-br from-indigo-600 to-purple-700 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
                <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
              </div>
              
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <h2 className="text-3xl font-black text-white flex items-center gap-2">
                    <Trophy className="w-8 h-8" />
                    {language === 'ar' ? 'سكاي باس' : 'Sky Pass'}
                  </h2>
                  <p className="text-indigo-100 font-medium opacity-80">
                    {language === 'ar' ? `الموسم ${stats.season}` : `Season ${stats.season}`}
                  </p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="mt-8 relative z-10">
                <div className="flex justify-between text-xs font-bold text-white mb-2 uppercase tracking-wider">
                  <span>{language === 'ar' ? `المستوى ${skyPass.level}` : `Level ${skyPass.level}`}</span>
                  <span>{nextTier ? `${skyPass.exp} / ${nextTier.requiredExp} EXP` : 'MAX LEVEL'}</span>
                </div>
                <div className="h-4 bg-black/30 rounded-full overflow-hidden border border-white/10">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 shadow-[0_0_15px_rgba(251,191,36,0.5)]"
                  />
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {!skyPass.isPro && (
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="p-4 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30 rounded-2xl flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500 rounded-xl">
                      <Crown className="w-6 h-6 text-slate-950" />
                    </div>
                    <div>
                      <h3 className="font-bold text-amber-400">{language === 'ar' ? 'برو سكاي باس' : 'Pro Sky Pass'}</h3>
                      <p className="text-xs text-slate-400">{language === 'ar' ? 'افتح مكافآت حصرية ونادرة!' : 'Unlock exclusive and rare rewards!'}</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleBuyPro}
                    disabled={stats.coins < 4500}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap"
                  >
                    <Coins className="w-4 h-4" />
                    4,500
                  </button>
                </motion.div>
              )}

              <div className="space-y-3">
                {skyPass.tiers.map((tier) => (
                  <div 
                    key={tier.level}
                    className={`relative p-4 rounded-2xl border transition-all ${
                      skyPass.level >= tier.level 
                        ? 'bg-slate-800/50 border-indigo-500/30' 
                        : 'bg-slate-900/50 border-white/5 opacity-60'
                    }`}
                  >
                    <div className="absolute -left-2 top-1/2 -translate-y-1/2 flex flex-col gap-1 items-center">
                      <div className="w-8 h-8 bg-slate-800 border border-white/10 rounded-lg flex items-center justify-center font-black text-xs text-indigo-400 shadow-xl">
                        {tier.level}
                      </div>
                      <button 
                        onClick={() => setSelectedTask(tier.task || { ar: 'أكمل المهام لرفع المستوى', en: 'Complete tasks to level up' })}
                        className="p-1.5 bg-slate-800 border border-white/10 rounded-lg hover:bg-indigo-500/20 transition-colors group"
                        title={language === 'ar' ? 'شرح المهمة' : 'Task Info'}
                      >
                        <Info className="w-3 h-3 text-slate-500 group-hover:text-indigo-400" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 ml-6">
                      {/* Free Reward */}
                      <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                          {language === 'ar' ? 'مكافأة مجانية' : 'Free Reward'}
                        </span>
                        <div className="flex items-center justify-between bg-slate-950/50 p-2 rounded-xl border border-white/5">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                              {tier.reward.type === 'coins' && <Coins className="w-4 h-4 text-yellow-400" />}
                              {tier.reward.type === 'stars' && <Star className="w-4 h-4 text-amber-400" />}
                              {tier.reward.type === 'stardust' && <Sparkles className="w-4 h-4 text-purple-400" />}
                              {tier.reward.type === 'powerup' && <Zap className="w-4 h-4 text-indigo-400" />}
                            </div>
                            <span className="text-xs font-bold text-white">
                              {tier.reward.amount ? `${tier.reward.amount}` : '1'}
                            </span>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                const label = tier.reward.type === 'coins' ? (language === 'ar' ? 'عملة' : 'Coins') :
                                              tier.reward.type === 'stars' ? (language === 'ar' ? 'نجمة' : 'Stars') :
                                              tier.reward.type === 'stardust' ? (language === 'ar' ? 'غبار النجوم' : 'Stardust') :
                                              (language === 'ar' ? 'قدرة خاصة' : 'Power-up');
                                setSelectedReward({
                                  title: language === 'ar' ? 'مكافأة مجانية' : 'Free Reward',
                                  amount: `${tier.reward.amount || 1} ${label}`
                                });
                              }}
                              className="ml-1 text-slate-500 hover:text-white transition-colors"
                            >
                              <Info className="w-2.5 h-2.5" />
                            </button>
                          </div>
                          <button
                            disabled={tier.isClaimed || skyPass.level < tier.level}
                            onClick={() => handleClaim(tier.level, false)}
                            className={`p-1.5 rounded-lg transition-all ${
                              tier.isClaimed 
                                ? 'text-emerald-400' 
                                : skyPass.level >= tier.level 
                                  ? 'bg-indigo-500 hover:bg-indigo-400 text-white' 
                                  : 'text-slate-600'
                            }`}
                          >
                            {tier.isClaimed ? <CheckCircle2 className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Pro Reward */}
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">
                            {language === 'ar' ? 'مكافأة برو' : 'Pro Reward'}
                          </span>
                          <Crown className="w-3 h-3 text-amber-500" />
                        </div>
                        <div className={`flex items-center justify-between p-2 rounded-xl border ${
                          skyPass.isPro ? 'bg-amber-500/5 border-amber-500/20' : 'bg-slate-950/50 border-white/5'
                        }`}>
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              skyPass.isPro ? 'bg-amber-500/20' : 'bg-slate-800'
                            }`}>
                              {tier.proReward?.type === 'coins' && <Coins className="w-4 h-4 text-yellow-400" />}
                              {tier.proReward?.type === 'stars' && <Star className="w-4 h-4 text-amber-400" />}
                              {tier.proReward?.type === 'stardust' && <Sparkles className="w-4 h-4 text-purple-400" />}
                              {tier.proReward?.type === 'powerup' && <Zap className="w-4 h-4 text-indigo-400" />}
                              {tier.proReward?.type === 'skin' && <Crown className="w-4 h-4 text-amber-400" />}
                              {tier.proReward?.type === 'artifact' && <Gem className="w-4 h-4 text-purple-400" />}
                            </div>
                            <span className="text-xs font-bold text-white">
                              {tier.proReward?.amount ? `${tier.proReward.amount}` : '1'}
                            </span>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                const label = tier.proReward?.type === 'coins' ? (language === 'ar' ? 'عملة' : 'Coins') :
                                              tier.proReward?.type === 'stars' ? (language === 'ar' ? 'نجمة' : 'Stars') :
                                              tier.proReward?.type === 'stardust' ? (language === 'ar' ? 'غبار النجوم' : 'Stardust') :
                                              tier.proReward?.type === 'skin' ? (language === 'ar' ? 'مظهر سفينة' : 'Ship Skin') :
                                              tier.proReward?.type === 'artifact' ? (language === 'ar' ? 'أثر قديم' : 'Artifact') :
                                              (language === 'ar' ? 'قدرة خاصة' : 'Power-up');
                                setSelectedReward({
                                  title: language === 'ar' ? 'مكافأة برو' : 'Pro Reward',
                                  amount: `${tier.proReward?.amount || 1} ${label}`
                                });
                              }}
                              className="ml-1 text-slate-500 hover:text-white transition-colors"
                            >
                              <Info className="w-2.5 h-2.5" />
                            </button>
                          </div>
                          <button
                            disabled={tier.isProClaimed || !skyPass.isPro || skyPass.level < tier.level}
                            onClick={() => handleClaim(tier.level, true)}
                            className={`p-1.5 rounded-lg transition-all ${
                              tier.isProClaimed 
                                ? 'text-emerald-400' 
                                : (skyPass.isPro && skyPass.level >= tier.level)
                                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950' 
                                  : 'text-slate-600'
                            }`}
                          >
                            {!skyPass.isPro ? <Lock className="w-4 h-4" /> : tier.isProClaimed ? <CheckCircle2 className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Reward Info Modal */}
          <AnimatePresence>
            {selectedReward && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm"
                onClick={() => setSelectedReward(null)}
              >
                <motion.div 
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  className="bg-slate-900 border border-indigo-500/50 p-8 rounded-3xl shadow-2xl max-w-xs w-full text-center"
                  onClick={e => e.stopPropagation()}
                >
                  <div className="w-16 h-16 bg-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-500/30">
                    <Gift className="w-8 h-8 text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-black text-white mb-2">{selectedReward.title}</h3>
                  <p className="text-indigo-400 text-2xl font-black">{selectedReward.amount}</p>
                  <button 
                    className="mt-6 w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all"
                    onClick={() => setSelectedReward(null)}
                  >
                    {language === 'ar' ? 'حسناً' : 'OK'}
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SkyPassModal;
