import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { gachaPool, planetDatabase } from '../constants';
import { PlanetEyes, URAccessory } from './PlanetTile';

// Helper for rendering the pulled item
const renderPulledItemVisual = (item: GachaItem) => {
  if (item.type === 'TileSkin') {
    const tileSkin = item as any;
    const color = planetDatabase[tileSkin.value]?.color || 'bg-slate-200';
    
    return (
      <div className="w-full h-full scale-[2.5] flex items-center justify-center">
        <PlanetVisual 
          value={tileSkin.value} 
          form={tileSkin.form} 
          rarity={tileSkin.rarity} 
          color={color} 
        />
      </div>
    );
  }
  
  // For other types (SoundKit, MusicTrack, BoardTheme)
  return (
    <div className={`w-full h-full rounded-[3rem] flex items-center justify-center text-7xl shadow-2xl bg-slate-800 text-white`}>
      {item.type === 'SoundKit' ? '🔊' : item.type === 'MusicTrack' ? '🎵' : '🖼️'}
    </div>
  );
};
import { soundEngine } from '../SoundEngine';
import { Coins, Sparkles } from 'lucide-react';
import { GachaItem } from '../types';
import { PlanetVisual } from './LabLog';

import { translations, Language } from '../translations';

interface GachaMachineProps {
  plusCoins: number;
  setPlusCoins: React.Dispatch<React.SetStateAction<number>>;
  gachaCollection: string[];
  setGachaCollection: React.Dispatch<React.SetStateAction<string[]>>;
  newGachaItems: string[];
  setNewGachaItems: React.Dispatch<React.SetStateAction<string[]>>;
  isDarkMode: boolean;
  lang: Language;
  tutorialStep?: string | null;
  setTutorialStep?: (step: any) => void;
  finishTutorial?: (step: string) => void;
}

