import { ActiveCard, CardData, ReactionDetail } from '../types/cardGame';

const TAG_LABELS: Record<string, { title: string; desc: string; atk: number; def: number }> = {
  'swordsman': {
    title: 'วิถีแห่งคมดาบ (Blade Resonance)',
    desc: 'ทั้งคู่เป็นยอดนักดาบผู้ชำนาญการฟาดฟัน คมดาบประสานคลื่นดาบผ่ามิติ',
    atk: 15,
    def: 15,
  },
  'eye-power': {
    title: 'เนตรพระเจ้าประสาน (Divine Eyes Synergy)',
    desc: 'พลังแห่งดวงตาพิเศษ (เนตรวงแหวน/รินเนกัน/ริคุกัน) มองทะลุทุกการเคลื่อนไหว',
    atk: 15,
    def: 20,
  },
  'inner-demon': {
    title: 'อสูรร้ายในร่างเนื้อ (Inner Monster Resonance)',
    desc: 'ผู้แบกรับมารร้าย/สัตว์หาง/ราชาคำสาป สั่นพ้องความแค้นเพื่อเพิ่มพลังโจมตี',
    atk: 20,
    def: 10,
  },
  'fire': {
    title: 'จิตวิญญาณแห่งเพลิงกาฬ (Flame Resonance)',
    desc: 'ธาตุไฟอันร้อนระอุหลอมรวมเปลวเพลิงแผดเผาการป้องกันศัตรู',
    atk: 18,
    def: 5,
  },
  'lightning': {
    title: 'สายฟ้าพิฆาตคำราม (Lightning Synergy)',
    desc: 'ประจุไฟฟ้าประสานความเร็วเสียงทะลวงทะลุเป้าหมาย',
    atk: 18,
    def: 8,
  },
  'super-strength': {
    title: 'หมัดเหล็กทลายฟ้า (Super Strength Synergy)',
    desc: 'พละกำลังมหาศาลไร้ขีดจำกัด ชกกระแทกสะเทือนแผ่นดิน',
    atk: 16,
    def: 14,
  },
  'martial-arts': {
    title: 'ไหวพริบประชิดตัว (Martial Arts Synergy)',
    desc: 'ศิลปะการต่อสู้ระยะประชิดอันเฉียบคม ประสานจังหวะรุกรับ',
    atk: 14,
    def: 16,
  },
  'god-tier': {
    title: 'ออร่าผู้ไร้เทียมทาน (Apex Aura Resonance)',
    desc: 'พลังระดับจุดสูงสุดของจักรวาล แผ่แรงกดดันบดขยี้สนามรบ',
    atk: 22,
    def: 15,
  },
  'domain': {
    title: 'มหาอาณาเขตประสาน (Domain Resonance)',
    desc: 'เขตแดนมนต์สะกดมิติ สร้างสภาพแวดล้อมที่ไร้เทียมทาน',
    atk: 16,
    def: 18,
  },
};

/**
 * Checks if placing a card into slotIndex is allowed according to the bad relationship rule:
 * "แต่ถ้า ความสามารถหรือความสัมพันธ์ระหว่างตัวละคร แย่ จะไม่สามารถวางใกล้กันได้ (❌ ห้ามวางติดกัน)"
 * Grid: 2 rows x 3 columns (6 slots total: 0..2 = Front Row, 3..5 = Back Row)
 */
export function checkPlacementValidity(
  cardToPlace: CardData,
  targetSlotIndex: number,
  currentSlots: (ActiveCard | null)[]
): { allowed: boolean; reason?: string; rivalName?: string } {
  const row = Math.floor(targetSlotIndex / 3);
  const col = targetSlotIndex % 3;

  const adjacentIndices: number[] = [];
  if (col > 0) adjacentIndices.push(targetSlotIndex - 1); // Left
  if (col < 2) adjacentIndices.push(targetSlotIndex + 1); // Right
  if (row === 0 && targetSlotIndex + 3 < currentSlots.length) adjacentIndices.push(targetSlotIndex + 3); // Back row vertical neighbor
  if (row === 1 && targetSlotIndex - 3 >= 0) adjacentIndices.push(targetSlotIndex - 3); // Front row vertical neighbor

  for (const idx of adjacentIndices) {
    const neighbor = currentSlots[idx];
    if (!neighbor) continue;

    const neighborCard = neighbor.card;

    // Check if cardToPlace hates neighborCard OR neighborCard hates cardToPlace
    const isBadRelation =
      cardToPlace.badRivals.includes(neighborCard.id) ||
      neighborCard.badRivals.includes(cardToPlace.id);

    if (isBadRelation) {
      return {
        allowed: false,
        rivalName: neighborCard.name,
        reason: `❌ ความสัมพันธ์แย่ ห้ามวางติดกัน! ${cardToPlace.name} กับ ${neighborCard.name} เป็นศัตรูคู่แค้นในเนื้อเรื่อง ไม่สามารถวางช่องประชิดกันได้!`,
      };
    }
  }

  return { allowed: true };
}

/**
 * Computes all Power Reaction effects for all cards on a player's board (2 Rows x 3 Columns = 6 Slots).
 * - 🤝 Good relationship (Allies / fought together in lore) -> boosts ATK & DEF
 * - 🔗 Similar abilities (Tags resonance intra & cross anime) -> boosts ATK & DEF
 * - 🛡️ Back Row Protection -> +15% DEF when front row has a defender
 * - Neither -> baseline unchanged stats
 */
