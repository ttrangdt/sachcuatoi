import React from 'react';

export type RoomMood = 'morning' | 'golden' | 'evening';

/** Detect natural lighting mood from user's local clock */
export function getLocalTimeMood(): RoomMood {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 15) return 'morning';
  if (hour >= 15 && hour < 19) return 'golden';
  return 'evening';
}

export const MOOD_LABELS: Record<RoomMood, string> = {
  morning: 'Ban ngày',
  golden: 'Nắng chiều',
  evening: 'Đèn đêm',
};

const MOTES = [
  { left: '8%', top: '18%', size: 5.5, delay: '0s', dur: '11s' },
  { left: '21%', top: '42%', size: 4.5, delay: '1.8s', dur: '13s' },
  { left: '36%', top: '20%', size: 6.5, delay: '2.7s', dur: '14.5s' },
  { left: '54%', top: '16%', size: 5, delay: '0.9s', dur: '12s' },
  { left: '72%', top: '28%', size: 6, delay: '2.2s', dur: '13.5s' },
  { left: '87%', top: '20%', size: 5, delay: '3.8s', dur: '11.5s' },
  { left: '92%', top: '56%', size: 4.5, delay: '0.5s', dur: '10.5s' },
  { left: '12%', top: '68%', size: 5, delay: '2.5s', dur: '12.5s' },
];

interface AmbientRoomEffectsProps {
  mood: RoomMood;
  parallax: { x: number; y: number };
}

/**
 * High-contrast, unmistakable Morning / Golden Sunset / Cozy Night room lighting atmosphere
 * with smooth 900ms transitions and subtle mouse parallax.
 */
export const AmbientRoomEffects: React.FC<AmbientRoomEffectsProps> = ({
  mood,
  parallax,
}) => {
  const isMorning = mood === 'morning';
  const isGolden = mood === 'golden';
  const isEvening = mood === 'evening';

  const moteColor = isEvening
    ? 'rgba(255, 224, 128, 0.95)'
    : isGolden
      ? 'rgba(255, 198, 112, 0.92)'
      : 'rgba(255, 255, 245, 0.95)';

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* 1. Dramatic Wall Backdrop per Time of Day */}
      <div
        className="absolute inset-0 transition-all duration-1000"
        style={{
          background: isEvening
            ? 'radial-gradient(ellipse 85% 65% at 50% 10%, #1c2238 0%, #0f1322 52%, #070910 100%)'
            : isGolden
              ? 'radial-gradient(ellipse 90% 65% at 15% 12%, #ffdfb3 0%, #e8a472 48%, #8f4e48 100%)'
              : 'radial-gradient(ellipse 90% 65% at 18% 10%, #ffffff 0%, #e5f2ec 48%, #c7dfd5 100%)',
        }}
      />

      {/* 2. Window Light Spill / Sunset Beams / Night Moonlight */}
      <div
        className="absolute -inset-10 transition-all duration-1000"
        style={{
          transform: `translate3d(${parallax.x * 14}px, ${parallax.y * 8}px, 0)`,
          background: isEvening
            ? 'radial-gradient(circle 420px at 85% 8%, rgba(142, 168, 255, 0.16) 0%, transparent 70%), radial-gradient(circle 520px at 50% 18%, rgba(255, 196, 102, 0.16) 0%, transparent 72%)'
            : isGolden
              ? 'linear-gradient(114deg, rgba(255, 226, 152, 0.72) 0%, rgba(255, 174, 96, 0.34) 24%, transparent 38%, rgba(255, 208, 134, 0.42) 52%, transparent 66%)'
              : 'linear-gradient(118deg, rgba(255, 255, 250, 0.78) 0%, rgba(255, 255, 244, 0.28) 22%, transparent 36%, rgba(236, 255, 248, 0.42) 50%, transparent 64%)',
        }}
      />

      {/* 3. Evening Starfield shimmer in upper wall corners */}
      {isEvening && (
        <div className="absolute inset-0 opacity-75">
          {[
            ['6%', '10%'],
            ['14%', '22%'],
            ['88%', '12%'],
            ['94%', '26%'],
            ['82%', '8%'],
            ['4%', '34%'],
          ].map(([left, top], i) => (
            <span
              key={i}
              className="sparkle-blink absolute h-1.5 w-1.5 rounded-full bg-[#FFF7D6] shadow-[0_0_8px_2px_rgba(255,240,180,0.85)]"
              style={{ left, top, animationDelay: `${i * 0.4}s` }}
            />
          ))}
        </div>
      )}

      {/* 4. Floating Dust Motes / Sunset Embers / Night Fireflies */}
      {MOTES.map((m, idx) => (
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
            boxShadow: `0 0 ${m.size * (isEvening ? 4.8 : 2.8)}px ${moteColor}`,
            animationDelay: m.delay,
            animationDuration: m.dur,
          }}
        />
      ))}
    </div>
  );
};

/**
 * Tactile Brass Pull-Chain Cord hanging from top-left corner.
 * Pull to cycle Morning -> Golden Sunset -> Cozy Night.
 */
export const PullChainSwitch: React.FC<{
  mood: RoomMood;
  onPull: () => void;
}> = ({ mood, onPull }) => {
  const [pulling, setPulling] = React.useState(false);

  const handleClick = () => {
    setPulling(true);
    onPull();
    window.setTimeout(() => setPulling(false), 380);
  };

  const isEvening = mood === 'evening';

  return (
    <button
      type="button"
      onClick={handleClick}
      className="group fixed top-0 left-4 sm:left-7 z-40 flex flex-col items-center focus:outline-none cursor-pointer"
      title={`Kéo dây đổi ánh sáng (${MOOD_LABELS[mood]})`}
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
              ? 'bg-gradient-to-b from-[#FFE699] to-[#C88A2E] shadow-[0_0_22px_6px_rgba(255,210,112,0.75)]'
              : mood === 'golden'
                ? 'bg-gradient-to-b from-[#FFD28E] to-[#C46B34] shadow-[0_4px_14px_rgba(196,107,52,0.5)]'
                : 'bg-gradient-to-b from-[#FFFDF2] to-[#C9AD6B] shadow-[0_4px_10px_rgba(72,96,82,0.3)]'
          }`}
        >
          <span className="h-2.5 w-2.5 rounded-full bg-white/80 blur-[0.5px]" />
        </div>
        <div className="h-3 w-1.5 rounded-b-full bg-gradient-to-b from-[#C89632] to-transparent opacity-80" />
      </div>
    </button>
  );
};
