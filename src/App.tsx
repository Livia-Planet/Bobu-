/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { useGameLogic, getConflictingIds } from './useGameLogic';
import { planetDatabase } from './constants';
import { motion, AnimatePresence } from 'motion/react';
import { PlanetTile } from './components/PlanetTile';
import { BottomDrawer } from './components/BottomDrawer';
import { GachaMachine } from './components/GachaMachine';
import { PlanetVisual } from './components/LabLog';
import { TutorialOverlay } from './components/TutorialOverlay';
import { LoadingScreen } from './components/LoadingScreen';
import { StartScreen } from './components/StartScreen';
import { getHighestUnlockedForm } from './utils';
import { translations, Language } from './translations';
import { soundEngine } from './SoundEngine';
import { Moon, Sun, Volume2, VolumeX, Languages } from 'lucide-react';
import { EquipmentState } from './types';

const ThemeDecorations = ({ themeId, isDarkMode }: { themeId: string, isDarkMode: boolean }) => {
  switch (themeId) {
    case 'theme-summer':
      return (
        <>
          <div className="absolute top-2 left-2 w-8 h-8 rounded-full bg-yellow-300 shadow-inner opacity-80 pointer-events-none" />
          <div className="absolute bottom-2 right-2 w-12 h-12 rounded-full bg-orange-400 shadow-inner opacity-60 pointer-events-none" />
          <div className="absolute top-1/2 -right-4 w-8 h-16 rounded-full bg-sky-200 opacity-50 pointer-events-none" />
        </>
      );
    case 'theme-sakura':
      return (
        <>
          <div className="absolute top-4 right-4 text-pink-400/40 text-4xl rotate-45 pointer-events-none">🌸</div>
          <div className="absolute bottom-4 left-4 text-pink-400/40 text-5xl -rotate-12 pointer-events-none">🌸</div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.3)_0%,transparent_70%)] pointer-events-none" />
        </>
      );
    case 'theme-cyber':
      return (
        <>
          <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(rgba(34,211,238,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.1)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none rounded-[2rem] overflow-hidden" />
          <div className="absolute top-3 left-3 w-16 h-2 bg-cyan-500/50 pointer-events-none" />
          <div className="absolute bottom-3 right-3 w-20 h-2 bg-fuchsia-500/50 pointer-events-none" />
          <div className="absolute top-4 right-4 text-cyan-500/50 font-mono text-xs font-bold pointer-events-none">SYS.RDY</div>
        </>
      );
    case 'theme-basic':
    default:
      return (
        <>
          <div className={`absolute top-4 left-4 w-3 h-3 rounded-full border-2 pointer-events-none ${isDarkMode ? 'border-slate-500/50' : 'border-slate-300'}`} />
          <div className={`absolute top-4 right-4 w-3 h-3 rounded-full border-2 pointer-events-none ${isDarkMode ? 'border-slate-500/50' : 'border-slate-300'}`} />
          <div className={`absolute bottom-4 left-4 w-3 h-3 rounded-full border-2 pointer-events-none ${isDarkMode ? 'border-slate-500/50' : 'border-slate-300'}`} />
          <div className={`absolute bottom-4 right-4 w-3 h-3 rounded-full border-2 pointer-events-none ${isDarkMode ? 'border-slate-500/50' : 'border-slate-300'}`} />
        </>
      );
  }
};

