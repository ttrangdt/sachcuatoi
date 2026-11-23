import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  List,
  Maximize2,
  Bookmark,
  X,
} from 'lucide-react';
import { BookItem, BookProgress, TocItem } from '../types/book';
import {
  extractBookToc,
  loadPdfDocument,
  renderPageToDataUrl,
} from '../utils/pdfEngine';
import { DecorativeBookmark } from './DecorativeBookmark';

interface BookHoverPreviewProps {
  book: BookItem;
  progress: BookProgress;
  onOpenFullReader: (book: BookItem, startPage?: number) => void;
  onClose: () => void;
  onMouseEnterPreview: () => void;
  onMouseLeavePreview: () => void;
}

export const BookHoverPreview: React.FC<BookHoverPreviewProps> = ({
  book,
  progress,
  onOpenFullReader,
  onClose,
  onMouseEnterPreview,
  onMouseLeavePreview,
}) => {
  const initialPage = progress.bookmarkedPage || progress.currentPage || 1;
  const [previewPage, setPreviewPage] = useState<number>(initialPage);
  const [totalPages, setTotalPages] = useState<number>(
    progress.totalPages || book.totalPages
  );
  const [leftImg, setLeftImg] = useState<string | null>(null);
  const [rightImg, setRightImg] = useState<string | null>(null);
  const [toc, setToc] = useState<TocItem[]>([]);
  const [showToc, setShowToc] = useState(false);
  const [loading, setLoading] = useState(true);
  const [flipAnim, setFlipAnim] = useState<'next' | 'prev' | null>(null);

  useEffect(() => {
    setPreviewPage(progress.bookmarkedPage || progress.currentPage || 1);
    setShowToc(false);
  }, [book.id, progress.bookmarkedPage, progress.currentPage]);

  useEffect(() => {
    let active = true;
    extractBookToc(book).then((items) => {
      if (active) setToc(items);
    });
    return () => {
      active = false;
    };
  }, [book]);

  useEffect(() => {
    let active = true;
    setLoading(true);

    (async () => {
      try {
        const doc = await loadPdfDocument(book);
        if (!active) return;
        setTotalPages(doc.numPages);

        // Spread logic: page 1 shows Cover on right; page >= 2 shows even on left, odd on right
        if (previewPage <= 1) {
          const cover = await renderPageToDataUrl(doc, 1, 380);
          if (!active) return;
          setLeftImg(null);
          setRightImg(cover);
        } else {
          const leftNum = previewPage % 2 === 0 ? previewPage : previewPage - 1;
          const rightNum = leftNum + 1 <= doc.numPages ? leftNum + 1 : null;
          const [lUrl, rUrl] = await Promise.all([
            renderPageToDataUrl(doc, leftNum, 360),
            rightNum ? renderPageToDataUrl(doc, rightNum, 360) : Promise.resolve(null),
          ]);
          if (!active) return;
          setLeftImg(lUrl);
          setRightImg(rUrl);
        }
      } catch {
        // fallback handled cleanly in UI
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [book, previewPage]);

  const handleTurn = (dir: 'next' | 'prev') => {
    setFlipAnim(dir);
    window.setTimeout(() => setFlipAnim(null), 420);
    if (dir === 'next') {
      setPreviewPage((p) => {
        if (p <= 1) return Math.min(2, totalPages);
        const left = p % 2 === 0 ? p : p - 1;
        return Math.min(totalPages, left + 2);
      });
    } else {
      setPreviewPage((p) => {
        if (p <= 2) return 1;
        const left = p % 2 === 0 ? p : p - 1;
        return Math.max(1, left - 2);
      });
    }
  };

  const leftPageNum =
    previewPage <= 1 ? null : previewPage % 2 === 0 ? previewPage : previewPage - 1;
  const rightPageNum =
    previewPage <= 1
      ? 1
      : leftPageNum && leftPageNum + 1 <= totalPages
        ? leftPageNum + 1
        : null;

  const isBookmarkedHere =
    progress.bookmarkedPage !== null &&
    (progress.bookmarkedPage === leftPageNum ||
      progress.bookmarkedPage === rightPageNum);

  return (
    <div
      className="fixed inset-x-0 bottom-4 z-40 mx-auto hidden max-w-4xl px-4 md:block"
      onMouseEnter={onMouseEnterPreview}
      onMouseLeave={onMouseLeavePreview}
    >
      <div className="relative overflow-hidden rounded-2xl border border-[#C9B393]/70 bg-[#FBF7F0]/98 shadow-[0_28px_70px_-15px_rgba(32,18,10,0.55)] backdrop-blur-md">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-[#E4D7C3] bg-[#F3EADD] px-5 py-2.5">
          <div className="flex items-center gap-3 min-w-0">
            <span
              className="h-3 w-3 shrink-0 rounded-full ring-2 ring-[#C9B393]/60"
              style={{ backgroundColor: book.spineColor }}
            />
            <div className="truncate">
              <span className="font-display text-lg font-semibold text-[#221A14]">
                {book.title}
              </span>
              <span className="mx-2 text-[#A7937E]">·</span>
              <span className="text-xs text-[#6B5B4E]">{book.author}</span>
            </div>
            {progress.bookmarkedPage && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#8E2C2C]/10 px-2.5 py-0.5 text-[11px] font-medium text-[#8E2C2C]">
                <Bookmark className="h-3 w-3 fill-current" />
                Đang đánh dấu trang {progress.bookmarkedPage}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowToc((s) => !s)}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition ${
                showToc
                  ? 'border-[#8E2C2C] bg-[#8E2C2C] text-white'
                  : 'border-[#D5C3AA] bg-white/80 text-[#3F3126] hover:bg-white'
              }`}
            >
              <List className="h-3.5 w-3.5" />
              Mục lục ({toc.length})
            </button>
            <button
              type="button"
              onClick={() => onOpenFullReader(book, previewPage)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#3A2317] px-3 py-1.5 text-xs font-medium text-[#F7F1E5] shadow-sm transition hover:bg-[#52301E]"
            >
              <Maximize2 className="h-3.5 w-3.5" />
              Đọc toàn màn hình
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-[#6B5B4E] hover:bg-[#E7DAC6] hover:text-[#221A14]"
              aria-label="Đóng xem trước"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Body: Realistic open book spread + optional TOC */}
        <div className="relative flex items-center justify-center bg-gradient-to-b from-[#EDE3D2] to-[#E2D4BE] p-5">
          {/* TOC Drawer inside preview */}
          {showToc && (
            <div className="absolute inset-y-0 left-0 z-20 w-64 overflow-y-auto border-r border-[#D8C7AE] bg-[#FAF5EC]/98 p-4 shadow-xl">
              <h4 className="mb-2.5 font-display text-base font-semibold text-[#221A14]">
                Mục lục cuốn sách
              </h4>
              <div className="space-y-1">
                {toc.map((item, idx) => (
                  <button
                    key={`${item.page}-${idx}`}
                    type="button"
                    onClick={() => {
                      setPreviewPage(item.page);
                      setShowToc(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-xs transition hover:bg-[#ECE0CE] ${
                      previewPage === item.page
                        ? 'bg-[#E9DAC3] font-semibold text-[#7C2D12]'
                        : 'text-[#433428]'
                    }`}
                    style={{ paddingLeft: `${8 + item.level * 12}px` }}
                  >
                    <span className="truncate pr-2">{item.title}</span>
                    <span className="shrink-0 font-mono text-[10px] text-[#8B7663]">
                      {item.page}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Prev page button */}
          <button
            type="button"
            disabled={previewPage <= 1}
            onClick={() => handleTurn('prev')}
            className="mr-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#CDB89C] bg-[#FBF7F0] text-[#3A2317] shadow-sm transition hover:bg-white disabled:opacity-35"
            aria-label="Lật trang trước"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {/* Open Book Spread */}
          <div className="flip-stage relative flex h-[340px] w-[560px] overflow-visible rounded-lg bg-[#3A2317] p-1.5 shadow-[0_18px_36px_-10px_rgba(24,14,8,0.55)]">
            {isBookmarkedHere && (
              <div className="pointer-events-none absolute -top-2 right-12 z-30">
                <DecorativeBookmark styleId={progress.bookmarkStyle} size="sm" />
              </div>
            )}

            {/* Left Page */}
            <div className="relative flex h-full w-1/2 flex-col justify-between overflow-hidden rounded-l bg-[#FCF9F2] p-3">
              {previewPage <= 1 ? (
                <div className="flex h-full flex-col justify-between rounded border border-dashed border-[#DFD1BC] bg-[#F8F2E7] p-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9A7D5E]">
                      {book.genre}
                    </p>
                    <h3 className="mt-2 font-display text-2xl font-bold leading-tight text-[#221A14]">
                      {book.title}
                    </h3>
                    <p className="mt-1 font-serif text-xs italic text-[#6B5B4E]">
                      {book.author}
                    </p>
                    <p className="mt-3 text-xs leading-relaxed text-[#4E3E32]">
                      {book.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-[#7A6451]">
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>{totalPages} trang · Lật trang để xem nội dung</span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex flex-1 items-center justify-center overflow-hidden">
                    {loading ? (
                      <div className="h-full w-full animate-pulse rounded bg-[#EFE7D8]" />
                    ) : leftImg ? (
                      <img
                        src={leftImg}
                        alt={`Trang ${leftPageNum}`}
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : null}
                  </div>
                  <div className="pt-1 text-center font-serif text-[10px] text-[#8B7663]">
                    {leftPageNum}
                  </div>
                </>
              )}
              <div className="book-crease-left pointer-events-none absolute inset-0" />
            </div>

            {/* Right Page */}
            <div
              className={`relative flex h-full w-1/2 flex-col justify-between overflow-hidden rounded-r bg-[#FCF9F2] p-3 ${
                flipAnim === 'next'
                  ? 'animate-flip-next'
                  : flipAnim === 'prev'
                    ? 'animate-flip-prev'
                    : ''
              }`}
            >
              <div className="flex flex-1 items-center justify-center overflow-hidden">
                {loading ? (
                  <div className="h-full w-full animate-pulse rounded bg-[#EFE7D8]" />
                ) : rightImg ? (
                  <img
                    src={rightImg}
                    alt={`Trang ${rightPageNum}`}
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <div className="text-center font-serif text-xs italic text-[#8B7663]">
                    Hết sách
                  </div>
                )}
              </div>
              <div className="pt-1 text-center font-serif text-[10px] text-[#8B7663]">
                {rightPageNum ? (rightPageNum === 1 ? 'Bìa sách' : rightPageNum) : ''}
              </div>
              <div className="book-crease-right pointer-events-none absolute inset-0" />
            </div>
          </div>

          {/* Next page button */}
          <button
            type="button"
            disabled={previewPage >= totalPages}
            onClick={() => handleTurn('next')}
            className="ml-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#CDB89C] bg-[#FBF7F0] text-[#3A2317] shadow-sm transition hover:bg-white disabled:opacity-35"
            aria-label="Lật trang sau"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Footer hint */}
        <div className="flex items-center justify-between bg-[#F3EADD] px-5 py-1.5 text-[11px] text-[#7A6451]">
          <span>
            Đang xem trang{' '}
            <strong className="text-[#221A14]">
              {rightPageNum && leftPageNum
                ? `${leftPageNum}–${rightPageNum}`
                : rightPageNum || leftPageNum || 1}
            </strong>{' '}
            / {totalPages}
          </span>
          <span>Nhấn nút mũi tên để lật từng trang ngay tại đây, hoặc mở toàn màn hình</span>
        </div>
      </div>
    </div>
  );
};
