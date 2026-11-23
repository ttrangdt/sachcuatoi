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
  { left: '6%', top: '18%', size: 6, delay: '0s', dur: '10s' },
  { left: '14%', top: '46%', size: 4.5, delay: '1.6s', dur: '12.5s' },
  { left: '24%', top: '26%', size: 7, delay: '2.9s', dur: '14s' },
  { left: '37%', top: '15%', size: 5, delay: '0.7s', dur: '11s' },
  { left: '52%', top: '22%', size: 6.5, delay: '2.1s', dur: '13s' },
  { left: '66%', top: '16%', size: 5, delay: '3.6s', dur: '11.5s' },
  { left: '79%', top: '34%', size: 7, delay: '1.1s', dur: '13.5s' },
  { left: '88%', top: '20%', size: 5.5, delay: '4.2s', dur: '12s' },
  { left: '92%', top: '58%', size: 4.5, delay: '0.3s', dur: '10.5s' },
  { left: '11%', top: '72%', size: 5, delay: '2.4s', dur: '12s' },
  { left: '44%', top: '62%', size: 4, delay: '3.1s', dur: '15s' },
  { left: '72%', top: '68%', size: 5.5, delay: '1.9s', dur: '13s' },
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
    ? 'rgba(255, 224, 126, 0.85)'
    : isGolden
      ? 'rgba(255, 198, 118, 0.88)'
      : 'rgba(255, 255, 240, 0.92)';

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Dreamy Wallpaper Subtle Damask / Celestial Dot Texture */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ${
          isEvening ? 'opacity-25' : 'opacity-18'
        }`}
        style={{
          backgroundImage: isEvening
            ? 'radial-gradient(rgba(224, 206, 255, 0.45) 1px, transparent 1px)'
            : 'radial-gradient(rgba(122, 100, 140, 0.22) 1px, transparent 1px)',
          backgroundSize: '34px 34px',
        }}
      />

      {/* Enchanted Arched Fairy-Tale Window (Left-Back Wall) */}
      <div
        className="absolute top-12 left-4 sm:left-10 hidden lg:block h-[340px] w-[210px] opacity-85 transition-all duration-1000"
        style={{
          transform: `translate3d(${parallax.x * -8}px, ${parallax.y * -6}px, 0)`,
        }}
      >
        <svg viewBox="0 0 210 340" className="h-full w-full drop-shadow-[0_14px_28px_rgba(32,20,48,0.22)]">
          <defs>
            <linearGradient id="winSkyMorning" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#9ED9EE" />
              <stop offset="55%" stopColor="#D7F2EC" />
              <stop offset="100%" stopColor="#FFE9DA" />
            </linearGradient>
            <linearGradient id="winSkyGolden" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6D5796" />
              <stop offset="45%" stopColor="#E9886B" />
              <stop offset="100%" stopColor="#FFD485" />
            </linearGradient>
            <linearGradient id="winSkyNight" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0E132E" />
              <stop offset="55%" stopColor="#262259" />
              <stop offset="100%" stopColor="#4A357A" />
            </linearGradient>
            <clipPath id="archClip">
              <path d="M16 326 V112 C16 48 56 14 105 14 C154 14 194 48 194 112 V326 Z" />
            </clipPath>
          </defs>

          {/* Sky inside arched window */}
          <g clipPath="url(#archClip)">
            <rect
              width="210"
              height="340"
              fill={
                isEvening
                  ? 'url(#winSkyNight)'
                  : isGolden
                    ? 'url(#winSkyGolden)'
                    : 'url(#winSkyMorning)'
              }
            />

            {/* Morning: pastel drifting clouds & soft sun */}
            {isMorning && (
              <>
                <circle cx="145" cy="96" r="24" fill="#FFF9DC" opacity="0.92" />
                <ellipse cx="74" cy="128" rx="44" ry="16" fill="#FFFFFF" opacity="0.72" />
                <ellipse cx="142" cy="176" rx="52" ry="18" fill="#FFF7F2" opacity="0.65" />
              </>
            )}

            {/* Golden Hour: glowing low amber sun & warm clouds */}
            {isGolden && (
              <>
                <circle cx="105" cy="210" r="38" fill="#FFE29A" opacity="0.92" />
                <ellipse cx="64" cy="148" rx="48" ry="15" fill="#FFB87A" opacity="0.55" />
                <ellipse cx="152" cy="184" rx="42" ry="14" fill="#FF9E6B" opacity="0.5" />
                {/* Distant bird silhouettes */}
                <path
                  d="M62 110 Q67 104 72 110 Q77 104 82 110 M122 92 Q126 88 130 92 Q134 88 138 92"
                  fill="none"
                  stroke="#4E2B48"
                  strokeWidth="1.6"
                  opacity="0.6"
                />
              </>
            )}

            {/* Evening: glowing crescent moon, constellations & twinkling stars */}
            {isEvening && (
              <>
                <path
                  d="M142 74 A24 24 0 1 0 142 122 A18 18 0 1 1 142 74 Z"
                  fill="#FFF2B2"
                  className="drop-shadow-[0_0_12px_rgba(255,236,158,0.8)]"
                />
                {[
                  [48, 72, 2.2],
                  [78, 52, 1.8],
                  [96, 118, 2.5],
                  [56, 154, 1.6],
                  [154, 152, 2],
                  [122, 186, 1.8],
                  [68, 210, 2.2],
                ].map(([cx, cy, r], i) => (
                  <circle
                    key={i}
                    cx={cx}
                    cy={cy}
                    r={r}
                    fill="#FFF7D4"
                    className="sparkle-blink"
                    style={{ animationDelay: `${i * 0.45}s` }}
                  />
                ))}
                {/* Faint fairy constellation line */}
                <path
                  d="M48 72 L78 52 L96 118 L56 154"
                  fill="none"
                  stroke="#C9B6FF"
                  strokeWidth="0.7"
                  opacity="0.35"
                />
              </>
            )}
          </g>

          {/* Ornate gothic window mullion frame */}
          <path
            d="M16 326 V112 C16 48 56 14 105 14 C154 14 194 48 194 112 V326 Z"
            fill="none"
            stroke={isEvening ? '#393256' : '#E8DFD1'}
            strokeWidth="8"
          />
          <line x1="105" y1="14" x2="105" y2="326" stroke={isEvening ? '#393256' : '#E8DFD1'} strokeWidth="4" />
          <line x1="16" y1="138" x2="194" y2="138" stroke={isEvening ? '#393256' : '#E8DFD1'} strokeWidth="4" />
          <line x1="16" y1="232" x2="194" y2="232" stroke={isEvening ? '#393256' : '#E8DFD1'} strokeWidth="4" />
        </svg>
      </div>

      {/* Hanging Enchanted Fairy String Lights across the ceiling */}
      <svg
        viewBox="0 0 1440 110"
        preserveAspectRatio="none"
        className={`absolute top-10 inset-x-0 w-full h-24 transition-opacity duration-1000 ${
          isEvening ? 'opacity-95' : isGolden ? 'opacity-65' : 'opacity-35'
        }`}
        aria-hidden="true"
      >
        <path
          d="M0 14 Q240 82 480 24 T960 28 T1440 18"
          fill="none"
          stroke={isEvening ? '#6B5C8E' : '#B7A287'}
          strokeWidth="1.5"
          opacity="0.65"
        />
        {[90, 210, 340, 480, 620, 760, 910, 1060, 1210, 1340].map((x, i) => {
          const y = 26 + Math.sin(i * 1.1) * 26;
          return (
            <g key={x}>
              <circle
                cx={x}
                cy={y}
                r={isEvening ? 10 : 6}
                fill={isEvening ? '#FFE08A' : '#FFF1C2'}
                opacity={isEvening ? 0.34 : 0.25}
                className="sparkle-blink"
                style={{ animationDelay: `${i * 0.35}s` }}
              />
              <circle
                cx={x}
                cy={y}
                r="3"
                fill="#FFF8DC"
                className="sparkle-blink"
                style={{ animationDelay: `${i * 0.35}s` }}
              />
            </g>
          );
        })}
      </svg>

      {/* Diagonal Vivid Atmospheric Rays (morph dramatically with Morning / Golden / Evening) */}
      <div
        className={`absolute -inset-8 transition-all duration-1000 ${
          isEvening
            ? 'evening-lamp-glow'
            : isGolden
              ? 'golden-rays'
              : 'sunlight-rays'
        }`}
        style={{
          transform: `translate3d(${parallax.x * 14}px, ${parallax.y * 10}px, 0)`,
        }}
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
            boxShadow: `0 0 ${m.size * (isEvening ? 4.2 : 2.6)}px ${moteColor}`,
            animationDelay: m.delay,
            animationDuration: m.dur,
          }}
        />
      ))}

      {/* Dreamy Hanging Botanical Garland & Moon Chime (Top Right Wall) */}
      <svg
        viewBox="0 0 180 260"
        className={`fixed top-12 right-4 hidden lg:block h-60 w-40 transition-opacity duration-700 ${
          isEvening ? 'opacity-80' : 'opacity-65'
        }`}
        style={{
          transform: `translate3d(${parallax.x * 9}px, ${parallax.y * -5}px, 0)`,
        }}
        aria-hidden="true"
      >
        {/* Hanging golden moon-phase chime */}
        <line x1="128" y1="0" x2="128" y2="210" stroke="#DFB864" strokeWidth="1.2" opacity="0.7" />
        <circle cx="128" cy="48" r="11" fill="#F6DC92" opacity="0.85" />
        <path d="M134 86 A11 11 0 1 0 134 108 A8 8 0 1 1 134 86 Z" fill="#F6DC92" />
        <circle cx="128" cy="144" r="9" fill="none" stroke="#F6DC92" strokeWidth="2" />
        <path
          d="M128 178 L131 186 L139 189 L131 192 L128 200 L125 192 L117 189 L125 186 Z"
          fill="#FFF0B8"
          className="sparkle-blink"
        />
      </svg>
    </div>
  );
};
