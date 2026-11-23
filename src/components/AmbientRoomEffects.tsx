import React from 'react';

export type RoomMood = 'morning' | 'golden' | 'evening';

export const ROOM_MOODS: {
  id: RoomMood;
  label: string;
  dotColor: string;
}[] = [
  { id: 'morning', label: 'Sáng sớm', dotColor: '#7CB898' },
  { id: 'golden', label: 'Nắng chiều', dotColor: '#E8A866' },
  { id: 'evening', label: 'Đèn đêm', dotColor: '#5B73A8' },
];

const MOTES = [
  { left: '8%', top: '16%', size: 5, delay: '0s', dur: '11s' },
  { left: '19%', top: '42%', size: 3.5, delay: '1.8s', dur: '13s' },
  { left: '31%', top: '24%', size: 6, delay: '3.2s', dur: '15s' },
  { left: '47%', top: '14%', size: 4, delay: '0.9s', dur: '12s' },
  { left: '63%', top: '28%', size: 5.5, delay: '2.5s', dur: '14s' },
  { left: '78%', top: '18%', size: 4.5, delay: '4.1s', dur: '11.5s' },
  { left: '89%', top: '38%', size: 5, delay: '1.2s', dur: '13.5s' },
  { left: '14%', top: '68%', size: 4, delay: '2.8s', dur: '12.5s' },
  { left: '84%', top: '64%', size: 3.5, delay: '0.4s', dur: '10.5s' },
  { left: '54%', top: '52%', size: 4.5, delay: '3.7s', dur: '16s' },
];

interface AmbientRoomEffectsProps {
  mood: RoomMood;
  parallax: { x: number; y: number };
}

export const AmbientRoomEffects: React.FC<AmbientRoomEffectsProps> = ({
  mood,
  parallax,
}) => {
  const moteColor =
    mood === 'evening'
      ? 'rgba(255, 224, 150, 0.55)'
      : mood === 'golden'
        ? 'rgba(255, 210, 130, 0.72)'
        : 'rgba(255, 253, 232, 0.85)';

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Diagonal Window Sunbeams / Evening Lamp Glow with subtle mouse parallax */}
      <div
        className={`absolute -inset-6 transition-opacity duration-700 ${
          mood === 'evening'
            ? 'evening-lamp-glow opacity-100'
            : mood === 'golden'
              ? 'golden-rays opacity-95'
              : 'sunlight-rays opacity-100'
        }`}
        style={{
          transform: `translate3d(${parallax.x * 10}px, ${parallax.y * 8}px, 0)`,
          transition: 'transform 0.35s ease-out, opacity 0.7s ease',
        }}
      />

      {/* Soft Arched Window Shadow on Top-Left Wall */}
      <div
        className={`absolute -top-12 -left-12 h-80 w-72 rounded-full blur-3xl transition-colors duration-700 ${
          mood === 'evening'
            ? 'bg-amber-400/10'
            : mood === 'golden'
              ? 'bg-amber-200/45'
              : 'bg-emerald-100/60'
        }`}
      />

      {/* Floating Sunbeam Dust Motes */}
      {MOTES.map((m, idx) => (
        <span
          key={idx}
          className="sun-mote absolute rounded-full"
          style={{
            left: m.left,
            top: m.top,
            width: `${m.size}px`,
            height: `${m.size}px`,
            backgroundColor: moteColor,
            boxShadow: `0 0 ${m.size * 2.4}px ${moteColor}`,
            animationDelay: m.delay,
            animationDuration: m.dur,
          }}
        />
      ))}

      {/* Soft Potted Indoor Plant Silhouette on Left Corner with parallax */}
      <svg
        viewBox="0 0 180 420"
        className={`fixed bottom-7 left-0 hidden xl:block h-[340px] w-[140px] transition-opacity duration-700 ${
          mood === 'evening' ? 'opacity-25' : 'opacity-45'
        }`}
        style={{
          transform: `translate3d(${parallax.x * -12}px, ${parallax.y * -4}px, 0)`,
          transition: 'transform 0.35s ease-out',
        }}
        aria-hidden="true"
      >
        <g fill={mood === 'evening' ? '#466957' : '#6AA07B'}>
          <ellipse cx="42" cy="180" rx="34" ry="18" transform="rotate(-32 42 180)" />
          <ellipse cx="82" cy="140" rx="38" ry="20" transform="rotate(-14 82 140)" />
          <ellipse cx="36" cy="240" rx="32" ry="17" transform="rotate(18 36 240)" />
          <ellipse cx="92" cy="215" rx="36" ry="18" transform="rotate(24 92 215)" />
          <ellipse cx="64" cy="96" rx="28" ry="16" transform="rotate(-48 64 96)" />
        </g>
        <path
          d="M52 330 Q54 240 62 120"
          fill="none"
          stroke={mood === 'evening' ? '#324B3E' : '#4F7B5E'}
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path d="M22 330 H88 L80 416 H30 Z" fill="#C9B093" />
      </svg>

      {/* Subtle Window Curtain Sway Silhouette on Right Edge */}
      <div
        className={`fixed top-0 right-0 hidden xl:block h-full w-24 curtain-sway transition-opacity duration-700 ${
          mood === 'evening'
            ? 'bg-gradient-to-l from-indigo-950/25 to-transparent'
            : 'bg-gradient-to-l from-white/35 to-transparent'
        }`}
      />
    </div>
  );
};
