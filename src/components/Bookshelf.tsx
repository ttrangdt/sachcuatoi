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
import { RoomMood } from './AmbientRoomEffects';

interface BookshelfProps {
  books: BookItem[];
  progressMap: Record<string, BookProgress>;
  viewMode: ShelfViewMode;
  hoverPreviewEnabled: boolean;
  roomMood: RoomMood;
  onOpenBook: (book: BookItem) => void;
  onHoverBook: (book: BookItem) => void;
  onLeaveBook: () => void;
  onDeleteCustomBook?: (bookId: string) => void;
  onAddBookClick?: () => void;
}

/** Trailing ivy plant draping from the top-right corner of the white bookcase */
const TrailingIvyDecor: React.FC = () => (
  <svg
    viewBox="0 0 180 220"
    className="ivy-breeze pointer-events-none absolute -top-2 -right-2 z-30 h-28 w-24 sm:h-40 sm:w-32 drop-shadow-[0_6px_8px_rgba(32,58,40,0.22)]"
    aria-hidden="true"
  >
    <g fill="none" stroke="#3E6B48" strokeWidth="2" strokeLinecap="round">
      <path d="M168 0 C150 42 142 92 128 150" />
      <path d="M155 0 C128 32 108 66 86 112" />
      <path d="M174 10 C166 64 164 118 152 192" />
    </g>
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

/** Flickering ceramic scented candle prop sitting on shelf */
const CeramicCandleProp: React.FC<{ isEvening: boolean }> = ({ isEvening }) => (
  <div
    className="pointer-events-none hidden sm:flex flex-col items-center select-none"
    aria-hidden="true"
  >
    <div
      className={`candle-flame h-3 w-1.5 rounded-full bg-gradient-to-t from-amber-500 via-amber-300 to-yellow-100 ${
        isEvening
          ? 'shadow-[0_0_24px_10px_rgba(251,191,36,0.58)]'
          : 'shadow-[0_0_12px_4px_rgba(251,191,36,0.45)]'
      }`}
    />
    <div className="h-10 w-9 rounded-t-sm rounded-b-md bg-gradient-to-r from-[#DFD8CC] via-[#F2EDE3] to-[#CFC7B9] shadow-[0_4px_8px_rgba(0,0,0,0.16)] border-t border-white/80 flex items-center justify-center">
      <div className="h-4 w-5 rounded-[2px] border border-[#B7A994]/70 bg-[#FAF7F0] flex items-center justify-center">
        <span className="text-[5px] tracking-widest text-[#7E705D] uppercase">
          calm
        </span>
      </div>
    </div>
  </div>
);

/** Warm ceramic teacup with gentle rising steam wisps */
const SteamingTeacupProp: React.FC = () => (
  <div
    className="pointer-events-none hidden md:flex flex-col items-center select-none"
    aria-hidden="true"
  >
    <div className="flex gap-1.5 -mb-0.5">
      <span
        className="steam-wisp h-4 w-1 rounded-full bg-white/70 blur-[1.5px]"
        style={{ animationDelay: '0s' }}
      />
      <span
        className="steam-wisp h-5 w-1 rounded-full bg-white/60 blur-[1.5px]"
        style={{ animationDelay: '1.1s' }}
      />
      <span
        className="steam-wisp h-3.5 w-1 rounded-full bg-white/65 blur-[1.5px]"
        style={{ animationDelay: '2.1s' }}
      />
    </div>
    <div className="relative flex items-center">
      <div className="h-7 w-9 rounded-b-xl rounded-t-xs bg-gradient-to-r from-[#D5E1D9] via-[#E9F0EB] to-[#C6D5CB] shadow-[0_4px_7px_rgba(0,0,0,0.14)] border-t border-white/90" />
      <div className="h-4 w-2.5 -ml-0.5 rounded-r-full border-2 border-l-0 border-[#C6D5CB]" />
    </div>
    <div className="h-1 w-11 rounded-full bg-[#DCE4DE] shadow-xs" />
  </div>
);

/** Small potted succulent sitting on a shelf */
const MiniPlantProp: React.FC = () => (
  <div
    className="pointer-events-none hidden sm:flex flex-col items-center select-none"
    aria-hidden="true"
  >
    <svg viewBox="0 0 64 58" className="h-12 w-14 -mb-1">
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
      <ellipse cx="32" cy="20" rx="7" ry="11" fill="#7BB283" />
      <path
        d="M16 32 H48 L44 55 C44 56.5 42 57 40 57 H24 C22 57 20 56.5 20 55 Z"
        fill="#C9A286"
      />
      <rect x="14" y="30" width="36" height="5" rx="2" fill="#D7B298" />
    </svg>
  </div>
);

/** Minimalist framed reading quote */
const MiniQuoteFrame: React.FC = () => (
  <div
    className="pointer-events-none hidden md:flex h-20 w-18 flex-col items-center justify-center rounded-[3px] border-[4px] border-[#D8C5A8] bg-[#FCFBF7] p-1.5 text-center shadow-[0_5px_10px_rgba(40,32,20,0.16)] select-none"
    aria-hidden="true"
  >
    <span className="font-display text-[10px] italic leading-tight text-[#46594E]">
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
      ? 48
      : Math.min(62, Math.max(42, Math.round(total / 26) + 36));
    return (
      <div
        className="group relative flex flex-col items-center"
        onMouseEnter={onHover}
        onMouseLeave={onLeave}
      >
        {hasBookmark && progress && (
          <div className="pointer-events-none absolute -top-4 z-20 transition-transform duration-300 group-hover:-translate-y-2.5">
            <DecorativeBookmark styleId={progress.bookmarkStyle} size="sm" />
          </div>
        )}

        <button
          type="button"
          onClick={onOpen}
          style={{ width: `${spineWidth}px` }}
          className="book-spine-card book-sheen relative h-[156px] sm:h-[172px] lg:h-[190px] xl:h-[205px] overflow-hidden rounded-t-[4px] rounded-b-[1px] shadow-[4px_6px_14px_rgba(32,26,20,0.34)] focus:outline-none focus:ring-2 focus:ring-[#4A6B5D]"
          title={`${book.title} — ${book.author}`}
        >
          {isAchilles ? (
            <AchillesSpineArt />
          ) : (
            <div
              className="relative flex h-full w-full flex-col items-center justify-between px-1 py-3"
              style={{
                backgroundColor: book.spineColor,
                color: book.spineTextColor,
              }}
            >
              <div className="pointer-events-none absolute inset-y-0 left-0 w-2 bg-gradient-to-r from-white/20 to-transparent" />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-2 bg-gradient-to-l from-black/30 to-transparent" />
              <div
                className="h-[2px] w-full opacity-75"
                style={{ backgroundColor: book.spineAccent }}
              />
              <div className="my-1.5 flex flex-1 items-center justify-center overflow-hidden">
                <span
                  className="font-display text-xs sm:text-sm font-bold tracking-wider leading-tight"
                  style={{
                    writingMode: 'vertical-rl',
                    textOrientation: 'mixed',
                  }}
                >
                  {book.title}
                </span>
              </div>
              <div
                className="h-[2px] w-full opacity-75"
                style={{ backgroundColor: book.spineAccent }}
              />
            </div>
          )}

          {progress?.isFinished && (
            <span className="absolute top-1.5 right-1 z-20 rounded-full bg-[#24664B] p-0.5 text-white shadow">
              <CheckCircle2 className="h-2.5 w-2.5" />
            </span>
          )}
        </button>
      </div>
    );
  }

  // Viewport-proportioned 3D Hardcover Book (Front cover + visible side page edge!)
  return (
    <div
      className="book-3d-wrap group relative flex flex-col items-center"
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      {hasBookmark && progress && (
        <div className="pointer-events-none absolute -top-3 right-5 z-30 transition-transform duration-300 group-hover:-translate-y-2">
          <DecorativeBookmark styleId={progress.bookmarkStyle} size="sm" />
        </div>
      )}

      {book.isCustom && onDelete && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute -top-2 -left-2 z-30 hidden h-6 w-6 items-center justify-center rounded-full bg-[#232A26] text-white shadow-md transition hover:bg-[#9E2A2B] group-hover:flex"
          title="Xóa sách đã tải lên"
          aria-label="Xóa sách"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      )}

      <button
        type="button"
        onClick={onOpen}
        className="book-3d-card relative flex h-[156px] w-[114px] sm:h-[172px] sm:w-[126px] lg:h-[190px] lg:w-[138px] xl:h-[205px] xl:w-[148px] text-left focus:outline-none focus:ring-2 focus:ring-[#4A6B5D] rounded-md"
      >
        {/* Front Hardcover Face */}
        <div
          className="book-sheen relative z-10 h-full flex-1 overflow-hidden rounded-l-[3px] rounded-r-[4px] shadow-[6px_10px_18px_-5px_rgba(32,26,18,0.44)]"
          style={{ backgroundColor: book.spineColor }}
        >
          {/* Realistic spine crease groove */}
          <div
            className="pointer-events-none absolute inset-y-0 left-0 z-20 w-2.5"
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
              className="flex h-full w-full flex-col justify-between p-3 pl-4"
              style={{ color: book.spineTextColor }}
            >
              <span className="text-[9px] uppercase tracking-[0.14em] opacity-75">
                {book.genre}
              </span>
              <div>
                <h3 className="font-display text-base font-bold leading-snug">
                  {book.title}
                </h3>
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

          {percent > 0 && (
            <div className="absolute inset-x-0 bottom-0 z-20 h-1 bg-black/35">
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
            <span className="absolute top-1.5 left-3 z-20 inline-flex items-center gap-0.5 rounded-full bg-[#1F5C45]/95 px-1.5 py-0.5 text-[9px] font-medium text-white shadow">
              <CheckCircle2 className="h-2.5 w-2.5" />
              Xong
            </span>
          )}
        </div>

        {/* Realistic Fore-Edge (Page Block Thickness on right) */}
        <div
          className="relative z-0 my-[2px] -ml-[2px] w-[11px] sm:w-[13px] shrink-0 overflow-hidden rounded-r-[2px] border-y border-r border-black/20 shadow-[3px_5px_10px_rgba(32,26,18,0.26)]"
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

      {/* Compact caption pill */}
      <div className="mt-1 flex items-center gap-1 text-[10px] font-medium text-[#4F5E54]">
        {hasBookmark ? (
          <span className="inline-flex items-center gap-0.5 rounded-full bg-[#8E2C2C]/12 px-1.5 py-0.5 text-[#8E2C2C]">
            <Bookmark className="h-2.5 w-2.5 fill-current" />
            Tr. {progress?.bookmarkedPage}
          </span>
        ) : progress?.lastReadAt ? (
          <span className="inline-flex items-center gap-0.5 text-[#5A6A5F]">
            <Clock className="h-2.5 w-2.5" />
            {formatTimeSinceLastRead(progress.lastReadAt)}
          </span>
        ) : (
          <span className="truncate max-w-[120px]">{book.title}</span>
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
  roomMood,
  onOpenBook,
  onHoverBook,
  onLeaveBook,
  onDeleteCustomBook,
  onAddBookClick,
}) => {
  const perRow = viewMode === 'spine' ? 12 : 5;
  const bookRows: BookItem[][] = [];
  for (let i = 0; i < books.length; i += perRow) {
    bookRows.push(books.slice(i, i + perRow));
  }
  const totalShelves = Math.max(3, bookRows.length);
  const isEvening = roomMood === 'evening';

  return (
    <div className="real-bookcase-frame relative mx-auto flex h-full w-full flex-col overflow-hidden rounded-t-xl rounded-b-[4px]">
      <TrailingIvyDecor />

      {/* 3 Equal Viewport-Fitted Shelf Tiers */}
      <div className="flex flex-1 min-h-0 flex-col">
        {Array.from({ length: totalShelves }).map((_, tierIdx) => {
          const rowBooks = bookRows[tierIdx] || [];
          const isFirstTier = tierIdx === 0;
          const isSecondTier = tierIdx === 1;
          const isLastTier = tierIdx === totalShelves - 1;

          return (
            <div
              key={tierIdx}
              className="relative flex flex-1 min-h-[195px] md:min-h-0 flex-col"
            >
              {/* Recessed White Shelf Compartment */}
              <div
                className={`${
                  isEvening ? 'shelf-compartment-evening' : 'shelf-compartment'
                } relative flex flex-1 items-end justify-between px-4 sm:px-8 pt-4 pb-0 transition-colors duration-700`}
              >
                <div
                  className={`relative z-10 flex flex-wrap items-end justify-center sm:justify-start w-full pb-1.5 ${
                    viewMode === 'spine'
                      ? 'gap-1.5 sm:gap-2'
                      : 'gap-4 sm:gap-7'
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

                  {isFirstTier && (
                    <div className="ml-auto flex items-end gap-4 pb-1 pr-3">
                      <SteamingTeacupProp />
                      <CeramicCandleProp isEvening={isEvening} />
                    </div>
                  )}

                  {isSecondTier && rowBooks.length === 0 && (
                    <div className="flex w-full items-end justify-between gap-4 pb-1.5">
                      <div className="flex items-end gap-4">
                        <MiniPlantProp />
                        <MiniQuoteFrame />
                      </div>

                      {onAddBookClick && (
                        <button
                          type="button"
                          onClick={onAddBookClick}
                          className="group/add flex h-32 w-28 sm:h-36 sm:w-32 flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-[#B4C4BA] bg-white/45 p-2.5 text-center text-[11px] font-medium text-[#4A6256] transition hover:border-[#4A6B5D] hover:bg-white/80 hover:scale-[1.03]"
                        >
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E1ECE5] text-[#3B5E4E] transition group-hover/add:scale-110">
                            <Plus className="h-4 w-4" />
                          </span>
                          <span>Thêm sách PDF lên kệ</span>
                        </button>
                      )}
                    </div>
                  )}

                  {isLastTier && tierIdx >= 2 && rowBooks.length === 0 && (
                    <div className="flex w-full items-end justify-between pb-1.5 text-xs text-[#738077]">
                      <span className="font-serif italic">
                        {hoverPreviewEnabled
                          ? 'Rê chuột vào gáy hoặc bìa sách để mở xem & lật trang ngay tại kệ'
                          : 'Chạm vào bìa sách để mở đọc'}
                      </span>
                      <div className="hidden sm:flex items-end gap-3">
                        <div className="h-2.5 w-28 rounded-sm bg-[#D6E1DA] shadow-xs" />
                        <div className="h-2.5 w-24 -ml-28 mb-2.5 rounded-sm bg-[#E5DDD0] shadow-xs" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Realistic White Wooden Shelf Plank Ledge */}
              <div className="white-shelf-ledge relative z-20 h-[14px] sm:h-[16px] shrink-0 w-full" />
            </div>
          );
        })}
      </div>
    </div>
  );
};
