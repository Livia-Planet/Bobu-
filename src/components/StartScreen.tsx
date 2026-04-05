import React, { useState } from 'react';
import { motion } from 'motion/react';
import { GameState, TutorialStep } from '../types';
import { Language } from '../translations';
import { soundEngine } from '../SoundEngine';

interface Props {
  setGameState: (state: GameState) => void;
  setLang: (lang: Language) => void;
  tutorialStep: TutorialStep;
  setTutorialStep: (step: TutorialStep) => void;
}

export const StartScreen: React.FC<Props> = ({ setGameState, setLang, tutorialStep, setTutorialStep }) => {
  const [selectedLang, setSelectedLang] = useState<Language | null>(null);

  const handleSelect = (lang: Language) => {
    if (selectedLang) return;
    soundEngine.playClick();
    setLang(lang);
    setSelectedLang(lang);
    
    if (tutorialStep === 'lang_select') {
      setTutorialStep('welcome');
    }

    setTimeout(() => {
      setGameState('playing');
    }, 1000);
  };

  const handleResetTutorial = () => {
    localStorage.removeItem('bobu_tutorial');
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-[2000] bg-slate-900 flex flex-col items-center justify-center overflow-hidden">
      <motion.div
        initial={{ y: -800, rotate: -20 }}
        animate={{ y: 0, rotate: 0 }}
        transition={{ type: "spring", bounce: 0.6, duration: 1 }}
        className="flex flex-col items-center justify-center gap-8"
      >
        <motion.div
          animate={
            selectedLang === 'zh'
              ? { scale: [1, 1.1, 1.1, 50], opacity: [1, 1, 1, 0], y: [0, -20, -20, -20] }
              : selectedLang === 'en'
              ? { x: [0, -200, -500], y: [0, -100, 300], scale: [1, 0.5, 0], rotate: -720 }
              : { y: [0, -15, 0], rotate: [0, -5, 5, 0] }
          }
          transition={
            selectedLang === 'zh'
              ? { duration: 1, times: [0, 0.2, 0.7, 1], ease: "easeInOut" }
              : selectedLang === 'en'
              ? { duration: 0.8, ease: "easeIn" }
              : { repeat: Infinity, repeatDelay: 1.5, duration: 0.8 }
          }
          onClick={() => handleSelect('zh')}
          className="relative w-48 h-48 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-3xl shadow-[0_10px_20px_rgba(56,189,248,0.4)] flex flex-col items-center justify-center cursor-pointer border-4 border-white/20 z-10"
        >
          {/* Eyes */}
          <div className="absolute top-6 flex gap-6">
            <motion.div
              animate={selectedLang === 'en' ? { opacity: 0 } : { scaleY: [1, 0.1, 1] }}
              transition={selectedLang === null ? { repeat: Infinity, repeatDelay: 3, duration: 0.2 } : {}}
              className="w-3 h-5 bg-slate-900 rounded-full"
            />
            <motion.div
              animate={selectedLang === 'en' ? { opacity: 0 } : { scaleY: [1, 0.1, 1] }}
              transition={selectedLang === null ? { repeat: Infinity, repeatDelay: 3, duration: 0.2 } : {}}
              className="w-3 h-5 bg-slate-900 rounded-full"
            />
          </div>
          
          {/* Mouth */}
          {selectedLang === 'zh' && (
            <motion.svg
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1, 1, 5] }}
              transition={{ duration: 1, times: [0, 0.2, 0.7, 1] }}
              className="absolute top-14 w-8 h-4 text-slate-900"
              viewBox="0 0 24 12"
              fill="currentColor"
            >
              <path d="M0 0 Q12 12 24 0 Z" />
            </motion.svg>
          )}

          <span className="text-white font-black text-4xl mt-4">中文</span>
        </motion.div>

        <motion.div
          animate={
            selectedLang === 'en'
              ? { scale: [1, 1.1, 1.1, 50], opacity: [1, 1, 1, 0], y: [0, -20, -20, -20] }
              : selectedLang === 'zh'
              ? { x: [0, 200, 500], y: [0, -100, 300], scale: [1, 0.5, 0], rotate: 720 }
              : { y: [0, -15, 0], rotate: [0, 5, -5, 0] }
          }
          transition={
            selectedLang === 'en'
              ? { duration: 1, times: [0, 0.2, 0.7, 1], ease: "easeInOut" }
              : selectedLang === 'zh'
              ? { duration: 0.8, ease: "easeIn" }
              : { repeat: Infinity, repeatDelay: 2, duration: 0.8 }
          }
          onClick={() => handleSelect('en')}
          className="relative w-48 h-48 bg-gradient-to-br from-purple-400 to-pink-500 rounded-3xl shadow-[0_10px_20px_rgba(192,132,252,0.4)] flex flex-col items-center justify-center cursor-pointer border-4 border-white/20 z-10"
        >
          {/* Eyes */}
          <div className="absolute top-6 flex gap-6">
            <motion.div
              animate={selectedLang === 'zh' ? { opacity: 0 } : { scaleY: [1, 0.1, 1] }}
              transition={selectedLang === null ? { repeat: Infinity, repeatDelay: 3.5, duration: 0.2 } : {}}
              className="w-3 h-5 bg-slate-900 rounded-full"
            />
            <motion.div
              animate={selectedLang === 'zh' ? { opacity: 0 } : { scaleY: [1, 0.1, 1] }}
              transition={selectedLang === null ? { repeat: Infinity, repeatDelay: 3.5, duration: 0.2 } : {}}
              className="w-3 h-5 bg-slate-900 rounded-full"
            />
          </div>

          {/* Mouth */}
          {selectedLang === 'en' && (
            <motion.svg
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1, 1, 5] }}
              transition={{ duration: 1, times: [0, 0.2, 0.7, 1] }}
              className="absolute top-14 w-8 h-4 text-slate-900"
              viewBox="0 0 24 12"
              fill="currentColor"
            >
              <path d="M0 0 Q12 12 24 0 Z" />
            </motion.svg>
          )}

          <span className="text-white font-black text-4xl mt-4">English</span>
        </motion.div>
      </motion.div>

      <button
        onClick={handleResetTutorial}
        className="absolute bottom-4 right-4 bg-white/10 text-white/50 text-xs px-2 py-1 rounded hover:bg-white/20 hover:text-white transition-colors z-50"
      >
        Reset Tutorial
      </button>
    </div>
  );
};
