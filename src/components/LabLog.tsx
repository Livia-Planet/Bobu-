import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { planetDatabase, gachaPool } from '../constants';
import { translations, Language } from '../translations';
import { soundEngine } from '../SoundEngine';
import { EquipmentState, TileSkin, GachaItem } from '../types';
import { PlanetEyes, URAccessory } from './PlanetTile';

interface LabLogProps {
  gachaCollection: string[];
  unlockedChains: string[];
  unlockedPlanets: string[];
  lang: Language;
  isDarkMode: boolean;
  equipment: EquipmentState;
  setEquipment: React.Dispatch<React.SetStateAction<EquipmentState>>;
  newGachaItems: string[];
  setNewGachaItems: React.Dispatch<React.SetStateAction<string[]>>;
}

export const PlanetVisual = ({ value, form, rarity, color }: { value: string | number, form: number, rarity: string, color: string }) => {
  const isUR = form >= 4;
  const showEyes = form >= 2;
  
  return (
    <div className={`relative w-[4.5rem] h-[4.5rem] flex flex-col items-center justify-center rounded-3xl ${color}
      ${isUR ? 'shadow-[inset_0_0_20px_rgba(255,255,255,0.6),inset_0_-10px_20px_rgba(0,0,0,0.2),0_0_20px_rgba(250,204,21,0.6)] after:absolute after:top-1 after:left-1 after:w-1/3 after:h-1/4 after:bg-white/40 after:rounded-full after:rotate-[-25deg] after:pointer-events-none after:z-0' : 'shadow-md'}
    `}>
      {showEyes && <PlanetEyes value={value} lastMoveDir="DOWN" form={form} />}
      {isUR && <URAccessory value={value} />}
    </div>
  );
};

