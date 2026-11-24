import React, { useEffect, useState } from 'react';

export type RoomMood = 'morning' | 'golden' | 'evening';

export function getLocalTimeMood(): RoomMood {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 15) return 'morning';
  if (hour >= 15 && hour < 19) return 'golden';
  return 'evening';
}

export const MOOD_LABELS: Record<RoomMood, string> = {
  morning: 'Bình minh hoa đào',
  golden: 'Chiều thu lá phong',
  evening: 'Đêm đèn & đom đóm',
};

const NIGHT_STARS = [
  [4, 8, 2.4, 0],
  [9, 18, 2.0, 0.5],
  [14, 11, 3.0, 1.1],
  [19, 26, 1.8, 1.8],
  [26, 9, 2.6, 0.3],
  [33, 19, 2.0, 2.1],
  [42, 7, 2.4, 0.9],
  [52, 11, 1.9, 1.4],
  [61, 8, 2.8, 0.2],
  [69, 16, 2.1, 1.9],
  [76, 9, 2.7, 0.7],
  [82, 22, 2.0, 2.4],
  [88, 11, 3.0, 0.4],
  [94, 19, 2.3, 1.3],
  [96, 33, 1.8, 2.2],
  [6, 36, 2.2, 1.6],
  [12, 54, 1.9, 0.8],
  [91, 48, 2.4, 1.5],
  [85, 38, 1.8, 0.6],
  [3, 62, 2.2, 2.0],
];

const SAKURA_PETALS = [
  { left: '4%', size: 18, delay: '0s', dur: '10.5s', color: '#F47EA1' },
  { left: '11%', size: 14, delay: '-2.4s', dur: '12.5s', color: '#FA9CB8' },
  { left: '18%', size: 20, delay: '-5.1s', dur: '11.2s', color: '#EA628C' },
  { left: '25%', size: 15, delay: '-1.2s', dur: '13.4s', color: '#F78FAE' },
  { left: '33%', size: 17, delay: '-7.8s', dur: '12s', color: '#FDB4C9' },
  { left: '42%', size: 13, delay: '-3.6s', dur: '14s', color: '#F47EA1' },
  { left: '54%', size: 18, delay: '-6.2s', dur: '11.8s', color: '#EB6A92' },
  { left: '63%', size: 15, delay: '-0.8s', dur: '13s', color: '#FA9CB8' },
  { left: '72%', size: 20, delay: '-4.4s', dur: '10.8s', color: '#F2759B' },
  { left: '80%', size: 16, delay: '-8.5s', dur: '12.2s', color: '#F9A8C0' },
  { left: '87%', size: 19, delay: '-2.1s', dur: '11.5s', color: '#EA628C' },
  { left: '93%', size: 15, delay: '-5.9s', dur: '13.2s', color: '#F78FAE' },
  { left: '8%', size: 16, delay: '-9.1s', dur: '12.8s', color: '#FDB4C9' },
  { left: '76%', size: 14, delay: '-7.0s', dur: '11.6s', color: '#F47EA1' },
  { left: '21%', size: 17, delay: '-4.0s', dur: '13.8s', color: '#EB6A92' },
  { left: '96%', size: 16, delay: '-1.6s', dur: '12.4s', color: '#FA9CB8' },
];

const MAPLE_LEAVES = [
  { left: '5%', size: 28, delay: '0s', dur: '11s', color: '#D9381E' },
  { left: '13%', size: 24, delay: '-3.2s', dur: '13s', color: '#F06C1F' },
  { left: '21%', size: 30, delay: '-6.1s', dur: '12s', color: '#C42323' },
  { left: '29%', size: 22, delay: '-1.5s', dur: '14.2s', color: '#F59326' },
  { left: '40%', size: 26, delay: '-8.0s', dur: '12.8s', color: '#E04D1C' },
  { left: '56%', size: 25, delay: '-4.6s', dur: '11.6s', color: '#CC2929' },
  { left: '68%', size: 29, delay: '-2.2s', dur: '13.4s', color: '#F06C1F' },
  { left: '77%', size: 23, delay: '-7.1s', dur: '12.2s', color: '#E85A1C' },
  { left: '84%', size: 30, delay: '-0.9s', dur: '11.4s', color: '#C42323' },
  { left: '91%', size: 24, delay: '-5.4s', dur: '13.6s', color: '#F59326' },
  { left: '9%', size: 25, delay: '-9.4s', dur: '12.6s', color: '#E04D1C' },
  { left: '73%', size: 26, delay: '-3.8s', dur: '14s', color: '#D9381E' },
  { left: '88%', size: 22, delay: '-8.6s', dur: '11.8s', color: '#F06C1F' },
  { left: '17%', size: 27, delay: '-5.0s', dur: '13.2s', color: '#CC2929' },
];

