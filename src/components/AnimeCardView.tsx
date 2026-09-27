import React, { useRef } from 'react';
import { ActiveCard, CardData } from '../types/cardGame';
import { AnimeAvatar } from './AnimeAvatar';
import { Shield, Swords, Heart, Zap, Sparkles, AlertTriangle, Flame, Eye } from 'lucide-react';
import { ElementalAuraOverlay, getCardElement } from './ElementalAuraOverlay';
import { getAttackPatternLabel } from '../utils/attackPatternEngine';

interface AnimeCardViewProps {
  cardData: CardData;
  activeCard?: ActiveCard | null;
  isSelectable?: boolean;
  isSelected?: boolean;
  isTargetable?: boolean;
  isForbidden?: boolean;
  forbiddenReason?: string;
  onClick?: () => void;
  onDoubleClick?: () => void;
  onInspect?: () => void;
  onAttack?: () => void;
  onSkill?: () => void;
  onUltimate?: () => void;
  isCurrentPlayerTurn?: boolean;
  size?: 'compact' | 'standard' | 'large';
  slotIndex?: number;
}

export const AnimeCardView: React.FC<AnimeCardViewProps> = ({
  cardData,
  activeCard,
  isSelectable = false,
  isSelected = false,
  isTargetable = false,
  isForbidden = false,
  forbiddenReason,
  onClick,
  onDoubleClick,
  onInspect,
  onAttack,
  onSkill,
  onUltimate,
  isCurrentPlayerTurn = false,
  size = 'standard',
  slotIndex,
}) => {
  const lastClickRef = useRef<number>(0);

  const handleCardClick = (e: React.MouseEvent) => {
    const now = Date.now();
    if (now - lastClickRef.current < 350) {
      if (onDoubleClick) {
        e.stopPropagation();
        onDoubleClick();
      } else {
        onClick?.();
      }
    } else {
      onClick?.();
    }
    lastClickRef.current = now;
  };
  const hp = activeCard ? activeCard.currentHp : cardData.baseHp;
  const maxHp = activeCard ? activeCard.maxHp : cardData.baseHp;
  const atk = activeCard ? activeCard.currentAtk : cardData.baseAtk;
  const def = activeCard ? activeCard.currentDef : cardData.baseDef;
  const energy = activeCard ? activeCard.currentEnergy : 0;
  const hasActed = activeCard?.hasActed ?? false;
  const isStunned = activeCard?.isStunned || (activeCard?.statusEffects || []).some((e) => e.type === 'stun');
  const isFrozen = (activeCard?.statusEffects || []).some((e) => e.type === 'freeze');
  const isBurned = (activeCard?.statusEffects || []).some((e) => e.type === 'burn');

  const hpPercent = Math.max(0, Math.min(100, (hp / maxHp) * 100));
  const isUltimateReady = energy >= 100 && !hasActed && !isStunned && isCurrentPlayerTurn;
  const canUseSkill = activeCard && energy >= cardData.skill.energyCost && !hasActed && !isStunned && isCurrentPlayerTurn;
  const canAttack = activeCard && !hasActed && !isStunned && isCurrentPlayerTurn;

  const hasReactions = activeCard && activeCard.reactions && activeCard.reactions.length > 0;
  const atkBonus = atk - cardData.baseAtk;
  const defBonus = def - cardData.baseDef;

  // Hand card compact rendering (ultra sleek ~58px height to save screen space)
  if (size === 'compact') {
    return (
      <div
        onClick={onClick}
        className={`group relative rounded-lg transition-all duration-150 select-none overflow-hidden flex flex-col justify-between
          w-28 sm:w-32 h-[56px] sm:h-[60px] p-1 text-[9px] shrink-0
          ${isSelected ? 'ring-2 ring-amber-400 bg-slate-800 shadow-[0_0_12px_rgba(251,191,36,0.5)] scale-102 -translate-y-0.5' : 'bg-slate-900/95 border border-slate-700/80 hover:border-slate-500'}
          ${isSelectable ? 'cursor-pointer hover:bg-slate-800' : ''}
        `}
      >
        <div className={`absolute inset-0 opacity-15 bg-gradient-to-br ${cardData.avatarBgGradient} pointer-events-none`} />

        {/* Top: Series & Inspect */}
        <div className="relative z-10 flex items-center justify-between leading-none">
          <span className={`px-1 py-0.2 rounded text-[7px] font-bold border truncate max-w-[70px] ${cardData.badgeBg}`}>
            {cardData.series}
          </span>
          {onInspect && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onInspect();
              }}
              className="text-[8px] text-slate-400 hover:text-amber-300"
              title="ดูข้อมูลการ์ด"
            >
              ℹ️
            </button>
          )}
        </div>

        {/* Middle: Avatar + Name */}
        <div className="relative z-10 flex items-center gap-1 my-0.5 min-w-0">
          <AnimeAvatar type={cardData.avatarSvgType} imageUrl={cardData.imageUrl} size="sm" className="w-5 h-5 sm:w-6 sm:h-6 shrink-0 rounded" />
          <div className="min-w-0 flex-1">
            <h5 className="font-bold text-slate-100 truncate text-[10px] leading-tight">
              {cardData.name.split(' ')[0]}
            </h5>
          </div>
        </div>

        {/* Bottom stats: ATK, DEF, & Energy Cost for quick tactical comparison */}
        <div className="relative z-10 grid grid-cols-3 gap-0.5 bg-slate-950/85 px-1 py-0.5 rounded text-[7.5px] sm:text-[8px] font-mono leading-none border border-slate-800/80">
          <span className="text-amber-300 font-bold truncate flex items-center gap-0.5" title={`ATK: ${cardData.baseAtk}`}>
            ⚔️{cardData.baseAtk}
          </span>
          <span className="text-blue-300 font-bold truncate flex items-center gap-0.5 justify-center" title={`DEF: ${cardData.baseDef}`}>
            🛡️{cardData.baseDef}
          </span>
          <span className="text-cyan-300 font-bold truncate flex items-center gap-0.5 justify-end" title={`สกิลใช้ Energy: ${cardData.skill.energyCost}`}>
            ⚡{cardData.skill.energyCost}
          </span>
        </div>
      </div>
    );
  }

  const elemInfo = getCardElement(cardData);
  const patternInfo = getAttackPatternLabel(cardData.attackPattern);
  const stolenCount = activeCard?.stolenPowers?.length || 0;

  // Board Slot Card (Fills vertical slot proportionally without overflowing)
  return (
    <ElementalAuraOverlay cardData={cardData} isActiveSlot={true}>
      <div
        onClick={handleCardClick}
        className={`group relative rounded-xl transition-all duration-150 select-none overflow-hidden flex flex-col justify-between
          w-full h-full min-h-0 p-1 sm:p-1.5 text-xs
          ${isSelected ? 'ring-2 ring-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.6)]' : 'border border-slate-700/80 bg-slate-900/90'}
          ${isTargetable ? 'ring-2 ring-rose-500 cursor-pointer animate-pulse shadow-[0_0_16px_rgba(239,68,68,0.7)]' : ''}
          ${isForbidden ? 'border-2 border-red-500 bg-red-950/70 cursor-not-allowed' : ''}
          ${isStunned ? 'border-2 border-yellow-400 shadow-[0_0_12px_rgba(234,179,8,0.45)]' : ''}
          ${isFrozen ? 'border-2 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.45)]' : ''}
          ${isBurned ? 'border-2 border-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.4)]' : ''}
          ${hasActed ? 'opacity-65 saturate-60' : ''}
        `}
        style={{
          boxShadow: hasReactions
            ? '0 0 12px rgba(245, 158, 11, 0.25), inset 0 0 8px rgba(245, 158, 11, 0.08)'
            : undefined,
        }}
      >
        <div className={`absolute inset-0 opacity-15 bg-gradient-to-br ${cardData.avatarBgGradient} pointer-events-none`} />

        {/* Forbidden Overlay */}
        {isForbidden && (
          <div className="absolute inset-0 bg-red-950/90 z-20 flex flex-col items-center justify-center p-1 text-center border-2 border-red-500 rounded-xl">
            <AlertTriangle className="w-4 h-4 text-red-400 animate-bounce" />
            <span className="font-bold text-red-200 text-[9px]">❌ ห้ามวางติดกัน!</span>
            <p className="text-[8px] text-red-300 line-clamp-1 mt-0.5">{forbiddenReason || 'ศัตรูคู่อาฆาต'}</p>
          </div>
        )}

        {/* Row 1: Header - Series Badge & Name */}
        <div className="relative z-10 flex items-center justify-between gap-1 shrink-0 leading-none">
          <div className="flex items-center gap-1 min-w-0">
            <span
              className={`px-1 py-0.2 rounded text-[7px] sm:text-[8px] font-bold border truncate shrink-0 ${cardData.badgeBg}`}
            >
              {cardData.series}
            </span>
            <span title={elemInfo.label} className="text-[8px] sm:text-[9px] cursor-help shrink-0">
              {elemInfo.icon}
            </span>
            <span
              title={`รูปแบบการโจมตี: ${patternInfo.label}`}
              className={`px-0.5 py-0.2 rounded text-[7px] sm:text-[8px] font-bold border shrink-0 ${patternInfo.color}`}
            >
              {patternInfo.icon}
            </span>
            <h4 className="font-bold text-slate-100 truncate text-[10px] sm:text-[11px]">
              {cardData.name.split(' ')[0]}
            </h4>
          </div>

          <div className="flex items-center gap-0.5 shrink-0">
            {activeCard && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDoubleClick?.();
                }}
                className={`text-[7px] sm:text-[8px] px-1 py-0.2 rounded font-bold flex items-center gap-0.5 transition ${
                  stolenCount > 0
                    ? 'bg-purple-500/40 text-purple-200 border border-purple-400/60 animate-pulse shadow-[0_0_8px_rgba(168,85,247,0.5)]'
                    : 'bg-slate-800/80 hover:bg-purple-950/60 text-slate-400 hover:text-purple-300 border border-slate-700/60'
                }`}
                title="กด 2 ครั้งติดกัน (Double Click) หรือแตะเพื่อเปิดดูวิชาที่ก๊อปปี้/ขโมยมา"
              >
                <Eye className="w-2.5 h-2.5 text-purple-300" />
                <span>{stolenCount > 0 ? stolenCount : 'วิชา'}</span>
              </button>
            )}
            {hasReactions && (
              <span className="text-[7px] sm:text-[8px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold animate-pulse flex items-center gap-0.5">
                <Zap className="w-2 h-2" /> +{atkBonus}⚔️
              </span>
            )}
            {onInspect && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onInspect();
                }}
                className="text-[8px] sm:text-[9px] text-slate-400 hover:text-amber-300"
                title="ดูข้อมูลการ์ด"
              >
                ℹ️
              </button>
            )}
          </div>
        </div>

      {/* Row 2: Avatar + Stats & HP + Status Effect Badges */}
      <div className="relative z-10 flex items-center gap-1.5 min-w-0 flex-1 my-0.5">
        <AnimeAvatar type={cardData.avatarSvgType} imageUrl={cardData.imageUrl} size="sm" className="w-6 h-6 sm:w-7 sm:h-7 shrink-0 rounded-lg" />
        <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
          {/* HP Bar */}
          <div className="flex justify-between text-[8px] sm:text-[9px] font-mono leading-none">
            <span className="text-rose-400 font-bold">HP</span>
            <span className="text-slate-300 font-semibold">{hp} / {maxHp}</span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-1 overflow-hidden border border-slate-800">
            <div
              className={`h-full transition-all duration-200 ${
                hpPercent > 50 ? 'bg-emerald-500' : hpPercent > 25 ? 'bg-amber-400' : 'bg-rose-500'
              }`}
              style={{ width: `${hpPercent}%` }}
            />
          </div>

          {/* Stats inline */}
          <div className="flex items-center justify-between text-[8px] sm:text-[9px] font-mono leading-none text-slate-300">
            <span className={atkBonus > 0 ? 'text-amber-300 font-bold' : isBurned ? 'text-orange-400 font-bold' : 'text-slate-300'}>
              ⚔️ {atk}
            </span>
            <span className={defBonus > 0 ? 'text-amber-300 font-bold' : isFrozen ? 'text-cyan-300 font-bold' : 'text-slate-300'}>
              🛡️ {def}
            </span>
            <span className={energy >= 100 ? 'text-cyan-300 font-bold animate-pulse' : 'text-slate-400'}>
              ⚡ {energy}%
            </span>
          </div>

          {/* Active Status Effects Badges */}
          {activeCard?.statusEffects && activeCard.statusEffects.length > 0 && (
            <div className="flex flex-wrap gap-0.5 mt-0.5">
              {activeCard.statusEffects.map((eff) => (
                <span
                  key={eff.id}
                  title={`${eff.name}: ${eff.description}`}
                  className="text-[7px] px-1 py-0.2 rounded font-bold flex items-center gap-0.5 border leading-none shadow-sm"
                  style={{
                    backgroundColor: `${eff.color}25`,
                    color: eff.color,
                    borderColor: `${eff.color}60`,
                  }}
                >
                  <span>{eff.icon}</span>
                  <span className="truncate max-w-[42px]">{eff.name.split(' ')[0]}</span>
                  <span className="font-mono font-bold">({eff.duration}T)</span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Row 3: Action Buttons (Ultra-compact) */}
      {activeCard && isCurrentPlayerTurn && (
        <div className="relative z-10 pt-0.5 border-t border-slate-800/80 shrink-0">
          {isStunned ? (
            <div className="text-center text-[8px] text-yellow-300 bg-yellow-950/60 py-0.2 px-1 rounded border border-yellow-500/50 font-bold flex items-center justify-center gap-1 animate-pulse leading-tight">
              ⚡ ติดสตัน! (ขยับไม่ได้)
            </div>
          ) : hasActed ? (
            <div className="text-center text-[8px] text-slate-500 font-mono italic leading-tight">
              ✓ ดำเนินการแล้ว
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1">
              <button
                disabled={!canAttack}
                onClick={(e) => {
                  e.stopPropagation();
                  onAttack?.();
                }}
                className={`py-0.5 px-0.5 rounded text-[8px] font-bold flex items-center justify-center gap-0.5 transition leading-tight ${
                  canAttack
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Swords className="w-2 h-2" /> โจมตี
              </button>

              <button
                disabled={!canUseSkill}
                onClick={(e) => {
                  e.stopPropagation();
                  onSkill?.();
                }}
                title={cardData.skill.name}
                className={`py-0.5 px-0.5 rounded text-[8px] font-bold flex items-center justify-center gap-0.5 transition leading-tight ${
                  canUseSkill
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Sparkles className="w-2 h-2" /> สกิล
              </button>

              <button
                disabled={!isUltimateReady}
                onClick={(e) => {
                  e.stopPropagation();
                  onUltimate?.();
                }}
                className={`py-0.5 px-0.5 rounded text-[8px] font-bold flex items-center justify-center gap-0.5 transition leading-tight ${
                  isUltimateReady
                    ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 font-black animate-pulse shadow'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                💥 อัลติ!
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  </ElementalAuraOverlay>
);
};
