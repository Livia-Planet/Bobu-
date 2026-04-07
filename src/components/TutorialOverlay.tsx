import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TutorialStep } from '../types';
import { translations, Language } from '../translations';

interface Props { 
  step: TutorialStep; 
  advanceTutorial: (step: TutorialStep) => void; 
  lang: Language; 
}

export const TutorialOverlay: React.FC<Props> = ({ step, advanceTutorial, lang }) => {
  const t = translations[lang].tutorial;

  const getBubbleConfig = () => {
    if (!step || step === 'finished') return null;
    switch (step) {
      case 'welcome':
      case 'swipe_guide':
        return {
          text: step === 'welcome' ? t.welcome : t.swipe_guide,
          position: 'top-1/4 left-1/2 -translate-x-1/2',
          tailClass: 'bottom-[-10px] left-1/2 -translate-x-1/2 border-t-indigo-500',
          icon: '📱',
          color: 'bg-indigo-500 text-white',
          animation: { y: [-5, 5, -5] },
          showNext: false
        };
      case 'powerup_intro':
        return {
          text: t.powerup_intro,
          position: 'top-1/3 right-16',
          tailClass: 'right-[-10px] top-1/2 -translate-y-1/2 border-l-[12px] border-l-orange-400 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent !border-r-0',
          icon: '✨',
          color: 'bg-orange-400 text-white',
          animation: { x: [-5, 5, -5] },
          showNext: true,
          nextStep: 'gacha_guide'
        };
      case 'gacha_guide':
        return {
          text: t.gacha_guide,
          position: 'bottom-48 left-6',
          tailClass: 'bottom-[-10px] left-8 border-t-[12px] border-t-pink-400 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent !border-b-0',
          icon: '🪙',
          color: 'bg-pink-400 text-white',
          animation: { y: [-5, 5, -5] },
          showNext: false
        };
      case 'equip_guide':
        return {
          text: t.equip_guide,
          position: 'bottom-36 left-1/2 -translate-x-1/2',
          tailClass: 'bottom-[-10px] left-1/2 -translate-x-1/2 border-t-[12px] border-t-cyan-400 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent !border-b-0',
          icon: '🎒',
          color: 'bg-cyan-400 text-white',
          animation: { y: [-5, 5, -5] },
          showNext: false
        };
      case 'celebration':
        return {
          text: (t as any).celebration,
          position: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
          tailClass: 'hidden',
          icon: '🎉',
          color: 'bg-yellow-500 text-white',
          animation: { scale: [1, 1.05, 1] },
          showNext: false,
          customButton: lang === 'zh' ? '开始游戏' : "Let's Go!",
          customAction: 'finished'
        };
      case 'law_intro':
        return {
          text: (t as any).law_intro,
          position: 'top-24 left-1/2 -translate-x-1/2',
          tailClass: 'hidden',
          icon: '🌌',
          color: 'bg-purple-500 text-white',
          animation: { y: [-5, 5, -5] },
          showNext: false,
          customButton: lang === 'zh' ? '我知道了' : 'Got it',
          customAction: 'finished'
        };
      default:
        return null;
    }
  };

  const config = getBubbleConfig();

  return (
    <div className={`absolute inset-0 z-[9999] ${step === 'celebration' ? 'pointer-events-auto bg-black/40 backdrop-blur-sm' : 'pointer-events-none'} overflow-hidden`}>
      <AnimatePresence mode="wait">
        {config && (
          <motion.div
            key={step}
            initial={{ scale: 0, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: -20 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className={`absolute ${config.position} max-w-[280px] w-max pointer-events-none`}
          >
            <motion.div
              animate={config.animation}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className={`relative p-4 rounded-2xl shadow-[0_10px_25px_rgba(0,0,0,0.2)] flex items-center gap-3 ${config.color} border-2 border-black/5`}
            >
              {/* Icon */}
              <motion.div
                animate={step === 'welcome' || step === 'swipe_guide' ? { rotate: [-15, 15, -15] } : {}}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                className="text-3xl shrink-0"
              >
                {config.icon}
              </motion.div>

              {/* Text */}
              <p className="font-bold text-sm leading-snug">
                {config.text}
              </p>

              {/* Tail */}
              <div className={`absolute w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[12px] ${config.tailClass}`} />
            </motion.div>

            {/* Next Button */}
            {config.showNext && (
              <div className="mt-4 flex justify-center">
                <button
                  onClick={() => {
                    if (config.nextStep) advanceTutorial(config.nextStep as TutorialStep);
                  }}
                  className="pointer-events-auto bg-white/20 hover:bg-white/30 text-white font-bold text-sm px-6 py-2 rounded-full shadow-lg transition-transform active:scale-95 backdrop-blur-sm"
                >
                  Next
                </button>
              </div>
            )}

            {/* Custom Button */}
            {config.customButton && (
              <div className="mt-4 flex justify-center">
                <button
                  onClick={() => {
                    if (config.customAction) advanceTutorial(config.customAction as TutorialStep);
                  }}
                  className="pointer-events-auto bg-white text-slate-800 font-black text-sm px-8 py-3 rounded-full shadow-xl transition-transform active:scale-95"
                >
                  {config.customButton}
                </button>
              </div>
            )}

            {/* Skip Button (only for welcome/swipe) */}
            {(step === 'welcome' || step === 'swipe_guide') && (
              <div className="mt-16 flex justify-center">
                <button
                  onClick={() => {
                    advanceTutorial('finished');
                  }}
                  className="pointer-events-auto bg-black/20 hover:bg-black/30 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm transition-colors"
                >
                  {t.skip}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
