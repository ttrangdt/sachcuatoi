import React, { useEffect, useRef, useState } from 'react';
import {
  Bookmark,
  BookOpen,
  CheckCircle2,
  MoveHorizontal,
  Plus,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { BookItem, BookProgress } from '../types/book';
import { getBookCoverUrl } from '../utils/pdfEngine';
import { DecorativeBookmark } from './DecorativeBookmark';
import {
  AchillesCoverArt,
  AchillesSpineArt,
  AchillesSprayedEdge,
} from './AchillesArtwork';
import { RoomMood } from './AmbientRoomEffects';

interface BookshelfProps {
  books: BookItem[];
  progressMap: Record<string, BookProgress>;
  roomMood: RoomMood;
  onOpenBook: (book: BookItem, startPage?: number) => void;
  onDeleteCustomBook?: (bookId: string) => void;
  onAddBookClick?: () => void;
}

const MiniCrownProp: React.FC<{ gold?: boolean }> = ({ gold = false }) => (
  <svg
    viewBox="0 0 42 22"
    className="pointer-events-none h-4 w-8 drop-shadow-[0_3px_5px_rgba(0,0,0,0.5)]"
    aria-hidden="true"
  >
    <path
      d="M4 19 L2 7 L12 13 L21 3 L30 13 L40 7 L38 19 Z"
      fill={gold ? '#E9C46A' : '#D4DCE6'}
      stroke={gold ? '#9A7222' : '#7A8694'}
      strokeWidth="1.2"
    />
    <circle cx="21" cy="3" r="1.8" fill="#FFF8DC" className="sparkle-blink" />
  </svg>
);

const FairyCandleProp: React.FC<{ isEvening: boolean }> = ({ isEvening }) => (
  <div className="pointer-events-none hidden sm:flex flex-col items-center select-none">
    <div
      className={`candle-flame h-3 w-1.5 rounded-full bg-gradient-to-t from-amber-500 via-amber-300 to-yellow-50 ${
        isEvening
          ? 'shadow-[0_0_26px_12px_rgba(251,191,36,0.72)]'
          : 'shadow-[0_0_12px_4px_rgba(251,191,36,0.45)]'
      }`}
    />
    <div className="h-9 w-8 rounded-t-sm rounded-b-md bg-gradient-to-r from-[#DFD4C1] via-[#F7F0E4] to-[#C8BAA5] shadow-[0_6px_10px_rgba(0,0,0,0.4)] border-t border-white/80" />
  </div>
);

/** Photorealistic companion leather/cloth book spines so shelves feel authentically populated */
const AmbientDecoSpine: React.FC<{
  color: string;
  accent: string;
  heightClass: string;
  widthClass: string;
  dimmed: boolean;
}> = ({ color, accent, heightClass, widthClass, dimmed }) => (
  <div
    className={`relative shrink-0 overflow-hidden rounded-t-[3px] border-t border-white/15 shadow-[4px_8px_14px_rgba(0,0,0,0.58)] transition-all duration-500 ${heightClass} ${widthClass} ${
      dimmed ? 'opacity-45' : 'opacity-90'
    }`}
    style={{
      background: `linear-gradient(90deg, rgba(0,0,0,0.34) 0%, ${color} 22%, ${color} 72%, rgba(0,0,0,0.48) 100%)`,
    }}
    aria-hidden="true"
  >
    <div className="pointer-events-none absolute inset-y-0 left-0 w-1.5 bg-gradient-to-r from-white/18 to-transparent" />
    <div className="mx-1 mt-3 h-[2px] opacity-65" style={{ backgroundColor: accent }} />
    <div className="mx-1.5 mt-1 h-[1px] opacity-40" style={{ backgroundColor: accent }} />
    <div className="absolute inset-x-1 bottom-3 h-[2px] opacity-65" style={{ backgroundColor: accent }} />
  </div>
);

/**
 * Interactive Book on Shelf:
 * - Default: stands spine-out naturally.
 * - Hover spine: glides up prominently with golden rim glow.
 * - Click spine: smoothly expands & rotates IN PLACE ON THE SHELF into its full Front Cover (no popup modal!), pushing neighbors aside!
 * - Click revealed cover (or "Đọc sách" pill): opens the BookReader.
 */
const InlineFlipBook: React.FC<{
  book: BookItem;
  progress?: BookProgress;
  isExpanded: boolean;
  isAnyHoveredOrExpanded: boolean;
  isThisHovered: boolean;
  onHoverChange: (hovered: boolean) => void;
  onToggleExpand: () => void;
  onOpenReader: () => void;
  onDelete?: () => void;
}> = ({
  book,
  progress,
  isExpanded,
  isAnyHoveredOrExpanded,
  isThisHovered,
  onHoverChange,
  onToggleExpand,
  onOpenReader,
  onDelete,
}) => {
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const isAchilles = book.id === 'truong-ca-achilles';
  const hasBookmark = Boolean(progress?.bookmarkedPage);

  useEffect(() => {
    if (isAchilles || !isExpanded || coverUrl) return;
    let active = true;
    getBookCoverUrl(book).then((url) => {
      if (active) setCoverUrl(url);
    });
    return () => {
      active = false;
    };
  }, [book, isAchilles, isExpanded, coverUrl]);

  const spineWidth = isAchilles ? 50 : 56;
  const coverWidth = 136;

  return (
    <div
      className="relative flex flex-col items-center transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
      style={{
        width: `${isExpanded ? coverWidth : spineWidth}px`,
        zIndex: isExpanded ? 35 : isThisHovered ? 28 : 10,
      }}
      onMouseEnter={() => onHoverChange(true)}
      onMouseLeave={() => onHoverChange(false)}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Floating Hover Tooltip when in spine state */}
      {isThisHovered && !isExpanded && (
        <div className="pointer-events-none absolute -top-13 left-1/2 z-40 -translate-x-1/2 whitespace-nowrap rounded-xl border border-[#F0D594]/60 bg-[#1B130F]/94 px-3 py-1.5 text-center shadow-xl backdrop-blur-md">
          <p className="font-display text-sm font-bold text-[#FBF2DE]">
            {book.title}
          </p>
          <p className="text-[10px] text-[#DEC69C]">
            Nhấn để xoay xem bìa sách
          </p>
        </div>
      )}

      {/* Peeking Sparkling Bookmark */}
      {hasBookmark && progress && (
        <div
          className={`pointer-events-none absolute -top-7 z-30 transition-transform duration-300 ${
            isExpanded
              ? 'right-3 -translate-y-2'
              : isThisHovered
                ? '-translate-y-4 scale-110'
                : ''
          }`}
        >
          <DecorativeBookmark styleId={progress.bookmarkStyle} size="sm" />
        </div>
      )}

      {/* Delete button for custom uploaded books */}
      {book.isCustom && onDelete && (isThisHovered || isExpanded) && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute -top-2 -left-2 z-40 flex h-5 w-5 items-center justify-center rounded-full bg-[#8E2C2C] text-white shadow"
          title="Xóa sách đã tải lên"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      )}

      {/* INLINE MORPHING BOOK: SPINE <-> FULL FRONT COVER RIGHT ON THE SHELF */}
      {isExpanded ? (
        <div className="relative flex flex-col items-center">
          <button
            type="button"
            onClick={onOpenReader}
            className="group/cover relative flex h-[168px] sm:h-[184px] lg:h-[196px] w-[136px] -translate-y-3 text-left transition-transform duration-300 hover:scale-[1.04] focus:outline-none"
            title={`Nhấn để mở đọc ${book.title}`}
          >
            {/* Front Hardcover Face */}
            <div
              className="book-sheen relative z-10 h-full flex-1 overflow-hidden rounded-l-[3px] rounded-r-[5px] shadow-[10px_16px_28px_-4px_rgba(0,0,0,0.72),0_0_24px_rgba(246,214,132,0.45)] ring-1 ring-[#F4D36A]/65"
              style={{ backgroundColor: book.spineColor }}
            >
              <div
                className="pointer-events-none absolute inset-y-0 left-0 z-20 w-2.5"
                style={{
                  background:
                    'linear-gradient(90deg, rgba(255,255,255,0.24) 0%, rgba(0,0,0,0.08) 45%, rgba(0,0,0,0.26) 85%, rgba(255,255,255,0.1) 100%)',
                }}
              />
              {isAchilles ? (
                <AchillesCoverArt />
              ) : coverUrl ? (
                <img
                  src={coverUrl}
                  alt={book.title}
                  className="h-full w-full object-cover object-top"
                />
              ) : (
                <div
                  className="flex h-full flex-col justify-between p-3 pl-4"
                  style={{ color: book.spineTextColor }}
                >
                  <span className="text-[8px] uppercase tracking-wider opacity-75">
                    {book.genre}
                  </span>
                  <div>
                    <p className="font-display text-base font-bold leading-tight">
                      {book.title}
                    </p>
                    <p className="mt-0.5 font-serif text-[10px] italic opacity-85">
                      {book.author}
                    </p>
                  </div>
                  <div
                    className="h-0.5 w-8"
                    style={{ backgroundColor: book.spineAccent }}
                  />
                </div>
              )}

              {/* Hover/Visible "Mở đọc" pill overlaid cleanly at bottom of revealed cover */}
              <div className="absolute inset-x-1.5 bottom-2 z-30 flex justify-center">
                <span className="inline-flex items-center gap-1 rounded-full bg-[#1C120D]/90 px-2.5 py-1 text-[10px] font-semibold text-[#F8E2A6] shadow-lg backdrop-blur-xs ring-1 ring-[#F4D36A]/50 transition group-hover/cover:bg-[#8E2C2C] group-hover/cover:text-white">
                  <BookOpen className="h-3 w-3" />
                  Mở đọc sách
                </span>
              </div>
            </div>

            {/* Realistic Sprayed / Paper Fore-edge thickness */}
            <div className="relative z-0 my-[2px] -ml-[2px] w-[12px] shrink-0 overflow-hidden rounded-r-[2px] border-y border-r border-black/25 shadow-md">
              {isAchilles ? (
                <AchillesSprayedEdge />
              ) : (
                <div
                  className="h-full w-full"
                  style={{
                    background:
                      'repeating-linear-gradient(90deg, #F4EFE4 0px, #F4EFE4 1.5px, #E3DAC9 1.5px, #E3DAC9 3px)',
                  }}
                />
              )}
            </div>
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={onToggleExpand}
          style={{
            width: `${spineWidth}px`,
            opacity: isAnyHoveredOrExpanded && !isThisHovered ? 0.56 : 1,
          }}
          className="spine-book-btn book-sheen relative h-[142px] sm:h-[158px] lg:h-[170px] overflow-hidden rounded-t-[4px] rounded-b-[1px] shadow-[5px_8px_16px_rgba(0,0,0,0.62)] focus:outline-none focus:ring-2 focus:ring-[#F4D36A]"
        >
          {isAchilles ? (
            <AchillesSpineArt />
          ) : (
            <div
              className="relative flex h-full w-full flex-col items-center justify-between px-1.5 py-3"
              style={{
                background: `linear-gradient(90deg, rgba(0,0,0,0.34) 0%, ${book.spineColor} 22%, ${book.spineColor} 76%, rgba(0,0,0,0.48) 100%)`,
                color: book.spineTextColor,
              }}
            >
              <div className="pointer-events-none absolute inset-y-0 left-0 w-2 bg-gradient-to-r from-white/20 to-transparent" />
              <div
                className="h-[2px] w-full opacity-80"
                style={{ backgroundColor: book.spineAccent }}
              />
              <div className="my-1.5 flex flex-1 items-center justify-center overflow-hidden">
                <span
                  className="font-display text-xs sm:text-sm font-bold tracking-[0.12em] leading-tight drop-shadow"
                  style={{
                    writingMode: 'vertical-rl',
                    textOrientation: 'mixed',
                  }}
                >
                  {book.title}
                </span>
              </div>
              <div className="flex flex-col items-center gap-1 w-full">
                {progress?.isFinished ? (
                  <CheckCircle2 className="h-3 w-3 text-emerald-300" />
                ) : hasBookmark ? (
                  <Bookmark className="h-3 w-3 fill-[#F4D36A] text-[#F4D36A]" />
                ) : null}
                <div
                  className="h-[2px] w-full opacity-80"
                  style={{ backgroundColor: book.spineAccent }}
                />
              </div>
            </div>
          )}
        </button>
      )}
    </div>
  );
};

