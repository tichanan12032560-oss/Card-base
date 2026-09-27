import { AttackPattern } from '../types/cardGame';

/**
 * Calculates which slot indices on the opponent's field (0..5) are targeted by an attack or skill.
 * Grid: 2 rows x 3 columns (0,1,2 = Front Row; 3,4,5 = Back Row)
 */
export function getAffectedTargetSlots(
  targetSlotIndex: number | 'leader',
  pattern: AttackPattern = 'single',
  totalSlots: number = 6
): number[] {
  if (targetSlotIndex === 'leader') {
    return [];
  }

  const row = Math.floor(targetSlotIndex / 3); // 0 = Front Row, 1 = Back Row
  const col = targetSlotIndex % 3; // 0, 1, 2

  switch (pattern) {
    case 'column': {
      // แนวตรง 2 ตัว (Front Row & Back Row in same column)
      const slots = [col, col + 3];
      return slots.filter((idx) => idx >= 0 && idx < totalSlots);
    }

    case 'row': {
      // แนวขวาง (All 3 slots in targeted row)
      if (row === 0) return [0, 1, 2];
      return [3, 4, 5];
    }

    case 'zigzag': {
      // ฟันปลาฉลาม / ทะแยง (Target slot + diagonal slots)
      const affected = [targetSlotIndex];
      if (row === 0) {
        // Front row -> diagonals in Back row
        if (col > 0) affected.push(targetSlotIndex + 2);
        if (col < 2) affected.push(targetSlotIndex + 4);
      } else {
        // Back row -> diagonals in Front row
        if (col > 0) affected.push(targetSlotIndex - 4);
        if (col < 2) affected.push(targetSlotIndex - 2);
      }
      return affected.filter((idx) => idx >= 0 && idx < totalSlots);
    }

    case 'aoe': {
      // ตีกลุ่ม (All slots on field)
      return Array.from({ length: totalSlots }, (_, i) => i);
    }

    case 'single':
    default: {
      return [targetSlotIndex];
    }
  }
}

export function getAttackPatternLabel(pattern: AttackPattern = 'single'): { label: string; icon: string; color: string } {
  switch (pattern) {
    case 'column':
      return { label: 'แนวตรง 2 ตัว', icon: '↕️', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' };
    case 'row':
      return { label: 'แนวขวาง 3 ตัว', icon: '↔️', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
    case 'zigzag':
      return { label: 'ฟันปลาฉลาม', icon: '⚡', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' };
    case 'aoe':
      return { label: 'ตีกลุ่มทั้งสนาม', icon: '💥', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' };
    case 'single':
    default:
      return { label: 'ตีเดี่ยว', icon: '🎯', color: 'bg-slate-500/20 text-slate-300 border-slate-500/40' };
  }
}
