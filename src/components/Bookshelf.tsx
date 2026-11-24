import React, { useEffect, useRef, useState } from 'react';
import { BookOpen, CheckCircle2, Plus, Trash2 } from 'lucide-react';
import { BookItem, BookProgress, BookSeriesInfo } from '../types/book';
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
 * - Zero white cap strip above spine!
 * - Clicking the spine pulls out the FULL front cover cleanly in front (z-50) without clipping or pushing neighbors off the shelf!
 */
const InlineFlipBook: React.FC<{
  book: BookItem;
  progress?: BookProgress;
  isExpanded: boolean;
  isThisHovered: boolean;
  heightPct: string;
  alignPopup?: 'left' | 'center' | 'right';
  inSeriesBox?: boolean;
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
  alignPopup = 'center',
  inSeriesBox = false,
  onHoverChange,
  onToggleExpand,
  onOpenReader,
  onDelete,
}) => {
  const [coverUrl, setCoverUrl] = useState<string | null>(
    book.coverUrl || null
  );
  const isAchilles = book.id === 'truong-ca-achilles';

  useEffect(() => {
    if (isAchilles) return;
    if (book.coverUrl) {
      setCoverUrl(book.coverUrl);
      return;
    }
    if (!book.pdfUrl || coverUrl) return;
    let active = true;
    getBookCoverUrl(book).then((url) => {
      if (active) setCoverUrl(url);
    });
    return () => {
      active = false;
    };
  }, [book, isAchilles, coverUrl]);

  const spineWidth = getBookSpineWidth(progress?.totalPages || book.totalPages);
  const pageBlockThickness = Math.max(8, Math.min(18, Math.round(spineWidth * 0.25)));

  const coverPositionClass =
    alignPopup === 'right'
      ? 'right-0'
      : alignPopup === 'left'
        ? 'left-0'
        : 'left-1/2 -translate-x-1/2';

  return (
    <div
      className={`relative flex ${inSeriesBox ? 'h-full' : heightPct} shrink-0 flex-col items-center justify-end`}
      style={{
        width: `${spineWidth}px`,
        zIndex: isExpanded ? 60 : isThisHovered ? 30 : 10,
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
          className="absolute -top-2 -left-2 z-50 flex h-5 w-5 items-center justify-center rounded-full bg-[#8E2C2C] text-white shadow"
          title="Xóa sách"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      )}

      {/* Book Spine standing cleanly in its exact slot (no shifting/clipping!) */}
      <button
        type="button"
        onClick={onToggleExpand}
        style={{ width: `${spineWidth}px` }}
        className={`spine-book-btn relative h-full overflow-hidden rounded-t-[4px] rounded-b-[2px] shadow-[4px_8px_14px_rgba(14,10,6,0.52)] focus:outline-none focus:ring-2 focus:ring-[#D4A857] ${
          isExpanded ? 'opacity-25' : 'opacity-100'
        }`}
        title={`${book.title} — ${book.author} (~${book.totalPages} trang)`}
      >
        <RealisticBookSpine
          book={book}
          coverThumbUrl={coverUrl}
          spineWidth={spineWidth}
        />
        {progress?.isFinished && (
          <span
            className="absolute top-1 right-1 z-20 rounded-full bg-[#1F5C45] p-0.5 text-white shadow"
            title="Đã đọc xong"
          >
            <CheckCircle2 className="h-3 w-3" />
          </span>
        )}
      </button>

      {/* UNCLIPPED IN-PLACE 3D FRONT COVER REVEAL FLOATING CLEANLY IN FRONT OF ITS SLOT */}
      {isExpanded && (
        <button
          type="button"
          onClick={onOpenReader}
          className={`animate-cover-reveal group/cover absolute bottom-0 ${coverPositionClass} z-50 flex h-[112%] min-h-[210px] w-[166px] sm:w-[178px] -translate-y-2 text-left transition-transform duration-300 hover:scale-[1.03] focus:outline-none`}
        >
          <div
            className="relative z-10 h-full flex-1 overflow-hidden rounded-l-[3px] rounded-r-[5px] shadow-[0_22px_44px_-6px_rgba(0,0,0,0.85),0_0_24px_rgba(244,211,106,0.35)] ring-2 ring-[#F4D36A]/80"
            style={{ backgroundColor: book.spineColor }}
          >
            <div
              className="pointer-events-none absolute inset-y-0 left-0 z-20 w-3"
              style={{
                background:
                  'linear-gradient(90deg, rgba(255,255,255,0.22) 0%, rgba(0,0,0,0.08) 45%, rgba(0,0,0,0.28) 85%, rgba(255,255,255,0.1) 100%)',
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
                className="relative flex h-full flex-col justify-between p-3.5 pl-5"
                style={{ color: book.spineTextColor }}
              >
                <div className="text-[8.5px] font-semibold uppercase tracking-[0.16em] opacity-80">
                  {book.genre}
                </div>
                <div>
                  <p className="font-display text-lg font-bold leading-snug">
                    {book.title}
                  </p>
                  <p className="mt-1 font-serif text-[11px] italic opacity-90">
                    {book.author}
                  </p>
                </div>
                <div className="h-6" />
              </div>
            )}

            <div className="absolute inset-x-2 bottom-2.5 z-30 flex justify-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#1C120D]/92 px-3 py-1 text-[11px] font-semibold text-[#F8E2A6] shadow-lg ring-1 ring-[#F4D36A]/65 transition group-hover/cover:bg-[#8E2C2C] group-hover/cover:text-white">
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
      )}
    </div>
  );
};

