import React from 'react';
import { BookItem } from '../types/book';

/**
 * Compute realistic physical spine width (px) proportional to total page count.
 */
export function getBookSpineWidth(totalPages: number): number {
  const safePages = Math.max(80, totalPages || 250);
  return Math.round(Math.max(40, Math.min(76, 34 + safePages / 14)));
}

/**
 * Photorealistic 3D Clothbound / Hardcover Spine:
 * - Spine color automatically matches the book's real cover color
 * - Full author name displayed cleanly without truncation
 * - Zero artificial diagonal sheen glare
 */
export const RealisticBookSpine: React.FC<{
  book: BookItem;
  coverThumbUrl?: string | null;
  spineWidth: number;
}> = ({ book, coverThumbUrl, spineWidth }) => {
  const isAchilles = book.id === 'truong-ca-achilles';
  const pubYear = book.year || (isAchilles ? '2011' : 'PDF');
  const titleLen = book.title.length;
  const isSlim = spineWidth < 48;

  const titleFontSize =
    titleLen > 30
      ? isSlim
        ? 9.5
        : 10.5
      : titleLen > 22
        ? isSlim
          ? 10.5
          : 12
        : titleLen > 14
          ? isSlim
            ? 11.5
            : 13.5
          : isSlim
            ? 13
            : 15;

  const authorFontSize = book.author.length > 18 ? 6.5 : 7.5;
  const thumbSize = isSlim ? 'h-7 w-7' : 'h-9 w-9 sm:h-10 sm:w-10';

  return (
    <div
      className="relative flex h-full w-full flex-col items-center justify-between overflow-hidden rounded-t-[5px] rounded-b-[2px] px-1 py-2"
      style={{
        backgroundColor: book.spineColor,
        color: book.spineTextColor,
        // Clean natural matte clothbound 3D curvature (no diagonal glare!)
        backgroundImage: `
          repeating-linear-gradient(0deg, rgba(255,255,255,0.025) 0px, rgba(255,255,255,0.025) 1px, transparent 1px, transparent 3px),
          linear-gradient(90deg, rgba(0,0,0,0.28) 0%, rgba(255,255,255,0.12) 14%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.14) 84%, rgba(0,0,0,0.36) 100%)
        `,
        boxShadow:
          'inset 0 1.5px 2px rgba(255,255,255,0.22), inset 0 -2px 4px rgba(0,0,0,0.32)',
      }}
    >
      {/* Bound hardcover hinge grooves */}
      <div className="pointer-events-none absolute inset-y-0 left-[3px] w-[1px] bg-black/22" />
      <div className="pointer-events-none absolute inset-y-0 right-[3px] w-[1px] bg-black/22" />

      {/* Top Miniature Framed Cover Vignette */}
      <div
        className={`relative z-10 ${thumbSize} shrink-0 overflow-hidden rounded-[2px] border shadow-xs`}
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
            className="flex h-full w-full items-center justify-center font-display text-[11px] font-bold"
            style={{ backgroundColor: 'rgba(0,0,0,0.22)', color: book.spineAccent }}
          >
            {book.title
              .split(/\s+/)
              .slice(0, 2)
              .map((w) => w[0])
              .join('')
              .toUpperCase()}
          </div>
        )}
      </div>

      {/* Embossed foil hairline */}
      <div
        className="relative z-10 my-1 h-[1px] w-4/5 shrink-0 opacity-75"
        style={{ backgroundColor: book.spineAccent }}
      />

      {/* Full Unclipped Vertical Literary Title */}
      <div className="relative z-10 flex w-full flex-1 items-center justify-center overflow-hidden px-0.5 py-0.5">
        <span
          className="font-display font-bold text-center"
          style={{
            writingMode: 'vertical-rl',
            textOrientation: 'mixed',
            fontSize: `${titleFontSize}px`,
            lineHeight: 1.12,
            letterSpacing: titleLen > 24 ? '0.03em' : '0.06em',
            maxHeight: '100%',
            wordBreak: 'break-word',
          }}
        >
          {book.title.toUpperCase()}
        </span>
      </div>

      {/* Full Author Name (wrapped cleanly so nothing is cut off!) + Year Badge */}
      <div className="relative z-10 flex w-full shrink-0 flex-col items-center gap-0.5 pt-1 px-0.5">
        <span
          className="w-full text-center font-semibold uppercase leading-[1.15] opacity-95 break-words"
          style={{ fontSize: `${authorFontSize}px` }}
        >
          {book.author}
        </span>
        <span
          className="mt-0.5 rounded-[2px] border px-1 py-[0.5px] font-mono text-[7.5px] font-bold tracking-wider"
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
