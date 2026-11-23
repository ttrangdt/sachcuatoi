import React from 'react';
import { BookmarkStyleId } from '../types/book';

export interface BookmarkStyleOption {
  id: BookmarkStyleId;
  name: string;
  tagline: string;
  accentColor: string;
}

export const BOOKMARK_STYLES: BookmarkStyleOption[] = [
  {
    id: 'mystic-moon',
    name: 'Trăng Sao Huyền Bí',
    tagline: 'Khắc vàng mặt trời & trăng tím',
    accentColor: '#7B56C1',
  },
  {
    id: 'crystal-butterfly',
    name: 'Bướm Pha Lê Phát Sáng',
    tagline: 'Cánh kính màu & nơ hồng lấp lánh',
    accentColor: '#E16B92',
  },
  {
    id: 'vangogh-starry',
    name: 'Đêm Đầy Sao Van Gogh',
    tagline: 'Khung đồng & tua rua xanh lam',
    accentColor: '#2E5B9A',
  },
  {
    id: 'little-prince',
    name: 'Hoàng Tử Bé & Trăng',
    tagline: 'Xích vàng & hoa hồng lơ lửng',
    accentColor: '#3B6BB0',
  },
  {
    id: 'golden-feather',
    name: 'Lông Vũ & Cầu Hoa Khô',
    tagline: 'Lông vũ ánh kim & quả cầu pha lê',
    accentColor: '#C89B4F',
  },
  {
    id: 'monet-sunrise',
    name: 'Bình Minh Ấn Tượng',
    tagline: 'Tranh men Monet viền vàng',
    accentColor: '#4E82A8',
  },
  {
    id: 'silver-jade-hook',
    name: 'Móc Bạc Cánh Bướm Ngọc',
    tagline: 'Móc bạc khắc hoa & hạt ngọc bích',
    accentColor: '#6EA37B',
  },
  {
    id: 'sakura-cat-chain',
    name: 'Mèo Hoa Anh Đào',
    tagline: 'Dây xích vàng & mặt mèo hoa đào',
    accentColor: '#D98CA3',
  },
  {
    id: 'sunset-magnetic',
    name: 'Kẹp Hoàng Hôn Mây Cam',
    tagline: 'Kẹp từ tính bầu trời hoàng hôn',
    accentColor: '#E07842',
  },
];

/** Twinkling blink-blink sparkles overlaid on every enchanted bookmark */
const SparkleStars: React.FC = () => (
  <g className="pointer-events-none">
    <path
      d="M12 18 L13.2 21.8 L17 23 L13.2 24.2 L12 28 L10.8 24.2 L7 23 L10.8 21.8 Z"
      fill="#FFF8D2"
      className="sparkle-blink"
      style={{ animationDelay: '0s' }}
    />
    <path
      d="M42 46 L43 49 L46 50 L43 51 L42 54 L41 51 L38 50 L41 49 Z"
      fill="#FFF5C4"
      className="sparkle-blink"
      style={{ animationDelay: '0.85s' }}
    />
    <path
      d="M18 82 L18.8 84.4 L21.2 85.2 L18.8 86 L18 88.4 L17.2 86 L14.8 85.2 L17.2 84.4 Z"
      fill="#FFFFFF"
      className="sparkle-blink"
      style={{ animationDelay: '1.5s' }}
    />
  </g>
);

