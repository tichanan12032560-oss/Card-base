import React from 'react';
import { CardData } from '../types/cardGame';
import { Flame, Droplets, Zap, Eye, Sparkles, Wind } from 'lucide-react';

export type ElementType = 'fire' | 'water' | 'lightning' | 'dark' | 'god' | 'wind';

export interface ElementalAuraProps {
  cardData: CardData;
  children?: React.ReactNode;
  isActiveSlot?: boolean;
}

/**
 * Determines card element type based on explicit element tag, skills, tags, or ultimate type
 */
export function getCardElement(cardData: CardData): { element: ElementType; label: string; icon: string; color: string } {
  const tags = cardData.tags || [];
  const statusType = cardData.skill?.statusEffect?.type;
  const vfxType = cardData.ultimate?.vfxType;
  const cardId = cardData.id;

  // 1. Fire Element
  if (
    tags.includes('fire') ||
    statusType === 'burn' ||
    vfxType === 'amaterasu' ||
    cardId === 'bakugo' ||
    cardId === 'kaido'
  ) {
    return { element: 'fire', label: 'ธาตุไฟ (Fire)', icon: '🔥', color: '#ef4444' };
  }

  // 2. Water / Ice Element
  if (
    statusType === 'freeze' ||
    cardId === 'todoroki' ||
    cardData.name.includes('น้ำ') ||
    cardData.name.includes('น้ำแข็ง') ||
    vfxType === 'infinite-void'
  ) {
    return { element: 'water', label: 'ธาตุน้ำ/น้ำแข็ง (Water)', icon: '💧', color: '#38bdf8' };
  }

  // 3. Lightning / Electric Element
  if (
    tags.includes('lightning') ||
    statusType === 'stun' ||
    cardId === 'kakashi' ||
    cardId === 'sasuke' ||
    cardId === 'deku'
  ) {
    return { element: 'lightning', label: 'ธาตุสายฟ้า (Lightning)', icon: '⚡', color: '#facc15' };
  }

  // 4. Dark / Void / Curse Element
  if (
    tags.includes('inner-demon') ||
    tags.includes('domain') ||
    vfxType === 'malevolent-shrine' ||
    cardId === 'sukuna' ||
    cardId === 'megumi'
  ) {
    return { element: 'dark', label: 'ธาตุมืด/เวทมนตร์ (Dark)', icon: '🔮', color: '#a855f7' };
  }

  // 5. Wind / Blade Element
  if (tags.includes('swordsman') || cardId === 'zoro' || cardId === 'naruto') {
    return { element: 'wind', label: 'ธาตุลม/คมดาบ (Wind)', icon: '🍃', color: '#10b981' };
  }

  // 6. God / Divine Aura (Default for Apex Fighters)
  return { element: 'god', label: 'ออร่าระดับเทพ (Divine)', icon: '✨', color: '#f59e0b' };
}

export const ElementalAuraOverlay: React.FC<ElementalAuraProps> = ({
  cardData,
  children,
  isActiveSlot = true,
}) => {
  const { element, label, color } = getCardElement(cardData);

  if (!isActiveSlot) {
    return <>{children}</>;
  }

  return (
    <div className="relative w-full h-full group">
      {/* 1. Outer Glow Border */}
      <div
        className={`absolute -inset-0.5 rounded-xl border transition-all duration-300 pointer-events-none z-0 ${
          element === 'fire'
            ? 'animate-fire-aura bg-red-600/10'
            : element === 'water'
            ? 'animate-water-aura bg-cyan-500/10'
            : element === 'lightning'
            ? 'animate-lightning-aura bg-amber-400/10'
            : element === 'dark'
            ? 'animate-dark-aura bg-purple-900/10'
            : element === 'wind'
            ? 'animate-wind-aura bg-emerald-500/10'
            : 'animate-god-aura bg-amber-500/10'
        }`}
      />

      {/* 2. Visual Particle Effects Overlay per Element */}
      {element === 'fire' && (
        <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none z-10 opacity-70">
          <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-red-600/30 via-orange-500/10 to-transparent" />
          {/* Flame Ember Sparkles */}
          <div className="absolute bottom-1 left-2 w-1.5 h-1.5 rounded-full bg-orange-400 animate-ping opacity-75" />
          <div className="absolute bottom-3 right-3 w-1 h-1 rounded-full bg-red-400 animate-pulse" />
        </div>
      )}

      {element === 'water' && (
        <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none z-10 opacity-70">
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/15 via-blue-600/10 to-transparent" />
          {/* Water Ripple Wave Ring */}
          <div className="absolute inset-2 rounded-full border border-cyan-400/40 animate-ping opacity-30" />
        </div>
      )}

      {element === 'lightning' && (
        <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none z-10 opacity-80">
          <div className="absolute inset-0 bg-gradient-to-tr from-amber-400/15 via-yellow-300/10 to-transparent" />
          {/* Electric Spark Flash */}
          <div className="absolute top-1 right-1 text-[8px] animate-bounce text-yellow-300">⚡</div>
          <div className="absolute bottom-1 left-1 text-[8px] animate-pulse text-amber-200">⚡</div>
        </div>
      )}

      {element === 'dark' && (
        <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none z-10 opacity-75">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-950/30 via-fuchsia-900/15 to-transparent" />
          <div className="absolute top-1 left-2 text-[8px] opacity-60 animate-pulse text-purple-300">🔮</div>
        </div>
      )}

      {element === 'god' && (
        <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none z-10 opacity-80">
          <div className="absolute inset-0 bg-gradient-to-t from-amber-500/20 via-yellow-400/10 to-transparent" />
          <div className="absolute top-1 right-2 text-[8px] animate-spin text-amber-300">✨</div>
        </div>
      )}

      {element === 'wind' && (
        <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none z-10 opacity-75">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-teal-400/10 to-transparent" />
          <div className="absolute bottom-1 right-1 text-[8px] animate-pulse text-emerald-300">🍃</div>
        </div>
      )}

      {/* 3. Card Content */}
      <div className="relative z-10 w-full h-full">{children}</div>
    </div>
  );
};
