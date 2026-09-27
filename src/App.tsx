import React, { useState, useEffect, useCallback } from 'react';
import {
  ActiveCard,
  CardData,
  PlayerState,
  CombatLog,
  Skill,
} from './types/cardGame';
import { ANIME_CARDS } from './data/animeCards';
import { checkPlacementValidity, recalculateBoardReactions } from './utils/reactionEngine';
import {
  createStatusEffect,
  applyStatusToCard,
  processTurnStatusEffects,
} from './utils/statusEffectsEngine';
import { soundEngine } from './utils/soundEffects';
import { AnimeCardView } from './components/AnimeCardView';
import { DeckPile } from './components/DeckPile';
import { BattleArenaClash } from './components/BattleArenaClash';
import { UltimateCutinModal } from './components/UltimateCutinModal';
import { CardInspectorModal } from './components/CardInspectorModal';
import { RulesGuideModal } from './components/RulesGuideModal';
import { StolenSkillsModal } from './components/StolenSkillsModal';
import { CardSkillMenuModal } from './components/CardSkillMenuModal';
import { getAffectedTargetSlots, getAttackPatternLabel } from './utils/attackPatternEngine';
import {
  Volume2,
  VolumeX,
  HelpCircle,
  RotateCcw,
  Users,
  Bot,
  Flame,
  Award,
  Layers,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react';
import confetti from 'canvas-confetti';

// Shuffle helper
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export const App: React.FC = () => {
  // Game Setup
  const [gameMode, setGameMode] = useState<'2p' | 'vs-cpu'>('2p');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [turnNumber, setTurnNumber] = useState<number>(1);
  const [activePlayerId, setActivePlayerId] = useState<'p1' | 'p2'>('p1');
  const [hasDrawnThisTurn, setHasDrawnThisTurn] = useState<boolean>(false);

  // Common Anime Deck
  const [commonDeck, setCommonDeck] = useState<CardData[]>(() =>
    shuffleArray([...ANIME_CARDS, ...ANIME_CARDS])
  );

  // 30-Second Turn Timer & 2-Action Turn Limit State
  const TURN_DURATION = 30;
  const MAX_ACTIONS_PER_TURN = 2;
  const [turnTimeRemaining, setTurnTimeRemaining] = useState<number>(TURN_DURATION);
  const [turnActionsCount, setTurnActionsCount] = useState<number>(0);

  // Hand Sorting Option ('default' | 'atk' | 'def' | 'energy')
  const [handSortCriterion, setHandSortCriterion] = useState<'default' | 'atk' | 'def' | 'energy'>('default');

  // Players State
  const [player1, setPlayer1] = useState<PlayerState>(() => ({
    id: 'p1',
    name: 'Player 1',
    avatar: 'goku',
    hp: 5000,
    maxHp: 5000,
    energy: 50,
    deck: [],
    hand: shuffleArray(ANIME_CARDS).slice(0, 4),
    slots: [null, null, null, null, null, null],
    comboCount: 0,
  }));

  const [player2, setPlayer2] = useState<PlayerState>(() => ({
    id: 'p2',
    name: 'Player 2',
    avatar: 'sasuke',
    hp: 5000,
    maxHp: 5000,
    energy: 50,
    deck: [],
    hand: shuffleArray(ANIME_CARDS).slice(4, 8),
    slots: [null, null, null, null, null, null],
    comboCount: 0,
  }));

  // Selection & Action States
  const [selectedHandIndex, setSelectedHandIndex] = useState<number | null>(null);
  const [inspectCard, setInspectCard] = useState<CardData | null>(null);
  const [inspectStolenCard, setInspectStolenCard] = useState<ActiveCard | null>(null);
  const [selectedSkillMenuSlot, setSelectedSkillMenuSlot] = useState<{ player: 'p1' | 'p2'; slotIndex: number } | null>(null);
  const [showRules, setShowRules] = useState<boolean>(false);
  const [ultimateCutinData, setUltimateCutinData] = useState<{
    activeCard: ActiveCard;
    targetName: string;
    sourceSlotIndex: number;
    targetSlotIndex: number | 'leader';
  } | null>(null);

  // Attack / Skill Target Selection
  const [targetingAction, setTargetingAction] = useState<{
    type: 'attack' | 'skill';
    sourceSlotIndex: number;
    customSkill?: Skill;
  } | null>(null);

  // Combat Logs & Screen Shake
  const [combatLogs, setCombatLogs] = useState<CombatLog[]>([]);
  const [floatingText, setFloatingText] = useState<{ text: string; color: string; id: number } | null>(null);
  const [isScreenShaking, setIsScreenShaking] = useState<boolean>(false);
  const [winner, setWinner] = useState<'p1' | 'p2' | null>(null);

  // Trigger sound engine toggle
  const toggleSound = () => {
    soundEngine.enabled = !soundEnabled;
    setSoundEnabled(!soundEnabled);
  };

  const addLog = useCallback((text: string, type: CombatLog['type']) => {
    const newLog: CombatLog = {
      id: `${Date.now()}-${Math.random()}`,
      turn: turnNumber,
      player: activePlayerId,
      text,
      type,
      timestamp: Date.now(),
    };
    setCombatLogs((prev) => [newLog, ...prev.slice(0, 24)]);
  }, [activePlayerId, turnNumber]);

  const triggerFloatingText = useCallback((text: string, color: string = 'text-amber-300') => {
    const id = Date.now();
    setFloatingText({ text, color, id });
    setIsScreenShaking(true);
    setTimeout(() => setIsScreenShaking(false), 400);
    setTimeout(() => {
      setFloatingText((current) => (current?.id === id ? null : current));
    }, 1600);
  }, []);

  // Restart / Reset Match
  const resetMatch = useCallback(() => {
    const shuffled = shuffleArray([...ANIME_CARDS, ...ANIME_CARDS]);
    setCommonDeck(shuffled.slice(8));
    setPlayer1({
      id: 'p1',
      name: 'Player 1',
      avatar: 'goku',
      hp: 5000,
      maxHp: 5000,
      energy: 50,
      deck: [],
      hand: shuffled.slice(0, 4),
      slots: [null, null, null, null, null, null],
      comboCount: 0,
    });
    setPlayer2({
      id: 'p2',
      name: gameMode === 'vs-cpu' ? 'บอท (CPU)' : 'Player 2',
      avatar: 'sasuke',
      hp: 5000,
      maxHp: 5000,
      energy: 50,
      deck: [],
      hand: shuffled.slice(4, 8),
      slots: [null, null, null, null, null, null],
      comboCount: 0,
    });
    setTurnNumber(1);
    setActivePlayerId('p1');
    setTurnTimeRemaining(TURN_DURATION);
    setTurnActionsCount(0);
    setHasDrawnThisTurn(false);
    setSelectedHandIndex(null);
    setTargetingAction(null);
    setWinner(null);
    setCombatLogs([]);
    addLog('🔥 เริ่มการประลองการ์ด 2 คนใหม่!', 'placement');
    soundEngine.playTurnSwitch();
  }, [addLog, gameMode]);

  // Draw Card from Deck
  const handleDrawCard = useCallback(() => {
    if (commonDeck.length === 0) {
      triggerFloatingText('กองจั่วหมดแล้ว!', 'text-slate-400');
      return;
    }

    const drawnCard = commonDeck[0];
    const newDeck = commonDeck.slice(1);
    setCommonDeck(newDeck);
    soundEngine.playDraw();

    if (activePlayerId === 'p1') {
      setPlayer1((prev) => ({
        ...prev,
        hand: [...prev.hand, drawnCard],
      }));
      addLog(`P1 จั่วการ์ด ${drawnCard.name.split(' ')[0]}`, 'placement');
    } else {
      setPlayer2((prev) => ({
        ...prev,
        hand: [...prev.hand, drawnCard],
      }));
      addLog(`P2 จั่วการ์ด ${drawnCard.name.split(' ')[0]}`, 'placement');
    }

    setHasDrawnThisTurn(true);
  }, [activePlayerId, addLog, commonDeck, triggerFloatingText]);

  // End Turn
  const handleEndTurn = useCallback(() => {
    if (winner !== null) return;
    soundEngine.playTurnSwitch();
    setSelectedHandIndex(null);
    setTargetingAction(null);
    setHasDrawnThisTurn(false);
    setTurnTimeRemaining(TURN_DURATION);
    setTurnActionsCount(0);

    if (activePlayerId === 'p1') {
      setActivePlayerId('p2');
      setTurnNumber((t) => t + 1);

      // Process status effects on incoming player (P2)
      const { updatedSlots, logs: statusLogs, defeatedCards, totalDotDamage } = processTurnStatusEffects(player2.slots);

      if (defeatedCards.length > 0) {
        soundEngine.playHeavyImpact();
        defeatedCards.forEach((cardName) => {
          addLog(`💀 ${cardName} พ่ายแพ้ต่อสถานะผิดปกติ!`, 'defeat');
        });
      }

      statusLogs.forEach((log) => addLog(log, 'reaction'));

      if (totalDotDamage > 0) {
        triggerFloatingText(`🔥 -${totalDotDamage} (DoT สถานะ)!`, 'text-orange-400');
      }

      // Energy recovery + Stun status check
      const nextSlots = updatedSlots.map((c) => {
        if (!c) return null;
        const isFrozen = (c.statusEffects || []).some((e) => e.type === 'freeze');
        const isStunned = (c.statusEffects || []).some((e) => e.type === 'stun');
        return {
          ...c,
          hasActed: isStunned ? true : false,
          currentEnergy: isFrozen ? c.currentEnergy : Math.min(100, c.currentEnergy + 10),
        };
      });

      const recalculated = recalculateBoardReactions(nextSlots);
      setPlayer2((prev) => ({ ...prev, slots: recalculated }));
      addLog('⚔️ เทิร์นของ PLAYER 2', 'turn');
    } else {
      setActivePlayerId('p1');
      setTurnNumber((t) => t + 1);

      // Process status effects on incoming player (P1)
      const { updatedSlots, logs: statusLogs, defeatedCards, totalDotDamage } = processTurnStatusEffects(player1.slots);

      if (defeatedCards.length > 0) {
        soundEngine.playHeavyImpact();
        defeatedCards.forEach((cardName) => {
          addLog(`💀 ${cardName} พ่ายแพ้ต่อสถานะผิดปกติ!`, 'defeat');
        });
      }

      statusLogs.forEach((log) => addLog(log, 'reaction'));

      if (totalDotDamage > 0) {
        triggerFloatingText(`🔥 -${totalDotDamage} (DoT สถานะ)!`, 'text-orange-400');
      }

      // Energy recovery + Stun status check
      const nextSlots = updatedSlots.map((c) => {
        if (!c) return null;
        const isFrozen = (c.statusEffects || []).some((e) => e.type === 'freeze');
        const isStunned = (c.statusEffects || []).some((e) => e.type === 'stun');
        return {
          ...c,
          hasActed: isStunned ? true : false,
          currentEnergy: isFrozen ? c.currentEnergy : Math.min(100, c.currentEnergy + 10),
        };
      });

      const recalculated = recalculateBoardReactions(nextSlots);
      setPlayer1((prev) => ({ ...prev, slots: recalculated }));
      addLog('⚔️ เทิร์นของ PLAYER 1', 'turn');
    }
  }, [activePlayerId, addLog, player1.slots, player2.slots, triggerFloatingText, winner]);

  // Place card into slot
  const handlePlaceCardIntoSlot = useCallback((targetSlotIndex: number) => {
    if (selectedHandIndex === null) return;

    if (turnActionsCount >= MAX_ACTIONS_PER_TURN) {
      soundEngine.playForbidden();
      triggerFloatingText('⚠️ ครบ 2 แอคชันในเทิร์นนี้แล้ว!', 'text-amber-400');
      return;
    }

    const currentPlayer = activePlayerId === 'p1' ? player1 : player2;
    const cardToPlace = currentPlayer.hand[selectedHandIndex];
    if (!cardToPlace) return;

    if (currentPlayer.slots[targetSlotIndex] !== null) {
      soundEngine.playForbidden();
      triggerFloatingText('⚠️ ช่องนี้มีการ์ดอยู่แล้ว!', 'text-amber-400');
      return;
    }

    // Check bad relationship rule:
    // "แต่ถ้า ความสามารถหรือความสัมพันธ์ระหว่างตัวละคร แย่ จะไม่สามารถวางใกล้กันได้ (❌ ห้ามวางติดกัน)"
    const validity = checkPlacementValidity(cardToPlace, targetSlotIndex, currentPlayer.slots);

    if (!validity.allowed) {
      soundEngine.playForbidden();
      triggerFloatingText(`❌ ห้ามวางติดกัน! ${cardToPlace.name.split(' ')[0]} กับ ${validity.rivalName?.split(' ')[0]}`, 'text-red-400');
      addLog(validity.reason || 'ห้ามวางการ์ดศัตรูติดกัน!', 'forbidden');
      return;
    }

    // Valid placement!
    soundEngine.playCardPlace();

    const newActiveCard: ActiveCard = {
      instanceId: `${cardToPlace.id}-${Date.now()}`,
      card: cardToPlace,
      currentHp: cardToPlace.baseHp,
      maxHp: cardToPlace.baseHp,
      currentAtk: cardToPlace.baseAtk,
      currentDef: cardToPlace.baseDef,
      currentEnergy: 35,
      hasActed: false,
      shield: 0,
      reactions: [],
      statusEffects: [],
    };

    const newSlots = [...currentPlayer.slots];
    newSlots[targetSlotIndex] = newActiveCard;

    // Recalculate Power Reaction synergies for all board cards
    const calculatedSlots = recalculateBoardReactions(newSlots);

    const placedCardAfterCalc = calculatedSlots[targetSlotIndex];
    if (placedCardAfterCalc && placedCardAfterCalc.reactions.length > 0) {
      soundEngine.playSynergyReaction();
      const reasons = placedCardAfterCalc.reactions.map((r) => r.title).join(', ');
      triggerFloatingText(`⚡ REACTION! ${reasons}`, 'text-amber-300');
      addLog(`⚡ ${cardToPlace.name.split(' ')[0]} ปลุกพลัง: ${reasons}!`, 'reaction');
    } else {
      addLog(`วาง ${cardToPlace.name.split(' ')[0]} ลงช่อง ${targetSlotIndex + 1}`, 'placement');
    }

    const newHand = currentPlayer.hand.filter((_, idx) => idx !== selectedHandIndex);

    if (activePlayerId === 'p1') {
      setPlayer1((prev) => ({
        ...prev,
        hand: newHand,
        slots: calculatedSlots,
      }));
    } else {
      setPlayer2((prev) => ({
        ...prev,
        hand: newHand,
        slots: calculatedSlots,
      }));
    }

    setSelectedHandIndex(null);

    // Record action and check if 2 actions reached
    const nextActionCount = turnActionsCount + 1;
    setTurnActionsCount(nextActionCount);

    if (nextActionCount >= MAX_ACTIONS_PER_TURN) {
      triggerFloatingText('⚡ ครบ 2 แอคชัน! สลับเทิร์นอัตโนมัติ...', 'text-amber-300');
      addLog(`⚡ ${activePlayerId === 'p1' ? 'P1' : 'P2'} ทำครบ 2 แอคชันในเทิร์น -> ส่งต่อเทิร์นอัตโนมัติ!`, 'turn');
      setTimeout(() => {
        handleEndTurn();
      }, 750);
    }
  }, [activePlayerId, addLog, handleEndTurn, player1, player2, selectedHandIndex, triggerFloatingText, turnActionsCount]);

  // Initiate Attack / Skill
  const handleCardAttackClick = useCallback((slotIndex: number) => {
    if (turnActionsCount >= MAX_ACTIONS_PER_TURN) {
      soundEngine.playForbidden();
      triggerFloatingText('⚠️ ครบ 2 แอคชันในเทิร์นนี้แล้ว!', 'text-amber-400');
      return;
    }

    setTargetingAction({ type: 'attack', sourceSlotIndex: slotIndex });
    triggerFloatingText('เลือกเป้าหมายการ์ดฝ่ายตรงข้าม!', 'text-rose-400');
  }, [triggerFloatingText, turnActionsCount]);

  const handleExecuteSupportSkill = useCallback((slotIndex: number, skill: Skill) => {
    if (turnActionsCount >= MAX_ACTIONS_PER_TURN) {
      soundEngine.playForbidden();
      triggerFloatingText('⚠️ ครบ 2 แอคชันในเทิร์นนี้แล้ว!', 'text-amber-400');
      return;
    }

    const isP1 = activePlayerId === 'p1';
    const slots = isP1 ? player1.slots : player2.slots;
    const activeCard = slots[slotIndex];
    if (!activeCard) return;

    if (activeCard.currentEnergy < skill.energyCost) {
      soundEngine.playForbidden();
      triggerFloatingText(`⚡ Energy ไม่พอสำหรับ ${skill.name}!`, 'text-amber-400');
      return;
    }

    soundEngine.playSkillCharge();

    const shieldAdd = skill.shieldAmount || (skill.type === 'shield' ? skill.effectValue : 0);
    const healAdd = skill.healAmount || (skill.type === 'heal' ? skill.effectValue : 0);
    const buffAtkAdd = skill.buffAtkAmount || (skill.type === 'buff' ? skill.effectValue : 0);

    const updatedCard: ActiveCard = {
      ...activeCard,
      hasActed: true,
      shield: activeCard.shield + shieldAdd,
      currentHp: Math.min(activeCard.maxHp, activeCard.currentHp + healAdd),
      currentAtk: activeCard.currentAtk + buffAtkAdd,
      currentEnergy: Math.max(0, activeCard.currentEnergy - skill.energyCost),
    };

    const updatedSlots = [...slots];
    updatedSlots[slotIndex] = updatedCard;

    if (isP1) {
      setPlayer1((prev) => ({ ...prev, slots: updatedSlots }));
    } else {
      setPlayer2((prev) => ({ ...prev, slots: updatedSlots }));
    }

    const cardName = activeCard.card.name.split(' ')[0];
    let msg = `✨ ${cardName} ร่ายวิชา [${skill.name}]!`;
    if (shieldAdd > 0) msg += ` 🛡️ โล่ +${shieldAdd}`;
    if (healAdd > 0) msg += ` 💚 ฮีล HP +${healAdd}`;
    if (buffAtkAdd > 0) msg += ` ⚡ บัฟ ATK +${buffAtkAdd}`;

    triggerFloatingText(msg, 'text-emerald-300');
    addLog(msg, 'skill');

    const nextActionCount = turnActionsCount + 1;
    setTurnActionsCount(nextActionCount);

    if (nextActionCount >= MAX_ACTIONS_PER_TURN) {
      triggerFloatingText('⚡ ครบ 2 แอคชัน! สลับเทิร์นอัตโนมัติ...', 'text-amber-300');
      addLog(`⚡ ${isP1 ? 'P1' : 'P2'} ทำครบ 2 แอคชัน -> ส่งต่อเทิร์นอัตโนมัติ!`, 'turn');
      setTimeout(() => {
        handleEndTurn();
      }, 750);
    }
  }, [activePlayerId, addLog, handleEndTurn, player1.slots, player2.slots, triggerFloatingText, turnActionsCount]);

  const handleSelectSkillFromModal = useCallback((slotIndex: number, skill: Skill) => {
    const isSupport =
      skill.type === 'shield' ||
      skill.type === 'heal' ||
      skill.type === 'buff' ||
      !!skill.shieldAmount ||
      !!skill.healAmount ||
      !!skill.buffAtkAmount;

    if (isSupport) {
      handleExecuteSupportSkill(slotIndex, skill);
    } else {
      if (turnActionsCount >= MAX_ACTIONS_PER_TURN) {
        soundEngine.playForbidden();
        triggerFloatingText('⚠️ ครบ 2 แอคชันในเทิร์นนี้แล้ว!', 'text-amber-400');
        return;
      }
      setTargetingAction({ type: 'skill', sourceSlotIndex: slotIndex, customSkill: skill });
      triggerFloatingText(`สกิล: [${skill.name}]! เลือกเป้าหมายการ์ดศัตรู`, 'text-indigo-300');
    }
  }, [handleExecuteSupportSkill, triggerFloatingText, turnActionsCount]);

  const handleCardSkillClick = useCallback((slotIndex: number) => {
    if (turnActionsCount >= MAX_ACTIONS_PER_TURN) {
      soundEngine.playForbidden();
      triggerFloatingText('⚠️ ครบ 2 แอคชันในเทิร์นนี้แล้ว!', 'text-amber-400');
      return;
    }

    const currentSlots = activePlayerId === 'p1' ? player1.slots : player2.slots;
    const activeCard = currentSlots[slotIndex];
    if (!activeCard) return;

    if (activeCard.currentEnergy < activeCard.card.skill.energyCost) {
      soundEngine.playForbidden();
      triggerFloatingText('Energy ไม่เพียงพอสำหรับสกิล!', 'text-amber-400');
      return;
    }

    setTargetingAction({ type: 'skill', sourceSlotIndex: slotIndex });
    triggerFloatingText(`สกิล: ${activeCard.card.skill.name}! เลือกเป้าหมาย`, 'text-indigo-400');
  }, [activePlayerId, player1.slots, player2.slots, triggerFloatingText, turnActionsCount]);

  // Execute Action against Target
  const handleExecuteTargetAction = useCallback((targetSlotIndex: number | 'leader') => {
    if (!targetingAction) return;

    const isP1 = activePlayerId === 'p1';
    const attackerSlots = isP1 ? player1.slots : player2.slots;
    const defenderSlots = isP1 ? player2.slots : player1.slots;

    const attackerCard = attackerSlots[targetingAction.sourceSlotIndex];
    if (!attackerCard) return;

    const priorCombo = isP1 ? player1.comboCount : player2.comboCount;
    const nextCombo = priorCombo + 1;
    const isBurst = nextCombo >= 5;

    // Multiplier: 1.5x if max burst triggered, else +10% per prior combo
    const comboMultiplier = isBurst ? 1.5 : (1 + priorCombo * 0.1);

    if (targetingAction.type === 'attack') {
      soundEngine.playAttackSlash();

      if (isBurst) {
        soundEngine.playComboMaxBurst();
        try {
          confetti({
            particleCount: 80,
            spread: 90,
            origin: { y: 0.45 },
            colors: ['#f59e0b', '#ef4444', '#facc15', '#38bdf8'],
          });
        } catch {
          // ignore
        }
      } else {
        soundEngine.playComboHit(nextCombo);
      }

      if (targetSlotIndex === 'leader') {
        const baseDirectDmg = Math.round(attackerCard.currentAtk * 0.9);
        const directDmg = Math.round(baseDirectDmg * comboMultiplier);

        if (isBurst) {
          triggerFloatingText(`🔥 MAX COMBO BURST! -${directDmg.toLocaleString()} HP!`, 'text-amber-300');
          addLog(`💥 MAX COMBO BURST! ${attackerCard.card.name.split(' ')[0]} ซัดโบนัสคอมโบ +50% สู่ผู้นำ สร้าง ${directDmg} ดาเมจ!`, 'attack');
        } else {
          triggerFloatingText(`💥 -${directDmg.toLocaleString()} (ตรงสู่ผู้นำ)!`, 'text-rose-400');
          addLog(`${attackerCard.card.name.split(' ')[0]} โจมตีตรงใส่ผู้นำ ${isP1 ? 'P2' : 'P1'} (คอมโบ x${nextCombo}) สร้าง ${directDmg} ดาเมจ!`, 'attack');
        }

        if (isP1) {
          setPlayer2((prev) => {
            const nextHp = Math.max(0, prev.hp - directDmg);
            if (nextHp <= 0) setWinner('p1');
            return { ...prev, hp: nextHp };
          });
        } else {
          setPlayer1((prev) => {
            const nextHp = Math.max(0, prev.hp - directDmg);
            if (nextHp <= 0) setWinner('p2');
            return { ...prev, hp: nextHp };
          });
        }
      } else {
        const pattern = attackerCard.card.attackPattern || 'single';
        const affectedIndices = getAffectedTargetSlots(targetSlotIndex, pattern, 6);
        const patternInfo = getAttackPatternLabel(pattern);

        let totalHits = 0;
        const updatedDefenderSlots = [...defenderSlots];

        affectedIndices.forEach((hitSlotIdx) => {
          const defenderCard = defenderSlots[hitSlotIdx];
          if (!defenderCard) return;

          totalHits++;
          const baseDmg = Math.max(200, Math.round(attackerCard.currentAtk * 1.35 - defenderCard.currentDef * 0.45));
          const finalDmg = Math.round(baseDmg * comboMultiplier);
          const nextHp = defenderCard.currentHp - finalDmg;

          if (nextHp <= 0) {
            soundEngine.playHeavyImpact();
            updatedDefenderSlots[hitSlotIdx] = null;
            addLog(`💀 ${defenderCard.card.name.split(' ')[0]} ถูกทำลายแล้ว!`, 'defeat');
          } else {
            updatedDefenderSlots[hitSlotIdx] = {
              ...defenderCard,
              currentHp: nextHp,
              currentEnergy: Math.min(100, defenderCard.currentEnergy + 15),
            };
          }
        });

        if (totalHits > 0) {
          triggerFloatingText(`💥 โจมตี [${patternInfo.label}] (${totalHits} ช่อง)!`, 'text-amber-400');
          addLog(`${attackerCard.card.name.split(' ')[0]} โจมตี [${patternInfo.label}] โดนการ์ด ${totalHits} ใบ!`, 'attack');
        }

        const recalculated = recalculateBoardReactions(updatedDefenderSlots);
        if (isP1) {
          setPlayer2((prev) => ({ ...prev, slots: recalculated }));
        } else {
          setPlayer1((prev) => ({ ...prev, slots: recalculated }));
        }
      }

      const updatedAttackerSlots = [...attackerSlots];
      updatedAttackerSlots[targetingAction.sourceSlotIndex] = {
        ...attackerCard,
        hasActed: true,
        currentEnergy: Math.min(100, attackerCard.currentEnergy + 30),
      };

      const finalComboCount = isBurst ? 0 : nextCombo;

      if (isP1) {
        setPlayer1((prev) => ({ ...prev, slots: updatedAttackerSlots, comboCount: finalComboCount }));
      } else {
        setPlayer2((prev) => ({ ...prev, slots: updatedAttackerSlots, comboCount: finalComboCount }));
      }
    } else if (targetingAction.type === 'skill') {
      soundEngine.playSkillCharge();
      const skill = targetingAction.customSkill || attackerCard.card.skill;

      if (isBurst) {
        soundEngine.playComboMaxBurst();
        try {
          confetti({
            particleCount: 80,
            spread: 90,
            origin: { y: 0.45 },
            colors: ['#a855f7', '#6366f1', '#f59e0b'],
          });
        } catch {
          // ignore
        }
      } else {
        soundEngine.playComboHit(nextCombo);
      }

      if (targetSlotIndex === 'leader') {
        const baseSkillDmg = Math.round(skill.effectValue * 0.95);
        const skillDmg = Math.round(baseSkillDmg * comboMultiplier);

        if (isBurst) {
          triggerFloatingText(`🔥 MAX COMBO SKILL! -${skillDmg.toLocaleString()}!`, 'text-indigo-300');
          addLog(`💥 MAX COMBO! ${attackerCard.card.name.split(' ')[0]} ใช้สกิลโบนัส +50% [${skill.name}] ใส่ผู้นำ ${skillDmg} ดาเมจ!`, 'skill');
        } else {
          triggerFloatingText(`✨ SKILL! -${skillDmg.toLocaleString()}!`, 'text-indigo-400');
          addLog(`${attackerCard.card.name.split(' ')[0]} ใช้สกิล [${skill.name}] ใส่ผู้นำ ${skillDmg} ดาเมจ!`, 'skill');
        }

        if (isP1) {
          setPlayer2((prev) => {
            const nextHp = Math.max(0, prev.hp - skillDmg);
            if (nextHp <= 0) setWinner('p1');
            return { ...prev, hp: nextHp };
          });
        } else {
          setPlayer1((prev) => {
            const nextHp = Math.max(0, prev.hp - skillDmg);
            if (nextHp <= 0) setWinner('p2');
            return { ...prev, hp: nextHp };
          });
        }
      } else {
        const pattern = attackerCard.card.attackPattern || 'single';
        const affectedIndices = getAffectedTargetSlots(targetSlotIndex, pattern, 6);
        const patternInfo = getAttackPatternLabel(pattern);

        let totalHits = 0;
        let totalStolenEnergy = 0;
        let totalStolenAtk = 0;
        let totalLifestealHp = 0;

        const newStolenRecords: any[] = [];
        const updatedDefenderSlots = [...defenderSlots];

        affectedIndices.forEach((hitSlotIdx) => {
          const defenderCard = defenderSlots[hitSlotIdx];
          if (!defenderCard) return;

          totalHits++;
          const armorPierce = skill.armorPiercePercent ? (1 - skill.armorPiercePercent / 100) : 1;
          const effectiveDef = defenderCard.currentDef * armorPierce;

          const baseSkillDmg = Math.max(300, Math.round(skill.effectValue * 1.2 - effectiveDef * 0.35));
          const skillDmg = Math.round(baseSkillDmg * comboMultiplier);
          const nextHp = defenderCard.currentHp - skillDmg;

          const attackerName = attackerCard.card.name.split(' ')[0];
          const defenderName = defenderCard.card.name.split(' ')[0];

          let stolenEnergyAmount = 0;
          let stolenAtkAmount = 0;
          let lifestealHpAmount = 0;

          if (skill.stealEnergy) {
            stolenEnergyAmount = Math.min(defenderCard.currentEnergy, skill.stealEnergy);
            totalStolenEnergy += stolenEnergyAmount;
          }

          if (skill.stealAtk) {
            stolenAtkAmount = skill.stealAtk;
            totalStolenAtk += stolenAtkAmount;
          }

          if (skill.lifestealPercent) {
            lifestealHpAmount = Math.round((skillDmg * skill.lifestealPercent) / 100);
            totalLifestealHp += lifestealHpAmount;
          }

          if (stolenEnergyAmount > 0 || stolenAtkAmount > 0 || skill.type === 'steal') {
            newStolenRecords.push({
              id: `stolen-${Date.now()}-${hitSlotIdx}`,
              sourceCardName: defenderCard.card.name,
              sourceSeries: defenderCard.card.series,
              stolenAtk: stolenAtkAmount,
              stolenEnergy: stolenEnergyAmount,
              stolenSkillName: defenderCard.card.skill.name,
              stolenSkillDescription: defenderCard.card.skill.description,
              stolenSkillObject: defenderCard.card.skill,
              timestamp: `เทิร์นที่ ${turnNumber}`,
            });
            addLog(`🌀 ${attackerName} คัดลอกสกิล [${defenderCard.card.skill.name}] จาก ${defenderName}! (${defenderName} เสียสกิลนี้ไป)`, 'skill');
          }

          if (nextHp <= 0) {
            soundEngine.playHeavyImpact();
            updatedDefenderSlots[hitSlotIdx] = null;
            addLog(`💀 ${defenderName} สลายตัวด้วยสกิล!`, 'defeat');
          } else {
            let updatedCard: ActiveCard = {
              ...defenderCard,
              currentHp: nextHp,
              currentAtk: Math.max(100, defenderCard.currentAtk - stolenAtkAmount),
              currentEnergy: Math.max(0, defenderCard.currentEnergy - stolenEnergyAmount + 15),
              isSkillStolen: (stolenEnergyAmount > 0 || stolenAtkAmount > 0 || skill.type === 'steal') ? true : defenderCard.isSkillStolen,
            };

            if (skill.statusEffect) {
              const eff = createStatusEffect(
                skill.statusEffect.type,
                skill.statusEffect.duration,
                skill.statusEffect.value,
                attackerName
              );
              updatedCard = applyStatusToCard(updatedCard, eff);
            }

            updatedDefenderSlots[hitSlotIdx] = updatedCard;
          }
        });

        if (totalHits > 0) {
          triggerFloatingText(`✨ สกิล [${patternInfo.label}] โดน ${totalHits} ช่อง!`, 'text-indigo-300');
          addLog(`${attackerCard.card.name.split(' ')[0]} ใช้สกิล [${skill.name}] (${patternInfo.label}) โดนการ์ด ${totalHits} ใบ!`, 'skill');

          if (totalStolenEnergy > 0) {
            triggerFloatingText(`⚡ ขโมย Energy +${totalStolenEnergy}!`, 'text-cyan-300');
            addLog(`⚡ ขโมย Energy รวม +${totalStolenEnergy}!`, 'skill');
          }

          if (totalStolenAtk > 0) {
            triggerFloatingText(`⚔️ ขโมย ATK +${totalStolenAtk}!`, 'text-amber-300');
            addLog(`⚔️ ดูดกลืนพลังโจมตี ATK รวม +${totalStolenAtk}!`, 'skill');
          }

          if (totalLifestealHp > 0) {
            triggerFloatingText(`💚 ดูดเลือด +${totalLifestealHp} HP!`, 'text-emerald-300');
            addLog(`💚 ดูดกลืนพลังชีวิตฟื้นฟู HP รวม +${totalLifestealHp}!`, 'skill');
          }
        }

        const recalculated = recalculateBoardReactions(updatedDefenderSlots);
        if (isP1) {
          setPlayer2((prev) => ({ ...prev, slots: recalculated }));
        } else {
          setPlayer1((prev) => ({ ...prev, slots: recalculated }));
        }

        // Apply stolen stats & records to attacker card
        const updatedAttackerSlots = [...attackerSlots];
        const currentAttackerCard = updatedAttackerSlots[targetingAction.sourceSlotIndex];
        if (currentAttackerCard) {
          const existingStolen = currentAttackerCard.stolenPowers || [];
          updatedAttackerSlots[targetingAction.sourceSlotIndex] = {
            ...currentAttackerCard,
            hasActed: true,
            currentHp: Math.min(currentAttackerCard.maxHp, currentAttackerCard.currentHp + totalLifestealHp),
            currentAtk: currentAttackerCard.currentAtk + totalStolenAtk,
            currentEnergy: Math.min(100, Math.max(0, currentAttackerCard.currentEnergy - skill.energyCost + totalStolenEnergy)),
            stolenPowers: [...existingStolen, ...newStolenRecords],
          };
        }

        const finalComboCount = isBurst ? 0 : nextCombo;

        if (isP1) {
          setPlayer1((prev) => ({ ...prev, slots: updatedAttackerSlots, comboCount: finalComboCount }));
        } else {
          setPlayer2((prev) => ({ ...prev, slots: updatedAttackerSlots, comboCount: finalComboCount }));
        }
      }
    }

    setTargetingAction(null);

    // Record action and check if 2 actions reached
    const nextActionCount = turnActionsCount + 1;
    setTurnActionsCount(nextActionCount);

    if (nextActionCount >= MAX_ACTIONS_PER_TURN) {
      triggerFloatingText('⚡ ครบ 2 แอคชัน! สลับเทิร์นอัตโนมัติ...', 'text-amber-300');
      addLog(`⚡ ${activePlayerId === 'p1' ? 'P1' : 'P2'} โจมตี/ใช้สกิลครบ 2 แอคชันในเทิร์น -> ส่งต่อเทิร์นอัตโนมัติ!`, 'turn');
      setTimeout(() => {
        handleEndTurn();
      }, 750);
    }
  }, [activePlayerId, addLog, handleEndTurn, player1, player2, targetingAction, triggerFloatingText, turnActionsCount]);

  // Initiate Ultimate Move
  const handleCardUltimateClick = useCallback((slotIndex: number) => {
    if (turnActionsCount >= MAX_ACTIONS_PER_TURN) {
      soundEngine.playForbidden();
      triggerFloatingText('⚠️ ครบ 2 แอคชันในเทิร์นนี้แล้ว!', 'text-amber-400');
      return;
    }

    const isP1 = activePlayerId === 'p1';
    const attackerSlots = isP1 ? player1.slots : player2.slots;
    const defenderSlots = isP1 ? player2.slots : player1.slots;

    const activeCard = attackerSlots[slotIndex];
    if (!activeCard || activeCard.currentEnergy < 100) return;

    let targetSlotIndex: number | 'leader' = 'leader';
    let targetName = isP1 ? 'Player 2 ผู้นำ' : 'Player 1 ผู้นำ';

    for (let i = 0; i < defenderSlots.length; i++) {
      if (defenderSlots[i] !== null) {
        targetSlotIndex = i;
        targetName = defenderSlots[i]!.card.name;
        break;
      }
    }

    soundEngine.playUltimateCutin();
    setUltimateCutinData({
      activeCard,
      targetName,
      sourceSlotIndex: slotIndex,
      targetSlotIndex,
    });
  }, [activePlayerId, player1.slots, player2.slots, triggerFloatingText, turnActionsCount]);

  // Finish Ultimate Move Cut-in
  const handleFinishUltimate = useCallback(() => {
    if (!ultimateCutinData) return;

    soundEngine.playUltimateBlast();
    const { activeCard, sourceSlotIndex, targetSlotIndex } = ultimateCutinData;
    const isP1 = activePlayerId === 'p1';
    const ultimate = activeCard.card.ultimate;
    const ultDamage = ultimate.damage;

    triggerFloatingText(`💥 ULTIMATE: -${ultDamage.toLocaleString()}!`, 'text-amber-300');
    addLog(`💥 ${activeCard.card.name.split(' ')[0]} ปลดปล่อย [${ultimate.name}] ดาเมจ ${ultDamage}!`, 'ultimate');

    const defenderSlots = isP1 ? player2.slots : player1.slots;

    if (targetSlotIndex === 'leader') {
      if (isP1) {
        setPlayer2((prev) => {
          const nextHp = Math.max(0, prev.hp - ultDamage);
          if (nextHp <= 0) setWinner('p1');
          return { ...prev, hp: nextHp };
        });
      } else {
        setPlayer1((prev) => {
          const nextHp = Math.max(0, prev.hp - ultDamage);
          if (nextHp <= 0) setWinner('p2');
          return { ...prev, hp: nextHp };
        });
      }
    } else {
      const defenderCard = defenderSlots[targetSlotIndex];
      if (defenderCard) {
        const nextHp = defenderCard.currentHp - ultDamage;
        const updatedDefenderSlots = [...defenderSlots];

        if (nextHp <= 0) {
          updatedDefenderSlots[targetSlotIndex] = null;
          addLog(`💀 ${defenderCard.card.name.split(' ')[0]} สลายตัวด้วยอัลติเมต!`, 'defeat');

          const overflow = Math.abs(nextHp);
          if (overflow > 0) {
            if (isP1) {
              setPlayer2((prev) => {
                const nextLeadHp = Math.max(0, prev.hp - overflow);
                if (nextLeadHp <= 0) setWinner('p1');
                return { ...prev, hp: nextLeadHp };
              });
            } else {
              setPlayer1((prev) => {
                const nextLeadHp = Math.max(0, prev.hp - overflow);
                if (nextLeadHp <= 0) setWinner('p2');
                return { ...prev, hp: nextLeadHp };
              });
            }
          }
        } else {
          updatedDefenderSlots[targetSlotIndex] = {
            ...defenderCard,
            currentHp: nextHp,
          };
        }

        const recalculated = recalculateBoardReactions(updatedDefenderSlots);
        if (isP1) {
          setPlayer2((prev) => ({ ...prev, slots: recalculated }));
        } else {
          setPlayer1((prev) => ({ ...prev, slots: recalculated }));
        }
      }
    }

    const attackerSlots = isP1 ? player1.slots : player2.slots;
    const updatedAttackerSlots = [...attackerSlots];
    updatedAttackerSlots[sourceSlotIndex] = {
      ...activeCard,
      currentEnergy: 0,
      hasActed: true,
    };

    if (isP1) {
      setPlayer1((prev) => ({ ...prev, slots: updatedAttackerSlots, comboCount: prev.comboCount + 1 }));
    } else {
      setPlayer2((prev) => ({ ...prev, slots: updatedAttackerSlots, comboCount: prev.comboCount + 1 }));
    }

    setUltimateCutinData(null);

    // Record action and check if 2 actions reached
    const nextActionCount = turnActionsCount + 1;
    setTurnActionsCount(nextActionCount);

    if (nextActionCount >= MAX_ACTIONS_PER_TURN) {
      triggerFloatingText('⚡ ครบ 2 แอคชัน! สลับเทิร์นอัตโนมัติ...', 'text-amber-300');
      addLog(`⚡ ${activePlayerId === 'p1' ? 'P1' : 'P2'} ใช้ไม้ตายครบ 2 แอคชันในเทิร์น -> ส่งต่อเทิร์นอัตโนมัติ!`, 'turn');
      setTimeout(() => {
        handleEndTurn();
      }, 750);
    }
  }, [activePlayerId, addLog, handleEndTurn, player1.slots, player2.slots, triggerFloatingText, turnActionsCount, ultimateCutinData]);

  // AI Turn Handler (When in VS CPU mode and activePlayer is P2)
  useEffect(() => {
    if (gameMode !== 'vs-cpu' || activePlayerId !== 'p2' || winner !== null) return;

    const aiTimeout = setTimeout(() => {
      // 1. Draw card if not drawn and hand is small
      if (!hasDrawnThisTurn && commonDeck.length > 0 && player2.hand.length < 5) {
        handleDrawCard();
      }

      // 2. Try placing card from hand if there's an empty slot
      const emptySlotIdx = player2.slots.findIndex((s) => s === null);
      if (emptySlotIdx !== -1 && player2.hand.length > 0) {
        for (let handIdx = 0; handIdx < player2.hand.length; handIdx++) {
          const testCard = player2.hand[handIdx];
          const check = checkPlacementValidity(testCard, emptySlotIdx, player2.slots);
          if (check.allowed) {
            const newActiveCard: ActiveCard = {
              instanceId: `${testCard.id}-${Date.now()}`,
              card: testCard,
              currentHp: testCard.baseHp,
              maxHp: testCard.baseHp,
              currentAtk: testCard.baseAtk,
              currentDef: testCard.baseDef,
              currentEnergy: 35,
              hasActed: false,
              shield: 0,
              reactions: [],
              statusEffects: [],
            };
            const updatedSlots = [...player2.slots];
            updatedSlots[emptySlotIdx] = newActiveCard;
            const recalc = recalculateBoardReactions(updatedSlots);
            const newHand = player2.hand.filter((_, idx) => idx !== handIdx);

            setPlayer2((prev) => ({ ...prev, hand: newHand, slots: recalc }));
            soundEngine.playCardPlace();
            addLog(`🤖 CPU วาง ${testCard.name.split(' ')[0]} ลงช่อง ${emptySlotIdx + 1}`, 'placement');
            break;
          }
        }
      }

      // 3. AI attacks or uses skills with available non-stunned cards
      setTimeout(() => {
        player2.slots.forEach((card, slotIdx) => {
          if (!card || card.hasActed || card.isStunned || (card.statusEffects || []).some((e) => e.type === 'stun')) return;

          if (card.currentEnergy >= 100) {
            handleCardUltimateClick(slotIdx);
            return;
          }

          const canUseSkill = card.currentEnergy >= card.card.skill.energyCost;
          const p1TargetSlot = player1.slots.findIndex((s) => s !== null);
          const targetIndex: number | 'leader' = p1TargetSlot !== -1 ? p1TargetSlot : 'leader';

          if (canUseSkill && Math.random() > 0.3) {
            setTargetingAction({ type: 'skill', sourceSlotIndex: slotIdx });
            setTimeout(() => {
              handleExecuteTargetAction(targetIndex);
            }, 250);
          } else {
            setTargetingAction({ type: 'attack', sourceSlotIndex: slotIdx });
            setTimeout(() => {
              handleExecuteTargetAction(targetIndex);
            }, 250);
          }
        });

        // 4. End AI Turn after actions
        setTimeout(() => {
          handleEndTurn();
        }, 900);
      }, 500);
    }, 800);

    return () => clearTimeout(aiTimeout);
  }, [
    activePlayerId,
    commonDeck.length,
    gameMode,
    handleCardUltimateClick,
    handleDrawCard,
    handleEndTurn,
    handleExecuteTargetAction,
    hasDrawnThisTurn,
    player1.slots,
    player2.hand,
    player2.slots,
    winner,
    addLog,
  ]);

  // Winner confetti trigger
  useEffect(() => {
    if (winner) {
      soundEngine.playVictory();
      confetti({
        particleCount: 150,
        spread: 120,
        origin: { y: 0.6 },
      });
    }
  }, [winner]);

  // 30-Second Turn Countdown Timer
  useEffect(() => {
    // Pause countdown if match has finished or any interactive modal is active
    if (winner !== null || showRules || inspectCard !== null || ultimateCutinData !== null) {
      return;
    }

    const timer = setInterval(() => {
      setTurnTimeRemaining((prev) => {
        if (prev <= 1) {
          return 0;
        }
        if (prev <= 6 && prev > 1) {
          soundEngine.playTimerTick();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [inspectCard, showRules, ultimateCutinData, winner]);

  // Timeout Penalty Trigger: When timer reaches 0
  useEffect(() => {
    if (turnTimeRemaining !== 0 || winner !== null) return;

    soundEngine.playTimerTimeout();

    const isP1 = activePlayerId === 'p1';
    const currentPlayer = isP1 ? player1 : player2;
    // Subtract 5% of the current player's total HP (maxHp) as a penalty
    const penalty = Math.max(50, Math.round(currentPlayer.maxHp * 0.05));

    triggerFloatingText(`⏱️ หมดเวลา! ปรับลด HP -${penalty} (5%)!`, 'text-rose-400');
    addLog(
      `⏱️ หมดเวลาเทิร์นของ ${currentPlayer.name}: ถูกลงโทษหัก HP 5% (-${penalty}) และส่งต่อเทิร์นอัตโนมัติ!`,
      'defeat'
    );

    if (isP1) {
      setPlayer1((prev) => {
        const nextHp = Math.max(0, prev.hp - penalty);
        if (nextHp <= 0) setWinner('p2');
        return { ...prev, hp: nextHp };
      });
    } else {
      setPlayer2((prev) => {
        const nextHp = Math.max(0, prev.hp - penalty);
        if (nextHp <= 0) setWinner('p1');
        return { ...prev, hp: nextHp };
      });
    }

    // Automatically transition to next turn
    handleEndTurn();
  }, [activePlayerId, addLog, handleEndTurn, player1, player2, triggerFloatingText, turnTimeRemaining, winner]);

  const activePlayer = activePlayerId === 'p1' ? player1 : player2;
  const isP1Turn = activePlayerId === 'p1';

  // Sorted hand with original index tracking to prevent desync
  const sortedHand = activePlayer.hand
    .map((card, originalIndex) => ({ card, originalIndex }))
    .sort((a, b) => {
      if (handSortCriterion === 'atk') {
        return b.card.baseAtk - a.card.baseAtk;
      }
      if (handSortCriterion === 'def') {
        return b.card.baseDef - a.card.baseDef;
      }
      if (handSortCriterion === 'energy') {
        return a.card.skill.energyCost - b.card.skill.energyCost;
      }
      return 0;
    });

  const handleToggleSort = (criterion: 'atk' | 'def' | 'energy') => {
    soundEngine.playTurnSwitch();
    setHandSortCriterion((prev) => (prev === criterion ? 'default' : criterion));
  };

  return (
    <div
      className={`h-screen w-screen max-h-screen overflow-hidden flex flex-col bg-[#07090e] text-slate-100 font-['Prompt',sans-serif] select-none p-1 sm:p-1.5 ${
        isScreenShaking ? 'animate-shake' : ''
      }`}
    >
      {/* 1. TOP NAVBAR (Strictly compact ~36px) */}
      <header className="h-8 sm:h-9 shrink-0 px-2 sm:px-3 flex items-center justify-between bg-slate-950/80 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 shadow">
            <Flame className="w-3.5 h-3.5 text-white" />
          </div>
          <h1 className="text-xs sm:text-sm font-black tracking-wider uppercase bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-rose-400 to-cyan-400 font-cyber truncate">
            ANIME CARD CLASH 2P
          </h1>
        </div>

        <div className="flex items-center gap-1 sm:gap-1.5">
          <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800 text-[10px]">
            <button
              onClick={() => {
                setGameMode('2p');
                resetMatch();
              }}
              className={`px-1.5 py-0.5 rounded font-bold transition ${
                gameMode === '2p' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3 h-3 inline mr-0.5" /> 2P
            </button>
            <button
              onClick={() => {
                setGameMode('vs-cpu');
                resetMatch();
              }}
              className={`px-1.5 py-0.5 rounded font-bold transition ${
                gameMode === 'vs-cpu' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Bot className="w-3 h-3 inline mr-0.5" /> CPU
            </button>
          </div>

          <button
            onClick={toggleSound}
            title={soundEnabled ? 'ปิดเสียง' : 'เปิดเสียง'}
            className="p-1 rounded-lg bg-slate-900 text-slate-300 border border-slate-800"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-amber-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
          </button>

          <button
            onClick={() => setShowRules(true)}
            className="px-2 py-1 rounded-lg bg-indigo-950 text-indigo-300 border border-indigo-700/60 font-bold text-[10px] flex items-center gap-0.5"
          >
            <HelpCircle className="w-3 h-3" /> กติกา
          </button>

          <button
            onClick={resetMatch}
            title="เริ่มใหม่"
            className="p-1 rounded-lg bg-slate-900 text-slate-400 border border-slate-800"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* 2. TOP DECK PILE (Requested layout: [ กองจั่ว ] centered on top) */}
      <section className="shrink-0 py-0.5">
        <DeckPile
          deckCount={commonDeck.length}
          activePlayerName={activePlayer.name}
          isDrawAvailable={!hasDrawnThisTurn}
          onDraw={handleDrawCard}
          disabled={winner !== null}
        />
      </section>

      {/* 3. MAIN ARENA: 3 Columns fitting in flex-1 min-h-0 with NO SCROLLING! */}
      <div className="flex-1 min-h-0 grid grid-cols-12 gap-1.5 sm:gap-2 my-0.5">
        {/* ================= LEFT COLUMN: P1 ช่องการ์ด (2 แถว) ================= */}
        <div className="col-span-4 h-full flex flex-col justify-between bg-blue-950/20 p-1 sm:p-1.5 rounded-xl border border-blue-900/40 overflow-hidden">
          <div className="flex items-center justify-between pb-1 border-b border-blue-900/40 shrink-0">
            <span className="font-bold text-[11px] text-blue-400 font-cyber truncate flex items-center gap-1">
              🔵 P1 ช่องการ์ด (2 แถว)
            </span>
            <span className="text-[9px] font-mono text-blue-300 bg-blue-950 px-1.5 py-0.2 rounded-full border border-blue-800 shrink-0">
              {player1.slots.filter(Boolean).length}/6
            </span>
          </div>

          <div className="flex-1 min-h-0 flex flex-col gap-1 justify-between mt-1 overflow-y-auto">
            {/* แถว 1: แถวหน้า (Front Row) - Slots 0, 1, 2 */}
            <div className="flex flex-col gap-0.5 bg-slate-950/40 p-1 rounded-lg border border-slate-800/80 shrink-0">
              <div className="text-[8px] font-bold text-amber-400 flex items-center justify-between font-mono uppercase tracking-wider px-0.5">
                <span>🛡️ แถวหน้า (Front Row)</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                {[0, 1, 2].map((slotIdx) => {
                  const activeCard = player1.slots[slotIdx];
                  const isSelectedForPlacement = selectedHandIndex !== null && isP1Turn;
                  const validity = isSelectedForPlacement
                    ? checkPlacementValidity(player1.hand[selectedHandIndex], slotIdx, player1.slots)
                    : { allowed: true };

                  return (
                    <div
                      key={`p1-slot-${slotIdx}`}
                      onClick={() => {
                        if (isSelectedForPlacement && activeCard === null) {
                          handlePlaceCardIntoSlot(slotIdx);
                        }
                      }}
                      className={`min-h-[105px] rounded-lg transition-all duration-150 relative ${
                        activeCard
                          ? ''
                          : isSelectedForPlacement
                          ? validity.allowed
                            ? 'border border-dashed border-emerald-400 bg-emerald-950/30 hover:bg-emerald-900/40 cursor-pointer shadow-[0_0_10px_rgba(16,185,129,0.3)] animate-pulse'
                            : 'border border-dashed border-red-500 bg-red-950/40 cursor-not-allowed'
                          : 'border border-dashed border-slate-800 bg-slate-950/40'
                      }`}
                    >
                      {activeCard ? (
                        <AnimeCardView
                          cardData={activeCard.card}
                          activeCard={activeCard}
                          slotIndex={slotIdx}
                          isCurrentPlayerTurn={isP1Turn}
                          onInspect={() => setInspectCard(activeCard.card)}
                          onDoubleClick={() => setSelectedSkillMenuSlot({ player: 'p1', slotIndex: slotIdx })}
                          onAttack={() => handleCardAttackClick(slotIdx)}
                          onSkill={() => setSelectedSkillMenuSlot({ player: 'p1', slotIndex: slotIdx })}
                          onUltimate={() => handleCardUltimateClick(slotIdx)}
                          isTargetable={targetingAction !== null && !isP1Turn}
                          onClick={() => {
                            if (targetingAction !== null && !isP1Turn) {
                              handleExecuteTargetAction(slotIdx);
                            }
                          }}
                        />
                      ) : (
                        <div className="h-full w-full flex flex-col items-center justify-center p-0.5 text-center">
                          {isSelectedForPlacement ? (
                            validity.allowed ? (
                              <div className="text-emerald-300 font-bold text-[9px] flex items-center gap-0.5 font-cyber">
                                <Sparkles className="w-2.5 h-2.5 text-emerald-400 animate-spin" />
                                <span>วาง #{slotIdx + 1}</span>
                              </div>
                            ) : (
                              <div className="text-red-400 font-bold text-[8px] flex flex-col items-center leading-none">
                                <span>❌ ห้ามวาง!</span>
                              </div>
                            )
                          ) : (
                            <div className="text-slate-600 text-[8px] font-mono leading-none">
                              #{slotIdx + 1}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* แถว 2: แถวหลัง (Back Row) - Slots 3, 4, 5 */}
            <div className="flex flex-col gap-0.5 bg-slate-950/40 p-1 rounded-lg border border-slate-800/80 shrink-0">
              <div className="text-[8px] font-bold text-cyan-400 flex items-center justify-between font-mono uppercase tracking-wider px-0.5">
                <span>🏹 แถวหลัง (Back Row)</span>
                <span className="text-[7px] text-slate-400 font-normal">(DEF +15%)</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                {[3, 4, 5].map((slotIdx) => {
                  const activeCard = player1.slots[slotIdx];
                  const isSelectedForPlacement = selectedHandIndex !== null && isP1Turn;
                  const validity = isSelectedForPlacement
                    ? checkPlacementValidity(player1.hand[selectedHandIndex], slotIdx, player1.slots)
                    : { allowed: true };

                  return (
                    <div
                      key={`p1-slot-${slotIdx}`}
                      onClick={() => {
                        if (isSelectedForPlacement && activeCard === null) {
                          handlePlaceCardIntoSlot(slotIdx);
                        }
                      }}
                      className={`min-h-[105px] rounded-lg transition-all duration-150 relative ${
                        activeCard
                          ? ''
                          : isSelectedForPlacement
                          ? validity.allowed
                            ? 'border border-dashed border-emerald-400 bg-emerald-950/30 hover:bg-emerald-900/40 cursor-pointer shadow-[0_0_10px_rgba(16,185,129,0.3)] animate-pulse'
                            : 'border border-dashed border-red-500 bg-red-950/40 cursor-not-allowed'
                          : 'border border-dashed border-slate-800 bg-slate-950/40'
                      }`}
                    >
                      {activeCard ? (
                        <AnimeCardView
                          cardData={activeCard.card}
                          activeCard={activeCard}
                          slotIndex={slotIdx}
                          isCurrentPlayerTurn={isP1Turn}
                          onInspect={() => setInspectCard(activeCard.card)}
                          onDoubleClick={() => setSelectedSkillMenuSlot({ player: 'p1', slotIndex: slotIdx })}
                          onAttack={() => handleCardAttackClick(slotIdx)}
                          onSkill={() => setSelectedSkillMenuSlot({ player: 'p1', slotIndex: slotIdx })}
                          onUltimate={() => handleCardUltimateClick(slotIdx)}
                          isTargetable={targetingAction !== null && !isP1Turn}
                          onClick={() => {
                            if (targetingAction !== null && !isP1Turn) {
                              handleExecuteTargetAction(slotIdx);
                            }
                          }}
                        />
                      ) : (
                        <div className="h-full w-full flex flex-col items-center justify-center p-0.5 text-center">
                          {isSelectedForPlacement ? (
                            validity.allowed ? (
                              <div className="text-emerald-300 font-bold text-[9px] flex items-center gap-0.5 font-cyber">
                                <Sparkles className="w-2.5 h-2.5 text-emerald-400 animate-spin" />
                                <span>วาง #{slotIdx + 1}</span>
                              </div>
                            ) : (
                              <div className="text-red-400 font-bold text-[8px] flex flex-col items-center leading-none">
                                <span>❌ ห้ามวาง!</span>
                              </div>
                            )
                          ) : (
                            <div className="text-slate-600 text-[8px] font-mono leading-none">
                              #{slotIdx + 1}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ================= CENTER COLUMN: Combat Arena & Clash ================= */}
        <div className="col-span-4 h-full flex flex-col justify-between overflow-hidden">
          <BattleArenaClash
            player1={player1}
            player2={player2}
            activePlayerId={activePlayerId}
            turnNumber={turnNumber}
            combatLogs={combatLogs}
            onEndTurn={handleEndTurn}
            floatingText={floatingText}
            targetSelectionMode={targetingAction !== null}
            onCancelTargetMode={() => setTargetingAction(null)}
            selectedActionSource={
              targetingAction
                ? (activePlayerId === 'p1' ? player1.slots : player2.slots)[targetingAction.sourceSlotIndex]?.card.name ?? null
                : null
            }
            turnTimeRemaining={turnTimeRemaining}
            turnActionsCount={turnActionsCount}
          />

          {targetingAction && (
            <button
              onClick={() => handleExecuteTargetAction('leader')}
              className="w-full mt-1 py-1 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-[10px] uppercase tracking-wider shadow animate-pulse shrink-0"
            >
              🎯 โจมตีตรงใส่ผู้นำ ({activePlayerId === 'p1' ? 'P2' : 'P1'})!
            </button>
          )}
        </div>

        {/* ================= RIGHT COLUMN: P2 ช่องการ์ด (2 แถว) ================= */}
        <div className="col-span-4 h-full flex flex-col justify-between bg-rose-950/20 p-1 sm:p-1.5 rounded-xl border border-rose-900/40 overflow-hidden">
          <div className="flex items-center justify-between pb-1 border-b border-rose-900/40 shrink-0">
            <span className="font-bold text-[11px] text-rose-400 font-cyber truncate flex items-center gap-1">
              🔴 P2 ช่องการ์ด (2 แถว)
            </span>
            <span className="text-[9px] font-mono text-rose-300 bg-rose-950 px-1.5 py-0.2 rounded-full border border-rose-800 shrink-0">
              {player2.slots.filter(Boolean).length}/6
            </span>
          </div>

          <div className="flex-1 min-h-0 flex flex-col gap-1 justify-between mt-1 overflow-y-auto">
            {/* แถว 1: แถวหน้า (Front Row) - Slots 0, 1, 2 */}
            <div className="flex flex-col gap-0.5 bg-slate-950/40 p-1 rounded-lg border border-slate-800/80 shrink-0">
              <div className="text-[8px] font-bold text-amber-400 flex items-center justify-between font-mono uppercase tracking-wider px-0.5">
                <span>🛡️ แถวหน้า (Front Row)</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                {[0, 1, 2].map((slotIdx) => {
                  const activeCard = player2.slots[slotIdx];
                  const isSelectedForPlacement = selectedHandIndex !== null && !isP1Turn && gameMode === '2p';
                  const validity = isSelectedForPlacement
                    ? checkPlacementValidity(player2.hand[selectedHandIndex], slotIdx, player2.slots)
                    : { allowed: true };

                  return (
                    <div
                      key={`p2-slot-${slotIdx}`}
                      onClick={() => {
                        if (isSelectedForPlacement && activeCard === null) {
                          handlePlaceCardIntoSlot(slotIdx);
                        }
                      }}
                      className={`min-h-[105px] rounded-lg transition-all duration-150 relative ${
                        activeCard
                          ? ''
                          : isSelectedForPlacement
                          ? validity.allowed
                            ? 'border border-dashed border-emerald-400 bg-emerald-950/30 hover:bg-emerald-900/40 cursor-pointer shadow-[0_0_10px_rgba(16,185,129,0.3)] animate-pulse'
                            : 'border border-dashed border-red-500 bg-red-950/40 cursor-not-allowed'
                          : 'border border-dashed border-slate-800 bg-slate-950/40'
                      }`}
                    >
                      {activeCard ? (
                        <AnimeCardView
                          cardData={activeCard.card}
                          activeCard={activeCard}
                          slotIndex={slotIdx}
                          isCurrentPlayerTurn={!isP1Turn && gameMode === '2p'}
                          onInspect={() => setInspectCard(activeCard.card)}
                          onDoubleClick={() => setSelectedSkillMenuSlot({ player: 'p2', slotIndex: slotIdx })}
                          onAttack={() => handleCardAttackClick(slotIdx)}
                          onSkill={() => setSelectedSkillMenuSlot({ player: 'p2', slotIndex: slotIdx })}
                          onUltimate={() => handleCardUltimateClick(slotIdx)}
                          isTargetable={targetingAction !== null && isP1Turn}
                          onClick={() => {
                            if (targetingAction !== null && isP1Turn) {
                              handleExecuteTargetAction(slotIdx);
                            }
                          }}
                        />
                      ) : (
                        <div className="h-full w-full flex flex-col items-center justify-center p-0.5 text-center">
                          {isSelectedForPlacement ? (
                            validity.allowed ? (
                              <div className="text-emerald-300 font-bold text-[9px] flex items-center gap-0.5 font-cyber">
                                <Sparkles className="w-2.5 h-2.5 text-emerald-400 animate-spin" />
                                <span>วาง #{slotIdx + 1}</span>
                              </div>
                            ) : (
                              <div className="text-red-400 font-bold text-[8px] flex flex-col items-center leading-none">
                                <span>❌ ห้ามวาง!</span>
                              </div>
                            )
                          ) : (
                            <div className="text-slate-600 text-[8px] font-mono leading-none">
                              #{slotIdx + 1}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* แถว 2: แถวหลัง (Back Row) - Slots 3, 4, 5 */}
            <div className="flex flex-col gap-0.5 bg-slate-950/40 p-1 rounded-lg border border-slate-800/80 shrink-0">
              <div className="text-[8px] font-bold text-cyan-400 flex items-center justify-between font-mono uppercase tracking-wider px-0.5">
                <span>🏹 แถวหลัง (Back Row)</span>
                <span className="text-[7px] text-slate-400 font-normal">(DEF +15%)</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                {[3, 4, 5].map((slotIdx) => {
                  const activeCard = player2.slots[slotIdx];
                  const isSelectedForPlacement = selectedHandIndex !== null && !isP1Turn && gameMode === '2p';
                  const validity = isSelectedForPlacement
                    ? checkPlacementValidity(player2.hand[selectedHandIndex], slotIdx, player2.slots)
                    : { allowed: true };

                  return (
                    <div
                      key={`p2-slot-${slotIdx}`}
                      onClick={() => {
                        if (isSelectedForPlacement && activeCard === null) {
                          handlePlaceCardIntoSlot(slotIdx);
                        }
                      }}
                      className={`min-h-[105px] rounded-lg transition-all duration-150 relative ${
                        activeCard
                          ? ''
                          : isSelectedForPlacement
                          ? validity.allowed
                            ? 'border border-dashed border-emerald-400 bg-emerald-950/30 hover:bg-emerald-900/40 cursor-pointer shadow-[0_0_10px_rgba(16,185,129,0.3)] animate-pulse'
                            : 'border border-dashed border-red-500 bg-red-950/40 cursor-not-allowed'
                          : 'border border-dashed border-slate-800 bg-slate-950/40'
                      }`}
                    >
                      {activeCard ? (
                        <AnimeCardView
                          cardData={activeCard.card}
                          activeCard={activeCard}
                          slotIndex={slotIdx}
                          isCurrentPlayerTurn={!isP1Turn && gameMode === '2p'}
                          onInspect={() => setInspectCard(activeCard.card)}
                          onDoubleClick={() => setSelectedSkillMenuSlot({ player: 'p2', slotIndex: slotIdx })}
                          onAttack={() => handleCardAttackClick(slotIdx)}
                          onSkill={() => setSelectedSkillMenuSlot({ player: 'p2', slotIndex: slotIdx })}
                          onUltimate={() => handleCardUltimateClick(slotIdx)}
                          isTargetable={targetingAction !== null && isP1Turn}
                          onClick={() => {
                            if (targetingAction !== null && isP1Turn) {
                              handleExecuteTargetAction(slotIdx);
                            }
                          }}
                        />
                      ) : (
                        <div className="h-full w-full flex flex-col items-center justify-center p-0.5 text-center">
                          {isSelectedForPlacement ? (
                            validity.allowed ? (
                              <div className="text-emerald-300 font-bold text-[9px] flex items-center gap-0.5 font-cyber">
                                <Sparkles className="w-2.5 h-2.5 text-emerald-400 animate-spin" />
                                <span>วาง #{slotIdx + 1}</span>
                              </div>
                            ) : (
                              <div className="text-red-400 font-bold text-[8px] flex flex-col items-center leading-none">
                                <span>❌ ห้ามวาง!</span>
                              </div>
                            )
                          ) : (
                            <div className="text-slate-600 text-[8px] font-mono leading-none">
                              #{slotIdx + 1}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. BOTTOM HAND STRIP (Strictly compact ~78px, horizontally fitted with zero page scroll) */}
      <section className="h-[76px] sm:h-[82px] shrink-0 bg-slate-950/90 px-2 py-1 rounded-xl border border-slate-800 flex flex-col justify-between overflow-hidden">
        <div className="flex items-center justify-between text-[10px] shrink-0 leading-none mb-0.5">
          <span className="font-bold flex items-center gap-1 font-cyber text-slate-200">
            <Layers className="w-3 h-3 text-amber-400" /> มือของ {activePlayer.name} ({activePlayer.hand.length} ใบ)
          </span>
          <span className="text-[9px] text-slate-400">
            {selectedHandIndex !== null ? (
              <span className="text-amber-300 font-bold animate-pulse">
                👉 แตะช่องว่าง {activePlayerId === 'p1' ? 'P1 ทางซ้าย' : 'P2 ทางขวา'} เพื่อวางการ์ด!
              </span>
            ) : (
              'แตะการ์ดเพื่อเลือกแล้วแตะช่องสนาม'
            )}
          </span>
        </div>

        <div className="flex-1 min-h-0 flex gap-1.5 overflow-x-auto overflow-y-hidden items-center">
          {activePlayer.hand.map((card, hIdx) => {
            const isSelected = selectedHandIndex === hIdx;
            return (
              <div key={`${card.id}-${hIdx}`} className="shrink-0 h-full flex items-center">
                <AnimeCardView
                  cardData={card}
                  size="compact"
                  isSelected={isSelected}
                  isSelectable={true}
                  onClick={() => {
                    if (selectedHandIndex === hIdx) {
                      setSelectedHandIndex(null);
                    } else {
                      setSelectedHandIndex(hIdx);
                      soundEngine.playDraw();
                    }
                  }}
                  onInspect={() => setInspectCard(card)}
                />
              </div>
            );
          })}
          {activePlayer.hand.length === 0 && (
            <div className="w-full text-center py-1 text-slate-500 italic text-[10px]">
              ไม่มีการ์ดในมือแล้ว! จั่วการ์ดจาก "กองจั่ว" ด้านบน
            </div>
          )}
        </div>
      </section>

      {/* MODALS */}
      {ultimateCutinData && (
        <UltimateCutinModal
          activeCard={ultimateCutinData.activeCard}
          targetName={ultimateCutinData.targetName}
          onFinish={handleFinishUltimate}
        />
      )}

      <CardInspectorModal
        card={inspectCard}
        onClose={() => setInspectCard(null)}
      />

      {inspectStolenCard && (
        <StolenSkillsModal
          activeCard={inspectStolenCard}
          onClose={() => setInspectStolenCard(null)}
        />
      )}

      {selectedSkillMenuSlot && (() => {
        const slots = selectedSkillMenuSlot.player === 'p1' ? player1.slots : player2.slots;
        const card = slots[selectedSkillMenuSlot.slotIndex];
        if (!card) return null;

        return (
          <CardSkillMenuModal
            activeCard={card}
            slotIndex={selectedSkillMenuSlot.slotIndex}
            isCurrentPlayerTurn={selectedSkillMenuSlot.player === activePlayerId}
            onClose={() => setSelectedSkillMenuSlot(null)}
            onSelectAttack={() => handleCardAttackClick(selectedSkillMenuSlot.slotIndex)}
            onSelectSkill={(skill) => handleSelectSkillFromModal(selectedSkillMenuSlot.slotIndex, skill)}
            onSelectUltimate={() => handleCardUltimateClick(selectedSkillMenuSlot.slotIndex)}
          />
        );
      })()}

      {showRules && (
        <RulesGuideModal onClose={() => setShowRules(false)} />
      )}

      {winner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 select-none">
          <div className="relative max-w-sm w-full bg-slate-900 border-2 border-amber-400 p-5 rounded-2xl shadow-[0_0_40px_rgba(245,158,11,0.6)] text-center">
            <Award className="w-12 h-12 text-amber-400 mx-auto mb-2 animate-bounce" />
            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-rose-400 to-yellow-300 font-cyber uppercase tracking-wider mb-1">
              VICTORY!
            </h2>
            <p className="text-lg font-bold text-white mb-2">
              {winner === 'p1' ? 'PLAYER 1 ได้รับชัยชนะ!' : 'PLAYER 2 ได้รับชัยชนะ!'}
            </p>
            <p className="text-[11px] text-slate-400 mb-4">
              การประลองอันดุเดือดระหว่างยอดนักสู้ 5 มหาอนิเมะได้สิ้นสุดลงแล้ว!
            </p>
            <button
              onClick={resetMatch}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg transition"
            >
              🔄 เริ่มการประลองใหม่ (Play Again)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
