import { GachaItem, TileSkin, SoundKit, MusicTrack, BoardTheme } from './types';

// Bobu的星体图鉴：硬映射到 Soga 序列
export const planetDatabase: Record<string, { name: string, img: string, desc: string, color: string, labRole?: string, rarity: 'N' | 'R' | 'SR' | 'UR' }> = {
  '2': { name: "星尘微粒", img: "/Soga-01-a1.png", desc: "Bobu打喷嚏崩出来的发光小渣渣，虽然小，但它是整个宇宙的起点哦！", color: "bg-cyan-100 text-cyan-900", labRole: "基础物质，常规合并可降低 2 点坍缩值。", rarity: 'N' },
  '4': { name: "气泡星", img: "/Soga-01-a2.png", desc: "戳一下会发出‘啵’的声音，里面装满了Bobu昨晚做的甜甜的梦。", color: "bg-emerald-300 text-emerald-900", labRole: "基础物质，常规合并可降低 2 点坍缩值。", rarity: 'N' },
  '8': { name: "史莱姆星", img: "/Soga-02-a1.png", desc: "软乎乎、黏糊糊的，闻起来有股草莓味，Bobu总是忍不住想咬一口。", color: "bg-yellow-300 text-yellow-900", labRole: "基础物质，常规合并可降低 2 点坍缩值。", rarity: 'N' },
  '16': { name: "结晶星", img: "/Soga-02-a2.png", desc: "硬邦邦的亮闪闪石头，Bobu试过用它砸核桃，结果把牙齿磕疼了。", color: "bg-orange-400 text-orange-900", labRole: "基础物质，常规合并可降低 2 点坍缩值。", rarity: 'N' },
  '32': { name: "覆盆子星", img: "/Soga-03-a1.png", desc: "看起来就像一颗巨大的太空水果，散发着诱人的香气，超级好吃！", color: "bg-rose-400 text-rose-900", labRole: "基础物质，常规合并可降低 2 点坍缩值。", rarity: 'N' },
  '64': { name: "绿植星", img: "/Soga-03-a2.png", desc: "上面长满了Bobu最喜欢的薄荷草，每天都要浇水才能保持绿油油的。", color: "bg-violet-400 text-violet-900", labRole: "基础物质，常规合并可降低 2 点坍缩值。", rarity: 'N' },
  '128': { name: "黄金星", img: "/Soga-04-a1.png", desc: "Bling Bling的超级大金块！Bobu说有了它就可以买下全宇宙的零食啦！", color: "bg-indigo-500 text-white", labRole: "基础物质，常规合并可降低 2 点坍缩值。", rarity: 'R' },
  '256': { name: "土星环", img: "/Soga-04-a2.png", desc: "自带呼啦圈的运动健将，转起来呼呼生风，Bobu最喜欢在上面滑滑梯。", color: "bg-sky-500 text-white", labRole: "基础物质，常规合并可降低 2 点坍缩值。", rarity: 'R' },
  '512': { name: "虫洞星", img: "/Soga-05-a1.png", desc: "一个神秘的紫色漩涡，据说跳进去就能直接到达实验室的零食大冰箱！", color: "bg-lime-500 text-white", labRole: "高能物质，常规合并可降低 2 点坍缩值。", rarity: 'R' },
  '1024': { name: "木纹星", img: "/Soga-05-a2.png", desc: "有着古老树木纹理的巨大星球，摸起来暖暖的，里面好像藏着什么秘密。", color: "bg-amber-500 text-white", labRole: "高能物质，常规合并可降低 2 点坍缩值。", rarity: 'R' },
  '2048': { name: "黑洞宝宝", img: "/Soga-06-a1.png", desc: "嗷呜！胃口超级大的小怪物，什么都吃，连光都不放过，千万别靠太近！", color: "bg-slate-900 text-white", labRole: "终极物质，合成时会触发数据残留效果，无法再使用金币升级。", rarity: 'SR' },
  '4096': { name: "恒星巨无霸", img: "/Soga-06-a2.png", desc: "太热啦！像个超级大火球，Bobu靠近它的时候感觉自己都要被烤熟了！", color: "bg-red-600 text-white", labRole: "超限物质，实验室的极限产物。", rarity: 'SR' },
  "CMT": { name: "三元奇迹星", img: "/Soga-07-a1.png", desc: "三元奇迹星：汇聚了人、谜、技的终极结晶，是实验室稳定的定海神针。", color: "bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/50", labRole: "双击引爆可获得补给，或用于合成更高级的奇迹法则。两个CMT碰撞可获得大量金币与胡萝卜。", rarity: 'UR' },
  "CMT_INDY": { name: "超能Indy", img: "/Soga-07-a2.png", desc: "根达亚的第三只眼睁开了！它能看穿所有的秘密，是个超级大侦探！", color: "bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 text-white shadow-lg shadow-cyan-500/50", labRole: "特殊法则，激活后可能带来未知的实验室效应。", rarity: 'UR' },
  "CMT_DARWIN": { name: "光能达尔文", img: "/Soga-08-a1.png", desc: "他的胃能看穿未来的迷雾，吃得越多，知道的就越多，是个神奇的吃货！", color: "bg-gradient-to-br from-pink-400 via-rose-500 to-red-600 text-white shadow-lg shadow-pink-500/50", labRole: "特殊法则，激活后可能带来未知的实验室效应。", rarity: 'UR' },
  "CMT_BOBU_ULTIMATE": { name: "本源Bobu", img: "/Soga-08-a2.png", desc: "万物归一的终极想象力！Bobu的终极形态，可以变出无数好吃的零食！", color: "bg-gradient-to-br from-yellow-300 via-amber-500 to-orange-600 text-white shadow-lg shadow-yellow-500/50", labRole: "终极法则，激活后允许无视配方，直接将任意三个不同属性的方块合成为CMT。", rarity: 'UR' },
  "CMT_DUDDU": { name: "绝对阵列·Duddu", img: "/Soga-09-a1.png", desc: "几何的尽头是真理！Duddu能把一切都排列得整整齐齐，强迫症最爱！", color: "bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 text-white shadow-lg shadow-emerald-500/50", labRole: "秩序法则，激活后，若最大数值方块位于角落，所有滑动得分翻倍。", rarity: 'UR' },
  "CMT_ISSI": { name: "代谢永动机·Issi", img: "/Soga-09-a2.png", desc: "Issi 是实验室的动力核心，它通过不停的代谢产生微小的奖励星。", color: "bg-gradient-to-br from-fuchsia-400 via-purple-500 to-violet-600 text-white shadow-lg shadow-fuchsia-500/50", labRole: "能量法则，激活后，每次常规合并额外提供 50 点能量积分。", rarity: 'UR' }
};

