import React from 'react';
import { CardData } from '../types/cardGame';
import { AnimeAvatar } from './AnimeAvatar';
import { X, Heart, Swords, Shield, Zap, Sparkles, Flame, Users, Ban, Tag } from 'lucide-react';
import { ANIME_CARDS } from '../data/animeCards';

interface CardInspectorModalProps {
  card: CardData | null;
  onClose: () => void;
}

export const CardInspectorModal: React.FC<CardInspectorModalProps> = ({ card, onClose }) => {
  if (!card) return null;

  const alliesCards = ANIME_CARDS.filter((c) => card.allies.includes(c.id));
  const rivalCards = ANIME_CARDS.filter((c) => card.badRivals.includes(c.id));

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-lg w-full bg-slate-900 border-2 border-slate-700 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header with Series Gradient */}
        <div className={`p-4 bg-gradient-to-r ${card.avatarBgGradient} flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <AnimeAvatar type={card.avatarSvgType} size="md" className="border-2 border-white/60 shadow" />
            <div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/50 text-white border border-white/30 uppercase">
                {card.series}
              </span>
              <h3 className="text-lg font-black text-white leading-tight drop-shadow">
                {card.name}
              </h3>
              <p className="text-xs text-white/80 font-mono">{card.nameJp}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-black/40 hover:bg-black/70 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 overflow-y-auto space-y-4 text-xs sm:text-sm">
          {/* Quote */}
          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-amber-200/90 italic text-center font-medium">
            "{card.quote}"
          </div>

          {/* Base Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center">
              <span className="flex items-center gap-1 text-rose-400 font-bold text-xs mb-1">
                <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" /> HP
              </span>
              <span className="font-mono text-base font-bold text-slate-100">
                {card.baseHp.toLocaleString()}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center">
              <span className="flex items-center gap-1 text-red-400 font-bold text-xs mb-1">
                <Swords className="w-3.5 h-3.5 text-red-400" /> ATK
              </span>
              <span className="font-mono text-base font-bold text-slate-100">
                {card.baseAtk.toLocaleString()}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center">
              <span className="flex items-center gap-1 text-blue-400 font-bold text-xs mb-1">
                <Shield className="w-3.5 h-3.5 text-blue-400" /> DEF
              </span>
              <span className="font-mono text-base font-bold text-slate-100">
                {card.baseDef.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Tags */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-amber-400" /> แท็กความสามารถ (Resonance Tags)
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {card.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-md text-xs font-mono bg-slate-800 text-slate-300 border border-slate-700"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Unique Skill */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-indigo-400 flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-indigo-400" /> ✨ สกิลเฉพาะตัว: {card.skill.name}
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                ใช้ {card.skill.energyCost} Energy
              </span>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed mt-1">
              {card.skill.description}
            </p>
          </div>

          {/* Ultimate Move */}
          <div className="p-3 rounded-xl bg-gradient-to-r from-amber-950/40 to-slate-950/80 border border-amber-500/40">
            <div className="flex items-center justify-between mb-1">
              <span className="font-black text-amber-300 flex items-center gap-1 font-cyber">
                <Flame className="w-4 h-4 text-amber-400" /> 💥 ท่าไม้ตาย: {card.ultimate.name}
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-600 font-bold">
                100 Energy (💥 {card.ultimate.damage} DMG)
              </span>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed mt-1">
              {card.ultimate.description}
            </p>
          </div>

          {/* Power Reaction: Good Allies */}
          <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30">
            <h4 className="font-bold text-emerald-400 flex items-center gap-1.5 mb-1 text-xs">
              <Users className="w-3.5 h-3.5" /> 🤝 ความสัมพันธ์ดี / สู้ด้วยกันในเนื้อเรื่อง (เพิ่ม ATK +25%, DEF +20%)
            </h4>
            {alliesCards.length > 0 ? (
              <div className="flex flex-wrap gap-2 mt-2">
                {alliesCards.map((ally) => (
                  <div
                    key={ally.id}
                    className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-900 border border-emerald-500/40 text-xs text-slate-200"
                  >
                    <AnimeAvatar type={ally.avatarSvgType} size="sm" className="w-5 h-5" />
                    <span>{ally.name.split(' ')[0]}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-xs italic">ไม่มีพันธมิตรเฉพาะตัว (สามารถประสานพลังผ่านความสามารถคล้ายกันได้)</p>
            )}
          </div>

          {/* Power Reaction: Bad Rivals (Forbidden neighbor) */}
          <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40">
            <h4 className="font-bold text-red-400 flex items-center gap-1.5 mb-1 text-xs">
              <Ban className="w-3.5 h-3.5" /> ❌ ความสัมพันธ์แย่ / ศัตรูคู่อาฆาต (ห้ามวางติดกันเด็ดขาด!)
            </h4>
            {rivalCards.length > 0 ? (
              <div className="flex flex-wrap gap-2 mt-2">
                {rivalCards.map((rival) => (
                  <div
                    key={rival.id}
                    className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-900 border border-red-500/50 text-xs text-red-200"
                  >
                    <AnimeAvatar type={rival.avatarSvgType} size="sm" className="w-5 h-5" />
                    <span>{rival.name.split(' ')[0]}</span>
                    <span className="text-[10px] text-red-400">ห้ามวางติดกัน</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-xs italic">ไม่มีศัตรูคู่อาฆาตที่ห้ามวางติดกัน</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
