import React, { useEffect, useRef, useState } from 'react';
import { BookOpen, CheckCircle2, Plus, Trash2 } from 'lucide-react';
import { BookItem, BookProgress } from '../types/book';
import { getBookCoverUrl } from '../utils/pdfEngine';
import { AchillesCoverArt, AchillesSprayedEdge } from './AchillesArtwork';
import {
  RealisticBookSpine,
  getBookSpineWidth,
} from './RealisticBookSpine';
import { RoomMood } from './AmbientRoomEffects';

interface BookshelfProps {
  books: BookItem[];
  progressMap: Record<string, BookProgress>;
  roomMood: RoomMood;
  onOpenBook: (book: BookItem, startPage?: number) => void;
  onDeleteCustomBook?: (bookId: string) => void;
  onAddBookClick?: () => void;
}

/**
 * Interactive 3D Book on Shelf:
 * - Spine thickness scales dynamically with book page count (thin novella vs thick epic!)
 * - Click spine -> rotates smoothly IN PLACE ON THE SHELF into full Front Cover
 * - Click cover -> opens BookReader
 */
const InlineFlipBook: React.FC<{
  book: BookItem;
  progress?: BookProgress;
  isExpanded: boolean;
  isThisHovered: boolean;
  heightPct: string;
  onHoverChange: (hovered: boolean) => void;
  onToggleExpand: () => void;
  onOpenReader: () => void;
  onDelete?: () => void;
}> = ({
  book,
  progress,
  isExpanded,
  isThisHovered,
  heightPct,
  onHoverChange,
  onToggleExpand,
  onOpenReader,
  onDelete,
}) => {
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const isAchilles = book.id === 'truong-ca-achilles';

  useEffect(() => {
    if (isAchilles || !book.pdfUrl || coverUrl) return;
    let active = true;
    getBookCoverUrl(book).then((url) => {
      if (active) setCoverUrl(url);
    });
    return () => {
      active = false;
    };
  }, [book, isAchilles, coverUrl]);

  const spineWidth = getBookSpineWidth(progress?.totalPages || book.totalPages);
  const coverWidth = 166;
  const pageBlockThickness = Math.max(8, Math.min(20, Math.round(spineWidth * 0.25)));

  return (
    <div
      className={`relative flex ${heightPct} shrink-0 flex-col items-center justify-end transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]`}
      style={{
        width: `${isExpanded ? coverWidth : spineWidth}px`,
        zIndex: isExpanded ? 35 : isThisHovered ? 28 : 10,
      }}
      onMouseEnter={() => onHoverChange(true)}
      onMouseLeave={() => onHoverChange(false)}
      onClick={(e) => e.stopPropagation()}
    >
      {book.isCustom && onDelete && (isThisHovered || isExpanded) && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute -top-2 -left-2 z-40 flex h-5 w-5 items-center justify-center rounded-full bg-[#8E2C2C] text-white shadow"
          title="Xóa sách"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      )}

      {isExpanded ? (
        <button
          type="button"
          onClick={onOpenReader}
          className="group/cover relative flex h-full w-[166px] -translate-y-2 text-left transition-transform duration-300 hover:scale-[1.03] focus:outline-none"
        >
          <div
            className="book-sheen relative z-10 h-full flex-1 overflow-hidden rounded-l-[3px] rounded-r-[5px] shadow-[12px_18px_30px_-4px_rgba(12,8,4,0.75)] ring-1 ring-[#F4D36A]/70"
            style={{ backgroundColor: book.spineColor }}
          >
            <div
              className="pointer-events-none absolute inset-y-0 left-0 z-20 w-3"
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
              /* Artistic Clothbound Literary Cover for books without embedded image */
              <div
                className="relative flex h-full flex-col justify-between p-3.5 pl-5"
                style={{
                  color: book.spineTextColor,
                  backgroundImage:
                    'repeating-linear-gradient(45deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 6px)',
                }}
              >
                <div
                  className="pointer-events-none absolute inset-2.5 rounded-[2px] border opacity-35"
                  style={{ borderColor: book.spineAccent }}
                />
                <div className="relative z-10 text-[8.5px] font-semibold uppercase tracking-[0.16em] opacity-80">
                  {book.genre}
                </div>
                <div className="relative z-10">
                  <p className="font-display text-lg font-bold leading-snug drop-shadow-xs">
                    {book.title}
                  </p>
                  <div
                    className="my-2 h-[1.5px] w-8 opacity-75"
                    style={{ backgroundColor: book.spineAccent }}
                  />
                  <p className="font-serif text-[11px] italic opacity-90">
                    {book.author}
                  </p>
                </div>
                <div className="relative z-10 h-6" />
              </div>
            )}

            <div className="absolute inset-x-2 bottom-2.5 z-30 flex justify-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#1C120D]/92 px-3 py-1 text-[11px] font-semibold text-[#F8E2A6] shadow-lg ring-1 ring-[#F4D36A]/55 transition group-hover/cover:bg-[#8E2C2C] group-hover/cover:text-white">
                <BookOpen className="h-3.5 w-3.5" />
                Đọc sách
              </span>
            </div>
          </div>

          <div
            className="relative z-0 my-[2px] -ml-[2px] shrink-0 overflow-hidden rounded-r-[2px] border-y border-r border-black/25 shadow-md"
            style={{ width: `${pageBlockThickness}px` }}
          >
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
      ) : (
        <button
          type="button"
          onClick={onToggleExpand}
          style={{ width: `${spineWidth}px` }}
          className="spine-book-btn book-sheen relative h-full overflow-visible rounded-t-[5px] rounded-b-[2px] shadow-[5px_9px_16px_rgba(14,10,6,0.55)] focus:outline-none focus:ring-2 focus:ring-[#D4A857]"
          title={`${book.title} — ${book.author} (~${book.totalPages} trang)`}
        >
          {/* Top 3D page-block thickness cap */}
          <div
            className="pointer-events-none absolute -top-[4px] left-[3px] right-[3px] h-[4px] rounded-t-[2px]"
            style={{
              background:
                'linear-gradient(90deg, #EAE3D5 0%, #FAF6EE 50%, #D9CFC0 100%)',
            }}
          />
          <RealisticBookSpine
            book={book}
            coverThumbUrl={coverUrl}
            spineWidth={spineWidth}
          />
          {progress?.isFinished && (
            <span
              className="absolute -top-1.5 -right-1 z-20 rounded-full bg-[#1F5C45] p-0.5 text-white shadow"
              title="Đã đọc xong"
            >
              <CheckCircle2 className="h-3 w-3" />
            </span>
          )}
        </button>
      )}
    </div>
  );
};

