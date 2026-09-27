import React, { useState } from 'react';

interface AnimeAvatarProps {
  type: string;
  imageUrl?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const AnimeAvatar: React.FC<AnimeAvatarProps> = ({ type, imageUrl, className = '', size = 'md' }) => {
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-36 h-36',
  }[size];

  if (imageUrl && !imgError) {
    return (
      <div className={`relative flex items-center justify-center rounded-xl overflow-hidden shrink-0 shadow-lg ${sizeClasses} ${className}`}>
        <img
          src={imageUrl}
          alt={type}
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="w-full h-full object-cover rounded-xl"
        />
      </div>
    );
  }

  // Stylized Anime Character SVGs with signature silhouettes, auras, and emblems
  const renderAvatarContent = () => {
    switch (type) {
      case 'goku':
        return (
          <g>
            <circle cx="50" cy="50" r="48" fill="#ea580c" />
            {/* Super Saiyan Hair Silhouette */}
            <path
              d="M50 10 L62 28 L78 20 L72 38 L88 36 L76 52 L84 62 L66 62 L50 88 L34 62 L16 62 L24 52 L12 36 L28 38 L22 20 L38 28 Z"
              fill="#facc15"
              stroke="#ca8a04"
              strokeWidth="2"
            />
            {/* Kanji 悟 */}
            <circle cx="50" cy="54" r="16" fill="#ffffff" />
            <text x="50" y="60" fontSize="16" fontWeight="bold" textAnchor="middle" fill="#000">悟</text>
            <path d="M40 76 L50 68 L60 76 L50 86 Z" fill="#2563eb" />
          </g>
        );

      case 'vegeta':
        return (
          <g>
            <circle cx="50" cy="50" r="48" fill="#1e3a8a" />
            {/* Flame-shaped Saiyan hair */}
            <path
              d="M50 8 L58 24 L68 14 L68 32 L78 28 L72 44 L80 48 L64 56 L50 85 L36 56 L20 48 L28 44 L22 28 L32 32 L32 14 L42 24 Z"
              fill="#1e1b4b"
              stroke="#38bdf8"
              strokeWidth="2"
            />
            {/* Saiyan Armor Straps */}
            <rect x="36" y="52" width="28" height="28" rx="4" fill="#ffffff" stroke="#eab308" strokeWidth="2.5" />
            <circle cx="50" cy="66" r="6" fill="#3b82f6" />
          </g>
        );

      case 'frieza':
        return (
          <g>
            <circle cx="50" cy="50" r="48" fill="#581c87" />
            {/* Head Crest */}
            <ellipse cx="50" cy="42" rx="26" ry="24" fill="#facc15" />
            <ellipse cx="50" cy="38" rx="14" ry="10" fill="#a855f7" />
            {/* Imperial Horns */}
            <path d="M26 38 Q18 20 30 18 Q34 26 36 34 Z" fill="#4c1d95" />
            <path d="M74 38 Q82 20 70 18 Q66 26 64 34 Z" fill="#4c1d95" />
            {/* Eyes */}
            <circle cx="42" cy="48" r="3" fill="#dc2626" />
            <circle cx="58" cy="48" r="3" fill="#dc2626" />
            {/* Golden body */}
            <path d="M30 70 L50 64 L70 70 L64 90 L36 90 Z" fill="#eab308" />
          </g>
        );

      case 'trunks':
        return (
          <g>
            <circle cx="50" cy="50" r="48" fill="#312e81" />
            {/* Lavender Hair */}
            <path d="M30 20 Q50 10 70 20 Q78 40 70 60 Q50 62 30 60 Q22 40 30 20 Z" fill="#c084fc" />
            {/* Sword Sheath on Back */}
            <line x1="22" y1="80" x2="78" y2="20" stroke="#f59e0b" strokeWidth="6" strokeLinecap="round" />
            <line x1="22" y1="80" x2="78" y2="20" stroke="#94a3b8" strokeWidth="3" />
            {/* Jacket */}
            <rect x="36" y="55" width="28" height="25" rx="3" fill="#3b82f6" />
            <circle cx="50" cy="67" r="5" fill="#facc15" />
          </g>
        );

      case 'naruto':
        return (
          <g>
            <circle cx="50" cy="50" r="48" fill="#ea580c" />
            {/* Yellow Spiky Hair */}
            <path
              d="M50 14 L58 26 L70 20 L66 34 L80 34 L70 46 L78 54 L62 54 L50 82 L38 54 L22 54 L30 46 L20 34 L34 34 L30 20 L42 26 Z"
              fill="#fbbf24"
            />
            {/* Leaf Headband */}
            <rect x="26" y="38" width="48" height="14" rx="2" fill="#1e293b" />
            <rect x="38" y="40" width="24" height="10" rx="1" fill="#cbd5e1" />
            {/* Leaf Symbol */}
            <circle cx="50" cy="45" r="3" fill="none" stroke="#0f172a" strokeWidth="1.5" />
            {/* Whisker marks */}
            <line x1="32" y1="58" x2="40" y2="58" stroke="#78350f" strokeWidth="1.5" />
            <line x1="32" y1="62" x2="40" y2="62" stroke="#78350f" strokeWidth="1.5" />
            <line x1="60" y1="58" x2="68" y2="58" stroke="#78350f" strokeWidth="1.5" />
            <line x1="60" y1="62" x2="68" y2="62" stroke="#78350f" strokeWidth="1.5" />
          </g>
        );

      case 'sasuke':
        return (
          <g>
            <circle cx="50" cy="50" r="48" fill="#1e1b4b" />
            {/* Spiky Black / Navy hair */}
            <path
              d="M50 14 L62 26 L74 22 L68 38 L82 44 L66 52 L50 80 L34 52 L18 44 L32 38 L26 22 L38 26 Z"
              fill="#0f172a"
              stroke="#6366f1"
              strokeWidth="1.5"
            />
            {/* Sharingan (Right eye red) & Rinnegan (Left eye purple) */}
            <circle cx="40" cy="48" r="5" fill="#dc2626" />
            <circle cx="40" cy="48" r="2" fill="#000" />
            <circle cx="60" cy="48" r="5" fill="#a855f7" />
            <circle cx="60" cy="48" r="3" fill="none" stroke="#4c1d95" strokeWidth="0.8" />
            {/* Uchiha crest */}
            <circle cx="50" cy="72" r="8" fill="#ef4444" />
            <path d="M42 72 Q50 64 58 72 L50 82 Z" fill="#ffffff" />
          </g>
        );

      case 'kakashi':
        return (
          <g>
            <circle cx="50" cy="50" r="48" fill="#0f172a" />
            {/* Silver Hair tilted */}
            <path
              d="M44 10 L56 22 L72 16 L66 32 L82 34 L68 46 L76 56 L58 52 L46 76 L36 50 L24 48 L32 36 L24 26 L38 28 Z"
              fill="#e2e8f0"
            />
            {/* Tilted Headband over left eye */}
            <rect x="28" y="36" width="46" height="12" rx="2" fill="#1e293b" transform="rotate(-6 50 42)" />
            {/* Right eye visible (curved smile/cool) */}
            <circle cx="40" cy="48" r="3" fill="#000" />
            {/* Dark Mask covering lower face */}
            <path d="M30 54 Q50 64 70 54 L66 84 Q50 90 34 84 Z" fill="#1e293b" />
          </g>
        );

      case 'madara':
        return (
          <g>
            <circle cx="50" cy="50" r="48" fill="#450a0a" />
            {/* Long Spiky Black Mane */}
            <path
              d="M50 10 L64 22 L78 18 L72 36 L88 42 L72 58 L84 76 L62 66 L50 92 L38 66 L16 76 L28 58 L12 42 L28 36 L22 18 L36 22 Z"
              fill="#0a0a0a"
            />
            {/* Red Samurai Armor */}
            <rect x="32" y="56" width="36" height="30" rx="3" fill="#dc2626" stroke="#7f1d1d" strokeWidth="2" />
            {/* Eternal Mangekyo / Rinnegan Red eyes */}
            <circle cx="42" cy="46" r="4" fill="#ef4444" />
            <circle cx="58" cy="46" r="4" fill="#a855f7" />
          </g>
        );

      case 'itachi':
        return (
          <g>
            <circle cx="50" cy="50" r="48" fill="#18181b" />
            {/* Dark Hair with bangs */}
            <path d="M30 20 Q50 8 70 20 Q78 45 66 60 Q50 62 34 60 Q22 45 30 20 Z" fill="#09090b" />
            {/* Akatsuki Red Cloud */}
            <path
              d="M42 68 Q40 60 48 60 Q52 56 58 60 Q66 60 66 68 Q66 74 58 74 L42 74 Q36 74 36 68 Z"
              fill="#dc2626"
              stroke="#ffffff"
              strokeWidth="1"
            />
            {/* Sharingan Eyes */}
            <circle cx="42" cy="44" r="3.5" fill="#ef4444" />
            <circle cx="58" cy="44" r="3.5" fill="#ef4444" />
          </g>
        );

      case 'luffy':
        return (
          <g>
            <circle cx="50" cy="50" r="48" fill="#dc2626" />
            {/* Straw Hat */}
            <ellipse cx="50" cy="32" rx="36" ry="12" fill="#eab308" stroke="#ca8a04" strokeWidth="2" />
            <ellipse cx="50" cy="28" rx="20" ry="14" fill="#eab308" />
            <rect x="31" y="27" width="38" height="6" fill="#dc2626" />
            {/* Grinning face & eye scar */}
            <circle cx="50" cy="54" r="16" fill="#fed7aa" />
            <circle cx="44" cy="50" r="3" fill="#000" />
            <circle cx="56" cy="50" r="3" fill="#000" />
            <path d="M42 56 L46 56" stroke="#991b1b" strokeWidth="1.5" />
            <path d="M42 62 Q50 72 58 62" stroke="#000" strokeWidth="2" fill="#fff" />
            {/* Gear 5 Smoke Scarf */}
            <path d="M22 66 Q50 48 78 66" fill="none" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
          </g>
        );

      case 'zoro':
        return (
          <g>
            <circle cx="50" cy="50" r="48" fill="#065f46" />
            {/* Green Cropped Hair */}
            <ellipse cx="50" cy="36" rx="22" ry="16" fill="#10b981" />
            {/* Face & Left eye scar */}
            <circle cx="50" cy="52" r="15" fill="#fed7aa" />
            <circle cx="44" cy="50" r="3" fill="#000" />
            {/* Left scarred eye */}
            <line x1="56" y1="44" x2="56" y2="56" stroke="#000" strokeWidth="2" />
            {/* 3 Gold Earrings */}
            <circle cx="68" cy="54" r="2.5" fill="#facc15" />
            <circle cx="68" cy="58" r="2.5" fill="#facc15" />
            <circle cx="68" cy="62" r="2.5" fill="#facc15" />
            {/* Three Swords silhouette */}
            <line x1="20" y1="84" x2="80" y2="24" stroke="#94a3b8" strokeWidth="2.5" />
            <line x1="24" y1="88" x2="84" y2="28" stroke="#94a3b8" strokeWidth="2.5" />
          </g>
        );

      case 'sanji':
        return (
          <g>
            <circle cx="50" cy="50" r="48" fill="#78350f" />
            {/* Blonde Hair parting over eye */}
            <path d="M30 24 Q50 14 70 24 Q68 50 48 56 Q30 50 30 24 Z" fill="#fde047" />
            {/* Face */}
            <circle cx="50" cy="54" r="14" fill="#fed7aa" />
            <circle cx="56" cy="50" r="3" fill="#000" />
            {/* Swirly Eyebrow */}
            <path d="M54 44 Q58 42 62 44 Q64 45 62 46" fill="none" stroke="#000" strokeWidth="1.5" />
            {/* Cigarette */}
            <line x1="52" y1="62" x2="42" y2="66" stroke="#ffffff" strokeWidth="2" />
            <circle cx="41" cy="66" r="1.5" fill="#ef4444" />
            {/* Blue Flame Leg Spark */}
            <circle cx="70" cy="74" r="6" fill="#38bdf8" />
          </g>
        );

      case 'kaido':
        return (
          <g>
            <circle cx="50" cy="50" r="48" fill="#312e81" />
            {/* Giant Horns */}
            <path d="M26 40 Q8 10 32 16 Q36 28 34 38 Z" fill="#f8fafc" stroke="#64748b" strokeWidth="1.5" />
            <path d="M74 40 Q92 10 68 16 Q64 28 66 38 Z" fill="#f8fafc" stroke="#64748b" strokeWidth="1.5" />
            {/* Wild Hair & Beard */}
            <path d="M28 34 Q50 20 72 34 Q82 60 74 86 Q50 94 26 86 Q18 60 28 34 Z" fill="#0f172a" />
            {/* Glowing Red Eyes */}
            <circle cx="42" cy="48" r="3" fill="#ef4444" />
            <circle cx="58" cy="48" r="3" fill="#ef4444" />
            {/* Dragon Scale Flame */}
            <circle cx="50" cy="72" r="8" fill="#dc2626" />
          </g>
        );

      case 'ace':
        return (
          <g>
            <circle cx="50" cy="50" r="48" fill="#c2410c" />
            {/* Orange Hat with Badges */}
            <ellipse cx="50" cy="34" rx="34" ry="12" fill="#ea580c" />
            <circle cx="42" cy="32" r="3" fill="#ef4444" />
            <circle cx="58" cy="32" r="3" fill="#3b82f6" />
            {/* Freckled face */}
            <circle cx="50" cy="52" r="15" fill="#fed7aa" />
            <circle cx="44" cy="50" r="2.5" fill="#000" />
            <circle cx="56" cy="50" r="2.5" fill="#000" />
            {/* Flames */}
            <path d="M30 76 Q50 62 70 76 L62 90 L38 90 Z" fill="#f97316" />
          </g>
        );

      case 'gojo':
        return (
          <g>
            <circle cx="50" cy="50" r="48" fill="#0891b2" />
            {/* White Spiky Hair */}
            <path
              d="M50 12 L58 24 L72 18 L68 34 L82 38 L68 50 L78 62 L60 56 L50 82 L40 56 L22 62 L32 50 L18 38 L32 34 L28 18 L42 24 Z"
              fill="#f8fafc"
              stroke="#e2e8f0"
              strokeWidth="1.5"
            />
            {/* Dark Mask / Blindfold */}
            <rect x="28" y="38" width="44" height="18" rx="3" fill="#0f172a" />
            {/* Six Eyes Infinite Blue Aura peeking out */}
            <ellipse cx="38" cy="47" rx="4" ry="3" fill="#38bdf8" />
            <ellipse cx="62" cy="47" rx="4" ry="3" fill="#38bdf8" />
            {/* Limitless Infinity Kanji */}
            <text x="50" y="78" fontSize="11" fontWeight="bold" textAnchor="middle" fill="#ffffff">無限</text>
          </g>
        );

      case 'sukuna':
        return (
          <g>
            <circle cx="50" cy="50" r="48" fill="#881337" />
            {/* Pinkish Spiky Hair */}
            <path
              d="M50 14 L60 26 L74 20 L68 36 L80 40 L68 52 L50 80 L32 52 L20 40 L32 36 L26 20 L40 26 Z"
              fill="#fb7185"
            />
            {/* Cursed Markings */}
            <circle cx="50" cy="52" r="16" fill="#fed7aa" />
            {/* 4 eyes markings */}
            <circle cx="42" cy="46" r="2.5" fill="#dc2626" />
            <circle cx="58" cy="46" r="2.5" fill="#dc2626" />
            <line x1="40" y1="52" x2="44" y2="52" stroke="#000" strokeWidth="2" />
            <line x1="56" y1="52" x2="60" y2="52" stroke="#000" strokeWidth="2" />
            {/* Forehead and cheek tribal tattoos */}
            <circle cx="50" cy="40" r="3" fill="#000" />
            <path d="M42 62 Q50 68 58 62" stroke="#000" strokeWidth="2" fill="none" />
          </g>
        );

      case 'yuji':
        return (
          <g>
            <circle cx="50" cy="50" r="48" fill="#be123c" />
            {/* Pink and dark undercut hair */}
            <path d="M30 24 Q50 14 70 24 Q76 46 64 56 Q50 60 36 56 Q24 46 30 24 Z" fill="#fb7185" />
            {/* Athletic face */}
            <circle cx="50" cy="52" r="15" fill="#fed7aa" />
            <circle cx="44" cy="50" r="3" fill="#991b1b" />
            <circle cx="56" cy="50" r="3" fill="#991b1b" />
            {/* Black Flash Lightning around fist */}
            <path d="M40 70 L50 64 L52 74 L62 66" stroke="#000" strokeWidth="2.5" fill="none" />
            <path d="M40 70 L50 64 L52 74 L62 66" stroke="#ef4444" strokeWidth="1.2" fill="none" />
          </g>
        );

      case 'megumi':
        return (
          <g>
            <circle cx="50" cy="50" r="48" fill="#1e293b" />
            {/* Spiky Dark Hair pointing outwards */}
            <path
              d="M50 12 L56 24 L72 16 L66 32 L84 36 L68 46 L80 58 L60 54 L50 80 L40 54 L20 58 L32 46 L16 36 L34 32 L28 16 L44 24 Z"
              fill="#0f172a"
            />
            {/* Shadow Puppets Hands Silhouette */}
            <circle cx="50" cy="52" r="15" fill="#fed7aa" />
            <circle cx="44" cy="50" r="2.5" fill="#0284c7" />
            <circle cx="56" cy="50" r="2.5" fill="#0284c7" />
            {/* Shadow Hound silhouette */}
            <path d="M42 66 L50 58 L58 66 L50 78 Z" fill="#020617" />
          </g>
        );

      case 'yuta':
        return (
          <g>
            <circle cx="50" cy="50" r="48" fill="#0369a1" />
            {/* Dark Hair with white jujutsu uniform */}
            <path d="M32 20 Q50 12 68 20 Q74 44 64 56 Q50 58 36 56 Q26 44 32 20 Z" fill="#1e293b" />
            <circle cx="50" cy="50" r="15" fill="#fed7aa" />
            <circle cx="44" cy="48" r="2.5" fill="#0369a1" />
            <circle cx="56" cy="48" r="2.5" fill="#0369a1" />
            {/* Engagement Ring / Rika glow */}
            <circle cx="50" cy="68" r="6" fill="none" stroke="#38bdf8" strokeWidth="2.5" />
            <circle cx="50" cy="68" r="3" fill="#f8fafc" />
          </g>
        );

      case 'deku':
        return (
          <g>
            <circle cx="50" cy="50" r="48" fill="#065f46" />
            {/* Messy Green Hair */}
            <path
              d="M50 14 L62 26 L76 22 L70 38 L84 44 L68 54 L50 82 L32 54 L16 44 L30 38 L24 22 L38 26 Z"
              fill="#10b981"
            />
            {/* Freckled Face */}
            <circle cx="50" cy="52" r="15" fill="#fed7aa" />
            <circle cx="44" cy="48" r="3" fill="#047857" />
            <circle cx="56" cy="48" r="3" fill="#047857" />
            {/* Freckles 4 dots on each cheek */}
            <circle cx="42" cy="55" r="1" fill="#78350f" />
            <circle cx="45" cy="56" r="1" fill="#78350f" />
            <circle cx="55" cy="56" r="1" fill="#78350f" />
            <circle cx="58" cy="55" r="1" fill="#78350f" />
            {/* One For All Green Lightning discharge */}
            <path d="M26 64 L34 58 L32 68 L42 62" stroke="#34d399" strokeWidth="2" fill="none" />
            <path d="M74 64 L66 58 L68 68 L58 62" stroke="#34d399" strokeWidth="2" fill="none" />
          </g>
        );

      case 'allmight':
        return (
          <g>
            <circle cx="50" cy="50" r="48" fill="#1e3a8a" />
            {/* Two Blonde Antennas Hair */}
            <path d="M40 24 L34 8 L44 18 Z" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
            <path d="M60 24 L66 8 L56 18 Z" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
            <ellipse cx="50" cy="38" rx="22" ry="16" fill="#facc15" />
            {/* Gigantic Hero Smile */}
            <circle cx="50" cy="52" r="16" fill="#fed7aa" />
            {/* Shaded sunken hero eyes */}
            <rect x="36" y="44" width="10" height="6" rx="2" fill="#0f172a" />
            <rect x="54" y="44" width="10" height="6" rx="2" fill="#0f172a" />
            <circle cx="41" cy="47" r="1.5" fill="#38bdf8" />
            <circle cx="59" cy="47" r="1.5" fill="#38bdf8" />
            <path d="M38 58 Q50 68 62 58" stroke="#000" strokeWidth="2.5" fill="#ffffff" />
          </g>
        );

      case 'bakugo':
        return (
          <g>
            <circle cx="50" cy="50" r="48" fill="#c2410c" />
            {/* Spiky Explosive Ash Blonde Hair */}
            <path
              d="M50 10 L58 24 L74 16 L70 34 L88 38 L72 50 L84 64 L62 58 L50 88 L38 58 L16 64 L28 50 L12 38 L30 34 L26 16 L42 24 Z"
              fill="#fde047"
            />
            {/* Fierce Red Eyes */}
            <circle cx="50" cy="52" r="15" fill="#fed7aa" />
            <circle cx="44" cy="48" r="3" fill="#dc2626" />
            <circle cx="56" cy="48" r="3" fill="#dc2626" />
            <path d="M42 60 Q50 56 58 60" stroke="#000" strokeWidth="2" fill="none" />
            {/* Grenade Pin motif */}
            <circle cx="50" cy="74" r="6" fill="#15803d" />
          </g>
        );

      case 'todoroki':
        return (
          <g>
            <circle cx="50" cy="50" r="48" fill="#0369a1" />
            {/* Half White (Right), Half Red (Left) Hair */}
            <path d="M32 20 Q50 10 50 58 Q34 56 32 20 Z" fill="#f8fafc" />
            <path d="M50 20 Q68 10 68 58 Q50 56 50 20 Z" fill="#ef4444" />
            {/* Burn Scar on Left Eye */}
            <circle cx="50" cy="52" r="15" fill="#fed7aa" />
            <circle cx="58" cy="50" r="7" fill="#dc2626" opacity="0.4" />
            {/* Heterochromia: Grey eye right, Turquoise left */}
            <circle cx="44" cy="50" r="2.5" fill="#64748b" />
            <circle cx="58" cy="50" r="2.5" fill="#06b6d4" />
          </g>
        );

      case 'shigaraki':
        return (
          <g>
            <circle cx="50" cy="50" r="48" fill="#4c1d95" />
            {/* Pale Disheveled Hair */}
            <path
              d="M50 14 L62 26 L76 22 L72 38 L86 46 L70 56 L50 84 L30 56 L14 46 L28 38 L24 22 L38 26 Z"
              fill="#cbd5e1"
            />
            {/* Pale Face & Piercing Crimson Eyes */}
            <circle cx="50" cy="52" r="15" fill="#e2e8f0" />
            <circle cx="44" cy="48" r="2.5" fill="#ef4444" />
            <circle cx="56" cy="48" r="2.5" fill="#ef4444" />
            {/* Disembodied hand clasping face/neck motif */}
            <path d="M38 62 Q50 72 62 62 L58 76 L42 76 Z" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1" />
          </g>
        );

      default:
        return (
          <g>
            <circle cx="50" cy="50" r="48" fill="#3b82f6" />
            <text x="50" y="58" fontSize="24" textAnchor="middle" fill="#fff">🎴</text>
          </g>
        );
    }
  };

  return (
    <div className={`relative flex items-center justify-center rounded-xl overflow-hidden shrink-0 shadow-lg ${sizeClasses} ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow">
        {renderAvatarContent()}
      </svg>
    </div>
  );
};