export const Bookshelf: React.FC<BookshelfProps> = ({
  books,
  progressMap,
  roomMood,
  onOpenBook,
  onDeleteCustomBook,
  onAddBookClick,
}) => {
  // 0 = Left Cabinet focused, 1 = Center Cabinet focused (default), 2 = Right Cabinet focused
  const [activeCabinet, setActiveCabinet] = useState<0 | 1 | 2>(1);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredBookId, setHoveredBookId] = useState<string | null>(null);
  const [expandedBookKey, setExpandedBookKey] = useState<string | null>(null);

  const dragStartX = useRef<number | null>(null);
  const isEvening = roomMood === 'evening';

  const handlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    dragStartX.current = e.clientX;
    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (dragStartX.current === null) return;
    const dx = e.clientX - dragStartX.current;
    setDragOffset(Math.max(-260, Math.min(260, dx)));
  };

  const handlePointerUp = () => {
    if (dragStartX.current === null) return;
    if (dragOffset < -60 && activeCabinet < 2) {
      setActiveCabinet((c) => (c + 1) as 0 | 1 | 2);
      setExpandedBookKey(null);
    } else if (dragOffset > 60 && activeCabinet > 0) {
      setActiveCabinet((c) => (c - 1) as 0 | 1 | 2);
      setExpandedBookKey(null);
    }
    dragStartX.current = null;
    setDragOffset(0);
    setIsDragging(false);
  };

  const leftBooks = books.filter((b) => {
    const p = progressMap[b.id];
    return p && (p.bookmarkedPage || p.currentPage > 1) && !p.isFinished;
  });
  const centerBooks = books;
  const rightBooks = books.slice().reverse();

  // Each cabinet takes 68% of viewport width so when Center (1) is focused,
  // 16% of Left cabinet peeks on the left AND 16% of Right cabinet peeks on the right!
  // Base track translateX:
  // activeCabinet = 0 -> +16%
  // activeCabinet = 1 -> -52% (16% - 68%)
  // activeCabinet = 2 -> -120% (16% - 136%)
  const basePercent = 16 - activeCabinet * 68;
  const isAnyFocus = Boolean(hoveredBookId || expandedBookKey);

  return (
    <div
      className={`relative flex h-full w-full flex-col overflow-hidden select-none ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      }`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onClick={() => setExpandedBookKey(null)}
    >
      {/* 3-CABINET PEEKING PANORAMA TRACK (NO < > BUTTONS!) */}
      <div
        className="flex flex-1 min-h-0 items-end"
        style={{
          transform: `translate3d(calc(${basePercent}% + ${dragOffset}px), 0, 0)`,
          transition: isDragging
            ? 'none'
            : 'transform 0.65s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        {/* ============================================================
            CABINET 0: LEFT BOOKCASE (peeks visibly on left edge!)
           ============================================================ */}
        <section
          onClick={() => {
            if (activeCabinet !== 0) {
              setActiveCabinet(0);
              setExpandedBookKey(null);
            }
          }}
          className={`flex h-full w-[68%] shrink-0 items-end justify-center gap-4 px-3 sm:px-6 pb-0 transition-all duration-700 ${
            activeCabinet === 0
              ? 'scale-100 opacity-100'
              : 'scale-[0.91] opacity-80 hover:opacity-95 cursor-pointer'
          }`}
          style={{
            transformOrigin: 'right bottom',
          }}
        >
          {/* Left Walnut & Steel Cabinet */}
          <div className="relative flex h-full max-h-[96%] w-full max-w-[780px] flex-col">
            <div className="steel-pillar pointer-events-none absolute inset-y-0 left-2 sm:left-4 z-20 w-3.5 rounded-t-sm" />
            <div className="steel-pillar pointer-events-none absolute inset-y-0 right-2 sm:right-4 z-20 w-3.5 rounded-t-sm" />
            <div className="cabinet-recess-shadow pointer-events-none absolute inset-x-5 inset-y-1 rounded-t-md" />

            {[0, 1, 2].map((tier) => (
              <div key={tier} className="relative flex flex-1 min-h-0 flex-col justify-end">
                <div className="relative z-10 flex items-end justify-center gap-1.5 sm:gap-2 px-8 sm:px-12 pb-0.5">
                  {tier === 0 && (
                    <>
                      <AmbientDecoSpine color="#2C3A4E" accent="#D8C293" heightClass="h-[138px] sm:h-[152px]" widthClass="w-8" dimmed={isAnyFocus} />
                      {leftBooks.length > 0 ? (
                        leftBooks.map((book) => {
                          const key = `left-${book.id}`;
                          return (
                            <InlineFlipBook
                              key={key}
                              book={book}
                              progress={progressMap[book.id]}
                              isExpanded={expandedBookKey === key}
                              isAnyHoveredOrExpanded={isAnyFocus}
                              isThisHovered={hoveredBookId === key}
                              onHoverChange={(h) => setHoveredBookId(h ? key : null)}
                              onToggleExpand={() =>
                                setExpandedBookKey((cur) => (cur === key ? null : key))
                              }
                              onOpenReader={() =>
                                onOpenBook(
                                  book,
                                  progressMap[book.id]?.bookmarkedPage ||
                                    progressMap[book.id]?.currentPage
                                )
                              }
                            />
                          );
                        })
                      ) : (
                        <div className="mb-6 rounded-xl border border-white/20 bg-black/35 px-4 py-2 text-center text-xs text-[#F4E8D4] backdrop-blur-xs">
                          Tủ sách đang đọc dở & đánh dấu
                        </div>
                      )}
                      <AmbientDecoSpine color="#4E2A3A" accent="#E6C280" heightClass="h-[132px] sm:h-[146px]" widthClass="w-8" dimmed={isAnyFocus} />
                    </>
                  )}
                  {tier === 1 && (
                    <>
                      <AmbientDecoSpine color="#24403A" accent="#D9B978" heightClass="h-[134px]" widthClass="w-9" dimmed={false} />
                      <AmbientDecoSpine color="#3B2E4A" accent="#D8C4EC" heightClass="h-[144px]" widthClass="w-8" dimmed={false} />
                      <AmbientDecoSpine color="#54382A" accent="#E6C892" heightClass="h-[128px]" widthClass="w-9" dimmed={false} />
                      <div className="ml-auto mb-1">
                        <MiniCrownProp gold />
                      </div>
                    </>
                  )}
                  {tier === 2 && (
                    <div className="flex w-full items-end justify-between px-4 pb-1 text-xs text-[#F2E2C8]">
                      <span className="font-serif italic">Tủ Trái · Góc đang đọc</span>
                      <Sparkles className="h-4 w-4 text-[#F4D36A] sparkle-blink" />
                    </div>
                  )}
                </div>
                <div className="walnut-plank relative z-10 h-4 sm:h-[19px] w-full rounded-[2px]" />
              </div>
            ))}
          </div>
        </section>

        {/* ============================================================
            CABINET 1: CENTER MAIN BOOKCASE (HERO FOCUS)
           ============================================================ */}
        <section
          onClick={() => {
            if (activeCabinet !== 1) {
              setActiveCabinet(1);
              setExpandedBookKey(null);
            }
          }}
          className={`flex h-full w-[68%] shrink-0 items-end justify-center px-3 sm:px-6 pb-0 transition-all duration-700 ${
            activeCabinet === 1
              ? 'scale-100 opacity-100'
              : 'scale-[0.91] opacity-80 hover:opacity-95 cursor-pointer'
          }`}
        >
          <div className="relative flex h-full max-h-[97%] w-full max-w-[860px] flex-col">
            {/* Realistic Brushed Matte-Black Steel Frame Pillars */}
            <div className="steel-pillar pointer-events-none absolute inset-y-0 left-2 sm:left-5 z-20 w-4 rounded-t-sm" />
            <div className="steel-pillar pointer-events-none absolute inset-y-0 right-2 sm:right-5 z-20 w-4 rounded-t-sm" />
            {/* Realistic recessed wooden back cavity shadow */}
            <div className="cabinet-recess-shadow pointer-events-none absolute inset-x-6 inset-y-1 rounded-t-md" />

            {[0, 1, 2].map((tier) => {
              const tierBooks =
                tier === 0 ? centerBooks.slice(0, 6) : tier === 1 ? centerBooks.slice(6, 12) : centerBooks.slice(12);

              return (
                <div key={tier} className="relative flex flex-1 min-h-0 flex-col justify-end">
                  {isEvening && (
                    <div className="pointer-events-none absolute inset-x-7 top-0 h-16 bg-gradient-to-b from-amber-300/20 to-transparent" />
                  )}

                  <div className="relative z-10 flex items-end justify-center gap-1.5 sm:gap-2 px-8 sm:px-14 pb-0.5">
                    {tier === 0 && (
                      <>
                        <AmbientDecoSpine color="#273244" accent="#C9B386" heightClass="h-[136px] sm:h-[152px]" widthClass="w-7 sm:w-8" dimmed={isAnyFocus} />
                        <AmbientDecoSpine color="#3B253A" accent="#DFC28C" heightClass="h-[144px] sm:h-[160px]" widthClass="w-8 sm:w-9" dimmed={isAnyFocus} />
                        <AmbientDecoSpine color="#223D37" accent="#D8BD82" heightClass="h-[132px] sm:h-[146px]" widthClass="w-7 sm:w-8" dimmed={isAnyFocus} />

                        {tierBooks.map((book) => {
                          const key = `center-${book.id}`;
                          return (
                            <InlineFlipBook
                              key={key}
                              book={book}
                              progress={progressMap[book.id]}
                              isExpanded={expandedBookKey === key}
                              isAnyHoveredOrExpanded={isAnyFocus}
                              isThisHovered={hoveredBookId === key}
                              onHoverChange={(h) => setHoveredBookId(h ? key : null)}
                              onToggleExpand={() =>
                                setExpandedBookKey((cur) => (cur === key ? null : key))
                              }
                              onOpenReader={() =>
                                onOpenBook(
                                  book,
                                  progressMap[book.id]?.bookmarkedPage ||
                                    progressMap[book.id]?.currentPage
                                )
                              }
                              onDelete={
                                book.isCustom && onDeleteCustomBook
                                  ? () => onDeleteCustomBook(book.id)
                                  : undefined
                              }
                            />
                          );
                        })}

                        <AmbientDecoSpine color="#4A2B26" accent="#E6C78A" heightClass="h-[140px] sm:h-[154px]" widthClass="w-8 sm:w-9" dimmed={isAnyFocus} />
                        <AmbientDecoSpine color="#2E3C4F" accent="#B8CDE0" heightClass="h-[134px] sm:h-[148px]" widthClass="w-7 sm:w-8" dimmed={isAnyFocus} />
                        <div className="ml-2 pb-0.5">
                          <FairyCandleProp isEvening={isEvening} />
                        </div>
                      </>
                    )}

                    {tier === 1 && (
                      <>
                        <div className="flex items-end gap-1.5">
                          <div className="flex flex-col items-center">
                            <MiniCrownProp />
                            <AmbientDecoSpine color="#233C42" accent="#C7D9D5" heightClass="h-[130px] sm:h-[144px]" widthClass="w-9" dimmed={isAnyFocus} />
                          </div>
                          <AmbientDecoSpine color="#3F2D4E" accent="#E4C891" heightClass="h-[140px] sm:h-[154px]" widthClass="w-8" dimmed={isAnyFocus} />
                          <AmbientDecoSpine color="#54322B" accent="#F0D090" heightClass="h-[134px] sm:h-[146px]" widthClass="w-9" dimmed={isAnyFocus} />
                        </div>

                        {tierBooks.map((book) => {
                          const key = `center-${book.id}`;
                          return (
                            <InlineFlipBook
                              key={key}
                              book={book}
                              progress={progressMap[book.id]}
                              isExpanded={expandedBookKey === key}
                              isAnyHoveredOrExpanded={isAnyFocus}
                              isThisHovered={hoveredBookId === key}
                              onHoverChange={(h) => setHoveredBookId(h ? key : null)}
                              onToggleExpand={() =>
                                setExpandedBookKey((cur) => (cur === key ? null : key))
                              }
                              onOpenReader={() =>
                                onOpenBook(
                                  book,
                                  progressMap[book.id]?.bookmarkedPage ||
                                    progressMap[book.id]?.currentPage
                                )
                              }
                              onDelete={
                                book.isCustom && onDeleteCustomBook
                                  ? () => onDeleteCustomBook(book.id)
                                  : undefined
                              }
                            />
                          );
                        })}

                        {onAddBookClick && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onAddBookClick();
                            }}
                            className="mx-3 mb-2 flex h-28 w-24 sm:h-32 sm:w-28 flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-[#E6CDA0]/60 bg-black/28 p-2 text-center text-[11px] font-medium text-[#F5E8D3] backdrop-blur-xs transition hover:scale-105 hover:border-[#F5D68E] hover:bg-black/42"
                          >
                            <Plus className="h-4 w-4 text-[#F4D36A]" />
                            <span>Thêm sách PDF</span>
                          </button>
                        )}

                        <div className="hidden sm:flex items-end gap-1.5">
                          <AmbientDecoSpine color="#2F4238" accent="#D8C28F" heightClass="h-[136px]" widthClass="w-8" dimmed={isAnyFocus} />
                          <div className="flex flex-col items-center">
                            <MiniCrownProp gold />
                            <AmbientDecoSpine color="#4E2632" accent="#F2D184" heightClass="h-[128px]" widthClass="w-9" dimmed={isAnyFocus} />
                          </div>
                        </div>
                      </>
                    )}

                    {tier === 2 && (
                      <div className="flex w-full items-end justify-between px-2 pb-0.5">
                        <div className="flex items-end gap-1.5">
                          <AmbientDecoSpine color="#5B2428" accent="#E8C27A" heightClass="h-[116px] sm:h-[130px]" widthClass="w-8" dimmed={false} />
                          <AmbientDecoSpine color="#7A3628" accent="#F2D492" heightClass="h-[124px] sm:h-[138px]" widthClass="w-8" dimmed={false} />
                          <AmbientDecoSpine color="#34263E" accent="#D2B8E8" heightClass="h-[114px] sm:h-[128px]" widthClass="w-8" dimmed={false} />
                        </div>

                        <div className="hidden md:flex flex-col items-center pb-3 text-center">
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#F0D594]/40 bg-black/40 px-3 py-1 text-[11px] text-[#F4E7D0] backdrop-blur-xs">
                            <MoveHorizontal className="h-3.5 w-3.5 text-[#F4D36A]" />
                            Kéo chuột sang trái / phải hoặc nhấn vào tủ bên cạnh
                          </span>
                        </div>

                        <div className="flex items-end gap-1.5">
                          <AmbientDecoSpine color="#243C4A" accent="#B8D4E6" heightClass="h-[120px] sm:h-[134px]" widthClass="w-8" dimmed={false} />
                          <AmbientDecoSpine color="#3E2F26" accent="#E6C78F" heightClass="h-[116px] sm:h-[128px]" widthClass="w-8" dimmed={false} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Realistic Dark Walnut Wood Plank */}
                  <div className="walnut-plank relative z-10 h-4 sm:h-[20px] w-full rounded-[2px]" />
                </div>
              );
            })}
          </div>
        </section>

        {/* ============================================================
            CABINET 2: RIGHT BOOKCASE + DIAGONAL TREE SHELF (peeks on right!)
           ============================================================ */}
        <section
          onClick={() => {
            if (activeCabinet !== 2) {
              setActiveCabinet(2);
              setExpandedBookKey(null);
            }
          }}
          className={`flex h-full w-[68%] shrink-0 items-end justify-center gap-5 px-3 sm:px-6 pb-0 transition-all duration-700 ${
            activeCabinet === 2
              ? 'scale-100 opacity-100'
              : 'scale-[0.91] opacity-80 hover:opacity-95 cursor-pointer'
          }`}
          style={{
            transformOrigin: 'left bottom',
          }}
        >
          {/* Right Walnut Side Cabinet */}
          <div className="relative flex h-full max-h-[96%] w-full max-w-[460px] flex-col">
            <div className="steel-pillar pointer-events-none absolute inset-y-0 left-2 z-20 w-3.5 rounded-t-sm" />
            <div className="steel-pillar pointer-events-none absolute inset-y-0 right-2 z-20 w-3.5 rounded-t-sm" />
            <div className="cabinet-recess-shadow pointer-events-none absolute inset-x-5 inset-y-1 rounded-t-md" />

            {[0, 1, 2].map((tier) => (
              <div key={tier} className="relative flex flex-1 min-h-0 flex-col justify-end">
                <div className="relative z-10 flex items-end justify-center gap-1.5 px-8 pb-0.5">
                  {tier === 0 &&
                    rightBooks.map((book) => {
                      const key = `right-${book.id}`;
                      return (
                        <InlineFlipBook
                          key={key}
                          book={book}
                          progress={progressMap[book.id]}
                          isExpanded={expandedBookKey === key}
                          isAnyHoveredOrExpanded={isAnyFocus}
                          isThisHovered={hoveredBookId === key}
                          onHoverChange={(h) => setHoveredBookId(h ? key : null)}
                          onToggleExpand={() =>
                            setExpandedBookKey((cur) => (cur === key ? null : key))
                          }
                          onOpenReader={() =>
                            onOpenBook(
                              book,
                              progressMap[book.id]?.bookmarkedPage ||
                                progressMap[book.id]?.currentPage
                            )
                          }
                        />
                      );
                    })}
                  {tier === 1 && (
                    <>
                      <AmbientDecoSpine color="#21464B" accent="#9AD6D0" heightClass="h-[134px]" widthClass="w-9" dimmed={false} />
                      <AmbientDecoSpine color="#33284A" accent="#D4B8F0" heightClass="h-[144px]" widthClass="w-8" dimmed={false} />
                      <AmbientDecoSpine color="#4E3828" accent="#E8C688" heightClass="h-[130px]" widthClass="w-9" dimmed={false} />
                    </>
                  )}
                  {tier === 2 && (
                    <span className="pb-2 font-serif text-xs italic text-[#F2E2C8]">
                      Tủ Phải · Kệ sưu tầm
                    </span>
                  )}
                </div>
                <div className="walnut-plank relative z-10 h-4 sm:h-[19px] w-full rounded-[2px]" />
              </div>
            ))}
          </div>

          {/* Diagonal Zig-Zag Tree Bookshelf (Image 10 Right Accent) */}
          <div className="relative hidden md:flex h-[88%] w-[250px] flex-col items-center justify-end pb-1">
            <div className="walnut-plank absolute inset-y-6 left-1/2 -translate-x-1/2 w-4 rounded-sm" />
            <div className="relative z-10 flex h-full w-full flex-col justify-around py-4">
              {[0, 1, 2].map((branchIdx) => {
                const isRightBranch = branchIdx % 2 === 0;
                const branchBook = books[branchIdx % Math.max(1, books.length)];
                return (
                  <div
                    key={branchIdx}
                    className={`flex items-end ${
                      isRightBranch ? 'justify-end pr-1' : 'justify-start pl-1'
                    }`}
                  >
                    <div
                      className={`flex flex-col items-center transition-transform duration-300 hover:scale-105 ${
                        isRightBranch ? 'rotate-[-26deg]' : 'rotate-[26deg]'
                      }`}
                    >
                      <div className="flex items-end gap-1 pb-0.5">
                        <AmbientDecoSpine color="#2A3F4C" accent="#D8C496" heightClass="h-22" widthClass="w-6" dimmed={false} />
                        {branchBook && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenBook(
                                branchBook,
                                progressMap[branchBook.id]?.bookmarkedPage ||
                                  progressMap[branchBook.id]?.currentPage
                              );
                            }}
                            className="spine-book-btn book-sheen h-26 w-10 overflow-hidden rounded-t-[3px] shadow-lg"
                            style={{ backgroundColor: branchBook.spineColor }}
                            title={branchBook.title}
                          >
                            {branchBook.id === 'truong-ca-achilles' ? (
                              <AchillesSpineArt />
                            ) : (
                              <div
                                className="flex h-full items-center justify-center px-1"
                                style={{ color: branchBook.spineTextColor }}
                              >
                                <span
                                  className="font-display text-[11px] font-bold tracking-wider"
                                  style={{
                                    writingMode: 'vertical-rl',
                                    textOrientation: 'mixed',
                                  }}
                                >
                                  {branchBook.title}
                                </span>
                              </div>
                            )}
                          </button>
                        )}
                        <AmbientDecoSpine color="#542E38" accent="#F0CE86" heightClass="h-20" widthClass="w-6" dimmed={false} />
                      </div>
                      <div className="walnut-plank h-3.5 w-34 rounded-[2px]" />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="walnut-plank relative z-10 h-4 w-48 rounded-sm" />
          </div>
        </section>
      </div>
    </div>
  );
};
