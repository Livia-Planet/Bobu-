import React from 'react';
import { motion } from 'motion/react';
import { EquipmentState, TileSkin } from '../types';
import { gachaPool } from '../constants';

interface PlanetEyesProps {
  value: number | string;
  lastMoveDir: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | null;
  isMerging?: boolean;
  form?: number;
}

export const PlanetEyes: React.FC<PlanetEyesProps> = ({ value, lastMoveDir, isMerging, form = 2 }) => {
  const numValue = typeof value === 'number' ? value : 0;
  
  if (numValue === 0 && typeof value !== 'string') return null;

  const pupilOffset = {
    UP: { y: -4, x: 0 },
    DOWN: { y: 4, x: 0 },
    LEFT: { x: -4, y: 0 },
    RIGHT: { x: 4, y: 0 },
  }[lastMoveDir || 'DOWN'] || { x: 0, y: 0 };

  const blinkAnimation = {
    scaleY: [1, 0.1, 1],
    transition: {
      duration: 0.15,
      repeat: Infinity,
      repeatDelay: 3 + Math.random() * 2, // 3-5s
      ease: "easeInOut"
    }
  };

  const Eye = ({ sizeClass = "w-3 h-3", pupilClass = "w-1.5 h-1.5 bg-slate-800" }) => (
    <div className={`${sizeClass} bg-white rounded-full flex items-center justify-center overflow-hidden shadow-sm border border-black/10`}>
      {isMerging ? (
        <svg viewBox="0 0 24 24" className="w-[80%] h-[80%] text-slate-800" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 6l6 6-6 6M18 6l-6 6 6 6" />
        </svg>
      ) : (
        <motion.div 
          className={`${pupilClass} rounded-full`}
          animate={pupilOffset}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        />
      )}
    </div>
  );

  const Mouth = () => {
    if (form < 3) return null;
    return (
      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-0.5 z-20 pointer-events-none">
        {isMerging ? (
          <div className="w-3 h-3 bg-rose-400 rounded-full animate-pulse" />
        ) : (
          <svg viewBox="0 0 24 24" className="w-4 h-4 text-slate-800" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 10 Q12 14 16 10" />
          </svg>
        )}
      </div>
    );
  };

  // 2, 4, 8: 1 eye
  if (numValue === 2) return <motion.div className="absolute top-2 left-0 w-full flex justify-center z-20 pointer-events-none" animate={blinkAnimation}><Eye sizeClass="w-2 h-2" pupilClass="w-1 h-1 bg-slate-800" /><Mouth /></motion.div>;
  if (numValue === 4) return <motion.div className="absolute top-2 left-0 w-full flex justify-center z-20 pointer-events-none" animate={blinkAnimation}><Eye sizeClass="w-3 h-3" pupilClass="w-1.5 h-1.5 bg-slate-800" /><Mouth /></motion.div>;
  if (numValue === 8) return <motion.div className="absolute top-2 left-0 w-full flex justify-center z-20 pointer-events-none" animate={blinkAnimation}><Eye sizeClass="w-4 h-4" pupilClass="w-2 h-2 bg-slate-800" /><Mouth /></motion.div>;

  // 16, 32, 64: 2 eyes
  if (numValue === 16) return <motion.div className="absolute top-2 left-0 w-full flex justify-center gap-0 z-20 pointer-events-none" animate={blinkAnimation}><Eye sizeClass="w-2.5 h-2.5" pupilClass="w-1 h-1 bg-slate-800" /><Eye sizeClass="w-2.5 h-2.5" pupilClass="w-1 h-1 bg-slate-800" /><Mouth /></motion.div>;
  if (numValue === 32) return <motion.div className="absolute top-2 left-0 w-full flex justify-center gap-1 z-20 pointer-events-none" animate={blinkAnimation}><Eye sizeClass="w-3 h-3" pupilClass="w-1.5 h-1.5 bg-slate-800" /><Eye sizeClass="w-3 h-3" pupilClass="w-1.5 h-1.5 bg-slate-800" /><Mouth /></motion.div>;
  if (numValue === 64) return <motion.div className="absolute top-2 left-0 w-full flex justify-center gap-2 z-20 pointer-events-none" animate={blinkAnimation}><Eye sizeClass="w-4 h-4" pupilClass="w-2 h-2 bg-slate-800" /><Eye sizeClass="w-4 h-4" pupilClass="w-2 h-2 bg-slate-800" /><Mouth /></motion.div>;

  // 128, 256, 512: 3 eyes (品)
  if (numValue === 128 || numValue === 256 || numValue === 512) {
    const size = numValue === 128 ? "w-2.5 h-2.5" : numValue === 256 ? "w-3 h-3" : "w-3.5 h-3.5";
    const pSize = numValue === 128 ? "w-1 h-1" : numValue === 256 ? "w-1.5 h-1.5" : "w-1.5 h-1.5";
    return (
      <motion.div className="absolute top-1 left-0 w-full flex flex-col items-center gap-0.5 z-20 pointer-events-none" animate={blinkAnimation}>
        <Eye sizeClass={size} pupilClass={`${pSize} bg-slate-800`} />
        <div className="flex gap-1 relative">
          <Eye sizeClass={size} pupilClass={`${pSize} bg-slate-800`} />
          <Eye sizeClass={size} pupilClass={`${pSize} bg-slate-800`} />
          <Mouth />
        </div>
      </motion.div>
    );
  }

  // 1024: 4 eyes (2x2)
  if (numValue === 1024) {
    return (
      <motion.div className="absolute top-1 left-0 w-full flex flex-col items-center gap-0.5 z-20 pointer-events-none" animate={blinkAnimation}>
        <div className="flex gap-0.5">
          <Eye sizeClass="w-3 h-3" pupilClass="w-1.5 h-1.5 bg-slate-800" />
          <Eye sizeClass="w-3 h-3" pupilClass="w-1.5 h-1.5 bg-slate-800" />
        </div>
        <div className="flex gap-0.5 relative">
          <Eye sizeClass="w-3 h-3" pupilClass="w-1.5 h-1.5 bg-slate-800" />
          <Eye sizeClass="w-3 h-3" pupilClass="w-1.5 h-1.5 bg-slate-800" />
          <Mouth />
        </div>
      </motion.div>
    );
  }

  // 2048: 1 super giant eye
  if (numValue === 2048) {
    return (
      <motion.div className="absolute top-1 left-0 w-full flex justify-center z-20 pointer-events-none" animate={blinkAnimation}>
        <Eye sizeClass="w-8 h-8" pupilClass="w-4 h-4 bg-rose-900" />
        <Mouth />
      </motion.div>
    );
  }

  // 4096 or CMT: Closed eyes / twinkling star eyes
  if (numValue >= 4096 || typeof value === 'string') {
    return (
      <motion.div className="absolute top-2 left-0 w-full flex justify-center gap-2 z-20 pointer-events-none text-lg">
        <motion.span animate={{ opacity: [0.5, 1, 0.5], scale: [0.8, 1.2, 0.8] }} transition={{ duration: 1, repeat: Infinity }}>✨</motion.span>
        <motion.span animate={{ opacity: [0.5, 1, 0.5], scale: [0.8, 1.2, 0.8] }} transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}>✨</motion.span>
        <Mouth />
      </motion.div>
    );
  }

  return null;
};