export const GachaMachine: React.FC<GachaMachineProps> = ({ plusCoins, setPlusCoins, gachaCollection, setGachaCollection, newGachaItems, setNewGachaItems, isDarkMode, lang, tutorialStep, setTutorialStep, finishTutorial, setHasPulledGacha }: any) => {
  const [pullStage, setPullSequence] = useState<'idle' | 'churning' | 'flash' | 'speedlines' | 'reveal'>('idle');
  const [pulledItem, setPulledItem] = useState<GachaItem | null>(null);
  const [pullRarity, setPullRarity] = useState<'N' | 'R' | 'SR' | 'UR' | null>(null);
  const t = translations[lang];

  const speedlines = React.useMemo(() => Array.from({ length: 20 }).map((_, i) => ({ 
    id: i, 
    top: Math.random() * 100, 
    width: Math.random() * 50 + 50, 
    delay: Math.random() * 0.2 
  })), []);

  const vibrate = (pattern: number | number[]) => {
    if (typeof window !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  };

  const handlePull = () => {
    if (plusCoins < 5 || pullStage !== 'idle') return;
    
    setPlusCoins(prev => prev - 5);
    setPullSequence('churning');
    setPulledItem(null);
    setPullRarity(null);
    setHasPulledGacha(true);
    
    soundEngine.playCoinInsert();
    vibrate(50);

    // Determine rarity
    const rand = Math.random() * 100;
    let rarity: 'N' | 'R' | 'SR' | 'UR' = 'N';
    if (rand < 5) rarity = 'UR';
    else if (rand < 20) rarity = 'SR';
    else if (rand < 50) rarity = 'R';
    else rarity = 'N';

    // Get items of this rarity
    const pool = gachaPool.filter(item => item.rarity === rarity);
    const pulled = pool[Math.floor(Math.random() * pool.length)];

    setPulledItem(pulled);
    setPullRarity(rarity);

    // Animation sequence
    const gearInterval = setInterval(() => {
      soundEngine.playGearTurn();
      vibrate(20);
    }, 150);

    setTimeout(() => {
      clearInterval(gearInterval);
      setPullSequence('flash');
      soundEngine.playBling();
    }, 1200);

    setTimeout(() => {
      setPullSequence('speedlines');
    }, 1350);

    setTimeout(() => {
      setPullSequence('reveal');
      vibrate([100, 50, 100]);
      soundEngine.playGachaReveal();
      setGachaCollection(prev => [...prev, pulled.id]);
      setNewGachaItems(prev => [...prev, pulled.id]);
    }, 2500);
  };

  const getRarityColor = (rarity: string | null) => {
    switch (rarity) {
      case 'UR': return 'text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500';
      case 'SR': return 'text-yellow-500';
      case 'R': return 'text-purple-500';
      case 'N': return 'text-slate-600';
      default: return 'text-slate-800';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-4 relative bg-pink-200">
      {/* Header */}
      <div className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 rounded-full font-bold shadow-md bg-white text-yellow-600 border-4 border-white">
        <Coins size={20} />
        <span>{plusCoins}</span>
      </div>

      {/* Gacha Machine */}
      <div className="relative flex flex-col items-center justify-center mt-12 mb-16">
        
        {/* 投币提示 */}
        <div className="absolute -top-12 -right-8 z-20 bg-amber-200 rotate-6 p-3 rounded-xl border-4 border-amber-400 shadow-lg max-w-[120px] text-center">
          <p className="text-amber-800 font-black text-sm leading-tight">{t.gacha.hint}</p>
        </div>

        <motion.div 
          animate={
            pullStage === 'idle' ? { x: 0, y: 0, rotate: 0, scale: 1, scaleX: 1, scaleY: 1, skewX: 0 } :
            pullStage === 'churning' ? {
              x: [0, -15, 20, -25, 10, -5, 0],
              y: [0, -30, 15, -40, 20, 5, 0],
              rotate: [0, -25, 35, -45, 15, -10, 0],
              scaleX: [1, 0.9, 1.1, 0.8, 1.15, 0.95, 1],
              scaleY: [1, 1.1, 0.9, 1.2, 0.85, 1.05, 1],
            } : {}
          }
          transition={{ duration: 0.4, repeat: pullStage === 'churning' ? Infinity : 0, ease: "easeInOut" }}
          className="relative z-10 flex flex-col items-center"
        >
          {/* 玻璃罩 */}
          <div className="w-64 h-64 rounded-full border-8 border-white bg-blue-100/40 backdrop-blur-md shadow-inner overflow-hidden relative z-20 flex items-center justify-center">
             {/* Decorative balls inside */}
             <motion.div animate={pullStage === 'churning' ? { y: [0, -40, 0], x: [0, 15, -15, 0], scaleX: [1, 0.8, 1.1, 1], scaleY: [1, 1.2, 0.9, 1], rotate: [0, 30, -30, 0] } : {}} transition={{ duration: 0.4 + Math.random()*0.2, repeat: Infinity, ease: "easeInOut" }} className="absolute bottom-4 left-6 w-16 h-16 bg-pink-400 rounded-full shadow-md border-4 border-white"></motion.div>
             <motion.div animate={pullStage === 'churning' ? { y: [0, -50, 0], x: [0, -20, 20, 0], scaleX: [1, 0.9, 1.2, 1], scaleY: [1, 1.1, 0.8, 1], rotate: [0, -40, 20, 0] } : {}} transition={{ duration: 0.4 + Math.random()*0.2, repeat: Infinity, ease: "easeInOut" }} className="absolute bottom-8 right-8 w-14 h-14 bg-purple-400 rounded-full shadow-md border-4 border-white"></motion.div>
             <motion.div animate={pullStage === 'churning' ? { y: [0, -30, 0], x: [0, 25, -10, 0], scaleX: [1, 0.85, 1.15, 1], scaleY: [1, 1.15, 0.85, 1], rotate: [0, 25, -15, 0] } : {}} transition={{ duration: 0.4 + Math.random()*0.2, repeat: Infinity, ease: "easeInOut" }} className="absolute bottom-20 left-16 w-20 h-20 bg-green-400 rounded-full shadow-md border-4 border-white"></motion.div>
             <motion.div animate={pullStage === 'churning' ? { y: [0, -60, 0], x: [0, -15, 25, 0], scaleX: [1, 0.7, 1.3, 1], scaleY: [1, 1.3, 0.7, 1], rotate: [0, -50, 40, 0] } : {}} transition={{ duration: 0.4 + Math.random()*0.2, repeat: Infinity, ease: "easeInOut" }} className="absolute bottom-16 right-20 w-12 h-12 bg-blue-400 rounded-full shadow-md border-4 border-white"></motion.div>
             <motion.div animate={pullStage === 'churning' ? { y: [0, -45, 0], x: [0, 10, -20, 0], scaleX: [1, 0.95, 1.05, 1], scaleY: [1, 1.05, 0.95, 1], rotate: [0, 15, -25, 0] } : {}} transition={{ duration: 0.4 + Math.random()*0.2, repeat: Infinity, ease: "easeInOut" }} className="absolute top-12 left-24 w-16 h-16 bg-yellow-400 rounded-full shadow-md border-4 border-white"></motion.div>
          </div>

          {/* 底座怪物 */}
          <div className="w-56 h-32 bg-yellow-400 rounded-[3rem] border-8 border-white shadow-xl flex flex-col items-center justify-start -mt-8 pt-10 relative z-10">
            {/* Cute Face */}
            <div className="flex items-center justify-center gap-6">
              <div className="w-4 h-6 bg-yellow-600 rounded-full"></div>
              <div className="w-4 h-6 bg-yellow-600 rounded-full"></div>
            </div>
          </div>
          
          {/* 抽卡按钮 (粉色大舌头) */}
          <motion.button
            whileTap={{ scale: 0.8, y: -10 }}
            onClick={handlePull}
            disabled={plusCoins < 5 || pullStage !== 'idle'}
            className={`w-24 h-20 -mt-4 z-0 rounded-b-3xl border-8 border-white flex items-end justify-center pb-2 font-black text-white text-lg shadow-lg transition-colors relative
              ${plusCoins >= 5 && pullStage === 'idle' 
                ? 'bg-pink-400 hover:bg-pink-300 cursor-pointer' 
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'}
              ${tutorialStep === 'gacha_pull' ? 'z-[1000] ring-4 ring-pink-400 ring-offset-4 ring-offset-pink-200 animate-pulse' : ''}
            `}
          >
            {t.gacha.pull}
          </motion.button>
        </motion.div>
      </div>

      {/* Animation Overlay */}
      <AnimatePresence>
        {pullStage === 'flash' && (
          <motion.div 
            key="flash"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[60] bg-white pointer-events-none"
          />
        )}
        
        {pullStage === 'speedlines' && pullRarity && (
          <motion.div 
            key="speedlines"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 z-[60] overflow-hidden ${
              pullRarity === 'UR' ? 'bg-red-500' :
              pullRarity === 'SR' ? 'bg-yellow-400' :
              pullRarity === 'R' ? 'bg-purple-500' :
              'bg-pink-400'
            }`}
          >
            <div className="w-[200vw] h-[200vh] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[15deg]">
              {speedlines.map((line) => (
                <motion.div
                  key={line.id}
                  initial={{ x: '100vw' }}
                  animate={{ x: '-100vw' }}
                  transition={{ 
                    duration: 0.2, 
                    repeat: Infinity, 
                    ease: "linear",
                    delay: line.delay
                  }}
                  className="absolute h-1 bg-white/70"
                  style={{ 
                    top: `${line.top}%`,
                    width: `${line.width}vw`
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result Overlay */}
      <AnimatePresence>
        {pullStage === 'reveal' && pulledItem && pullRarity && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-black/60 backdrop-blur-md"
            onClick={() => {
              setPullSequence('idle');
              if (gachaCollection.length === 1) {
                setTutorialStep('equip_new_item');
              }
            }}
            onMouseMove={(e) => {
              const card = document.getElementById('gacha-reveal-card');
              if (!card) return;
              const rect = card.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
              const centerX = rect.width / 2;
              const centerY = rect.height / 2;
              const rotateX = ((y - centerY) / centerY) * -15;
              const rotateY = ((x - centerX) / centerX) * 15;
              card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1, 1, 1)`;
            }}
            onMouseLeave={() => {
              const card = document.getElementById('gacha-reveal-card');
              if (card) {
                card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
                card.style.transition = 'transform 0.5s ease-out';
              }
            }}
            onMouseEnter={() => {
              const card = document.getElementById('gacha-reveal-card');
              if (card) {
                card.style.transition = 'none';
              }
            }}
            onTouchMove={(e) => {
              const card = document.getElementById('gacha-reveal-card');
              if (!card) return;
              const touch = e.touches[0];
              const rect = card.getBoundingClientRect();
              const x = touch.clientX - rect.left;
              const y = touch.clientY - rect.top;
              const centerX = rect.width / 2;
              const centerY = rect.height / 2;
              const rotateX = ((y - centerY) / centerY) * -15;
              const rotateY = ((x - centerX) / centerX) * 15;
              card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1, 1, 1)`;
            }}
            onTouchEnd={() => {
              const card = document.getElementById('gacha-reveal-card');
              if (card) {
                card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
                card.style.transition = 'transform 0.5s ease-out';
              }
            }}
            onTouchStart={() => {
              const card = document.getElementById('gacha-reveal-card');
              if (card) {
                card.style.transition = 'none';
              }
            }}
          >
            <motion.div 
              id="gacha-reveal-card"
              initial={{ scale: 0.2, rotate: -30, y: 50 }}
              animate={{ scale: 1, y: 0, rotate: 0 }}
              transition={{ type: 'spring', damping: 12, stiffness: 200 }}
              className="relative z-10 flex flex-col items-center p-8 bg-white rounded-[2.5rem] shadow-[0_20px_0_rgba(0,0,0,0.1)] border-4 border-white max-w-sm w-full mx-4"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <span className={`text-4xl font-black mb-6 ${getRarityColor(pullRarity)}`} style={{ transform: 'translateZ(50px)' }}>
                {pullRarity} {t.gacha.discovered}
              </span>
              
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="w-48 h-48 relative mb-6"
                style={{ transform: 'translateZ(80px)' }}
              >
                {renderPulledItemVisual(pulledItem)}
              </motion.div>
              
              <h2 className="text-3xl font-black text-slate-800 mb-2 text-center" style={{ transform: 'translateZ(40px)' }}>
                {pulledItem.type === 'TileSkin'
                  ? `${t.labLog.planets[(pulledItem as any).value as keyof typeof t.labLog.planets]?.name || (pulledItem as any).value} - ${pulledItem.rarity} ${lang === 'zh' ? '形态' : 'Form'}`
                  : (t.labLog.items?.[pulledItem.id as keyof typeof t.labLog.items]?.name || pulledItem.name)}
              </h2>
              <p className="text-slate-500 text-center font-bold" style={{ transform: 'translateZ(30px)' }}>
                {pulledItem.type === 'TileSkin'
                  ? (t.labLog.planets[(pulledItem as any).value as keyof typeof t.labLog.planets]?.desc || pulledItem.desc)
                  : (t.labLog.items?.[pulledItem.id as keyof typeof t.labLog.items]?.desc || pulledItem.desc)}
              </p>
              
              <div className="mt-8 px-6 py-3 bg-pink-100 text-pink-500 rounded-full font-black animate-pulse" style={{ transform: 'translateZ(20px)' }}>
                {t.gacha.continue}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
