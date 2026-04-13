import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Inbox, Coins, Shield, Timer, Magnet, Package, Check, Bell, Trash2 } from 'lucide-react';
import { InboxItem } from '../types';

interface InboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: any;
  t: any;
  claimItem: (id: string) => void;
  claimAll: () => void;
  deleteItem: (id: string) => void;
}

const InboxModal = ({ isOpen, onClose, stats, t, claimItem, claimAll, deleteItem }: InboxModalProps) => {
  const unclaimedCount = stats.inbox.filter((item: InboxItem) => !item.isClaimed).length;

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
            className="relative bg-slate-900 border border-white/10 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
          >
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Inbox className="w-8 h-8 text-pink-400" />
                  {unclaimedCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full font-bold animate-pulse">
                      {unclaimedCount}
                    </span>
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white">{t.inbox}</h2>
                  <p className="text-xs text-slate-400">{t.inboxDesc}</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-full transition-colors"
              >
                <Package className="w-6 h-6 text-slate-400 rotate-45" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {stats.inbox.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500 gap-4">
                  <Inbox className="w-16 h-16 opacity-20" />
                  <p className="font-medium">{t.noMessages}</p>
                </div>
              ) : (
                [...stats.inbox].sort((a, b) => {
                  if (a.isClaimed !== b.isClaimed) {
                    return a.isClaimed ? 1 : -1;
                  }
                  return b.timestamp - a.timestamp;
                }).map((item: InboxItem) => (
                  <div 
                    key={item.id}
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
                        <p className="text-xs text-slate-400 mt-0.5">{item.description}</p>
                        <p className="text-[10px] text-slate-500 mt-1">
                          {new Date(item.timestamp).toLocaleString(stats.language === 'ar' ? 'ar-EG' : 'en-US')}
                        </p>
                      </div>
                      {item.isClaimed && (
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-emerald-500/20 rounded-full">
                            <Check className="w-4 h-4 text-emerald-400" />
                          </div>
                          <button
                            onClick={() => deleteItem(item.id)}
                            className="p-2 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 rounded-xl transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      {!item.isClaimed && (
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => claimItem(item.id)}
                            className="px-4 py-2 bg-pink-500 hover:bg-pink-400 text-white text-xs font-bold rounded-xl transition-all active:scale-95"
                          >
                            {t.claimReward}
                          </button>
                          <button
                            onClick={() => deleteItem(item.id)}
                            className="p-2 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 rounded-xl transition-colors flex items-center justify-center"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-6 bg-slate-800/50 border-t border-white/5 flex gap-3">
              <button
                onClick={claimAll}
                disabled={unclaimedCount === 0}
                className={`flex-1 py-3 font-bold rounded-2xl transition-all ${
                  unclaimedCount > 0 
                    ? 'bg-pink-500 hover:bg-pink-400 text-white shadow-lg shadow-pink-500/20 active:scale-95' 
                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                }`}
              >
                {t.claimAll}
              </button>
              <button
                onClick={onClose}
                className="px-8 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-2xl transition-all"
              >
                {t.back}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default InboxModal;