export const URAccessory: React.FC<{ value: number | string }> = ({ value }) => {
  if (value === 256) {
    return (
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-4 flex justify-between items-center z-30 pointer-events-none">
        <div className="w-4 h-4 border-2 border-slate-800 rounded-sm"></div>
        <div className="w-2 h-0.5 bg-slate-800"></div>
        <div className="w-4 h-4 border-2 border-slate-800 rounded-sm"></div>
      </div>
    );
  }
  if (value === 1024) {
    return (
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-1 w-12 flex justify-between px-1 z-30 pointer-events-none opacity-50">
        <div className="flex gap-0.5"><div className="w-1 h-1 bg-amber-900 rounded-full"/><div className="w-1 h-1 bg-amber-900 rounded-full mt-1"/></div>
        <div className="flex gap-0.5"><div className="w-1 h-1 bg-amber-900 rounded-full mt-1"/><div className="w-1 h-1 bg-amber-900 rounded-full"/></div>
      </div>
    );
  }
  if (value === 2048) {
    return (
      <div className="absolute top-2 right-2 w-6 h-2 bg-amber-200/80 border border-amber-400/50 rounded-sm rotate-45 z-30 pointer-events-none flex items-center justify-center">
        <div className="w-1 h-1 bg-amber-400/50 rounded-full"></div>
      </div>
    );
  }
  if (value === 128) {
    return <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-xl z-30 pointer-events-none">👑</div>;
  }
  if (value === 512) {
    return <div className="absolute top-1 right-1 text-lg z-30 pointer-events-none">🌀</div>;
  }
  if (value === 64) {
    return <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xl z-30 pointer-events-none">🌱</div>;
  }
  return null;
};

