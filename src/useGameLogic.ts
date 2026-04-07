import { useState, useCallback, useEffect } from 'react';
import { GridData, TileData, AttributeType, Toast, TutorialStep, GameState } from './types';
import { ATTRIBUTE_NAMES, EvolutionRecipes } from './constants';
import { soundEngine, MelodySequencer } from './SoundEngine';

// Bobu的物理法则：定义宇宙的边界
const GRID_SIZE = 4;

const createEmptyGrid = (): GridData => Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));

// Bobu的创世引擎：生成新的星体
const getMaxTile = (grid: GridData) => {
  let max = 0;
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const val = grid[r][c]?.value;
      if (typeof val === 'number' && val > max) max = val;
    }
  }
  return max;
};

const generateRandomTile = (maxTile: number, activeFamilies: string[]): TileData => {
  const value = Math.random() < 0.9 ? 2 : 4;
  let hasAttribute = false;
  if (maxTile >= 1024) hasAttribute = Math.random() < 0.6;
  else if (maxTile >= 256) hasAttribute = Math.random() < 0.3;
  else if (maxTile >= 64) hasAttribute = Math.random() < 0.15;
  else hasAttribute = false;

  if (activeFamilies.length === 0) hasAttribute = false;

  if (!hasAttribute) {
    return { id: Math.random().toString(36).substring(2, 9), value, attributeType: null, attributeName: null };
  }

  const availableIndices = [];
  if (activeFamilies.includes('Bobu')) availableIndices.push(0);
  if (activeFamilies.includes('Duddu')) availableIndices.push(1);
  if (activeFamilies.includes('Issi')) availableIndices.push(2);
  
  if (availableIndices.length === 0) {
    return { id: Math.random().toString(36).substring(2, 9), value, attributeType: null, attributeName: null };
  }

  const chainIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
  const types: AttributeType[] = ['C', 'M', 'T'];
  const type = types[Math.floor(Math.random() * types.length)];
  const name = ATTRIBUTE_NAMES[type][chainIndex];

  return { id: Math.random().toString(36).substring(2, 9), value, attributeType: type, attributeName: name };
};

const addRandomTile = (grid: GridData, activeFamilies: string[]): GridData => {
  const emptyCells = [];
  let maxTile = 0;
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] === null) {
        emptyCells.push({r, c});
      } else {
        const val = grid[r][c]!.value;
        if (typeof val === 'number' && val > maxTile) maxTile = val;
      }
    }
  }
  if (emptyCells.length === 0) return grid;
  const {r, c} = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  const newGrid = [...grid];
  newGrid[r] = [...newGrid[r]];
  newGrid[r][c] = generateRandomTile(maxTile, activeFamilies);
  return newGrid;
};

// Bobu的遗传学定律：属性继承与冲突
const getChainIndex = (name: string | null) => {
  if (!name) return -1;
  const c0 = ['Bobu', '米特拉姆', '农业生物工程'];
  const c1 = ['Duddu', '秦陵', '多维阵列拓扑'];
  const c2 = ['Issi', '亚特兰蒂斯', '恒星聚变原质'];
  
  const parts = name.split('+');
  const p = parts[0];
  if (c0.includes(p)) return 0;
  if (c1.includes(p)) return 1;
  if (c2.includes(p)) return 2;
  return -1;
};

const getMergedAttribute = (t1: TileData, t2: TileData, activeLaws: string[]): { type: AttributeType | 'CMT_RESULT', name: string | null, isExplosion: boolean, resultId?: string, message?: string } => {
  if (t1.attributeType && !t2.attributeType) return { type: t1.attributeType, name: t1.attributeName, isExplosion: false };
  if (!t1.attributeType && t2.attributeType) return { type: t2.attributeType, name: t2.attributeName, isExplosion: false };
  if (!t1.attributeType && !t2.attributeType) return { type: null, name: null, isExplosion: false };

  const chain1 = getChainIndex(t1.attributeName);
  const chain2 = getChainIndex(t2.attributeName);

  // 判定 2：跨链湮灭
  if (chain1 !== chain2 && chain1 !== -1 && chain2 !== -1) {
    return { type: null, name: null, isExplosion: true };
  }

  // 判定 1：同链合体
  if (chain1 === chain2 && chain1 !== -1) {
    const parts1 = t1.attributeName!.split('+');
    const parts2 = t2.attributeName!.split('+');
    const uniqueParts = Array.from(new Set([...parts1, ...parts2])).sort();

    // 如果两者都是 HYBRID，合并结果直接升级为该链的 CMT
    if (t1.attributeType === 'HYBRID' && t2.attributeType === 'HYBRID') {
      const recipe = EvolutionRecipes[chain1];
      return { type: 'CMT_RESULT', name: null, isExplosion: false, resultId: recipe.resultId, message: recipe.newAnimismDesc };
    }

    if (uniqueParts.length >= 3) {
      const recipe = EvolutionRecipes[chain1];
      return { type: 'CMT_RESULT', name: null, isExplosion: false, resultId: recipe.resultId, message: recipe.newAnimismDesc };
    } else if (uniqueParts.length === 2) {
      return { type: 'HYBRID', name: uniqueParts.join('+'), isExplosion: false };
    } else {
      return { type: t1.attributeType, name: uniqueParts[0], isExplosion: false };
    }
  }

  return { type: null, name: null, isExplosion: false };
};

