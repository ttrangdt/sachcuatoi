import React, { useEffect, useState } from 'react';

export type RoomMood = 'morning' | 'golden' | 'evening';

/** Detect natural lighting mood from user's local clock */
export function getLocalTimeMood(): RoomMood {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 15) return 'morning';
  if (hour >= 15 && hour < 19) return 'golden';
  return 'evening';
}

export const MOOD_LABELS: Record<RoomMood, string> = {
  morning: 'Bình minh trong trẻo',
  golden: 'Hoàng hôn mật ong',
  evening: 'Đêm sao lấp lánh',
};

const BOKEH_ORBS = [
  { left: '5%', top: '14%', size: 46, delay: '0s', dur: '14s' },
  { left: '13%', top: '34%', size: 28, delay: '2.2s', dur: '11s' },
  { left: '22%', top: '12%', size: 36, delay: '1.1s', dur: '13s' },
  { left: '78%', top: '16%', size: 42, delay: '0.6s', dur: '15s' },
  { left: '88%', top: '32%', size: 30, delay: '3.1s', dur: '12s' },
  { left: '93%', top: '14%', size: 24, delay: '1.8s', dur: '10s' },
  { left: '8%', top: '66%', size: 34, delay: '2.8s', dur: '13.5s' },
  { left: '86%', top: '64%', size: 38, delay: '0.9s', dur: '14.5s' },
];

const SPARKLE_MOTES = [
  { left: '4%', top: '20%', size: 6, delay: '0s', dur: '9.5s' },
  { left: '10%', top: '48%', size: 5, delay: '1.4s', dur: '11.5s' },
  { left: '17%', top: '28%', size: 7.5, delay: '2.6s', dur: '13s' },
  { left: '24%', top: '62%', size: 5.5, delay: '0.8s', dur: '10.5s' },
  { left: '34%', top: '15%', size: 6, delay: '3.2s', dur: '12s' },
  { left: '48%', top: '12%', size: 5, delay: '1.9s', dur: '11s' },
  { left: '64%', top: '16%', size: 6.5, delay: '0.4s', dur: '12.5s' },
  { left: '75%', top: '26%', size: 7, delay: '2.1s', dur: '13.5s' },
  { left: '83%', top: '44%', size: 5.5, delay: '3.8s', dur: '10s' },
  { left: '91%', top: '22%', size: 6.5, delay: '1.2s', dur: '11.5s' },
  { left: '95%', top: '58%', size: 5, delay: '2.9s', dur: '10.5s' },
  { left: '7%', top: '78%', size: 6, delay: '0.7s', dur: '12s' },
  { left: '89%', top: '76%', size: 6.5, delay: '1.7s', dur: '13s' },
  { left: '19%', top: '82%', size: 4.5, delay: '3.5s', dur: '11s' },
];

const NIGHT_STARS = [
  [4, 8, 2.2, 0],
  [9, 18, 1.8, 0.5],
  [14, 11, 2.8, 1.1],
  [19, 26, 1.6, 1.8],
  [26, 9, 2.4, 0.3],
  [33, 19, 1.8, 2.1],
  [42, 7, 2.2, 0.9],
  [52, 11, 1.7, 1.4],
  [61, 8, 2.6, 0.2],
  [69, 16, 1.9, 1.9],
  [76, 9, 2.5, 0.7],
  [82, 22, 1.8, 2.4],
  [88, 11, 2.8, 0.4],
  [94, 19, 2.1, 1.3],
  [96, 33, 1.6, 2.2],
  [6, 36, 2.0, 1.6],
  [12, 54, 1.7, 0.8],
  [91, 48, 2.2, 1.5],
  [85, 38, 1.6, 0.6],
  [3, 62, 2.0, 2.0],
];

