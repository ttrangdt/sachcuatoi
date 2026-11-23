import React from 'react';
import { BookmarkStyleId } from '../types/book';

export interface BookmarkStyleOption {
  id: BookmarkStyleId;
  name: string;
  tagline: string;
  accentColor: string;
  imageUrl: string;
  objectPosition: string;
  tasselColor: string;
  shape: 'medallion' | 'ribbon' | 'arch';
}

export const BOOKMARK_STYLES: BookmarkStyleOption[] = [
  {
    id: 'mystic-moon',
    name: 'Trăng Sao Huyền Bí',
    tagline: 'Khắc vàng mặt trời & trăng tím',
    accentColor: '#7B56C1',
    imageUrl: './art/bookmarks/mystic-moon.jpg',
    objectPosition: '74% 28%',
    tasselColor: '#9E78E0',
    shape: 'medallion',
  },
  {
    id: 'crystal-butterfly',
    name: 'Bướm Pha Lê Phát Sáng',
    tagline: 'Cánh kính màu & nơ hồng lấp lánh',
    accentColor: '#E16B92',
    imageUrl: './art/bookmarks/crystal-butterfly.jpg',
    objectPosition: '36% 52%',
    tasselColor: '#F08AAE',
    shape: 'arch',
  },
  {
    id: 'vangogh-starry',
    name: 'Đêm Đầy Sao Van Gogh',
    tagline: 'Khung đồng & tua rua xanh lam',
    accentColor: '#2E5B9A',
    imageUrl: './art/bookmarks/vangogh-starry.jpg',
    objectPosition: '60% 50%',
    tasselColor: '#4A82C4',
    shape: 'ribbon',
  },
  {
    id: 'little-prince',
    name: 'Hoàng Tử Bé & Trăng',
    tagline: 'Xích vàng & hoa hồng lơ lửng',
    accentColor: '#3B6BB0',
    imageUrl: './art/bookmarks/little-prince.jpg',
    objectPosition: '36% 24%',
    tasselColor: '#E3B85C',
    shape: 'medallion',
  },
  {
    id: 'golden-feather',
    name: 'Lông Vũ & Cầu Hoa Khô',
    tagline: 'Lông vũ ánh kim & quả cầu pha lê',
    accentColor: '#C89B4F',
    imageUrl: './art/bookmarks/golden-feather.jpg',
    objectPosition: '68% 36%',
    tasselColor: '#D9AE5A',
    shape: 'arch',
  },
  {
    id: 'monet-sunrise',
    name: 'Bình Minh Ấn Tượng',
    tagline: 'Tranh men Monet viền vàng',
    accentColor: '#4E82A8',
    imageUrl: './art/bookmarks/monet-sunrise.jpg',
    objectPosition: '62% 48%',
    tasselColor: '#6EA0C4',
    shape: 'ribbon',
  },
  {
    id: 'silver-jade-hook',
    name: 'Móc Bạc Cánh Bướm Ngọc',
    tagline: 'Móc bạc khắc hoa & hạt ngọc bích',
    accentColor: '#6EA37B',
    imageUrl: './art/bookmarks/silver-jade-hook.jpg',
    objectPosition: '46% 56%',
    tasselColor: '#7FB58A',
    shape: 'ribbon',
  },
  {
    id: 'sakura-cat-chain',
    name: 'Mèo Hoa Anh Đào',
    tagline: 'Dây xích vàng & mặt mèo hoa đào',
    accentColor: '#D98CA3',
    imageUrl: './art/bookmarks/sakura-cat-chain.jpg',
    objectPosition: '76% 68%',
    tasselColor: '#E89EB6',
    shape: 'medallion',
  },
  {
    id: 'sunset-magnetic',
    name: 'Kẹp Hoàng Hôn Mây Cam',
    tagline: 'Kẹp từ tính bầu trời hoàng hôn',
    accentColor: '#E07842',
    imageUrl: './art/bookmarks/sunset-magnetic.jpg',
    objectPosition: '56% 42%',
    tasselColor: '#F09152',
    shape: 'ribbon',
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
  const opt =
    BOOKMARK_STYLES.find((s) => s.id === styleId) || BOOKMARK_STYLES[0];

  const isSm = size === 'sm';
  const isLg = size === 'lg';

  const frameSize =
    opt.shape === 'medallion'
      ? isSm
        ? 'h-9 w-9 rounded-full'
        : isLg
          ? 'h-16 w-16 rounded-full'
          : 'h-12 w-12 rounded-full'
      : opt.shape === 'arch'
        ? isSm
          ? 'h-12 w-8 rounded-t-full rounded-b-lg'
          : isLg
            ? 'h-24 w-14 rounded-t-full rounded-b-xl'
            : 'h-18 w-11 rounded-t-full rounded-b-lg'
        : isSm
          ? 'h-12 w-7 rounded-t-sm rounded-b-lg'
          : isLg
            ? 'h-28 w-13 rounded-t-md rounded-b-xl'
            : 'h-20 w-10 rounded-t-sm rounded-b-lg';

  const chainHeight = isSm ? 'h-2.5' : isLg ? 'h-6' : 'h-4';

  return (
    <div
      className={`bookmark-pendulum relative inline-flex flex-col items-center select-none ${className}`}
      aria-label={opt.name}
    >
      {/* Top Gold Clasp & Delicate Hanging Chain */}
      <div className="h-1.5 w-3 rounded-full bg-gradient-to-r from-[#C89632] via-[#FFF0B3] to-[#B07E20] shadow-xs" />
      <div
        className={`${chainHeight} w-[1.5px] bg-gradient-to-b from-[#F5D680] to-[#C29032]`}
        style={{
          backgroundImage:
            'repeating-linear-gradient(180deg, #F8DF94 0px, #F8DF94 2px, transparent 2px, transparent 4px)',
        }}
      />

      {/* High-Detail Jewel / Enamel Framed Bookmark Body */}
      <div
        className={`relative overflow-hidden border-2 border-[#EBC76C] bg-[#1A1520] shadow-[0_10px_20px_rgba(0,0,0,0.42),0_0_14px_rgba(246,214,132,0.38)] ${frameSize}`}
      >
        <img
          src={opt.imageUrl}
          alt={opt.name}
          className="h-full w-full object-cover scale-110"
          style={{ objectPosition: opt.objectPosition }}
          loading="lazy"
        />

        {/* Metallic inner bezel highlight */}
        <div className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-white/45" />

        {/* Shimmer sweep */}
        <div className="bookmark-shimmer pointer-events-none absolute inset-0" />

        {/* Blink-blink twinkling diamond stars */}
        <svg
          viewBox="0 0 40 60"
          className="pointer-events-none absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          <path
            d="M10 12 L11.5 16.5 L16 18 L11.5 19.5 L10 24 L8.5 19.5 L4 18 L8.5 16.5 Z"
            fill="#FFFCE0"
            className="sparkle-blink"
            style={{ animationDelay: '0s' }}
          />
          <path
            d="M31 40 L32.2 43.8 L36 45 L32.2 46.2 L31 50 L29.8 46.2 L26 45 L29.8 43.8 Z"
            fill="#FFFFFF"
            className="sparkle-blink"
            style={{ animationDelay: '0.9s' }}
          />
        </svg>
      </div>

      {/* Dangling Bottom Pearl & Silk Tassel / Star Drop */}
      {!isSm && (
        <div className="flex flex-col items-center">
          <div className="h-3 w-[1.5px] bg-[#E5BD60]" />
          <div
            className="h-2.5 w-2.5 rounded-full border border-[#F5D680] shadow-sm"
            style={{ backgroundColor: opt.tasselColor }}
          />
          {isLg && (
            <div
              className="mt-0.5 h-6 w-2 rounded-b-full opacity-90"
              style={{
                background: `linear-gradient(180deg, ${opt.tasselColor}, transparent)`,
              }}
            />
          )}
        </div>
      )}
    </div>
  );
};