const NIGHT_FIREFLIES = [
  { left: '5%', top: '24%', size: 7, delay: '0s', dur: '7.5s' },
  { left: '11%', top: '52%', size: 6, delay: '-1.4s', dur: '9s' },
  { left: '17%', top: '34%', size: 8, delay: '-2.8s', dur: '8.2s' },
  { left: '23%', top: '72%', size: 6.5, delay: '-0.7s', dur: '10s' },
  { left: '31%', top: '18%', size: 5.5, delay: '-3.6s', dur: '8.8s' },
  { left: '44%', top: '14%', size: 6.5, delay: '-2.1s', dur: '9.4s' },
  { left: '58%', top: '16%', size: 6, delay: '-4.2s', dur: '8.5s' },
  { left: '70%', top: '24%', size: 7.5, delay: '-1.1s', dur: '7.8s' },
  { left: '78%', top: '44%', size: 8, delay: '-3.0s', dur: '9.2s' },
  { left: '84%', top: '26%', size: 6.5, delay: '-0.4s', dur: '8s' },
  { left: '89%', top: '62%', size: 7.5, delay: '-2.5s', dur: '9.6s' },
  { left: '94%', top: '38%', size: 6, delay: '-4.8s', dur: '8.4s' },
  { left: '8%', top: '78%', size: 7, delay: '-1.9s', dur: '9.8s' },
  { left: '15%', top: '64%', size: 5.5, delay: '-3.9s', dur: '7.6s' },
  { left: '82%', top: '76%', size: 7, delay: '-2.2s', dur: '8.9s' },
  { left: '92%', top: '80%', size: 6.5, delay: '-0.9s', dur: '9.1s' },
  { left: '26%', top: '46%', size: 6, delay: '-4.5s', dur: '8.3s' },
  { left: '74%', top: '66%', size: 7, delay: '-1.6s', dur: '9.5s' },
];

interface AmbientRoomEffectsProps {
  mood: RoomMood;
  parallax: { x: number; y: number };
}

