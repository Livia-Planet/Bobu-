import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GameState } from '../types';
import { Language } from '../translations';
import { soundEngine } from '../SoundEngine';

interface Props {
  setGameState: (state: GameState) => void;
  setLang: (lang: Language) => void;
}

export const StartScreen: React.FC<Props> = ({ setGameState, setLang }) => {
  const [selected, setSelected] = useState<Language | null>(null);

  const handleSelect = (lang: Language) => {
    soundEngine.playClick();
    setLang(lang);
    setSelected(lang);
    setTimeout(() => {
      setGameState('playing');
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-[2000] bg-slate-900 flex flex-col items-center justify-center overflow-hidden">
      <AnimatePresence>
        {!selected && (
          <motion.div
            initial={{ scale: 0, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: -50 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="flex flex-col gap-6 w-full max-w-xs"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleSelect('zh')}
              className="w-full bg-white text-slate-900 py-6 rounded-3xl font-black text-3xl shadow-[0_8px_0_#cbd5e1] active:shadow-[0_0px_0_#cbd5e1] active:translate-y-2 transition-all"
            >
              🇨🇳 中文
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleSelect('en')}
              className="w-full bg-indigo-500 text-white py-6 rounded-3xl font-black text-3xl shadow-[0_8px_0_#4f46e5] active:shadow-[0_0px_0_#4f46e5] active:translate-y-2 transition-all"
            >
              🇬🇧 English
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
