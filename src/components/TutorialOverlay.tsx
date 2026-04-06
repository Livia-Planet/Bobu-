import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TutorialStep } from '../types';
import { translations, Language } from '../translations';

interface Props { 
  step: TutorialStep; 
  finishTutorial: (step: string) => void; 
  lang: Language; 
}

export const TutorialOverlay: React.FC<Props> = ({ step, finishTutorial, lang }) => {
  const t = translations[lang].tutorial;

  const getBubbleConfig = () => {
    if (!step || step === 'finished') return null;
    switch (step) {
      case 'welcome':
      case 'swipe_guide':
        return {
          text: step === 'welcome' ? t.welcome : t.swipe_guide,
          position: 'top-32 left-1/2 -translate-x-1/2',
          tailClass: 'bottom-[-10px] left-1/2 -translate-x-1/2 border-t-white',
          icon: '📱',
          color: 'bg-white text-slate-800',
          animation: { y: [-5, 5, -5] },
          showHand: true,
          handIcon: '👆',
          handAnimation: { x: [-30, 30, -30] },
          handPosition: 'top-[120%] left-1/2 -translate-x-1/2',
          clickable: false
        };
      case 'powerup_intro':
        return {
          text: t.powerup_intro,
          position: 'top-1/2 right-20 -translate-y-1/2',
          tailClass: 'top-1/2 right-[-10px] -translate-y-1/2 border-l-[12px] border-l-white border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent !border-r-0 !border-t-transparent !border-b-transparent',
          icon: '✨',
          color: 'bg-white text-slate-800',
          animation: { x: [-5, 5, -5] },
          showHand: true,
          handIcon: '👉',
          handAnimation: { x: [0, 10, 0] },
          handPosition: 'top-1/2 right-[-40px] -translate-y-1/2',
          clickable: true
        };
      case 'token_intro':
        return {
          text: t.token_intro,
          position: 'bottom-32 left-24',
          tailClass: 'top-1/2 left-[-10px] -translate-y-1/2 border-r-[12px] border-r-white border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent !border-l-0 !border-t-transparent !border-b-transparent',
          icon: '🪙',
          color: 'bg-white text-slate-800',
          animation: { x: [-5, 5, -5] },
          showHand: true,
          handIcon: '👈',
          handAnimation: { x: [0, -10, 0] },
          handPosition: 'top-1/2 left-[-40px] -translate-y-1/2',
          clickable: true
        };
      case 'equip_new_item':
        return {
          text: t.equip_new_item,
          position: 'bottom-24 left-1/2 -translate-x-1/2',
          tailClass: 'bottom-[-10px] left-1/2 -translate-x-1/2 border-t-[12px] border-t-white border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent !border-b-0',
          icon: '🎒',
          color: 'bg-white text-slate-800',
          animation: { y: [-5, 5, -5] },
          showHand: true,
          handIcon: '👇',
          handAnimation: { y: [0, 10, 0] },
          handPosition: 'top-[120%] left-1/2 -translate-x-1/2',
          clickable: true
        };
      default:
        return null;
    }
  };

  const config = getBubbleConfig();

  return (
    <div 
      className={`absolute inset-0 z-[9999] ${config?.clickable ? 'pointer-events-auto' : 'pointer-events-none'} overflow-hidden`}
      onClick={() => {
        if (config?.clickable && step) {
          finishTutorial(step);
        }
      }}
    >
      <AnimatePresence mode="wait">
        {config && (
          <motion.div
            key={step}
            initial={{ scale: 0, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: -20 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className={`absolute ${config.position} max-w-[280px] w-max`}
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

            {/* Dynamic Hand */}
            {config.showHand && (
              <motion.div
                animate={config.handAnimation}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                className={`absolute text-4xl ${config.handPosition}`}
              >
                {config.handIcon}
              </motion.div>
            )}

            {/* Skip Button (only for welcome/swipe) */}
            {(step === 'welcome' || step === 'swipe_guide') && (
              <div className="mt-16 flex justify-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    finishTutorial(step as string);
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
