import React from 'react';
import { motion } from 'motion/react';
import { Trophy, Clock, Coins, Sparkles } from 'lucide-react';

interface WeeklyTasksScreenProps {
  t: any;
  stats: any;
  weeklyTasks: any[];
  goToMenu: () => void;
  playClickSound: () => void;
  timeUntilWeeklyReset: string;
}

const WeeklyTasksScreen = React.memo(({ t, stats, weeklyTasks, goToMenu, playClickSound, timeUntilWeeklyReset }: WeeklyTasksScreenProps) => (
  <motion.div
    key="weekly_tasks"
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 1.05 }}
    className="flex flex-col items-center gap-6 p-6 bg-slate-900/90 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-2xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden will-change-transform"
  >
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-center gap-3">
        <Trophy className="w-8 h-8 text-indigo-400" />
        <h2 className="text-3xl font-black">{t.weeklyTasks}</h2>
      </div>
      <div className="flex items-center gap-1 text-slate-500 text-xs">
        <Clock className="w-3 h-3" />
        <span>{t.endsIn}: {timeUntilWeeklyReset}</span>
      </div>
    </div>

    <div className="w-full overflow-y-auto pr-2 space-y-3 custom-scrollbar">
      <div className="bg-indigo-500/10 border border-indigo-500/20 p-3 rounded-2xl flex items-center gap-3 mb-2">
        <Sparkles className="w-5 h-5 text-indigo-400" />
        <p className="text-[10px] text-indigo-300 font-bold leading-tight">
          {stats.language === 'ar' ? 'جميع المكافآت تذهب تلقائياً للصندوق الوارد للاستلام' : 'All rewards are automatically sent to the Inbox for claiming'}
        </p>
      </div>
      {weeklyTasks.map((task: any) => {
        const taskTitle = t.weeklyTasksTitles[task.id as keyof typeof t.weeklyTasksTitles] || task.title;
        const taskDesc = t.weeklyTasksDescs[task.id as keyof typeof t.weeklyTasksDescs] || task.description;

        return (
          <div
            key={task.id}
            className={`p-4 rounded-2xl border transition-all ${
              task.isCompleted 
                ? 'bg-indigo-500/10 border-indigo-500/30' 
                : 'bg-slate-800/50 border-white/5'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="text-3xl">{task.isCompleted ? '✅' : task.icon}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className={`font-bold ${task.isCompleted ? 'text-white' : 'text-slate-300'}`}>{taskTitle}</h3>
                  <div className="flex items-center gap-1 bg-yellow-500/20 px-2 py-0.5 rounded-full">
                    <Coins className="w-3 h-3 text-yellow-400" />
                    <span className="text-[10px] font-bold text-yellow-400">+{task.reward}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-1">{taskDesc}</p>
                
                <div className="mt-3">
                  <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                    <span>{t.progress}</span>
                    <span>{Math.floor(task.currentValue)} / {task.targetValue}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (task.currentValue / task.targetValue) * 100)}%` }}
                      className={`h-full ${task.isCompleted ? 'bg-indigo-500' : 'bg-slate-500'}`}
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

export default WeeklyTasksScreen;
