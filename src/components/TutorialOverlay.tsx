import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { TutorialStep } from '../types';
import { translations, Language } from '../translations';

interface Props { 
  step: TutorialStep; 
  setStep: (s: TutorialStep) => void; 
  lang: Language; 
  setLang: (l: Language) => void; 
}

export const TutorialOverlay: React.FC<Props> = ({ step, setStep, lang, setLang }) => {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setDismissed(false);
  }, [step]);

  if (step === 'finished' || dismissed) return null;
  const t = translations[lang].tutorial;

  if (step === 'lang_select') {
    return (
      <div className="fixed inset-0 z-[1000] flex flex-col items-center justify-center pointer-events-auto bg-black/90 backdrop-blur-md">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col gap-6 w-full max-w-xs">
          <h2 className="text-white text-2xl font-black text-center mb-4">{t.select_lang}</h2>
          <button 
            onClick={() => { setLang('zh'); setStep('welcome'); }}
            className="w-full bg-white text-slate-900 py-4 rounded-2xl font-black text-xl shadow-[0_6px_0_#cbd5e1] active:shadow-[0_0px_0_#cbd5e1] active:translate-y-1.5 transition-all"
          >
            中文
          </button>
          <button 
            onClick={() => { setLang('en'); setStep('welcome'); }}
            className="w-full bg-indigo-500 text-white py-4 rounded-2xl font-black text-xl shadow-[0_6px_0_#4f46e5] active:shadow-[0_0px_0_#4f46e5] active:translate-y-1.5 transition-all"
          >
            English
          </button>
        </motion.div>
      </div>
    );
  }

  const isFocusStep = step === 'double_tap_cmt' || step === 'gacha_pull' || step === 'equip_item';

  return (
    <div className={`fixed inset-0 z-[1000] flex items-center justify-center ${isFocusStep ? 'pointer-events-none' : 'pointer-events-auto'} bg-black/75 backdrop-blur-sm`}>
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative bg-white p-6 rounded-3xl max-w-sm w-full mx-4 shadow-2xl pointer-events-auto">
        <button onClick={() => setStep('finished')} className="absolute top-4 right-4 text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full hover:bg-slate-200">{t.skip}</button>
        
        <div className="text-4xl text-center mt-2 mb-4">✨</div>
        <p className="text-lg font-black text-slate-800 text-center">{t[step as keyof typeof t]}</p>
        
        {step === 'welcome' && (
          <button onClick={() => setStep('swipe_guide')} className="mt-6 w-full bg-indigo-500 text-white py-3 rounded-xl font-bold shadow-[0_4px_0_#4f46e5] active:shadow-none active:translate-y-1 transition-all">
            {lang === 'zh' ? '开始' : 'Start'}
          </button>
        )}
        
        {(step === 'swipe_guide' || step === 'currency_intro') && (
          <button 
            onClick={() => {
              if (step === 'swipe_guide') {
                setDismissed(true);
              } else {
                setDismissed(true);
              }
            }} 
            className="mt-6 w-full bg-indigo-500 text-white py-3 rounded-xl font-bold shadow-[0_4px_0_#4f46e5] active:shadow-none active:translate-y-1 transition-all"
          >
            {lang === 'zh' ? '我明白了' : 'Got it'}
          </button>
        )}
      </motion.div>
    </div>
  );
};
