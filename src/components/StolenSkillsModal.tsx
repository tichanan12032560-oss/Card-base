import React from 'react';
import { ActiveCard } from '../types/cardGame';
import { X, Sparkles, Zap, Swords, Shield, Eye, Flame, AlertCircle } from 'lucide-react';
import { AnimeAvatar } from './AnimeAvatar';

interface StolenSkillsModalProps {
  activeCard: ActiveCard | null;
  onClose: () => void;
}

export const StolenSkillsModal: React.FC<StolenSkillsModalProps> = ({
  activeCard,
  onClose,
}) => {
  if (!activeCard) return null;

  const cardData = activeCard.card;
  const stolenPowers = activeCard.stolenPowers || [];
  const hasStolenPowers = stolenPowers.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border-2 border-purple-500/80 rounded-2xl shadow-[0_0_30px_rgba(168,85,247,0.4)] overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-3 bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-900 border-b border-purple-500/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <AnimeAvatar
              type={cardData.avatarSvgType}
              size="md"
              className="w-10 h-10 rounded-lg border border-purple-400 shrink-0 shadow-md"
            />
            <div className="min-w-0">
              <span className="text-[10px] text-purple-400 font-cyber flex items-center gap-1 font-bold">
                <Sparkles className="w-3 h-3 text-purple-300 animate-spin" /> คลังคัดลอก & ขโมยวิชา
              </span>
              <h3 className="text-sm font-bold text-white truncate font-cyber">
                {cardData.name}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-3 overflow-y-auto space-y-3 flex-1">
          {/* Card Summary Badge */}
          <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/30 flex items-center justify-between text-xs font-mono">
            <span className="text-purple-300 font-bold flex items-center gap-1">
              <Eye className="w-4 h-4 text-purple-400" /> รวมวิชาที่สูบกลืนมา:
            </span>
            <span className="px-2 py-0.5 rounded-full bg-purple-900 text-purple-200 font-bold border border-purple-500">
              {stolenPowers.length} วิชา / พลัง
            </span>
          </div>

          {hasStolenPowers ? (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1">
                <span>⚡</span> รายการพลังและสกิลที่ขโมยมา:
              </h4>

              {stolenPowers.map((record, index) => (
                <div
                  key={record.id || index}
                  className="p-3 rounded-xl bg-slate-950/80 border border-purple-500/40 shadow-inner space-y-1.5 transition hover:border-purple-400"
                >
                  <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-1">
                    <span className="font-bold text-amber-300 font-cyber flex items-center gap-1">
                      🎯 จาก: {record.sourceCardName}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {record.timestamp}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono">
                    {record.stolenAtk > 0 && (
                      <div className="px-2 py-1 rounded bg-amber-950/50 text-amber-300 border border-amber-500/40 flex items-center gap-1 font-bold">
                        <Swords className="w-3 h-3 text-amber-400" />
                        <span>ขโมย ATK: +{record.stolenAtk}</span>
                      </div>
                    )}
                    {record.stolenEnergy > 0 && (
                      <div className="px-2 py-1 rounded bg-cyan-950/50 text-cyan-300 border border-cyan-500/40 flex items-center gap-1 font-bold">
                        <Zap className="w-3 h-3 text-cyan-400" />
                        <span>ขโมย Energy: +{record.stolenEnergy}</span>
                      </div>
                    )}
                  </div>

                  {record.stolenSkillName && (
                    <div className="pt-1 text-xs">
                      <div className="text-indigo-300 font-bold flex items-center gap-1">
                        <span>🌀 สกิลที่คัดลอก:</span> {record.stolenSkillName}
                      </div>
                      {record.stolenSkillDescription && (
                        <p className="text-[10.5px] text-slate-300 mt-0.5 leading-tight">
                          {record.stolenSkillDescription}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 px-4 text-center space-y-2 bg-slate-950/60 rounded-xl border border-dashed border-slate-800">
              <div className="w-12 h-12 rounded-full bg-purple-950/80 border border-purple-500/50 flex items-center justify-center mx-auto text-purple-300 text-xl animate-pulse">
                🔮
              </div>
              <h4 className="text-sm font-bold text-slate-300 font-cyber">
                ยังไม่ได้ก๊อปปี้หรือขโมยพลัง!
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                ใช้สกิลของตัวละครใส่เป้าหมายบนสนาม เพื่อสูบกลืนจักระ, อัตลักษณ์ หรือขโมยพลังโจมตี ATK มาสะสมเก็บไว้ที่นี่!
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-2.5 bg-slate-950 border-t border-slate-800 text-center shrink-0">
          <button
            onClick={onClose}
            className="w-full py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider shadow transition"
          >
            ตกลง / ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
