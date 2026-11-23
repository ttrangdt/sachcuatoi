import React from 'react';

export type RoomMood = 'morning' | 'golden' | 'evening';

export const ROOM_MOODS: {
  id: RoomMood;
  label: string;
  dotColor: string;
}[] = [
  { id: 'morning', label: 'Sáng sớm', dotColor: '#86D4B8' },
  { id: 'golden', label: 'Nắng chiều', dotColor: '#F59B56' },
  { id: 'evening', label: 'Đèn đêm', dotColor: '#8E7BFF' },
];

const FAIRY_MOTES = [
  { left: '7%', top: '18%', size: 6, delay: '0s', dur: '10s' },
  { left: '16%', top: '44%', size: 4.5, delay: '1.6s', dur: '12.5s' },
  { left: '25%', top: '26%', size: 7, delay: '2.9s', dur: '14s' },
  { left: '38%', top: '15%', size: 5, delay: '0.7s', dur: '11s' },
  { left: '54%', top: '22%', size: 6.5, delay: '2.1s', dur: '13s' },
  { left: '68%', top: '16%', size: 5, delay: '3.6s', dur: '11.5s' },
  { left: '80%', top: '34%', size: 7, delay: '1.1s', dur: '13.5s' },
  { left: '89%', top: '20%', size: 5.5, delay: '4.2s', dur: '12s' },
  { left: '93%', top: '58%', size: 4.5, delay: '0.3s', dur: '10.5s' },
  { left: '11%', top: '72%', size: 5, delay: '2.4s', dur: '12s' },
];

interface AmbientRoomEffectsProps {
  mood: RoomMood;
  parallax: { x: number; y: number };
}

export const AmbientRoomEffects: React.FC<AmbientRoomEffectsProps> = ({
  mood,
  parallax,
}) => {
  const isMorning = mood === 'morning';
  const isGolden = mood === 'golden';
  const isEvening = mood === 'evening';

  const moteColor = isEvening
    ? 'rgba(255, 224, 126, 0.9)'
    : isGolden
      ? 'rgba(255, 206, 126, 0.92)'
      : 'rgba(255, 255, 240, 0.95)';

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* 3 Hand-Painted Gouache / Watercolor Storybook Room Backgrounds with smooth crossfade */}
      <div
        className="absolute -inset-6 transition-transform duration-300 ease-out"
        style={{
          transform: `translate3d(${parallax.x * -10}px, ${parallax.y * -7}px, 0) scale(1.04)`,
        }}
      >
        <img
          src="./art/room-morning.jpg"
          alt=""
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
            isMorning ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <img
          src="./art/room-golden.jpg"
          alt=""
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
            isGolden ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <img
          src="./art/room-evening.jpg"
          alt=""
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
            isEvening ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </div>

      {/* Subtle atmospheric depth vignette so bookcases pop crisply against the painted wall */}
      <div
        className={`absolute inset-0 transition-colors duration-1000 ${
          isEvening
            ? 'bg-gradient-to-b from-[#0E0F24]/20 via-transparent to-[#0B0914]/55'
            : isGolden
              ? 'bg-gradient-to-b from-[#5A2C16]/8 via-transparent to-[#3B1E0E]/28'
              : 'bg-gradient-to-b from-white/10 via-transparent to-[#2D4036]/18'
        }`}
      />

      {/* Floating Fairy Dust / Golden Fireflies */}
      {FAIRY_MOTES.map((m, idx) => (
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
            boxShadow: `0 0 ${m.size * (isEvening ? 4.4 : 2.8)}px ${moteColor}`,
            animationDelay: m.delay,
            animationDuration: m.dur,
          }}
        />
      ))}
    </div>
  );
};
