import React, { useEffect, useState } from 'react';
import {
  Bookmark,
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
} from 'lucide-react';
import { BookItem, BookProgress, ShelfViewMode } from '../types/book';
import { getBookCoverUrl } from '../utils/pdfEngine';
import { formatTimeSinceLastRead } from '../utils/timeFormat';
import { DecorativeBookmark } from './DecorativeBookmark';
import {
  AchillesCoverArt,
  AchillesSpineArt,
  AchillesSprayedEdge,
} from './AchillesArtwork';

interface BookshelfProps {
  books: BookItem[];
  progressMap: Record<string, BookProgress>;
  viewMode: ShelfViewMode;
  hoverPreviewEnabled: boolean;
  onOpenBook: (book: BookItem) => void;
  onHoverBook: (book: BookItem) => void;
  onLeaveBook: () => void;
  onDeleteCustomBook?: (bookId: string) => void;
  onAddBookClick?: () => void;
}

/** Trailing ivy plant draping from the top-right corner of the white bookcase (like Image 1) */
const TrailingIvyDecor: React.FC = () => (
  <svg
    viewBox="0 0 180 220"
    className="ivy-breeze pointer-events-none absolute -top-2 -right-2 z-30 h-40 w-32 sm:h-52 sm:w-44 drop-shadow-[0_6px_8px_rgba(32,58,40,0.22)]"
    aria-hidden="true"
  >
    <g fill="none" stroke="#3E6B48" strokeWidth="2" strokeLinecap="round">
      <path d="M168 0 C150 42 142 92 128 150" />
      <path d="M155 0 C128 32 108 66 86 112" />
      <path d="M174 10 C166 64 164 118 152 192" />
    </g>
    {/* Leaves along stems */}
    {[
      { x: 158, y: 18, r: -25, c: '#4E8259' },
      { x: 140, y: 30, r: 35, c: '#3D6E49' },
      { x: 124, y: 52, r: -35, c: '#5B9266' },
      { x: 148, y: 58, r: 22, c: '#457850' },
      { x: 106, y: 74, r: 40, c: '#4D8357' },
      { x: 164, y: 78, r: -18, c: '#3A6944' },
      { x: 136, y: 92, r: -28, c: '#5D9568' },
      { x: 92, y: 98, r: -42, c: '#467950' },
      { x: 158, y: 112, r: 28, c: '#52875C' },
      { x: 128, y: 128, r: 32, c: '#3E6F49' },
      { x: 162, y: 148, r: -24, c: '#5B9367' },
      { x: 150, y: 176, r: 20, c: '#477B52' },
    ].map((leaf, i) => (
      <ellipse
        key={i}
        cx={leaf.x}
        cy={leaf.y}
        rx="11"
        ry="6.5"
        fill={leaf.c}
        transform={`rotate(${leaf.r} ${leaf.x} ${leaf.y})`}
      />
    ))}
  </svg>
);

/** Small ceramic scented candle prop sitting on shelf */
const CeramicCandleProp: React.FC = () => (
  <div
    className="pointer-events-none hidden sm:flex flex-col items-center select-none"
    aria-hidden="true"
  >
    <div className="h-2.5 w-1 rounded-full bg-amber-300/90 shadow-[0_0_8px_3px_rgba(251,191,36,0.45)]" />
    <div className="h-12 w-10 rounded-t-sm rounded-b-md bg-gradient-to-r from-[#DFD8CC] via-[#F2EDE3] to-[#CFC7B9] shadow-[0_4px_8px_rgba(0,0,0,0.16)] border-t border-white/80 flex items-center justify-center">
      <div className="h-5 w-6 rounded-[2px] border border-[#B7A994]/70 bg-[#FAF7F0] flex items-center justify-center">
        <span className="text-[6px] tracking-widest text-[#7E705D] uppercase">
          calm
        </span>
      </div>
    </div>
  </div>
);

/** Small potted succulent sitting on a shelf */
const MiniPlantProp: React.FC = () => (
  <div
    className="pointer-events-none hidden sm:flex flex-col items-center select-none"
    aria-hidden="true"
  >
    <svg viewBox="0 0 64 58" className="h-14 w-16 -mb-1">
      <ellipse cx="32" cy="30" rx="16" ry="9" fill="#5D9267" />
      <ellipse
        cx="22"
        cy="26"
        rx="11"
        ry="6"
        fill="#4A7D55"
        transform="rotate(-24 22 26)"
      />
      <ellipse
        cx="42"
        cy="26"
        rx="11"
        ry="6"
        fill="#6BA274"
        transform="rotate(24 42 26)"
      />
      <ellipse
        cx="32"
        cy="20"
        rx="7"
        ry="11"
        fill="#7BB283"
      />
      {/* Terracotta / sage ceramic pot */}
      <path
        d="M16 32 H48 L44 55 C44 56.5 42 57 40 57 H24 C22 57 20 56.5 20 55 Z"
        fill="#C9A286"
      />
      <rect x="14" y="30" width="36" height="5" rx="2" fill="#D7B298" />
    </svg>
  </div>
);

