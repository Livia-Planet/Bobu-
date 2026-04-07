export type AttributeType = 'C' | 'M' | 'T' | 'HYBRID' | null;

export interface TileData {
  id: string;
  value: number | string;
  attributeType: AttributeType;
  attributeName: string | null;
  level?: number;
}

export type GridData = (TileData | null)[][];

export interface Toast {
  id: number;
  text: string;
  color: string;
  r: number;
  c: number;
}

export type GachaItemType = 'TileSkin' | 'SoundKit' | 'MusicTrack' | 'BoardTheme';
export type Rarity = 'N' | 'R' | 'SR' | 'UR';

export interface GachaItemBase {
  id: string;
  name: string;
  desc: string;
  rarity: Rarity;
  type: GachaItemType;
  color?: string;
  img?: string;
}

export interface TileSkin extends GachaItemBase {
  type: 'TileSkin';
  value: number | string;
  form: 1 | 2 | 3 | 4;
}

export interface SoundKit extends GachaItemBase {
  type: 'SoundKit';
}

export interface MusicTrack extends GachaItemBase {
  type: 'MusicTrack';
}

export interface BoardTheme extends GachaItemBase {
  type: 'BoardTheme';
}

export type GachaItem = TileSkin | SoundKit | MusicTrack | BoardTheme;

export interface EquipmentState {
  tileSkins: Record<string, string>;
  activeLaws: string[];
  soundKit: string;
  musicTracks: string[];
  boardTheme: string;
}

export type TutorialStep = 'welcome' | 'swipe_guide' | 'powerup_intro' | 'gacha_guide' | 'gacha_pulling' | 'equip_guide' | 'celebration' | 'law_intro' | 'finished';

export type GameState = 'loading' | 'start_menu' | 'playing';

