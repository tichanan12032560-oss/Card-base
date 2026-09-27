import React, { useEffect } from 'react';
import { ActiveCard } from '../types/cardGame';
import { AnimeAvatar } from './AnimeAvatar';
import confetti from 'canvas-confetti';

interface UltimateCutinModalProps {
  activeCard: ActiveCard;
  targetName: string;
  onFinish: () => void;
}

export const UltimateCutinModal: React.FC<UltimateCutinModalProps> = ({
  activeCard,
  targetName,
  onFinish,
}) => {
  const { card } = activeCard;
  const ultimate = card.ultimate;

  useEffect(() => {
    // Trigger anime particle sparks
    try {
      confetti({
        particleCount: 80,
        spread: 100,
        origin: { y: 0.5 },
        colors: [ultimate.colorTheme, '#ffffff', '#f59e0b', '#ef4444'],
      });
    } catch {
      // ignore
    }

    const timer = setTimeout(() => {
      onFinish();
    }, 2400);

    return () => clearTimeout(timer);
  }, [onFinish, ultimate.colorTheme]);

  return (
    <div
      onClick={onFinish}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 cursor-pointer overflow-hidden select-none animate-shake"
    >
      {/* Anime Speedlines Background */}
      <div className="absolute inset-0 bg-speedlines opacity-40 animate-spin" style={{ animationDuration: '25s' }} />

      {/* Comic Halftone Overlay */}
      <div className="absolute inset-0 bg-manga-dots opacity-20 pointer-events-none" />

      {/* Dramatic diagonal dynamic slice bars */}
      <div className="absolute -inset-x-20 top-1/4 h-32 bg-gradient-to-r from-transparent via-amber-500/20 to-transparent -rotate-6 pointer-events-none" />
      <div className="absolute -inset-x-20 bottom-1/4 h-32 bg-gradient-to-r from-transparent via-rose-500/20 to-transparent 6 pointer-events-none" />

      {/* Modal Container */}
      <div className="relative z-10 max-w-2xl w-full mx-4 p-6 sm:p-8 bg-gradient-to-b from-slate-900/95 via-slate-950/95 to-black/95 border-2 border-amber-400 rounded-2xl shadow-[0_0_60px_rgba(245,158,11,0.7)] text-center">
        {/* Anime Title & Series */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="px-3 py-1 rounded-full text-xs font-black tracking-widest uppercase bg-amber-500 text-slate-950">
            💥 ULTIMATE CLIMAX!
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${card.badgeBg}`}>
            {card.series}
          </span>
        </div>

        {/* Character Visual Hero */}
        <div className="relative my-4 flex justify-center">
          <div className="relative p-3 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-cyan-400 p-1 shadow-[0_0_40px_rgba(245,158,11,0.8)] animate-pulse">
            <AnimeAvatar type={card.avatarSvgType} size="xl" />
          </div>
        </div>

        {/* Character Quote in Comic Speech Style */}
        <div className="mb-4 bg-slate-900/90 border-2 border-amber-400/60 p-3 rounded-xl shadow-inner max-w-lg mx-auto">
          <p className="text-base sm:text-lg font-bold text-amber-300 italic">
            "{ultimate.quote}"
          </p>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            — {card.name} ({card.nameJp})
          </p>
        </div>

        {/* Ultimate Move Name with Manga Font */}
        <div className="relative my-4">
          <h2
            className="text-2xl sm:text-4xl font-extrabold uppercase tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-rose-500 drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] font-cyber"
          >
            {ultimate.name}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-md mx-auto leading-relaxed">
            {ultimate.description}
          </p>
        </div>

        {/* Target & Damage Output */}
        <div className="mt-4 flex items-center justify-center gap-4 text-sm font-mono">
          <div className="px-4 py-2 rounded-lg bg-rose-950/60 border border-rose-500/50 text-rose-300">
            เป้าหมาย: <span className="font-bold text-white">{targetName}</span>
          </div>
          <div className="px-4 py-2 rounded-lg bg-amber-950/60 border border-amber-500/50 text-amber-300">
            พลังทำลายล้าง: <span className="font-bold text-white text-base">💥 {ultimate.damage.toLocaleString()} DMG</span>
          </div>
        </div>

        <div className="mt-4 text-[11px] text-slate-400 animate-pulse">
          (แตะที่ใดก็ได้เพื่อดำเนินผลต่อสู้ทันที)
        </div>
      </div>
    </div>
  );
};