interface PlanetTileProps {
  tile: any;
  planet: any;
  isHybrid: boolean;
  isConflicting: boolean;
  isResonant: boolean;
  activeProp: string | null;
  flashId: string | null;
  isDarkMode: boolean;
  lastMoveDir: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | null;
  t: any;
  onTileClick: (r: number, c: number, id: string) => void;
  onAscend: (r: number, c: number) => void;
  onBoost: (id: string) => void;
  equipment: EquipmentState;
  showInfoOverlay?: boolean;
  tutorialStep?: string;
}

export const PlanetTile: React.FC<PlanetTileProps> = ({
  tile, planet, isHybrid, isConflicting, isResonant, activeProp, flashId, isDarkMode, lastMoveDir, t, onTileClick, onAscend, onBoost, equipment, showInfoOverlay = false, tutorialStep
}) => {
  const [isMerging, setIsMerging] = React.useState(false);
  const prevValueRef = React.useRef(tile.value);

  React.useEffect(() => {
    if (tile.value !== prevValueRef.current) {
      setIsMerging(true);
      prevValueRef.current = tile.value;
      const timer = setTimeout(() => setIsMerging(false), 200);
      return () => clearTimeout(timer);
    }
  }, [tile.value]);

  let animateProps: any = { scaleX: 1, scaleY: 1, scale: 1, opacity: 1 };
  if (isMerging) {
    const intensity = typeof tile.value === 'number' ? Math.min(0.5, Math.log2(tile.value) * 0.05) : 0.2;
    if (lastMoveDir === 'LEFT' || lastMoveDir === 'RIGHT') {
      animateProps = { scaleX: 1 + intensity, scaleY: 1 - intensity * 0.6, opacity: 1 };
    } else if (lastMoveDir === 'UP' || lastMoveDir === 'DOWN') {
      animateProps = { scaleX: 1 - intensity * 0.6, scaleY: 1 + intensity, opacity: 1 };
    } else {
      animateProps = { scale: 1 + intensity, opacity: 1 };
    }
  }

  const equippedSkinId = equipment.tileSkins[String(tile.value)];
  const equippedSkin = equippedSkinId ? gachaPool.find(item => item.id === equippedSkinId) as TileSkin : null;
  const form = equippedSkin ? equippedSkin.form : 1;
  const showEyes = form >= 2;
  const isUR = form >= 4;
  const showURGlow = isUR && !isHybrid;
  const isCmt = typeof tile.value === 'string' && tile.value.startsWith('CMT');
  const isTutorialTarget = tutorialStep === 'double_tap_cmt' && isCmt;

  return (
    <motion.div
      layout
      initial={{ scale: 0, opacity: 0 }}
      animate={animateProps}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 12 }}
      onClick={(e) => {
        e.stopPropagation();
        onTileClick(tile.r, tile.c, tile.id);
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        if (isCmt) {
          onAscend(tile.r, tile.c);
        }
      }}
      onDragOver={(e) => {
        if (typeof tile.value === 'number' && !tile.attributeType) {
          e.preventDefault();
        }
      }}
      onDrop={(e) => {
        if (e.dataTransfer.getData('prop') === 'plus') {
          onBoost(tile.id);
        }
      }}
      className={`absolute w-[4.5rem] h-[4.5rem] rounded-3xl flex flex-col items-center justify-center transition-transform
        ${isTutorialTarget ? 'z-[1001] relative ring-4 ring-yellow-400 animate-pulse' : ''}
        ${showInfoOverlay ? 'z-50' : 'z-10'}
        ${isHybrid ? 'bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 shadow-[0_10px_20px_rgba(168,85,247,0.3)]' : planet.color}
        ${isConflicting ? 'border-4 border-red-400 shadow-[0_0_20px_rgba(248,113,113,0.6)] animate-pulse' : ''}
        ${isResonant && !isConflicting ? 'shadow-[0_0_15px_rgba(255,255,255,0.8)] border border-white/80' : ''}
        ${showURGlow ? 'shadow-[inset_0_0_20px_rgba(255,255,255,0.6),inset_0_-10px_20px_rgba(0,0,0,0.2),0_0_20px_rgba(250,204,21,0.6)] after:absolute after:top-1 after:left-1 after:w-1/3 after:h-1/4 after:bg-white/40 after:rounded-full after:rotate-[-25deg] after:pointer-events-none after:z-0' : 'shadow-md'}
        ${activeProp === 'plus' && typeof tile.value === 'number' && tile.value < 2048 ? 'hover:scale-110 hover:shadow-[0_10px_20px_rgba(250,204,21,0.4)] hover:z-20' : ''}
        ${flashId === tile.id ? 'bg-red-400 shadow-[0_0_30px_rgba(248,113,113,0.8)] scale-110 z-30' : ''}
      `}
      style={{
        top: `calc(1rem + ${tile.r} * (4.5rem + 0.75rem))`,
        left: `calc(1rem + ${tile.c} * (4.5rem + 0.75rem))`
      }}
    >
      {showEyes && <PlanetEyes value={tile.value} lastMoveDir={lastMoveDir} isMerging={isMerging} form={form} />}
      {isUR && !isHybrid && <URAccessory value={tile.value} />}
      
      {isHybrid && (
        <div className="absolute inset-0 rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent animate-[shimmer_2s_infinite] -skew-x-12" />
        </div>
      )}

      {showInfoOverlay && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-black text-white">{typeof tile.value === 'string' ? '✨' : tile.value}</span>
          <span className="text-[0.6rem] font-bold opacity-80 mt-0.5 px-1 text-center leading-tight text-white/80">{isHybrid ? t.hybrid : (t.labLog.planets[tile.value as keyof typeof t.labLog.planets]?.name || planet.name)}</span>
        </div>
      )}

      {tile.attributeType && tile.attributeType !== 'HYBRID' && (
        <div className="absolute -top-2 -right-2 flex flex-col items-end z-10">
          <div className="w-6 h-6 bg-purple-500 border-2 border-white text-white text-xs font-black rounded-full flex items-center justify-center shadow-md">
            {String(t.attributes[tile.attributeType as keyof typeof t.attributes] || tile.attributeType).charAt(0)}
          </div>
        </div>
      )}
      
      {isHybrid && (
        <div className="absolute -top-2 -right-2 flex flex-col items-end z-10">
          <div className="w-6 h-6 bg-gradient-to-r from-cyan-400 to-pink-500 border-2 border-white text-white text-xs font-black rounded-full flex items-center justify-center shadow-md">
            H
          </div>
        </div>
      )}

      {tile.attributeName && (
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white/90 dark:bg-slate-800/90 text-[10px] sm:text-xs font-bold text-slate-800 dark:text-white px-2 py-1 rounded-full shadow-md z-20 pointer-events-none backdrop-blur-sm border border-slate-200 dark:border-slate-700">
          {tile.attributeName.split('+').map((part: string) => t.attributes[part as keyof typeof t.attributes] || t.chains[part as keyof typeof t.chains] || part).join('+')}
        </div>
      )}
    </motion.div>
  );
};
