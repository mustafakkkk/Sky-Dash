import React from 'react';
import { motion } from 'motion/react';
import { Inbox, Coins, Shield, Timer, Magnet, Package, Check, Bell, ChevronLeft, Trash2 } from 'lucide-react';
import { InboxItem } from '../types';

interface InboxScreenProps {
  stats: any;
  t: any;
  claimItem: (id: string) => void;
  claimAll: () => void;
  clearClaimed: () => void;
  deleteItem: (id: string) => void;
  goToMenu: () => void;
  playClickSound: () => void;
}

const InboxScreen = ({ stats, t, claimItem, claimAll, clearClaimed, deleteItem, goToMenu, playClickSound }: InboxScreenProps) => {
  const unclaimedCount = stats.inbox.filter((item: InboxItem) => !item.isClaimed).length;
  const claimedCount = stats.inbox.filter((item: InboxItem) => item.isClaimed).length;

  const getIcon = (item: InboxItem) => {
    switch (item.type) {
      case 'coins': return <Coins className="w-6 h-6 text-yellow-400" />;
      case 'powerup':
        switch (item.powerupType) {
          case 'shield': return <Shield className="w-6 h-6 text-sky-400" />;
          case 'slowMotion': return <Timer className="w-6 h-6 text-pink-400" />;
          case 'magnet': return <Magnet className="w-6 h-6 text-pink-400" />;
          case 'doublePoints': return <Bell className="w-6 h-6 text-indigo-400" />;
          default: return <Package className="w-6 h-6 text-slate-400" />;
        }
      case 'fire_asteroid': return <Package className="w-6 h-6 text-orange-400" />;
      default: return <Package className="w-6 h-6 text-slate-400" />;
    }
  };

  return (
    <motion.div
      key="inbox_screen"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col items-center gap-6 p-6 bg-slate-900/90 backdrop-blur-xl rounded-[2.5rem] border border-white/10 shadow-2xl max-w-md w-full mx-4 max-h-[85vh] overflow-hidden will-change-transform"
    >
      <div className="w-full flex items-center justify-between">
        <button
          onClick={() => { playClickSound(); goToMenu(); }}
          className="p-3 bg-slate-800 hover:bg-slate-700 rounded-2xl transition-colors border border-white/5 text-slate-400"
        >
          <ChevronLeft className={`w-6 h-6 ${stats.language === 'ar' ? 'rotate-180' : ''}`} />
        </button>
        <div className="flex flex-col items-center">
          <h2 className="text-2xl font-black text-white">{t.inbox}</h2>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{t.inboxDesc}</p>
        </div>
        <div className="w-12" /> {/* Spacer */}
      </div>

      <div className="w-full flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
        {stats.inbox.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-500 gap-4 opacity-50">
            <Inbox className="w-16 h-16" />
            <p className="font-bold text-sm">{t.noMessages}</p>
          </div>
        ) : (
          <>
            {claimedCount > 0 && (
              <div className="flex justify-end mb-2">
                <button
                  onClick={() => { playClickSound(); clearClaimed(); }}
                  className="text-[10px] font-bold text-slate-500 hover:text-slate-400 flex items-center gap-1 transition-colors"
                >
                  <Package className="w-3 h-3" />
                  {stats.language === 'ar' ? 'مسح الرسائل المستلمة' : 'Clear claimed messages'}
                </button>
              </div>
            )}
            {[...stats.inbox].sort((a, b) => {
              if (a.isClaimed !== b.isClaimed) {
                return a.isClaimed ? 1 : -1;
              }
              return b.timestamp - a.timestamp;
            }).map((item: InboxItem) => (
              <motion.div 
                layout
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-2xl border transition-all ${
                  item.isClaimed 
                    ? 'bg-slate-800/30 border-white/5 opacity-60' 
                    : 'bg-slate-800 border-white/10 shadow-lg'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${item.isClaimed ? 'bg-slate-700/50' : 'bg-slate-700'}`}>
                    {getIcon(item)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white text-sm">{item.title}</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">{item.description}</p>
                    <p className="text-[9px] text-slate-500 mt-1 font-medium">
                      {new Date(item.timestamp).toLocaleString(stats.language === 'ar' ? 'ar-EG' : 'en-US')}
                    </p>
                  </div>
                  {item.isClaimed && (
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-emerald-500/20 rounded-full">
                        <Check className="w-4 h-4 text-emerald-400" />
                      </div>
                      <button
                        onClick={() => { playClickSound(); deleteItem(item.id); }}
                        className="p-2 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 rounded-xl transition-colors"
                        title={stats.language === 'ar' ? 'حذف' : 'Delete'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  {!item.isClaimed && (
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => { playClickSound(); claimItem(item.id); }}
                        className="px-4 py-2 bg-pink-500 hover:bg-pink-400 text-white text-[10px] font-black rounded-xl transition-all active:scale-95 shadow-lg shadow-pink-500/20"
                      >
                        {t.claimReward}
                      </button>
                      <button
                        onClick={() => { playClickSound(); deleteItem(item.id); }}
                        className="p-2 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 rounded-xl transition-colors flex items-center justify-center"
                        title={stats.language === 'ar' ? 'حذف' : 'Delete'}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </>
        )}
      </div>

      <div className="w-full flex flex-col gap-3 pt-2">
        <button
          onClick={() => { playClickSound(); claimAll(); }}
          disabled={unclaimedCount === 0}
          className={`w-full py-4 font-black rounded-2xl transition-all flex items-center justify-center gap-2 ${
            unclaimedCount > 0 
              ? 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white shadow-xl shadow-pink-500/20 active:scale-95' 
              : 'bg-slate-800 text-slate-600 cursor-not-allowed border border-white/5'
          }`}
        >
          <Check className="w-5 h-5" />
          <span>{t.claimAll}</span>
          {unclaimedCount > 0 && (
            <span className="bg-white/20 px-2 py-0.5 rounded-lg text-xs">{unclaimedCount}</span>
          )}
        </button>
      </div>
    </motion.div>
  );
};

export default InboxScreen;