const FlipCard: React.FC<{ item: GachaItem, isUnlocked: boolean, isEquipped: boolean, onEquip: () => void, color: string, isNew: boolean, onRemoveNew: () => void, lang: Language, t: typeof translations['en'] }> = ({ item, isUnlocked, isEquipped, onEquip, color, isNew, onRemoveNew, lang, t }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="flex flex-col items-center gap-3 w-full relative">
      {isNew && (
        <div className="absolute -top-2 -right-2 z-20 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-md animate-bounce">
          NEW
        </div>
      )}
      <div 
        className="relative w-full aspect-[2/3]" 
        style={{ perspective: '1000px' }}
        onClick={() => {
          if (isUnlocked) setIsFlipped(!isFlipped);
          if (isNew) onRemoveNew();
        }}
      >
        <motion.div
          className="w-full h-full relative cursor-pointer"
          style={{ transformStyle: 'preserve-3d' }}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
        >
          {/* Front */}
          <div 
            className={`absolute inset-0 rounded-2xl border-2 flex flex-col items-center justify-center overflow-hidden transition-all
              ${isUnlocked ? 'border-slate-200 bg-white shadow-sm' : 'border-slate-800 bg-slate-900 brightness-0'}
            `}
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div className="scale-125 pointer-events-none">
              <PlanetVisual value={(item as TileSkin).value} form={(item as TileSkin).form} rarity={item.rarity} color={color} />
            </div>
            <div className="absolute bottom-2 font-black text-xs text-slate-400">{item.rarity}</div>
          </div>

          {/* Back */}
          <div 
            className={`absolute inset-0 rounded-2xl border-2 border-white/20 flex flex-col items-center justify-center p-3 text-center shadow-sm overflow-hidden ${color}`} 
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm z-0" />
            <span className="relative z-10 text-4xl font-black text-white/30 mix-blend-overlay absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full">
              {typeof (item as TileSkin).value === 'string' ? '✨' : (item as TileSkin).value}
            </span>
            <div className="relative z-10 flex flex-col items-center justify-center h-full w-full">
              <span className="text-sm font-black text-white bg-black/40 px-3 py-1 rounded-full mb-2">
                {item.type === 'TileSkin' 
                  ? `${t.labLog.planets[(item as TileSkin).value as keyof typeof t.labLog.planets]?.name || (item as TileSkin).value} - ${item.rarity} ${t.labLog.form}`
                  : (t.labLog.items?.[item.id as keyof typeof t.labLog.items]?.name || item.name)}
              </span>
              <span className="text-[10px] text-white/90 leading-tight font-medium">
                {item.type === 'TileSkin'
                  ? (t.labLog.planets[(item as TileSkin).value as keyof typeof t.labLog.planets]?.desc || item.desc)
                  : (t.labLog.items?.[item.id as keyof typeof t.labLog.items]?.desc || item.desc)}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
      
      {isUnlocked ? (
        <button 
          onClick={(e) => { e.stopPropagation(); onEquip(); }}
          className={`w-full py-2 rounded-xl text-xs font-bold transition-all ${isEquipped ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/30' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
        >
          {isEquipped ? t.labLog.equipped : t.labLog.equipSkin}
        </button>
      ) : (
        <div className="w-full py-2 rounded-xl text-xs font-bold bg-slate-100/5 text-slate-400 text-center">
          {t.labLog.notUnlocked}
        </div>
      )}
    </div>
  );
};

export const LabLog: React.FC<LabLogProps> = ({ gachaCollection, unlockedChains, unlockedPlanets, lang, isDarkMode, equipment, setEquipment, newGachaItems, setNewGachaItems }) => {
  const [toast, setToast] = useState<string | null>(null);
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'planets' | 'audio' | 'themes' | 'laws'>('planets');
  const t = translations[lang];

  const handlePlanetClick = (id: string, isUnlocked: boolean) => {
    soundEngine.playClick();
    if (!isUnlocked) {
      setToast(t.labLog.lockedToast);
      setTimeout(() => setToast(null), 3000);
    } else {
      setSelectedPlanet(id);
    }
  };

  const renderGridItems = (type: 'SoundKit' | 'MusicTrack' | 'BoardTheme' | 'TileSkin') => {
    let items = gachaPool.filter(item => item.type === type);
    if (type === 'TileSkin') {
      items = items.filter(item => typeof (item as TileSkin).value === 'string' && String((item as TileSkin).value).startsWith('CMT'));
    }

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {items.map(item => {
          const isOwned = gachaCollection.includes(item.id);
          const isNew = newGachaItems.includes(item.id);
          let isEquipped = false;
          if (item.type === 'SoundKit') isEquipped = equipment.soundKit === item.id;
          if (item.type === 'MusicTrack') isEquipped = equipment.musicTracks.includes(item.id);
          if (item.type === 'BoardTheme') isEquipped = equipment.boardTheme === item.id;
          if (item.type === 'TileSkin') isEquipped = equipment.activeLaws.includes((item as TileSkin).value as string);

          return (
            <div 
              key={item.id} 
              className={`p-4 rounded-2xl border flex flex-col items-center text-center gap-3 transition-all relative ${isOwned ? (isDarkMode ? 'bg-white/10 border-white/20' : 'bg-white border-slate-200 shadow-sm') : (isDarkMode ? 'bg-black/20 border-white/5 opacity-50' : 'bg-slate-100 border-slate-200 opacity-50')}`}
              onClick={() => {
                if (isNew) {
                  setNewGachaItems(prev => prev.filter(id => id !== item.id));
                }
              }}
            >
              {isNew && (
                <div className="absolute -top-2 -right-2 z-20 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-md animate-bounce">
                  NEW
                </div>
              )}
              <div className="text-3xl">{item.type === 'SoundKit' ? '🔊' : item.type === 'MusicTrack' ? '🎵' : item.type === 'BoardTheme' ? '🖼️' : '✨'}</div>
              <div>
                <div className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                  {item.type === 'TileSkin' 
                    ? `${t.labLog.planets[(item as TileSkin).value as keyof typeof t.labLog.planets]?.name || (item as TileSkin).value} - ${item.rarity} ${t.labLog.form}`
                    : (t.labLog.items?.[item.id as keyof typeof t.labLog.items]?.name || item.name)}
                </div>
                <div className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  {item.type === 'TileSkin'
                    ? (t.labLog.planets[(item as TileSkin).value as keyof typeof t.labLog.planets]?.desc || item.desc)
                    : (t.labLog.items?.[item.id as keyof typeof t.labLog.items]?.desc || item.desc)}
                </div>
              </div>
              {isOwned ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isNew) setNewGachaItems(prev => prev.filter(id => id !== item.id));
                    soundEngine.playClick();
                    if (item.type === 'MusicTrack') {
                      soundEngine.playBGM([item.id]);
                      // Stop preview after 3 seconds
                      setTimeout(() => {
                        soundEngine.stopBGM();
                      }, 3000);
                    }
                    setEquipment(prev => {
                      const next = { ...prev };
                      if (item.type === 'SoundKit') next.soundKit = isEquipped ? 'sound-piano' : item.id;
                      if (item.type === 'MusicTrack') {
                        if (isEquipped) next.musicTracks = next.musicTracks.filter(id => id !== item.id);
                        else next.musicTracks = [...next.musicTracks, item.id];
                      }
                      if (item.type === 'BoardTheme') next.boardTheme = isEquipped ? 'theme-basic' : item.id;
                      if (item.type === 'TileSkin') {
                        const val = (item as TileSkin).value as string;
                        if (isEquipped) next.activeLaws = next.activeLaws.filter(id => id !== val);
                        else next.activeLaws = [...next.activeLaws, val];
                      }
                      return next;
                    });
                  }}
                  className={`mt-auto w-full py-1.5 rounded-lg text-xs font-bold transition-colors ${isEquipped ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
                >
                  {isEquipped ? (item.type === 'TileSkin' ? t.labLog.deactivateLaw : t.labLog.equipped) : (item.type === 'TileSkin' ? t.labLog.activateLaw : t.labLog.equip)}
                </button>
              ) : (
                <div className="mt-auto w-full py-1.5 rounded-lg text-xs font-bold bg-slate-200/50 text-slate-400">{t.labLog.notUnlocked}</div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const hasNewItems = (tabId: string) => {
    if (tabId === 'planets') {
      return gachaPool.some(item => item.type === 'TileSkin' && typeof (item as TileSkin).value === 'number' && newGachaItems.includes(item.id));
    }
    if (tabId === 'audio') {
      return gachaPool.some(item => (item.type === 'SoundKit' || item.type === 'MusicTrack') && newGachaItems.includes(item.id));
    }
    if (tabId === 'themes') {
      return gachaPool.some(item => item.type === 'BoardTheme' && newGachaItems.includes(item.id));
    }
    if (tabId === 'laws') {
      return gachaPool.some(item => item.type === 'TileSkin' && typeof (item as TileSkin).value === 'string' && newGachaItems.includes(item.id));
    }
    return false;
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-6">
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 justify-center">
        {[
          { id: 'planets', icon: '🪐', label: t.labLog.tabs.planets },
          { id: 'audio', icon: '🎵', label: t.labLog.tabs.audio },
          { id: 'themes', icon: '🖼️', label: t.labLog.tabs.themes },
          { id: 'laws', icon: '✨', label: t.labLog.tabs.laws }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => { soundEngine.playClick(); setActiveTab(tab.id as any); }}
            className={`relative px-4 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2
              ${activeTab === tab.id 
                ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/30' 
                : (isDarkMode ? 'bg-white/10 text-slate-300 hover:bg-white/20' : 'bg-white text-slate-600 hover:bg-slate-50 shadow-sm border border-slate-200')
              }
            `}
          >
            {hasNewItems(tab.id) && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-indigo-950 animate-pulse" />
            )}
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'audio' && (
        <div className="flex flex-col gap-6">
          <div>
            <h3 className={`text-lg font-black mb-4 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{t.labLog.soundKits}</h3>
            {renderGridItems('SoundKit')}
          </div>
          <div>
            <h3 className={`text-lg font-black mb-4 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{t.labLog.musicTracks}</h3>
            {renderGridItems('MusicTrack')}
          </div>
        </div>
      )}

      {activeTab === 'themes' && renderGridItems('BoardTheme')}
      {activeTab === 'laws' && renderGridItems('TileSkin')}

      {activeTab === 'planets' && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
          {Object.entries(planetDatabase).filter(([id]) => !id.startsWith('CMT')).map(([id, planet]) => {
            const isOwned = gachaCollection.some(itemId => itemId.startsWith(`skin-${id}-`));
            const isUnlocked = unlockedPlanets.includes(id) || isOwned;
            const isNew = newGachaItems.some(itemId => itemId.startsWith(`skin-${id}-`));
            
            return (
              <div 
                key={id}
                onClick={() => {
                  handlePlanetClick(id, isUnlocked);
                  if (isNew) {
                    setNewGachaItems(prev => prev.filter(itemId => !itemId.startsWith(`skin-${id}-`)));
                  }
                }}
                className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 
                  ${isUnlocked 
                    ? (isDarkMode ? 'bg-white/10 border border-white/20 shadow-md hover:scale-105 hover:shadow-lg hover:bg-white/20' : planet.color + ' shadow-md hover:scale-105 hover:shadow-lg') 
                    : (isDarkMode ? 'bg-white/5 border border-white/5' : 'bg-slate-100 border border-slate-200')}
                  ${isOwned ? 'ring-2 ring-indigo-400 ring-offset-2 ring-offset-transparent' : ''}
                `}
              >
                {isNew && (
                  <div className="absolute -top-2 -right-2 z-20 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-md animate-bounce">
                    NEW
                  </div>
                )}
                <div className="relative z-10 w-full h-full flex flex-col items-center justify-center overflow-hidden rounded-2xl">
                  {isUnlocked ? (
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 2 + Math.random(), repeat: Infinity, ease: "easeInOut" }}
                      className="w-full h-full flex flex-col items-center justify-center relative"
                    >
                      <div className="scale-75 pointer-events-none">
                        <PlanetVisual value={id} form={isOwned ? 4 : 1} rarity="N" color={planet.color} />
                      </div>
                      <div className="relative z-10 flex flex-col items-center mt-2">
                        <span className={`text-[0.6rem] font-bold text-center px-1 drop-shadow-sm ${isDarkMode ? 'text-white/80' : 'text-slate-700'}`}>{t.labLog.planets[id as keyof typeof t.labLog.planets]?.name || planet.name}</span>
                      </div>
                    </motion.div>
                  ) : (
                    <div className={`flex flex-col items-center opacity-30 ${isDarkMode ? 'text-slate-300' : 'text-slate-400'}`}>
                      <span className="text-4xl font-black mb-1">?</span>
                      <span className="text-xs font-bold">{t.labLog.undiscovered}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 提示 Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-rose-500 text-white px-6 py-3 rounded-full shadow-xl font-bold text-sm whitespace-nowrap z-50"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 进化树弹窗 */}
      <AnimatePresence>
        {selectedPlanet && planetDatabase[selectedPlanet] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4"
            onClick={() => setSelectedPlanet(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className={`relative w-full max-w-3xl border rounded-3xl p-8 shadow-2xl overflow-hidden
                ${isDarkMode ? 'bg-indigo-950 border-indigo-500/30' : 'bg-slate-100 border-slate-200'}
              `}
            >
              <button 
                onClick={() => setSelectedPlanet(null)}
                className={`absolute top-4 right-4 transition-colors z-30 rounded-full p-2
                  ${isDarkMode ? 'text-indigo-300 hover:text-white bg-white/10' : 'text-slate-400 hover:text-slate-600 bg-white shadow-sm'}
                `}
              >
                <X size={20} />
              </button>

              <div className="text-center mb-8">
                <h2 className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                  {t.labLog.planets[selectedPlanet as keyof typeof t.labLog.planets]?.name || planetDatabase[selectedPlanet].name}
                </h2>
                <p className={`text-sm mt-2 ${isDarkMode ? 'text-indigo-200' : 'text-slate-500'}`}>
                  {lang === 'zh' ? '点击卡牌翻转查看详情' : 'Tap card to flip and view details'}
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['N', 'R', 'SR', 'UR'].map(rarity => {
                  const skinId = `skin-${selectedPlanet}-${rarity}`;
                  const item = gachaPool.find(i => i.id === skinId) as TileSkin;
                  if (!item) return null;
                  
                  const isUnlocked = gachaCollection.includes(skinId);
                  const isEquipped = equipment.tileSkins[selectedPlanet] === skinId;

                  const isNew = newGachaItems.includes(skinId);

                  return (
                    <FlipCard
                      key={skinId}
                      item={item}
                      isUnlocked={isUnlocked}
                      isEquipped={isEquipped}
                      color={planetDatabase[selectedPlanet].color}
                      isNew={isNew}
                      onRemoveNew={() => setNewGachaItems(prev => prev.filter(id => id !== skinId))}
                      lang={lang}
                      t={t}
                      onEquip={() => {
                        soundEngine.playClick();
                        setEquipment(prev => ({
                          ...prev,
                          tileSkins: { ...prev.tileSkins, [selectedPlanet]: skinId }
                        }));
                      }}
                    />
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
