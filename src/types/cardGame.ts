export type AnimeSeries =
  | 'Dragon Ball'
  | 'Naruto'
  | 'One Piece'
  | 'Jujutsu Kaisen'
  | 'My Hero Academia'
  | 'JoJo Bizarre Adventure';

export type CardTag =
  | 'swordsman'      // ผู้ใช้ดาบ
  | 'martial-arts'   // ศิลปะการต่อสู้ / หมัดมวย
  | 'inner-demon'    // พลังสัตว์ร้าย/อสูรในร่าง
  | 'eye-power'      // เนตรพิเศษ (Sharingan, Six Eyes)
  | 'fire'           // ธาตุไฟ / การระเบิด
  | 'lightning'      // สายฟ้า
  | 'god-tier'       // พลังระดับจักรพรรดิ / เทพ
  | 'domain'         // กางอาณาเขต / มิติกักขัง
  | 'super-strength' // พละกำลังมหาศาล / ร่างทอง / สแมช
  | 'mentor'         // อาจารย์ผู้ชี้แนะ
  | 'stand-user'     // ผู้ใช้สแตนด์
  | 'time-manipulation'; // สกิลหยุดเวลา / ย้อนเวลา

export type StatusEffectType = 'burn' | 'freeze' | 'stun' | 'bleed' | 'shield';

export interface StatusEffect {
  id: string;
  type: StatusEffectType;
  name: string;
  icon: string;
  duration: number; // turns remaining
  value: number; // e.g. damage per turn or shield amount
  color: string;
  sourceName: string;
  description: string;
}

export interface Skill {
  id: string;
  name: string;
  energyCost: number;
  type: 'attack' | 'heal' | 'buff' | 'aoe' | 'drain' | 'steal' | 'shield' | 'stun';
  effectValue: number;
  description: string;
  icon: string;
  categoryLabel?: string;      // e.g. '🛡️ สร้างโล่', '⚔️ โจมตี', '⚡ บัฟ ATK', '💚 ฮีล HP', '🌀 ขโมยวิชา'
  stealEnergy?: number;      // Steals Energy from defender and transfers to attacker
  stealAtk?: number;         // Steals ATK from defender and transfers to attacker
  lifestealPercent?: number; // Drains HP equal to % of damage dealt to heal attacker
  armorPiercePercent?: number; // Ignores % of defender's DEF
  shieldAmount?: number;     // Creates shield
  buffAtkAmount?: number;    // Increases ATK
  healAmount?: number;       // Restores HP
  statusEffect?: {
    type: StatusEffectType;
    duration: number;
    value: number;
    description: string;
  };
}

export interface Ultimate {
  id: string;
  name: string;
  quote: string;
  description: string;
  damage: number;
  energyRequired: number; // 100
  colorTheme: string;
  bgGlow: string;
  vfxType: 'saiyan-blast' | 'rasengan-spiral' | 'gear5-giant' | 'infinite-void' | 'united-smash' | 'malevolent-shrine' | 'amaterasu';
}

export type AttackPattern =
  | 'single'   // ตีเดี่ยว (Single Target)
  | 'column'   // แนวตรง 2 ตัว (Front & Back row in same column)
  | 'row'      // แนวขวาง (All cards in targeted row)
  | 'zigzag'   // ฟันปลาฉลาม / ทะแยง (Target slot + diagonal slots)
  | 'aoe';     // ตีกลุ่ม (All cards on enemy field)

export interface StolenPowerRecord {
  id: string;
  sourceCardName: string;
  sourceSeries: string;
  stolenAtk: number;
  stolenEnergy: number;
  stolenSkillName?: string;
  stolenSkillDescription?: string;
  stolenSkillObject?: Skill;
  timestamp: string;
}

export interface CardData {
  id: string;
  name: string;
  nameJp: string;
  series: AnimeSeries;
  seriesColor: string;
  badgeBg: string;
  baseHp: number;
  baseAtk: number;
  baseDef: number;
  attackPattern?: AttackPattern;
  tags: CardTag[];
  skill: Skill;
  extraSkills?: Skill[];    // 🌟 รายการสกิลเสริมหลายรูปแบบ (สร้างโล่, บัฟพลัง, ฮีล, สตัน ฯลฯ)
  ultimate: Ultimate;
  quote: string;
  allies: string[];         // 🤝 ความสัมพันธ์ดี / สู้ด้วยกัน -> เพิ่มพลัง
  badRivals: string[];      // ❌ ความสัมพันธ์แย่ / ศัตรูคู่อาฆาต -> ห้ามวางติดกัน!
  avatarSvgType: string;
  avatarBgGradient: string;
  imageUrl?: string;
}

export interface ReactionDetail {
  partnerId: string;
  partnerName: string;
  type: 'good-relationship' | 'similar-ability';
  title: string;
  description: string;
  atkBonusPercent: number;
  defBonusPercent: number;
}

export interface ActiveCard {
  instanceId: string;
  card: CardData;
  currentHp: number;
  maxHp: number;
  currentAtk: number;
  currentDef: number;
  currentEnergy: number; // 0 - 100
  hasActed: boolean;
  isStunned?: boolean;
  isSkillStolen?: boolean; // ❌ สกิลถูกขโมยไปแล้ว
  stolenSkillIndices?: number[]; // รายการลำดับสกิลที่ถูกขโมยไป
  shield: number;
  reactions: ReactionDetail[];
  statusEffects: StatusEffect[];
  stolenPowers?: StolenPowerRecord[];
}

export interface PlayerState {
  id: 'p1' | 'p2';
  name: string;
  avatar: string;
  hp: number;
  maxHp: number;
  energy: number;
  deck: CardData[];
  hand: CardData[];
  slots: (ActiveCard | null)[]; // 4 slots
  comboCount: number;
}

export type GamePhase =
  | 'DRAW'
  | 'ACTION'
  | 'ATTACKING'
  | 'ULTIMATE_CUTIN'
  | 'GAME_OVER';

export interface CombatLog {
  id: string;
  turn: number;
  player: 'p1' | 'p2';
  text: string;
  type: 'attack' | 'skill' | 'ultimate' | 'reaction' | 'placement' | 'forbidden' | 'defeat' | 'turn';
  timestamp: number;
}

export interface ActionAnimationState {
  type: 'attack' | 'skill' | 'ultimate';
  sourcePlayer: 'p1' | 'p2';
  sourceSlotIndex: number;
  targetPlayer: 'p1' | 'p2';
  targetSlotIndex: number | 'leader';
  damage?: number;
  text?: string;
  activeCard?: ActiveCard;
}