const AnimatedNumber = ({ value }: { value: number }) => (
  <motion.span
    key={value}
    initial={{ y: -10, opacity: 0, scale: 1.5 }}
    animate={{ y: 0, opacity: 1, scale: 1 }}
    className="inline-block"
  >
    {value}
  </motion.span>
);

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [lang, setLang] = useState<Language>('zh');
  const [isMuted, setIsMuted] = useState(false);
  const [pendingFamilyToggle, setPendingFamilyToggle] = useState<string | null>(null);
  const t = translations[lang];

  const [equipment, setEquipment] = useState<EquipmentState>(() => {
    const saved = localStorage.getItem('bobu_equipment');
    const parsed = saved ? JSON.parse(saved) : null;
    return {
      tileSkins: parsed?.tileSkins && !Array.isArray(parsed.tileSkins) ? parsed.tileSkins : {},
      activeLaws: parsed?.activeLaws || [],
      soundKit: parsed?.soundKit || 'celesta',
      musicTracks: parsed?.musicTracks || ['music-twinkle'],
      boardTheme: parsed?.boardTheme || 'theme-basic'
    };
  });

  useEffect(() => {
    localStorage.setItem('bobu_equipment', JSON.stringify(equipment));
  }, [equipment]);

  const { 
    grid, score, gameOver, message, dataExhaust, gachaCollection, setGachaCollection, newGachaItems, setNewGachaItems, instability,
    isShaking, carrots, plusCoins, setPlusCoins, activeProp, conflictingIds, activeLaws, setConflictingIds, setActiveProp, useCarrot, boostTile, ascendTile,
    slide, resetGame, goldenFlash, unlockedChains, activeFamilies, setActiveFamilies, healFlash, bestScore, lifetimeScore, toasts, lastMoveDir, maxMergedValue, lastComboCount, unlockedPlanets, currentRunMaxTile,
    tutorialStep, setTutorialStep, gameState, setGameState
  } = useGameLogic(equipment.musicTracks);

  const handleToggleFamily = (family: string) => {
    if (!unlockedChains.includes(family)) return;
    setPendingFamilyToggle(family);
  };

  const confirmToggleFamily = () => {
    if (!pendingFamilyToggle) return;
    setActiveFamilies(prev => {
      if (prev.includes(pendingFamilyToggle)) {
        return prev.filter(f => f !== pendingFamilyToggle);
      } else {
        return [...prev, pendingFamilyToggle];
      }
    });
    resetGame();
    setPendingFamilyToggle(null);
  };

  const touchStartRef = useRef<{x: number, y: number} | null>(null);
  const [particles, setParticles] = useState<{id: number, x: number, y: number, vx: number, vy: number, emoji: string}[]>([]);
  const [flashId, setFlashId] = useState<string | null>(null);
  const [isHitlag, setIsHitlag] = useState(false);
  const [activeInfoId, setActiveInfoId] = useState<string | null>(null);
  const [isGachaOpen, setIsGachaOpen] = useState(false);
  const [gameOverSequence, setGameOverSequence] = useState<'none' | 'bite' | 'swallow' | 'burp'>('none');

  useEffect(() => {
    if (gameOver && gameOverSequence === 'none') {
      setGameOverSequence('bite');
      setTimeout(() => {
        setGameOverSequence('swallow');
        soundEngine.playChomp();
        setTimeout(() => {
          setGameOverSequence('burp');
          soundEngine.playBurp();
        }, 500);
      }, 500);
    } else if (!gameOver) {
      setGameOverSequence('none');
    }
  }, [gameOver]);

  useEffect(() => {
    const initAudio = () => {
      soundEngine.init();
      window.removeEventListener('pointerdown', initAudio);
      window.removeEventListener('keydown', initAudio);
    };
    window.addEventListener('pointerdown', initAudio);
    window.addEventListener('keydown', initAudio);
    return () => {
      window.removeEventListener('pointerdown', initAudio);
      window.removeEventListener('keydown', initAudio);
    };
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const dx = e.touches[0].clientX - touchStartRef.current.x;
    const dy = e.touches[0].clientY - touchStartRef.current.y;
    
    let direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | null = null;
    if (Math.abs(dx) > 20 || Math.abs(dy) > 20) {
      if (Math.abs(dx) > Math.abs(dy)) {
        direction = dx > 0 ? 'RIGHT' : 'LEFT';
      } else {
        direction = dy > 0 ? 'DOWN' : 'UP';
      }
    }

    if (direction) {
      const conflicts = getConflictingIds(grid, direction, activeLaws);
      if (conflicts.join(',') !== conflictingIds.join(',')) {
        setConflictingIds(conflicts);
      }
    } else {
      if (conflictingIds.length > 0) setConflictingIds([]);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    
    setConflictingIds([]); // 清除警告

    let result;
    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 30) result = slide('RIGHT');
      else if (dx < -30) result = slide('LEFT');
    } else {
      if (dy > 30) result = slide('DOWN');
      else if (dy < -30) result = slide('UP');
    }
    touchStartRef.current = null;
  };

  const prevScoreRef = useRef(score);
  useEffect(() => {
    if (score === prevScoreRef.current) return;
    prevScoreRef.current = score;

    const isMiracle = message && message !== 'explosion' && message !== 'supply';
    const shouldHitlag = maxMergedValue >= 512 || isMiracle;

    const triggerParticles = () => {
      if (message === 'explosion' || shouldHitlag) {
        const intensity = Math.max(1, Math.log2(maxMergedValue || 2));
        const particleCount = Math.floor(20 + intensity * 5);
        const baseSpeed = 100 + intensity * 20;

        const newParticles = Array.from({ length: particleCount }).map((_, i) => {
          const angle = (i / particleCount) * Math.PI * 2;
          const speed = baseSpeed + Math.random() * baseSpeed;
          return {
            id: Date.now() + i,
            x: 180, // 棋盘中心附近
            y: 180,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            emoji: ['💥', '🔥', '⚡', '💢', '✨'][Math.floor(Math.random() * 5)]
          };
        });
        setParticles(prev => [...prev, ...newParticles]);
      }
    };

    if (shouldHitlag) {
      setIsHitlag(true);
      setTimeout(() => {
        setIsHitlag(false);
        triggerParticles();
      }, 150);
    } else if (message === 'explosion') {
      triggerParticles();
    }
  }, [score, message, maxMergedValue]);

  const handleTileClick = (r: number, c: number, id: string) => {
    if (activeProp === 'carrot') {
      const x = 16 + c * (72 + 12); // 1rem = 16px, 4.5rem = 72px, gap = 12px
      const y = 16 + r * (72 + 12);
      
      const targetTile = grid[r][c];
      const intensity = targetTile && typeof targetTile.value === 'number' ? Math.max(1, Math.log2(targetTile.value)) : 5;
      const particleCount = Math.floor(12 + intensity * 2);
      const baseSpeed = 50 + intensity * 10;

      const newParticles = Array.from({ length: particleCount }).map((_, i) => {
        const angle = (i / particleCount) * Math.PI * 2;
        const speed = baseSpeed + Math.random() * baseSpeed;
        return {
          id: Date.now() + i,
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          emoji: ['🎉', '✨', '🎊', '🎈'][Math.floor(Math.random() * 4)]
        };
      });
      
      setParticles(prev => [...prev, ...newParticles]);
      useCarrot(r, c);
    } else if (activeProp === 'plus') {
      const success = boostTile(id);
      if (!success) {
        setFlashId(id);
        setTimeout(() => setFlashId(null), 300);
      }
    } else {
      setActiveInfoId(id);
    }
  };

  const flatTiles = grid.flatMap((row, r) => 
    row.map((tile, c) => tile ? { ...tile, r, c } : null).filter(t => t !== null)
  );

  const calculateResonance = (tile: any) => {
    if (activeLaws.includes('CMT_BOBU_ULTIMATE')) return true;
    if (!tile) return false;
    if (typeof tile.value === 'string' && tile.value.startsWith('CMT')) return true;
    if (tile.attributeType) return true;
    return false;
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    soundEngine.setInstrument(equipment.soundKit);
  }, [equipment.soundKit]);

  const handleToggleMute = () => {
    soundEngine.playClick();
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
  };

  const handleToggleLang = () => {
    soundEngine.playClick();
    setLang(prev => prev === 'zh' ? 'en' : 'zh');
  };

  const getThemeClasses = (themeId: string, isDarkMode: boolean) => {
    switch (themeId) {
      case 'theme-summer':
        return isDarkMode ? 'bg-orange-950 text-orange-100' : 'bg-orange-50 text-orange-900';
      case 'theme-sakura':
        return isDarkMode ? 'bg-pink-950 text-pink-100' : 'bg-pink-50 text-pink-900';
      case 'theme-cyber':
        return 'bg-slate-950 text-cyan-400';
      case 'theme-basic':
      default:
        return isDarkMode ? 'bg-gradient-to-br from-indigo-950 to-purple-900 text-white' : 'bg-gradient-to-br from-[#F0F4FF] to-[#E6FFFA] text-slate-800';
    }
  };

  const getBoardStyle = (themeId: string, isDarkMode: boolean) => {
    switch (themeId) {
      case 'theme-summer':
        return 'bg-sky-100/60 border-amber-300 shadow-[inset_0_0_20px_rgba(56,189,248,0.2),_0_20px_40px_rgba(0,0,0,0.1)]';
      case 'theme-sakura':
        return 'bg-pink-100/50 border-pink-200 shadow-[inset_0_0_30px_rgba(244,114,182,0.3),_0_20px_40px_rgba(244,114,182,0.1)]';
      case 'theme-cyber':
        return 'bg-slate-900 border-cyan-500/50 shadow-[inset_0_0_20px_rgba(34,211,238,0.1),_0_0_30px_rgba(217,70,239,0.2)]';
      case 'theme-basic':
      default:
        return isDarkMode ? 'bg-white/5 border-white/10 shadow-[inset_0_0_20px_rgba(139,92,246,0.3),_0_20px_40px_rgba(0,0,0,0.3)]' : 'bg-white/60 border-white/50 shadow-[inset_0_0_20px_rgba(0,0,0,0.02),_0_20px_40px_rgba(0,0,0,0.05)]';
    }
  };

  const getSlotStyle = (themeId: string, isDarkMode: boolean) => {
    switch (themeId) {
      case 'theme-summer':
        return 'bg-sky-200/50 border-sky-300 shadow-inner';
      case 'theme-sakura':
        return 'bg-white/40 border-pink-100 shadow-[inset_0_0_10px_rgba(244,114,182,0.1)]';
      case 'theme-cyber':
        return 'bg-slate-800/80 border-fuchsia-500/30 shadow-[inset_0_0_10px_rgba(0,0,0,0.8)]';
      case 'theme-basic':
      default:
        return isDarkMode ? 'bg-white/5 border-white/5 shadow-inner' : 'bg-slate-100/50 border-slate-200/50 shadow-inner';
    }
  };

  // Tutorial logic: close GachaMachine when moving to equip_item
  useEffect(() => {
    if (tutorialStep === 'equip_item') {
      setIsGachaOpen(false);
    }
  }, [tutorialStep]);

  return (
    <AnimatePresence mode="wait">
      {gameState === 'loading' && (
        <motion.div key="loading" exit={{ opacity: 0, scale: 1.1 }} transition={{ duration: 0.5 }}>
          <LoadingScreen />
        </motion.div>
      )}

      {gameState === 'start_menu' && (
        <motion.div key="start_menu" exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.5 }}>
          <StartScreen setGameState={setGameState} setLang={setLang} tutorialStep={tutorialStep} setTutorialStep={setTutorialStep} />
        </motion.div>
      )}

      {gameState === 'playing' && (
        <motion.div 
          key="playing"
          initial={{ scale: 0.5, y: 200, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          transition={{ type: "spring", damping: 12, stiffness: 200 }}
          className={`min-h-screen flex flex-col items-center pt-8 pb-32 px-4 font-sans overflow-hidden transition-colors duration-1000 relative
            ${getThemeClasses(equipment.boardTheme, isDarkMode)}
          `}
        >
          <TutorialOverlay step={tutorialStep} setStep={setTutorialStep} lang={lang} />
          
          {isHitlag && <div className="fixed inset-0 z-40 bg-black/60 transition-opacity duration-75" />}
          
          {/* 顶部控制栏 */}
          <div className="absolute top-4 right-4 flex items-center gap-3 z-50">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleToggleLang}
          className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm backdrop-blur-md border transition-colors
            ${isDarkMode ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' : 'bg-white/50 border-white/80 text-slate-600 hover:bg-white/80'}
          `}
        >
          <span className="font-bold text-sm">{lang === 'zh' ? '中' : 'EN'}</span>
        </motion.button>
        
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleToggleMute}
          className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm backdrop-blur-md border transition-colors
            ${isDarkMode ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' : 'bg-white/50 border-white/80 text-slate-600 hover:bg-white/80'}
          `}
        >
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.9, rotate: 180 }}
          transition={{ type: "spring", stiffness: 200, damping: 10 }}
          onClick={() => {
            soundEngine.playClick();
            setIsDarkMode(!isDarkMode);
          }}
          className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm backdrop-blur-md border transition-colors
            ${isDarkMode ? 'bg-indigo-500/30 border-indigo-400/50 text-yellow-300 hover:bg-indigo-500/50' : 'bg-white/50 border-white/80 text-indigo-500 hover:bg-white/80'}
          `}
        >
          {isDarkMode ? <Moon size={20} fill="currentColor" /> : <Sun size={20} fill="currentColor" />}
        </motion.button>
      </div>

      {/* 战略飞升 全屏金光特效 */}
      <AnimatePresence>
        {goldenFlash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[100] pointer-events-none bg-yellow-400/30 mix-blend-overlay"
            style={{
              boxShadow: 'inset 0 0 150px rgba(250, 204, 21, 0.8)'
            }}
          />
        )}
      </AnimatePresence>

      {/* Top Layout: Score & Instability */}
      <div className="w-full max-w-md flex justify-between items-end mb-4 px-2">
        <div className="flex flex-col">
          <span className={`text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-indigo-300' : 'text-slate-400'}`}>{t.score}</span>
          <span className={`text-5xl font-black tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-700'}`}><AnimatedNumber value={score} /></span>
        </div>
        <div className="flex flex-col items-end">
          <span className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-indigo-300' : 'text-slate-400'}`}>{t.best}</span>
          <span className={`text-2xl font-bold ${isDarkMode ? 'text-indigo-200' : 'text-slate-500'}`}>{bestScore}</span>
        </div>
      </div>
      
      {/* Instability Bar */}
      <div className="w-full max-w-md px-2 mb-4">
        <div className={`flex justify-between text-xs font-black mb-1 px-1 ${isDarkMode ? 'text-rose-300' : 'text-rose-500'}`}>
          <span>{t.instability}</span>
          <span>{instability}%</span>
        </div>
        <div className={`w-full h-8 rounded-full p-1 shadow-[inset_0_2px_10px_rgba(0,0,0,0.05)] border relative overflow-hidden
          ${isDarkMode ? 'bg-white/10 border-white/10' : 'bg-white/80 border-white'}
        `}>
          {healFlash && (
            <motion.div 
              initial={{ opacity: 1, scale: 1 }}
              animate={{ opacity: 0, scale: 1.5 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0 bg-green-300 z-10 rounded-full"
            />
          )}
          <motion.div 
            className={`h-full rounded-full relative ${healFlash ? 'bg-green-400' : 'bg-gradient-to-r from-pink-300 to-rose-400'}`}
            animate={{ width: `${instability}%` }}
            transition={{ type: 'spring', bounce: 0.5 }}
          >
            <div className="absolute inset-0 bg-white/20 rounded-full animate-[shimmer_2s_infinite]" />
          </motion.div>
        </div>
      </div>

      {/* Sandbox Gene Pool */}
      <div className="w-full max-w-md px-2 mb-8 flex flex-col items-center gap-3">
        <div className="flex justify-center gap-3">
          {['Bobu', 'Duddu', 'Issi'].map(family => {
            const isUnlocked = unlockedChains.includes(family);
            const isActive = activeFamilies.includes(family);
            
            return (
              <button
                key={family}
                onClick={() => handleToggleFamily(family)}
                disabled={!isUnlocked}
                className={`relative px-4 py-2 rounded-full font-bold text-sm transition-all duration-300 flex items-center gap-2
                  ${!isUnlocked 
                    ? (isDarkMode ? 'bg-white/5 text-white/30 cursor-not-allowed border border-white/5' : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200')
                    : isActive
                      ? (family === 'Bobu' ? 'bg-cyan-400 text-slate-900 shadow-[0_0_15px_rgba(34,211,238,0.5)] hover:scale-105 hover:-translate-y-1' :
                         family === 'Duddu' ? 'bg-fuchsia-400 text-white shadow-[0_0_15px_rgba(232,121,249,0.5)] hover:scale-105 hover:-translate-y-1' :
                         'bg-amber-400 text-slate-900 shadow-[0_0_15px_rgba(251,191,36,0.5)] hover:scale-105 hover:-translate-y-1')
                      : (isDarkMode ? 'bg-slate-800 text-slate-500 border border-slate-700 hover:bg-slate-700' : 'bg-slate-200 text-slate-500 border border-slate-300 hover:bg-slate-300')
                  }
                `}
              >
                {!isUnlocked && <span>🔒</span>}
                {t.chains[family as keyof typeof t.chains]}
              </button>
            );
          })}
        </div>
        {activeFamilies.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-xs font-medium tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}
          >
            {t.genePoolWarning.pureMode}
          </motion.div>
        )}
      </div>

      {/* Center Panel (Game Board) */}
      <div className="flex-none flex flex-col items-center justify-center relative z-10">
        {/* 万物有灵 提示浮层 */}
        <AnimatePresence>
          {message && (
            <motion.div 
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className={`absolute -top-16 z-50 px-6 py-3 rounded-full backdrop-blur-md border font-bold tracking-wide text-center max-w-sm whitespace-nowrap
                ${isDarkMode ? 'bg-indigo-900/90 text-white shadow-[0_0_30px_rgba(99,102,241,0.4)] border-indigo-500/50' : 'bg-indigo-600/90 text-white shadow-[0_0_30px_rgba(79,70,229,0.5)] border-indigo-400/30'}
              `}
            >
              {t.messages[message as keyof typeof t.messages] || message}
            </motion.div>
          )}
          {dataExhaust && (
            <motion.div 
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className={`absolute -top-32 z-50 px-6 py-3 rounded-full backdrop-blur-md border font-bold tracking-wide text-center max-w-sm whitespace-nowrap
                ${isDarkMode ? 'bg-purple-900/90 text-white shadow-[0_0_30px_rgba(168,85,247,0.4)] border-purple-500/50' : 'bg-purple-600/90 text-white shadow-[0_0_30px_rgba(168,85,247,0.5)] border-purple-400/30'}
              `}
            >
              {dataExhaust === 'blackHoleunlocked' 
                ? `${t.messages.blackHole} ${t.messages.unlocked}` 
                : t.messages[dataExhaust as keyof typeof t.messages] || dataExhaust}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div 
          animate={gameOverSequence === 'swallow' || gameOverSequence === 'burp' ? { scale: 0, rotate: 720 } : { scale: 1, rotate: 0 }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className={`relative backdrop-blur-xl border rounded-[2.5rem] p-4 ${isHitlag ? 'z-50' : ''} ${message === 'explosion' ? 'animate-shake-violent' : (isShaking || instability > 80 ? 'animate-shake' : '')} ${activeProp === 'carrot' ? 'cursor-bobu-mouth' : activeProp === 'plus' ? 'cursor-crosshair' : ''}
            ${getBoardStyle(equipment.boardTheme, isDarkMode)}
          `}
          style={{ width: '23rem', height: '23rem' }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={() => setActiveInfoId(null)}
        >
          <ThemeDecorations themeId={equipment.boardTheme} isDarkMode={isDarkMode} />
          
          {/* 背景槽位 */}
          <div className="grid grid-cols-4 grid-rows-4 gap-3 w-full h-full">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className={`rounded-3xl border ${getSlotStyle(equipment.boardTheme, isDarkMode)}`} />
            ))}
          </div>

          {/* Combo Text */}
          <AnimatePresence>
            {lastComboCount > 1 && (
              <motion.div
                key={lastComboCount}
                initial={{ opacity: 0, scale: 0.5, x: 50, y: -50, rotate: 15 }}
                animate={{ opacity: 1, scale: 1.2, x: 100, y: -100, rotate: -5 }}
                exit={{ opacity: 0, scale: 1.5, y: -150 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                className="absolute top-1/4 right-0 z-50 pointer-events-none"
              >
                <div className="text-4xl md:text-5xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]" style={{ WebkitTextStroke: '2px white' }}>
                  {lastComboCount}x PERFECT!
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 活动星体 */}
          <AnimatePresence>
            {flatTiles.map(tile => {
              const planet = planetDatabase[tile.value] || planetDatabase[2];
              const isHybrid = tile.attributeType === 'HYBRID';
              const isConflicting = conflictingIds.includes(tile.id);
              const isResonant = calculateResonance(tile);

              return (
                <PlanetTile
                  key={`${tile.id}-${tile.value}`}
                  tile={tile}
                  planet={planet}
                  isHybrid={isHybrid}
                  isConflicting={isConflicting}
                  isResonant={isResonant}
                  activeProp={activeProp}
                  flashId={flashId}
                  isDarkMode={isDarkMode}
                  lastMoveDir={lastMoveDir}
                  t={t}
                  onTileClick={handleTileClick}
                  onAscend={ascendTile}
                  onBoost={boostTile}
                  equipment={equipment}
                  showInfoOverlay={activeInfoId === tile.id}
                  tutorialStep={tutorialStep}
                />
              );
            })}
          </AnimatePresence>

          {/* Floating Toasts */}
          <AnimatePresence>
            {toasts.map(toast => {
              const topOffset = `calc(1rem + ${toast.r} * (4.5rem + 0.75rem))`;
              const leftOffset = `calc(1rem + ${toast.c} * (4.5rem + 0.75rem))`;
              
              // Add a deterministic pseudo-random offset based on toast.id to prevent exact overlaps
              const randomX = (toast.id % 20) - 10;
              const randomY = ((toast.id * 7) % 20) - 10;

              return (
                <motion.div
                  key={toast.id}
                  initial={{ opacity: 0, scale: 0.5, x: `calc(-50% + ${randomX}px)`, y: `calc(-50% + ${randomY}px)` }}
                  animate={{ opacity: [0, 1, 0], y: -60 + randomY, scale: [0.8, 1.2, 1], x: `calc(-50% + ${randomX}px)` }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="absolute z-[100] pointer-events-none"
                  style={{ 
                    left: `calc(${leftOffset} + 2.25rem)`, // center of the 4.5rem tile
                    top: `calc(${topOffset} + 2.25rem)`,
                    color: toast.color,
                    WebkitTextStroke: '1px white'
                  }}
                >
                  <span className="z-[100] pointer-events-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] text-xl font-black whitespace-nowrap">{t.messages[toast.text as keyof typeof t.messages] || toast.text}</span>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* 粒子效果层 */}
          <AnimatePresence>
            {particles.map(p => (
              <motion.div
                key={p.id}
                initial={{ opacity: 1, scale: 0.5, x: 0, y: 0 }}
                animate={{ 
                  opacity: 0, 
                  scale: 1.5, 
                  x: p.vx, 
                  y: p.vy,
                  rotate: Math.random() * 360
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                onAnimationComplete={() => setParticles(prev => prev.filter(pt => pt.id !== p.id))}
                className="absolute w-[4.5rem] h-[4.5rem] flex items-center justify-center pointer-events-none z-50"
                style={{ top: p.y, left: p.x }}
              >
                <span className="text-3xl drop-shadow-md">{p.emoji}</span>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* 游戏结束遮罩 - 吞噬宇宙序列 */}
          <AnimatePresence>
            {gameOver && (
              <div className="absolute inset-0 z-40 overflow-hidden rounded-[2.5rem] pointer-events-none">
                {/* 上半部分巨口 */}
                <motion.div
                  initial={{ y: '-100%' }}
                  animate={gameOverSequence === 'bite' || gameOverSequence === 'swallow' ? { y: 0 } : { y: '-100%' }}
                  transition={{ type: 'spring', damping: 15, stiffness: 100 }}
                  className="absolute top-0 left-0 w-full h-1/2 bg-pink-400 flex items-end justify-center"
                >
                  <div className="w-[120%] flex justify-center absolute bottom-0 translate-y-1/2 gap-1">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div key={i} className="w-16 h-16 bg-white rounded-full shadow-sm"></div>
                    ))}
                  </div>
                </motion.div>

                {/* 下半部分巨口 */}
                <motion.div
                  initial={{ y: '100%' }}
                  animate={gameOverSequence === 'bite' || gameOverSequence === 'swallow' ? { y: 0 } : { y: '100%' }}
                  transition={{ type: 'spring', damping: 15, stiffness: 100 }}
                  className="absolute bottom-0 left-0 w-full h-1/2 bg-pink-400 flex items-start justify-center"
                >
                  <div className="w-[120%] flex justify-center absolute top-0 -translate-y-1/2 gap-1">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div key={i} className="w-16 h-16 bg-white rounded-full shadow-sm"></div>
                    ))}
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* 拍立得结算卡片 */}
      <AnimatePresence>
        {gameOverSequence === 'burp' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 100, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotate: 2 }}
            transition={{ type: 'spring', damping: 12, stiffness: 100 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 pointer-events-auto"
          >
            <div className="bg-white p-6 pb-16 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-4 border-slate-100 max-w-sm w-full flex flex-col items-center relative">
              {/* 胶带效果 */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-8 bg-yellow-200/80 backdrop-blur-sm rotate-[-4deg] shadow-sm"></div>

              {/* 照片区 */}
              <div className={`w-full aspect-square rounded-2xl mb-8 flex items-center justify-center overflow-hidden border-8 border-slate-100 relative ${planetDatabase[currentRunMaxTile]?.color || 'bg-slate-200'}`}>
                <div className="scale-[1.5]">
                  <PlanetVisual 
                    value={currentRunMaxTile} 
                    form={getHighestUnlockedForm(currentRunMaxTile, gachaCollection)} 
                    rarity={currentRunMaxTile >= 2048 ? 'UR' : currentRunMaxTile >= 512 ? 'SR' : currentRunMaxTile >= 64 ? 'R' : 'N'} 
                    color={planetDatabase[currentRunMaxTile]?.color || 'bg-slate-200'} 
                  />
                </div>
                
                {/* 评级印章 */}
                <div className="absolute top-2 right-2 rotate-[15deg] border-4 border-red-500 text-red-500 font-black text-4xl px-2 py-1 rounded-lg opacity-90 shadow-sm" style={{ WebkitTextStroke: '1px #ef4444' }}>
                  RANK: {currentRunMaxTile >= 2048 ? 'SSS' : currentRunMaxTile >= 512 ? 'S' : currentRunMaxTile >= 128 ? 'A' : 'F'}
                </div>
              </div>

              {/* 文案区 */}
              <h2 className="text-4xl font-black text-slate-800 mb-4 text-center leading-tight">
                {t.gameover.reportTitle.split('\n').map((line, i) => <React.Fragment key={i}>{line}{i === 0 && <br/>}</React.Fragment>)}
              </h2>
              <p className="text-slate-600 text-center font-bold text-base leading-relaxed px-2 mb-10">
                {t.gameover.reportDesc1}<br/>
                <span className="inline-block bg-yellow-300 text-slate-900 px-2 py-1 rounded-md mt-1 mb-1 text-xl transform -rotate-2">
                  {lang === 'zh' ? '【' : '['}
                  {t.labLog.planets[currentRunMaxTile as keyof typeof t.labLog.planets]?.name || planetDatabase[currentRunMaxTile]?.name || (lang === 'zh' ? '未知星体' : 'Unknown Star')}
                  {lang === 'zh' ? '】' : ']'}
                </span><br/>
                {t.gameover.reportDesc2}
              </p>

              {/* 重新启动按钮 */}
              <button
                onClick={() => {
                  soundEngine.playClick();
                  resetGame();
                }}
                className="px-10 py-5 bg-pink-400 hover:bg-pink-300 text-white rounded-full font-black text-2xl shadow-[0_10px_0_#be185d] active:shadow-[0_0px_0_#be185d] active:translate-y-2 transition-all border-4 border-white"
              >
                {t.gameover.restartBtn}
              </button>

              {/* 伪 QR Code 装饰 */}
              <div className="absolute bottom-6 right-6 grid grid-cols-3 grid-rows-3 gap-1.5 opacity-30">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className={`w-3 h-3 bg-slate-800 ${Math.random() > 0.5 ? 'rounded-sm' : 'rounded-full'}`}></div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gacha Capsule Button (Left) */}
      <div className="fixed bottom-24 left-6 z-40">
        <motion.button
          animate={{ y: [0, -8, 0], rotate: [-5, 5, -5] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          whileTap={{ scale: 0.85 }}
          onClick={() => {
            soundEngine.playClick();
            setIsGachaOpen(true);
          }}
          className={`relative w-16 h-20 flex flex-col items-center justify-center shadow-[0_10px_20px_rgba(0,0,0,0.2)] rounded-full overflow-hidden border-4 border-white cursor-pointer
            ${tutorialStep === 'gacha_pull' ? 'z-[1001] relative ring-4 ring-pink-400 animate-pulse bg-white' : ''}
          `}
        >
          <div className="w-full h-1/2 bg-red-500 border-b-4 border-slate-800/20"></div>
          <div className="w-full h-1/2 bg-white"></div>
          <div className="absolute w-6 h-6 bg-white rounded-full border-4 border-slate-200 shadow-inner flex items-center justify-center">
            <div className="w-2 h-2 bg-slate-200 rounded-full"></div>
          </div>
        </motion.button>
      </div>

      {/* Floating Buttons */}
      <div className="fixed bottom-24 right-6 flex flex-col gap-4 z-40">
        <motion.button
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          onClick={() => {
            soundEngine.playClick();
            carrots > 0 && setActiveProp(activeProp === 'carrot' ? null : 'carrot');
          }}
          className={`w-16 h-16 rounded-full shadow-[0_10px_20px_rgba(0,0,0,0.1)] flex items-center justify-center text-3xl border-4 ${activeProp === 'carrot' ? 'bg-orange-100 border-orange-400 scale-110' : 'bg-white border-white'}`}
        >
          🥕
          <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-white">{carrots}</span>
        </motion.button>

        <motion.button
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut", delay: 0.5 }}
          onClick={() => {
            soundEngine.playClick();
            plusCoins > 0 && setActiveProp(activeProp === 'plus' ? null : 'plus');
          }}
          className={`w-16 h-16 rounded-full shadow-[0_10px_20px_rgba(0,0,0,0.1)] flex items-center justify-center text-3xl border-4 ${activeProp === 'plus' ? 'bg-yellow-100 border-yellow-400 scale-110' : 'bg-white border-white'}`}
        >
          🪙
          <span className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-white">{plusCoins}</span>
        </motion.button>
      </div>

      {/* 确认重置弹窗 */}
      <AnimatePresence>
        {pendingFamilyToggle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className={`relative w-full max-w-sm border rounded-3xl p-6 shadow-2xl overflow-hidden text-center
                ${isDarkMode ? 'bg-indigo-950 border-indigo-500/30' : 'bg-white border-slate-100'}
              `}
            >
              <div className="text-4xl mb-4">🧬</div>
              <h3 className={`text-xl font-black mb-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                {t.genePoolWarning.title}
              </h3>
              <p className={`text-sm font-medium mb-6 ${isDarkMode ? 'text-indigo-200' : 'text-slate-500'}`}>
                {t.genePoolWarning.desc}
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setPendingFamilyToggle(null)}
                  className={`px-6 py-2 rounded-full font-bold text-sm transition-colors
                    ${isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}
                  `}
                >
                  {t.genePoolWarning.cancel}
                </button>
                <button
                  onClick={confirmToggleFamily}
                  className="px-6 py-2 rounded-full font-bold text-sm bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.5)] hover:bg-rose-600 transition-colors"
                >
                  {t.genePoolWarning.confirm}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Drawer */}
      <BottomDrawer 
        gachaCollection={gachaCollection} 
        unlockedChains={unlockedChains} 
        unlockedPlanets={unlockedPlanets}
        bestScore={bestScore} 
        lifetimeScore={lifetimeScore} 
        lang={lang}
        isDarkMode={isDarkMode}
        equipment={equipment}
        setEquipment={setEquipment}
        newGachaItems={newGachaItems}
        setNewGachaItems={setNewGachaItems}
        tutorialStep={tutorialStep}
        setTutorialStep={setTutorialStep}
      />

      {/* Gacha Machine Overlay */}
      <AnimatePresence>
        {isGachaOpen && (
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed inset-0 flex flex-col items-center justify-center overflow-hidden
              ${isDarkMode ? 'bg-indigo-950 text-white' : 'bg-[#F0F4FF] text-slate-800'}
              ${tutorialStep === 'gacha_pull' ? 'z-[1001]' : 'z-[200]'}
            `}
          >
            <button 
              onClick={() => setIsGachaOpen(false)}
              className="absolute top-6 left-6 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl font-bold z-50 hover:bg-white/30 transition-colors"
            >
              ✕
            </button>
            <GachaMachine 
              plusCoins={plusCoins} 
              setPlusCoins={setPlusCoins} 
              gachaCollection={gachaCollection} 
              setGachaCollection={setGachaCollection} 
              newGachaItems={newGachaItems}
              setNewGachaItems={setNewGachaItems}
              isDarkMode={isDarkMode} 
              lang={lang}
              tutorialStep={tutorialStep}
              setTutorialStep={setTutorialStep}
            />
          </motion.div>
        )}
      </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
