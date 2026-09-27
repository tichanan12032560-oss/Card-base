import React from 'react';
import { X, Users, Ban, Link2, Sparkles, Flame, Shield, Swords, Layers } from 'lucide-react';

interface RulesGuideModalProps {
  onClose: () => void;
}

export const RulesGuideModal: React.FC<RulesGuideModalProps> = ({ onClose }) => {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-2xl w-full bg-slate-900 border-2 border-amber-500/60 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-amber-600 via-rose-600 to-indigo-600 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <span className="text-xl">📜</span>
            <h3 className="text-lg font-black font-cyber">
              กติกาการเล่น & ระบบ POWER REACTION (2 ผู้เล่น)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full bg-black/40 hover:bg-black/70 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-200">
          {/* Board Structure Layout */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <h4 className="font-bold text-amber-400 mb-2 flex items-center gap-1.5 font-cyber">
              <Layers className="w-4 h-4 text-amber-400" /> ผังสนามการเล่น (4 ช่องการ์ด)
            </h4>
            <div className="font-mono text-center text-xs text-slate-300 bg-slate-900/80 p-3 rounded-lg border border-slate-800 whitespace-pre">
{`              ┌─────────┐
              │  กองจั่ว │
              └─────────┘

┌──────────────┐        ┌──────────────┐
│   ช่องการ์ด  │        │   ช่องการ์ด  │
│      P1      │        │      P2      │ (ช่อง 1)
│      P1      │        │      P2      │ (ช่อง 2)
│      P1      │        │      P2      │ (ช่อง 3)
│      P1      │        │      P2      │ (ช่อง 4)
└──────────────┘        └──────────────┘`}
            </div>
            <p className="text-slate-400 text-xs mt-2 leading-relaxed">
              ผู้เล่นทั้งสองฝั่ง (P1 และ P2) มีช่องการ์ดแนวตั้ง 4 ช่อง สามารถเลือกจั่วการ์ดจากกองจั่วส่วนกลาง และวางการ์ดลงในช่องที่ว่างอยู่
            </p>
          </div>

          {/* Core Rules Section */}
          <div className="space-y-3">
            {/* Rule 1: Good Relations */}
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/50">
              <h4 className="font-bold text-emerald-400 flex items-center gap-1.5 text-sm mb-1">
                <Users className="w-4 h-4" /> 🤝 ความสัมพันธ์ดี / สู้ด้วยกันในเนื้อเรื่อง → เพิ่มพลังต่อสู้!
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                หากตัวละครในเรื่องเดียวกันมีความสัมพันธ์ที่ดี หรือมีฉากที่ร่วมสู้เคียงบ่าเคียงไหล่ เช่น <strong>Goku & Vegeta</strong>, <strong>Naruto & Sasuke</strong>, <strong>Luffy & Zoro</strong>, <strong>Deku & Bakugo</strong>, <strong>Gojo & Yuji</strong> เมื่ออยู่ติดกันจะได้รับบัฟ <span className="text-emerald-300 font-bold">ATK +25% และ DEF +20%</span>
              </p>
            </div>

            {/* Rule 2: Similar Abilities */}
            <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-500/50">
              <h4 className="font-bold text-blue-400 flex items-center gap-1.5 text-sm mb-1">
                <Link2 className="w-4 h-4" /> 🔗 ความสามารถคล้ายกัน ข้ามเรื่อง/ในเรื่อง → เพิ่มพลังต่อสู้!
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                ไม่ว่าตัวละครจะมาจากเรื่องเดียวกันหรือต่างเรื่องกัน หากมีลักษณะพลังคล้ายกัน ปฏิกิริยาพลังจะเพิ่มขึ้น:
              </p>
              <ul className="list-disc list-inside mt-1.5 space-y-1 text-xs text-slate-300">
                <li><strong>ผู้ใช้ดาบ (Swordsman):</strong> Zoro + Sasuke + Trunks + Yuta (+15% ATK, +15% DEF)</li>
                <li><strong>ดวงตาเนตรพิเศษ (Eye Power):</strong> Gojo (Six Eyes) + Sasuke (Sharingan/Rinnegan) + Kakashi (+15% ATK, +20% DEF)</li>
                <li><strong>สัตว์ร้าย/อสูรในร่าง (Inner Demon):</strong> Naruto (Kurama) + Yuji (Sukuna) (+20% ATK)</li>
                <li><strong>ธาตุเพลิง (Fire):</strong> Ace + Todoroki + Sanji + Sasuke + Sukuna + Bakugo (+18% ATK)</li>
                <li><strong>สายฟ้า (Lightning):</strong> Kakashi + Sasuke (+18% ATK)</li>
                <li><strong>หมัดเหล็ก/พละกำลัง (Martial Arts / Super Strength):</strong> Goku + All Might + Deku + Luffy (+16% ATK, +14% DEF)</li>
                <li><strong>พลังระดับพระเจ้า/จักรพรรดิ (God-tier):</strong> Goku + Gojo + Sukuna + Madara + Kaido (+22% ATK, +15% DEF)</li>
              </ul>
            </div>

            {/* Rule 3: Bad Relations */}
            <div className="p-3 rounded-xl bg-red-950/50 border-2 border-red-500/80">
              <h4 className="font-bold text-red-400 flex items-center gap-1.5 text-sm mb-1">
                <Ban className="w-4 h-4 text-red-400" /> ❌ ความสัมพันธ์แย่ / ศัตรูคู่อาฆาต → ห้ามวางติดกันเด็ดขาด!
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                หากตัวละครมีความสัมพันธ์บาดหมางหรือเป็นศัตรูคู่อาฆาต เช่น <strong>Goku & Frieza</strong>, <strong>Naruto & Madara</strong>, <strong>Luffy & Kaido</strong>, <strong>Gojo & Sukuna</strong>, <strong>Deku & Shigaraki</strong> ระบบจะ<span className="text-red-300 font-bold underline">ห้ามวางในช่องที่ติดกัน</span>โดยเด็ดขาด! หากพยายามวาง ระบบจะขึ้นเตือนและล็อกช่องนั้น
              </p>
            </div>

            {/* Rule 4: Normal */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <h4 className="font-bold text-slate-300 flex items-center gap-1.5 text-sm mb-1">
                ⚖️ ความสัมพันธ์เป็นกลาง / พลังไม่ตรงกัน
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                หากตัวละครไม่มีความสัมพันธ์พิเศษและไม่มีพลังที่คล้ายกัน ปฏิกิริยาพลังต่อสู้จะเท่าเดิมตามค่าสถานะพื้นฐานของการ์ด
              </p>
            </div>

            {/* Field Grid Rule: 2 Rows */}
            <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-500/40">
              <h4 className="font-bold text-blue-300 flex items-center gap-1.5 text-sm mb-1">
                <span>🛡️</span> สนามการ์ด 2 แถว (Front Row & Back Row)
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                สนามการ์ดแต่ละฝั่งแบ่งออกเป็น <strong>2 แถว (6 ช่อง)</strong>:
                <br />• <strong>🛡️ แถวหน้า (Front Row)</strong>: ช่อง 1, 2, 3 - ด่านหน้าปะทะและรับความเสียหายหลัก
                <br />• <strong>🏹 แถวหลัง (Back Row)</strong>: ช่อง 4, 5, 6 - ได้รับโบนัสป้องกัน <strong>DEF +15% (ตั้งรับแนวหลัง)</strong> เมื่อมีเพื่อนการ์ดอยู่ในแถวหน้าช่วยตั้งรับ!
              </p>
            </div>

            {/* Combat Actions & Authentic Anime Skill Mechanics */}
            <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30">
              <h4 className="font-bold text-amber-400 flex items-center gap-1.5 text-sm mb-1">
                <Flame className="w-4 h-4" /> ⚔️ สกิลตามต้นฉบับอนิเมะ (Anime Authentic Skills)
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                สกิลของตัวละครอ้างอิงพลังจากอนิเมะจริง:
                <br />• <strong>⚡ ขโมย Energy</strong>: ดูดเกจพลังงาน Energy จากศัตรูมาเพิ่มให้ตัวเอง (เช่น โกโจ, มาดาระ, คาคาชิ, ฟรีเซอร์, ชิการาคิ)
                <br />• <strong>⚔️ ยึดพลัง ATK</strong>: ดูดซับ/คัดลอกพลังโจมตีของเป้าหมายมาอัปเกรดตัวเองถาวร (เช่น สุคุนะ, ยูตะ, ก๊อปปี้นินจาคาคาชิ, ออลฟอร์วัน)
                <br />• <strong>💚 ดูดเลือด Lifesteal</strong>: ดูดพลังชีวิตฟื้นฟูตนเองจากความเสียหายที่ทำได้ (เช่น สุคุนะ, ลูฟี่เกียร์ 5, อิทาจิ, ไคโด)
                <br />• <strong>🗡️ ทะลวงเกราะ Armor Pierce</strong>: เมินพลังป้องกัน DEF ของศัตรู (เช่น ทรังคซ์, โซโร)
              </p>
            </div>

            {/* 2-Action Turn Limit Rule */}
            <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40">
              <h4 className="font-bold text-amber-300 flex items-center gap-1.5 text-sm mb-1">
                <span>⚡</span> ระบบเล่นได้ 2 ครั้งต่อเทิร์น (2 Actions / Turn)
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                ในแต่ละเทิร์น ผู้เล่นเล่นได้สูงสุด <strong>2 แอคชัน</strong> (วางการ์ด 1 ใบ = 1 แอคชัน, สั่งโจมตี/สกิล/ไม้ตาย = 1 แอคชัน) เช่น วางการ์ด 1 ครั้ง + โจมตี 1 ครั้ง หรือ วางการ์ด 2 ครั้ง หรือ โจมตี 2 ครั้ง เมื่อทำครบ 2 ครั้งแล้ว ระบบจะส่งต่อเทิร์นไปยังฝั่งตรงข้ามโดยอัตโนมัติ!
              </p>
            </div>

            {/* Turn Timer & Penalty Rule */}
            <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/40">
              <h4 className="font-bold text-indigo-400 flex items-center gap-1.5 text-sm mb-1">
                <span>⏱️</span> ระบบนับเวลาเทิร์น 30 วินาที & บทลงโทษเมื่อหมดเวลา
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                ผู้เล่นแต่ละคนมีเวลาตัดสินใจ <strong>30 วินาทีต่อเทิร์น</strong> หากเวลาหมดลง (0s) ระบบจะทำการกด <strong>จบเทิร์นให้อัตโนมัติ</strong> ทันที และจะถูกลงโทษโดยการ <strong>หัก HP ของผู้เล่นปัจจุบัน 5% (250 HP)</strong> จากพลังชีวิตทั้งหมด!
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition"
          >
            เข้าใจแล้ว พร้อมประลอง!
          </button>
        </div>
      </div>
    </div>
  );
};