export const gachaPool: GachaItem[] = [];

// Auto-generate TileSkins for 2 to 2048
const baseValues = [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048];
const rarities: ('N' | 'R' | 'SR' | 'UR')[] = ['N', 'R', 'SR', 'UR'];

baseValues.forEach(val => {
  rarities.forEach((rarity, index) => {
    const form = (index + 1) as 1 | 2 | 3 | 4;
    gachaPool.push({
      id: `skin-${val}-${rarity}`,
      name: `${planetDatabase[val]?.name || val} - ${rarity}形态`,
      desc: `${rarity} 级别的 ${val} 形态。`,
      rarity: rarity,
      type: 'TileSkin',
      value: val,
      form: form,
      color: planetDatabase[val]?.color,
      img: planetDatabase[val]?.img // Placeholder, will be replaced by real assets later
    } as TileSkin);
  });
});

// Add CMTs as UR skins
['CMT', 'CMT_INDY', 'CMT_DARWIN', 'CMT_BOBU_ULTIMATE', 'CMT_DUDDU', 'CMT_ISSI'].forEach(cmt => {
  gachaPool.push({
    id: `skin-${cmt}-UR`,
    name: planetDatabase[cmt]?.name || cmt,
    desc: planetDatabase[cmt]?.desc || '',
    rarity: 'UR',
    type: 'TileSkin',
    value: cmt,
    form: 4,
    color: planetDatabase[cmt]?.color,
    img: planetDatabase[cmt]?.img
  } as TileSkin);
});

