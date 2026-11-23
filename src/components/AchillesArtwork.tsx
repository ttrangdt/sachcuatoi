import React from 'react';

/**
 * Handcrafted Collector's Edition Front Cover for "The Song of Achilles" (Trường Ca Achilles)
 * Inspired by the iconic crimson wave background, hammered gold Corinthian helmet, and teal sprayed edges.
 */
export const AchillesCoverArt: React.FC<{ className?: string }> = ({
  className = '',
}) => {
  return (
    <svg
      viewBox="0 0 320 480"
      className={`h-full w-full select-none ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Bìa sách Trường Ca Achilles - The Song of Achilles"
    >
      <defs>
        {/* Crimson linen base */}
        <linearGradient id="achillesBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#9C2338" />
          <stop offset="50%" stopColor="#851A2E" />
          <stop offset="100%" stopColor="#6B1224" />
        </linearGradient>

        {/* Greek sea wave pattern */}
        <pattern
          id="greekWaves"
          width="48"
          height="24"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M0 12 Q12 2 24 12 T48 12"
            fill="none"
            stroke="#D96B7C"
            strokeWidth="1.2"
            opacity="0.45"
          />
          <path
            d="M0 18 Q12 8 24 18 T48 18"
            fill="none"
            stroke="#E58997"
            strokeWidth="0.9"
            opacity="0.35"
          />
          <path
            d="M0 6 Q12 -4 24 6 T48 6"
            fill="none"
            stroke="#C95668"
            strokeWidth="0.9"
            opacity="0.35"
          />
        </pattern>

        {/* Hammered antique gold helmet gradient */}
        <linearGradient id="goldHelmet" x1="0.15" y1="0.05" x2="0.85" y2="0.95">
          <stop offset="0%" stopColor="#FCE786" />
          <stop offset="28%" stopColor="#E7BD49" />
          <stop offset="58%" stopColor="#C9962B" />
          <stop offset="85%" stopColor="#A6761E" />
          <stop offset="100%" stopColor="#D8AA3F" />
        </linearGradient>

        {/* Subtle metallic sheen highlight */}
        <radialGradient id="helmetSheen" cx="35%" cy="22%" r="55%">
          <stop offset="0%" stopColor="#FFF7C8" stopOpacity="0.55" />
          <stop offset="60%" stopColor="#E6BA46" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#5C3D0C" stopOpacity="0.22" />
        </radialGradient>

        {/* Dark shadow inside helmet eye-slits */}
        <linearGradient id="helmetInterior" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#14110E" />
          <stop offset="60%" stopColor="#2A2218" />
          <stop offset="100%" stopColor="#18130D" />
        </linearGradient>

        <filter id="helmetShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow
            dx="0"
            dy="5"
            stdDeviation="5"
            floodColor="#2B070E"
            floodOpacity="0.5"
          />
        </filter>
      </defs>

      {/* Background */}
      <rect width="320" height="480" fill="url(#achillesBg)" />
      <rect width="320" height="480" fill="url(#greekWaves)" />

      {/* Subtle vignette */}
      <rect
        width="320"
        height="480"
        fill="none"
        stroke="#4A0B17"
        strokeWidth="12"
        opacity="0.28"
      />

      {/* Top Bestseller Line */}
      <text
        x="160"
        y="36"
        textAnchor="middle"
        fill="#F4D36A"
        fontSize="11.5"
        fontWeight="700"
        letterSpacing="2.4"
        fontFamily="Be Vietnam Pro, sans-serif"
      >
        #1 NEW YORK TIMES BESTSELLER
      </text>

      {/* Corinthian Gold Helmet Silhouette */}
      <g filter="url(#helmetShadow)">
        {/* Dark inner recess behind eye/nose opening */}
        <path
          d="M92 220 C92 200 135 198 148 228 L151 285 C151 294 169 294 169 285 L172 228 C185 198 228 200 228 220 L226 355 L94 355 Z"
          fill="url(#helmetInterior)"
        />

        {/* Main Golden Helmet Shape with eye cutouts */}
        <path
          fillRule="evenodd"
          d="
            M160 66
            C92 66 56 122 56 196
            C56 266 64 342 74 378
            C78 390 100 392 128 386
            L132 332
            C120 326 112 314 112 296
            L110 264
            C98 258 92 246 94 232
            C96 214 114 205 132 212
            C144 216 148 228 148 242
            L148 282
            C148 292 172 292 172 282
            L172 242
            C172 228 176 216 188 212
            C206 205 224 214 226 232
            C228 246 222 258 210 264
            L208 296
            C208 314 200 326 188 332
            L192 386
            C220 392 242 390 246 378
            C256 342 264 266 264 196
            C264 122 228 66 160 66
            Z
          "
          fill="url(#goldHelmet)"
        />
        {/* Metallic sheen overlay */}
        <path
          fillRule="evenodd"
          d="
            M160 66
            C92 66 56 122 56 196
            C56 266 64 342 74 378
            C78 390 100 392 128 386
            L132 332
            C120 326 112 314 112 296
            L110 264
            C98 258 92 246 94 232
            C96 214 114 205 132 212
            C144 216 148 228 148 242
            L148 282
            C148 292 172 292 172 282
            L172 242
            C172 228 176 216 188 212
            C206 205 224 214 226 232
            C228 246 222 258 210 264
            L208 296
            C208 314 200 326 188 332
            L192 386
            C220 392 242 390 246 378
            C256 342 264 266 264 196
            C264 122 228 66 160 66
            Z
          "
          fill="url(#helmetSheen)"
        />

        {/* Nose-guard bronze rivets */}
        {[244, 254, 264, 274].map((y) => (
          <g key={y} fill="#7B5614" opacity="0.65">
            <circle cx="155" cy={y} r="1.4" />
            <circle cx="165" cy={y} r="1.4" />
          </g>
        ))}

        {/* Cheek-guard subtle rivet trim */}
        {[218, 232, 246, 260, 274].map((y, idx) => (
          <g key={idx} fill="#7B5614" opacity="0.45">
            <circle cx={90 + idx * 1.2} cy={y} r="1.2" />
            <circle cx={230 - idx * 1.2} cy={y} r="1.2" />
          </g>
        ))}
      </g>

      {/* Typography etched on the golden helmet */}
      {/* Decorative cursive "The" */}
      <text
        x="160"
        y="112"
        textAnchor="middle"
        fill="#24190C"
        fontSize="30"
        fontStyle="italic"
        fontFamily="Cormorant Garamond, Georgia, serif"
      >
        The
      </text>
      {/* Subtle flourish around "The" */}
      <path
        d="M112 104 C122 92 135 96 140 105 M180 105 C188 94 202 96 206 106"
        fill="none"
        stroke="#24190C"
        strokeWidth="1.2"
        opacity="0.7"
      />

      {/* SONG OF */}
      <text
        x="160"
        y="151"
        textAnchor="middle"
        fill="#23180B"
        fontSize="33"
        fontWeight="600"
        letterSpacing="2.2"
        fontFamily="Newsreader, Georgia, serif"
      >
        SONG OF
      </text>

      {/* ACHILLES */}
      <text
        x="160"
        y="190"
        textAnchor="middle"
        fill="#23180B"
        fontSize="35"
        fontWeight="600"
        letterSpacing="2.8"
        fontFamily="Newsreader, Georgia, serif"
      >
        ACHILLES
      </text>

      {/* A NOVEL */}
      <text
        x="160"
        y="394"
        textAnchor="middle"
        fill="#F4D36A"
        fontSize="9.5"
        fontWeight="600"
        letterSpacing="2.4"
        fontFamily="Be Vietnam Pro, sans-serif"
      >
        A NOVEL · TRƯỜNG CA ACHILLES
      </text>

      {/* Author Name at bottom */}
      <text
        x="160"
        y="436"
        textAnchor="middle"
        fill="#F4D36A"
        fontSize="21"
        fontWeight="600"
        letterSpacing="4.2"
        fontFamily="Newsreader, Georgia, serif"
      >
        MADELINE MILLER
      </text>
    </svg>
  );
};

/**
 * Iconic Sprayed Turquoise/Teal Fore-Edge with Crimson Greek Motifs (shown on the side edge of the 3D book)
 */
export const AchillesSprayedEdge: React.FC<{ className?: string }> = ({
  className = '',
}) => (
  <svg
    viewBox="0 0 28 320"
    className={`h-full w-full ${className}`}
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="tealEdge" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#0E7C86" />
        <stop offset="50%" stopColor="#17A2AD" />
        <stop offset="100%" stopColor="#0C6B74" />
      </linearGradient>
    </defs>
    <rect width="28" height="320" fill="url(#tealEdge)" />
    {/* Stamped crimson Greek icons along page edges */}
    <g fill="#7A182B" stroke="#7A182B" strokeWidth="1" opacity="0.88">
      {/* Shield & crossed spears */}
      <line x1="6" y1="22" x2="22" y2="48" strokeWidth="1.4" />
      <line x1="22" y1="22" x2="6" y2="48" strokeWidth="1.4" />
      <circle cx="14" cy="35" r="7" />
      {/* Greek Lyre */}
      <path
        d="M8 76 C6 88 9 98 14 98 C19 98 22 88 20 76 M9 80 H19 M12 80 V96 M16 80 V96"
        fill="none"
        strokeWidth="1.5"
      />
      {/* Laurel leaves */}
      <path d="M14 120 L10 132 L14 128 L18 132 Z M14 130 L9 142 L14 138 L19 142 Z" />
      {/* Greek Trireme Ship */}
      <path d="M5 178 Q14 186 23 178 L20 183 H8 Z" />
      <path d="M14 162 V178 M14 164 Q21 170 14 175 Z" />
      {/* Torch */}
      <rect x="13" y="218" width="2" height="16" />
      <path d="M14 205 C18 210 18 216 14 218 C10 216 10 210 14 205 Z" />
      {/* Amphora vase */}
      <ellipse cx="14" cy="264" rx="6" ry="8" />
      <rect x="12" y="252" width="4" height="5" />
      <path d="M9 255 Q6 260 9 264 M19 255 Q22 260 19 264" fill="none" />
      {/* Running horse */}
      <path d="M7 298 Q14 290 21 296 L22 306 H19 L18 300 H11 L10 306 H7 Z" />
    </g>
  </svg>
);

/**
 * Simulated Realistic Book Spine for "Trường Ca Achilles" (matches the collector's crimson & gold foil edition)
 */
export const AchillesSpineArt: React.FC<{ className?: string }> = ({
  className = '',
}) => (
  <div
    className={`relative flex h-full w-full flex-col items-center justify-between overflow-hidden px-1 py-3 ${className}`}
    style={{
      background:
        'linear-gradient(90deg, #621020 0%, #922035 28%, #9C253B 52%, #7D182A 82%, #520D1A 100%)',
    }}
  >
    {/* Subtle wave texture lines on spine */}
    <div
      className="pointer-events-none absolute inset-0 opacity-25"
      style={{
        backgroundImage:
          'repeating-linear-gradient(155deg, transparent 0px, transparent 5px, rgba(244, 211, 106, 0.35) 5px, rgba(244, 211, 106, 0.35) 6px)',
      }}
    />

    {/* Top gold foil band & mini helmet */}
    <div className="relative z-10 flex flex-col items-center gap-1.5 w-full">
      <div className="h-[2px] w-full bg-[#E8C15A]/85" />
      <div className="h-[1px] w-4/5 bg-[#E8C15A]/50" />
      <svg viewBox="0 0 24 28" className="mt-0.5 h-5 w-5" aria-hidden="true">
        <path
          d="M12 2 C6 2 3 7 3 13 C3 19 4 24 6 26 H10 V20 C8 19 8 15 10 15 H14 C16 15 16 19 14 20 V26 H18 C20 24 21 19 21 13 C21 7 18 2 12 2 Z"
          fill="#F2CE68"
        />
      </svg>
    </div>

    {/* Vertical Gold Foil Title */}
    <div className="relative z-10 my-2 flex flex-1 items-center justify-center overflow-hidden">
      <span
        className="font-display text-sm sm:text-[15px] font-bold tracking-[0.14em] text-[#F7DC88] drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]"
        style={{
          writingMode: 'vertical-rl',
          textOrientation: 'mixed',
        }}
      >
        TRƯỜNG CA ACHILLES
      </span>
    </div>

    {/* Bottom author & teal collector seal */}
    <div className="relative z-10 flex flex-col items-center gap-1.5 w-full">
      <span
        className="font-serif text-[9px] font-semibold tracking-[0.16em] text-[#F2CE68]/90 uppercase"
        style={{
          writingMode: 'vertical-rl',
          textOrientation: 'mixed',
        }}
      >
        M. MILLER
      </span>
      <div className="h-2 w-2 rounded-full bg-[#18A1AC] ring-1 ring-[#F2CE68]/80" />
      <div className="h-[2px] w-full bg-[#E8C15A]/85" />
    </div>
  </div>
);
