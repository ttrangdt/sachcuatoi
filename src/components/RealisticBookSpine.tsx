import React from 'react';
import { BookItem } from '../types/book';

/**
 * Photorealistic 3D Clothbound / Hardcover Spine:
 * Tall, sharp, legible vertical title, crisp top cover vignette, linen texture & 3D shading.
 */
export const RealisticBookSpine: React.FC<{
  book: BookItem;
  coverThumbUrl?: string | null;
}> = ({ book, coverThumbUrl }) => {
  const isAchilles = book.id === 'truong-ca-achilles';
  const isNguoiRuNgu = book.id === 'nguoi-ru-ngu';
  const pubYear = isAchilles ? '2011' : isNguoiRuNgu ? '2009' : 'PDF';

  return (
    <div
      className="relative flex h-full w-full flex-col items-center justify-between overflow-hidden rounded-t-[5px] rounded-b-[2px] px-1.5 py-2.5"
      style={{
        backgroundColor: book.spineColor,
        color: book.spineTextColor,
        backgroundImage: `
          repeating-linear-gradient(0deg, rgba(255,255,255,0.035) 0px, rgba(255,255,255,0.035) 1px, transparent 1px, transparent 3px),
          repeating-linear-gradient(90deg, rgba(0,0,0,0.04) 0px, rgba(0,0,0,0.04) 1px, transparent 1px, transparent 3px),
          linear-gradient(90deg, rgba(0,0,0,0.34) 0%, rgba(255,255,255,0.2) 12%, rgba(255,255,255,0.06) 24%, rgba(0,0,0,0) 52%, rgba(0,0,0,0.18) 84%, rgba(0,0,0,0.48) 100%)
        `,
        boxShadow:
          'inset 0 2px 3px rgba(255,255,255,0.3), inset 0 -3px 5px rgba(0,0,0,0.4)',
      }}
    >
      {/* Bound hardcover hinge grooves */}
      <div className="pointer-events-none absolute inset-y-0 left-[4px] w-[1px] bg-black/28" />
      <div className="pointer-events-none absolute inset-y-0 right-[4px] w-[1px] bg-black/28" />

      {/* Top Miniature Framed Cover Vignette */}
      <div
        className="relative z-10 h-11 w-11 sm:h-12 sm:w-12 shrink-0 overflow-hidden rounded-[2px] border shadow-sm"
        style={{ borderColor: `${book.spineAccent}BB` }}
      >
        {isAchilles ? (
          <svg viewBox="0 0 40 40" className="h-full w-full">
            <rect width="40" height="40" fill="#7E172A" />
            <path
              d="M0 10 Q10 4 20 10 T40 10 M0 20 Q10 14 20 20 T40 20 M0 30 Q10 24 20 30 T40 30"
              fill="none"
              stroke="#C95668"
              strokeWidth="1"
              opacity="0.55"
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
            className="flex h-full w-full items-center justify-center text-xs font-bold"
            style={{ backgroundColor: 'rgba(0,0,0,0.28)', color: book.spineAccent }}
          >
            {book.title.slice(0, 2).toUpperCase()}
          </div>
        )}
      </div>

      {/* Embossed foil hairline */}
      <div
        className="relative z-10 my-1 h-[1.5px] w-4/5 opacity-80"
        style={{ backgroundColor: book.spineAccent }}
      />

      {/* Large, Ultra-Legible Vertical Literary Title */}
      <div className="relative z-10 flex flex-1 items-center justify-center overflow-hidden py-0.5">
        <span
          className="font-display text-[17px] sm:text-[19px] font-bold tracking-[0.09em] leading-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.65)]"
          style={{
            writingMode: 'vertical-rl',
            textOrientation: 'mixed',
          }}
        >
          {book.title.toUpperCase()}
        </span>
      </div>

      {/* Author + Framed Year Badge */}
      <div className="relative z-10 flex w-full flex-col items-center gap-1 pt-1">
        <span className="max-w-full truncate px-0.5 text-[8.5px] font-semibold uppercase tracking-wider opacity-95">
          {book.author.split(' ').slice(-1)[0]}
        </span>
        <span
          className="rounded-[2px] border px-1.5 py-[1px] font-mono text-[9px] font-bold tracking-wider"
          style={{
            borderColor: `${book.spineAccent}BB`,
            color: book.spineAccent,
          }}
        >
          {pubYear}
        </span>
      </div>
    </div>
  );
};
