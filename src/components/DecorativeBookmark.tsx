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
    id: 'crimson-silk',
    name: 'Dải lụa đỏ đô',
    tagline: 'Cổ điển, viền chỉ vàng',
    accentColor: '#9E2A2B',
  },
  {
    id: 'gold-tassel',
    name: 'Tua rua hoàng kim',
    tagline: 'Thẻ khắc đồng & tua lụa',
    accentColor: '#C59238',
  },
  {
    id: 'maple-leaf',
    name: 'Lá phong ép khô',
    tagline: 'Thơ mộng sắc thu',
    accentColor: '#C05621',
  },
  {
    id: 'brass-clip',
    name: 'Kẹp giấy đồng thau',
    tagline: 'Tinh giản, sang trọng',
    accentColor: '#B5893D',
  },
  {
    id: 'sakura-tag',
    name: 'Thẻ hoa anh đào',
    tagline: 'Giấy washi hồng phấn',
    accentColor: '#D4768A',
  },
  {
    id: 'emerald-velvet',
    name: 'Nhung xanh ngọc',
    tagline: 'Họa tiết sao đêm',
    accentColor: '#235347',
  },
];

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
      ? 'w-6 h-12'
      : size === 'lg'
        ? 'w-11 h-28'
        : 'w-9 h-22';

  switch (styleId) {
    case 'crimson-silk':
      return (
        <svg
          viewBox="0 0 44 110"
          className={`${dims} drop-shadow-[0_6px_8px_rgba(0,0,0,0.28)] bookmark-sway ${className}`}
          aria-label="Dải lụa đỏ đô"
        >
          <defs>
            <linearGradient id="crimsonSilk" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#7C1D1E" />
              <stop offset="45%" stopColor="#A82D2F" />
              <stop offset="100%" stopColor="#6B1718" />
            </linearGradient>
          </defs>
          <path
            d="M4 0 H40 V106 L22 90 L4 106 Z"
            fill="url(#crimsonSilk)"
          />
          <path
            d="M9 0 V95 L22 83 L35 95 V0"
            fill="none"
            stroke="#E7C27D"
            strokeWidth="1.2"
            strokeDasharray="3 2.5"
            opacity="0.85"
          />
          <circle cx="22" cy="24" r="5" fill="none" stroke="#E7C27D" strokeWidth="1.3" />
          <path d="M22 16 V32 M14 24 H30" stroke="#E7C27D" strokeWidth="1" opacity="0.8" />
        </svg>
      );

    case 'gold-tassel':
      return (
        <svg
          viewBox="0 0 44 116"
          className={`${dims} drop-shadow-[0_6px_8px_rgba(0,0,0,0.28)] bookmark-sway ${className}`}
          aria-label="Tua rua hoàng kim"
        >
          <defs>
            <linearGradient id="goldPlate" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#F2D492" />
              <stop offset="50%" stopColor="#C89236" />
              <stop offset="100%" stopColor="#8F611B" />
            </linearGradient>
          </defs>
          <rect x="6" y="0" width="32" height="68" rx="4" fill="url(#goldPlate)" />
          <rect
            x="10"
            y="6"
            width="24"
            height="56"
            rx="2"
            fill="none"
            stroke="#FFF5DC"
            strokeWidth="1"
            opacity="0.7"
          />
          <path
            d="M22 20 L25 28 L33 28 L26.5 33 L29 41 L22 36 L15 41 L17.5 33 L11 28 L19 28 Z"
            fill="#FFF3D1"
            opacity="0.9"
          />
          {/* Cord & Tassel */}
          <line x1="22" y1="68" x2="22" y2="82" stroke="#C89236" strokeWidth="2.5" />
          <ellipse cx="22" cy="83" rx="6" ry="3.5" fill="#8F611B" />
          <path
            d="M16 85 L12 112 M19 86 L17 114 M22 86 L22 115 M25 86 L27 114 M28 85 L32 112"
            stroke="#D9A443"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );

    case 'maple-leaf':
      return (
        <svg
          viewBox="0 0 48 112"
          className={`${dims} drop-shadow-[0_6px_8px_rgba(0,0,0,0.26)] bookmark-sway ${className}`}
          aria-label="Lá phong ép khô"
        >
          <defs>
            <linearGradient id="mapleGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#E07A38" />
              <stop offset="60%" stopColor="#B8431E" />
              <stop offset="100%" stopColor="#7C2612" />
            </linearGradient>
          </defs>
          <rect x="22.5" y="0" width="3" height="44" fill="#7C3A1D" rx="1.5" />
          <path
            d="M24 34 L28 48 L41 44 L34 57 L45 64 L32 69 L36 80 L25 75 L24 98 L23 75 L12 80 L16 69 L3 64 L14 57 L7 44 L20 48 Z"
            fill="url(#mapleGrad)"
          />
          <path
            d="M24 40 V76 M24 56 L14 52 M24 56 L34 52 M24 65 L14 66 M24 65 L34 66"
            stroke="#F8CBA6"
            strokeWidth="1"
            opacity="0.65"
          />
        </svg>
      );

    case 'brass-clip':
      return (
        <svg
          viewBox="0 0 40 96"
          className={`${dims} drop-shadow-[0_5px_7px_rgba(0,0,0,0.25)] ${className}`}
          aria-label="Kẹp giấy đồng thau"
        >
          <defs>
            <linearGradient id="brassWire" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#F5DE9E" />
              <stop offset="50%" stopColor="#C1903F" />
              <stop offset="100%" stopColor="#855C1D" />
            </linearGradient>
          </defs>
          <path
            d="M12 0 V70 C12 81 28 81 28 70 V18 C28 11 18 11 18 18 V62 C18 67 24 67 24 62 V26"
            fill="none"
            stroke="url(#brassWire)"
            strokeWidth="3.6"
            strokeLinecap="round"
          />
          <circle cx="20" cy="74" r="3" fill="#F5DE9E" />
        </svg>
      );

    case 'sakura-tag':
      return (
        <svg
          viewBox="0 0 46 112"
          className={`${dims} drop-shadow-[0_6px_8px_rgba(0,0,0,0.22)] bookmark-sway ${className}`}
          aria-label="Thẻ hoa anh đào"
        >
          <defs>
            <linearGradient id="washiPink" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FCE7EC" />
              <stop offset="100%" stopColor="#EBB5C3" />
            </linearGradient>
          </defs>
          <path
            d="M5 0 H41 V96 C41 102 36 106 30 106 H16 C10 106 5 102 5 96 Z"
            fill="url(#washiPink)"
            stroke="#D68FA1"
            strokeWidth="1"
          />
          {/* Sakura blossom */}
          <g transform="translate(23 48)">
            {[0, 72, 144, 216, 288].map((deg) => (
              <path
                key={deg}
                d="M0 0 C-5 -6 -6 -14 0 -17 C6 -14 5 -6 0 0 Z"
                fill="#D86C84"
                opacity="0.88"
                transform={`rotate(${deg})`}
              />
            ))}
            <circle cx="0" cy="0" r="3" fill="#F9E076" />
          </g>
          <circle cx="15" cy="82" r="3" fill="#D86C84" opacity="0.55" />
          <circle cx="31" cy="24" r="2.5" fill="#D86C84" opacity="0.55" />
        </svg>
      );

    case 'emerald-velvet':
    default:
      return (
        <svg
          viewBox="0 0 44 110"
          className={`${dims} drop-shadow-[0_6px_8px_rgba(0,0,0,0.3)] bookmark-sway ${className}`}
          aria-label="Nhung xanh ngọc"
        >
          <defs>
            <linearGradient id="emeraldGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#163A31" />
              <stop offset="50%" stopColor="#265E4F" />
              <stop offset="100%" stopColor="#14332B" />
            </linearGradient>
          </defs>
          <path d="M4 0 H40 V98 L22 110 L4 98 Z" fill="url(#emeraldGrad)" />
          <path
            d="M8 0 V95 L22 104 L36 95 V0"
            fill="none"
            stroke="#D9B872"
            strokeWidth="1.2"
          />
          {/* Crescent moon & star */}
          <path
            d="M25 32 A9 9 0 1 0 25 48 A7 7 0 1 1 25 32 Z"
            fill="#F2D794"
          />
          <circle cx="28" cy="40" r="1.8" fill="#F2D794" />
          <circle cx="22" cy="64" r="1.5" fill="#F2D794" opacity="0.8" />
          <circle cx="22" cy="76" r="1.2" fill="#F2D794" opacity="0.6" />
        </svg>
      );
  }
};
