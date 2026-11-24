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

/** Realistic wooden vertical divider pilaster with architectural molding */
const WoodCabinetDivider: React.FC<{ mood: RoomMood }> = ({ mood }) => (
  <div
    className={`relative h-full w-5 sm:w-7 shrink-0 z-20 transition-all duration-700 ${
      mood === 'evening'
        ? 'wood-pillar-night'
        : mood === 'golden'
          ? 'wood-pillar-golden'
          : 'wood-pillar-morning'
    }`}
    aria-hidden="true"
  />
);

/** Crisp 3D companion clothbound hardcover spines with contact shadows */
const ClothCompanionSpine: React.FC<{
  color: string;
  accent: string;
  heightClass: string;
  widthClass: string;
  symbol?: 'leaf' | 'star' | 'rose' | 'moon';
}> = ({ color, accent, heightClass, widthClass, symbol = 'leaf' }) => (
  <div
    className={`relative shrink-0 overflow-hidden rounded-t-[4px] rounded-b-[1px] shadow-[4px_8px_14px_rgba(18,12,6,0.46)] ${heightClass} ${widthClass}`}
    style={{
      backgroundColor: color,
      backgroundImage: `
        repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 3px),
        linear-gradient(90deg, rgba(0,0,0,0.32) 0%, rgba(255,255,255,0.2) 12%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.38) 100%)
      `,
    }}
    aria-hidden="true"
  >
    <div className="pointer-events-none absolute inset-y-0 left-[3px] w-[1px] bg-black/25" />
    <div className="pointer-events-none absolute inset-y-0 right-[3px] w-[1px] bg-black/25" />
    <div className="mx-1.5 mt-3 h-[2px] opacity-75" style={{ backgroundColor: accent }} />
    <div className="mt-4 flex justify-center opacity-70">
      <span
        className="h-2.5 w-2.5 rounded-full border"
        style={{ borderColor: accent }}
      />
    </div>
    <div className="my-4 mx-auto h-10 w-[1px] opacity-40" style={{ backgroundColor: accent }} />
    <div className="flex justify-center opacity-75">
      <span className="text-[8px]" style={{ color: accent }}>
        {symbol === 'star' ? '✦' : symbol === 'moon' ? '☾' : symbol === 'rose' ? '✿' : '❖'}
      </span>
    </div>
    <div className="absolute inset-x-1.5 bottom-3 h-[2px] opacity-75" style={{ backgroundColor: accent }} />
  </div>
);

