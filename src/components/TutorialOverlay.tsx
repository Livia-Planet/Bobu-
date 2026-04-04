import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TutorialStep } from '../types';
import { translations, Language } from '../translations';

interface TutorialOverlayProps {
  step: TutorialStep;
  lang: Language;
  onNext: () => void;
}

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ step, lang, onNext }) => {
  const t = translations[lang].tutorial;

  if (step === 'finished' || step === 'merge_basics') return null;

  return (
    <div className="fixed inset-0 z-[990] pointer-events-none flex flex-col items-center justify-center">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm ${step === 'welcome' ? 'pointer-events-auto' : 'pointer-events-none'}`}
      />
      
      <AnimatePresence mode="wait">
        {step === 'welcome' && (
          <motion.div
            key="welcome"
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -20 }}
            className="relative z-10 bg-white dark:bg-slate-800 p-8 rounded-3xl max-w-sm mx-4 shadow-2xl border-4 border-indigo-500 text-center pointer-events-auto"
          >
            <div className="text-6xl mb-4">👋</div>
            <h2 className="text-2xl font-black mb-4 text-slate-800 dark:text-white">{t.welcomeTitle}</h2>
            <p className="text-slate-600 dark:text-slate-300 font-bold mb-8 leading-relaxed">
              {t.welcomeDesc}
            </p>
            <button
              onClick={onNext}
              className="w-full py-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl font-black text-xl shadow-[0_6px_0_#4f46e5] active:shadow-[0_0px_0_#4f46e5] active:translate-y-1.5 transition-all"
            >
              {t.welcomeBtn}
            </button>
          </motion.div>
        )}

        {step === 'double_tap_cmt' && (
          <motion.div
            key="double_tap_cmt"
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="absolute top-1/4 z-10 bg-white dark:bg-slate-800 p-6 rounded-3xl max-w-sm mx-4 shadow-2xl border-4 border-yellow-400 text-center pointer-events-none"
          >
            <div className="text-4xl mb-2">✨</div>
            <p className="text-slate-800 dark:text-white font-black text-lg">
              {t.doubleTapCmt}
            </p>
          </motion.div>
        )}

        {step === 'gacha_pull' && (
          <motion.div
            key="gacha_pull"
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="absolute bottom-48 left-6 z-10 bg-white dark:bg-slate-800 p-4 rounded-2xl max-w-[200px] shadow-2xl border-4 border-pink-400 text-center pointer-events-none"
          >
            <div className="absolute -bottom-3 left-6 w-4 h-4 bg-white dark:bg-slate-800 border-b-4 border-r-4 border-pink-400 rotate-45"></div>
            <p className="text-slate-800 dark:text-white font-black text-sm">
              {t.gachaPull}
            </p>
          </motion.div>
        )}

        {step === 'equip_item' && (
          <motion.div
            key="equip_item"
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="absolute bottom-24 z-10 bg-white dark:bg-slate-800 p-4 rounded-2xl max-w-xs mx-4 shadow-2xl border-4 border-cyan-400 text-center pointer-events-none"
          >
            <p className="text-slate-800 dark:text-white font-black text-sm">
              {t.equipItem}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