/** Background sky, sun/moon, clouds, stars, shooting stars, and blinking fairy string lights */
export const AmbientRoomEffects: React.FC<AmbientRoomEffectsProps> = ({
  mood,
  parallax,
}) => {
  const isMorning = mood === 'morning';
  const isGolden = mood === 'golden';
  const isEvening = mood === 'evening';

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* 1. Rich, Unmistakable Sky & Room Backdrop (No more washed-out white morning!) */}
      <div
        className="absolute inset-0 transition-all duration-1000"
        style={{
          background: isEvening
            ? 'radial-gradient(ellipse 80% 58% at 80% 14%, rgba(124, 96, 214, 0.36) 0%, transparent 62%), radial-gradient(ellipse 75% 55% at 18% 75%, rgba(56, 82, 168, 0.28) 0%, transparent 68%), linear-gradient(180deg, #070b1a 0%, #111530 48%, #1a1430 100%)'
            : isGolden
              ? 'radial-gradient(ellipse 78% 58% at 16% 24%, rgba(255, 214, 126, 0.88) 0%, transparent 58%), radial-gradient(ellipse 72% 58% at 86% 18%, rgba(226, 118, 134, 0.65) 0%, transparent 66%), linear-gradient(180deg, #6b4f87 0%, #d9795b 42%, #f4b678 78%, #c97352 100%)'
              : 'radial-gradient(ellipse 68% 52% at 14% 12%, rgba(255, 240, 188, 0.72) 0%, transparent 56%), radial-gradient(ellipse 66% 54% at 86% 20%, rgba(124, 206, 224, 0.55) 0%, transparent 65%), linear-gradient(180deg, #7bc4e6 0%, #a9dcf0 42%, #d8eef4 74%, #f4dbe6 100%)',
        }}
      />

      {/* 2. Celestial Bodies */}
      <div
        className="absolute inset-0 transition-transform duration-500 ease-out"
        style={{
          transform: `translate3d(${parallax.x * -10}px, ${parallax.y * -6}px, 0)`,
        }}
      >
        {/* Morning Sun */}
        <div
          className={`absolute top-8 left-12 sm:left-16 transition-all duration-1000 ${
            isMorning
              ? 'translate-y-0 scale-100 opacity-100'
              : '-translate-y-24 scale-75 opacity-0'
          }`}
        >
          <div className="celestial-pulse h-24 w-24 sm:h-28 sm:w-28 rounded-full bg-gradient-to-br from-[#FFFDF0] via-[#FFE999] to-[#FFC857] shadow-[0_0_64px_22px_rgba(255,232,146,0.75)]" />
        </div>

        {/* Golden Hour Sun */}
        <div
          className={`absolute top-24 left-8 sm:left-14 transition-all duration-1000 ${
            isGolden
              ? 'translate-y-0 scale-100 opacity-100'
              : 'translate-y-28 scale-75 opacity-0'
          }`}
        >
          <div className="celestial-pulse h-28 w-28 sm:h-36 sm:w-36 rounded-full bg-gradient-to-b from-[#FFF2B2] via-[#FFA748] to-[#E35736] shadow-[0_0_95px_36px_rgba(255,168,84,0.82)]" />
        </div>

        {/* Night Glowing Crescent Moon */}
        <div
          className={`absolute top-10 right-10 sm:right-20 transition-all duration-1000 ${
            isEvening
              ? 'translate-y-0 scale-100 opacity-100'
              : '-translate-y-20 scale-75 opacity-0'
          }`}
        >
          <svg
            viewBox="0 0 110 110"
            className="celestial-pulse h-24 w-24 sm:h-28 sm:w-28 drop-shadow-[0_0_34px_rgba(255,236,158,0.88)]"
            aria-hidden="true"
          >
            <path
              d="M68 14 A38 38 0 1 0 94 76 A30 30 0 1 1 68 14 Z"
              fill="#FFF4C2"
            />
          </svg>
        </div>
      </div>

      {/* 3. Crisp Drifting Clouds (Morning & Sunset) */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ${
          isEvening ? 'opacity-10' : 'opacity-90'
        }`}
      >
        <div
          className="cloud-drift absolute top-14 -left-24 h-16 w-64 rounded-full blur-lg"
          style={{
            background: isGolden
              ? 'linear-gradient(90deg, transparent, rgba(255, 192, 134, 0.78), transparent)'
              : 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.92), transparent)',
            animationDuration: '32s',
          }}
        />
        <div
          className="cloud-drift absolute top-28 -left-32 h-20 w-80 rounded-full blur-xl"
          style={{
            background: isGolden
              ? 'linear-gradient(90deg, transparent, rgba(242, 142, 126, 0.65), transparent)'
              : 'linear-gradient(90deg, transparent, rgba(255, 248, 252, 0.85), transparent)',
            animationDuration: '44s',
            animationDelay: '-14s',
          }}
        />
      </div>

      {/* 4. Night Starfield + Shooting Stars */}
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
                boxShadow: `0 0 ${size * 5}px rgba(255, 240, 178, 0.95)`,
                animationDelay: `${delay}s`,
              }}
            />
          ))}
          <span
            className="shooting-star absolute top-[12%] left-[74%]"
            style={{ animationDelay: '1.2s', animationDuration: '6.2s' }}
          />
          <span
            className="shooting-star absolute top-[24%] left-[30%]"
            style={{ animationDelay: '4.4s', animationDuration: '7.8s' }}
          />
        </div>
      )}

      {/* 5. Shimmering Diagonal Sunbeams */}
      <div
        className="ray-shimmer absolute -inset-12 transition-all duration-1000"
        style={{
          transform: `translate3d(${parallax.x * 16}px, ${parallax.y * 10}px, 0)`,
          background: isEvening
            ? 'radial-gradient(circle 520px at 50% 14%, rgba(255, 206, 118, 0.22) 0%, transparent 72%)'
            : isGolden
              ? 'linear-gradient(112deg, rgba(255, 224, 134, 0.58) 0%, rgba(255, 162, 82, 0.28) 22%, transparent 36%, rgba(255, 208, 122, 0.4) 52%, transparent 68%)'
              : 'linear-gradient(118deg, rgba(255, 254, 232, 0.55) 0%, rgba(255, 250, 214, 0.22) 20%, transparent 34%, rgba(255, 255, 246, 0.36) 48%, transparent 64%)',
        }}
      />

      {/* 6. Night Blink-Blink Fairy String Lights across top ceiling */}
      {isEvening && (
        <svg
          viewBox="0 0 1440 96"
          preserveAspectRatio="none"
          className="absolute top-0 inset-x-0 h-20 w-full"
          aria-hidden="true"
        >
          <path
            d="M0 10 Q240 72 480 18 T960 22 T1440 12"
            fill="none"
            stroke="#8B7BB5"
            strokeWidth="1.5"
            opacity="0.65"
          />
          {[60, 150, 240, 330, 420, 520, 620, 720, 820, 920, 1020, 1120, 1220, 1320, 1400].map(
            (x, i) => {
              const y = 22 + Math.sin(i * 0.95) * 24;
              const bulbColor = i % 3 === 0 ? '#FFE680' : i % 3 === 1 ? '#FFD199' : '#FFF7D6';
              return (
                <g
                  key={x}
                  className="fairy-bulb-blink"
                  style={{
                    animationDelay: `${(i % 5) * 0.38}s`,
                    animationDuration: `${1.4 + (i % 3) * 0.45}s`,
                  }}
                >
                  <circle cx={x} cy={y} r="14" fill={bulbColor} opacity="0.38" />
                  <circle cx={x} cy={y} r="6.5" fill={bulbColor} opacity="0.72" />
                  <circle cx={x} cy={y} r="3.2" fill="#FFFFFF" />
                </g>
              );
            }
          )}
        </svg>
      )}
    </div>
  );
};

/**
 * Foreground living particles floating AROUND the bookcases (z-20, pointer-events-none):
 * - Morning: Crisp notched pink Sakura Cherry Blossom petals falling & tumbling
 * - Afternoon: Detailed vibrant orange & crimson Autumn Maple Leaves drifting down
 * - Evening: Bright pulsing golden-lime Fireflies (Đom đóm) weaving across the night room
 */
export const AmbientForegroundParticles: React.FC<{ mood: RoomMood }> = ({
  mood,
}) => {
  if (mood === 'morning') {
    return (
      <div className="pointer-events-none fixed inset-0 z-20 overflow-hidden">
        {SAKURA_PETALS.map((p, idx) => (
          <svg
            key={idx}
            viewBox="0 0 24 24"
            className="sakura-fall absolute -top-8 drop-shadow-[0_2px_4px_rgba(214,82,126,0.28)]"
            style={{
              left: p.left,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDelay: p.delay,
              animationDuration: p.dur,
            }}
            aria-hidden="true"
          >
            {/* Authentic notched Sakura cherry-blossom petal shape */}
            <path
              d="M12 22 C6 17 3 11 5 5 C6.5 2 9.5 2 11.2 4.5 L12 6.2 L12.8 4.5 C14.5 2 17.5 2 19 5 C21 11 18 17 12 22 Z"
              fill={p.color}
            />
            <path
              d="M12 20 C9 15 8 10 9.5 6"
              fill="none"
              stroke="#FFE4EC"
              strokeWidth="1"
              opacity="0.65"
            />
          </svg>
        ))}
      </div>
    );
  }

  if (mood === 'golden') {
    return (
      <div className="pointer-events-none fixed inset-0 z-20 overflow-hidden">
        {MAPLE_LEAVES.map((leaf, idx) => (
          <svg
            key={idx}
            viewBox="0 0 36 36"
            className="maple-fall absolute -top-10 drop-shadow-[0_3px_5px_rgba(92,24,8,0.35)]"
            style={{
              left: leaf.left,
              width: `${leaf.size}px`,
              height: `${leaf.size}px`,
              animationDelay: leaf.delay,
              animationDuration: leaf.dur,
            }}
            aria-hidden="true"
          >
            {/* Detailed 5-lobed Autumn Maple Leaf */}
            <path
              d="M18 3 L21 12 L29 9 L24 16 L33 19 L24 23 L26 29 L19 25 L18 34 L17 25 L10 29 L12 23 L3 19 L12 16 L7 9 L15 12 Z"
              fill={leaf.color}
            />
            <path
              d="M18 8 V26 M18 17 L11 14 M18 17 L25 14 M18 21 L12 22 M18 21 L24 22"
              stroke="#FFE0A6"
              strokeWidth="0.9"
              opacity="0.55"
            />
          </svg>
        ))}
      </div>
    );
  }

  // Evening: Vivid pulsing Golden Fireflies (Đom đóm)
  return (
    <div className="pointer-events-none fixed inset-0 z-20 overflow-hidden">
      {NIGHT_FIREFLIES.map((f, idx) => (
        <span
          key={idx}
          className="firefly-glow absolute rounded-full"
          style={{
            left: f.left,
            top: f.top,
            width: `${f.size}px`,
            height: `${f.size}px`,
            backgroundColor: idx % 2 === 0 ? '#FFF29C' : '#E2FF8A',
            boxShadow:
              idx % 2 === 0
                ? '0 0 14px 5px rgba(255, 224, 102, 0.92), 0 0 28px 10px rgba(255, 196, 64, 0.45)'
                : '0 0 14px 5px rgba(210, 255, 112, 0.88), 0 0 26px 10px rgba(182, 245, 76, 0.4)',
            animationDelay: f.delay,
            animationDuration: f.dur,
          }}
        />
      ))}
    </div>
  );
};

/**
 * Tactile Brass Pull-Chain Cord hanging from top-left corner.
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
              : 'border-sky-700/20 bg-white/88 text-[#244D66]'
        }`}
      >
        {MOOD_LABELS[mood]}
      </div>
    </div>
  );
};
