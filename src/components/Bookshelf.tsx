import React, { useEffect, useRef, useState } from 'react';
import { BookOpen, Plus, Trash2 } from 'lucide-react';
import { BookItem, BookProgress } from '../types/book';
import { getBookCoverUrl } from '../utils/pdfEngine';
import { AchillesCoverArt, AchillesSprayedEdge } from './AchillesArtwork';
import { RealisticBookSpine } from './RealisticBookSpine';
import { RoomMood } from './AmbientRoomEffects';
import {
  formatReadingDuration,
  formatTimeSinceLastRead,
} from '../utils/timeFormat';

interface BookshelfProps {
  books: BookItem[];
  progressMap: Record<string, BookProgress>;
  roomMood: RoomMood;
  onOpenBook: (book: BookItem, startPage?: number) => void;
  onDeleteCustomBook?: (bookId: string) => void;
  onAddBookClick?: () => void;
}

/** Realistic 3D Hardwood Companion Spine filling ~86% of shelf height */
const ClothCompanionSpine: React.FC<{
  color: string;
  accent: string;
  heightPct?: string;
  widthClass: string;
  symbol?: 'leaf' | 'star' | 'rose' | 'moon';
}> = ({ color, accent, heightPct = 'h-[86%]', widthClass, symbol = 'leaf' }) => (
  <div
    className={`relative shrink-0 overflow-hidden rounded-t-[4px] rounded-b-[1px] shadow-[4px_8px_14px_rgba(12,8,4,0.5)] ${heightPct} ${widthClass}`}
    style={{
      backgroundColor: color,
      backgroundImage: `
        repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 3px),
        linear-gradient(90deg, rgba(0,0,0,0.34) 0%, rgba(255,255,255,0.22) 12%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.4) 100%)
      `,
    }}
    aria-hidden="true"
  >
    <div className="pointer-events-none absolute inset-y-0 left-[3px] w-[1px] bg-black/25" />
    <div className="pointer-events-none absolute inset-y-0 right-[3px] w-[1px] bg-black/25" />
    <div className="mx-1.5 mt-3.5 h-[2px] opacity-75" style={{ backgroundColor: accent }} />
    <div className="mt-5 flex justify-center opacity-70">
      <span
        className="h-3 w-3 rounded-full border"
        style={{ borderColor: accent }}
      />
    </div>
    <div className="my-5 mx-auto h-12 w-[1px] opacity-40" style={{ backgroundColor: accent }} />
    <div className="flex justify-center opacity-75">
      <span className="text-[9px]" style={{ color: accent }}>
        {symbol === 'star' ? '✦' : symbol === 'moon' ? '☾' : symbol === 'rose' ? '✿' : '❖'}
      </span>
    </div>
    <div className="absolute inset-x-1.5 bottom-3.5 h-[2px] opacity-75" style={{ backgroundColor: accent }} />
  </div>
);

/**
 * Interactive 3D Book on Shelf — tall (~92% of shelf bay height!), crisp, large legible spine & cover.
 */