// Add SoundKits
gachaPool.push(
  { id: 'sound-piano', name: '基础钢琴', desc: '经典的钢琴音效', rarity: 'N', type: 'SoundKit' } as SoundKit,
  { id: 'celesta', name: '八音盒', desc: '清脆的八音盒音效', rarity: 'N', type: 'SoundKit' } as SoundKit,
  { id: 'bouncy', name: 'Q弹果冻', desc: 'Q弹可爱的合成音', rarity: 'N', type: 'SoundKit' } as SoundKit,
  { id: 'marimba', name: '木琴', desc: '温暖的木琴敲击声', rarity: 'N', type: 'SoundKit' } as SoundKit,
  { id: 'toyPiano', name: '玩具钢琴', desc: '童趣满满的玩具琴音', rarity: 'N', type: 'SoundKit' } as SoundKit,
  { id: 'sound-8bit', name: '8-Bit 像素', desc: '复古的 8-Bit 游戏音效', rarity: 'R', type: 'SoundKit' } as SoundKit,
  { id: 'sound-zen', name: '禅意水滴', desc: '空灵的水滴声', rarity: 'SR', type: 'SoundKit' } as SoundKit
);

// Add MusicTracks
gachaPool.push(
  { id: 'music-twinkle', name: '小星星', desc: '经典的小星星旋律', rarity: 'N', type: 'MusicTrack' } as MusicTrack,
  { id: 'music-ode-to-joy', name: '欢乐颂', desc: '贝多芬的欢乐颂', rarity: 'R', type: 'MusicTrack' } as MusicTrack,
  { id: 'music-happy-birthday', name: '生日快乐', desc: '祝你生日快乐', rarity: 'R', type: 'MusicTrack' } as MusicTrack,
  { id: 'music-two-tigers', name: '两只老虎', desc: '两只老虎跑得快', rarity: 'SR', type: 'MusicTrack' } as MusicTrack,
  { id: 'music-jingle-bells', name: '铃儿响叮当', desc: '圣诞节的经典旋律', rarity: 'SR', type: 'MusicTrack' } as MusicTrack,
  { id: 'music-london-bridge', name: '伦敦桥', desc: '伦敦桥要倒了', rarity: 'UR', type: 'MusicTrack' } as MusicTrack
);

// Add BoardThemes
gachaPool.push(
  { id: 'theme-basic', name: '基础实验室', desc: '默认的实验室桌面', rarity: 'N', type: 'BoardTheme' } as BoardTheme,
  { id: 'theme-summer', name: '夏日海滩', desc: '清凉的夏日海滩主题', rarity: 'R', type: 'BoardTheme' } as BoardTheme,
  { id: 'theme-sakura', name: '樱花祭', desc: '落樱缤纷的浪漫主题', rarity: 'SR', type: 'BoardTheme' } as BoardTheme,
  { id: 'theme-cyber', name: '赛博空间', desc: '霓虹闪烁的赛博空间', rarity: 'UR', type: 'BoardTheme' } as BoardTheme
);

// 属性名称池 (Bobu的素材库 - 遵循创世协议 v1.1)
export const ATTRIBUTE_NAMES = {
  C: ['Bobu', 'Duddu', 'Issi'],
  M: ['米特拉姆', '秦陵', '亚特兰蒂斯'],
  T: ['农业生物工程', '多维阵列拓扑', '恒星聚变原质']
};

// 进化配方 (Bobu的秘密炼金笔记)
export const EvolutionRecipes = [
  {
    name: 'RECIPE_BOBU_NAME',
    desc: 'RECIPE_BOBU_DESC',
    ingredients: ['Bobu', '米特拉姆', '农业生物工程'],
    resultId: 'CMT_BOBU_ULTIMATE',
    newAnimismDesc: "CMT_BOBU"
  },
  {
    name: 'RECIPE_DUDDU_NAME',
    desc: 'RECIPE_DUDDU_DESC',
    ingredients: ['Duddu', '秦陵', '多维阵列拓扑'],
    resultId: 'CMT_DUDDU',
    newAnimismDesc: "CMT_DUDDU"
  },
  {
    name: 'RECIPE_ISSI_NAME',
    desc: 'RECIPE_ISSI_DESC',
    ingredients: ['Issi', '亚特兰蒂斯', '恒星聚变原质'],
    resultId: 'CMT_ISSI',
    newAnimismDesc: "CMT_ISSI"
  }
];

// 宇宙背景映射 (Bobu的幻境投影仪)
export const BACKGROUNDS = {
  forest: "https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=2048&auto=format&fit=crop", // 森林 (1-3级)
  cave: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2048&auto=format&fit=crop",   // 洞穴 (4-6级)
  maze: "https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?q=80&w=2048&auto=format&fit=crop",   // 迷宫 (7-9级)
  castle: "https://images.unsplash.com/photo-1533154683836-84ea7a0bc310?q=80&w=2048&auto=format&fit=crop"  // 城堡 (10级+)
};
