import React from 'react';
import { Layers, Sparkles } from 'lucide-react';

interface DeckPileProps {
  deckCount: number;
  activePlayerName: string;
  isDrawAvailable: boolean;
  onDraw: () => void;
  disabled?: boolean;
}

export const DeckPile: React.FC<DeckPileProps> = ({
  deckCount,
  activePlayerName,
  isDrawAvailable,
  onDraw,
  disabled = false,
}) => {
  return (
    <div className="flex items-center justify-center select-none py-0.5 shrink-0">
      <div className="relative group">
        <button
          disabled={disabled || !isDrawAvailable}
          onClick={onDraw}
          className={`relative px-3 sm:px-4 py-1 rounded-xl border flex items-center gap-2 transition-all duration-150 ${
            isDrawAvailable && !disabled
              ? 'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-amber-400/90 cursor-pointer shadow-[0_0_12px_rgba(245,158,11,0.4)] hover:scale-102 active:scale-98 animate-pulse'
              : 'bg-slate-950/80 border-slate-800 text-slate-500 cursor-not-allowed opacity-70'
          }`}
        >
          <Layers className={`w-3.5 h-3.5 ${isDrawAvailable && !disabled ? 'text-amber-400' : 'text-slate-600'}`} />
          <span className="font-manga text-xs sm:text-sm tracking-wider text-amber-300">
            กองจั่ว ({deckCount} ใบ)
          </span>

          {isDrawAvailable && !disabled ? (
            <span className="flex items-center gap-1 text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 font-black shadow">
              <Sparkles className="w-2.5 h-2.5 animate-spin" /> จั่วการ์ด ({activePlayerName})
            </span>
          ) : (
            <span className="text-[9px] text-slate-500 font-mono">
              (จั่วแล้ว)
            </span>
          )}
        </button>
      </div>
    </div>
  );
};
