import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Shield, Rocket, Coins, Sparkles, Lock, CheckCircle2, Zap, Target, Magnet, Gem, Building2, Palette, Info, X, Medal, FileText, Clock, Star, MousePointer2, TrendingUp, AlertTriangle, Gift } from 'lucide-react';
import { GameStats, Artifact, ShipSkin, Contract } from '../types';

interface EconomyHubProps {
  isOpen: boolean;
  onClose: () => void;
  stats: GameStats;
  onUpdateStats: (updater: (prev: GameStats) => GameStats) => void;
  t: any;
}

const EconomyHub: React.FC<EconomyHubProps> = ({ isOpen, onClose, stats, onUpdateStats, t }) => {
  const [activeTab, setActiveTab] = useState<'syndicate' | 'artifacts' | 'hangar' | 'contracts'>('syndicate');
  const [selectedReward, setSelectedReward] = useState<{ title: string, amount: string } | null>(null);
  const language = stats.language;

  const handleDonate = (amount: number) => {
    if (stats.coins < amount) return;
    onUpdateStats(prev => {
      const syndicate = prev.forgeStats.syndicate || { weeklyDonation: 0, totalDonation: 0, currentRank: 0, lastDonationTimestamp: Date.now() };
      return {
        ...prev,
        coins: prev.coins - amount,
        forgeStats: {
          ...prev.forgeStats,
          syndicate: {
            ...syndicate,
            weeklyDonation: syndicate.weeklyDonation + amount,
            totalDonation: syndicate.totalDonation + amount,
            lastDonationTimestamp: Date.now()
          }
        }
      };
    });
  };

  const handleRestoreArtifact = (artifact: Artifact) => {
    const starCost = artifact.starCost || 0;
    if (stats.coins < artifact.restorationCost || stats.totalStars < starCost || artifact.isRestored) return;
    onUpdateStats(prev => ({
      ...prev,
      coins: prev.coins - artifact.restorationCost,
      totalStars: prev.totalStars - starCost,
      forgeStats: {
        ...prev.forgeStats,
        artifacts: prev.forgeStats.artifacts.map(a => 
          a.id === artifact.id ? { ...a, isRestored: true } : a
        )
      }
    }));
  };

  const handleBuySkin = (skin: ShipSkin) => {
    const starCost = skin.starCost || 0;
    if (stats.coins < skin.cost || stats.totalStars < starCost || skin.isUnlocked) return;
    onUpdateStats(prev => ({
      ...prev,
      coins: prev.coins - skin.cost,
      totalStars: prev.totalStars - starCost,
      forgeStats: {
        ...prev.forgeStats,
        skins: prev.forgeStats.skins.map(s => 
          s.id === skin.id ? { ...s, isUnlocked: true } : s
        )
      }
    }));
  };

  const handleEquipSkin = (skinId: string) => {
    onUpdateStats(prev => ({
      ...prev,
      forgeStats: {
        ...prev.forgeStats,
        activeSkinId: skinId
      }
    }));
  };

  const handleBuyContract = (contractId: string) => {
    const contract = stats.forgeStats.contracts.find(c => c.id === contractId);
    if (!contract || contract.isPurchased) return;
    const starCost = contract.starCost || 0;
    if (stats.coins < contract.cost || stats.totalStars < starCost) return;

    onUpdateStats(prev => ({
      ...prev,
      coins: prev.coins - contract.cost,
      totalStars: prev.totalStars - starCost,
      forgeStats: {
        ...prev.forgeStats,
        contracts: prev.forgeStats.contracts.map(c => 
          c.id === contractId ? { ...c, isPurchased: true, currentValue: 0 } : c
        )
      }
    }));
  };

  const handleClaimContract = (contractId: string) => {
    const contract = stats.forgeStats.contracts.find(c => c.id === contractId);
    if (!contract || !contract.isCompleted || contract.isClaimed) return;

    onUpdateStats(prev => ({
      ...prev,
      coins: prev.coins + contract.reward,
      forgeStats: {
        ...prev.forgeStats,
        contracts: prev.forgeStats.contracts.map(c => 
          c.id === contractId ? { ...c, isClaimed: true } : c
        )
      }
    }));
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-slate-900 border border-white/10 rounded-[40px] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
          <div>
            <h2 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-3">
              <Building2 className="w-8 h-8 text-indigo-400" />
              {language === 'ar' ? 'مركز الاقتصاد المتقدم' : 'Advanced Economy Hub'}
            </h2>
            <p className="text-slate-400 font-medium mt-1">
              {language === 'ar' ? 'استثمر عملاتك لتطوير إمبراطوريتك' : 'Invest your coins to expand your empire'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-slate-800/80 px-4 py-2 rounded-2xl border border-white/5 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400" />
              <span className="text-lg font-black text-white">{stats.totalStars.toLocaleString()}</span>
            </div>
            <div className="bg-slate-800/80 px-4 py-2 rounded-2xl border border-white/5 flex items-center gap-2">
              <Coins className="w-4 h-4 text-yellow-400" />
              <span className="text-lg font-black text-white">{stats.coins.toLocaleString()}</span>
            </div>
            <button
              onClick={onClose}
              className="p-3 hover:bg-white/5 rounded-2xl transition-colors text-slate-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex p-2 bg-slate-800/50 mx-8 mt-6 rounded-2xl border border-white/5">
          {[
            { id: 'syndicate', icon: Trophy, label: language === 'ar' ? 'النقابة' : 'Syndicate' },
            { id: 'artifacts', icon: Gem, label: language === 'ar' ? 'الآثار' : 'Artifacts' },
            { id: 'hangar', icon: Rocket, label: language === 'ar' ? 'الحظيرة' : 'Hangar' },
            { id: 'contracts', icon: FileText, label: language === 'ar' ? 'العقود' : 'Contracts' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
                activeTab === tab.id 
                  ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <AnimatePresence mode="wait">
            {activeTab === 'syndicate' && (
              <motion.div
                key="syndicate"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-3xl p-6 flex items-start gap-4">
                  <Info className="w-6 h-6 text-indigo-400 shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-indigo-400 mb-1">
                      {language === 'ar' ? 'نقابة المجرة' : 'Galactic Syndicate'}
                    </h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      {language === 'ar' 
                        ? 'تبرع بالعملات لزيادة نفوذك في المجرة. اللاعبون الأكثر تبرعاً يحصلون على رتب خاصة ومضاعفات نقاط عالمية في نهاية كل أسبوع.'
                        : 'Donate coins to increase your galactic influence. Top donors receive special ranks and global score multipliers at the end of each week.'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-800/50 border border-white/5 rounded-3xl p-8 flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-indigo-500/20 rounded-full flex items-center justify-center mb-4 border border-indigo-500/30">
                      <Trophy className="w-10 h-10 text-indigo-400" />
                    </div>
                    <h4 className="text-xl font-black text-white mb-1">
                      {language === 'ar' ? 'تبرعاتك الأسبوعية' : 'Your Weekly Donation'}
                    </h4>
                    <span className="text-3xl font-black text-indigo-400 mb-6">
                      {(stats.forgeStats.syndicate?.weeklyDonation || 0).toLocaleString()}
                    </span>
                    <div className="grid grid-cols-2 gap-3 w-full">
                      {[1000, 5000, 10000, 50000].map(amount => (
                        <button
                          key={`syndicate_donate_${amount}`}
                          onClick={() => handleDonate(amount)}
                          disabled={stats.coins < amount}
                          className="py-3 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold text-white transition-all border border-white/5"
                        >
                          +{amount.toLocaleString()}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-800/50 border border-white/5 rounded-3xl p-8">
                    <h4 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                      <Medal className="w-6 h-6 text-amber-400" />
                      {language === 'ar' ? 'رتب النفوذ' : 'Influence Ranks'}
                    </h4>
                    <div className="space-y-4">
                      {[
                        { label: language === 'ar' ? 'متبرع برونزي' : 'Bronze Donor', min: 0, bonus: 'x1.0' },
                        { label: language === 'ar' ? 'مستثمر فضي' : 'Silver Investor', min: 50000, bonus: 'x1.1' },
                        { label: language === 'ar' ? 'رأسمالي ذهبي' : 'Gold Capitalist', min: 250000, bonus: 'x1.25' },
                        { label: language === 'ar' ? 'بارون المجرة' : 'Galactic Baron', min: 1000000, bonus: 'x1.5' }
                      ].map((rank, i) => {
                        const isCurrent = (stats.forgeStats.syndicate?.totalDonation || 0) >= rank.min;
                        return (
                          <div key={`syndicate_rank_${i}`} className={`flex items-center justify-between p-4 rounded-2xl border ${isCurrent ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-slate-900/50 border-white/5 opacity-50'}`}>
                            <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full ${isCurrent ? 'bg-indigo-400' : 'bg-slate-600'}`} />
                              <span className={`font-bold ${isCurrent ? 'text-white' : 'text-slate-500'}`}>{rank.label}</span>
                            </div>
                            <span className="text-xs font-black text-indigo-400">{rank.bonus} Bonus</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'artifacts' && (
              <motion.div
                key="artifacts"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {stats.forgeStats.artifacts.map(artifact => (
                  <div key={artifact.id} className={`bg-slate-800/50 border rounded-3xl p-6 transition-all ${artifact.isRestored ? 'border-emerald-500/30' : 'border-white/5'}`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl border ${
                          artifact.rarity === 'legendary' ? 'bg-amber-500/20 border-amber-500/30' :
                          artifact.rarity === 'epic' ? 'bg-purple-500/20 border-purple-500/30' :
                          artifact.rarity === 'rare' ? 'bg-indigo-500/20 border-indigo-500/30' :
                          'bg-slate-700/50 border-white/10'
                        }`}>
                          {artifact.icon}
                        </div>
                        <div>
                          <h4 className="text-lg font-black text-white">{artifact.name[language]}</h4>
                          <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                            artifact.rarity === 'legendary' ? 'text-amber-400 border-amber-400/30' :
                            artifact.rarity === 'epic' ? 'text-purple-400 border-purple-400/30' :
                            artifact.rarity === 'rare' ? 'text-indigo-400 border-indigo-400/30' :
                            'text-slate-400 border-white/10'
                          }`}>
                            {artifact.rarity}
                          </span>
                        </div>
                      </div>
                      {artifact.isRestored && <CheckCircle2 className="w-6 h-6 text-emerald-500" />}
                    </div>
                    
                    <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                      {artifact.description[language]}
                    </p>

                    <button
                      onClick={() => handleRestoreArtifact(artifact)}
                      disabled={artifact.isRestored || stats.coins < artifact.restorationCost || stats.totalStars < (artifact.starCost || 0)}
                      className={`w-full py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-2 ${
                        artifact.isRestored 
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 cursor-default'
                          : 'bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed'
                      }`}
                    >
                      {artifact.isRestored ? (
                        language === 'ar' ? 'تم الترميم' : 'Restored'
                      ) : (
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <Coins className="w-4 h-4" />
                            <span>{artifact.restorationCost.toLocaleString()}</span>
                          </div>
                          {artifact.starCost && (
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-amber-400" />
                              <span>{artifact.starCost.toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </button>
                  </div>
                ))}
              </motion.div>
            )}

            {activeTab === 'hangar' && (
              <motion.div
                key="hangar"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {stats.forgeStats.skins.map(skin => {
                  const isActive = stats.forgeStats.activeSkinId === skin.id;
                  return (
                    <div key={skin.id} className={`bg-slate-800/50 border rounded-3xl p-6 transition-all ${isActive ? 'border-indigo-500/50 ring-1 ring-indigo-500/50' : 'border-white/5'}`}>
                      <div className="flex items-center gap-4 mb-6">
                        <div 
                          className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-inner border border-white/10"
                          style={{ backgroundColor: `${skin.previewColor}33`, color: skin.previewColor }}
                        >
                          <Rocket className="w-10 h-10" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="text-lg font-black text-white">{skin.name[language]}</h4>
                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                              skin.rarity === 'legendary' ? 'text-amber-400 border-amber-400/30' :
                              skin.rarity === 'epic' ? 'text-purple-400 border-purple-400/30' :
                              skin.rarity === 'rare' ? 'text-indigo-400 border-indigo-400/30' :
                              'text-slate-400 border-white/10'
                            }`}>
                              {skin.rarity}
                            </span>
                          </div>
                          <p className="text-slate-400 text-xs mt-1">{skin.description[language]}</p>
                        </div>
                      </div>

                      {skin.ability && (
                        <div className="bg-slate-900/50 rounded-2xl p-4 mb-6 border border-white/5">
                          <div className="flex items-center gap-2 text-indigo-400 mb-1">
                            <Zap className="w-4 h-4" />
                            <span className="text-xs font-black uppercase tracking-wider">
                              {language === 'ar' ? 'قدرة خاصة' : 'Special Ability'}
                            </span>
                          </div>
                          <p className="text-slate-300 text-sm font-medium">{skin.ability[language]}</p>
                        </div>
                      )}

                      {!skin.isUnlocked ? (
                        <button
                          onClick={() => handleBuySkin(skin)}
                          disabled={stats.coins < skin.cost || stats.totalStars < (skin.starCost || 0)}
                          className="w-full py-4 bg-white text-slate-900 font-black rounded-2xl hover:bg-slate-200 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <div className="flex items-center gap-1">
                            <Coins className="w-4 h-4" />
                            <span>{skin.cost.toLocaleString()}</span>
                          </div>
                          {skin.starCost && (
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-amber-400" />
                              <span>{skin.starCost.toLocaleString()}</span>
                            </div>
                          )}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleEquipSkin(skin.id)}
                          disabled={isActive}
                          className={`w-full py-4 rounded-2xl font-black transition-all ${
                            isActive 
                              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 cursor-default'
                              : 'bg-slate-700 hover:bg-slate-600 text-white border border-white/5'
                          }`}
                        >
                          {isActive ? (language === 'ar' ? 'مجهز حالياً' : 'Currently Equipped') : (language === 'ar' ? 'تجهيز' : 'Equip')}
                        </button>
                      )}
                    </div>
                  );
                })}
              </motion.div>
            )}
            {activeTab === 'contracts' && (
              <motion.div
                key="contracts"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {stats.forgeStats.contracts.map(contract => {
                  const getIcon = () => {
                    switch(contract.type) {
                      case 'score': return <Target className="w-8 h-8 text-indigo-400" />;
                      case 'stars': return <Star className="w-8 h-8 text-yellow-400" />;
                      case 'time': return <Clock className="w-8 h-8 text-emerald-400" />;
                      case 'near_miss': return <MousePointer2 className="w-8 h-8 text-purple-400" />;
                      case 'investment': return <TrendingUp className="w-8 h-8 text-blue-400" />;
                      case 'risk': return <AlertTriangle className="w-8 h-8 text-red-400" />;
                      default: return <FileText className="w-8 h-8 text-slate-400" />;
                    }
                  };

                  const progress = Math.min(100, (contract.currentValue / contract.targetValue) * 100);

                  return (
                    <div key={contract.id} className={`bg-slate-800/50 border rounded-3xl p-6 transition-all ${contract.isCompleted ? 'border-emerald-500/30' : 'border-white/5'}`}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-slate-900/50 rounded-2xl flex items-center justify-center border border-white/5">
                            {getIcon()}
                          </div>
                          <div>
                            <h4 className="text-lg font-black text-white">{contract.name[language]}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                                contract.rarity === 'hard' ? 'text-red-400 border-red-400/30' :
                                contract.rarity === 'medium' ? 'text-amber-400 border-amber-400/30' :
                                'text-emerald-400 border-emerald-400/30'
                              }`}>
                                {contract.rarity}
                              </span>
                              <div className="flex items-center gap-1 bg-indigo-500/20 px-2 py-0.5 rounded-full border border-indigo-500/30">
                                <Coins className="w-3 h-3 text-indigo-400" />
                                <span className="text-[10px] font-black text-indigo-400">+{contract.reward.toLocaleString()}</span>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedReward({
                                      title: language === 'ar' ? 'مكافأة العقد' : 'Contract Reward',
                                      amount: language === 'ar' ? `${contract.reward.toLocaleString()} عملة` : `${contract.reward.toLocaleString()} Coins`
                                    });
                                  }}
                                  className="ml-1 hover:text-white transition-colors"
                                  title={language === 'ar' ? 'تفاصيل المكافأة' : 'Reward Details'}
                                >
                                  <Info className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                        {contract.isClaimed && <CheckCircle2 className="w-6 h-6 text-emerald-500" />}
                      </div>

                      <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                        {contract.description[language]}
                      </p>

                      {contract.isPurchased && !contract.isClaimed && (
                        <div className="mb-6">
                          <div className="flex justify-between text-xs font-bold mb-2">
                            <span className="text-slate-500">{language === 'ar' ? 'التقدم' : 'Progress'}</span>
                            <span className="text-indigo-400">{Math.floor(contract.currentValue)} / {contract.targetValue}</span>
                          </div>
                          <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                              className={`h-full ${contract.isCompleted ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                            />
                          </div>
                        </div>
                      )}

                      {!contract.isPurchased ? (
                        <button
                          onClick={() => handleBuyContract(contract.id)}
                          disabled={stats.coins < contract.cost || stats.totalStars < (contract.starCost || 0)}
                          className="w-full py-4 bg-white text-slate-900 font-black rounded-2xl hover:bg-slate-200 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <div className="flex items-center gap-1">
                            <Coins className="w-4 h-4" />
                            <span>{contract.cost.toLocaleString()}</span>
                          </div>
                          {contract.starCost && (
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-amber-400" />
                              <span>{contract.starCost.toLocaleString()}</span>
                            </div>
                          )}
                        </button>
                      ) : contract.isCompleted && !contract.isClaimed ? (
                        <button
                          onClick={() => handleClaimContract(contract.id)}
                          className="w-full py-4 bg-emerald-500 text-white font-black rounded-2xl hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                        >
                          <Trophy className="w-5 h-5" />
                          {language === 'ar' ? 'استلام المكافأة: ' : 'Claim Reward: '}
                          {contract.reward.toLocaleString()}
                        </button>
                      ) : contract.isClaimed ? (
                        <div className="w-full py-4 bg-slate-900/50 text-slate-500 font-black rounded-2xl border border-white/5 flex items-center justify-center gap-2">
                          <CheckCircle2 className="w-5 h-5" />
                          {language === 'ar' ? 'مكتمل' : 'Completed'}
                        </div>
                      ) : (
                        <div className="w-full py-4 bg-indigo-500/10 text-indigo-400 font-black rounded-2xl border border-indigo-500/20 flex items-center justify-center gap-2">
                          <Clock className="w-5 h-5" />
                          {language === 'ar' ? 'قيد التنفيذ' : 'In Progress'}
                        </div>
                      )}
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 bg-slate-800/30 flex justify-center">
          <p className="text-slate-500 text-xs font-medium uppercase tracking-[0.2em]">
            {language === 'ar' ? 'نظام الاقتصاد المتقدم v2.0' : 'Advanced Economy System v2.0'}
          </p>
        </div>

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
      </motion.div>
    </motion.div>
  );
};

export default EconomyHub;
