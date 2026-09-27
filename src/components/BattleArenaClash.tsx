import React from 'react';
import { PlayerState, CombatLog } from '../types/cardGame';
import { Swords, RefreshCw, Flame, History, Zap, Clock } from 'lucide-react';

interface BattleArenaClashProps {
  player1: PlayerState;
  player2: PlayerState;
  activePlayerId: 'p1' | 'p2';
  turnNumber: number;
  combatLogs: CombatLog[];
  onEndTurn: () => void;
  floatingText: { text: string; color: string; id: number } | null;
  targetSelectionMode: boolean;
  onCancelTargetMode: () => void;
  selectedActionSource: string | null;
  turnTimeRemaining?: number;
  turnActionsCount?: number;
}

export const BattleArenaClash: React.FC<BattleArenaClashProps> = ({
  player1,
  player2,
  activePlayerId,
  turnNumber,
  combatLogs,
  onEndTurn,
  floatingText,
  targetSelectionMode,
  onCancelTargetMode,
  turnTimeRemaining = 30,
  turnActionsCount = 0,
}) => {
  const p1HpPercent = Math.max(0, Math.min(100, (player1.hp / player1.maxHp) * 100));
  const p2HpPercent = Math.max(0, Math.min(100, (player2.hp / player2.maxHp) * 100));

  const activePlayer = activePlayerId === 'p1' ? player1 : player2;
  const currentCombo = activePlayer.comboCount;
  const maxCombo = 5;
  const comboPercent = Math.min(100, (currentCombo / maxCombo) * 100);
  const isMaxCombo = currentCombo >= maxCombo;

  // Combo multiplier label
  const comboMultiplier =
    currentCombo === 0 ? 'x1.0' :
    currentCombo === 1 ? 'x1.1' :
    currentCombo === 2 ? 'x1.25' :
    currentCombo === 3 ? 'x1.4' :
    currentCombo === 4 ? 'x1.6' : 'x2.0 MAX!';

  return (
    <div className="flex flex-col items-center justify-between h-full w-full min-h-0 bg-slate-950/70 p-1.5 sm:p-2 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
      {/* Floating Damage / Combat Text Animation */}
      {floatingText && (
        <div
          key={floatingText.id}
          className="absolute inset-x-0 top-1/4 z-40 flex items-center justify-center pointer-events-none"
        >
          <div
            className={`text-base sm:text-xl font-extrabold px-3 py-1 rounded-xl border shadow-[0_0_20px_rgba(0,0,0,0.8)] animate-bounce font-cyber uppercase tracking-wider ${floatingText.color}`}
          >
            {floatingText.text}
          </div>
        </div>
      )}

      {/* Target Selection Indicator Banner */}
      {targetSelectionMode && (
        <div className="w-full bg-rose-600/90 text-white py-0.5 px-2 rounded-lg border border-rose-400 text-center animate-pulse mb-0.5 shadow flex items-center justify-between shrink-0">
          <span className="text-[10px] font-bold flex items-center gap-1 font-cyber">
            <Swords className="w-3 h-3" /> เลือกเป้าหมายการ์ดศัตรู!
          </span>
          <button
            onClick={onCancelTargetMode}
            className="text-[9px] px-1.5 py-0.2 rounded bg-black/50 hover:bg-black text-rose-200"
          >
            ยกเลิก
          </button>
        </div>
      )}

      {/* Top: Player HP Comparison Bar */}
      <div className="w-full grid grid-cols-2 gap-1.5 mb-0.5 shrink-0">
        {/* P1 Leader HP */}
        <div
          className={`p-1 rounded-xl border transition-all ${
            activePlayerId === 'p1'
              ? 'bg-blue-950/70 border-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.3)]'
              : 'bg-slate-900/80 border-slate-800 opacity-80'
          }`}
        >
          <div className="flex items-center justify-between text-[10px] mb-0.5">
            <span className="font-bold text-blue-400 flex items-center gap-1 truncate">
              🔵 {player1.name} {activePlayerId === 'p1' && '⭐'}
            </span>
            <span className="font-mono text-[9px] font-bold text-slate-200">
              {player1.hp}
            </span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-300"
              style={{ width: `${p1HpPercent}%` }}
            />
          </div>
        </div>

        {/* P2 Leader HP */}
        <div
          className={`p-1 rounded-xl border transition-all ${
            activePlayerId === 'p2'
              ? 'bg-rose-950/70 border-rose-400 shadow-[0_0_10px_rgba(239,68,68,0.3)]'
              : 'bg-slate-900/80 border-slate-800 opacity-80'
          }`}
        >
          <div className="flex items-center justify-between text-[10px] mb-0.5">
            <span className="font-bold text-rose-400 flex items-center gap-1 truncate">
              🔴 {player2.name} {activePlayerId === 'p2' && '⭐'}
            </span>
            <span className="font-mono text-[9px] font-bold text-slate-200">
              {player2.hp}
            </span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-rose-600 to-amber-500 transition-all duration-300"
              style={{ width: `${p2HpPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Center Action Controls: Timer, Round Info, Action counter & End Turn */}
      <div className="my-auto py-1 text-center flex flex-col items-center justify-center gap-1.5 w-full max-w-[220px]">
        {/* Round & Action Status Badge */}
        <div className="flex items-center justify-between w-full text-[9px] font-mono text-slate-300 bg-slate-900/90 px-2 py-1 rounded-xl border border-slate-800">
          <span className="font-bold text-amber-400">
            ROUND {Math.ceil(turnNumber / 2)} • T{turnNumber}
          </span>
          <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
            ⚡ เหลือ {2 - turnActionsCount}/2 แอคชัน
          </span>
        </div>

        {/* 30-Second Turn Timer Bar */}
        <div
          className={`w-full p-1.5 rounded-xl border transition-all duration-200 flex flex-col gap-1 ${
            turnTimeRemaining <= 5
              ? 'bg-red-950/70 border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.5)] animate-pulse'
              : turnTimeRemaining <= 10
              ? 'bg-amber-950/60 border-amber-500/50 shadow-[0_0_8px_rgba(245,158,11,0.3)]'
              : 'bg-slate-900/80 border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between text-[9px] font-mono leading-none px-0.5">
            <span className="text-slate-300 flex items-center gap-1 font-bold text-[8.5px]">
              <Clock className={`w-3 h-3 ${turnTimeRemaining <= 5 ? 'text-red-400 animate-spin' : 'text-slate-400'}`} />
              <span>เวลาเทิร์น ({activePlayer.name.split(' ')[0]})</span>
            </span>

            <span
              className={`font-black font-cyber text-[10px] px-1.5 py-0.2 rounded ${
                turnTimeRemaining <= 5
                  ? 'bg-red-600 text-white animate-bounce shadow'
                  : turnTimeRemaining <= 10
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-cyan-300 font-bold'
              }`}
            >
              ⏱️ {turnTimeRemaining}s
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800/80">
            <div
              className={`h-full transition-all duration-300 ${
                turnTimeRemaining <= 5
                  ? 'bg-gradient-to-r from-red-600 to-rose-400 animate-pulse'
                  : turnTimeRemaining <= 10
                  ? 'bg-gradient-to-r from-amber-500 to-orange-400'
                  : 'bg-gradient-to-r from-blue-500 to-cyan-400'
              }`}
              style={{ width: `${Math.max(0, Math.min(100, (turnTimeRemaining / 30) * 100))}%` }}
            />
          </div>
        </div>

        {/* End Turn Button */}
        <button
          onClick={onEndTurn}
          className={`w-full py-1.5 px-3 rounded-xl font-black text-xs tracking-wide uppercase shadow-lg transition-all duration-150 flex items-center justify-center gap-1.5 ${
            activePlayerId === 'p1'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-900/40 hover:scale-102 active:scale-98'
              : 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-rose-900/40 hover:scale-102 active:scale-98'
          }`}
        >
          <RefreshCw className="w-3 h-3" /> จบเทิร์น ({activePlayerId === 'p1' ? 'P1' : 'P2'})
        </button>
      </div>

      {/* Bottom: Mini Live Combat Log */}
      <div className="w-full bg-slate-900/90 rounded-xl p-1 sm:p-1.5 border border-slate-800 text-[10px] shrink-0">
        <div className="flex items-center gap-1 text-slate-400 font-bold mb-0.5 text-[8px] sm:text-[9px]">
          <History className="w-2.5 h-2.5 text-amber-400" />
          <span>บันทึกการต่อสู้ (Log)</span>
        </div>
        <div className="space-y-0.5 max-h-10 sm:max-h-12 overflow-y-auto pr-0.5">
          {combatLogs.slice(0, 3).map((log) => (
            <div
              key={log.id}
              className={`px-1 py-0.2 rounded text-[8px] sm:text-[9px] leading-tight flex items-start gap-1 truncate ${
                log.player === 'p1' ? 'bg-blue-950/40 text-blue-200' : 'bg-rose-950/40 text-rose-200'
              }`}
            >
              <span className="font-mono text-[7px] sm:text-[8px] text-slate-500 shrink-0">T{log.turn}</span>
              <span className="truncate">{log.text}</span>
            </div>
          ))}
          {combatLogs.length === 0 && (
            <div className="text-slate-500 italic text-[8px] sm:text-[9px] text-center py-0.5">
              เริ่มเกม! จั่วการ์ดและวางลงช่อง 1-4
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
