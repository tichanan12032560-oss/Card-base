import { ActiveCard, StatusEffect, StatusEffectType } from '../types/cardGame';

export const STATUS_DEFINITIONS: Record<
  StatusEffectType,
  { name: string; icon: string; color: string; badgeClass: string; desc: string }
> = {
  burn: {
    name: 'เผาไหม้ (Burn)',
    icon: '🔥',
    color: '#f97316',
    badgeClass: 'bg-orange-500/25 text-orange-400 border-orange-500/50 animate-pulse',
    desc: 'ได้รับความเสียหายต่อเนื่องทุกเริ่มเทิร์น และลด ATK ลง 10%',
  },
  freeze: {
    name: 'แช่แข็ง (Freeze)',
    icon: '❄️',
    color: '#06b6d4',
    badgeClass: 'bg-cyan-500/25 text-cyan-300 border-cyan-400/50 animate-pulse',
    desc: 'ร่างถูกผนึกด้วยน้ำแข็ง ลด DEF 25% และไม่สามารถฟื้นฟู Energy ได้',
  },
  stun: {
    name: 'มึนงง (Stun)',
    icon: '⚡',
    color: '#eab308',
    badgeClass: 'bg-yellow-500/25 text-yellow-300 border-yellow-400/60 animate-bounce',
    desc: 'เป็นอัมพาต/มึนงง ไม่สามารถโจมตีหรือใช้สกิลได้ในเทิร์นนี้!',
  },
  bleed: {
    name: 'เลือดไหล (Bleed)',
    icon: '🩸',
    color: '#ef4444',
    badgeClass: 'bg-red-500/25 text-red-400 border-red-500/50',
    desc: 'บาดแผลลึกจากคมดาบ ได้รับดาเมจเมื่อเริ่มเทิร์นและรับดาเมจเพิ่ม 20%',
  },
  shield: {
    name: 'บาเรีย (Shield)',
    icon: '🛡️',
    color: '#3b82f6',
    badgeClass: 'bg-blue-500/25 text-blue-300 border-blue-400/50',
    desc: 'ม่านพลังดูดซับความเสียหายจากการโจมตี',
  },
};

/**
 * Creates a StatusEffect object from a skill definition
 */
export function createStatusEffect(
  type: StatusEffectType,
  duration: number,
  value: number,
  sourceName: string
): StatusEffect {
  const def = STATUS_DEFINITIONS[type];
  return {
    id: `${type}-${Date.now()}-${Math.random()}`,
    type,
    name: def.name,
    icon: def.icon,
    duration,
    value,
    color: def.color,
    sourceName,
    description: def.desc,
  };
}

/**
 * Applies or refreshes a status effect on an active card.
 * If effect of same type already exists, refresh to the maximum duration/value.
 */
export function applyStatusToCard(card: ActiveCard, newEffect: StatusEffect): ActiveCard {
  const existingEffects = card.statusEffects || [];
  const existingIndex = existingEffects.findIndex((e) => e.type === newEffect.type);

  let updatedEffects: StatusEffect[];
  if (existingIndex >= 0) {
    updatedEffects = [...existingEffects];
    updatedEffects[existingIndex] = {
      ...updatedEffects[existingIndex],
      duration: Math.max(updatedEffects[existingIndex].duration, newEffect.duration),
      value: Math.max(updatedEffects[existingIndex].value, newEffect.value),
    };
  } else {
    updatedEffects = [...existingEffects, newEffect];
  }

  // Calculate dynamic stat penalties
  let atkMultiplier = 1;
  let defMultiplier = 1;
  const isStunned = updatedEffects.some((e) => e.type === 'stun');

  updatedEffects.forEach((eff) => {
    if (eff.type === 'burn') atkMultiplier *= 0.9;
    if (eff.type === 'freeze') defMultiplier *= 0.75;
  });

  return {
    ...card,
    statusEffects: updatedEffects,
    isStunned,
    // if stunned, immediately incapacitate for this turn
    hasActed: isStunned ? true : card.hasActed,
    currentAtk: Math.max(100, Math.round(card.card.baseAtk * atkMultiplier)),
    currentDef: Math.max(100, Math.round(card.card.baseDef * defMultiplier)),
  };
}

/**
 * Process status effects at the beginning of a player's turn:
 * - Burns and Bleeds deal DoT damage
 * - Durations decrement
 * - Expired effects are removed
 * - Cards defeated by DoT are removed
 */
export function processTurnStatusEffects(slots: (ActiveCard | null)[]): {
  updatedSlots: (ActiveCard | null)[];
  logs: string[];
  defeatedCards: string[];
  totalDotDamage: number;
} {
  const logs: string[] = [];
  const defeatedCards: string[] = [];
  let totalDotDamage = 0;

  const updatedSlots = slots.map((card) => {
    if (!card) return null;
    const effects = card.statusEffects || [];
    if (effects.length === 0) return card;

    let currentHp = card.currentHp;
    const survivingEffects: StatusEffect[] = [];

    effects.forEach((eff) => {
      // 1. Tick DoT effects
      if (eff.type === 'burn') {
        const burnDmg = eff.value || 220;
        currentHp = Math.max(0, currentHp - burnDmg);
        totalDotDamage += burnDmg;
        logs.push(`🔥 ${card.card.name.split(' ')[0]} โดนเผาไหม้ -${burnDmg} HP (${eff.duration - 1}T เหลือ)`);
      } else if (eff.type === 'bleed') {
        const bleedDmg = eff.value || 180;
        currentHp = Math.max(0, currentHp - bleedDmg);
        totalDotDamage += bleedDmg;
        logs.push(`🩸 ${card.card.name.split(' ')[0]} เลือดไหล -${bleedDmg} HP`);
      } else if (eff.type === 'freeze') {
        logs.push(`❄️ ${card.card.name.split(' ')[0]} ถูกแช่แข็ง ลด DEF และงดรับ Energy!`);
      } else if (eff.type === 'stun') {
        logs.push(`⚡ ${card.card.name.split(' ')[0]} ติดสถานะมึนงง (Stun) ไม่สามารถขยับได้!`);
      }

      // 2. Decrement duration
      const nextDuration = eff.duration - 1;
      if (nextDuration > 0) {
        survivingEffects.push({
          ...eff,
          duration: nextDuration,
        });
      } else {
        logs.push(`✨ สถานะ ${eff.name} บน ${card.card.name.split(' ')[0]} สิ้นสุดลงแล้ว`);
      }
    });

    // Check if DoT killed card
    if (currentHp <= 0) {
      defeatedCards.push(card.card.name.split(' ')[0]);
      logs.push(`💀 ${card.card.name.split(' ')[0]} พ่ายแพ้ต่อสถานะผิดปกติ!`);
      return null;
    }

    const isStunned = survivingEffects.some((e) => e.type === 'stun');

    // Recompute stat penalties
    let atkMultiplier = 1;
    let defMultiplier = 1;
    survivingEffects.forEach((eff) => {
      if (eff.type === 'burn') atkMultiplier *= 0.9;
      if (eff.type === 'freeze') defMultiplier *= 0.75;
    });

    return {
      ...card,
      currentHp,
      statusEffects: survivingEffects,
      isStunned,
      hasActed: isStunned ? true : false, // stunned cards cannot act on their turn!
      currentAtk: Math.max(100, Math.round(card.card.baseAtk * atkMultiplier)),
      currentDef: Math.max(100, Math.round(card.card.baseDef * defMultiplier)),
    };
  });

  return {
    updatedSlots,
    logs,
    defeatedCards,
    totalDotDamage,
  };
}