/** Larger, Image-1 proportioned Standing Hardwood Bookcase Frame */
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
      className={`${frameClass} relative flex h-[97%] w-full max-w-[820px] flex-col rounded-t-[6px] transition-all duration-700`}
    >
      <div
        className={`${corniceClass} -mx-2.5 sm:-mx-3.5 h-5 sm:h-6 shrink-0 rounded-t-[5px] transition-all duration-700`}
      />
      {/* Note: overflow-visible so expanded 3D book covers NEVER get sliced off! */}
      <div className="relative flex flex-1 min-h-0 flex-col overflow-visible">
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
        className={`${bayClass} relative flex flex-1 min-h-0 items-end justify-start px-5 sm:px-8 pt-2 pb-0 transition-all duration-700`}
      >
        <div className="shelf-inner-cheek-left pointer-events-none absolute inset-y-0 left-0 w-4 sm:w-5" />
        <div className="shelf-inner-cheek-right pointer-events-none absolute inset-y-0 right-0 w-4 sm:w-5" />
        {mood === 'evening' && (
          <div className="shelf-downlight pointer-events-none absolute inset-x-4 top-0 h-32" />
        )}
        <div className="relative z-10 flex h-full w-full items-end justify-start gap-1 sm:gap-1.5 pb-[2px] overflow-visible">
          {children}
        </div>
      </div>
      <div className={`${topSurfaceClass} relative z-10 h-[7px] w-full shrink-0 transition-all duration-700`} />
      <div className={`${frontEdgeClass} relative z-10 h-[14px] sm:h-[16px] w-full shrink-0 transition-all duration-700`} />
    </div>
  );
};

const HEIGHT_VARIATIONS = ['h-[93%]', 'h-[89%]', 'h-[95%]', 'h-[87%]', 'h-[92%]'];

type ShelfUnit =
  | { type: 'single'; book: BookItem; width: number }
  | { type: 'series'; series: BookSeriesInfo; books: BookItem[]; width: number };

/**
 * Group books into indivisible ShelfUnits:
 * - Books with the same `series.id` (or future auto-detected matching series titles) are grouped side-by-side
 *   in exact `series.order` inside one Collector Slipcase Box!
 * - Pack units sequentially left-to-right filling Cabinet 0 (Left) -> Cabinet 1 (Middle) -> Cabinet 2 (Right)!
 */