const InlineFlipBook: React.FC<{
  book: BookItem;
  progress?: BookProgress;
  isExpanded: boolean;
  isThisHovered: boolean;
  showFinishedTag?: boolean;
  onHoverChange: (hovered: boolean) => void;
  onToggleExpand: () => void;
  onOpenReader: () => void;
  onDelete?: () => void;
}> = ({
  book,
  progress,
  isExpanded,
  isThisHovered,
  showFinishedTag = false,
  onHoverChange,
  onToggleExpand,
  onOpenReader,
  onDelete,
}) => {
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const isAchilles = book.id === 'truong-ca-achilles';

  useEffect(() => {
    if (isAchilles || coverUrl) return;
    let active = true;
    getBookCoverUrl(book).then((url) => {
      if (active) setCoverUrl(url);
    });
    return () => {
      active = false;
    };
  }, [book, isAchilles, coverUrl]);

  const spineWidth = isAchilles ? 64 : 68;
  const coverWidth = 172;

  return (
    <div
      className="relative flex h-[92%] flex-col items-center justify-end transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
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
          className="group/cover relative flex h-full w-[172px] -translate-y-2 text-left transition-transform duration-300 hover:scale-[1.03] focus:outline-none"
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
              <div
                className="flex h-full flex-col justify-between p-3.5 pl-4"
                style={{ color: book.spineTextColor }}
              >
                <p className="font-display text-lg font-bold leading-tight">
                  {book.title}
                </p>
                <p className="font-serif text-xs italic opacity-85">
                  {book.author}
                </p>
              </div>
            )}

            <div className="absolute inset-x-2 bottom-2.5 z-30 flex justify-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#1C120D]/92 px-3 py-1 text-[11px] font-semibold text-[#F8E2A6] shadow-lg ring-1 ring-[#F4D36A]/55 transition group-hover/cover:bg-[#8E2C2C] group-hover/cover:text-white">
                <BookOpen className="h-3.5 w-3.5" />
                Đọc sách
              </span>
            </div>
          </div>

          <div className="relative z-0 my-[2px] -ml-[2px] w-[14px] shrink-0 overflow-hidden rounded-r-[2px] border-y border-r border-black/25 shadow-md">
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
          className="spine-book-btn book-sheen relative h-full overflow-visible rounded-t-[5px] rounded-b-[2px] shadow-[6px_10px_18px_rgba(14,10,6,0.58)] focus:outline-none focus:ring-2 focus:ring-[#D4A857]"
        >
          {/* Top 3D page-block thickness edge */}
          <div
            className="pointer-events-none absolute -top-[5px] left-[3px] right-[3px] h-[5px] rounded-t-[2px]"
            style={{
              background:
                'linear-gradient(90deg, #EAE3D5 0%, #FAF6EE 50%, #D9CFC0 100%)',
            }}
          />
          <RealisticBookSpine book={book} coverThumbUrl={coverUrl} />
        </button>
      )}

      {showFinishedTag && progress?.isFinished && (
        <div className="mt-1 rounded border border-[#C9A45A]/60 bg-[#241810]/92 px-1.5 py-0.5 text-center text-[8.5px] leading-tight text-[#F6E2B3] shadow">
          <div className="font-semibold">
            {formatReadingDuration(progress.firstOpenedAt, progress.finishedAt)}
          </div>
          <div className="opacity-80">
            {formatTimeSinceLastRead(progress.lastReadAt)}
          </div>
        </div>
      )}
    </div>
  );
};

/** Realistic 3D Sculptural Hardwood Standing Bookcase Unit */
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
      className={`${frameClass} relative flex h-[92%] w-full max-w-[660px] flex-col rounded-t-[6px] transition-all duration-700`}
    >
      {/* Carved Overhanging Crown Molding */}
      <div
        className={`${corniceClass} -mx-2.5 sm:-mx-3.5 h-5 sm:h-6 shrink-0 rounded-t-[5px] transition-all duration-700`}
      />

      {/* Inner Cabinet Body with 3D Recessed Shelves */}
      <div className="relative flex flex-1 min-h-0 flex-col overflow-hidden">
        {children}
      </div>

      {/* Stepped Hardwood Plinth Base */}
      <div
        className={`${corniceClass} -mx-1.5 h-4 sm:h-5 shrink-0 transition-all duration-700`}
      />
    </div>
  );
};