// 预测冲突的方块，用于UI警告
export const getConflictingIds = (grid: GridData, direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT', activeLaws: string[]): string[] => {
  let testGrid = grid;
  if (direction === 'RIGHT') testGrid = reverseRows(grid);
  else if (direction === 'UP') testGrid = rotateLeft(grid);
  else if (direction === 'DOWN') testGrid = rotateRight(grid);

  const conflictingIds: string[] = [];
  testGrid.forEach(row => {
    let filtered = row.filter(t => t !== null) as TileData[];
    for (let i = 0; i < filtered.length - 1; i++) {
      if (typeof filtered[i].value === 'number' && filtered[i].value === filtered[i+1].value) {
        const mergedAttr = getMergedAttribute(filtered[i], filtered[i+1], activeLaws);
        if (mergedAttr.isExplosion) {
          conflictingIds.push(filtered[i].id, filtered[i+1].id);
        }
        i++; // 跳过已合并的方块
      }
    }
  });
  return conflictingIds;
};

// 施加向左的引力场！星体们开始碰撞啦！
const moveLeft = (grid: GridData, activeLaws: string[] = [], unlockedChainsCount: number = 1) => {
  let moved = false;
  let score = 0;
  let created2048 = false; // 记录是否生成了黑洞宝宝！
  let created4096 = false; // 记录是否生成了恒星巨无霸！
  let explosionCount = 0;
  let instabilityDelta = 0;
  let carrotsReward = 0;
  let plusCoinsReward = 0;
  let synthesisMessages: string[] = [];
  let toastEvents: {textKey: string, color: string, r: number, c: number}[] = [];
  let comboCount = 0;
  let maxMergedValue = 0;

  const newGrid = grid.map((row, r) => {
    let filtered = row.filter(t => t !== null) as TileData[];
    for (let i = 0; i < filtered.length - 1; i++) {
      const t1 = filtered[i];
      const t2 = filtered[i+1];

      const isNormalMerge = typeof t1.value === 'number' && t1.value === t2.value;
      const isCmtMerge = typeof t1.value === 'string' && t1.value.startsWith('CMT') && typeof t2.value === 'string' && t2.value.startsWith('CMT');

      if (isNormalMerge) {
        const mergedAttr = getMergedAttribute(t1, t2, activeLaws);
        const newValue = (t1.value as number) * 2;
        if (newValue > maxMergedValue) maxMergedValue = newValue;
        let mergeScore = newValue;
        if (activeLaws.includes('CMT_ISSI')) {
          mergeScore += 50;
        }

        if (mergedAttr.isExplosion) {
          // 属性冲突！执行普通合并，但触发 backfire
          let penalty = 0;
          if (unlockedChainsCount === 2) penalty = 5;
          else if (unlockedChainsCount >= 3) penalty = 12;

          instabilityDelta += penalty;
          explosionCount++;
          toastEvents.push({ textKey: 'explosionToast', color: '#EF4444', r, c: i });
          filtered[i] = {
            ...t1,
            value: 2, // 退化法则
            attributeType: null,
            attributeName: null
          };
        } else if (mergedAttr.type === 'CMT_RESULT') {
          // 合成奇迹星！
          instabilityDelta -= 5; // 奖励降温
          comboCount++;
          synthesisMessages.push(mergedAttr.message!);
          toastEvents.push({ textKey: 'miracleToast', color: '#F59E0B', r, c: i });
          filtered[i] = {
            id: Math.random().toString(),
            value: mergedAttr.resultId!,
            attributeType: null,
            attributeName: null,
            level: newValue
          };
        } else {
          // 正常合并
          comboCount++;
          if (newValue >= 16) {
            const carrots = Math.max(1, Math.floor(Math.log2(newValue) - 3));
            carrotsReward += carrots;
            toastEvents.push({ textKey: `+${carrots} 🥕`, color: '#f97316', r, c: i });
          }
          if (newValue >= 64) {
            const coins = Math.floor(Math.log2(newValue) - 5);
            plusCoinsReward += coins;
            toastEvents.push({ textKey: `+${coins} 🪙`, color: '#eab308', r, c: i });
          }
          if (newValue >= 2048) created2048 = true; // 捕捉到2048的诞生！
          if (newValue >= 4096) created4096 = true; // 捕捉到4096的诞生！
          instabilityDelta -= 2; // 常规合并降低坍缩值
          filtered[i] = {
            ...t1,
            value: newValue,
            attributeType: mergedAttr.type as AttributeType,
            attributeName: mergedAttr.name
          };
        }
        score += mergeScore;
        filtered.splice(i + 1, 1);
        moved = true;
      } else if (isCmtMerge) {
        carrotsReward += 3;
        plusCoinsReward += 3;
        score += 5000;
        filtered.splice(i, 2); // 两个 CMT 都消失
        moved = true;
        i--;
      }
    }
    
    if (comboCount > 2) {
      plusCoinsReward += (comboCount - 2);
    }

    const newRow = [...filtered];
    while (newRow.length < GRID_SIZE) newRow.push(null);
    for(let i=0; i<GRID_SIZE; i++) {
      if(row[i]?.id !== newRow[i]?.id) moved = true;
    }
    return newRow;
  });
  return { newGrid, moved, score, created2048, created4096, explosionCount, instabilityDelta, carrotsReward, plusCoinsReward, synthesisMessages, toastEvents, maxMergedValue, comboCount };
};

