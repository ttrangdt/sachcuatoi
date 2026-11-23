import React, { useEffect, useState } from 'react';
import {
  Bookmark,
  CheckCircle2,
  Clock,
  BookOpen,
  Trash2,
} from 'lucide-react';
import { BookItem, BookProgress, ShelfViewMode } from '../types/book';
import { getBookCoverUrl } from '../utils/pdfEngine';
import { formatTimeSinceLastRead } from '../utils/timeFormat';
import { DecorativeBookmark } from './DecorativeBookmark';

interface BookshelfProps {
  books: BookItem[];
  progressMap: Record<string, BookProgress>;
  viewMode: ShelfViewMode;
  hoverPreviewEnabled: boolean;
  onOpenBook: (book: BookItem) => void;
  onHoverBook: (book: BookItem) => void;
  onLeaveBook: () => void;
  onDeleteCustomBook?: (bookId: string) => void;
}

const BookCoverCard: React.FC<{
  book: BookItem;
  progress?: BookProgress;
  viewMode: ShelfViewMode;
  onOpen: () => void;
  onHover: () => void;
  onLeave: () => void;
  onDelete?: () => void;
}> = ({ book, progress, viewMode, onOpen, onHover, onLeave, onDelete }) => {
  const [coverUrl, setCoverUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getBookCoverUrl(book).then((url) => {
      if (active) setCoverUrl(url);
    });
    return () => {
      active = false;
    };
  }, [book]);

  const total = progress?.totalPages || book.totalPages || 1;
  const current = progress?.bookmarkedPage || progress?.currentPage || 0;
  const percent = progress?.isFinished
    ? 100
    : current > 1
      ? Math.min(99, Math.round((current / total) * 100))
      : 0;
  const hasBookmark = Boolean(progress?.bookmarkedPage);

  if (viewMode === 'spine') {
    const spineWidth = Math.min(82, Math.max(54, Math.round(total / 16) + 46));
    return (
      <div
        className="group relative flex flex-col items-center"
        onMouseEnter={onHover}
        onMouseLeave={onLeave}
      >
        {/* Peeking decorative bookmark on top of spine */}
        {hasBookmark && progress && (
          <div className="pointer-events-none absolute -top-5 z-20 transition-transform duration-300 group-hover:-translate-y-3">
            <DecorativeBookmark styleId={progress.bookmarkStyle} size="sm" />
          </div>
        )}

        <button
          type="button"
          onClick={onOpen}
          style={{
            width: `${spineWidth}px`,
            backgroundColor: book.spineColor,
            color: book.spineTextColor,
          }}
          className="book-spine-card relative flex h-64 sm:h-72 flex-col items-center justify-between overflow-hidden rounded-t-md rounded-b-[2px] border-x border-t border-white/15 px-1.5 py-4 shadow-[4px_8px_18px_rgba(0,0,0,0.55)] focus:outline-none focus:ring-2 focus:ring-[#D4A857]"
          title={`${book.title} — ${book.author}`}
        >
          {/* Leather spine sheen & gold bands */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-2 bg-gradient-to-r from-white/20 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-2.5 bg-gradient-to-l from-black/35 to-transparent" />
          <div
            className="h-[2px] w-full opacity-70"
            style={{ backgroundColor: book.spineAccent }}
          />

          {/* Vertical title */}
          <div className="my-2 flex flex-1 items-center justify-center overflow-hidden">
            <span
              className="font-display text-base sm:text-lg font-semibold tracking-wide leading-tight"
              style={{
                writingMode: 'vertical-rl',
                textOrientation: 'mixed',
              }}
            >
              {book.title}
            </span>
          </div>

          <div className="flex flex-col items-center gap-1.5 w-full">
            <div
              className="h-[2px] w-full opacity-70"
              style={{ backgroundColor: book.spineAccent }}
            />
            {progress?.isFinished ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-[#E8C872]" />
            ) : percent > 0 ? (
              <span className="text-[10px] font-medium opacity-85">{percent}%</span>
            ) : (
              <span className="text-[9px] uppercase tracking-widest opacity-60">
                PDF
              </span>
            )}
          </div>
        </button>
      </div>
    );
  }

  return (
    <div
      className="book-3d-wrap group relative flex flex-col items-center w-[152px] sm:w-[178px]"
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      {/* Peeking bookmark ribbon */}
      {hasBookmark && progress && (
        <div className="pointer-events-none absolute -top-3 right-4 z-20 transition-transform duration-300 group-hover:-translate-y-2.5">
          <DecorativeBookmark styleId={progress.bookmarkStyle} size="sm" />
        </div>
      )}

      {/* Optional delete for user-uploaded books */}
      {book.isCustom && onDelete && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute -top-2 -left-2 z-30 hidden h-7 w-7 items-center justify-center rounded-full bg-[#3A2317] text-[#F5EAD6] shadow-md transition hover:bg-[#8E2C2C] group-hover:flex"
          title="Xóa sách đã tải lên"
          aria-label="Xóa sách"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}

      <button
        type="button"
        onClick={onOpen}
        className="book-3d-card relative h-[222px] sm:h-[258px] w-full overflow-hidden rounded-r-lg rounded-l-[3px] text-left shadow-[10px_14px_24px_-6px_rgba(12,6,2,0.72)] focus:outline-none focus:ring-2 focus:ring-[#D4A857]"
        style={{ backgroundColor: book.spineColor }}
      >
        {/* Left book spine edge */}
        <div
          className="absolute inset-y-0 left-0 z-10 w-3.5 border-r border-black/25"
          style={{
            background: `linear-gradient(90deg, rgba(255,255,255,0.22) 0%, rgba(0,0,0,0.08) 40%, rgba(0,0,0,0.35) 100%)`,
          }}
        />

        {/* Real PDF Cover or artistic typographic fallback */}
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={book.title}
            className="h-full w-full object-cover object-top"
            loading="lazy"
          />
        ) : (
          <div
            className="flex h-full w-full flex-col justify-between p-4 pl-6"
            style={{ color: book.spineTextColor }}
          >
            <div className="text-[10px] uppercase tracking-[0.18em] opacity-75">
              {book.genre}
            </div>
            <div>
              <h3 className="font-display text-xl font-bold leading-snug">
                {book.title}
              </h3>
              <p className="mt-1 font-serif text-xs italic opacity-80">
                {book.author}
              </p>
            </div>
            <div
              className="h-0.5 w-10"
              style={{ backgroundColor: book.spineAccent }}
            />
          </div>
        )}

        {/* Bottom title & status overlay for instant readability */}
        <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/88 via-black/55 to-transparent px-3 pb-2.5 pt-8 pl-5">
          <p className="line-clamp-2 font-display text-base font-semibold leading-tight text-[#FBF6EC] drop-shadow">
            {book.title}
          </p>
          <p className="mt-0.5 truncate text-[11px] text-[#E5D5BE]/90">
            {book.author}
          </p>

          {/* Progress bar */}
          {percent > 0 && (
            <div className="mt-2">
              <div className="h-1 w-full overflow-hidden rounded-full bg-white/25">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${percent}%`,
                    backgroundColor: progress?.isFinished ? '#86EFAC' : '#E5B968',
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Status badge top-left */}
        {progress?.isFinished && (
          <span className="absolute top-2 left-4 z-20 inline-flex items-center gap-1 rounded-full bg-[#1F4E3D]/95 px-2 py-0.5 text-[10px] font-medium text-[#E7F8EE] shadow">
            <CheckCircle2 className="h-3 w-3" />
            Đã đọc xong
          </span>
        )}
      </button>

      {/* Subtle brass nameplate under book on the wooden shelf lip */}
      <div className="mt-2 flex items-center gap-1.5 text-[11px] text-[#E6D5BE]/90">
        {hasBookmark ? (
          <span className="inline-flex items-center gap-1 text-[#F4D08A]">
            <Bookmark className="h-3 w-3 fill-current" />
            Trang {progress?.bookmarkedPage}
          </span>
        ) : progress?.lastReadAt ? (
          <span className="inline-flex items-center gap-1 text-[#D8C4AA]">
            <Clock className="h-3 w-3" />
            {formatTimeSinceLastRead(progress.lastReadAt)}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[#CBB497]">
            <BookOpen className="h-3 w-3" />
            {total} trang
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
}) => {
  if (books.length === 0) {
    return (
      <div className="rounded-2xl border border-[#DFD2BE] bg-[#FBF7F0] px-6 py-16 text-center shadow-sm">
        <BookOpen className="mx-auto h-10 w-10 text-[#A88D6D]" />
        <h3 className="mt-4 font-display text-2xl font-semibold text-[#221A14]">
          Ngăn sách này đang trống
        </h3>
        <p className="mt-1.5 text-sm text-[#6B5B4E]">
          Hãy thử tìm từ khóa khác hoặc thêm một cuốn sách PDF mới vào tủ của bạn.
        </p>
      </div>
    );
  }

  // Group books into shelf rows (4 per row in cover view, 8 in spine view)
  const perRow = viewMode === 'spine' ? 8 : 4;
  const rows: BookItem[][] = [];
  for (let i = 0; i < books.length; i += perRow) {
    rows.push(books.slice(i, i + perRow));
  }

  return (
    <div className="shelf-cabinet overflow-hidden rounded-2xl border-4 border-[#4A2D1C]">
      {/* Top cabinet cornice */}
      <div className="flex items-center justify-between border-b border-black/35 bg-[#462A1A] px-5 py-2.5 text-xs text-[#DFCBB0]">
        <span className="font-serif italic">
          {hoverPreviewEnabled
            ? 'Rê chuột vào gáy hoặc bìa sách để xem nội dung & lật trang ngay · Nhấn để đọc toàn màn hình'
            : 'Nhấn vào bất kỳ cuốn sách nào trên kệ để mở đọc'}
        </span>
        <span className="hidden sm:inline text-[#C9AE8B]">
          {books.length} cuốn trên kệ
        </span>
      </div>

      {/* Shelf Rows */}
      <div className="divide-y divide-black/30">
        {rows.map((row, rowIdx) => (
          <div key={rowIdx} className="relative pt-8 sm:pt-10">
            {/* Ambient warm shelf spotlight */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#F5C98B]/10 to-transparent" />

            {/* Books standing on shelf */}
            <div
              className={`relative z-10 flex flex-wrap items-end justify-center sm:justify-start px-5 sm:px-10 pb-3 ${
                viewMode === 'spine' ? 'gap-2.5 sm:gap-3' : 'gap-6 sm:gap-9'
              }`}
            >
              {row.map((book) => (
                <BookCoverCard
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
            </div>

            {/* Realistic Wooden Shelf Plank */}
            <div className="relative">
              <div className="shelf-plank-top h-2.5 w-full" />
              <div className="shelf-plank h-5 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