/** Single 3D Shelf Compartment with Angled Inner Side Cheeks, Top Surface Ledge & Front Edge */
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
      {/* Recessed Interior Bay with Angled 3D Side Cheeks */}
      <div
        className={`${bayClass} relative flex flex-1 min-h-0 items-end justify-center px-5 sm:px-8 pt-2.5 pb-0 transition-all duration-700`}
      >
        {/* Left & right angled inner cabinet depth walls */}
        <div className="shelf-inner-cheek-left pointer-events-none absolute inset-y-0 left-0 w-4 sm:w-5" />
        <div className="shelf-inner-cheek-right pointer-events-none absolute inset-y-0 right-0 w-4 sm:w-5" />

        {/* Warm recessed LED downlight cone in Night mode */}
        {mood === 'evening' && (
          <div className="shelf-downlight pointer-events-none absolute inset-x-4 top-0 h-32" />
        )}

        {/* Books standing directly on the shelf surface with subtle ground contact shadow */}
        <div className="relative z-10 flex h-full w-full items-end justify-center gap-1.5 sm:gap-2 pb-[2px]">
          {children}
        </div>
      </div>

      {/* 3D Double-Layer Shelf Plank: Horizontal Top Depth Surface + Front Vertical Edge */}
      <div className={`${topSurfaceClass} relative z-10 h-[7px] w-full shrink-0 transition-all duration-700`} />
      <div className={`${frontEdgeClass} relative z-10 h-[14px] sm:h-[16px] w-full shrink-0 transition-all duration-700`} />
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

  const readingBooks = books.filter((b) => {
    const p = progressMap[b.id];
    return p && !p.isFinished && (p.bookmarkedPage || p.currentPage > 1);
  });
  const finishedBooks = books.filter((b) => progressMap[b.id]?.isFinished);

  // Narrower sculptural cabinets (58% slot with generous visible room wall gaps between cabinets!)
  // activeCabinet = 0 -> +21%
  // activeCabinet = 1 -> -37% (center cabinet centered, 21% left & right showing room wall + peeking edges of neighbor cabinets!)
  // activeCabinet = 2 -> -95%
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
      {/* 3-CABINET SCULPTURAL ROOM PANORAMA (Visible room atmosphere around & between cabinets!) */}
      <div
        className="flex flex-1 min-h-0 items-end"
        style={{
          transform: `translate3d(calc(${basePercent}% + ${dragOffset}px), 0, 0)`,
          transition: isDragging
            ? 'none'
            : 'transform 0.65s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        {/* CABINET 0 (LEFT): IN-PROGRESS BOOKS */}
        <section
          onClick={() => {
            if (activeCabinet !== 0) {
              setActiveCabinet(0);
              setExpandedBookKey(null);
            }
          }}
          className={`flex h-full w-[58%] shrink-0 items-end justify-center px-5 sm:px-10 transition-all duration-700 ${
            activeCabinet === 0
              ? 'scale-100 opacity-100'
              : 'scale-[0.9] opacity-80 hover:opacity-95 cursor-pointer'
          }`}
          style={{ transformOrigin: 'right bottom' }}
        >
          <StandingBookcaseFrame mood={roomMood}>
            <ShelfTierBay mood={roomMood}>
              <ClothCompanionSpine color="#7A9E90" accent="#F5EEDB" heightPct="h-[85%]" widthClass="w-9 sm:w-10" symbol="leaf" />
              <ClothCompanionSpine color="#746D98" accent="#E8DDF5" heightPct="h-[90%]" widthClass="w-9 sm:w-10" symbol="moon" />
              {readingBooks.map((book) => {
                const key = `left-${book.id}`;
                return (
                  <InlineFlipBook
                    key={key}
                    book={book}
                    progress={progressMap[book.id]}
                    isExpanded={expandedBookKey === key}
                    isThisHovered={hoveredBookKey === key}
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
                  />
                );
              })}
              <ClothCompanionSpine color="#D4848E" accent="#FFF0E6" heightPct="h-[84%]" widthClass="w-9 sm:w-10" symbol="rose" />
            </ShelfTierBay>

            <ShelfTierBay mood={roomMood}>
              <ClothCompanionSpine color="#4E6F88" accent="#E6EDF4" heightPct="h-[86%]" widthClass="w-10" symbol="star" />
              <ClothCompanionSpine color="#3C6B5B" accent="#F2D992" heightPct="h-[91%]" widthClass="w-10" symbol="leaf" />
              <ClothCompanionSpine color="#9E624A" accent="#F7E5C8" heightPct="h-[84%]" widthClass="w-9" symbol="rose" />
              <ClothCompanionSpine color="#544B6E" accent="#E4D6F5" heightPct="h-[88%]" widthClass="w-10" symbol="moon" />
            </ShelfTierBay>

            <ShelfTierBay mood={roomMood}>
              <ClothCompanionSpine color="#A56958" accent="#FCEAD2" heightPct="h-[84%]" widthClass="w-10" symbol="leaf" />
              <ClothCompanionSpine color="#637E72" accent="#EDF5EE" heightPct="h-[88%]" widthClass="w-10" symbol="star" />
              <ClothCompanionSpine color="#8C7A6B" accent="#F5EDE0" heightPct="h-[82%]" widthClass="w-9" symbol="rose" />
            </ShelfTierBay>
          </StandingBookcaseFrame>
        </section>

        {/* CABINET 1 (CENTER): MAIN PERSONAL LIBRARY */}
        <section
          onClick={() => {
            if (activeCabinet !== 1) {
              setActiveCabinet(1);
              setExpandedBookKey(null);
            }
          }}
          className={`flex h-full w-[58%] shrink-0 items-end justify-center px-5 sm:px-10 transition-all duration-700 ${
            activeCabinet === 1
              ? 'scale-100 opacity-100'
              : 'scale-[0.9] opacity-80 hover:opacity-95 cursor-pointer'
          }`}
        >
          <StandingBookcaseFrame mood={roomMood}>
            {[0, 1, 2].map((tier) => {
              const tierBooks =
                tier === 0 ? books.slice(0, 5) : tier === 1 ? books.slice(5, 10) : books.slice(10);

              return (
                <ShelfTierBay key={tier} mood={roomMood}>
                  {tier === 0 && (
                    <>
                      <ClothCompanionSpine color="#B5654D" accent="#FBE6C2" heightPct="h-[86%]" widthClass="w-9 sm:w-10" symbol="leaf" />
                      <ClothCompanionSpine color="#457A6B" accent="#F2E4C8" heightPct="h-[90%]" widthClass="w-9 sm:w-10" symbol="star" />

                      {tierBooks.map((book) => {
                        const key = `center-${book.id}`;
                        return (
                          <InlineFlipBook
                            key={key}
                            book={book}
                            progress={progressMap[book.id]}
                            isExpanded={expandedBookKey === key}
                            isThisHovered={hoveredBookKey === key}
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

                      <ClothCompanionSpine color="#D68E9C" accent="#FFF4EC" heightPct="h-[88%]" widthClass="w-9 sm:w-10" symbol="rose" />
                      <ClothCompanionSpine color="#7B739C" accent="#EDE4FA" heightPct="h-[84%]" widthClass="w-9 sm:w-10" symbol="moon" />
                    </>
                  )}

                  {tier === 1 && (
                    <>
                      <ClothCompanionSpine color="#94624B" accent="#F7E3C6" heightPct="h-[85%]" widthClass="w-9 sm:w-10" symbol="leaf" />
                      <ClothCompanionSpine color="#7C9A8E" accent="#F3F7F2" heightPct="h-[90%]" widthClass="w-9 sm:w-10" symbol="rose" />

                      {tierBooks.map((book) => {
                        const key = `center-${book.id}`;
                        return (
                          <InlineFlipBook
                            key={key}
                            book={book}
                            progress={progressMap[book.id]}
                            isExpanded={expandedBookKey === key}
                            isThisHovered={hoveredBookKey === key}
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

                      {onAddBookClick && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddBookClick();
                          }}
                          className={`mx-1.5 flex h-[84%] w-14 flex-col items-center justify-center rounded-t-[4px] border-2 border-dashed transition ${
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

                      <ClothCompanionSpine color="#355F56" accent="#EED38B" heightPct="h-[88%]" widthClass="w-9 sm:w-10" symbol="moon" />
                      <ClothCompanionSpine color="#B87A6D" accent="#FDEEE4" heightPct="h-[84%]" widthClass="w-9 sm:w-10" symbol="star" />
                    </>
                  )}

                  {tier === 2 && (
                    <>
                      <ClothCompanionSpine color="#6A4248" accent="#F0D298" heightPct="h-[84%]" widthClass="w-10" symbol="rose" />
                      <ClothCompanionSpine color="#455B73" accent="#DCE8F2" heightPct="h-[89%]" widthClass="w-10" symbol="star" />
                      <ClothCompanionSpine color="#8A6848" accent="#F8E7C8" heightPct="h-[83%]" widthClass="w-10" symbol="leaf" />
                      <ClothCompanionSpine color="#4E6A58" accent="#E8F0E2" heightPct="h-[87%]" widthClass="w-10" symbol="moon" />
                      <ClothCompanionSpine color="#9E564E" accent="#FCE2C6" heightPct="h-[82%]" widthClass="w-9" symbol="rose" />
                    </>
                  )}
                </ShelfTierBay>
              );
            })}
          </StandingBookcaseFrame>
        </section>

        {/* CABINET 2 (RIGHT): FINISHED BOOKS */}
        <section
          onClick={() => {
            if (activeCabinet !== 2) {
              setActiveCabinet(2);
              setExpandedBookKey(null);
            }
          }}
          className={`flex h-full w-[58%] shrink-0 items-end justify-center px-5 sm:px-10 transition-all duration-700 ${
            activeCabinet === 2
              ? 'scale-100 opacity-100'
              : 'scale-[0.9] opacity-80 hover:opacity-95 cursor-pointer'
          }`}
          style={{ transformOrigin: 'left bottom' }}
        >
          <StandingBookcaseFrame mood={roomMood}>
            <ShelfTierBay mood={roomMood}>
              <ClothCompanionSpine color="#3B6258" accent="#EED492" heightPct="h-[86%]" widthClass="w-9 sm:w-10" symbol="leaf" />
              {finishedBooks.map((book) => {
                const key = `right-${book.id}`;
                return (
                  <InlineFlipBook
                    key={key}
                    book={book}
                    progress={progressMap[book.id]}
                    isExpanded={expandedBookKey === key}
                    isThisHovered={hoveredBookKey === key}
                    showFinishedTag
                    onHoverChange={(h) => setHoveredBookKey(h ? key : null)}
                    onToggleExpand={() =>
                      setExpandedBookKey((cur) => (cur === key ? null : key))
                    }
                    onOpenReader={() => onOpenBook(book, 1)}
                  />
                );
              })}
              <ClothCompanionSpine color="#8C515C" accent="#F6DFC4" heightPct="h-[84%]" widthClass="w-9 sm:w-10" symbol="rose" />
              <ClothCompanionSpine color="#536884" accent="#E4EEF8" heightPct="h-[89%]" widthClass="w-9 sm:w-10" symbol="star" />
            </ShelfTierBay>

            <ShelfTierBay mood={roomMood}>
              <ClothCompanionSpine color="#A16F52" accent="#FCE8C8" heightPct="h-[85%]" widthClass="w-10" symbol="moon" />
              <ClothCompanionSpine color="#5D7D6D" accent="#EEF6EC" heightPct="h-[90%]" widthClass="w-10" symbol="leaf" />
              <ClothCompanionSpine color="#6F5B82" accent="#EFE4FA" heightPct="h-[84%]" widthClass="w-9" symbol="star" />
            </ShelfTierBay>

            <ShelfTierBay mood={roomMood}>
              <ClothCompanionSpine color="#7A4C48" accent="#F5DAC0" heightPct="h-[84%]" widthClass="w-10" symbol="rose" />
              <ClothCompanionSpine color="#405E68" accent="#DDF0F2" heightPct="h-[88%]" widthClass="w-10" symbol="leaf" />
            </ShelfTierBay>
          </StandingBookcaseFrame>
        </section>
      </div>
    </div>
  );
};
