import React from 'react';
import { BookItem } from '../types/book';

/**
 * Compute realistic physical spine width (px) proportional to total page count.
 */
export function getBookSpineWidth(totalPages: number): number {
  const safePages = Math.max(80, totalPages || 250);
  return Math.round(Math.max(42, Math.min(76, 36 + safePages / 14)));
}

/**
 * Photorealistic 3D Clothbound / Hardcover Spine:
 * - Full uncropped 2:3 miniature cover image on spine
 * - Full author name without mid-word character wrapping (no orphan "O")
 * - Spine color matched to real book cover
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

  // Compute exact author font size from the LONGEST single word vs available spine width so NO word ever splits mid-word!
  const longestAuthorWord = Math.max(
    ...book.author.split(/\s+/).map((w) => w.length),
    4
  );
  const availAuthorW = Math.max(28, spineWidth - 10);
  const fitAuthorSize = availAuthorW / (longestAuthorWord * 0.72);
  const authorFontSize = Math.max(5.4, Math.min(7.4, Number(fitAuthorSize.toFixed(1))));

  return (
    <div
      className="relative flex h-full w-full flex-col items-center justify-between overflow-hidden rounded-t-[5px] rounded-b-[2px] px-1 py-2"
      style={{
        backgroundColor: book.spineColor,
        color: book.spineTextColor,
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

      {/* Top Miniature Full-Cover Vignette (2:3 vertical aspect ratio so 100% of cover is shown without cropping!) */}
      <div
        className="relative z-10 w-[76%] max-w-[44px] aspect-[2/3] shrink-0 overflow-hidden rounded-[2px] border bg-black/20 shadow-xs"
        style={{ borderColor: `${book.spineAccent}AA` }}
      >
        {isAchilles ? (
          <svg viewBox="0 0 40 60" className="h-full w-full">
            <rect width="40" height="60" fill="#7E172A" />
            <path
              d="M0 12 Q10 6 20 12 T40 12 M0 26 Q10 20 20 26 T40 26 M0 40 Q10 34 20 40 T40 40"
              fill="none"
              stroke="#C95668"
              strokeWidth="1"
              opacity="0.55"
            />
            <path
              d="M20 10 C12 10 8 18 8 28 C8 37 9 45 11 48 H16 V36 C13 35 13 29 16 29 H24 C27 29 27 35 24 36 V48 H29 C31 45 32 37 32 28 C32 18 28 10 20 10 Z"
              fill="#F3CE68"
            />
          </svg>
        ) : coverThumbUrl ? (
          <img
            src={coverThumbUrl}
            alt=""
            className="h-full w-full object-contain"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center font-display text-[10px] font-bold"
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

      {/* Full Author Name — never splits mid-word! */}
      <div className="relative z-10 flex w-full shrink-0 flex-col items-center gap-0.5 pt-1 px-0.5">
        <span
          className="w-full text-center font-semibold uppercase leading-[1.15] opacity-95"
          style={{
            fontSize: `${authorFontSize}px`,
            wordBreak: 'keep-all',
            overflowWrap: 'normal',
            letterSpacing: '-0.01em',
          }}
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
