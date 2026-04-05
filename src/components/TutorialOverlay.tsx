import React from 'react';
import { motion } from 'motion/react';
import { TutorialStep } from '../types';
import { translations, Language } from '../translations';

interface Props { 
  step: TutorialStep; 
  setStep: (s: TutorialStep) => void; 
  lang: Language; 
}

export const TutorialOverlay: React.FC<Props> = ({ step, setStep, lang }) => {
  if (step === 'finished' || step === 'lang_select') return null;
  const t = translations[lang].tutorial;

  if (step === 'welcome') {
    return (
      <div className="fixed inset-0 z-[1000] flex items-center justify-center pointer-events-auto bg-black/75 backdrop-blur-sm">
        <motion.div 
          initial={{ scale: 0, opacity: 0, rotate: -10 }} 
          animate={{ scale: 1, opacity: 1, rotate: 0 }} 
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
          className="relative bg-white p-8 rounded-3xl max-w-sm w-full mx-4 shadow-2xl pointer-events-auto"
        >
          <div className="text-6xl text-center mb-4">👋</div>
          <p className="text-2xl font-black text-slate-800 text-center leading-relaxed">{t.welcome}</p>
          
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setStep('swipe_guide')} 
            className="mt-8 w-full bg-indigo-500 text-white py-4 rounded-2xl font-black text-xl shadow-[0_6px_0_#4f46e5] active:shadow-none active:translate-y-1.5 transition-all"
          >
            {lang === 'zh' ? '开始实验' : 'Start'}
          </motion.button>
        </motion.div>
      </div>
    );
  }

  if (step === 'swipe_guide') {
    return (
      <div className="fixed inset-0 z-[1000] pointer-events-none flex items-center justify-center bg-transparent mt-32">
        <motion.div
          animate={{ x: [-120, 120, -120] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          className="text-8xl pointer-events-none"
        >
          👇
        </motion.div>
      </div>
    );
  }

  return null;
};
