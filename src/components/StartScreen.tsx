import React, { useState } from 'react';
import { motion } from 'motion/react';
import { GameState } from '../types';
import { Language } from '../translations';
import { soundEngine } from '../SoundEngine';

interface Props {
  setGameState: (state: GameState) => void;
  setLang: (lang: Language) => void;
}

export const StartScreen: React.FC<Props> = ({ setGameState, setLang }) => {
  const [selectedLang, setSelectedLang] = useState<Language | null>(null);

  const handleSelect = (lang: Language) => {
    if (selectedLang) return;
    soundEngine.playClick();
    setLang(lang);
    setSelectedLang(lang);
    setTimeout(() => {
      setGameState('playing');
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[2000] bg-slate-900 flex flex-col items-center justify-center overflow-hidden gap-8">
      <motion.div
        animate={
          selectedLang === 'zh'
            ? { scale: 1.1, y: -20 }
            : selectedLang === 'en'
            ? { x: [0, -200, -500], y: [0, -100, 300], scale: [1, 0.5, 0], rotate: -720 }
            : { y: [0, -15, 0], rotate: [0, -5, 5, 0] }
        }
        transition={
          selectedLang === 'zh'
            ? { type: "spring", stiffness: 300, damping: 15 }
            : selectedLang === 'en'
            ? { duration: 0.8, ease: "easeIn" }
            : { repeat: Infinity, repeatDelay: 1.5, duration: 0.8 }
        }
        onClick={() => handleSelect('zh')}
        className="relative w-48 h-48 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-3xl shadow-[0_10px_20px_rgba(56,189,248,0.4)] flex flex-col items-center justify-center cursor-pointer border-4 border-white/20"
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
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
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
            ? { scale: 1.1, y: -20 }
            : selectedLang === 'zh'
            ? { x: [0, 200, 500], y: [0, -100, 300], scale: [1, 0.5, 0], rotate: 720 }
            : { y: [0, -15, 0], rotate: [0, 5, -5, 0] }
        }
        transition={
          selectedLang === 'en'
            ? { type: "spring", stiffness: 300, damping: 15 }
            : selectedLang === 'zh'
            ? { duration: 0.8, ease: "easeIn" }
            : { repeat: Infinity, repeatDelay: 2, duration: 0.8 }
        }
        onClick={() => handleSelect('en')}
        className="relative w-48 h-48 bg-gradient-to-br from-purple-400 to-pink-500 rounded-3xl shadow-[0_10px_20px_rgba(192,132,252,0.4)] flex flex-col items-center justify-center cursor-pointer border-4 border-white/20"
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
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className="absolute top-14 w-8 h-4 text-slate-900"
            viewBox="0 0 24 12"
            fill="currentColor"
          >
            <path d="M0 0 Q12 12 24 0 Z" />
          </motion.svg>
        )}

        <span className="text-white font-black text-4xl mt-4">English</span>
      </motion.div>
    </div>
  );
};
