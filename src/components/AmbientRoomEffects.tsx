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
  { left: '19%', top: '42%', size: 4, delay: '1.8s', dur: '13s' },
  { left: '34%', top: '22%', size: 6, delay: '2.7s', dur: '14.5s' },
  { left: '53%', top: '16%', size: 4.5, delay: '0.9s', dur: '12s' },
  { left: '71%', top: '28%', size: 6, delay: '2.2s', dur: '13.5s' },
  { left: '86%', top: '20%', size: 5, delay: '3.8s', dur: '11.5s' },
  { left: '91%', top: '54%', size: 4, delay: '0.5s', dur: '10.5s' },
  { left: '13%', top: '68%', size: 4.5, delay: '2.5s', dur: '12.5s' },
];

interface AmbientRoomEffectsProps {
  mood: RoomMood;
  parallax: { x: number; y: number };
}

/**
 * Cohesive, unified library room lighting environment — wall plaster, warm ceiling,
 * sunlit/twilight window spill, and floating motes/fireflies all stay architecturally consistent
 * across Morning, Golden Hour, and Night.
 */
export const AmbientRoomEffects: React.FC<AmbientRoomEffectsProps> = ({
  mood,
  parallax,
}) => {
  const isMorning = mood === 'morning';
  const isGolden = mood === 'golden';
  const isEvening = mood === 'evening';

  const moteColor = isEvening
    ? 'rgba(255, 224, 132, 0.88)'
    : isGolden
      ? 'rgba(255, 206, 128, 0.85)'
      : 'rgba(255, 253, 236, 0.9)';

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Unified Hand-Painted Plaster Wall & Soft Ceiling Texture */}
      <div
        className="absolute inset-0 transition-all duration-1000"
        style={{
          background: isEvening
            ? 'radial-gradient(ellipse 78% 60% at 50% 18%, #36281d 0%, #201712 52%, #130d0a 100%)'
            : isGolden
              ? 'radial-gradient(ellipse 82% 62% at 22% 14%, #fbe4c4 0%, #e7c29c 48%, #c99875 100%)'
              : 'radial-gradient(ellipse 84% 64% at 20% 12%, #f9fbf4 0%, #e7f0e6 50%, #d4e3d7 100%)',
        }}
      />

      {/* Painterly Watercolor Brushstroke Wall Grain */}
      <div
        className="absolute inset-0 opacity-25 mix-blend-multiply"
        style={{
          backgroundImage:
            'radial-gradient(rgba(96, 74, 52, 0.16) 1px, transparent 0), radial-gradient(rgba(96, 74, 52, 0.1) 1px, transparent 0)',
          backgroundSize: '26px 26px',
          backgroundPosition: '0 0, 13px 13px',
        }}
      />

      {/* Soft Diagonal Window Sunlight / Evening Warm Chandelier Halo with Parallax */}
      <div
        className="absolute -inset-10 transition-all duration-1000"
        style={{
          transform: `translate3d(${parallax.x * 12}px, ${parallax.y * 8}px, 0)`,
          background: isEvening
            ? 'radial-gradient(circle 480px at 50% 10%, rgba(255, 200, 112, 0.22) 0%, rgba(255, 178, 86, 0.08) 45%, transparent 75%)'
            : isGolden
              ? 'linear-gradient(116deg, rgba(255, 214, 140, 0.52) 0%, rgba(255, 182, 112, 0.16) 24%, transparent 38%, rgba(255, 212, 146, 0.28) 52%, transparent 68%)'
              : 'linear-gradient(118deg, rgba(255, 255, 246, 0.65) 0%, rgba(255, 254, 238, 0.22) 22%, transparent 36%, rgba(255, 255, 246, 0.34) 48%, transparent 62%)',
        }}
      />

      {/* Floating Sunbeam Dust Motes / Warm Evening Fireflies */}
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
            boxShadow: `0 0 ${m.size * (isEvening ? 4.2 : 2.6)}px ${moteColor}`,
            animationDelay: m.delay,
            animationDuration: m.dur,
          }}
        />
      ))}
    </div>
  );
};

/**
 * Tactile Brass Pull-Chain Cord hanging from the top-left corner of the room.
 * Pulling it stretches the chain with a spring bounce and cycles Morning -> Golden -> Night.
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
      title={`Kéo dây đổi ánh sáng (hiện tại: ${MOOD_LABELS[mood]})`}
      aria-label="Kéo dây đổi ánh sáng phòng đọc"
    >
      {/* Brass ceiling mount */}
      <div className="h-2.5 w-6 rounded-b-md bg-gradient-to-r from-[#8E6526] via-[#E5C16C] to-[#7C561E] shadow-md" />

      {/* Beaded brass chain that stretches down on pull */}
      <div
        className="flex flex-col items-center transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
        style={{
          transform: pulling ? 'translateY(16px)' : 'translateY(0)',
        }}
      >
        <div
          className="h-14 sm:h-16 w-[3px]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(180deg, #E8C56E 0px, #E8C56E 3px, #8A6222 3px, #8A6222 5px)',
          }}
        />
        {/* Glowing pendant pull handle */}
        <div
          className={`relative flex h-8 w-5 flex-col items-center justify-center rounded-full border border-[#F5D680] shadow-lg transition-transform group-hover:scale-110 ${
            isEvening
              ? 'bg-gradient-to-b from-[#FFE699] to-[#C88A2E] shadow-[0_0_18px_4px_rgba(255,210,112,0.65)]'
              : mood === 'golden'
                ? 'bg-gradient-to-b from-[#FFD28E] to-[#C46B34] shadow-[0_4px_12px_rgba(196,107,52,0.45)]'
                : 'bg-gradient-to-b from-[#FFFDF2] to-[#C9AD6B] shadow-[0_4px_10px_rgba(72,96,82,0.28)]'
          }`}
        >
          <span className="h-2.5 w-2.5 rounded-full bg-white/75 blur-[0.5px]" />
        </div>
        {/* Small silk tassel tip */}
        <div className="h-3 w-1.5 rounded-b-full bg-gradient-to-b from-[#C89632] to-transparent opacity-80" />
      </div>
    </button>
  );
};