const FLOATING_PETALS = [
  { left: '8%', delay: '0s', dur: '13s', color: '#FFD6E0' },
  { left: '22%', delay: '3.2s', dur: '15s', color: '#FFF4C8' },
  { left: '78%', delay: '1.8s', dur: '14s', color: '#FFDDE6' },
  { left: '90%', delay: '4.5s', dur: '12.5s', color: '#E2F5E9' },
  { left: '14%', delay: '6.1s', dur: '16s', color: '#FFE4C4' },
  { left: '84%', delay: '7.4s', dur: '13.5s', color: '#FFD6E0' },
];

interface AmbientRoomEffectsProps {
  mood: RoomMood;
  parallax: { x: number; y: number };
}

/**
 * Luminous, shimmering, storybook-vivid Morning / Golden Sunset / Starlight Night environment
 * with orbiting Sun/Moon, twinkling starfield, shooting stars, drifting clouds, bokeh, petals & fireflies.
 */
export const AmbientRoomEffects: React.FC<AmbientRoomEffectsProps> = ({
  mood,
  parallax,
}) => {
  const isMorning = mood === 'morning';
  const isGolden = mood === 'golden';
  const isEvening = mood === 'evening';

  const moteColor = isEvening
    ? 'rgba(255, 226, 122, 0.96)'
    : isGolden
      ? 'rgba(255, 206, 118, 0.94)'
      : 'rgba(255, 255, 245, 0.96)';

  const bokehColor = isEvening
    ? 'radial-gradient(circle, rgba(255, 222, 134, 0.36) 0%, rgba(168, 138, 255, 0.14) 55%, transparent 75%)'
    : isGolden
      ? 'radial-gradient(circle, rgba(255, 224, 146, 0.45) 0%, rgba(255, 162, 114, 0.16) 55%, transparent 75%)'
      : 'radial-gradient(circle, rgba(255, 255, 244, 0.56) 0%, rgba(174, 238, 222, 0.18) 55%, transparent 75%)';

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* 1. Luminous Painted Sky & Wall Gradient */}
      <div
        className="absolute inset-0 transition-all duration-1000"
        style={{
          background: isEvening
            ? 'radial-gradient(ellipse 80% 58% at 80% 14%, rgba(124, 96, 214, 0.34) 0%, transparent 62%), radial-gradient(ellipse 75% 55% at 18% 75%, rgba(62, 84, 168, 0.25) 0%, transparent 68%), linear-gradient(180deg, #090d20 0%, #141836 48%, #1d1633 100%)'
            : isGolden
              ? 'radial-gradient(ellipse 82% 60% at 16% 24%, rgba(255, 226, 148, 0.95) 0%, transparent 60%), radial-gradient(ellipse 72% 58% at 86% 18%, rgba(232, 136, 152, 0.65) 0%, transparent 66%), linear-gradient(180deg, #745b8f 0%, #df8d74 42%, #f8c892 78%, #d48a6a 100%)'
              : 'radial-gradient(ellipse 85% 60% at 16% 10%, rgba(255, 252, 228, 0.96) 0%, transparent 60%), radial-gradient(ellipse 70% 58% at 86% 16%, rgba(168, 232, 224, 0.78) 0%, transparent 66%), linear-gradient(180deg, #bfe7ef 0%, #dff5ee 45%, #f6efe6 100%)',
        }}
      />

      {/* 2. Celestial Bodies (Orbiting Sun / Golden Setting Sun / Glowing Crescent Moon) */}
      <div
        className="absolute inset-0 transition-transform duration-500 ease-out"
        style={{
          transform: `translate3d(${parallax.x * -10}px, ${parallax.y * -6}px, 0)`,
        }}
      >
        {/* Morning Radiant Sun (Top-Left) */}
        <div
          className={`absolute top-8 left-10 sm:left-16 transition-all duration-1000 ${
            isMorning
              ? 'translate-y-0 scale-100 opacity-100'
              : '-translate-y-24 scale-75 opacity-0'
          }`}
        >
          <div className="celestial-pulse relative h-24 w-24 sm:h-28 sm:w-28 rounded-full bg-gradient-to-br from-[#FFFDF0] via-[#FFF1B5] to-[#FFD878] shadow-[0_0_70px_28px_rgba(255,244,188,0.85)]" />
        </div>

        {/* Golden Hour Glowing Setting Sun (Mid-Left Horizon) */}
        <div
          className={`absolute top-24 left-8 sm:left-14 transition-all duration-1000 ${
            isGolden
              ? 'translate-y-0 scale-100 opacity-100'
              : 'translate-y-28 scale-75 opacity-0'
          }`}
        >
          <div className="celestial-pulse relative h-28 w-28 sm:h-36 sm:w-36 rounded-full bg-gradient-to-b from-[#FFF2B2] via-[#FFB35C] to-[#EA6A47] shadow-[0_0_95px_36px_rgba(255,178,94,0.78)]" />
        </div>

        {/* Enchanted Starlight Crescent Moon (Top-Right) */}
        <div
          className={`absolute top-10 right-10 sm:right-20 transition-all duration-1000 ${
            isEvening
              ? 'translate-y-0 scale-100 opacity-100'
              : '-translate-y-20 scale-75 opacity-0'
          }`}
        >
          <svg
            viewBox="0 0 110 110"
            className="celestial-pulse h-24 w-24 sm:h-28 sm:w-28 drop-shadow-[0_0_32px_rgba(255,236,158,0.82)]"
            aria-hidden="true"
          >
            <path
              d="M68 14 A38 38 0 1 0 94 76 A30 30 0 1 1 68 14 Z"
              fill="#FFF4C2"
            />
          </svg>
        </div>
      </div>

      {/* 3. Soft Drifting Clouds (Morning & Golden Hour) */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ${
          isEvening ? 'opacity-15' : 'opacity-80'
        }`}
      >
        <div
          className="cloud-drift absolute top-14 -left-24 h-16 w-64 rounded-full blur-xl"
          style={{
            background: isGolden
              ? 'linear-gradient(90deg, transparent, rgba(255, 198, 146, 0.72), transparent)'
              : 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.85), transparent)',
            animationDuration: '34s',
          }}
        />
        <div
          className="cloud-drift absolute top-28 -left-32 h-20 w-80 rounded-full blur-2xl"
          style={{
            background: isGolden
              ? 'linear-gradient(90deg, transparent, rgba(244, 152, 134, 0.58), transparent)'
              : 'linear-gradient(90deg, transparent, rgba(246, 255, 252, 0.75), transparent)',
            animationDuration: '46s',
            animationDelay: '-14s',
          }}
        />
        <div
          className="cloud-drift absolute top-8 -left-20 h-14 w-56 rounded-full blur-xl"
          style={{
            background: isGolden
              ? 'linear-gradient(90deg, transparent, rgba(255, 224, 158, 0.65), transparent)'
              : 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.78), transparent)',
            animationDuration: '40s',
            animationDelay: '-22s',
          }}
        />
      </div>

      {/* 4. Twinkling Night Starfield & Periodic Shooting Stars (Sao băng!) */}
      {isEvening && (
        <div className="absolute inset-0">
          {NIGHT_STARS.map(([left, top, size, delay], i) => (
            <span
              key={i}
              className="sparkle-blink absolute rounded-full bg-[#FFF8DC]"
              style={{
                left: `${left}%`,
                top: `${top}%`,
                width: `${size * 2}px`,
                height: `${size * 2}px`,
                boxShadow: `0 0 ${size * 4.5}px rgba(255, 240, 178, 0.9)`,
                animationDelay: `${delay}s`,
              }}
            />
          ))}

          {/* Shooting Star 1 */}
          <span
            className="shooting-star absolute top-[12%] left-[72%]"
            style={{ animationDelay: '1.5s', animationDuration: '6.5s' }}
          />
          {/* Shooting Star 2 */}
          <span
            className="shooting-star absolute top-[22%] left-[28%]"
            style={{ animationDelay: '4.8s', animationDuration: '8.2s' }}
          />
        </div>
      )}

      {/* 5. Shimmering Diagonal God-Rays / Twilight Beams with Parallax */}
      <div
        className="ray-shimmer absolute -inset-12 transition-all duration-1000"
        style={{
          transform: `translate3d(${parallax.x * 16}px, ${parallax.y * 10}px, 0)`,
          background: isEvening
            ? 'radial-gradient(circle 540px at 50% 14%, rgba(255, 206, 118, 0.2) 0%, transparent 72%), linear-gradient(124deg, rgba(168, 146, 255, 0.14) 0%, transparent 32%, rgba(255, 214, 134, 0.12) 52%, transparent 72%)'
            : isGolden
              ? 'linear-gradient(112deg, rgba(255, 232, 152, 0.72) 0%, rgba(255, 172, 92, 0.34) 22%, transparent 36%, rgba(255, 214, 132, 0.48) 50%, transparent 66%, rgba(255, 190, 118, 0.28) 80%, transparent 94%)'
              : 'linear-gradient(118deg, rgba(255, 255, 248, 0.8) 0%, rgba(255, 252, 232, 0.32) 20%, transparent 34%, rgba(226, 255, 248, 0.46) 48%, transparent 62%, rgba(255, 254, 240, 0.32) 78%, transparent 92%)',
        }}
      />

      {/* 6. Soft Luminous Bokeh Light Orbs */}
      {BOKEH_ORBS.map((orb, idx) => (
        <span
          key={idx}
          className="bokeh-float absolute rounded-full blur-[2px]"
          style={{
            left: orb.left,
            top: orb.top,
            width: `${orb.size}px`,
            height: `${orb.size}px`,
            background: bokehColor,
            animationDelay: orb.delay,
            animationDuration: orb.dur,
          }}
        />
      ))}

      {/* 7. Drifting Petals / Sunlit Blossoms in Morning & Golden Hour */}
      {!isEvening &&
        FLOATING_PETALS.map((p, idx) => (
          <span
            key={idx}
            className="petal-drift absolute -top-6 h-2.5 w-3.5 rounded-tl-full rounded-br-full opacity-80 shadow-xs"
            style={{
              left: p.left,
              backgroundColor: isGolden ? '#FFD29D' : p.color,
              animationDelay: p.delay,
              animationDuration: p.dur,
            }}
          />
        ))}

      {/* 8. Shimmering Fairy Dust / Glowing Golden Fireflies */}
      {SPARKLE_MOTES.map((m, idx) => (
        <span
          key={idx}
          className={`absolute rounded-full ${
            isEvening ? 'firefly-drift' : 'sun-mote'
          }`}
          style={{
            left: m.left,
            top: m.top,
            width: `${m.size}px`,
            height: `${m.size}px`,
            backgroundColor: moteColor,
            boxShadow: `0 0 ${m.size * (isEvening ? 5.2 : 3.2)}px ${moteColor}`,
            animationDelay: m.delay,
            animationDuration: m.dur,
          }}
        />
      ))}

      {/* 9. Delicate Glowing Fairy String Lights along Top Ceiling Edge */}
      <svg
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        className={`absolute top-0 inset-x-0 h-16 w-full transition-opacity duration-1000 ${
          isEvening ? 'opacity-95' : isGolden ? 'opacity-65' : 'opacity-30'
        }`}
        aria-hidden="true"
      >
        <path
          d="M0 6 Q240 58 480 14 T960 18 T1440 10"
          fill="none"
          stroke={isEvening ? '#7E6BA8' : '#C8A878'}
          strokeWidth="1.2"
          opacity="0.55"
        />
        {[80, 190, 310, 440, 580, 720, 860, 1000, 1140, 1280, 1380].map(
          (x, i) => {
            const y = 18 + Math.sin(i * 1.15) * 18;
            return (
              <g key={x}>
                <circle
                  cx={x}
                  cy={y}
                  r={isEvening ? 11 : 6}
                  fill={isEvening ? '#FFE18C' : '#FFF1C4'}
                  opacity={isEvening ? 0.38 : 0.26}
                  className="sparkle-blink"
                  style={{ animationDelay: `${i * 0.28}s` }}
                />
                <circle
                  cx={x}
                  cy={y}
                  r="3"
                  fill="#FFFBEA"
                  className="sparkle-blink"
                  style={{ animationDelay: `${i * 0.28}s` }}
                />
              </g>
            );
          }
        )}
      </svg>
    </div>
  );
};

/**
 * Tactile Brass Pull-Chain Cord hanging from top-left corner.
 * Pull to cycle Morning -> Golden Sunset -> Starlight Night with a brief poetic mood whisper.
 */
export const PullChainSwitch: React.FC<{
  mood: RoomMood;
  onPull: () => void;
}> = ({ mood, onPull }) => {
  const [pulling, setPulling] = useState(false);
  const [showWhisper, setShowWhisper] = useState(false);

  useEffect(() => {
    if (!showWhisper) return;
    const t = window.setTimeout(() => setShowWhisper(false), 1800);
    return () => window.clearTimeout(t);
  }, [showWhisper, mood]);

  const handleClick = () => {
    setPulling(true);
    setShowWhisper(true);
    onPull();
    window.setTimeout(() => setPulling(false), 380);
  };

  const isEvening = mood === 'evening';

  return (
    <div className="fixed top-0 left-4 sm:left-7 z-40 flex items-start gap-2.5">
      <button
        type="button"
        onClick={handleClick}
        className="group flex flex-col items-center focus:outline-none cursor-pointer"
        title={`Kéo dây đổi thời gian (${MOOD_LABELS[mood]})`}
        aria-label="Kéo dây đổi ánh sáng phòng đọc"
      >
        <div className="h-2.5 w-6 rounded-b-md bg-gradient-to-r from-[#8E6526] via-[#E5C16C] to-[#7C561E] shadow-md" />
        <div
          className="flex flex-col items-center transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
          style={{
            transform: pulling ? 'translateY(18px)' : 'translateY(0)',
          }}
        >
          <div
            className="h-14 sm:h-16 w-[3px]"
            style={{
              backgroundImage:
                'repeating-linear-gradient(180deg, #E8C56E 0px, #E8C56E 3px, #8A6222 3px, #8A6222 5px)',
            }}
          />
          <div
            className={`relative flex h-8 w-5 flex-col items-center justify-center rounded-full border border-[#F5D680] shadow-lg transition-transform group-hover:scale-110 ${
              isEvening
                ? 'bg-gradient-to-b from-[#FFE699] to-[#C88A2E] shadow-[0_0_24px_7px_rgba(255,210,112,0.82)]'
                : mood === 'golden'
                  ? 'bg-gradient-to-b from-[#FFD28E] to-[#C46B34] shadow-[0_4px_14px_rgba(196,107,52,0.55)]'
                  : 'bg-gradient-to-b from-[#FFFDF2] to-[#C9AD6B] shadow-[0_4px_12px_rgba(72,96,82,0.32)]'
            }`}
          >
            <span className="h-2.5 w-2.5 rounded-full bg-white/85 blur-[0.5px]" />
          </div>
          <div className="h-3 w-1.5 rounded-b-full bg-gradient-to-b from-[#C89632] to-transparent opacity-80" />
        </div>
      </button>

      {/* Brief ephemeral poetic whisper when cord is pulled */}
      <div
        className={`pointer-events-none mt-12 rounded-full border px-3 py-1 font-serif text-xs italic shadow-lg backdrop-blur-md transition-all duration-500 ${
          showWhisper
            ? 'translate-x-0 opacity-100'
            : '-translate-x-3 opacity-0'
        } ${
          isEvening
            ? 'border-amber-200/35 bg-[#191630]/85 text-[#FCE8B2]'
            : mood === 'golden'
              ? 'border-amber-700/25 bg-[#FFF3E0]/88 text-[#6E3416]'
              : 'border-emerald-700/20 bg-white/85 text-[#2E5245]'
        }`}
      >
        {MOOD_LABELS[mood]}
      </div>
    </div>
  );
};
