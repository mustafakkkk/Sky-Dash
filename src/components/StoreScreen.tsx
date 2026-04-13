import React from 'react';
import { motion } from 'motion/react';
import { ShoppingBag, Coins } from 'lucide-react';
import { Powerup } from '../types';

interface StoreScreenProps {
  t: any;
  stats: any;
  isEid: boolean;
  buyPowerup: (powerup: Powerup) => void;
  goToMenu: () => void;
  playClickSound: () => void;
  STORE_ITEMS: Powerup[];
}

const StoreScreen = React.memo(({ t, stats, isEid, buyPowerup, goToMenu, playClickSound, STORE_ITEMS }: StoreScreenProps) => (
  <motion.div
    key="store"
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 1.05 }}
    className="flex flex-col items-center gap-6 p-6 bg-slate-900/90 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-2xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden will-change-transform"
  >
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-3">
        <ShoppingBag className="w-8 h-8 text-pink-400" />
        <h2 className="text-3xl font-black">{t.store}</h2>
      </div>
      <div className="flex items-center gap-2 px-4 py-1 bg-slate-800 rounded-full border border-white/5">
        <Coins className="w-4 h-4 text-yellow-400" />
        <span className="text-sm font-bold text-yellow-400">{stats.coins} {t.coins}</span>
      </div>
    </div>

    <div className="w-full overflow-y-auto pr-2 space-y-3 custom-scrollbar">
      <div className="bg-pink-500/10 border border-pink-500/20 p-3 rounded-2xl flex items-center gap-3 mb-2">
        <ShoppingBag className="w-5 h-5 text-pink-400" />
        <p className="text-[10px] text-pink-300 font-bold leading-tight">
          {stats.language === 'ar' ? 'جميع المشتريات تذهب تلقائياً للصندوق الوارد للاستلام' : 'All purchases are automatically sent to the Inbox for claiming'}
        </p>
      </div>
      {STORE_ITEMS.map((item) => {
        const isFree = isEid && item.type === 'shield';
        const isAsteroid = item.type === 'fireAsteroid';
        const now = Date.now();
        const isActive = !isAsteroid && stats.activePowerups.some((p: any) => p.type === item.type && (p.expiresAt === 0 || p.expiresAt > now));
        
        // Calculate total asteroids including those waiting in inbox
        const inInboxCount = isAsteroid ? stats.inbox
          .filter((i: any) => i.type === 'fire_asteroid' && !i.isClaimed)
          .reduce((acc: number, i: any) => acc + (i.amount || 1), 0) : 0;
        const totalAsteroids = isAsteroid ? stats.fireAsteroids + inInboxCount : 0;
        const isMaxAsteroids = isAsteroid && totalAsteroids >= 25;
        
        const canAfford = stats.coins >= item.cost;
        const itemName = t.powerupNames[item.id as keyof typeof t.powerupNames] || item.name;
        const itemDesc = t.powerupDescs[item.id as keyof typeof t.powerupDescs] || item.description;

        return (
          <div
            key={item.id}
            className={`p-4 rounded-2xl border transition-all bg-slate-800/50 border-white/5 ${isActive ? 'ring-2 ring-pink-500/50' : ''} ${isFree ? 'border-amber-500/30 bg-amber-500/5' : ''}`}
          >
            <div className="flex items-center gap-4">
              <div className={`text-3xl p-3 rounded-2xl ${isFree ? 'bg-amber-500/20' : 'bg-slate-700'}`}>{item.icon}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className={`font-bold ${isFree ? 'text-amber-400' : 'text-white'}`}>{itemName}</h3>
                  {isActive && <span className="text-[10px] bg-pink-500 text-white px-2 py-0.5 rounded-full uppercase font-bold">{t.active}</span>}
                  {isAsteroid && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold ${isMaxAsteroids ? 'bg-rose-500 text-white' : 'bg-indigo-500 text-white'}`}>
                      {totalAsteroids} / 25
                    </span>
                  )}
                  {isFree && !isActive && <span className="text-[10px] bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full uppercase font-bold">{t.eventFree}</span>}
                </div>
                <p className="text-xs text-slate-500 mt-1">{itemDesc}</p>
                
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Coins className="w-3 h-3 text-yellow-400" />
                    <span className={`text-xs font-bold ${isFree ? 'text-slate-500 line-through' : 'text-yellow-400'}`}>{item.cost}</span>
                  </div>
                  <button
                    disabled={isActive || isFree || !canAfford || isMaxAsteroids}
                    onClick={() => buyPowerup(item)}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isActive 
                        ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                        : isFree
                          ? 'bg-amber-500/20 text-amber-500 cursor-not-allowed border border-amber-500/30'
                          : isMaxAsteroids
                            ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                            : canAfford 
                              ? 'bg-pink-500 hover:bg-pink-400 text-white active:scale-95' 
                              : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {isActive ? t.purchased : isFree ? t.eventFree : isMaxAsteroids ? t.completed : canAfford ? t.buy : t.insufficientCoins}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>

    <button
      onClick={goToMenu}
      className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl transition-all mt-2"
    >
      {t.back}
    </button>
  </motion.div>
));

export default StoreScreen;
