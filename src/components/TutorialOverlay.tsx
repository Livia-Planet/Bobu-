import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TutorialStep } from '../types';
import { translations, Language } from '../translations';

interface TutorialOverlayProps {
  step: TutorialStep;
  lang: Language;
  onNext: () => void;
  onSkip: () => void;
}

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ step, lang, onNext, onSkip }) => {
  const t = translations[lang].tutorial;

  if (step === 'finished' || step === 'merge_basics') return null;

  const isFocusStep = step === 'double_tap_cmt' || step === 'gacha_pull' || step === 'equip_item';

  return (
    <div className={`fixed inset-0 z-[1000] flex flex-col items-center justify-center ${isFocusStep || step === 'welcome' ? 'pointer-events-auto' : 'pointer-events-none'}`}>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`absolute inset-0 ${isFocusStep ? 'bg-black/75 backdrop-blur-sm' : 'bg-black/60 backdrop-blur-sm'}`}
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

        {isFocusStep && (
          <motion.div
            key="focus_bubble"
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="relative z-10 bg-white dark:bg-slate-800 p-6 rounded-3xl max-w-sm mx-4 shadow-2xl border-4 border-yellow-400 text-center pointer-events-auto"
          >
            <button 
              onClick={onSkip}
              className="absolute -top-3 -right-3 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-full px-3 py-1 text-xs font-bold shadow-md transition-colors"
            >
              {t.skip}
            </button>
            <div className="text-4xl mb-2">✨</div>
            <p className="text-slate-800 dark:text-white font-black text-lg">
              {step === 'double_tap_cmt' && t.doubleTapCmt}
              {step === 'gacha_pull' && t.gachaPull}
              {step === 'equip_item' && t.equipItem}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
