import React from 'react';
import { motion } from 'motion/react';
import { translations, Language } from '../translations';

export const Leaderboard = ({ bestScore, lifetimeScore, lang, isDarkMode }: { bestScore: number, lifetimeScore: number, lang: Language, isDarkMode: boolean }) => {
  const t = translations[lang];

  return (
    <div className="flex flex-col gap-6 max-w-md mx-auto">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className={`rounded-3xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.05)] border relative overflow-hidden
          ${isDarkMode ? 'bg-indigo-950 border-indigo-500/30' : 'bg-white border-slate-100'}
        `}
      >
        <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-amber-200 to-orange-400 rounded-full opacity-20 blur-2xl"></div>
        <div className={`font-bold uppercase tracking-widest text-xs mb-2 ${isDarkMode ? 'text-indigo-300' : 'text-slate-400'}`}>
          {t.leaderboardTab.bestScore}
        </div>
        <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
          {bestScore}
        </div>
        <div className="mt-4 flex items-center gap-2">
          <span className="text-2xl">🏆</span>
          <span className={`text-sm font-medium ${isDarkMode ? 'text-indigo-200' : 'text-slate-500'}`}>
            {t.leaderboardTab.medalOfPride}
          </span>
        </div>
      </motion.div>

      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1 }}
        className={`rounded-3xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.05)] border relative overflow-hidden
          ${isDarkMode ? 'bg-indigo-950 border-indigo-500/30' : 'bg-white border-slate-100'}
        `}
      >
        <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-cyan-200 to-blue-400 rounded-full opacity-20 blur-2xl"></div>
        <div className={`font-bold uppercase tracking-widest text-xs mb-2 ${isDarkMode ? 'text-indigo-300' : 'text-slate-400'}`}>
          {t.leaderboardTab.lifetimeScore}
        </div>
        <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
          {lifetimeScore}
        </div>
        <div className="mt-4 flex items-center gap-2">
          <span className="text-2xl">🌌</span>
          <span className={`text-sm font-medium ${isDarkMode ? 'text-indigo-200' : 'text-slate-500'}`}>
            {t.leaderboardTab.pioneerCert}
          </span>
        </div>
      </motion.div>
    </div>
  );
};