interface DecorativeBookmarkProps {
  styleId: BookmarkStyleId;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const DecorativeBookmark: React.FC<DecorativeBookmarkProps> = ({
  styleId,
  size = 'md',
  className = '',
}) => {
  const dims =
    size === 'sm'
      ? 'w-7 h-14'
      : size === 'lg'
        ? 'w-14 h-36'
        : 'w-11 h-28';

  switch (styleId) {
    case 'mystic-moon':
      return (
        <svg
          viewBox="0 0 56 130"
          className={`${dims} drop-shadow-[0_6px_12px_rgba(92,58,158,0.42)] bookmark-pendulum ${className}`}
          aria-label="Trăng Sao Huyền Bí"
        >
          <defs>
            <linearGradient id="mysticPurple" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#6D48B8" />
              <stop offset="55%" stopColor="#462B87" />
              <stop offset="100%" stopColor="#A964B8" />
            </linearGradient>
            <linearGradient id="goldFiligree" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFF0B0" />
              <stop offset="50%" stopColor="#DFAD4C" />
              <stop offset="100%" stopColor="#9C6E1E" />
            </linearGradient>
          </defs>
          {/* Gold hanging chain */}
          <line
            x1="28"
            y1="0"
            x2="28"
            y2="34"
            stroke="url(#goldFiligree)"
            strokeWidth="2.2"
            strokeDasharray="3 2"
          />
          {/* Outer Crescent Moon Enamel */}
          <path
            d="M36 34 A24 24 0 1 0 36 82 A18 18 0 1 1 36 34 Z"
            fill="url(#mysticPurple)"
            stroke="url(#goldFiligree)"
            strokeWidth="2"
          />
          {/* Inner Sunburst */}
          <circle cx="29" cy="58" r="8" fill="#FBE3A0" stroke="#C89232" strokeWidth="1.5" />
          <path
            d="M29 45 L31 51 L37 49 L33 54 L39 58 L33 62 L37 67 L31 65 L29 71 L27 65 L21 67 L25 62 L19 58 L25 54 L21 49 L27 51 Z"
            fill="none"
            stroke="#F4CF74"
            strokeWidth="1.3"
          />
          {/* Pink lotus petals at bottom of moon */}
          <ellipse cx="22" cy="79" rx="6" ry="3" fill="#E89AC2" transform="rotate(-18 22 79)" />
          <ellipse cx="32" cy="80" rx="6" ry="3" fill="#F2B3D2" transform="rotate(14 32 80)" />
          {/* Dangling star drop */}
          <line x1="28" y1="84" x2="28" y2="108" stroke="#DFAD4C" strokeWidth="1.4" />
          <path d="M28 104 L30 110 L36 112 L30 114 L28 120 L26 114 L20 112 L26 110 Z" fill="#F8DE88" />
          <SparkleStars />
        </svg>
      );

    case 'crystal-butterfly':
      return (
        <svg
          viewBox="0 0 56 130"
          className={`${dims} drop-shadow-[0_6px_12px_rgba(225,107,146,0.38)] bookmark-pendulum ${className}`}
          aria-label="Bướm Pha Lê Phát Sáng"
        >
          <defs>
            <linearGradient id="wingPink" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FF9EC0" />
              <stop offset="50%" stopColor="#FFE196" />
              <stop offset="100%" stopColor="#8FD6E8" />
            </linearGradient>
          </defs>
          <line x1="28" y1="0" x2="28" y2="30" stroke="#E5B968" strokeWidth="2" strokeDasharray="3 2" />
          {/* Stained glass butterfly wings */}
          <g stroke="#DFAD4C" strokeWidth="1.8">
            <path d="M28 52 C14 32 4 36 7 54 C9 64 20 66 28 58 Z" fill="url(#wingPink)" />
            <path d="M28 52 C42 32 52 36 49 54 C47 64 36 66 28 58 Z" fill="url(#wingPink)" />
            <path d="M28 58 C18 66 10 76 16 84 C22 88 28 76 28 66 Z" fill="#FFB3CE" />
            <path d="M28 58 C38 66 46 76 40 84 C34 88 28 76 28 66 Z" fill="#9CE0EA" />
          </g>
          {/* Body */}
          <ellipse cx="28" cy="58" rx="2.5" ry="12" fill="#D59E3A" />
          {/* Chain & pink bow charm */}
          <line x1="28" y1="72" x2="28" y2="106" stroke="#E5B968" strokeWidth="1.5" strokeDasharray="2.5 2" />
          <path d="M28 110 C20 104 18 116 28 112 C38 116 36 104 28 110 Z" fill="#F27FA8" stroke="#DFAD4C" strokeWidth="1.2" />
          <SparkleStars />
        </svg>
      );

    case 'vangogh-starry':
      return (
        <svg
          viewBox="0 0 56 136"
          className={`${dims} drop-shadow-[0_6px_12px_rgba(30,64,120,0.4)] bookmark-pendulum ${className}`}
          aria-label="Đêm Đầy Sao Van Gogh"
        >
          <defs>
            <linearGradient id="starrySky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1B3D78" />
              <stop offset="55%" stopColor="#2F66A8" />
              <stop offset="100%" stopColor="#1B2A46" />
            </linearGradient>
          </defs>
          {/* Brass filigree frame */}
          <rect
            x="10"
            y="4"
            width="36"
            height="86"
            rx="5"
            fill="url(#starrySky)"
            stroke="#E5BD60"
            strokeWidth="3"
          />
          {/* Van Gogh Swirling sky & moon */}
          <circle cx="36" cy="20" r="6" fill="#F8DB6E" />
          <path
            d="M14 34 Q24 24 34 34 T44 30 M14 48 Q26 38 38 48"
            fill="none"
            stroke="#9FD0F5"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <circle cx="21" cy="22" r="3" fill="#FCE694" />
          {/* Dark cypress silhouette */}
          <path d="M18 88 C16 70 20 56 22 48 C25 58 26 72 25 88 Z" fill="#12211D" />
          {/* Warm village lights */}
          <rect x="30" y="76" width="5" height="6" fill="#F2B84B" />
          <rect x="37" y="79" width="4" height="5" fill="#F8D477" />
          {/* Blue silk tassel */}
          <line x1="28" y1="90" x2="28" y2="104" stroke="#4D89C9" strokeWidth="2.5" />
          <ellipse cx="28" cy="105" rx="5.5" ry="3" fill="#2A5894" />
          <path
            d="M23 107 L19 132 M26 108 L24 134 M28 108 L28 135 M30 108 L32 134 M33 107 L37 132"
            stroke="#5793D4"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <SparkleStars />
        </svg>
      );

    case 'little-prince':
      return (
        <svg
          viewBox="0 0 56 132"
          className={`${dims} drop-shadow-[0_6px_12px_rgba(48,96,168,0.38)] bookmark-pendulum ${className}`}
          aria-label="Hoàng Tử Bé & Trăng Khuyết"
        >
          <defs>
            <linearGradient id="princeSky" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#264C96" />
              <stop offset="100%" stopColor="#6B8ED6" />
            </linearGradient>
          </defs>
          <line x1="28" y1="0" x2="28" y2="20" stroke="#DFAD4C" strokeWidth="2" />
          {/* Starry blue badge + golden crescent */}
          <circle cx="28" cy="48" r="22" fill="url(#princeSky)" stroke="#ECC76D" strokeWidth="2.4" />
          <path d="M36 33 A16 16 0 1 1 18 58 A12 12 0 1 0 36 33 Z" fill="#FBE6A2" />
          {/* Little Prince silhouette & scarf */}
          <circle cx="28" cy="42" r="5" fill="#F6C86E" />
          <path d="M23 48 Q28 46 33 48 L35 58 H21 Z" fill="#3C6B4B" />
          <path d="M31 48 Q40 46 43 52" fill="none" stroke="#F8D86B" strokeWidth="2.5" strokeLinecap="round" />
          {/* Hanging gold chain + Red Rose charm */}
          <line x1="28" y1="70" x2="28" y2="104" stroke="#E5BD60" strokeWidth="1.6" strokeDasharray="3 2" />
          <circle cx="28" cy="110" r="6" fill="#D94158" stroke="#E5BD60" strokeWidth="1.4" />
          <path d="M28 116 V125 M28 121 L23 118 M28 122 L33 119" stroke="#53945C" strokeWidth="1.6" />
          <SparkleStars />
        </svg>
      );

    case 'golden-feather':
      return (
        <svg
          viewBox="0 0 56 134"
          className={`${dims} drop-shadow-[0_6px_12px_rgba(186,142,64,0.38)] bookmark-pendulum ${className}`}
          aria-label="Lông Vũ Hoàng Kim & Cầu Hoa Khô"
        >
          <defs>
            <linearGradient id="featherGold" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFF2C2" />
              <stop offset="50%" stopColor="#DFB154" />
              <stop offset="100%" stopColor="#A67827" />
            </linearGradient>
          </defs>
          {/* Detailed sculpted metal feather */}
          <path
            d="M28 6 C40 24 44 58 34 94 C31 102 28 106 28 106 C28 106 25 102 22 94 C12 58 16 24 28 6 Z"
            fill="url(#featherGold)"
            stroke="#9C6E1E"
            strokeWidth="1"
          />
          <line x1="28" y1="4" x2="28" y2="112" stroke="#FFF4CE" strokeWidth="1.5" />
          {[24, 38, 52, 66, 80].map((y) => (
            <path
              key={y}
              d={`M28 ${y} L18 ${y + 6} M28 ${y} L38 ${y + 6}`}
              stroke="#B5822B"
              strokeWidth="1"
              opacity="0.7"
            />
          ))}
          {/* Side chain + dried flower glass orb */}
          <path d="M28 8 Q46 38 42 104" fill="none" stroke="#E5BD60" strokeWidth="1.4" strokeDasharray="2.5 2" />
          <circle cx="42" cy="114" r="9" fill="#DCEFF5" fillOpacity="0.85" stroke="#DFAD4C" strokeWidth="1.6" />
          <circle cx="40" cy="114" r="3" fill="#E87DA5" />
          <circle cx="44" cy="116" r="2.4" fill="#6AA86E" />
          <SparkleStars />
        </svg>
      );

    case 'monet-sunrise':
      return (
        <svg
          viewBox="0 0 56 130"
          className={`${dims} drop-shadow-[0_6px_12px_rgba(78,130,168,0.34)] bookmark-pendulum ${className}`}
          aria-label="Bình Minh Ấn Tượng Monet"
        >
          <defs>
            <linearGradient id="monetGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#92B8D4" />
              <stop offset="45%" stopColor="#C8DCE6" />
              <stop offset="100%" stopColor="#5D87A6" />
            </linearGradient>
          </defs>
          <path
            d="M12 18 C12 8 44 8 44 18 V118 C44 122 41 124 38 124 H18 C15 124 12 122 12 118 Z"
            fill="url(#monetGrad)"
            stroke="#DFAD4C"
            strokeWidth="2.8"
          />
          {/* Glowing orange sun + water reflection brushstrokes */}
          <circle cx="34" cy="28" r="5" fill="#F06A3E" />
          <path
            d="M28 42 H40 M26 52 H41 M29 62 H39 M24 74 H37"
            stroke="#F29B56"
            strokeWidth="2.6"
            strokeLinecap="round"
            opacity="0.85"
          />
          {/* Tiny boat silhouette */}
          <path d="M18 96 H34 L31 102 H21 Z" fill="#2A465C" />
          <SparkleStars />
        </svg>
      );

    case 'silver-jade-hook':
      return (
        <svg
          viewBox="0 0 56 136"
          className={`${dims} drop-shadow-[0_6px_10px_rgba(94,138,108,0.36)] bookmark-pendulum ${className}`}
          aria-label="Móc Bạc Cánh Bướm & Ngọc Bích"
        >
          {/* Curved antique silver hook */}
          <path
            d="M14 114 V22 C14 10 34 10 34 22 V30"
            fill="none"
            stroke="#CBD4DA"
            strokeWidth="4.2"
            strokeLinecap="round"
          />
          {/* Hanging bead chain */}
          <line x1="34" y1="30" x2="34" y2="118" stroke="#B6C2C9" strokeWidth="1.5" />
          {/* Jade pearl & green crystal */}
          <circle cx="34" cy="44" r="5" fill="#A9D4A8" stroke="#DCE5E8" strokeWidth="1.2" />
          <circle cx="34" cy="60" r="7" fill="#77B07F" stroke="#E2E8EC" strokeWidth="1.5" />
          {/* Silver butterfly */}
          <path
            d="M34 80 C24 72 20 84 30 88 C22 92 26 98 34 90 C42 98 46 92 38 88 C48 84 44 72 34 80 Z"
            fill="#E7EEF2"
            stroke="#94A3AD"
            strokeWidth="1.2"
          />
          {/* Green clover & mini envelope */}
          <circle cx="34" cy="105" r="5" fill="#9ED197" />
          <rect x="29" y="116" width="10" height="8" rx="1.5" fill="#E3E9ED" stroke="#8C9AA3" strokeWidth="1" />
          <path d="M29 116 L34 121 L39 116" fill="none" stroke="#8C9AA3" strokeWidth="1" />
          <SparkleStars />
        </svg>
      );

    case 'sakura-cat-chain':
      return (
        <svg
          viewBox="0 0 56 134"
          className={`${dims} drop-shadow-[0_6px_12px_rgba(217,140,163,0.38)] bookmark-pendulum ${className}`}
          aria-label="Mèo Hoa Anh Đào Dây Xích Vàng"
        >
          {/* Gold top clip */}
          <rect x="21" y="0" width="14" height="24" rx="4" fill="#E8C268" stroke="#B88930" strokeWidth="1.2" />
          <line x1="28" y1="24" x2="28" y2="74" stroke="#E2B859" strokeWidth="1.6" strokeDasharray="3 2" />
          {/* Enamel round medallion */}
          <circle cx="28" cy="96" r="20" fill="#FFF8F9" stroke="#DFAD4C" strokeWidth="2.8" />
          {/* Sakura blossoms */}
          <circle cx="17" cy="86" r="4.5" fill="#F4A4BD" />
          <circle cx="39" cy="89" r="4" fill="#F6B8CB" />
          <circle cx="36" cy="106" r="3.5" fill="#F4A4BD" />
          {/* Cute white cat silhouette */}
          <path
            d="M23 110 C22 102 24 96 27 94 L25 89 L29 92 L32 89 L32 94 C35 97 35 104 33 110 Z"
            fill="#F3E7E1"
            stroke="#C9A258"
            strokeWidth="1.2"
          />
          <SparkleStars />
        </svg>
      );

    case 'sunset-magnetic':
    default:
      return (
        <svg
          viewBox="0 0 56 124"
          className={`${dims} drop-shadow-[0_6px_10px_rgba(224,120,66,0.36)] bookmark-pendulum ${className}`}
          aria-label="Kẹp Hoàng Hôn Mây Cam"
        >
          <defs>
            <linearGradient id="sunsetClip" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#263B59" />
              <stop offset="48%" stopColor="#F2854B" />
              <stop offset="78%" stopColor="#FBB85E" />
              <stop offset="100%" stopColor="#46333B" />
            </linearGradient>
          </defs>
          <path
            d="M10 0 H46 V102 C46 112 38 118 28 118 C18 118 10 112 10 102 Z"
            fill="url(#sunsetClip)"
            stroke="#FFF4E4"
            strokeWidth="1.2"
          />
          {/* Glowing moon & billowing sunset clouds */}
          <circle cx="20" cy="22" r="4" fill="#FFD9B0" />
          <path
            d="M10 74 Q22 52 34 64 Q42 56 46 66 V92 H10 Z"
            fill="#FF9E44"
            opacity="0.9"
          />
          <path d="M10 92 Q26 84 46 94 V104 C46 112 38 118 28 118 C18 118 10 112 10 104 Z" fill="#2A2029" />
          <SparkleStars />
        </svg>
      );
  }
};