/**
 * Interactive 3D Book on Shelf (clean, ZERO floating bookmark clutter!):
 * - Stands sharply spine-out with miniature cover art & clothbound texture.
 * - Click spine -> rotates smoothly IN PLACE ON THE SHELF into full Front Cover.
 * - Click cover -> opens BookReader.
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

  const spineWidth = isAchilles ? 52 : 56;
  const coverWidth = 142;

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
          className="group/cover relative flex h-[176px] sm:h-[192px] lg:h-[204px] w-[142px] -translate-y-2.5 text-left transition-transform duration-300 hover:scale-[1.03] focus:outline-none"
        >
          <div
            className="book-sheen relative z-10 h-full flex-1 overflow-hidden rounded-l-[3px] rounded-r-[5px] shadow-[10px_16px_28px_-4px_rgba(12,8,4,0.72)] ring-1 ring-[#F4D36A]/70"
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
                <p className="font-display text-base font-bold leading-tight">
                  {book.title}
                </p>
                <p className="font-serif text-[10px] italic opacity-85">
                  {book.author}
                </p>
              </div>
            )}

            <div className="absolute inset-x-1.5 bottom-2 z-30 flex justify-center">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#1C120D]/90 px-2.5 py-1 text-[10px] font-semibold text-[#F8E2A6] shadow-lg ring-1 ring-[#F4D36A]/50 transition group-hover/cover:bg-[#8E2C2C] group-hover/cover:text-white">
                <BookOpen className="h-3 w-3" />
                Đọc sách
              </span>
            </div>
          </div>

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
      ) : (
        <button
          type="button"
          onClick={onToggleExpand}
          style={{ width: `${spineWidth}px` }}
          className="spine-book-btn book-sheen relative overflow-visible rounded-t-[5px] rounded-b-[2px] shadow-[5px_8px_16px_rgba(14,10,6,0.52)] focus:outline-none focus:ring-2 focus:ring-[#D4A857]"
        >
          {/* Top 3D page-block thickness edge */}
          <div
            className="pointer-events-none absolute -top-[4px] left-[3px] right-[3px] h-[4px] rounded-t-[2px]"
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

  const basePercent = 16 - activeCabinet * 68;

  const bayClass =
    roomMood === 'evening'
      ? 'shelf-bay-night'
      : roomMood === 'golden'
        ? 'shelf-bay-golden'
        : 'shelf-bay-morning';

  const plankClass =
    roomMood === 'evening'
      ? 'wood-plank-night'
      : roomMood === 'golden'
        ? 'wood-plank-golden'
        : 'wood-plank-morning';

  const corniceClass =
    roomMood === 'evening'
      ? 'wood-cornice-night'
      : roomMood === 'golden'
        ? 'wood-cornice-golden'
        : 'wood-cornice-morning';

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
      {/* Architectural Molded Crown Cornice + Black Iron Ladder Rail */}
      <div
        className={`${corniceClass} relative z-30 h-5 sm:h-6 w-full shrink-0 transition-all duration-700`}
      >
        <div className="pointer-events-none absolute inset-x-0 -bottom-2 h-[4px] bg-gradient-to-b from-[#2E2D30] via-[#151518] to-[#08080A] shadow-md" />
      </div>

      {/* 3-CABINET BUILT-IN ARCHITECTURAL LIBRARY WALL */}
      <div
        className="flex flex-1 min-h-0 items-stretch"
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
          className={`relative flex h-full w-[68%] shrink-0 transition-opacity duration-500 ${
            activeCabinet === 0 ? 'opacity-100' : 'opacity-90 cursor-pointer'
          }`}
        >
          <WoodCabinetDivider mood={roomMood} />
          <div className="flex flex-1 flex-col">
            {[0, 1, 2].map((tier) => (
              <div key={tier} className="relative flex flex-1 min-h-0 flex-col justify-end">
                <div
                  className={`${bayClass} relative flex flex-1 items-end justify-center gap-1.5 sm:gap-2 px-4 sm:px-8 pb-0.5 transition-all duration-700`}
                >
                  {/* Warm recessed cabinet downlight strip in Night mode */}
                  {roomMood === 'evening' && (
                    <div className="shelf-downlight pointer-events-none absolute inset-x-6 top-0 h-28" />
                  )}
                  {tier === 0 && (
                    <>
                      <ClothCompanionSpine color="#88A89A" accent="#F5EEDB" heightClass="h-[154px] sm:h-[170px]" widthClass="w-8 sm:w-9" symbol="leaf" />
                      <ClothCompanionSpine color="#7B749E" accent="#E8DDF5" heightClass="h-[160px] sm:h-[176px]" widthClass="w-8 sm:w-9" symbol="moon" />
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
                      <ClothCompanionSpine color="#D88A94" accent="#FFF0E6" heightClass="h-[150px] sm:h-[166px]" widthClass="w-8 sm:w-9" symbol="rose" />
                    </>
                  )}
                  {tier === 1 && (
                    <>
                      <ClothCompanionSpine color="#4E6F88" accent="#E6EDF4" heightClass="h-[146px] sm:h-[160px]" widthClass="w-9" symbol="star" />
                      <ClothCompanionSpine color="#3C6B5B" accent="#F2D992" heightClass="h-[156px] sm:h-[172px]" widthClass="w-9" symbol="leaf" />
                      <ClothCompanionSpine color="#9E624A" accent="#F7E5C8" heightClass="h-[142px] sm:h-[156px]" widthClass="w-8" symbol="rose" />
                      <ClothCompanionSpine color="#544B6E" accent="#E4D6F5" heightClass="h-[150px] sm:h-[164px]" widthClass="w-9" symbol="moon" />
                    </>
                  )}
                  {tier === 2 && (
                    <>
                      <ClothCompanionSpine color="#A56958" accent="#FCEAD2" heightClass="h-[138px] sm:h-[152px]" widthClass="w-9" symbol="leaf" />
                      <ClothCompanionSpine color="#637E72" accent="#EDF5EE" heightClass="h-[146px] sm:h-[160px]" widthClass="w-9" symbol="star" />
                      <ClothCompanionSpine color="#8C7A6B" accent="#F5EDE0" heightClass="h-[134px] sm:h-[148px]" widthClass="w-8" symbol="rose" />
                    </>
                  )}
                </div>
                <div className={`${plankClass} relative z-10 h-4 sm:h-[19px] w-full shrink-0 transition-all duration-700`} />
              </div>
            ))}
          </div>
        </section>

        {/* CABINET 1 (CENTER): MAIN LIBRARY */}
        <section
          onClick={() => {
            if (activeCabinet !== 1) {
              setActiveCabinet(1);
              setExpandedBookKey(null);
            }
          }}
          className={`relative flex h-full w-[68%] shrink-0 transition-opacity duration-500 ${
            activeCabinet === 1 ? 'opacity-100' : 'opacity-90 cursor-pointer'
          }`}
        >
          <WoodCabinetDivider mood={roomMood} />
          <div className="flex flex-1 flex-col">
            {[0, 1, 2].map((tier) => {
              const tierBooks =
                tier === 0 ? books.slice(0, 6) : tier === 1 ? books.slice(6, 12) : books.slice(12);

              return (
                <div key={tier} className="relative flex flex-1 min-h-0 flex-col justify-end">
                  <div
                    className={`${bayClass} relative flex flex-1 items-end justify-center gap-1.5 sm:gap-2 px-4 sm:px-8 pb-0.5 transition-all duration-700`}
                  >
                    {roomMood === 'evening' && (
                      <div className="shelf-downlight pointer-events-none absolute inset-x-6 top-0 h-28" />
                    )}

                    {tier === 0 && (
                      <>
                        <ClothCompanionSpine color="#B5654D" accent="#FBE6C2" heightClass="h-[152px] sm:h-[168px]" widthClass="w-8 sm:w-9" symbol="leaf" />
                        <ClothCompanionSpine color="#457A6B" accent="#F2E4C8" heightClass="h-[162px] sm:h-[178px]" widthClass="w-8 sm:w-9" symbol="star" />

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

                        <ClothCompanionSpine color="#D68E9C" accent="#FFF4EC" heightClass="h-[156px] sm:h-[172px]" widthClass="w-8 sm:w-9" symbol="rose" />
                        <ClothCompanionSpine color="#7B739C" accent="#EDE4FA" heightClass="h-[148px] sm:h-[164px]" widthClass="w-8 sm:w-9" symbol="moon" />
                        <ClothCompanionSpine color="#53728F" accent="#E6EFF8" heightClass="h-[154px] sm:h-[170px]" widthClass="w-8 sm:w-9" symbol="star" />
                      </>
                    )}

                    {tier === 1 && (
                      <>
                        <ClothCompanionSpine color="#94624B" accent="#F7E3C6" heightClass="h-[148px] sm:h-[162px]" widthClass="w-8 sm:w-9" symbol="leaf" />
                        <ClothCompanionSpine color="#7C9A8E" accent="#F3F7F2" heightClass="h-[156px] sm:h-[170px]" widthClass="w-8 sm:w-9" symbol="rose" />

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
                            className={`mx-2 mb-1 flex h-[140px] w-14 flex-col items-center justify-center rounded-t-[4px] border-2 border-dashed transition ${
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

                        <ClothCompanionSpine color="#355F56" accent="#EED38B" heightClass="h-[154px] sm:h-[168px]" widthClass="w-8 sm:w-9" symbol="moon" />
                        <ClothCompanionSpine color="#B87A6D" accent="#FDEEE4" heightClass="h-[146px] sm:h-[160px]" widthClass="w-8 sm:w-9" symbol="star" />
                      </>
                    )}

                    {tier === 2 && (
                      <>
                        <ClothCompanionSpine color="#6A4248" accent="#F0D298" heightClass="h-[138px] sm:h-[152px]" widthClass="w-9" symbol="rose" />
                        <ClothCompanionSpine color="#455B73" accent="#DCE8F2" heightClass="h-[146px] sm:h-[160px]" widthClass="w-9" symbol="star" />
                        <ClothCompanionSpine color="#8A6848" accent="#F8E7C8" heightClass="h-[136px] sm:h-[150px]" widthClass="w-9" symbol="leaf" />
                        <ClothCompanionSpine color="#4E6A58" accent="#E8F0E2" heightClass="h-[142px] sm:h-[156px]" widthClass="w-9" symbol="moon" />
                        <ClothCompanionSpine color="#9E564E" accent="#FCE2C6" heightClass="h-[134px] sm:h-[148px]" widthClass="w-8" symbol="rose" />
                      </>
                    )}
                  </div>
                  <div className={`${plankClass} relative z-10 h-4 sm:h-[19px] w-full shrink-0 transition-all duration-700`} />
                </div>
              );
            })}
          </div>
        </section>

        {/* CABINET 2 (RIGHT): FINISHED BOOKS + BLACK IRON LIBRARY LADDER */}
        <section
          onClick={() => {
            if (activeCabinet !== 2) {
              setActiveCabinet(2);
              setExpandedBookKey(null);
            }
          }}
          className={`relative flex h-full w-[68%] shrink-0 transition-opacity duration-500 ${
            activeCabinet === 2 ? 'opacity-100' : 'opacity-90 cursor-pointer'
          }`}
        >
          <WoodCabinetDivider mood={roomMood} />

          <div className="relative flex flex-1 flex-col">
            {/* Wrought-Iron Rolling Library Ladder */}
            <div
              className="pointer-events-none absolute inset-y-0 right-6 sm:right-12 z-30 hidden md:flex w-28 flex-col justify-between py-2"
              aria-hidden="true"
            >
              <div className="absolute inset-y-0 left-0 w-[6px] rounded-full bg-gradient-to-r from-[#2D2D30] via-[#121215] to-[#26262A] shadow-lg" />
              <div className="absolute inset-y-0 right-0 w-[6px] rounded-full bg-gradient-to-r from-[#2D2D30] via-[#121215] to-[#26262A] shadow-lg" />
              {[0, 1, 2, 3, 4, 5, 6].map((rung) => (
                <div
                  key={rung}
                  className="h-[5px] w-full bg-gradient-to-b from-[#343438] to-[#121215] shadow-md"
                />
              ))}
            </div>

            {[0, 1, 2].map((tier) => (
              <div key={tier} className="relative flex flex-1 min-h-0 flex-col justify-end">
                <div
                  className={`${bayClass} relative flex flex-1 items-end justify-center gap-1.5 sm:gap-2 px-4 sm:px-8 pb-0.5 transition-all duration-700`}
                >
                  {roomMood === 'evening' && (
                    <div className="shelf-downlight pointer-events-none absolute inset-x-6 top-0 h-28" />
                  )}

                  {tier === 0 && (
                    <>
                      <ClothCompanionSpine color="#3B6258" accent="#EED492" heightClass="h-[154px] sm:h-[170px]" widthClass="w-8 sm:w-9" symbol="leaf" />
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
                      <ClothCompanionSpine color="#8C515C" accent="#F6DFC4" heightClass="h-[150px] sm:h-[166px]" widthClass="w-8 sm:w-9" symbol="rose" />
                      <ClothCompanionSpine color="#536884" accent="#E4EEF8" heightClass="h-[158px] sm:h-[174px]" widthClass="w-8 sm:w-9" symbol="star" />
                    </>
                  )}
                  {tier === 1 && (
                    <>
                      <ClothCompanionSpine color="#A16F52" accent="#FCE8C8" heightClass="h-[146px] sm:h-[160px]" widthClass="w-9" symbol="moon" />
                      <ClothCompanionSpine color="#5D7D6D" accent="#EEF6EC" heightClass="h-[154px] sm:h-[168px]" widthClass="w-9" symbol="leaf" />
                      <ClothCompanionSpine color="#6F5B82" accent="#EFE4FA" heightClass="h-[144px] sm:h-[158px]" widthClass="w-8" symbol="star" />
                    </>
                  )}
                  {tier === 2 && (
                    <>
                      <ClothCompanionSpine color="#7A4C48" accent="#F5DAC0" heightClass="h-[138px] sm:h-[152px]" widthClass="w-9" symbol="rose" />
                      <ClothCompanionSpine color="#405E68" accent="#DDF0F2" heightClass="h-[144px] sm:h-[158px]" widthClass="w-9" symbol="leaf" />
                    </>
                  )}
                </div>
                <div className={`${plankClass} relative z-10 h-4 sm:h-[19px] w-full shrink-0 transition-all duration-700`} />
              </div>
            ))}
          </div>

          <WoodCabinetDivider mood={roomMood} />
        </section>
      </div>
    </div>
  );
};