const StandingBookcaseFrame: React.FC<{
  mood: RoomMood;
  children: React.ReactNode;
}> = ({ mood, children }) => {
  const frameClass =
    mood === 'evening'
      ? 'cabinet-frame-night'
      : mood === 'golden'
        ? 'cabinet-frame-golden'
        : 'cabinet-frame-morning';
  const corniceClass =
    mood === 'evening'
      ? 'wood-cornice-night'
      : mood === 'golden'
        ? 'wood-cornice-golden'
        : 'wood-cornice-morning';

  return (
    <div
      className={`${frameClass} relative flex h-[92%] w-full max-w-[720px] flex-col rounded-t-[6px] transition-all duration-700`}
    >
      <div
        className={`${corniceClass} -mx-2.5 sm:-mx-3.5 h-5 sm:h-6 shrink-0 rounded-t-[5px] transition-all duration-700`}
      />
      <div className="relative flex flex-1 min-h-0 flex-col overflow-hidden">
        {children}
      </div>
      <div
        className={`${corniceClass} -mx-1.5 h-4 sm:h-5 shrink-0 transition-all duration-700`}
      />
    </div>
  );
};

const ShelfTierBay: React.FC<{
  mood: RoomMood;
  children: React.ReactNode;
}> = ({ mood, children }) => {
  const bayClass =
    mood === 'evening'
      ? 'shelf-bay-night'
      : mood === 'golden'
        ? 'shelf-bay-golden'
        : 'shelf-bay-morning';
  const topSurfaceClass =
    mood === 'evening'
      ? 'plank-surface-night'
      : mood === 'golden'
        ? 'plank-surface-golden'
        : 'plank-surface-morning';
  const frontEdgeClass =
    mood === 'evening'
      ? 'wood-plank-night'
      : mood === 'golden'
        ? 'wood-plank-golden'
        : 'wood-plank-morning';

  return (
    <div className="relative flex flex-1 min-h-0 flex-col">
      <div
        className={`${bayClass} relative flex flex-1 min-h-0 items-end justify-center px-4 sm:px-7 pt-2.5 pb-0 transition-all duration-700`}
      >
        <div className="shelf-inner-cheek-left pointer-events-none absolute inset-y-0 left-0 w-4 sm:w-5" />
        <div className="shelf-inner-cheek-right pointer-events-none absolute inset-y-0 right-0 w-4 sm:w-5" />
        {mood === 'evening' && (
          <div className="shelf-downlight pointer-events-none absolute inset-x-4 top-0 h-32" />
        )}
        <div className="relative z-10 flex h-full w-full items-end justify-center gap-1 sm:gap-1.5 pb-[2px] overflow-x-auto no-scrollbar">
          {children}
        </div>
      </div>
      <div className={`${topSurfaceClass} relative z-10 h-[7px] w-full shrink-0 transition-all duration-700`} />
      <div className={`${frontEdgeClass} relative z-10 h-[14px] sm:h-[16px] w-full shrink-0 transition-all duration-700`} />
    </div>
  );
};