// 空间折叠技术：通过旋转网格复用向左滑动的逻辑
const rotateLeft = (grid: GridData): GridData => {
  const newGrid = createEmptyGrid();
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      newGrid[GRID_SIZE - 1 - c][r] = grid[r][c];
    }
  }
  return newGrid;
};

const rotateRight = (grid: GridData): GridData => {
  const newGrid = createEmptyGrid();
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      newGrid[c][GRID_SIZE - 1 - r] = grid[r][c];
    }
  }
  return newGrid;
};

const reverseRows = (grid: GridData): GridData => {
  return grid.map(row => [...row].reverse());
};

const moveRight = (grid: GridData, activeLaws: string[] = [], unlockedChainsCount: number = 1) => {
  const reversed = reverseRows(grid);
  const { newGrid, moved, score, created2048, created4096, explosionCount, instabilityDelta, carrotsReward, plusCoinsReward, synthesisMessages, toastEvents, maxMergedValue, comboCount } = moveLeft(reversed, activeLaws, unlockedChainsCount);
  const transformedToasts = toastEvents.map(t => ({ ...t, c: GRID_SIZE - 1 - t.c }));
  return { newGrid: reverseRows(newGrid), moved, score, created2048, created4096, explosionCount, instabilityDelta, carrotsReward, plusCoinsReward, synthesisMessages, toastEvents: transformedToasts, maxMergedValue, comboCount };
};

const moveUp = (grid: GridData, activeLaws: string[] = [], unlockedChainsCount: number = 1) => {
  const rotated = rotateLeft(grid);
  const { newGrid, moved, score, created2048, created4096, explosionCount, instabilityDelta, carrotsReward, plusCoinsReward, synthesisMessages, toastEvents, maxMergedValue, comboCount } = moveLeft(rotated, activeLaws, unlockedChainsCount);
  const transformedToasts = toastEvents.map(t => ({ ...t, r: t.c, c: GRID_SIZE - 1 - t.r }));
  return { newGrid: rotateRight(newGrid), moved, score, created2048, created4096, explosionCount, instabilityDelta, carrotsReward, plusCoinsReward, synthesisMessages, toastEvents: transformedToasts, maxMergedValue, comboCount };
};

const moveDown = (grid: GridData, activeLaws: string[] = [], unlockedChainsCount: number = 1) => {
  const rotated = rotateRight(grid);
  const { newGrid, moved, score, created2048, created4096, explosionCount, instabilityDelta, carrotsReward, plusCoinsReward, synthesisMessages, toastEvents, maxMergedValue, comboCount } = moveLeft(rotated, activeLaws, unlockedChainsCount);
  const transformedToasts = toastEvents.map(t => ({ ...t, r: GRID_SIZE - 1 - t.c, c: t.r }));
  return { newGrid: rotateLeft(newGrid), moved, score, created2048, created4096, explosionCount, instabilityDelta, carrotsReward, plusCoinsReward, synthesisMessages, toastEvents: transformedToasts, maxMergedValue, comboCount };
};

