import React, { useEffect, useState } from 'react';
import {
  Bookmark,
  BookOpen,
  CheckCircle2,
  Clock,
  Sparkles,
  X,
} from 'lucide-react';
import { BookItem, BookProgress } from '../types/book';
import { getBookCoverUrl } from '../utils/pdfEngine';
import { formatTimeSinceLastRead } from '../utils/timeFormat';
import { AchillesCoverArt, AchillesSprayedEdge } from './AchillesArtwork';
import { DecorativeBookmark } from './DecorativeBookmark';

interface BookCoverModalProps {
  book: BookItem;
  progress: BookProgress;
  onStartReading: (book: BookItem, startPage?: number) => void;
  onClose: () => void;
}

export const BookCoverModal: React.FC<BookCoverModalProps> = ({
  book,
  progress,
  onStartReading,
  onClose,
}) => {
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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const resumePage = progress.bookmarkedPage || progress.currentPage || 1;
  const hasStarted = resumePage > 1 || Boolean(progress.lastReadAt);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="animate-cover-reveal relative flex w-full max-w-2xl flex-col sm:flex-row items-center gap-6 sm:gap-8 rounded-3xl border border-[#DFC9A4]/45 bg-gradient-to-br from-[#FBF7F0] via-[#F6EFE4] to-[#EDE2D2] p-6 sm:p-8 text-[#241B15] shadow-[0_32px_80px_-12px_rgba(12,6,2,0.72)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full p-2 text-[#6B5A4C] transition hover:bg-black/8 hover:text-[#241B15]"
          aria-label="Đóng"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Interactive 3D Hardcover Book Front + Fore-edge */}
        <div
          onClick={() => onStartReading(book, resumePage)}
          className="group relative shrink-0 cursor-pointer"
          title="Nhấn vào bìa sách để mở đọc"
        >
          {/* Peeking sparkling bookmark */}
          {progress.bookmarkedPage && (
            <div className="pointer-events-none absolute -top-5 right-6 z-30">
              <DecorativeBookmark styleId={progress.bookmarkStyle} size="md" />
            </div>
          )}

          <div className="relative flex h-[286px] w-[206px] sm:h-[320px] sm:w-[230px] transition-transform duration-500 group-hover:scale-[1.03] group-hover:-rotate-1">
            {/* Front Cover */}
            <div
              className="relative z-10 h-full flex-1 overflow-hidden rounded-l-[4px] rounded-r-md shadow-[12px_18px_32px_-8px_rgba(24,14,8,0.55)]"
              style={{ backgroundColor: book.spineColor }}
            >
              <div
                className="pointer-events-none absolute inset-y-0 left-0 z-20 w-3.5"
                style={{
                  background:
                    'linear-gradient(90deg, rgba(255,255,255,0.24) 0%, rgba(0,0,0,0.08) 45%, rgba(0,0,0,0.28) 85%, rgba(255,255,255,0.12) 100%)',
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
                  className="flex h-full flex-col justify-between p-5 pl-6"
                  style={{ color: book.spineTextColor }}
                >
                  <span className="text-[10px] uppercase tracking-[0.18em] opacity-75">
                    {book.genre}
                  </span>
                  <div>
                    <h3 className="font-display text-2xl font-bold leading-snug">
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
            </div>

            {/* Side Fore-edge thickness */}
            <div className="relative z-0 my-[3px] -ml-[2px] w-[18px] shrink-0 overflow-hidden rounded-r-[3px] border-y border-r border-black/20 shadow-[6px_10px_18px_rgba(24,14,8,0.32)]">
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
          </div>
        </div>

        {/* Book Details & Open Actions */}
        <div className="flex flex-1 flex-col justify-between text-center sm:text-left">
          <div>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="rounded-full bg-[#3A2317]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#5C3A24]">
                {book.genre}
              </span>
              {progress.isFinished && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#1F5C45]/15 px-2.5 py-0.5 text-[11px] font-semibold text-[#1F5C45]">
                  <CheckCircle2 className="h-3 w-3" />
                  Đã đọc xong
                </span>
              )}
            </div>

            <h2 className="mt-2.5 font-display text-3xl sm:text-4xl font-bold leading-tight text-[#221A14]">
              {book.title}
            </h2>
            <p className="mt-1 font-serif text-sm italic text-[#6B5B4E]">
              {book.author}
            </p>

            <p className="mt-3 text-xs sm:text-sm leading-relaxed text-[#4E3E32]">
              {book.description}
            </p>

            {/* Status Meta */}
            <div className="mt-4 flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-[#6E5C4E]">
              {progress.bookmarkedPage && (
                <span className="inline-flex items-center gap-1 rounded-lg bg-[#8E2C2C]/10 px-2.5 py-1 font-medium text-[#8E2C2C]">
                  <Bookmark className="h-3.5 w-3.5 fill-current" />
                  Đang đánh dấu trang {progress.bookmarkedPage}
                </span>
              )}
              {progress.lastReadAt && (
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  Đọc gần nhất: {formatTimeSinceLastRead(progress.lastReadAt)}
                </span>
              )}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
            <button
              type="button"
              onClick={() => onStartReading(book, resumePage)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#3A2317] px-5 py-2.5 text-xs sm:text-sm font-semibold text-[#F8F2E7] shadow-md transition hover:bg-[#52301E] hover:scale-[1.02]"
            >
              <BookOpen className="h-4 w-4" />
              <span>
                {hasStarted && resumePage > 1
                  ? `Đọc tiếp từ trang ${resumePage}`
                  : 'Mở sách đọc ngay'}
              </span>
            </button>

            {hasStarted && resumePage > 1 && (
              <button
                type="button"
                onClick={() => onStartReading(book, 1)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#D4C1A8] bg-white/80 px-3.5 py-2.5 text-xs font-medium text-[#4A382B] transition hover:bg-white"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Đọc từ đầu
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
