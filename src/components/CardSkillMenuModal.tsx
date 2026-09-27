import React from 'react';
import { ActiveCard, Skill } from '../types/cardGame';
import { X, Sparkles, Zap, Flame, Swords, AlertTriangle, Eye, Lock } from 'lucide-react';
import { AnimeAvatar } from './AnimeAvatar';

interface CardSkillMenuModalProps {
  activeCard: ActiveCard | null;
  slotIndex: number;
  isCurrentPlayerTurn: boolean;
  onClose: () => void;
  onSelectSkill: (skill: Skill) => void;
  onSelectUltimate: () => void;
  onSelectAttack?: () => void;
}

export const CardSkillMenuModal: React.FC<CardSkillMenuModalProps> = ({
  activeCard,
  slotIndex,
  isCurrentPlayerTurn,
  onClose,
  onSelectSkill,
  onSelectUltimate,
  onSelectAttack,
}) => {
  if (!activeCard) return null;

  const cardData = activeCard.card;
  const energy = activeCard.currentEnergy;
  const hasActed = activeCard.hasActed;
  const isStunned = activeCard.isStunned || (activeCard.statusEffects || []).some((e) => e.type === 'stun');
  const isSkillStolen = activeCard.isSkillStolen ?? false;

  const isUltimateReady = !hasActed && !isStunned && isCurrentPlayerTurn && energy >= 100;
  const canAct = !hasActed && !isStunned && isCurrentPlayerTurn;

  const stolenPowers = activeCard.stolenPowers || [];
  const extraSkills = cardData.extraSkills || [];

  // Helper for category badge styling
  const getCategoryBadgeStyle = (skill: Skill) => {
    if (skill.type === 'shield' || skill.shieldAmount) {
      return 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50';
    }
    if (skill.type === 'heal' || skill.healAmount) {
      return 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50';
    }
    if (skill.type === 'buff' || skill.buffAtkAmount) {
      return 'bg-amber-950/80 text-amber-300 border-amber-500/50';
    }
    if (skill.type === 'steal') {
      return 'bg-purple-950/80 text-purple-300 border-purple-500/50';
    }
    if (skill.type === 'stun') {
      return 'bg-yellow-950/80 text-yellow-300 border-yellow-500/50';
    }
    return 'bg-indigo-950/80 text-indigo-300 border-indigo-500/50';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-md bg-slate-900 border-2 border-indigo-500/80 rounded-2xl shadow-[0_0_35px_rgba(99,102,241,0.5)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className={`p-3 bg-gradient-to-r ${cardData.avatarBgGradient} border-b border-indigo-500/40 flex items-center justify-between shrink-0`}>
          <div className="flex items-center gap-2 min-w-0">
            <AnimeAvatar
              type={cardData.avatarSvgType}
              imageUrl={cardData.imageUrl}
              size="md"
              className="w-11 h-11 rounded-xl border-2 border-white/40 shrink-0 shadow-lg"
            />
            <div className="min-w-0 text-white">
              <span className="text-[10px] bg-black/40 px-2 py-0.5 rounded-full font-cyber flex items-center gap-1 font-bold border border-white/20 w-fit">
                <Sparkles className="w-3 h-3 text-amber-300 animate-spin" /> คลังวิชา & เลือกใช้งานสกิล
              </span>
              <h3 className="text-base font-black truncate font-cyber mt-0.5 text-shadow">
                {cardData.name}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-black/50 hover:bg-black/80 text-white transition shrink-0 border border-white/20"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Strip */}
        <div className="px-3 py-2 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between text-xs font-mono shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-rose-400 font-bold flex items-center gap-1">
              ❤️ HP: {activeCard.currentHp}/{activeCard.maxHp}
            </span>
            <span className="text-amber-300 font-bold flex items-center gap-1">
              ⚔️ ATK: {activeCard.currentAtk}
            </span>
            {activeCard.shield > 0 && (
              <span className="text-cyan-300 font-bold flex items-center gap-1">
                🛡️ โล่: {activeCard.shield}
              </span>
            )}
          </div>
          <span className={`px-2 py-0.5 rounded-full font-bold flex items-center gap-1 border ${
            energy >= 100 ? 'bg-cyan-500 text-slate-950 border-cyan-300 animate-pulse' : 'bg-slate-900 text-cyan-300 border-cyan-500/40'
          }`}>
            <Zap className="w-3 h-3" /> Energy: {energy}%
          </span>
        </div>

        {/* Status Callout Banner */}
        {isStunned && (
          <div className="p-2 bg-yellow-950/80 border-b border-yellow-500/50 text-yellow-200 text-xs font-bold text-center flex items-center justify-center gap-1">
            <AlertTriangle className="w-4 h-4 text-yellow-400 animate-bounce" />
            <span>ตัวละครติดสถานะสตัน / มึนงง ไม่สามารถร่ายสกิลได้ในเทิร์นนี้!</span>
          </div>
        )}

        {hasActed && !isStunned && (
          <div className="p-2 bg-slate-950/80 border-b border-slate-800 text-slate-400 text-xs font-mono text-center">
            ✓ ตัวละครนี้ดำเนินการไปแล้วในเทิร์นปัจจุบัน
          </div>
        )}

        {/* Body Options */}
        <div className="p-3 overflow-y-auto space-y-3 flex-1">
          {/* Quick Normal Attack Action */}
          {onSelectAttack && (
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-rose-500/60 transition flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-200 flex items-center gap-1">
                  <Swords className="w-3.5 h-3.5 text-rose-400" /> โจมตีปกติ (Basic Attack)
                </div>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                  สร้างความเสียหายตามค่า ATK {activeCard.currentAtk}
                </p>
              </div>

              <button
                disabled={!canAct}
                onClick={() => {
                  onSelectAttack();
                  onClose();
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold font-cyber shrink-0 transition ${
                  canAct
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_10px_rgba(225,29,72,0.4)]'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                ⚔️ โจมตี
              </button>
            </div>
          )}

          {/* BASE SKILL SECTION */}
          <div className="p-3 rounded-xl bg-slate-950/90 border border-indigo-500/40 shadow-inner space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-300 font-cyber flex items-center gap-1">
                <span>{cardData.skill.icon}</span> สกิลหลัก: {cardData.skill.name}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-200 border border-indigo-500/50">
                ใช้ ⚡ {cardData.skill.energyCost} Energy
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-mono bg-slate-900/60 p-2 rounded-lg border border-slate-800">
              {cardData.skill.description}
            </p>

            {isSkillStolen ? (
              <div className="p-2 rounded-lg bg-red-950/80 border border-red-500/60 text-red-300 text-xs font-bold flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Lock className="w-4 h-4 text-red-400" /> ❌ สกิลนี้ถูกฝั่งตรงข้ามขโมยไปแล้ว!
                </span>
                <span className="text-[10px] text-red-400 font-mono">(ถูกปิดใช้งาน)</span>
              </div>
            ) : (
              <button
                disabled={!canAct || energy < cardData.skill.energyCost}
                onClick={() => {
                  onSelectSkill(cardData.skill);
                  onClose();
                }}
                className={`w-full py-2 rounded-xl text-xs font-bold font-cyber uppercase tracking-wider transition flex items-center justify-center gap-1.5 ${
                  canAct && energy >= cardData.skill.energyCost
                    ? 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white shadow-[0_0_12px_rgba(99,102,241,0.5)]'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                {canAct && energy >= cardData.skill.energyCost ? '✨ เลือกใช้สกิลหลักนี้!' : energy < cardData.skill.energyCost ? `⚡ Energy ไม่พอ (ต้องการ ${cardData.skill.energyCost}%)` : 'ไม่สามารถร่ายสกิลได้'}
              </button>
            )}
          </div>

          {/* EXTRA MULTI-SKILLS SECTION (If available, e.g. Deku's 7 OFA Powers, Gojo's Limitless skills) */}
          {extraSkills.length > 0 && (
            <div className="p-3 rounded-xl bg-slate-950/90 border border-emerald-500/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-emerald-300 font-cyber flex items-center gap-1">
                  <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" /> คลังวิชาและพลังพิเศษในร่าง ({extraSkills.length} วิชา)
                </h4>
                <span className="text-[9px] text-emerald-400 font-mono bg-emerald-950 px-1.5 py-0.2 rounded border border-emerald-500/30">
                  เลือกใช้ 1 วิชา/เทิร์น
                </span>
              </div>

              <div className="space-y-2">
                {extraSkills.map((subSkill, idx) => {
                  const canUseSubSkill = canAct && energy >= subSkill.energyCost;
                  const categoryBadge = subSkill.categoryLabel || (
                    subSkill.type === 'shield' || subSkill.shieldAmount ? '🛡️ สร้างโล่ป้องกัน' :
                    subSkill.type === 'heal' || subSkill.healAmount ? '💚 ฟื้นฟู HP' :
                    subSkill.type === 'buff' || subSkill.buffAtkAmount ? '⚡ บัฟพลังโจมตี' :
                    subSkill.type === 'steal' ? '🌀 ขโมยวิชา' :
                    subSkill.type === 'stun' ? '💫 สตันมึนงง' : '⚔️ โจมตีสร้างดาเมจ'
                  );

                  return (
                    <div
                      key={subSkill.id || idx}
                      className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 transition space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-100 flex items-center gap-1">
                          <span>{subSkill.icon}</span> {subSkill.name}
                        </span>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono border ${getCategoryBadgeStyle(subSkill)}`}>
                          {categoryBadge}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-300 font-mono leading-relaxed">
                        {subSkill.description}
                      </p>

                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800">
                        <span className="text-[10px] font-mono text-slate-400">
                          ใช้ ⚡ {subSkill.energyCost}% Energy
                        </span>

                        <button
                          disabled={!canUseSubSkill}
                          onClick={() => {
                            onSelectSkill(subSkill);
                            onClose();
                          }}
                          className={`px-3 py-1 rounded-lg text-xs font-bold font-cyber transition ${
                            canUseSubSkill
                              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_8px_rgba(16,185,129,0.4)]'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          ✨ ร่ายวิชานี้
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ULTIMATE MOVE SECTION */}
          <div className="p-3 rounded-xl bg-slate-950/90 border border-amber-500/40 shadow-inner space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-amber-300 font-cyber flex items-center gap-1">
                <Flame className="w-4 h-4 text-amber-400 animate-bounce" /> ท่าไม้ตายอัลติเมท: {cardData.ultimate.name}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/50 font-bold">
                ต้องการ ⚡ 100%
              </span>
            </div>

            <p className="text-xs text-amber-200/90 italic font-mono bg-amber-950/30 p-2 rounded-lg border border-amber-500/30">
              "{cardData.ultimate.quote}"
            </p>
            <p className="text-xs text-slate-300 font-mono">
              {cardData.ultimate.description} • ดาเมจพื้นฐาน {cardData.ultimate.damage}
            </p>

            <button
              disabled={!isUltimateReady}
              onClick={() => {
                onSelectUltimate();
                onClose();
              }}
              className={`w-full py-2.5 rounded-xl text-xs font-black font-cyber uppercase tracking-wider transition flex items-center justify-center gap-1.5 ${
                isUltimateReady
                  ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-yellow-400 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.7)] animate-pulse'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              💥 {isUltimateReady ? 'ปลดปล่อยพลังอัลติเมทสูงสุด!' : '⚡ ต้องการ Energy เต็ม 100%'}
            </button>
          </div>

          {/* STOLEN / COPIED SKILLS LIST */}
          {stolenPowers.length > 0 && (
            <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/50 space-y-2">
              <h4 className="text-xs font-bold text-purple-300 font-cyber flex items-center gap-1">
                <Eye className="w-4 h-4 text-purple-400 animate-spin" /> คลังสกิลที่ก็อปปี้ & ขโมยมา ({stolenPowers.length} วิชา)
              </h4>

              <div className="space-y-2">
                {stolenPowers.map((record, index) => {
                  const stolenSkill = record.stolenSkillObject || {
                    id: `stolen-${index}`,
                    name: record.stolenSkillName || 'วิชาที่ขโมยมา',
                    description: record.stolenSkillDescription || 'สกิลที่สูบกลืนมาจากคู่ต่อสู้',
                    energyCost: 25,
                    effectValue: 1200 + (record.stolenAtk || 0),
                    type: 'attack',
                    icon: '🌀',
                  };

                  const canUseStolenSkill = canAct && energy >= (stolenSkill.energyCost || 25);

                  return (
                    <div
                      key={record.id || index}
                      className="p-2.5 rounded-lg bg-slate-950/90 border border-purple-500/40 space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-amber-300 font-mono">
                          🎯 คัดลอกจาก: {record.sourceCardName}
                        </span>
                        <span className="text-[10px] text-purple-300 bg-purple-900/60 px-1.5 py-0.2 rounded border border-purple-500/40">
                          +{record.stolenAtk || 0} ATK
                        </span>
                      </div>

                      <div className="text-xs text-indigo-300 font-bold flex items-center gap-1">
                        <span>🌀 {record.stolenSkillName || stolenSkill.name}</span>
                      </div>
                      <p className="text-[11px] text-slate-300 font-mono">
                        {record.stolenSkillDescription || stolenSkill.description}
                      </p>

                      <button
                        disabled={!canUseStolenSkill}
                        onClick={() => {
                          onSelectSkill(stolenSkill);
                          onClose();
                        }}
                        className={`w-full py-1.5 rounded-lg text-xs font-bold font-cyber transition flex items-center justify-center gap-1 ${
                          canUseStolenSkill
                            ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_10px_rgba(168,85,247,0.5)]'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        ⚡ ร่ายสกิลที่ก๊อปปี้มานี้! (ใช้ {stolenSkill.energyCost || 25} Energy)
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-2.5 bg-slate-950 border-t border-slate-800 text-center shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider transition"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