/** Minimalist framed reading quote sitting on lower shelf */
const MiniQuoteFrame: React.FC = () => (
  <div
    className="pointer-events-none hidden md:flex h-24 w-20 flex-col items-center justify-center rounded-[3px] border-[5px] border-[#D8C5A8] bg-[#FCFBF7] p-2 text-center shadow-[0_6px_12px_rgba(40,32,20,0.16)] select-none"
    aria-hidden="true"
  >
    <span className="font-display text-[11px] italic leading-snug text-[#46594E]">
      “Đọc một cuốn sách, sống thêm một đời.”
    </span>
  </div>
);

const ShelfBookItem: React.FC<{
  book: BookItem;
  progress?: BookProgress;
  viewMode: ShelfViewMode;
  onOpen: () => void;
  onHover: () => void;
  onLeave: () => void;
  onDelete?: () => void;
}> = ({ book, progress, viewMode, onOpen, onHover, onLeave, onDelete }) => {
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const isAchilles = book.id === 'truong-ca-achilles';

  useEffect(() => {
    if (isAchilles) return;
    let active = true;
    getBookCoverUrl(book).then((url) => {
      if (active) setCoverUrl(url);
    });
    return () => {
      active = false;
    };
  }, [book, isAchilles]);

  const total = progress?.totalPages || book.totalPages || 1;
  const current = progress?.bookmarkedPage || progress?.currentPage || 0;
  const percent = progress?.isFinished
    ? 100
    : current > 1
      ? Math.min(99, Math.round((current / total) * 100))
      : 0;
  const hasBookmark = Boolean(progress?.bookmarkedPage);

  if (viewMode === 'spine') {
    const spineWidth = isAchilles
      ? 56
      : Math.min(76, Math.max(48, Math.round(total / 22) + 42));
    return (
      <div
        className="group relative flex flex-col items-center"
        onMouseEnter={onHover}
        onMouseLeave={onLeave}
      >
        {hasBookmark && progress && (
          <div className="pointer-events-none absolute -top-5 z-20 transition-transform duration-300 group-hover:-translate-y-3">
            <DecorativeBookmark styleId={progress.bookmarkStyle} size="sm" />
          </div>
        )}

        <button
          type="button"
          onClick={onOpen}
          style={{ width: `${spineWidth}px` }}
          className="book-spine-card relative h-[228px] sm:h-[268px] overflow-hidden rounded-t-[4px] rounded-b-[1px] shadow-[4px_6px_14px_rgba(32,26,20,0.34)] focus:outline-none focus:ring-2 focus:ring-[#4A6B5D]"
          title={`${book.title} — ${book.author}`}
        >
          {isAchilles ? (
            <AchillesSpineArt />
          ) : (
            <div
              className="relative flex h-full w-full flex-col items-center justify-between px-1.5 py-4"
              style={{
                backgroundColor: book.spineColor,
                color: book.spineTextColor,
              }}
            >
              <div className="pointer-events-none absolute inset-y-0 left-0 w-2 bg-gradient-to-r from-white/20 to-transparent" />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-2.5 bg-gradient-to-l from-black/30 to-transparent" />
              <div
                className="h-[2px] w-full opacity-75"
                style={{ backgroundColor: book.spineAccent }}
              />
              <div className="my-2 flex flex-1 items-center justify-center overflow-hidden">
                <span
                  className="font-display text-sm sm:text-base font-bold tracking-wider leading-tight"
                  style={{
                    writingMode: 'vertical-rl',
                    textOrientation: 'mixed',
                  }}
                >
                  {book.title}
                </span>
              </div>
              <div className="flex flex-col items-center gap-1 w-full">
                <span
                  className="font-serif text-[9px] opacity-80 truncate max-h-20"
                  style={{
                    writingMode: 'vertical-rl',
                    textOrientation: 'mixed',
                  }}
                >
                  {book.author}
                </span>
                <div
                  className="mt-1 h-[2px] w-full opacity-75"
                  style={{ backgroundColor: book.spineAccent }}
                />
              </div>
            </div>
          )}

          {progress?.isFinished && (
            <span className="absolute top-1.5 right-1.5 z-20 rounded-full bg-[#24664B] p-0.5 text-white shadow">
              <CheckCircle2 className="h-3 w-3" />
            </span>
          )}
        </button>
      </div>
    );
  }

  // Realistic 3D Hardcover Book (Face-out + visible side page edge!)
  return (
    <div
      className="book-3d-wrap group relative flex flex-col items-center"
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      {/* Peeking decorative bookmark */}
      {hasBookmark && progress && (
        <div className="pointer-events-none absolute -top-3 right-6 z-30 transition-transform duration-300 group-hover:-translate-y-2.5">
          <DecorativeBookmark styleId={progress.bookmarkStyle} size="sm" />
        </div>
      )}

      {/* Delete button for custom uploaded PDFs */}
      {book.isCustom && onDelete && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute -top-2 -left-2 z-30 hidden h-7 w-7 items-center justify-center rounded-full bg-[#232A26] text-white shadow-md transition hover:bg-[#9E2A2B] group-hover:flex"
          title="Xóa sách đã tải lên"
          aria-label="Xóa sách"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}

      <button
        type="button"
        onClick={onOpen}
        className="book-3d-card relative flex h-[232px] sm:h-[272px] w-[166px] sm:w-[196px] text-left focus:outline-none focus:ring-2 focus:ring-[#4A6B5D] rounded-md"
      >
        {/* Front Hardcover Face */}
        <div
          className="relative z-10 h-full flex-1 overflow-hidden rounded-l-[3px] rounded-r-[4px] shadow-[8px_12px_20px_-6px_rgba(32,26,18,0.42)]"
          style={{ backgroundColor: book.spineColor }}
        >
          {/* Realistic spine crease groove near left edge */}
          <div
            className="pointer-events-none absolute inset-y-0 left-0 z-20 w-3"
            style={{
              background:
                'linear-gradient(90deg, rgba(255,255,255,0.22) 0%, rgba(0,0,0,0.06) 45%, rgba(0,0,0,0.24) 80%, rgba(255,255,255,0.12) 100%)',
            }}
          />

          {isAchilles ? (
            <AchillesCoverArt />
          ) : coverUrl ? (
            <img
              src={coverUrl}
              alt={book.title}
              className="h-full w-full object-cover object-top"
              loading="lazy"
            />
          ) : (
            <div
              className="flex h-full w-full flex-col justify-between p-4 pl-5"
              style={{ color: book.spineTextColor }}
            >
              <span className="text-[10px] uppercase tracking-[0.16em] opacity-75">
                {book.genre}
              </span>
              <div>
                <h3 className="font-display text-xl font-bold leading-snug">
                  {book.title}
                </h3>
                <p className="mt-1 font-serif text-xs italic opacity-85">
                  {book.author}
                </p>
              </div>
              <div
                className="h-0.5 w-10"
                style={{ backgroundColor: book.spineAccent }}
              />
            </div>
          )}

          {/* Subtle progress ribbon at bottom edge when reading */}
          {percent > 0 && (
            <div className="absolute inset-x-0 bottom-0 z-20 h-1.5 bg-black/35">
              <div
                className="h-full transition-all"
                style={{
                  width: `${percent}%`,
                  backgroundColor: progress?.isFinished ? '#6EE7B7' : '#F4D36A',
                }}
              />
            </div>
          )}

          {progress?.isFinished && (
            <span className="absolute top-2 left-4 z-20 inline-flex items-center gap-1 rounded-full bg-[#1F5C45]/95 px-2 py-0.5 text-[10px] font-medium text-white shadow">
              <CheckCircle2 className="h-3 w-3" />
              Đã đọc xong
            </span>
          )}
        </div>

        {/* Realistic Fore-Edge (Page Block Thickness on the right!) */}
        <div
          className="relative z-0 my-[3px] -ml-[2px] w-[14px] sm:w-[16px] shrink-0 overflow-hidden rounded-r-[2px] border-y border-r border-black/20 shadow-[4px_6px_12px_rgba(32,26,18,0.28)]"
          title={
            isAchilles
              ? 'Cạnh trang sơn xanh ngọc họa tiết Hy Lạp'
              : 'Cạnh trang sách'
          }
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

      {/* Subtle floating caption tag on hover / bookmark indicator */}
      <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-medium text-[#526056]">
        {hasBookmark ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#8E2C2C]/10 px-2 py-0.5 text-[#8E2C2C]">
            <Bookmark className="h-3 w-3 fill-current" />
            Trang {progress?.bookmarkedPage}
          </span>
        ) : progress?.lastReadAt ? (
          <span className="inline-flex items-center gap-1 text-[#5E6E63]">
            <Clock className="h-3 w-3" />
            {formatTimeSinceLastRead(progress.lastReadAt)}
          </span>
        ) : (
          <span className="truncate max-w-[160px] text-[#5B695F]">
            {book.title}
          </span>
        )}
      </div>
    </div>
  );
};

export const Bookshelf: React.FC<BookshelfProps> = ({
  books,
  progressMap,
  viewMode,
  hoverPreviewEnabled,
  onOpenBook,
  onHoverBook,
  onLeaveBook,
  onDeleteCustomBook,
  onAddBookClick,
}) => {
  // Always display at least 3 realistic shelf tiers so the bookcase feels like a full standing home bookcase
  const perRow = viewMode === 'spine' ? 10 : 4;
  const bookRows: BookItem[][] = [];
  for (let i = 0; i < books.length; i += perRow) {
    bookRows.push(books.slice(i, i + perRow));
  }
  const totalShelves = Math.max(3, bookRows.length);

  return (
    <div className="real-bookcase-frame relative mx-auto w-full overflow-hidden rounded-t-xl rounded-b-md">
      {/* Trailing Green Ivy draping over top-right corner like Reference Image 1 */}
      <TrailingIvyDecor />

      {/* Shelf Tiers */}
      <div className="flex flex-col">
        {Array.from({ length: totalShelves }).map((_, tierIdx) => {
          const rowBooks = bookRows[tierIdx] || [];
          const isFirstTier = tierIdx === 0;
          const isSecondTier = tierIdx === 1;
          const isLastTier = tierIdx === totalShelves - 1;

          return (
            <div key={tierIdx} className="relative flex flex-col">
              {/* Recessed White Shelf Interior */}
              <div className="shelf-compartment relative flex min-h-[268px] sm:min-h-[310px] items-end justify-between px-4 sm:px-9 pt-8 pb-0">
                {/* Books + Cozy Shelf Props standing flush on shelf surface */}
                <div
                  className={`relative z-10 flex flex-wrap items-end justify-center sm:justify-start w-full pb-2 ${
                    viewMode === 'spine'
                      ? 'gap-1.5 sm:gap-2'
                      : 'gap-5 sm:gap-8'
                  }`}
                >
                  {rowBooks.map((book) => (
                    <ShelfBookItem
                      key={book.id}
                      book={book}
                      progress={progressMap[book.id]}
                      viewMode={viewMode}
                      onOpen={() => onOpenBook(book)}
                      onHover={() => {
                        if (hoverPreviewEnabled) onHoverBook(book);
                      }}
                      onLeave={onLeaveBook}
                      onDelete={
                        book.isCustom && onDeleteCustomBook
                          ? () => onDeleteCustomBook(book.id)
                          : undefined
                      }
                    />
                  ))}

                  {/* Cozy Reading Room Shelf Accents so every shelf feels lived-in & real */}
                  {isFirstTier && (
                    <div className="ml-auto flex items-end gap-4 pb-1 pr-2">
                      <CeramicCandleProp />
                    </div>
                  )}

                  {isSecondTier && rowBooks.length === 0 && (
                    <div className="flex w-full items-end justify-between gap-4 pb-2">
                      <div className="flex items-end gap-5">
                        <MiniPlantProp />
                        <MiniQuoteFrame />
                      </div>

                      {onAddBookClick && (
                        <button
                          type="button"
                          onClick={onAddBookClick}
                          className="group/add flex h-44 w-32 flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[#B7C6BC] bg-white/45 p-3 text-center text-xs font-medium text-[#52695C] transition hover:border-[#4A6B5D] hover:bg-white/80"
                        >
                          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E3EDE7] text-[#3F6353] transition group-hover/add:scale-110">
                            <Plus className="h-4 w-4" />
                          </span>
                          <span>Đặt thêm sách PDF lên kệ</span>
                        </button>
                      )}
                    </div>
                  )}

                  {isLastTier && tierIdx >= 2 && rowBooks.length === 0 && (
                    <div className="flex w-full items-end justify-between pb-2 text-xs text-[#7D8980]">
                      <span className="font-serif italic">
                        {hoverPreviewEnabled
                          ? 'Rê chuột vào gáy hoặc bìa sách để mở xem & lật trang ngay tại kệ'
                          : 'Chạm vào bìa sách để mở đọc'}
                      </span>
                      <div className="hidden sm:flex items-end gap-3">
                        <div className="h-3 w-28 rounded-sm bg-[#D8E2DC] shadow-sm" />
                        <div className="h-3 w-24 -ml-28 mb-3 rounded-sm bg-[#E5DDD0] shadow-sm" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Realistic White Wooden Shelf Plank Ledge */}
              <div className="white-shelf-ledge relative z-20 h-[18px] sm:h-[20px] w-full" />
            </div>
          );
        })}
      </div>
    </div>
  );
};
