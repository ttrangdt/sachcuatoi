import React from 'react';
import { BookItem } from '../types/book';

/**
 * Photorealistic 3D Clothbound / Hardcover Spine (inspired by Reference Images 1 & 2):
 * - Crisp woven linen/cloth grain
 * - Rounded 3D cylinder light & shadow along spine edges
 * - Top framed cover-illustration thumbnail (like Image 1)
 * - Sharp, legible vertical literary title, author, and framed year/publisher emblem
 */
export const RealisticBookSpine: React.FC<{
  book: BookItem;
  coverThumbUrl?: string | null;
  heightClass?: string;
}> = ({ book, coverThumbUrl, heightClass = 'h-[158px] sm:h-[174px] lg:h-[188px]' }) => {
  const isAchilles = book.id === 'truong-ca-achilles';
  const isNguoiRuNgu = book.id === 'nguoi-ru-ngu';
  const pubYear = isAchilles ? '2011' : isNguoiRuNgu ? '2009' : 'PDF';

  return (
    <div
      className={`relative flex ${heightClass} w-full flex-col items-center justify-between overflow-hidden rounded-t-[5px] rounded-b-[2px] px-1.5 py-2.5`}
      style={{
        backgroundColor: book.spineColor,
        color: book.spineTextColor,
        // Authentic 3D cylindrical hardcover spine shading + woven linen cloth texture
        backgroundImage: `
          repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 3px),
          repeating-linear-gradient(90deg, rgba(0,0,0,0.04) 0px, rgba(0,0,0,0.04) 1px, transparent 1px, transparent 3px),
          linear-gradient(90deg, rgba(0,0,0,0.34) 0%, rgba(255,255,255,0.18) 11%, rgba(255,255,255,0.06) 24%, rgba(0,0,0,0) 52%, rgba(0,0,0,0.18) 84%, rgba(0,0,0,0.46) 100%)
        `,
        boxShadow:
          'inset 0 2px 3px rgba(255,255,255,0.28), inset 0 -3px 5px rgba(0,0,0,0.38)',
      }}
    >
      {/* Subtle vertical hinge crease lines like a real bound hardcover */}
      <div className="pointer-events-none absolute inset-y-0 left-[4px] w-[1px] bg-black/25" />
      <div className="pointer-events-none absolute inset-y-0 right-[4px] w-[1px] bg-black/25" />

      {/* Top Miniature Framed Cover Vignette (Signature detail from Reference Image 1) */}
      <div
        className="relative z-10 h-9 w-9 sm:h-10 sm:w-10 shrink-0 overflow-hidden rounded-[2px] border shadow-sm"
        style={{ borderColor: `${book.spineAccent}AA` }}
      >
        {isAchilles ? (
          <svg viewBox="0 0 40 40" className="h-full w-full">
            <rect width="40" height="40" fill="#7E172A" />
            <path
              d="M0 10 Q10 4 20 10 T40 10 M0 20 Q10 14 20 20 T40 20 M0 30 Q10 24 20 30 T40 30"
              fill="none"
              stroke="#C95668"
              strokeWidth="1"
              opacity="0.5"
            />
            <path
              d="M20 6 C12 6 8 12 8 20 C8 27 9 33 11 35 H16 V26 C13 25 13 20 16 20 H24 C27 20 27 25 24 26 V35 H29 C31 33 32 27 32 20 C32 12 28 6 20 6 Z"
              fill="#F3CE68"
            />
          </svg>
        ) : coverThumbUrl ? (
          <img
            src={coverThumbUrl}
            alt=""
            className="h-full w-full object-cover object-top"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center text-[10px] font-bold"
            style={{ backgroundColor: 'rgba(0,0,0,0.28)', color: book.spineAccent }}
          >
            {book.title.slice(0, 2).toUpperCase()}
          </div>
        )}
      </div>

      {/* Ornate embossed foil hairline divider (Image 2 touch) */}
      <div
        className="relative z-10 my-1 h-[1.5px] w-4/5 opacity-80"
        style={{ backgroundColor: book.spineAccent }}
      />

      {/* Crisp Vertical Literary Title */}
      <div className="relative z-10 flex flex-1 items-center justify-center overflow-hidden py-0.5">
        <span
          className="font-display text-[13px] sm:text-[15px] font-bold tracking-[0.09em] leading-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.55)]"
          style={{
            writingMode: 'vertical-rl',
            textOrientation: 'mixed',
          }}
        >
          {book.title.toUpperCase()}
        </span>
      </div>

      {/* Author + Framed Year Box at Bottom (Signature detail from Reference Image 1) */}
      <div className="relative z-10 flex w-full flex-col items-center gap-1 pt-1">
        <span className="max-w-full truncate px-0.5 text-[7.5px] font-semibold uppercase tracking-wider opacity-90">
          {book.author.split(' ').slice(-1)[0]}
        </span>
        <span
          className="rounded-[2px] border px-1.5 py-[1px] font-mono text-[8px] font-bold tracking-wider"
          style={{
            borderColor: `${book.spineAccent}AA`,
            color: book.spineAccent,
          }}
        >
          {pubYear}
        </span>
      </div>
    </div>
  );
};
