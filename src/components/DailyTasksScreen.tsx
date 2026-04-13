import React from 'react';
import { motion } from 'motion/react';
import { ListTodo, Clock, Gift, Sparkles, CheckCircle2, Star } from 'lucide-react';

interface DailyTasksScreenProps {
  t: any;
  stats: any;
  goToMenu: () => void;
  playClickSound: () => void;
  timeUntilReset: string;
  allDailyTasksCompleted: boolean;
  claimDailyChest: () => void;
}

const DailyTasksScreen = React.memo(({ t, stats, goToMenu, playClickSound, timeUntilReset, allDailyTasksCompleted, claimDailyChest }: DailyTasksScreenProps) => (
  <motion.div
    key="daily_tasks"
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    className="flex flex-col items-center gap-6 p-6 bg-slate-900/90 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-2xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden will-change-transform"
  >
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-center gap-3">
        <ListTodo className="w-8 h-8 text-emerald-400" />
        <h2 className="text-3xl font-black">{t.dailyTasks}</h2>
      </div>
      <div className="flex items-center gap-1 text-slate-500 text-xs">
        <Clock className="w-3 h-3" />
        <span>{t.renewsIn}: {timeUntilReset}</span>
      </div>
    </div>

    <div className="w-full overflow-y-auto pr-2 space-y-3 custom-scrollbar">
      <div className="bg-indigo-500/10 border border-indigo-500/20 p-3 rounded-2xl flex items-center gap-3 mb-2">
        <Sparkles className="w-5 h-5 text-indigo-400" />
        <p className="text-[10px] text-indigo-300 font-bold leading-tight">
          {stats.language === 'ar' ? 'جميع المكافآت تذهب تلقائياً للصندوق الوارد للاستلام' : 'All rewards are automatically sent to the Inbox for claiming'}
        </p>
      </div>
      {allDailyTasksCompleted && !stats.dailyChestClaimed && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/20 to-yellow-500/20 border-2 border-amber-500/50 flex flex-col items-center gap-4 text-center mb-4 shadow-lg shadow-amber-500/10"
        >
          <div className="relative">
            <motion.div
              animate={{ 
                rotate: [0, -5, 5, -5, 5, 0],
                scale: [1, 1.05, 1, 1.05, 1]
              }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="p-4 bg-amber-500 rounded-full shadow-xl shadow-amber-500/40"
            >
              <Gift className="w-10 h-10 text-slate-950" />
            </motion.div>
            <motion.div
              animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 0.8] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="absolute -top-2 -right-2"
            >
              <Sparkles className="w-6 h-6 text-yellow-400" />
            </motion.div>
          </div>
          
          <div>
            <h3 className="text-xl font-black text-amber-400">{t.dailyChest}</h3>
            <p className="text-xs text-slate-300 font-medium">{t.allTasksDone}</p>
          </div>
          
          <button
            onClick={claimDailyChest}
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl transition-all shadow-lg shadow-amber-500/20 active:scale-95"
          >
            {t.openChest}
          </button>
        </motion.div>
      )}

      {stats.dailyTasks.map((task: any) => {
        const taskTitle = t.dailyTasksTitles[task.id as keyof typeof t.dailyTasksTitles] || task.title;
        const taskDesc = t.dailyTasksDescs[task.id as keyof typeof t.dailyTasksDescs] || task.description;

        return (
          <div
            key={task.id}
            className={`p-4 rounded-2xl border transition-all ${
              task.isCompleted 
                ? 'bg-emerald-500/10 border-emerald-500/30' 
                : 'bg-slate-800/50 border-white/5'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-lg ${task.isCompleted ? 'bg-emerald-500/20' : 'bg-slate-700'}`}>
                {task.isCompleted ? <CheckCircle2 className="w-6 h-6 text-emerald-400" /> : <Star className="w-6 h-6 text-slate-400" />}
              </div>
              <div className="flex-1">
                <h3 className={`font-bold ${task.isCompleted ? 'text-white' : 'text-slate-300'}`}>{taskTitle}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{taskDesc}</p>
                
                <div className="mt-2">
                  <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                    <span>{task.isCompleted ? t.completed : t.progress}</span>
                    <span>{Math.floor(task.currentValue)} / {task.targetValue}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (task.currentValue / task.targetValue) * 100)}%` }}
                      className={`h-full ${task.isCompleted ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>

    <button
      onClick={() => { playClickSound(); goToMenu(); }}
      className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl transition-all mt-2"
    >
      {t.back}
    </button>
  </motion.div>
));

export default DailyTasksScreen;
