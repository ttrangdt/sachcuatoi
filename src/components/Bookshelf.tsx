import React, { useRef, useState } from 'react';
import {
  Bookmark,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  MoveHorizontal,
  Plus,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { BookItem, BookProgress } from '../types/book';
import { DecorativeBookmark } from './DecorativeBookmark';
import { AchillesSpineArt } from './AchillesArtwork';
import { RoomMood } from './AmbientRoomEffects';

interface BookshelfProps {
  books: BookItem[];
  progressMap: Record<string, BookProgress>;
  roomMood: RoomMood;
  onSelectBook: (book: BookItem) => void;
  onDeleteCustomBook?: (bookId: string) => void;
  onAddBookClick?: () => void;
}

/** Miniature fairytale crown prop sitting atop books (like Reference Image 10) */
const MiniCrownProp: React.FC<{ gold?: boolean }> = ({ gold = false }) => (
  <svg
    viewBox="0 0 42 22"
    className="pointer-events-none h-4 w-8 drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]"
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

/** Flickering Fairy Lantern / Candle Prop */
const FairyCandleProp: React.FC<{ isEvening: boolean }> = ({ isEvening }) => (
  <div className="pointer-events-none hidden sm:flex flex-col items-center select-none">
    <div
      className={`candle-flame h-3 w-1.5 rounded-full bg-gradient-to-t from-amber-500 via-amber-300 to-yellow-50 ${
        isEvening
          ? 'shadow-[0_0_24px_10px_rgba(251,191,36,0.68)]'
          : 'shadow-[0_0_10px_4px_rgba(251,191,36,0.42)]'
      }`}
    />
    <div className="h-9 w-8 rounded-t-sm rounded-b-md bg-gradient-to-r from-[#E3D9C8] via-[#F7F1E6] to-[#CFC3B0] shadow-md border-t border-white/80" />
  </div>
);

/** Decorative silent companion books so the shelves look lush & authentic like Image 10 */
const AmbientDecoSpine: React.FC<{
  color: string;
  accent: string;
  heightClass: string;
  widthClass: string;
  dimmed: boolean;
}> = ({ color, accent, heightClass, widthClass, dimmed }) => (
  <div
    className={`relative shrink-0 overflow-hidden rounded-t-[3px] border-x border-t border-white/10 shadow-[3px_6px_12px_rgba(0,0,0,0.45)] transition-opacity duration-300 ${heightClass} ${widthClass} ${
      dimmed ? 'opacity-45' : 'opacity-82'
    }`}
    style={{ backgroundColor: color }}
    aria-hidden="true"
  >
    <div className="pointer-events-none absolute inset-y-0 left-0 w-1.5 bg-gradient-to-r from-white/15 to-transparent" />
    <div className="pointer-events-none absolute inset-y-0 right-0 w-2 bg-gradient-to-l from-black/35 to-transparent" />
    <div
      className="mx-1 mt-3 h-[2px] opacity-60"
      style={{ backgroundColor: accent }}
    />
    <div
      className="mx-1 mt-1.5 h-[1px] opacity-40"
      style={{ backgroundColor: accent }}
    />
    <div
      className="absolute inset-x-1 bottom-3 h-[2px] opacity-60"
      style={{ backgroundColor: accent }}
    />
  </div>
);

/** Interactive Clickable Book Spine on Shelf */
const InteractiveBookSpine: React.FC<{
  book: BookItem;
  progress?: BookProgress;
  isHoveredAny: boolean;
  isThisHovered: boolean;
  onHoverChange: (hovered: boolean) => void;
  onSelect: () => void;
  onDelete?: () => void;
}> = ({
  book,
  progress,
  isHoveredAny,
  isThisHovered,
  onHoverChange,
  onSelect,
  onDelete,
}) => {
  const isAchilles = book.id === 'truong-ca-achilles';
  const hasBookmark = Boolean(progress?.bookmarkedPage);
  const spineWidth = isAchilles ? 52 : 58;

  return (
    <div
      className="relative flex flex-col items-center"
      onMouseEnter={() => onHoverChange(true)}
      onMouseLeave={() => onHoverChange(false)}
    >
      {/* Floating Hover Tooltip above spine */}
      {isThisHovered && (
        <div className="pointer-events-none absolute -top-14 left-1/2 z-40 -translate-x-1/2 whitespace-nowrap rounded-xl border border-[#F0D594]/60 bg-[#221712]/94 px-3 py-1.5 text-center shadow-xl backdrop-blur-md">
          <p className="font-display text-sm font-bold text-[#FBF2DE]">
            {book.title}
          </p>
          <p className="text-[10px] text-[#DEC69C]">
            {book.author} · Nhấn để mở bìa sách
          </p>
        </div>
      )}

      {/* Peeking Sparkling Bookmark */}
      {hasBookmark && progress && (
        <div
          className={`pointer-events-none absolute -top-6 z-30 transition-transform duration-300 ${
            isThisHovered ? '-translate-y-4 scale-110' : ''
          }`}
        >
          <DecorativeBookmark styleId={progress.bookmarkStyle} size="sm" />
        </div>
      )}

      {/* Custom book delete */}
      {book.isCustom && onDelete && isThisHovered && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute -top-2 -right-2 z-40 flex h-5 w-5 items-center justify-center rounded-full bg-[#8E2C2C] text-white shadow"
          title="Xóa sách đã tải lên"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      )}

      <button
        type="button"
        onClick={onSelect}
        style={{
          width: `${spineWidth}px`,
          opacity: isHoveredAny && !isThisHovered ? 0.58 : 1,
        }}
        className="spine-book-btn book-sheen relative h-[142px] sm:h-[158px] lg:h-[170px] overflow-hidden rounded-t-[4px] rounded-b-[1px] shadow-[4px_8px_16px_rgba(0,0,0,0.58)] focus:outline-none focus:ring-2 focus:ring-[#F4D36A]"
      >
        {isAchilles ? (
          <AchillesSpineArt />
        ) : (
          <div
            className="relative flex h-full w-full flex-col items-center justify-between px-1.5 py-3"
            style={{
              background: `linear-gradient(90deg, rgba(0,0,0,0.28) 0%, ${book.spineColor} 22%, ${book.spineColor} 78%, rgba(0,0,0,0.42) 100%)`,
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
    </div>
  );
};

const CABINET_LABELS = [
  'Tủ Trái · Kệ Đang Đọc',
  'Tủ Chính Diện · Thư Viện Trung Tâm',
  'Tủ Phải · Kệ Cây Xếp Chéo',
];

export const Bookshelf: React.FC<BookshelfProps> = ({
  books,
  progressMap,
  roomMood,
  onSelectBook,
  onDeleteCustomBook,
  onAddBookClick,
}) => {
  // 0 = Left Cabinet, 1 = Center Cabinet (default!), 2 = Right Cabinet
  const [activeCabinet, setActiveCabinet] = useState<0 | 1 | 2>(1);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredBookId, setHoveredBookId] = useState<string | null>(null);

  const dragStartX = useRef<number | null>(null);
  const isEvening = roomMood === 'evening';

  const handlePointerDown = (e: React.PointerEvent) => {
    // Ignore drag start if user clicked directly on a button
    if ((e.target as HTMLElement).closest('button')) return;
    dragStartX.current = e.clientX;
    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (dragStartX.current === null) return;
    const dx = e.clientX - dragStartX.current;
    setDragOffset(Math.max(-220, Math.min(220, dx)));
  };

  const handlePointerUp = () => {
    if (dragStartX.current === null) return;
    if (dragOffset < -65 && activeCabinet < 2) {
      setActiveCabinet((c) => (c + 1) as 0 | 1 | 2);
    } else if (dragOffset > 65 && activeCabinet > 0) {
      setActiveCabinet((c) => (c - 1) as 0 | 1 | 2);
    }
    dragStartX.current = null;
    setDragOffset(0);
    setIsDragging(false);
  };

  // Distribute books across cabinets cleanly:
  // Center cabinet gets default + primary books; Left gets in-progress/bookmarked; Right gets extra/all featured on diagonal tree shelf
  const leftBooks = books.filter((b) => {
    const p = progressMap[b.id];
    return p && (p.bookmarkedPage || p.currentPage > 1) && !p.isFinished;
  });
  const centerBooks = books;
  const rightBooks = books.slice().reverse();

  return (
    <div
      className={`relative flex h-full w-full flex-col overflow-hidden select-none ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      }`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* Left / Right Room Panning Arrows */}
      {activeCabinet > 0 && (
        <button
          type="button"
          onClick={() => setActiveCabinet((c) => (c - 1) as 0 | 1 | 2)}
          className="absolute left-1.5 sm:left-3 top-1/2 z-40 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-black/35 text-white shadow-lg backdrop-blur-md transition hover:scale-110 hover:bg-black/55"
          title="Sang tủ sách bên trái"
          aria-label="Sang tủ sách bên trái"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}

      {activeCabinet < 2 && (
        <button
          type="button"
          onClick={() => setActiveCabinet((c) => (c + 1) as 0 | 1 | 2)}
          className="absolute right-1.5 sm:right-3 top-1/2 z-40 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-black/35 text-white shadow-lg backdrop-blur-md transition hover:scale-110 hover:bg-black/55"
          title="Sang tủ sách bên phải"
          aria-label="Sang tủ sách bên phải"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      )}

      {/* 3-CABINET HORIZONTAL PANORAMA TRACK */}
      <div
        className="flex flex-1 min-h-0 w-[300%]"
        style={{
          transform: `translate3d(calc(${-activeCabinet * 33.3333}% + ${dragOffset}px), 0, 0)`,
          transition: isDragging
            ? 'none'
            : 'transform 0.62s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        {/* ============================================================
            CABINET 0: LEFT SIDE BOOKCASE + COZY ROLLING BOOK CART
           ============================================================ */}
        <section className="flex h-full w-1/3 shrink-0 items-end justify-center gap-4 sm:gap-7 px-6 sm:px-14 pb-0">
          {/* Rolling Slate-Blue Book Cart (inspired by left side of Image 10!) */}
          <div className="hidden lg:flex flex-col items-center w-44 pb-1">
            <div className="mb-1 flex items-center gap-2">
              <FairyCandleProp isEvening={isEvening} />
            </div>
            <div className="w-full rounded-t-xl border-x-4 border-t-4 border-[#3E5863] bg-[#2D444E]/92 p-2.5 shadow-xl">
              <div className="h-2 w-full rounded-sm bg-[#D8B88C] mb-2" />
              <div className="space-y-3">
                <div className="flex h-20 items-end justify-center gap-1 rounded-md bg-[#23363F] px-2 pb-1">
                  <AmbientDecoSpine color="#45324E" accent="#DFC186" heightClass="h-16" widthClass="w-5" dimmed={false} />
                  <AmbientDecoSpine color="#2A4A43" accent="#E6C989" heightClass="h-17" widthClass="w-6" dimmed={false} />
                  <AmbientDecoSpine color="#6E3036" accent="#F0D18D" heightClass="h-15" widthClass="w-5" dimmed={false} />
                </div>
                <div className="flex h-20 items-end justify-center gap-1 rounded-md bg-[#23363F] px-2 pb-1">
                  <AmbientDecoSpine color="#304157" accent="#C5D5E8" heightClass="h-16" widthClass="w-6" dimmed={false} />
                  <AmbientDecoSpine color="#5E462D" accent="#E8C988" heightClass="h-15" widthClass="w-5" dimmed={false} />
                </div>
              </div>
            </div>
            <div className="flex w-36 justify-between px-3 pt-1">
              <div className="h-3.5 w-3.5 rounded-full bg-[#1C2124] ring-2 ring-[#5E747E]" />
              <div className="h-3.5 w-3.5 rounded-full bg-[#1C2124] ring-2 ring-[#5E747E]" />
            </div>
          </div>

          {/* Left Walnut & Black Steel Cabinet (Reading In-Progress Books) */}
          <div className="relative flex h-full max-h-[96%] w-full max-w-[680px] flex-col">
            <div className="steel-pillar pointer-events-none absolute inset-y-0 left-3 sm:left-5 z-20 w-3 rounded-t-sm" />
            <div className="steel-pillar pointer-events-none absolute inset-y-0 right-3 sm:right-5 z-20 w-3 rounded-t-sm" />

            {[0, 1, 2].map((tier) => (
              <div key={tier} className="relative flex flex-1 min-h-0 flex-col justify-end">
                <div className="relative z-10 flex items-end justify-center gap-1.5 sm:gap-2 px-10 pb-0.5">
                  {tier === 0 && (
                    <>
                      <AmbientDecoSpine color="#2E3B4E" accent="#D8C293" heightClass="h-[138px] sm:h-[154px]" widthClass="w-8" dimmed={Boolean(hoveredBookId)} />
                      {leftBooks.length > 0 ? (
                        leftBooks.map((book) => (
                          <InteractiveBookSpine
                            key={book.id}
                            book={book}
                            progress={progressMap[book.id]}
                            isHoveredAny={Boolean(hoveredBookId)}
                            isThisHovered={hoveredBookId === book.id}
                            onHoverChange={(h) => setHoveredBookId(h ? book.id : null)}
                            onSelect={() => onSelectBook(book)}
                            onDelete={
                              book.isCustom && onDeleteCustomBook
                                ? () => onDeleteCustomBook(book.id)
                                : undefined
                            }
                          />
                        ))
                      ) : (
                        <div className="mb-6 rounded-xl border border-white/15 bg-black/25 px-4 py-2 text-center text-xs text-[#F4E8D4] backdrop-blur-xs">
                          Sách bạn đang đọc dở hoặc đánh dấu sẽ xuất hiện tại đây
                        </div>
                      )}
                      <AmbientDecoSpine color="#4C2B3B" accent="#E6C280" heightClass="h-[132px] sm:h-[146px]" widthClass="w-8" dimmed={Boolean(hoveredBookId)} />
                    </>
                  )}
                  {tier === 1 && (
                    <>
                      <AmbientDecoSpine color="#26403A" accent="#D9B978" heightClass="h-[136px]" widthClass="w-9" dimmed={false} />
                      <AmbientDecoSpine color="#3B2E4A" accent="#D8C4EC" heightClass="h-[146px]" widthClass="w-8" dimmed={false} />
                      <AmbientDecoSpine color="#54382A" accent="#E6C892" heightClass="h-[130px]" widthClass="w-9" dimmed={false} />
                      <div className="ml-auto mb-1">
                        <MiniCrownProp gold />
                      </div>
                    </>
                  )}
                  {tier === 2 && (
                    <div className="flex w-full items-end justify-between px-4 pb-1 text-xs text-[#EADAC2]/90">
                      <span className="font-serif italic">Góc sách đang đọc dở</span>
                      <Sparkles className="h-4 w-4 text-[#F4D36A] sparkle-blink" />
                    </div>
                  )}
                </div>
                <div className="walnut-plank relative z-10 h-4 sm:h-[18px] w-full rounded-[2px]" />
              </div>
            ))}
          </div>
        </section>

        {/* ============================================================
            CABINET 1: CENTER MAIN BOOKCASE (WALNUT + BLACK STEEL, IMAGE 10)
           ============================================================ */}
        <section className="flex h-full w-1/3 shrink-0 items-end justify-center px-6 sm:px-14 pb-0">
          <div className="relative flex h-full max-h-[97%] w-full max-w-[820px] flex-col">
            {/* Matte-Black Steel Upright Pillars (Image 10 signature) */}
            <div className="steel-pillar pointer-events-none absolute inset-y-0 left-3 sm:left-6 z-20 w-3.5 rounded-t-sm" />
            <div className="steel-pillar pointer-events-none absolute inset-y-0 right-3 sm:right-6 z-20 w-3.5 rounded-t-sm" />
            {/* Subtle dark wood back panel glow */}
            <div
              className={`pointer-events-none absolute inset-x-7 inset-y-2 rounded-t-lg transition-colors duration-700 ${
                isEvening
                  ? 'bg-gradient-to-b from-[#2A1D2E]/55 via-[#1F1724]/45 to-[#16101B]/65'
                  : 'bg-gradient-to-b from-[#3A271D]/18 via-[#2E1E16]/12 to-[#261810]/22'
              }`}
            />

            {/* 3 Proportional Viewport-Fitted Walnut Shelf Tiers */}
            {[0, 1, 2].map((tier) => {
              const tierBooks =
                tier === 0 ? centerBooks.slice(0, 6) : tier === 1 ? centerBooks.slice(6, 12) : centerBooks.slice(12);

              return (
                <div key={tier} className="relative flex flex-1 min-h-0 flex-col justify-end">
                  {/* Warm overhead fairy lamp light per shelf in evening mode */}
                  {isEvening && (
                    <div className="pointer-events-none absolute inset-x-8 top-0 h-16 bg-gradient-to-b from-amber-300/18 to-transparent" />
                  )}

                  <div className="relative z-10 flex items-end justify-center gap-1.5 sm:gap-2 px-9 sm:px-14 pb-0.5">
                    {tier === 0 && (
                      <>
                        {/* Left decorative spines */}
                        <AmbientDecoSpine color="#273244" accent="#C9B386" heightClass="h-[136px] sm:h-[154px]" widthClass="w-7 sm:w-8" dimmed={Boolean(hoveredBookId)} />
                        <AmbientDecoSpine color="#3B253A" accent="#DFC28C" heightClass="h-[144px] sm:h-[162px]" widthClass="w-8 sm:w-9" dimmed={Boolean(hoveredBookId)} />
                        <AmbientDecoSpine color="#223D37" accent="#D8BD82" heightClass="h-[132px] sm:h-[148px]" widthClass="w-7 sm:w-8" dimmed={Boolean(hoveredBookId)} />

                        {/* USER'S REAL INTERACTIVE BOOK SPINES */}
                        {tierBooks.map((book) => (
                          <InteractiveBookSpine
                            key={book.id}
                            book={book}
                            progress={progressMap[book.id]}
                            isHoveredAny={Boolean(hoveredBookId)}
                            isThisHovered={hoveredBookId === book.id}
                            onHoverChange={(h) => setHoveredBookId(h ? book.id : null)}
                            onSelect={() => onSelectBook(book)}
                            onDelete={
                              book.isCustom && onDeleteCustomBook
                                ? () => onDeleteCustomBook(book.id)
                                : undefined
                            }
                          />
                        ))}

                        {/* Right decorative spines + fairy candle */}
                        <AmbientDecoSpine color="#4A2B26" accent="#E6C78A" heightClass="h-[140px] sm:h-[156px]" widthClass="w-8 sm:w-9" dimmed={Boolean(hoveredBookId)} />
                        <AmbientDecoSpine color="#2E3C4F" accent="#B8CDE0" heightClass="h-[134px] sm:h-[150px]" widthClass="w-7 sm:w-8" dimmed={Boolean(hoveredBookId)} />
                        <div className="ml-3 pb-0.5">
                          <FairyCandleProp isEvening={isEvening} />
                        </div>
                      </>
                    )}

                    {tier === 1 && (
                      <>
                        <div className="flex items-end gap-1.5">
                          <div className="flex flex-col items-center">
                            <MiniCrownProp />
                            <AmbientDecoSpine color="#233C42" accent="#C7D9D5" heightClass="h-[132px] sm:h-[146px]" widthClass="w-9" dimmed={Boolean(hoveredBookId)} />
                          </div>
                          <AmbientDecoSpine color="#3F2D4E" accent="#E4C891" heightClass="h-[142px] sm:h-[156px]" widthClass="w-8" dimmed={Boolean(hoveredBookId)} />
                          <AmbientDecoSpine color="#54322B" accent="#F0D090" heightClass="h-[136px] sm:h-[148px]" widthClass="w-9" dimmed={Boolean(hoveredBookId)} />
                        </div>

                        {tierBooks.map((book) => (
                          <InteractiveBookSpine
                            key={book.id}
                            book={book}
                            progress={progressMap[book.id]}
                            isHoveredAny={Boolean(hoveredBookId)}
                            isThisHovered={hoveredBookId === book.id}
                            onHoverChange={(h) => setHoveredBookId(h ? book.id : null)}
                            onSelect={() => onSelectBook(book)}
                            onDelete={
                              book.isCustom && onDeleteCustomBook
                                ? () => onDeleteCustomBook(book.id)
                                : undefined
                            }
                          />
                        ))}

                        {onAddBookClick && (
                          <button
                            type="button"
                            onClick={onAddBookClick}
                            className="mx-3 mb-2 flex h-28 w-24 sm:h-32 sm:w-28 flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-[#E6CDA0]/55 bg-black/20 p-2 text-center text-[11px] font-medium text-[#F5E8D3] backdrop-blur-xs transition hover:scale-105 hover:border-[#F5D68E] hover:bg-black/35"
                          >
                            <Plus className="h-4 w-4 text-[#F4D36A]" />
                            <span>Thêm sách PDF</span>
                          </button>
                        )}

                        <div className="hidden sm:flex items-end gap-1.5">
                          <AmbientDecoSpine color="#2F4238" accent="#D8C28F" heightClass="h-[138px]" widthClass="w-8" dimmed={Boolean(hoveredBookId)} />
                          <div className="flex flex-col items-center">
                            <MiniCrownProp gold />
                            <AmbientDecoSpine color="#4E2632" accent="#F2D184" heightClass="h-[130px]" widthClass="w-9" dimmed={Boolean(hoveredBookId)} />
                          </div>
                        </div>
                      </>
                    )}

                    {tier === 2 && (
                      <div className="flex w-full items-end justify-between px-2 pb-0.5">
                        <div className="flex items-end gap-1.5">
                          <AmbientDecoSpine color="#5B2428" accent="#E8C27A" heightClass="h-[118px] sm:h-[132px]" widthClass="w-8" dimmed={false} />
                          <AmbientDecoSpine color="#7A3628" accent="#F2D492" heightClass="h-[124px] sm:h-[138px]" widthClass="w-8" dimmed={false} />
                          <AmbientDecoSpine color="#34263E" accent="#D2B8E8" heightClass="h-[116px] sm:h-[130px]" widthClass="w-8" dimmed={false} />
                        </div>

                        <div className="hidden md:flex flex-col items-center pb-3 text-center">
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#F0D594]/35 bg-black/28 px-3 py-1 text-[11px] text-[#F4E7D0] backdrop-blur-xs">
                            <MoveHorizontal className="h-3.5 w-3.5 text-[#F4D36A]" />
                            Kéo chuột sang trái / phải để xem 2 tủ sách bên cạnh
                          </span>
                        </div>

                        <div className="flex items-end gap-1.5">
                          <AmbientDecoSpine color="#243C4A" accent="#B8D4E6" heightClass="h-[122px] sm:h-[136px]" widthClass="w-8" dimmed={false} />
                          <AmbientDecoSpine color="#3E2F26" accent="#E6C78F" heightClass="h-[118px] sm:h-[130px]" widthClass="w-8" dimmed={false} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Thick Dark Walnut Wood Plank */}
                  <div className="walnut-plank relative z-10 h-4 sm:h-[19px] w-full rounded-[2px]" />
                </div>
              );
            })}
          </div>
        </section>

        {/* ============================================================
            CABINET 2: RIGHT DIAGONAL TREE BOOKSHELF + SIDE CABINET (IMAGE 10)
           ============================================================ */}
        <section className="flex h-full w-1/3 shrink-0 items-end justify-center gap-6 sm:gap-10 px-6 sm:px-14 pb-0">
          {/* Walnut Side Cabinet */}
          <div className="relative hidden md:flex h-full max-h-[94%] w-full max-w-[440px] flex-col">
            <div className="steel-pillar pointer-events-none absolute inset-y-0 left-3 z-20 w-3 rounded-t-sm" />
            <div className="steel-pillar pointer-events-none absolute inset-y-0 right-3 z-20 w-3 rounded-t-sm" />
            {[0, 1, 2].map((tier) => (
              <div key={tier} className="relative flex flex-1 min-h-0 flex-col justify-end">
                <div className="relative z-10 flex items-end justify-center gap-1.5 px-9 pb-0.5">
                  {tier === 0 &&
                    rightBooks.map((book) => (
                      <InteractiveBookSpine
                        key={book.id}
                        book={book}
                        progress={progressMap[book.id]}
                        isHoveredAny={Boolean(hoveredBookId)}
                        isThisHovered={hoveredBookId === book.id}
                        onHoverChange={(h) => setHoveredBookId(h ? book.id : null)}
                        onSelect={() => onSelectBook(book)}
                      />
                    ))}
                  {tier === 1 && (
                    <>
                      <AmbientDecoSpine color="#21464B" accent="#9AD6D0" heightClass="h-[136px]" widthClass="w-9" dimmed={false} />
                      <AmbientDecoSpine color="#33284A" accent="#D4B8F0" heightClass="h-[144px]" widthClass="w-8" dimmed={false} />
                      <AmbientDecoSpine color="#4E3828" accent="#E8C688" heightClass="h-[132px]" widthClass="w-9" dimmed={false} />
                    </>
                  )}
                  {tier === 2 && (
                    <span className="pb-2 font-serif text-xs italic text-[#EADAC2]/90">
                      Kệ sách sưu tầm & cổ tích
                    </span>
                  )}
                </div>
                <div className="walnut-plank relative z-10 h-4 w-full rounded-[2px]" />
              </div>
            ))}
          </div>

          {/* Iconic Diagonal Zig-Zag Wooden Tree Bookshelf (Right side of Image 10!) */}
          <div className="relative flex h-[88%] w-[260px] sm:w-[300px] flex-col items-center justify-end pb-1">
            {/* Central walnut spine trunk */}
            <div className="walnut-plank absolute inset-y-6 left-1/2 -translate-x-1/2 w-4 rounded-sm" />

            <div className="relative z-10 flex h-full w-full flex-col justify-around py-4">
              {[0, 1, 2].map((branchIdx) => {
                const isRightBranch = branchIdx % 2 === 0;
                const branchBook = books[branchIdx % Math.max(1, books.length)];
                return (
                  <div
                    key={branchIdx}
                    className={`flex items-end ${
                      isRightBranch ? 'justify-end pr-2' : 'justify-start pl-2'
                    }`}
                  >
                    <div
                      className={`flex flex-col items-center transition-transform duration-300 hover:scale-105 ${
                        isRightBranch ? 'rotate-[-28deg]' : 'rotate-[28deg]'
                      }`}
                    >
                      <div className="flex items-end gap-1 pb-0.5">
                        <AmbientDecoSpine color="#2A3F4C" accent="#D8C496" heightClass="h-24" widthClass="w-6" dimmed={false} />
                        {branchBook && (
                          <button
                            type="button"
                            onClick={() => onSelectBook(branchBook)}
                            className="spine-book-btn book-sheen h-28 w-10 overflow-hidden rounded-t-[3px] shadow-lg"
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
                        <AmbientDecoSpine color="#542E38" accent="#F0CE86" heightClass="h-22" widthClass="w-6" dimmed={false} />
                      </div>
                      <div className="walnut-plank h-3.5 w-36 rounded-[2px]" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Tree Shelf Foot Base */}
            <div className="walnut-plank relative z-10 h-4 w-52 rounded-sm" />
          </div>
        </section>
      </div>

      {/* Bottom Floating Room Navigation Pills (Left / Center / Right) */}
      <div className="pointer-events-none absolute inset-x-0 bottom-2 z-30 flex justify-center">
        <div className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/45 px-2.5 py-1 text-[11px] text-[#F5EAD6] shadow-lg backdrop-blur-md">
          {([0, 1, 2] as const).map((idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveCabinet(idx)}
              className={`rounded-full px-2.5 py-0.5 transition ${
                activeCabinet === idx
                  ? 'bg-[#F4D36A] font-semibold text-[#23180E]'
                  : 'text-[#EADBC4]/80 hover:text-white'
              }`}
            >
              {idx === 0 ? 'Tủ trái' : idx === 1 ? 'Tủ chính diện' : 'Tủ phải'}
            </button>
          ))}
        </div>
      </div>

      {/* Subtle Cabinet Title Tag top-center */}
      <div className="pointer-events-none absolute top-1 left-1/2 z-20 -translate-x-1/2">
        <span
          className={`rounded-full px-3 py-0.5 text-[10px] font-medium tracking-wider uppercase backdrop-blur-xs ${
            isEvening
              ? 'bg-black/35 text-[#E8D5B5]'
              : 'bg-white/55 text-[#4A3B31]'
          }`}
        >
          {CABINET_LABELS[activeCabinet]}
        </span>
      </div>
    </div>
  );
};