export function recalculateBoardReactions(slots: (ActiveCard | null)[]): (ActiveCard | null)[] {
  const hasFrontRowDefenders = slots.slice(0, 3).some((c) => c !== null);

  return slots.map((activeCard, slotIndex) => {
    if (!activeCard) return null;

    const currentCard = activeCard.card;
    const reactions: ReactionDetail[] = [];
    let totalAtkBonus = 0;
    let totalDefBonus = 0;

    const row = Math.floor(slotIndex / 3);
    const col = slotIndex % 3;

    // 1. Check neighbors (Direct grid neighbors: Left, Right, Front/Back)
    const neighborIndices: number[] = [];
    if (col > 0) neighborIndices.push(slotIndex - 1);
    if (col < 2) neighborIndices.push(slotIndex + 1);
    if (row === 0 && slotIndex + 3 < slots.length) neighborIndices.push(slotIndex + 3);
    if (row === 1 && slotIndex - 3 >= 0) neighborIndices.push(slotIndex - 3);

    neighborIndices.forEach((nIdx) => {
      const neighbor = slots[nIdx];
      if (!neighbor) return;

      const neighborCard = neighbor.card;

      // 🤝 Good relationship / Fought together
      const isAlly =
        currentCard.allies.includes(neighborCard.id) ||
        neighborCard.allies.includes(currentCard.id);

      if (isAlly) {
        reactions.push({
          partnerId: neighborCard.id,
          partnerName: neighborCard.name,
          type: 'good-relationship',
          title: `🤝 มิตรภาพร่วมสู้ (${neighborCard.name.split(' ')[0]})`,
          description: `มีความสัมพันธ์อันแนบแน่นและร่วมต่อสู้เคียงบ่าเคียงไหล่ในเนื้อเรื่อง เพิ่ม ATK +25%, DEF +20%`,
          atkBonusPercent: 25,
          defBonusPercent: 20,
        });
        totalAtkBonus += 25;
        totalDefBonus += 20;
      }

      // 🔗 Similar abilities between neighbors (Shared tags)
      const sharedTags = currentCard.tags.filter((t) => neighborCard.tags.includes(t));
      sharedTags.forEach((tag) => {
        const info = TAG_LABELS[tag];
        if (info) {
          // Avoid duplicate tags
          const exists = reactions.some((r) => r.title.includes(tag) || r.partnerId === neighborCard.id && r.type === 'similar-ability');
          if (!exists) {
            reactions.push({
              partnerId: neighborCard.id,
              partnerName: neighborCard.name,
              type: 'similar-ability',
              title: `🔗 ${info.title}`,
              description: `${info.desc} (เพิ่ม ATK +${info.atk}%, DEF +${info.def}%)`,
              atkBonusPercent: info.atk,
              defBonusPercent: info.def,
            });
            totalAtkBonus += info.atk;
            totalDefBonus += info.def;
          }
        }
      });
    });

    // 2. Back Row Defense Bonus (Cards in Back Row get +15% DEF if Front Row has at least 1 card)
    if (row === 1 && hasFrontRowDefenders) {
      reactions.push({
        partnerId: 'back-row-shield',
        partnerName: 'แนวหน้าคุ้มกัน',
        type: 'similar-ability',
        title: '🛡️ ตั้งรับแนวหลัง (Back Row)',
        description: 'ได้รับโล่กำบังจากแนวหน้า เพิ่ม DEF +15%',
        atkBonusPercent: 0,
        defBonusPercent: 15,
      });
      totalDefBonus += 15;
    }

    // 3. Check team-wide good relationships (even non-adjacent)
    slots.forEach((other, oIdx) => {
      if (!other || oIdx === slotIndex || neighborIndices.includes(oIdx)) return;
      const otherCard = other.card;
      const isTeamAlly =
        currentCard.allies.includes(otherCard.id) ||
        otherCard.allies.includes(currentCard.id);

      if (isTeamAlly) {
        reactions.push({
          partnerId: otherCard.id,
          partnerName: otherCard.name,
          type: 'good-relationship',
          title: `🤝 พลังพันธมิตรร่วมทีม (${otherCard.name.split(' ')[0]})`,
          description: `พันธมิตรอยู่ในสนามเดียวกัน เพิ่ม ATK +12%, DEF +10%`,
          atkBonusPercent: 12,
          defBonusPercent: 10,
        });
        totalAtkBonus += 12;
        totalDefBonus += 10;
      }
    });

    // Cap bonus to prevent infinite runaway, max +85% ATK, +75% DEF
    const cappedAtkBonus = Math.min(totalAtkBonus, 85);
    const cappedDefBonus = Math.min(totalDefBonus, 75);

    const calculatedAtk = Math.round(currentCard.baseAtk * (1 + cappedAtkBonus / 100));
    const calculatedDef = Math.round(currentCard.baseDef * (1 + cappedDefBonus / 100));

    return {
      ...activeCard,
      currentAtk: calculatedAtk,
      currentDef: calculatedDef,
      reactions,
    };
  });
}
