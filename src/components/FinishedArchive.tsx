import React, { useEffect, useState } from 'react';
import {
  Award,
  BookOpen,
  Calendar,
  Clock,
  History,
  RotateCcw,
} from 'lucide-react';
import { BookItem, BookProgress } from '../types/book';
import { getBookCoverUrl } from '../utils/pdfEngine';
import {
  formatReadingDuration,
  formatShortDate,
  formatTimeSinceLastRead,
} from '../utils/timeFormat';

interface FinishedArchiveProps {
  books: BookItem[];
  progressMap: Record<string, BookProgress>;
  onReadAgain: (book: BookItem) => void;
  onUnmarkFinished: (bookId: string) => void;
}

const FinishedBookCard: React.FC<{
  book: BookItem;
  progress: BookProgress;
  now: number;
  onReadAgain: () => void;
  onUnmark: () => void;
}> = ({ book, progress, now, onReadAgain, onUnmark }) => {
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

  const durationText = formatReadingDuration(
    progress.firstOpenedAt,
    progress.finishedAt
  );
  const lastReadText = formatTimeSinceLastRead(progress.lastReadAt, now);

  return (
    <article className="flex flex-col sm:flex-row gap-5 rounded-2xl border border-[#DFD2BE] bg-[#FCF8F1] p-5 shadow-sm transition hover:shadow-md">
      {/* Book miniature cover */}
      <div
        onClick={onReadAgain}
        className="relative h-44 w-32 shrink-0 cursor-pointer overflow-hidden rounded-r-lg rounded-l-[3px] shadow-md self-center sm:self-start"
        style={{ backgroundColor: book.spineColor }}
      >
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={book.title}
            className="h-full w-full object-cover object-top"
          />
        ) : (
          <div
            className="flex h-full flex-col justify-between p-3"
            style={{ color: book.spineTextColor }}
          >
            <span className="font-display text-base font-bold leading-snug">
              {book.title}
            </span>
            <span className="text-[10px] opacity-80">{book.author}</span>
          </div>
        )}
        <div className="absolute top-2 right-2 rounded-full bg-[#1F4E3D] p-1 text-[#E7F8EE] shadow">
          <Award className="h-3.5 w-3.5" />
        </div>
      </div>

      {/* Reading completion details */}
      <div className="flex flex-1 flex-col justify-between min-w-0">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#1F4E3D]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#1F4E3D]">
              Đã đọc xong
            </span>
            <span className="text-xs text-[#8A755F]">{book.genre}</span>
          </div>

          <h3 className="mt-2 font-display text-2xl font-bold text-[#221A14]">
            {book.title}
          </h3>
          <p className="font-serif text-sm italic text-[#6B5B4E]">
            {book.author}
          </p>

          {/* Metrics Grid */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="rounded-xl border border-[#E7DAC6] bg-[#F6EFE2] px-3.5 py-2.5">
              <div className="flex items-center gap-1.5 text-[11px] text-[#7A6451]">
                <Clock className="h-3.5 w-3.5 text-[#9E5B24]" />
                <span>Thời gian đọc xong</span>
              </div>
              <p className="mt-1 font-display text-xl font-bold text-[#221A14]">
                {durationText}
              </p>
            </div>

            <div className="rounded-xl border border-[#E7DAC6] bg-[#F6EFE2] px-3.5 py-2.5">
              <div className="flex items-center gap-1.5 text-[11px] text-[#7A6451]">
                <History className="h-3.5 w-3.5 text-[#8E2C2C]" />
                <span>Lần cuối đọc</span>
              </div>
              <p className="mt-1 font-display text-xl font-bold text-[#221A14]">
                {lastReadText}
              </p>
            </div>

            <div className="rounded-xl border border-[#E7DAC6] bg-[#F6EFE2] px-3.5 py-2.5">
              <div className="flex items-center gap-1.5 text-[11px] text-[#7A6451]">
                <Calendar className="h-3.5 w-3.5 text-[#2B5B4A]" />
                <span>Ngày hoàn thành</span>
              </div>
              <p className="mt-1 font-display text-xl font-bold text-[#221A14]">
                {formatShortDate(progress.finishedAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex flex-wrap items-center gap-2.5 pt-2">
          <button
            type="button"
            onClick={onReadAgain}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#3A2317] px-3.5 py-2 text-xs font-medium text-[#F7F1E5] transition hover:bg-[#52301E]"
          >
            <BookOpen className="h-3.5 w-3.5" />
            Đọc lại cuốn này
          </button>
          <button
            type="button"
            onClick={onUnmark}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#D7C6AE] bg-white px-3 py-2 text-xs font-medium text-[#5A483A] transition hover:bg-[#F3EADD]"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Chuyển lại đang đọc
          </button>
        </div>
      </div>
    </article>
  );
};

export const FinishedArchive: React.FC<FinishedArchiveProps> = ({
  books,
  progressMap,
  onReadAgain,
  onUnmarkFinished,
}) => {
  const [now, setNow] = useState<number>(() => Date.now());

  // Refresh relative "last read" text every minute
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  if (books.length === 0) {
    return (
      <div className="rounded-2xl border border-[#DFD2BE] bg-[#FCF8F1] px-6 py-16 text-center shadow-sm">
        <Award className="mx-auto h-11 w-11 text-[#B08D5B]" />
        <h3 className="mt-4 font-display text-2xl font-bold text-[#221A14]">
          Chưa có cuốn sách nào hoàn thành
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-[#6B5B4E]">
          Khi bạn đọc đến trang cuối cùng hoặc nhấn nút{' '}
          <strong>“Hoàn thành”</strong> trong trình đọc, cuốn sách sẽ được lưu
          trữ tại đây kèm thời gian hoàn thành và lần đọc gần nhất.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#E2D4BF] bg-[#F3EADD] px-5 py-3">
        <div className="flex items-center gap-2.5">
          <Award className="h-5 w-5 text-[#1F4E3D]" />
          <span className="font-display text-lg font-semibold text-[#221A14]">
            Kho lưu trữ sách đã đọc xong ({books.length} cuốn)
          </span>
        </div>
        <span className="text-xs text-[#6B5B4E]">
          Thời gian đọc tính từ lúc mở đầu tiên tới khi hoàn thành (theo ngày
          hoặc giờ)
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {books.map((book) => {
          const progress = progressMap[book.id];
          if (!progress) return null;
          return (
            <FinishedBookCard
              key={book.id}
              book={book}
              progress={progress}
              now={now}
              onReadAgain={() => onReadAgain(book)}
              onUnmark={() => onUnmarkFinished(book.id)}
            />
          );
        })}
      </div>
    </div>
  );
};
