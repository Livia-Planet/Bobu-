import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Leaderboard } from './Leaderboard';
import { LabLog } from './LabLog';
import { translations, Language } from '../translations';
import { soundEngine } from '../SoundEngine';

export const BottomDrawer = ({ gachaCollection, unlockedChains, unlockedPlanets, bestScore, lifetimeScore, lang, isDarkMode, equipment, setEquipment, newGachaItems, setNewGachaItems, tutorialStep, setTutorialStep }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'log' | 'leaderboard'>('log');
  const t = translations[lang as Language];

  useEffect(() => {
    if (tutorialStep === 'finished' && isOpen) {
      setIsOpen(false);
    }
  }, [tutorialStep]);

  return (
    <>
      {/* Handle */}
      <div className={`fixed bottom-0 left-0 right-0 flex justify-center pb-4 pointer-events-none ${tutorialStep === 'equip_item' ? 'z-[1001]' : 'z-40'}`}>
        <motion.button
          className={`pointer-events-auto px-6 py-3 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.05)] border font-bold flex items-center gap-2 backdrop-blur-md
            ${isDarkMode ? 'bg-indigo-900/80 border-indigo-500/30 text-indigo-200' : 'bg-white/80 border-white/50 text-slate-600'}
            ${tutorialStep === 'equip_item' ? 'relative ring-4 ring-cyan-400 animate-pulse' : ''}
          `}
          onClick={() => {
            soundEngine.playClick();
            setIsOpen(true);
          }}
          whileHover={{ y: -5 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className={`w-8 h-1.5 rounded-full mb-1 mx-auto ${isDarkMode ? 'bg-indigo-400/50' : 'bg-slate-300'}`} />
          <span>{t.drawer.labLogTab} & {t.drawer.settings}</span>
        </motion.button>
      </div>

      {/* Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className={`fixed inset-0 backdrop-blur-sm z-50 ${isDarkMode ? 'bg-black/40' : 'bg-slate-900/20'}`}
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`fixed bottom-0 left-0 right-0 h-[85vh] rounded-t-[3rem] shadow-[0_-20px_50px_rgba(0,0,0,0.1)] border-t flex flex-col overflow-hidden
                ${isDarkMode ? 'bg-gradient-to-b from-indigo-950 to-purple-950 border-indigo-500/30' : 'bg-gradient-to-b from-[#F0F4FF] to-[#E6FFFA] border-white'}
                ${tutorialStep === 'equip_item' ? 'z-[1001]' : 'z-50'}
              `}
            >
              <div className="w-full flex justify-center pt-4 pb-2 cursor-pointer" onClick={() => {
                soundEngine.playClick();
                setIsOpen(false);
              }}>
                <div className={`w-16 h-2 rounded-full ${isDarkMode ? 'bg-indigo-400/50' : 'bg-slate-300'}`} />
              </div>
              
              <div className="flex justify-center gap-4 p-4 flex-wrap">
                <button 
                  className={`px-4 py-2 rounded-full font-bold transition-all text-sm ${activeTab === 'log' ? 'bg-cyan-400 text-white shadow-lg shadow-cyan-400/40' : (isDarkMode ? 'bg-white/10 text-indigo-300' : 'bg-white/50 text-slate-500')}`}
                  onClick={() => {
                    soundEngine.playClick();
                    setActiveTab('log');
                  }}
                >
                  {t.drawer.labLogTab}
                </button>
                <button 
                  className={`px-4 py-2 rounded-full font-bold transition-all text-sm ${activeTab === 'leaderboard' ? 'bg-purple-400 text-white shadow-lg shadow-purple-400/40' : (isDarkMode ? 'bg-white/10 text-indigo-300' : 'bg-white/50 text-slate-500')}`}
                  onClick={() => {
                    soundEngine.playClick();
                    setActiveTab('leaderboard');
                  }}
                >
                  {t.drawer.leaderboardTab}
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 pb-24">
                {activeTab === 'log' ? (
                  <LabLog gachaCollection={gachaCollection} unlockedChains={unlockedChains} unlockedPlanets={unlockedPlanets} lang={lang} isDarkMode={isDarkMode} equipment={equipment} setEquipment={setEquipment} newGachaItems={newGachaItems} setNewGachaItems={setNewGachaItems} tutorialStep={tutorialStep} setTutorialStep={setTutorialStep} />
                ) : (
                  <Leaderboard bestScore={bestScore} lifetimeScore={lifetimeScore} lang={lang} isDarkMode={isDarkMode} />
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
