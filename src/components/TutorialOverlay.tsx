import React from 'react';
import { motion } from 'motion/react';
import { TutorialStep } from '../types';
import { translations, Language } from '../translations';

interface Props { step: TutorialStep; setStep: (s: TutorialStep) => void; lang: Language; }

export const TutorialOverlay: React.FC<Props> = ({ step, setStep, lang }) => {
  if (step === 'finished' || step === 'merge_basics') return null;
  const t = translations[lang].tutorial;
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center pointer-events-auto bg-black/75 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative bg-white p-6 rounded-3xl max-w-sm w-full mx-4 shadow-2xl">
        <button onClick={() => setStep('finished')} className="absolute top-4 right-4 text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full hover:bg-slate-200">{t.skip}</button>
        <p className="text-lg font-black text-slate-800 mt-4 text-center">{t[step as keyof typeof t]}</p>
        {step === 'welcome' && <button onClick={() => setStep('merge_basics')} className="mt-6 w-full bg-indigo-500 text-white py-3 rounded-xl font-bold">开始实验</button>}
      </motion.div>
    </div>
  );
};