const checkGameOver = (grid: GridData, instability: number): boolean => {
  if (instability >= 100) return true;
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] === null) return false; // 还有空位，宇宙还在膨胀
      
      const current = grid[r][c];
      const right = c < GRID_SIZE - 1 ? grid[r][c+1] : null;
      const down = r < GRID_SIZE - 1 ? grid[r+1][c] : null;

      const canMerge = (t1: TileData | null, t2: TileData | null) => {
        if (!t1 || !t2) return false;
        if (typeof t1.value === 'number' && t1.value === t2.value) return true;
        if (t1.value === 'CMT' && t2.value === 'CMT') return true;
        return false;
      };

      if (canMerge(current, right)) return false;
      if (canMerge(current, down)) return false;
    }
  }
  return true; // 彻底卡死啦
};

export const useGameLogic = (musicTracks: string[] = ['music-twinkle']) => {
  const [bestScore, setBestScore] = useState(() => {
    const saved = localStorage.getItem('bobu_bestScore');
    return saved !== null ? parseInt(saved, 10) : 0;
  });

  const [lifetimeScore, setLifetimeScore] = useState(() => {
    const saved = localStorage.getItem('bobu_lifetimeScore');
    return saved !== null ? parseInt(saved, 10) : 0;
  });

  const [unlockedChains, setUnlockedChains] = useState<string[]>(() => {
    const saved = localStorage.getItem('bobu_unlockedChains');
    return saved ? JSON.parse(saved) : ['Bobu'];
  });

  const [activeFamilies, setActiveFamilies] = useState<string[]>(() => {
    const saved = localStorage.getItem('bobu_activeFamilies');
    if (saved) return JSON.parse(saved);
    const initialChains = localStorage.getItem('bobu_unlockedChains') ? JSON.parse(localStorage.getItem('bobu_unlockedChains')!) : ['Bobu'];
    return initialChains;
  });

  const [tutorialStep, setTutorialStep] = useState<TutorialStep>(() => {
    const saved = localStorage.getItem('bobu_tutorial');
    if (saved === 'lang_select') return 'welcome'; // Migrate old state
    return (saved as TutorialStep) || 'welcome';
  });
  
  useEffect(() => { localStorage.setItem('bobu_tutorial', tutorialStep || ''); }, [tutorialStep]);

  const advanceTutorial = useCallback((targetStep: TutorialStep) => {
    setTutorialStep(targetStep);
    if (targetStep === 'gacha_guide') {
      setPlusCoins(prev => prev + 5);
    }
  }, []);

  const [hasOpenedDrawer, setHasOpenedDrawer] = useState<boolean>(() => {
    return localStorage.getItem('bobu_hasOpenedDrawer') === 'true';
  });
  const [hasPulledGacha, setHasPulledGacha] = useState<boolean>(() => {
    return localStorage.getItem('bobu_hasPulledGacha') === 'true';
  });

  const [hasSeenLawTutorial, setHasSeenLawTutorial] = useState<boolean>(() => {
    return localStorage.getItem('bobu_has_seen_law_tutorial') === 'true';
  });

  const triggerLawTutorial = useCallback(() => {
    if (!hasSeenLawTutorial) {
      setHasSeenLawTutorial(true);
      localStorage.setItem('bobu_has_seen_law_tutorial', 'true');
      setTutorialStep('law_intro');
    }
  }, [hasSeenLawTutorial]);

  useEffect(() => { localStorage.setItem('bobu_hasOpenedDrawer', hasOpenedDrawer.toString()); }, [hasOpenedDrawer]);
  useEffect(() => { localStorage.setItem('bobu_hasPulledGacha', hasPulledGacha.toString()); }, [hasPulledGacha]);

  const [gameState, setGameState] = useState<GameState>('loading');

  useEffect(() => {
    if (gameState === 'loading') {
      const timer = setTimeout(() => {
        setGameState('start_menu');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [gameState]);

  useEffect(() => {
    localStorage.setItem('bobu_bestScore', bestScore.toString());
  }, [bestScore]);

  useEffect(() => {
    localStorage.setItem('bobu_lifetimeScore', lifetimeScore.toString());
  }, [lifetimeScore]);

  useEffect(() => {
    localStorage.setItem('bobu_unlockedChains', JSON.stringify(unlockedChains));
  }, [unlockedChains]);

  useEffect(() => {
    localStorage.setItem('bobu_activeFamilies', JSON.stringify(activeFamilies));
  }, [activeFamilies]);

  const [grid, setGrid] = useState<GridData>(() => {
    const saved = localStorage.getItem('bobu_grid');
    if (saved) return JSON.parse(saved);
    const initialFamilies = localStorage.getItem('bobu_activeFamilies') ? JSON.parse(localStorage.getItem('bobu_activeFamilies')!) : ['Bobu'];
    return addRandomTile(addRandomTile(createEmptyGrid(), initialFamilies), initialFamilies);
  });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [dataExhaust, setDataExhaust] = useState<string | null>(null);
  const [gachaCollection, setGachaCollection] = useState<string[]>(() => {
    const saved = localStorage.getItem('bobu_gachaCollection');
    return saved ? JSON.parse(saved) : [];
  });
  const [newGachaItems, setNewGachaItems] = useState<string[]>(() => {
    const saved = localStorage.getItem('bobu_newGachaItems');
    return saved ? JSON.parse(saved) : [];
  });
  const [isShaking, setIsShaking] = useState(false);
  const [carrots, setCarrots] = useState(() => {
    const saved = localStorage.getItem('bobu_carrots');
    return saved !== null ? parseInt(saved, 10) : 3;
  });
  const [plusCoins, setPlusCoins] = useState(() => {
    const saved = localStorage.getItem('bobu_plusCoins');
    return saved !== null ? parseInt(saved, 10) : 3;
  });
  const [activeProp, setActiveProp] = useState<'carrot' | 'plus' | null>(null);

  const [instability, setInstability] = useState(0);

  const [goldenFlash, setGoldenFlash] = useState(false);
  const [healFlash, setHealFlash] = useState(false);

  // 持久化道具数量
  useEffect(() => {
    localStorage.setItem('bobu_carrots', carrots.toString());
  }, [carrots]);

  useEffect(() => {
    localStorage.setItem('bobu_plusCoins', plusCoins.toString());
  }, [plusCoins]);

  useEffect(() => {
    localStorage.setItem('bobu_gachaCollection', JSON.stringify(gachaCollection));
  }, [gachaCollection]);

  useEffect(() => {
    localStorage.setItem('bobu_newGachaItems', JSON.stringify(newGachaItems));
  }, [newGachaItems]);

  const [activeLaws, setActiveLaws] = useState<string[]>(() => {
    const saved = localStorage.getItem('bobu_activeLaws');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('bobu_activeLaws', JSON.stringify(activeLaws));
  }, [activeLaws]);

  const [unlockedPlanets, setUnlockedPlanets] = useState<string[]>(() => {
    const saved = localStorage.getItem('bobu_unlockedPlanets');
    return saved ? JSON.parse(saved) : ['2', '4'];
  });

  useEffect(() => {
    localStorage.setItem('bobu_unlockedPlanets', JSON.stringify(unlockedPlanets));
  }, [unlockedPlanets]);

  const [lastMoveDir, setLastMoveDir] = useState<'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | null>(null);
  const [lastComboCount, setLastComboCount] = useState(0);

  const [conflictingIds, setConflictingIds] = useState<string[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [maxMergedValue, setMaxMergedValue] = useState(0);
  const [currentRunMaxTile, setCurrentRunMaxTile] = useState(2);
  
  const [melodyIndex, setMelodyIndex] = useState(0);
  const [noteIndex, setNoteIndex] = useState(0);

  const addToast = useCallback((text: string, color: string, r: number, c: number) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, text, color, r, c }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 1500);
  }, []);

  const addScore = useCallback((points: number) => {
    setScore(s => {
      const newScore = s + points;
      setBestScore(bs => Math.max(bs, newScore));
      return newScore;
    });
    setLifetimeScore(ls => ls + points);
  }, []);

  const checkCornerBonus = useCallback((grid: GridData): boolean => {
    if (!activeLaws.includes('CMT_DUDDU')) return false;
    
    let maxVal = -1;
    let maxCoords: {r: number, c: number}[] = [];
    
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const val = grid[r][c]?.value;
        if (typeof val === 'number') {
          if (val > maxVal) {
            maxVal = val;
            maxCoords = [{r, c}];
          } else if (val === maxVal) {
            maxCoords.push({r, c});
          }
        }
      }
    }
    
    // 只要有一个最大值在角落即可
    return maxCoords.some(({r, c}) => 
      (r === 0 && c === 0) || 
      (r === 0 && c === GRID_SIZE - 1) || 
      (r === GRID_SIZE - 1 && c === 0) || 
      (r === GRID_SIZE - 1 && c === GRID_SIZE - 1)
    );
  }, [activeLaws]);

  const ascendTile = useCallback((r: number, c: number) => {
    const tile = grid[r][c];
    if (!tile || typeof tile.value !== 'string' || !tile.value.startsWith('CMT')) return;

    const lawId = tile.value;
    const level = tile.level || 0;
    
    let msg = "";
    if (level < 64) {
      soundEngine.playCoinGet();
      setPlusCoins(p => p + 1);
      setInstability(i => Math.max(0, i - 5));
      msg = "ascendLow";
      addToast('+1 🪙', '#eab308', r, c);
    } else if (level < 512) {
      soundEngine.playCoinGet();
      setTimeout(() => soundEngine.playCarrotGet(), 100);
      setPlusCoins(p => p + 3);
      setCarrots(car => car + 3);
      setInstability(i => Math.max(0, i - 15));
      msg = "ascendMid";
      addToast('+3 🪙', '#eab308', r, c);
      setTimeout(() => addToast('+3 🥕', '#f97316', r, c), 200);
    } else {
      soundEngine.playHeal();
      setTimeout(() => soundEngine.playCoinGet(), 200);
      setPlusCoins(p => p + 10);
      setInstability(0);
      msg = "ascendHigh";
      setGoldenFlash(true);
      setHealFlash(true);
      setTimeout(() => setGoldenFlash(false), 1500);
      setTimeout(() => setHealFlash(false), 1000);
      addToast('+10 🪙', '#eab308', r, c);
    }

    if (lawId !== 'CMT' && !activeLaws.includes(lawId)) {
      setActiveLaws(curr => [...curr, lawId]);
      setTimeout(() => {
        let lawMsg = "";
        if (lawId === 'CMT_BOBU_ULTIMATE') {
          lawMsg = "lawBobu";
        } else if (lawId === 'CMT_DUDDU') {
          lawMsg = "lawDuddu";
        } else if (lawId === 'CMT_ISSI') {
          lawMsg = "lawIssi";
        }
        setMessage(lawMsg);
        setTimeout(() => setMessage(null), 5000);
      }, 3000);
    }

    setMessage(msg);
    addScore(3000);
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
    setTimeout(() => setMessage(null), 3000);

    setGrid(prev => {
      const newGrid = prev.map(row => [...row]);
      newGrid[r][c] = null;
      return newGrid;
    });
  }, [grid, activeLaws, addScore, tutorialStep]);

  const useCarrot = useCallback((r: number, c: number) => {
    if (carrots <= 0 || activeProp !== 'carrot') return;
    if (!grid[r][c]) return; // Nothing to eat
    
    soundEngine.playPop();
    setGrid(prev => {
      const newGrid = prev.map(row => [...row]);
      newGrid[r][c] = null; // Bobu 吃掉了！
      return newGrid;
    });
    setCarrots(prev => prev - 1);
    setActiveProp(null);
    setMessage('propCarrot');
    setTimeout(() => setMessage(null), 2000);
  }, [grid, carrots, activeProp]);

  const boostTile = useCallback((id: string) => {
    if (plusCoins <= 0 || activeProp !== 'plus') return false;
    
    let success = false;
    let targetR = -1;
    let targetC = -1;
    // Check if we can boost before updating state
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const tile = grid[r][c];
        if (tile && tile.id === id && typeof tile.value === 'number' && tile.value < 2048) {
          success = true;
          targetR = r;
          targetC = c;
        }
      }
    }

    if (success) {
      soundEngine.playBling();
      setGrid(prev => {
        const newGrid = prev.map(row => [...row]);
        for (let r = 0; r < GRID_SIZE; r++) {
          for (let c = 0; c < GRID_SIZE; c++) {
            const tile = newGrid[r][c];
            if (tile && tile.id === id && typeof tile.value === 'number' && tile.value < 2048) {
              newGrid[r][c] = { ...tile, value: tile.value * 2 };
            }
          }
        }
        return newGrid;
      });
      setPlusCoins(prev => prev - 1);
      setInstability(prev => Math.min(100, prev + 10));
      setActiveProp(null);
      setMessage('propPlus');
      setTimeout(() => setMessage(null), 2000);
      addToast('plusLevelToast', '#F59E0B', targetR, targetC);
      return true;
    } else {
      soundEngine.playError();
      setMessage('propPlusFailed');
      setTimeout(() => setMessage(null), 2000);
    }
    return false;
  }, [grid, plusCoins, activeProp, addToast]);

  const resetGame = useCallback(() => {
    setGrid(addRandomTile(addRandomTile(createEmptyGrid(), activeFamilies), activeFamilies));
    setScore(0);
    setInstability(0);
    setGameOver(false);
    setMessage(null);
    setDataExhaust(null);
    setMelodyIndex(Math.floor(Math.random() * 3));
    setNoteIndex(0);
    setCurrentRunMaxTile(2);
  }, [activeFamilies]);

  useEffect(() => {
    if (instability >= 100 && !gameOver) {
      setGameOver(true);
    }
  }, [instability, gameOver]);

  const slide = useCallback((direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
    if (instability >= 100) return;
    if (checkGameOver(grid, instability)) return;

    const old2048Ids = new Set(grid.flat().filter(t => t && t.value === 2048).map(t => t!.id));

    let result;
    switch (direction) {
      case 'LEFT': result = moveLeft(grid, activeLaws, unlockedChains.length); break;
      case 'RIGHT': result = moveRight(grid, activeLaws, unlockedChains.length); break;
      case 'UP': result = moveUp(grid, activeLaws, unlockedChains.length); break;
      case 'DOWN': result = moveDown(grid, activeLaws, unlockedChains.length); break;
    }

    if (result.moved) {
      if ((tutorialStep === 'swipe_guide' || tutorialStep === 'welcome') && result.comboCount > 0) {
        setTutorialStep('currency_intro');
      }
      setLastMoveDir(direction);
      let nextGrid = result.newGrid;
      let slideScore = result.score;
      let maxMergedValue = result.maxMergedValue;
      let comboCount = result.comboCount || 0;
      
      if (comboCount > 1) {
        slideScore = Math.floor(slideScore * Math.pow(1.5, comboCount - 1));
      }
      setLastComboCount(comboCount);
      setMaxMergedValue(maxMergedValue);
      if (maxMergedValue > currentRunMaxTile) {
        setCurrentRunMaxTile(maxMergedValue);
      }

      // Duddu 法则：角落秩序加成
      if (checkCornerBonus(nextGrid)) {
         slideScore *= 2; // 产生的所有 score 乘以 2
      }
      
      addScore(slideScore);
      
      if (result.toastEvents) {
        result.toastEvents.forEach((t: any) => addToast(t.textKey, t.color, t.r, t.c));
      }

      const newInstability = Math.min(100, Math.max(0, instability + result.instabilityDelta));
      setInstability(newInstability);

      if (result.carrotsReward > 0) {
        setCarrots(c => c + result.carrotsReward);
        soundEngine.playCarrotGet();
      }
      if (result.plusCoinsReward > 0) {
        setPlusCoins(c => c + result.plusCoinsReward);
        setTimeout(() => soundEngine.playCoinGet(), result.carrotsReward > 0 ? 100 : 0);
      }
      if (result.carrotsReward > 0 || result.plusCoinsReward > 0) {
         setMessage("supply");
         setIsShaking(true);
         setTimeout(() => setIsShaking(false), 500);
         setTimeout(() => setMessage(null), 5000);
      }

      if (result.explosionCount > 0) {
        soundEngine.playError();
        setMessage("explosion");
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
        setTimeout(() => setMessage(null), 3000);
      } else if (result.synthesisMessages && result.synthesisMessages.length > 0) {
        soundEngine.playBling();
        setMessage(result.synthesisMessages[0]);
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
        setTimeout(() => setMessage(null), 5000);
      } else if (result.score > 0) {
        const trackMap: Record<string, number> = {
          'music-twinkle': 0,
          'music-ode-to-joy': 1,
          'music-happy-birthday': 2,
          'music-two-tigers': 3,
          'music-jingle-bells': 4,
          'music-london-bridge': 5
        };
        
        let currentMelodyIndex = 0;
        if (musicTracks && musicTracks.length > 0) {
          const trackId = musicTracks[melodyIndex % musicTracks.length];
          currentMelodyIndex = trackMap[trackId] ?? 0;
        }

        if (comboCount > 1) {
          soundEngine.playArpeggio(comboCount, maxMergedValue > 0 ? Math.log2(maxMergedValue) : 1);
        } else {
          soundEngine.playMergeSound(currentMelodyIndex, noteIndex);
        }
        soundEngine.playPop(maxMergedValue > 0 ? Math.log2(maxMergedValue) : 1);
        
        const currentLength = MelodySequencer.getMelodyLength(currentMelodyIndex);
        if (noteIndex + 1 >= currentLength) {
          setMelodyIndex(prev => prev + 1);
          setNoteIndex(0);
        } else {
          setNoteIndex(prev => prev + 1);
        }
      } else {
        soundEngine.playPop(maxMergedValue > 0 ? Math.log2(maxMergedValue) : 1);
      }

      const new2048Coords: {r: number, c: number}[] = [];
      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          const t = nextGrid[r][c];
          if (t && t.value === 2048 && !old2048Ids.has(t.id)) {
            new2048Coords.push({r, c});
          }
        }
      }

      if (result.created2048 || result.created4096) {
        let chainsUpdated = false;
        const newChains = [...unlockedChains];
        if (result.created2048 && !newChains.includes('Duddu')) {
          newChains.push('Duddu');
          chainsUpdated = true;
        }
        if (result.created4096 && !newChains.includes('Issi')) {
          newChains.push('Issi');
          chainsUpdated = true;
        }
        if (chainsUpdated) {
          setUnlockedChains(newChains);
          setActiveFamilies(prev => {
            const newActive = [...prev];
            if (result.created2048 && !newActive.includes('Duddu')) newActive.push('Duddu');
            if (result.created4096 && !newActive.includes('Issi')) newActive.push('Issi');
            return newActive;
          });
        }

        let msg = "blackHole";
        if (chainsUpdated) {
          msg += "unlocked";
        }
        setDataExhaust(msg);
        setTimeout(() => setDataExhaust(null), 8000);

        // Black hole effect for 2048
        if (result.created2048) {
          new2048Coords.forEach(({r, c}) => {
            for (let dr = -1; dr <= 1; dr++) {
              for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                const nr = r + dr;
                const nc = c + dc;
                if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE) {
                  const target = nextGrid[nr][nc];
                  if (target && typeof target.value === 'number' && target.value !== 2048 && target.value !== 4096) {
                    nextGrid[nr][nc] = { ...target, value: 2, attributeType: null, attributeName: null };
                  }
                }
              }
            }
          });
        }
      }

      if (result.synthesisMessages && result.synthesisMessages.length > 0) {
        setMessage(result.synthesisMessages[0]);
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
        setTimeout(() => setMessage(null), 5000);
        addScore(1000 * result.synthesisMessages.length);
      }

      nextGrid = addRandomTile(nextGrid, activeFamilies);

      const newUnlocked = new Set(unlockedPlanets);
      nextGrid.forEach(row => {
        row.forEach(tile => {
          if (tile) {
            newUnlocked.add(tile.value.toString());
          }
        });
      });
      setUnlockedPlanets(Array.from(newUnlocked));

      if (checkGameOver(nextGrid, newInstability)) {
        setGameOver(true);
      }

      setGrid(nextGrid);

      // Linear Onboarding: Swipe Guide -> Powerup Intro
      if ((tutorialStep === 'swipe_guide' || tutorialStep === 'welcome') && result.score > 0) {
        advanceTutorial('powerup_intro');
      }
    } else {
      soundEngine.playError();
      setInstability(prev => Math.min(100, prev + 2));
    }
  }, [grid, activeLaws, checkCornerBonus, instability, unlockedChains, activeFamilies, unlockedPlanets, tutorialStep, advanceTutorial]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver || instability >= 100) return;
      
      switch (e.key.toLowerCase()) {
        case 'a':
          e.preventDefault();
          slide('LEFT');
          break;
        case 'd':
          e.preventDefault();
          slide('RIGHT');
          break;
        case 'w':
          e.preventDefault();
          slide('UP');
          break;
        case 's':
          e.preventDefault();
          slide('DOWN');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [slide, gameOver, instability]);

  return { 
    grid, score, gameOver, message, dataExhaust, gachaCollection, setGachaCollection, newGachaItems, setNewGachaItems, instability,
    isShaking, carrots, plusCoins, setPlusCoins, activeProp, conflictingIds, activeLaws, setConflictingIds, setActiveProp, useCarrot, boostTile, ascendTile,
    slide, resetGame, unlockedChains, activeFamilies, setActiveFamilies, goldenFlash, healFlash, bestScore, lifetimeScore, toasts, lastMoveDir, maxMergedValue, lastComboCount, unlockedPlanets, currentRunMaxTile,
    tutorialStep, setTutorialStep, advanceTutorial, triggerLawTutorial, gameState, setGameState,
    hasOpenedDrawer, setHasOpenedDrawer, hasPulledGacha, setHasPulledGacha
  };
};
