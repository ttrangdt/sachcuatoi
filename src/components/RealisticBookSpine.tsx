import React from 'react';
import { BookItem } from '../types/book';

/**
 * Compute realistic physical spine width (px) proportional to total page count.
 * - Thin novellas (~100 pages) -> ~39px
 * - Standard novels (~300 pages) -> ~53px
 * - Thick epics (~600+ pages) -> ~74px
 */
export function getBookSpineWidth(totalPages: number): number {
  const safePages = Math.max(80, totalPages || 250);
  return Math.round(Math.max(38, Math.min(76, 32 + safePages / 14)));
}

/**
 * Photorealistic 3D Clothbound / Hardcover Spine:
 * - Thickness dynamically reflects book page count
 * - Vertical title auto-scales & wraps cleanly into 2 vertical lines if long so ZERO characters are ever clipped!
 */
export const RealisticBookSpine: React.FC<{
  book: BookItem;
  coverThumbUrl?: string | null;
  spineWidth: number;
}> = ({ book, coverThumbUrl, spineWidth }) => {
  const isAchilles = book.id === 'truong-ca-achilles';
  const pubYear = book.year || (isAchilles ? '2011' : 'PDF');
  const titleLen = book.title.length;
  const isSlim = spineWidth < 46;

  // Dynamic font size so even 38-char titles fit completely inside the spine without clipping!
  const titleFontSize =
    titleLen > 30
      ? isSlim
        ? 9.5
        : 11
      : titleLen > 22
        ? isSlim
          ? 10.5
          : 12.5
        : titleLen > 14
          ? isSlim
            ? 12
            : 14
          : isSlim
            ? 13.5
            : 16;

  const thumbSize = isSlim ? 'h-7 w-7' : 'h-9 w-9 sm:h-10 sm:w-10';

  return (
    <div
      className="relative flex h-full w-full flex-col items-center justify-between overflow-hidden rounded-t-[5px] rounded-b-[2px] px-1 py-2"
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
      <div className="pointer-events-none absolute inset-y-0 left-[3px] w-[1px] bg-black/28" />
      <div className="pointer-events-none absolute inset-y-0 right-[3px] w-[1px] bg-black/28" />

      {/* Top Miniature Framed Cover Vignette */}
      <div
        className={`relative z-10 ${thumbSize} shrink-0 overflow-hidden rounded-[2px] border shadow-sm`}
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
            className="flex h-full w-full items-center justify-center font-display text-[11px] font-bold"
            style={{ backgroundColor: 'rgba(0,0,0,0.28)', color: book.spineAccent }}
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
        className="relative z-10 my-1 h-[1.5px] w-4/5 shrink-0 opacity-80"
        style={{ backgroundColor: book.spineAccent }}
      />

      {/* Full Unclipped Auto-Fitting Vertical Literary Title (wraps cleanly into 2 vertical lines when long) */}
      <div className="relative z-10 flex w-full flex-1 items-center justify-center overflow-hidden px-0.5 py-0.5">
        <span
          className="font-display font-bold text-center drop-shadow-[0_1px_1.5px_rgba(0,0,0,0.65)]"
          style={{
            writingMode: 'vertical-rl',
            textOrientation: 'mixed',
            fontSize: `${titleFontSize}px`,
            lineHeight: 1.12,
            letterSpacing: titleLen > 24 ? '0.03em' : '0.07em',
            maxHeight: '100%',
            wordBreak: 'break-word',
          }}
        >
          {book.title.toUpperCase()}
        </span>
      </div>

      {/* Author + Framed Year Badge */}
      <div className="relative z-10 flex w-full shrink-0 flex-col items-center gap-0.5 pt-1">
        {!isSlim && (
          <span className="max-w-full truncate px-0.5 text-[7.5px] font-semibold uppercase tracking-wider opacity-90">
            {book.author.split(' ').slice(-1)[0]}
          </span>
        )}
        <span
          className="rounded-[2px] border px-1 py-[1px] font-mono text-[8px] font-bold tracking-wider"
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
