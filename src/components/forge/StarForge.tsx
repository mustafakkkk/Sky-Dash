import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Factory, 
  Rocket, 
  Magnet, 
  Shield, 
  Flame, 
  Radar, 
  Timer, 
  ChevronRight, 
  Zap, 
  Box, 
  ArrowUpCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Coins,
  Star
} from 'lucide-react';
import { GameStats, ForgeStats, Expedition, Language } from '../../types';
import { FORGE_CONFIG, EXPEDITION_TYPES, calculateUpgradeCost, updateExpeditions } from '../../lib/forgeUtils';

interface StarForgeProps {
  stats: GameStats;
  onUpdateStats: (updater: (prev: GameStats) => GameStats) => void;
  onClose: () => void;
  language: Language;
}

const StarForge: React.FC<StarForgeProps> = ({ stats, onUpdateStats, onClose, language }) => {
  const [activeTab, setActiveTab] = useState<'modules' | 'expeditions'>('modules');
  const t = language === 'ar' ? {
    title: 'مصنع النجوم',
    subtitle: 'طور تقنياتك الفضائية وعزز أسطولك',
    modules: 'وحدات التطوير',
    expeditions: 'البعثات الاستكشافية',
    stardust: 'غبار النجوم',
    credits: 'العملات',
    upgrade: 'تطوير',
    maxLevel: 'أقصى مستوى',
    startExpedition: 'بدء البعثة',
    claimReward: 'استلام المكافأة',
    timeLeft: 'الوقت المتبقي',
    completed: 'مكتملة',
    running: 'قيد التنفيذ',
    insufficientResources: 'الموارد غير كافية',
    level: 'المستوى'
  } : {
    title: 'Star Forge',
    subtitle: 'Evolve your space tech and enhance your fleet',
    modules: 'Upgrade Modules',
    expeditions: 'Space Expeditions',
    stardust: 'Stardust',
    credits: 'Credits',
    upgrade: 'Upgrade',
    maxLevel: 'Max Level',
    startExpedition: 'Start Expedition',
    claimReward: 'Claim Reward',
    timeLeft: 'Time Left',
    completed: 'Completed',
    running: 'Running',
    insufficientResources: 'Insufficient Resources',
    level: 'Level'
  };

  const forge = stats.forgeStats;

  const hasMarketInsight = stats.forgeStats.contracts.some(c => 
    c.id === 'market_insight' && c.isPurchased && !c.isClaimed
  );

  const handleUpgrade = (type: keyof ForgeStats['modules']) => {
    const currentLevel = forge.modules[type];
    const config = FORGE_CONFIG[type];
    
    if (currentLevel >= config.maxLevel) return;
    
    let { coins: cost, stars: starCost } = calculateUpgradeCost(type, currentLevel);
    if (hasMarketInsight) {
      cost = Math.floor(cost * 0.9);
      starCost = Math.floor(starCost * 0.9);
    }
    
    if (stats.coins < cost || stats.totalStars < starCost) return;

    onUpdateStats(prev => ({
      ...prev,
      coins: prev.coins - cost,
      totalStars: prev.totalStars - starCost,
      forgeStats: {
        ...prev.forgeStats,
        modules: {
          ...prev.forgeStats.modules,
          [type]: currentLevel + 1
        }
      }
    }));
  };

  const handleStartExpedition = (type: 'short' | 'medium' | 'long') => {
    const config = EXPEDITION_TYPES[type];
    let cost = config.cost;
    if (hasMarketInsight) {
      cost = Math.floor(cost * 0.9);
    }

    if (stats.coins < cost) return;
    if (forge.expeditions.length >= 3) return; // Limit to 3 concurrent expeditions

    const newExpedition: Expedition = {
      id: `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      startTime: Date.now(),
      duration: config.duration,
      status: 'running',
      rewardClaimed: false
    };

    onUpdateStats(prev => ({
      ...prev,
      coins: prev.coins - cost,
      forgeStats: {
        ...prev.forgeStats,
        expeditions: [...prev.forgeStats.expeditions, newExpedition]
      }
    }));
  };

  const handleClaimExpedition = (id: string) => {
    const exp = forge.expeditions.find(e => e.id === id);
    if (!exp || exp.status !== 'completed') return;

    const config = EXPEDITION_TYPES[exp.type];
    const reward = Math.floor(Math.random() * (config.rewardRange.max - config.rewardRange.min + 1)) + config.rewardRange.min;

    onUpdateStats(prev => ({
      ...prev,
      coins: prev.coins + reward,
      forgeStats: {
        ...prev.forgeStats,
        expeditions: prev.forgeStats.expeditions.filter(e => e.id !== id)
      }
    }));
  };

  // Update expedition statuses on mount and interval
  useEffect(() => {
    const interval = setInterval(() => {
      onUpdateStats(prev => {
        const updated = updateExpeditions(prev.forgeStats.expeditions);
        if (JSON.stringify(updated) !== JSON.stringify(prev.forgeStats.expeditions)) {
          return {
            ...prev,
            forgeStats: { ...prev.forgeStats, expeditions: updated }
          };
        }
        return prev;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [onUpdateStats]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'engine': return <Rocket className="w-6 h-6" />;
      case 'magnet': return <Magnet className="w-6 h-6" />;
      case 'shield': return <Shield className="w-6 h-6" />;
      case 'arsenal': return <Flame className="w-6 h-6" />;
      case 'sensor': return <Radar className="w-6 h-6" />;
      default: return <Zap className="w-6 h-6" />;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl"
    >
      <div className="w-full max-w-4xl h-[85vh] bg-slate-900 border border-indigo-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-indigo-600/20 to-purple-600/20">
          <div>
            <h2 className="text-3xl font-black text-white flex items-center gap-3">
              <Factory className="w-8 h-8 text-indigo-400" />
              {t.title}
            </h2>
            <p className="text-slate-400 text-sm mt-1">{t.subtitle}</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-slate-800/80 px-4 py-2 rounded-2xl border border-white/5 flex items-center gap-2">
              <Coins className="w-4 h-4 text-yellow-500" />
              <span className="font-mono font-bold">{stats.coins.toLocaleString()}</span>
            </div>
            <div className="bg-slate-800/80 px-4 py-2 rounded-2xl border border-white/5 flex items-center gap-2">
              <Star className="w-4 h-4 text-indigo-400" />
              <span className="font-mono font-bold">{forge.stardust.toLocaleString()}</span>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              <ChevronRight className={`w-6 h-6 ${language === 'ar' ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex p-2 bg-slate-800/50 gap-2">
          <button 
            onClick={() => setActiveTab('modules')}
            className={`flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'modules' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-white/5'}`}
          >
            <Box className="w-5 h-5" />
            {t.modules}
          </button>
          <button 
            onClick={() => setActiveTab('expeditions')}
            className={`flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'expeditions' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-white/5'}`}
          >
            <Timer className="w-5 h-5" />
            {t.expeditions}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <AnimatePresence mode="wait">
            {activeTab === 'modules' ? (
              <motion.div 
                key="modules"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {(Object.keys(FORGE_CONFIG) as Array<keyof ForgeStats['modules']>).map(key => {
                  const config = FORGE_CONFIG[key];
                  const level = forge.modules[key];
                  const { coins: cost, stars: starCost } = calculateUpgradeCost(key, level);
                  const isMax = level >= config.maxLevel;
                  const canAfford = stats.coins >= cost && stats.totalStars >= starCost;

                  return (
                    <div key={key} className="bg-slate-800/50 border border-white/5 rounded-2xl p-5 flex flex-col gap-4 hover:border-indigo-500/30 transition-all group">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-2xl bg-gradient-to-br ${isMax ? 'from-emerald-500/20 to-emerald-600/20 text-emerald-400' : 'from-indigo-500/20 to-purple-600/20 text-indigo-400'}`}>
                            {getIcon(key)}
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-white">{config.name[language]}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-slate-400 uppercase tracking-wider">{t.level}</span>
                              <div className="flex gap-1">
                                {[...Array(config.maxLevel)].map((_, i) => (
                                  <div key={`level_dot_${key}_${i}`} className={`w-2 h-1 rounded-full ${i < level ? 'bg-indigo-500' : 'bg-slate-700'}`} />
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-black text-white">{level}</span>
                          <span className="text-slate-500 text-xs block">/ {config.maxLevel}</span>
                        </div>
                      </div>
                      
                      <p className="text-slate-400 text-sm leading-relaxed">
                        {config.description[language]}
                      </p>

                      <button
                        onClick={() => handleUpgrade(key)}
                        disabled={isMax || !canAfford}
                        className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                          isMax 
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 cursor-default'
                            : canAfford
                              ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg active:scale-95'
                              : 'bg-slate-800 text-slate-500 border border-white/5 cursor-not-allowed'
                        }`}
                      >
                        {isMax ? (
                          <>
                            <CheckCircle2 className="w-5 h-5" />
                            {t.maxLevel}
                          </>
                        ) : (
                          <div className="flex items-center gap-3">
                            <ArrowUpCircle className="w-5 h-5" />
                            <span>{t.upgrade}</span>
                            <div className="flex items-center gap-2 bg-black/20 px-2 py-1 rounded-lg">
                              <div className="flex items-center gap-1">
                                <Coins className="w-3 h-3 text-yellow-500" />
                                <span className="text-xs">{cost.toLocaleString()}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-indigo-400" />
                                <span className="text-xs">{starCost.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </button>
                    </div>
                  );
                })}
              </motion.div>
            ) : (
              <motion.div 
                key="expeditions"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Active Expeditions */}
                <div className="grid grid-cols-1 gap-4">
                  {forge.expeditions.map(exp => {
                    const config = EXPEDITION_TYPES[exp.type];
                    const progress = Math.min(100, ((Date.now() - exp.startTime) / exp.duration) * 100);
                    const isCompleted = exp.status === 'completed';

                    return (
                      <div key={exp.id} className="bg-slate-800/50 border border-indigo-500/20 rounded-2xl p-5 flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${isCompleted ? 'bg-emerald-500/20 text-emerald-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
                              <Rocket className={`w-6 h-6 ${!isCompleted ? 'animate-pulse' : ''}`} />
                            </div>
                            <div>
                              <h3 className="font-bold text-white">{config.name[language]}</h3>
                              <div className="flex items-center gap-2 text-xs">
                                {isCompleted ? (
                                  <span className="text-emerald-400 flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" />
                                    {t.completed}
                                  </span>
                                ) : (
                                  <span className="text-indigo-400 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {t.running}...
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          {isCompleted && (
                            <button 
                              onClick={() => handleClaimExpedition(exp.id)}
                              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg transition-all active:scale-95"
                            >
                              {t.claimReward}
                            </button>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-xs text-slate-400">
                            <span>{isCompleted ? '100%' : `${Math.floor(progress)}%`}</span>
                            {!isCompleted && (
                              <span>
                                {t.timeLeft}: {Math.ceil((exp.startTime + exp.duration - Date.now()) / (1000 * 60))}m
                              </span>
                            )}
                          </div>
                          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                              className={`h-full ${isCompleted ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {forge.expeditions.length === 0 && (
                    <div className="py-12 flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-white/5 rounded-3xl">
                      <Rocket className="w-12 h-12 mb-4 opacity-20" />
                      <p>لا توجد بعثات نشطة حالياً</p>
                    </div>
                  )}
                </div>

                {/* Available Missions */}
                <div className="pt-6 border-t border-white/10">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    المهام المتاحة
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {(Object.keys(EXPEDITION_TYPES) as Array<keyof typeof EXPEDITION_TYPES>).map(type => {
                      const config = EXPEDITION_TYPES[type];
                      const canAfford = stats.coins >= config.cost;
                      const isFull = forge.expeditions.length >= 3;

                      return (
                        <div key={type} className="bg-slate-800/30 border border-white/5 rounded-2xl p-4 flex flex-col gap-4">
                          <div>
                            <h4 className="font-bold text-white">{config.name[language]}</h4>
                            <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {config.duration / (1000 * 60 * 60)}h
                              </span>
                              <span className="flex items-center gap-1">
                                <Coins className="w-3 h-3" />
                                {config.cost}
                              </span>
                            </div>
                          </div>
                          <div className="bg-indigo-500/10 rounded-xl p-3 border border-indigo-500/20">
                            <span className="text-[10px] text-indigo-400 uppercase block mb-1">المكافأة المتوقعة</span>
                            <span className="text-sm font-bold text-white">
                              {config.rewardRange.min} - {config.rewardRange.max} عملة
                            </span>
                          </div>
                          <button
                            onClick={() => handleStartExpedition(type)}
                            disabled={!canAfford || isFull}
                            className={`w-full py-2 rounded-xl text-sm font-bold transition-all ${
                              canAfford && !isFull
                                ? 'bg-slate-700 hover:bg-slate-600 text-white'
                                : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                            }`}
                          >
                            {isFull ? 'الأسطول ممتلئ' : t.startExpedition}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default StarForge;