const HEIGHT_VARIATIONS = ['h-[93%]', 'h-[89%]', 'h-[95%]', 'h-[87%]', 'h-[92%]'];

function splitInto3Tiers(list: BookItem[]): [BookItem[], BookItem[], BookItem[]] {
  const perTier = Math.max(1, Math.ceil(list.length / 3));
  return [
    list.slice(0, perTier),
    list.slice(perTier, perTier * 2),
    list.slice(perTier * 2),
  ];
}

export const Bookshelf: React.FC<BookshelfProps> = ({
  books,
  progressMap,
  roomMood,
  onOpenBook,
  onDeleteCustomBook,
  onAddBookClick,
}) => {
  const [activeCabinet, setActiveCabinet] = useState<0 | 1 | 2>(1);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredBookKey, setHoveredBookKey] = useState<string | null>(null);
  const [expandedBookKey, setExpandedBookKey] = useState<string | null>(null);

  const dragStartX = useRef<number | null>(null);

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

  // Distribute ALL user books across the 3 cabinets naturally:
  // Center cabinet gets the first 10 books (featured!), Left gets the next 8, Right gets the remaining 8+!
  const centerBooks = books.slice(0, 10);
  const leftBooks = books.slice(10, 18);
  const rightBooks = books.slice(18);

  const cabinets: { idx: 0 | 1 | 2; list: BookItem[]; origin: string }[] = [
    { idx: 0, list: leftBooks, origin: 'right bottom' },
    { idx: 1, list: centerBooks, origin: 'center bottom' },
    { idx: 2, list: rightBooks, origin: 'left bottom' },
  ];

  const basePercent = 21 - activeCabinet * 58;

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
      <div
        className="flex flex-1 min-h-0 items-end"
        style={{
          transform: `translate3d(calc(${basePercent}% + ${dragOffset}px), 0, 0)`,
          transition: isDragging
            ? 'none'
            : 'transform 0.65s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        {cabinets.map(({ idx, list, origin }) => {
          const tiers = splitInto3Tiers(list);
          return (
            <section
              key={idx}
              onClick={() => {
                if (activeCabinet !== idx) {
                  setActiveCabinet(idx);
                  setExpandedBookKey(null);
                }
              }}
              className={`flex h-full w-[58%] shrink-0 items-end justify-center px-4 sm:px-9 transition-all duration-700 ${
                activeCabinet === idx
                  ? 'scale-100 opacity-100'
                  : 'scale-[0.9] opacity-82 hover:opacity-95 cursor-pointer'
              }`}
              style={{ transformOrigin: origin }}
            >
              <StandingBookcaseFrame mood={roomMood}>
                {tiers.map((tierBooks, tierIdx) => (
                  <ShelfTierBay key={tierIdx} mood={roomMood}>
                    {tierBooks.map((book, bIdx) => {
                      const key = `cab${idx}-${book.id}`;
                      const hPct =
                        HEIGHT_VARIATIONS[(bIdx + tierIdx) % HEIGHT_VARIATIONS.length];
                      return (
                        <InlineFlipBook
                          key={key}
                          book={book}
                          progress={progressMap[book.id]}
                          isExpanded={expandedBookKey === key}
                          isThisHovered={hoveredBookKey === key}
                          heightPct={hPct}
                          onHoverChange={(h) => setHoveredBookKey(h ? key : null)}
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

                    {/* Add PDF slot on bottom tier of Right cabinet */}
                    {idx === 2 && tierIdx === 2 && onAddBookClick && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddBookClick();
                        }}
                        className={`mx-1 flex h-[84%] w-12 shrink-0 flex-col items-center justify-center rounded-t-[4px] border-2 border-dashed transition ${
                          roomMood === 'evening'
                            ? 'border-amber-200/35 bg-white/5 text-amber-100/75 hover:border-amber-200/70 hover:bg-white/10'
                            : 'border-[#8D7B64]/60 bg-white/25 text-[#5C4E3C] hover:border-[#5A452D] hover:bg-white/55'
                        }`}
                        title="Thêm sách PDF mới"
                        aria-label="Thêm sách PDF mới"
                      >
                        <Plus className="h-5 w-5" />
                      </button>
                    )}
                  </ShelfTierBay>
                ))}
              </StandingBookcaseFrame>
            </section>
          );
        })}
      </div>
    </div>
  );
};