function buildAndPackShelfUnits(
  books: BookItem[],
  progressMap: Record<string, BookProgress>
): [
  [ShelfUnit[], ShelfUnit[], ShelfUnit[]],
  [ShelfUnit[], ShelfUnit[], ShelfUnit[]],
  [ShelfUnit[], ShelfUnit[], ShelfUnit[]],
] {
  // 1. Auto-detect any future same-prefix multi-volume series if not explicitly tagged
  const seriesGroups = new Map<string, BookItem[]>();
  const units: ShelfUnit[] = [];
  const handled = new Set<string>();

  for (const book of books) {
    if (book.series) {
      const arr = seriesGroups.get(book.series.id) || [];
      arr.push(book);
      seriesGroups.set(book.series.id, arr);
    }
  }

  for (const book of books) {
    if (handled.has(book.id)) continue;

    if (book.series) {
      const group = (seriesGroups.get(book.series.id) || [book])
        .slice()
        .sort((a, b) => (a.series?.order || 0) - (b.series?.order || 0));
      group.forEach((b) => handled.add(b.id));

      const totalW =
        group.reduce(
          (sum, b) =>
            sum + getBookSpineWidth(progressMap[b.id]?.totalPages || b.totalPages) + 1,
          0
        ) + 12; // slipcase box walls

      units.push({
        type: 'series',
        series: book.series,
        books: group,
        width: totalW,
      });
    } else {
      handled.add(book.id);
      const w = getBookSpineWidth(
        progressMap[book.id]?.totalPages || book.totalPages
      );
      units.push({ type: 'single', book, width: w });
    }
  }

  // 2. Pack sequentially into 9 shelves (Left cab 0..2 -> Middle cab 3..5 -> Right cab 6..8)
  const MAX_SHELF_WIDTH = 695;
  const GAP = 6;
  const shelves: ShelfUnit[][] = Array.from({ length: 9 }, () => []);
  let shelfIdx = 0;
  let usedWidth = 0;

  for (const unit of units) {
    const needed = usedWidth > 0 ? unit.width + GAP : unit.width;
    if (usedWidth + needed > MAX_SHELF_WIDTH && shelfIdx < 8) {
      shelfIdx++;
      usedWidth = 0;
    }
    shelves[shelfIdx].push(unit);
    usedWidth += usedWidth > 0 ? unit.width + GAP : unit.width;
  }

  return [
    [shelves[0], shelves[1], shelves[2]],
    [shelves[3], shelves[4], shelves[5]],
    [shelves[6], shelves[7], shelves[8]],
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
  // Start focused on LEFT Cabinet (0) as requested! Fill order: Left (0) -> Middle (1) -> Right (2)
  const [activeCabinet, setActiveCabinet] = useState<0 | 1 | 2>(0);
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
    setDragOffset(Math.max(-280, Math.min(280, dx)));
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

  const packedCabinets = buildAndPackShelfUnits(books, progressMap);

  // Place "+" upload slot right after the last book in fill order (Left 0 -> Middle 1 -> Right 2)
  const addSlotTarget = (() => {
    for (let cIdx = 0; cIdx < 3; cIdx++) {
      for (let t = 0; t < 3; t++) {
        const used = packedCabinets[cIdx][t].reduce(
          (sum, u) => sum + u.width + 6,
          0
        );
        if (used + 56 <= 695) return { cIdx, tierIdx: t };
      }
    }
    return { cIdx: 2, tierIdx: 2 };
  })();

  // Wider Image-1 cabinet slot (66% width) -> 17% side margin showing neighboring cabinet edge!
  // activeCabinet = 0 (Left) -> +17%
  // activeCabinet = 1 (Middle) -> -49%
  // activeCabinet = 2 (Right) -> -115%
  const basePercent = 17 - activeCabinet * 66;

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
        {([0, 1, 2] as const).map((cIdx) => {
          const tiers = packedCabinets[cIdx];
          return (
            <section
              key={cIdx}
              onClick={() => {
                if (activeCabinet !== cIdx) {
                  setActiveCabinet(cIdx);
                  setExpandedBookKey(null);
                }
              }}
              className={`flex h-full w-[66%] shrink-0 items-end justify-center px-3 sm:px-7 transition-all duration-700 ${
                activeCabinet === cIdx
                  ? 'scale-100 opacity-100'
                  : 'scale-[0.92] opacity-82 hover:opacity-95 cursor-pointer'
              }`}
            >
              <StandingBookcaseFrame mood={roomMood}>
                {tiers.map((tierUnits, tierIdx) => {
                  const totalUnits = tierUnits.length;
                  return (
                    <ShelfTierBay key={tierIdx} mood={roomMood}>
                      {tierUnits.map((unit, uIdx) => {
                        const alignPopup: 'left' | 'center' | 'right' =
                          uIdx === 0
                            ? 'left'
                            : uIdx >= totalUnits - 1 && totalUnits > 3
                              ? 'right'
                              : 'center';

                        if (unit.type === 'series') {
                          return (
                            <div
                              key={`series-${unit.series.id}`}
                              className="relative flex h-[96%] shrink-0 flex-col justify-end rounded-t-[5px] rounded-b-[3px] p-[4px] pb-[5px] shadow-[6px_10px_20px_rgba(0,0,0,0.62)]"
                              style={{
                                backgroundColor: unit.series.boxColor,
                                border: `2px solid ${unit.series.boxAccent}CC`,
                                boxShadow: `inset 0 0 12px rgba(0,0,0,0.65), 0 8px 18px rgba(0,0,0,0.55)`,
                              }}
                              title={`Box-Set: ${unit.series.name} (${unit.books.length} tập)`}
                            >
                              {/* Slipcase top inner shadow + brass series plaque */}
                              <div
                                className="mb-[3px] flex items-center justify-center rounded-[2px] py-[1px] text-[7px] font-bold uppercase tracking-[0.14em]"
                                style={{
                                  backgroundColor: `${unit.series.boxAccent}22`,
                                  color: unit.series.boxAccent,
                                }}
                              >
                                {unit.series.name}
                              </div>

                              <div className="flex flex-1 min-h-0 items-end gap-[2px]">
                                {unit.books.map((book, bIdx) => {
                                  const key = `cab${cIdx}-${book.id}`;
                                  const boxAlign: 'left' | 'center' | 'right' =
                                    bIdx === 0 && uIdx === 0
                                      ? 'left'
                                      : bIdx === unit.books.length - 1 &&
                                          uIdx >= totalUnits - 1
                                        ? 'right'
                                        : 'center';
                                  return (
                                    <InlineFlipBook
                                      key={key}
                                      book={book}
                                      progress={progressMap[book.id]}
                                      isExpanded={expandedBookKey === key}
                                      isThisHovered={hoveredBookKey === key}
                                      heightPct="h-full"
                                      alignPopup={boxAlign}
                                      inSeriesBox
                                      onHoverChange={(h) =>
                                        setHoveredBookKey(h ? key : null)
                                      }
                                      onToggleExpand={() =>
                                        setExpandedBookKey((cur) =>
                                          cur === key ? null : key
                                        )
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
                              </div>
                            </div>
                          );
                        }

                        const book = unit.book;
                        const key = `cab${cIdx}-${book.id}`;
                        const hPct =
                          HEIGHT_VARIATIONS[
                            (uIdx + tierIdx) % HEIGHT_VARIATIONS.length
                          ];
                        return (
                          <InlineFlipBook
                            key={key}
                            book={book}
                            progress={progressMap[book.id]}
                            isExpanded={expandedBookKey === key}
                            isThisHovered={hoveredBookKey === key}
                            heightPct={hPct}
                            alignPopup={alignPopup}
                            onHoverChange={(h) =>
                              setHoveredBookKey(h ? key : null)
                            }
                            onToggleExpand={() =>
                              setExpandedBookKey((cur) =>
                                cur === key ? null : key
                              )
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

                      {/* Add PDF slot right after the last book */}
                      {onAddBookClick &&
                        addSlotTarget.cIdx === cIdx &&
                        addSlotTarget.tierIdx === tierIdx && (
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
                  );
                })}
              </StandingBookcaseFrame>
            </section>
          );
        })}
      </div>
    </div>
  );
};
