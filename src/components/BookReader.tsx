import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import {
  ArrowLeft,
  Bookmark,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  List,
  Sparkles,
  Sun,
  Moon,
  Trash2,
  X,
  BookOpen,
} from 'lucide-react';
import {
  BookItem,
  BookProgress,
  BookmarkStyleId,
  PaperTheme,
  TocItem,
} from '../types/book';
import {
  extractBookToc,
  loadPdfDocument,
  renderPageToDataUrl,
} from '../utils/pdfEngine';
import {
  BOOKMARK_STYLES,
  DecorativeBookmark,
} from './DecorativeBookmark';
import { AchillesCoverArt } from './AchillesArtwork';
import { formatReadingDuration } from '../utils/timeFormat';

interface BookReaderProps {
  book: BookItem;
  progress: BookProgress;
  paperTheme: PaperTheme;
  onChangePaperTheme: (theme: PaperTheme) => void;
  onUpdateProgress: (updater: (prev: BookProgress) => BookProgress) => void;
  onClose: () => void;
  initialPage?: number;
}

const THEME_STYLES: Record<
  PaperTheme,
  {
    label: string;
    backdrop: string;
    pageBg: string;
    imgFilter: string;
    text: string;
  }
> = {
  cream: {
    label: 'Kem ấm',
    backdrop: 'bg-[#251A13]',
    pageBg: 'bg-[#FCF8EE]',
    imgFilter: 'sepia-[.12] contrast-[1.02]',
    text: 'text-[#6B5A48]',
  },
  white: {
    label: 'Trắng sáng',
    backdrop: 'bg-[#1F1F22]',
    pageBg: 'bg-white',
    imgFilter: '',
    text: 'text-[#64646A]',
  },
  sepia: {
    label: 'Giấy cổ',
    backdrop: 'bg-[#2C1E14]',
    pageBg: 'bg-[#F3E5CA]',
    imgFilter: 'sepia-[.35] contrast-[0.98]',
    text: 'text-[#6B5237]',
  },
  night: {
    label: 'Đèn đêm',
    backdrop: 'bg-[#111010]',
    pageBg: 'bg-[#1D1B1A]',
    imgFilter: 'invert-[.88] hue-rotate-180 contrast-[0.95]',
    text: 'text-[#A89B8C]',
  },
};

export const BookReader: React.FC<BookReaderProps> = ({
  book,
  progress,
  paperTheme,
  onChangePaperTheme,
  onUpdateProgress,
  onClose,
  initialPage,
}) => {
  const startPage =
    initialPage || progress.bookmarkedPage || progress.currentPage || 1;

  const [currentPage, setCurrentPage] = useState<number>(startPage);
  const [totalPages, setTotalPages] = useState<number>(
    progress.totalPages || book.totalPages || 1
  );
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [toc, setToc] = useState<TocItem[]>([]);
  const [leftUrl, setLeftUrl] = useState<string | null>(null);
  const [rightUrl, setRightUrl] = useState<string | null>(null);
  const [loadingPages, setLoadingPages] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [isMobile, setIsMobile] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth < 860 : false
  );
  const [flipDirection, setFlipDirection] = useState<'next' | 'prev' | null>(
    null
  );
  const [showToc, setShowToc] = useState<boolean>(false);
  const [showBookmarkPanel, setShowBookmarkPanel] = useState<boolean>(false);
  const [selectedStyle, setSelectedStyle] = useState<BookmarkStyleId>(
    progress.bookmarkStyle || 'crimson-silk'
  );
  const [bookmarkNote, setBookmarkNote] = useState<string>('');
  const [pageInput, setPageInput] = useState<string>(String(startPage));
  const [justFinishedBanner, setJustFinishedBanner] = useState<boolean>(false);

  const touchStartX = useRef<number | null>(null);
  const pageCacheRef = useRef<Map<number, string>>(new Map());

  // Responsive listener
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 860);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Mark book opened & track firstOpenedAt + lastReadAt
  useEffect(() => {
    const now = Date.now();
    onUpdateProgress((prev) => ({
      ...prev,
      firstOpenedAt: prev.firstOpenedAt ?? now,
      lastReadAt: now,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [book.id]);

  // Load PDF document & TOC
  useEffect(() => {
    let active = true;
    setLoadingPages(true);
    setErrorMsg(null);
    pageCacheRef.current.clear();

    loadPdfDocument(book)
      .then((doc) => {
        if (!active) return;
        setPdfDoc(doc);
        setTotalPages(doc.numPages);
        onUpdateProgress((prev) => ({
          ...prev,
          totalPages: doc.numPages,
        }));
      })
      .catch((err) => {
        if (!active) return;
        setErrorMsg(err?.message || 'Không thể mở tệp sách này.');
        setLoadingPages(false);
      });

    extractBookToc(book).then((items) => {
      if (active) setToc(items);
    });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [book]);

  // Calculate visible pages
  const leftPageNum = isMobile
    ? null
    : currentPage <= 1
      ? null
      : currentPage % 2 === 0
        ? currentPage
        : currentPage - 1;

  const rightPageNum = isMobile
    ? currentPage
    : currentPage <= 1
      ? 1
      : leftPageNum && leftPageNum + 1 <= totalPages
        ? leftPageNum + 1
        : null;

  const renderCachedPage = useCallback(
    async (doc: PDFDocumentProxy, pageNum: number) => {
      const cached = pageCacheRef.current.get(pageNum);
      if (cached) return cached;
      const targetWidth = isMobile ? 640 : 620;
      const url = await renderPageToDataUrl(doc, pageNum, targetWidth);
      // Keep cache bounded
      if (pageCacheRef.current.size > 24) {
        const firstKey = pageCacheRef.current.keys().next().value;
        if (firstKey !== undefined) pageCacheRef.current.delete(firstKey);
      }
      pageCacheRef.current.set(pageNum, url);
      return url;
    },
    [isMobile]
  );

  // Render active spread + prefetch next page
  useEffect(() => {
    if (!pdfDoc) return;
    let active = true;
    setLoadingPages(true);

    (async () => {
      try {
        const [lUrl, rUrl] = await Promise.all([
          leftPageNum ? renderCachedPage(pdfDoc, leftPageNum) : Promise.resolve(null),
          rightPageNum ? renderCachedPage(pdfDoc, rightPageNum) : Promise.resolve(null),
        ]);
        if (!active) return;
        setLeftUrl(lUrl);
        setRightUrl(rUrl);
        setLoadingPages(false);

        // Background prefetch next page(s)
        const nextBase = rightPageNum ? rightPageNum + 1 : (leftPageNum || 1) + 1;
        if (nextBase <= pdfDoc.numPages) {
          renderCachedPage(pdfDoc, nextBase).catch(() => {});
        }
        if (!isMobile && nextBase + 1 <= pdfDoc.numPages) {
          renderCachedPage(pdfDoc, nextBase + 1).catch(() => {});
        }
      } catch {
        if (active) setLoadingPages(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [pdfDoc, leftPageNum, rightPageNum, isMobile, renderCachedPage]);

  // Persist current page & auto-detect finishing the book
  useEffect(() => {
    setPageInput(String(currentPage));
    const now = Date.now();
    const reachedEnd = totalPages > 1 && currentPage >= totalPages;

    onUpdateProgress((prev) => {
      const nextFinished = prev.isFinished || reachedEnd;
      const nextFinishedAt =
        prev.finishedAt ?? (reachedEnd ? now : null);
      if (reachedEnd && !prev.isFinished) {
        setJustFinishedBanner(true);
      }
      return {
        ...prev,
        currentPage,
        firstOpenedAt: prev.firstOpenedAt ?? now,
        lastReadAt: now,
        isFinished: nextFinished,
        finishedAt: nextFinishedAt,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, totalPages]);

  const goNext = useCallback(() => {
    setFlipDirection('next');
    window.setTimeout(() => setFlipDirection(null), 500);
    setCurrentPage((p) => {
      if (isMobile) return Math.min(totalPages, p + 1);
      if (p <= 1) return Math.min(totalPages, 2);
      const left = p % 2 === 0 ? p : p - 1;
      return Math.min(totalPages, left + 2);
    });
  }, [isMobile, totalPages]);

  const goPrev = useCallback(() => {
    setFlipDirection('prev');
    window.setTimeout(() => setFlipDirection(null), 500);
    setCurrentPage((p) => {
      if (isMobile) return Math.max(1, p - 1);
      if (p <= 2) return 1;
      const left = p % 2 === 0 ? p : p - 1;
      return Math.max(1, left - 2);
    });
  }, [isMobile]);

  // Keyboard navigation
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        goNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goPrev();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [goNext, goPrev, onClose]);

  const activeChapter = [...toc]
    .reverse()
    .find((item) => item.page <= currentPage);

  const activeBookmark =
    progress.bookmarks.find(
      (b) => b.page === currentPage || b.page === leftPageNum || b.page === rightPageNum
    ) ||
    (progress.bookmarkedPage &&
    (progress.bookmarkedPage === currentPage ||
      progress.bookmarkedPage === leftPageNum ||
      progress.bookmarkedPage === rightPageNum)
      ? {
          id: 'primary',
          page: progress.bookmarkedPage,
          style: progress.bookmarkStyle,
          createdAt: Date.now(),
        }
      : null);

  const handleSaveBookmark = () => {
    const targetPage = currentPage;
    onUpdateProgress((prev) => {
      const filtered = prev.bookmarks.filter((b) => b.page !== targetPage);
      return {
        ...prev,
        bookmarkedPage: targetPage,
        bookmarkStyle: selectedStyle,
        bookmarks: [
          {
            id: `bm-${Date.now()}`,
            page: targetPage,
            style: selectedStyle,
            note: bookmarkNote.trim() || undefined,
            createdAt: Date.now(),
          },
          ...filtered,
        ],
      };
    });
    setBookmarkNote('');
    setShowBookmarkPanel(false);
  };

  const handleRemoveBookmark = (page: number) => {
    onUpdateProgress((prev) => {
      const remaining = prev.bookmarks.filter((b) => b.page !== page);
      const nextPrimary =
        prev.bookmarkedPage === page
          ? remaining[0]?.page ?? null
          : prev.bookmarkedPage;
      return {
        ...prev,
        bookmarkedPage: nextPrimary,
        bookmarks: remaining,
      };
    });
  };

  const handleToggleFinished = () => {
    const now = Date.now();
    onUpdateProgress((prev) => {
      if (prev.isFinished) {
        return { ...prev, isFinished: false, finishedAt: null };
      }
      setJustFinishedBanner(true);
      return {
        ...prev,
        isFinished: true,
        firstOpenedAt: prev.firstOpenedAt ?? now,
        finishedAt: now,
        lastReadAt: now,
      };
    });
  };

  const handleJumpPage = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(pageInput, 10);
    if (!Number.isNaN(parsed)) {
      setCurrentPage(Math.max(1, Math.min(totalPages, parsed)));
    }
  };

  const theme = THEME_STYLES[paperTheme];
  const progressPercent = Math.round((currentPage / Math.max(1, totalPages)) * 100);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col ${theme.backdrop} text-[#F7F1E5] select-none`}
    >
      {/* Top Reader Toolbar */}
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-black/30 px-3 sm:px-6 py-2.5 backdrop-blur-md">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-[#F5EAD6] transition hover:bg-white/15"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Về tủ sách</span>
          </button>

          <div className="min-w-0">
            <h1 className="truncate font-display text-lg sm:text-xl font-semibold leading-tight text-[#FBF6EC]">
              {book.title}
            </h1>
            <p className="truncate text-[11px] text-[#CBB89E]">
              {activeChapter ? activeChapter.title : book.author}
            </p>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* TOC button */}
          <button
            type="button"
            onClick={() => {
              setShowToc((s) => !s);
              setShowBookmarkPanel(false);
            }}
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
              showToc
                ? 'bg-[#C28E48] text-[#1E140D]'
                : 'border border-white/15 bg-white/5 text-[#F5EAD6] hover:bg-white/15'
            }`}
          >
            <List className="h-4 w-4" />
            <span className="hidden sm:inline">Mục lục</span>
          </button>

          {/* Decorative Bookmark Button */}
          <button
            type="button"
            onClick={() => {
              setShowBookmarkPanel((s) => !s);
              setShowToc(false);
            }}
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
              showBookmarkPanel || activeBookmark
                ? 'bg-[#9E2A2B] text-white shadow'
                : 'border border-white/15 bg-white/5 text-[#F5EAD6] hover:bg-white/15'
            }`}
          >
            <Bookmark
              className={`h-4 w-4 ${activeBookmark ? 'fill-current' : ''}`}
            />
            <span className="hidden sm:inline">
              {activeBookmark ? 'Đã đánh dấu' : 'Đánh dấu trang'}
            </span>
          </button>

          {/* Paper Theme Cycle */}
          <button
            type="button"
            onClick={() => {
              const order: PaperTheme[] = ['cream', 'white', 'sepia', 'night'];
              const next = order[(order.indexOf(paperTheme) + 1) % order.length];
              onChangePaperTheme(next);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-[#F5EAD6] transition hover:bg-white/15"
            title={`Ánh sáng trang giấy: ${theme.label}`}
          >
            {paperTheme === 'night' ? (
              <Moon className="h-4 w-4 text-[#E7C27D]" />
            ) : (
              <Sun className="h-4 w-4 text-[#E7C27D]" />
            )}
            <span className="hidden md:inline">{theme.label}</span>
          </button>

          {/* Mark Finished Button */}
          <button
            type="button"
            onClick={handleToggleFinished}
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
              progress.isFinished
                ? 'bg-[#256D4F] text-white'
                : 'border border-white/15 bg-white/5 text-[#F5EAD6] hover:bg-white/15'
            }`}
            title={
              progress.isFinished
                ? 'Đã hoàn thành cuốn sách này'
                : 'Đánh dấu đã đọc xong'
            }
          >
            <CheckCircle2 className="h-4 w-4" />
            <span className="hidden md:inline">
              {progress.isFinished ? 'Đã đọc xong' : 'Hoàn thành'}
            </span>
          </button>
        </div>
      </header>

      {/* Finished celebration banner */}
      {justFinishedBanner && (
        <div className="flex items-center justify-between bg-[#1F4E3D] px-5 py-2 text-xs text-[#E7F8EE]">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#F3D37A]" />
            <span>
              Chúc mừng! Bạn đã hoàn thành <strong>{book.title}</strong> trong{' '}
              <strong>
                {formatReadingDuration(
                  progress.firstOpenedAt,
                  progress.finishedAt || Date.now()
                )}
              </strong>
              . Cuốn sách đã được lưu vào mục Sách Đã Đọc Xong.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setJustFinishedBanner(false)}
            className="rounded p-1 hover:bg-white/10"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Main Reading Stage */}
      <div
        className="relative flex flex-1 items-center justify-center overflow-hidden px-2 py-3 sm:px-8 sm:py-5"
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          if (touchStartX.current === null) return;
          const delta = e.changedTouches[0].clientX - touchStartX.current;
          touchStartX.current = null;
          if (delta < -45) goNext();
          if (delta > 45) goPrev();
        }}
      >
        {/* TOC Slide-out Drawer */}
        {showToc && (
          <aside className="absolute inset-y-0 left-0 z-30 flex w-72 sm:w-80 flex-col border-r border-[#C9B393]/30 bg-[#FAF5EC] text-[#221A14] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E3D5BF] px-5 py-3.5">
              <div>
                <h2 className="font-display text-xl font-bold">Mục lục</h2>
                <p className="text-[11px] text-[#7A6451]">
                  {toc.length} phần · {totalPages} trang
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowToc(false)}
                className="rounded-lg p-1.5 text-[#6B5B4E] hover:bg-[#EAE0CE]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              {toc.map((item, idx) => {
                const isCurrent = activeChapter?.page === item.page;
                return (
                  <button
                    key={`${item.page}-${idx}`}
                    type="button"
                    onClick={() => {
                      setCurrentPage(item.page);
                      setShowToc(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition ${
                      isCurrent
                        ? 'bg-[#3A2317] font-semibold text-[#F7F1E5]'
                        : 'text-[#3A2B20] hover:bg-[#EDE2D0]'
                    }`}
                    style={{ paddingLeft: `${12 + item.level * 14}px` }}
                  >
                    <span className="truncate pr-2">{item.title}</span>
                    <span
                      className={`shrink-0 font-mono text-[11px] ${
                        isCurrent ? 'text-[#E5B968]' : 'text-[#8C7762]'
                      }`}
                    >
                      tr. {item.page}
                    </span>
                  </button>
                );
              })}
            </div>
          </aside>
        )}

        {/* Decorative Bookmark Studio Drawer */}
        {showBookmarkPanel && (
          <aside className="absolute inset-y-0 right-0 z-30 flex w-80 sm:w-96 flex-col border-l border-[#C9B393]/30 bg-[#FAF5EC] text-[#221A14] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E3D5BF] px-5 py-3.5">
              <div>
                <h2 className="font-display text-xl font-bold">
                  Đánh dấu trang sách
                </h2>
                <p className="text-[11px] text-[#7A6451]">
                  Chọn thẻ trang trí để kẹp vào trang {currentPage}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowBookmarkPanel(false)}
                className="rounded-lg p-1.5 text-[#6B5B4E] hover:bg-[#EAE0CE]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              {/* Ornament Picker */}
              <div>
                <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-[#7A6451]">
                  Chọn kiểu thẻ đánh dấu
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  {BOOKMARK_STYLES.map((opt) => {
                    const active = selectedStyle === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSelectedStyle(opt.id)}
                        className={`flex items-center gap-2.5 rounded-xl border p-2.5 text-left transition ${
                          active
                            ? 'border-[#8E2C2C] bg-[#F4E6DC] ring-2 ring-[#8E2C2C]/25'
                            : 'border-[#E0D2BC] bg-white hover:border-[#C2A47E]'
                        }`}
                      >
                        <div className="flex h-12 w-8 shrink-0 items-center justify-center">
                          <DecorativeBookmark styleId={opt.id} size="sm" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold text-[#221A14]">
                            {opt.name}
                          </p>
                          <p className="truncate text-[10px] text-[#7A6451]">
                            {opt.tagline}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Optional Note */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#4B3A2D]">
                  Ghi chú ngắn (tuỳ chọn)
                </label>
                <input
                  type="text"
                  value={bookmarkNote}
                  onChange={(e) => setBookmarkNote(e.target.value)}
                  placeholder="VD: Đoạn hội thoại rất hay..."
                  className="w-full rounded-lg border border-[#D8C7AE] bg-white px-3 py-2 text-xs text-[#221A14] placeholder:text-[#A5937F] focus:border-[#8E2C2C] focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={handleSaveBookmark}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#8E2C2C] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#732121]"
              >
                <Bookmark className="h-4 w-4 fill-current" />
                Kẹp thẻ đánh dấu tại trang {currentPage}
              </button>

              {/* Saved Bookmarks List */}
              <div className="border-t border-[#E3D5BF] pt-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#7A6451]">
                  Các trang đã đánh dấu ({progress.bookmarks.length})
                </p>
                {progress.bookmarks.length === 0 ? (
                  <p className="rounded-lg bg-[#F2E9DA] p-3 text-xs italic text-[#7A6451]">
                    Chưa có trang nào được đánh dấu. Khi bạn đánh dấu, lần sau mở
                    sách sẽ tự động mở đúng trang này.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {progress.bookmarks.map((bm) => (
                      <div
                        key={bm.id}
                        className="flex items-center justify-between gap-2 rounded-xl border border-[#E2D4BF] bg-white p-2.5"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setCurrentPage(bm.page);
                            setShowBookmarkPanel(false);
                          }}
                          className="flex flex-1 items-center gap-2.5 text-left min-w-0"
                        >
                          <DecorativeBookmark styleId={bm.style} size="sm" />
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-[#221A14]">
                              Trang {bm.page}
                              {progress.bookmarkedPage === bm.page && (
                                <span className="ml-1.5 rounded bg-[#8E2C2C]/12 px-1.5 py-0.5 text-[10px] font-medium text-[#8E2C2C]">
                                  Đọc tiếp từ đây
                                </span>
                              )}
                            </p>
                            {bm.note && (
                              <p className="truncate text-[11px] text-[#6B5B4E]">
                                “{bm.note}”
                              </p>
                            )}
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveBookmark(bm.page)}
                          className="rounded-lg p-1.5 text-[#9B8570] hover:bg-[#F5E6E6] hover:text-[#8E2C2C]"
                          title="Gỡ đánh dấu"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </aside>
        )}

        {/* Left Nav Arrow (Desktop) */}
        <button
          type="button"
          onClick={goPrev}
          disabled={currentPage <= 1}
          className="hidden sm:flex mr-3 lg:mr-6 h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/15 bg-black/30 text-[#F5EAD6] transition hover:bg-black/55 disabled:opacity-25"
          aria-label="Lật trang trước"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        {/* THE REALISTIC OPEN BOOK */}
        {errorMsg ? (
          <div className="rounded-2xl bg-[#FAF5EC] p-8 text-center text-[#221A14] shadow-xl">
            <BookOpen className="mx-auto h-10 w-10 text-[#8E2C2C]" />
            <p className="mt-3 font-medium">{errorMsg}</p>
          </div>
        ) : isMobile ? (
          /* Mobile Single Page Book */
          <div
            className={`relative flex h-full max-h-[78vh] w-full max-w-[440px] flex-col rounded-xl border-4 border-[#4A2E1D] ${theme.pageBg} shadow-[0_22px_50px_rgba(0,0,0,0.65)] ${
              flipDirection === 'next'
                ? 'animate-mobile-next'
                : flipDirection === 'prev'
                  ? 'animate-mobile-prev'
                  : ''
            }`}
          >
            {/* Decorative Bookmark clipped on top */}
            {activeBookmark && (
              <div
                className="pointer-events-none absolute -top-2 right-5 z-20"
                title={`Đang đánh dấu trang ${activeBookmark.page}`}
              >
                <DecorativeBookmark styleId={activeBookmark.style} size="md" />
              </div>
            )}

            {/* Page Header */}
            <div
              className={`flex items-center justify-between px-4 pt-2.5 text-[10px] font-serif ${theme.text}`}
            >
              <span className="truncate max-w-[65%]">{book.title}</span>
              <span>
                {currentPage === 1 ? 'Bìa sách' : `Trang ${currentPage}`}
              </span>
            </div>

            {/* Page Content */}
            <div className="relative flex flex-1 items-center justify-center overflow-hidden p-2.5">
              {currentPage === 1 && book.id === 'truong-ca-achilles' ? (
                <div className="h-full max-w-full aspect-[2/3] overflow-hidden rounded shadow-md">
                  <AchillesCoverArt />
                </div>
              ) : loadingPages && !rightUrl ? (
                <div className="h-full w-full animate-pulse rounded bg-black/5" />
              ) : rightUrl ? (
                <img
                  src={rightUrl}
                  alt={`Trang ${currentPage}`}
                  className={`max-h-full max-w-full object-contain ${theme.imgFilter}`}
                />
              ) : null}

              {/* Tap zones for easy mobile turning */}
              <button
                type="button"
                onClick={goPrev}
                disabled={currentPage <= 1}
                className="absolute inset-y-0 left-0 w-1/4 cursor-pointer focus:outline-none"
                aria-label="Trang trước"
              />
              <button
                type="button"
                onClick={goNext}
                disabled={currentPage >= totalPages}
                className="absolute inset-y-0 right-0 w-1/4 cursor-pointer focus:outline-none"
                aria-label="Trang sau"
              />
            </div>

            {/* Footer page number */}
            <div
              className={`pb-2.5 text-center font-serif text-xs ${theme.text}`}
            >
              {currentPage} / {totalPages}
            </div>
          </div>
        ) : (
          /* Desktop Realistic 2-Page Spread */
          <div className="flip-stage relative flex h-full max-h-[80vh] w-full max-w-[1040px] rounded-xl bg-[#462B1B] p-2.5 shadow-[0_32px_70px_-12px_rgba(0,0,0,0.75)] ring-1 ring-white/10">
            {/* Decorative Bookmark clipped on top of open book */}
            {activeBookmark && (
              <div
                className={`pointer-events-none absolute -top-3 z-30 ${
                  activeBookmark.page === leftPageNum ? 'left-14' : 'right-14'
                }`}
              >
                <DecorativeBookmark styleId={activeBookmark.style} size="lg" />
              </div>
            )}

            {/* Left Page */}
            <div
              onClick={() => {
                if (currentPage > 1) goPrev();
              }}
              className={`relative flex h-full w-1/2 cursor-pointer flex-col justify-between overflow-hidden rounded-l-md ${theme.pageBg} px-5 py-3.5`}
              title={currentPage > 1 ? 'Nhấn để lật về trang trước' : undefined}
            >
              {currentPage <= 1 ? (
                /* Inside front cover / Book Title Plate */
                <div className="flex h-full flex-col justify-between rounded border border-[#D8C6AB]/70 p-7 text-[#2A1F18]">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#9A7A58]">
                      Thư viện cá nhân · Tủ Sách Của Tôi
                    </p>
                    <h2 className="mt-6 font-display text-4xl font-bold leading-tight">
                      {book.title}
                    </h2>
                    <p className="mt-2 font-serif text-base italic text-[#6B5B4E]">
                      {book.author}
                    </p>
                    <div className="my-5 h-px w-16 bg-[#C28E48]" />
                    <p className="font-serif text-sm leading-relaxed text-[#4C3D31]">
                      {book.description}
                    </p>
                  </div>
                  <div className="space-y-1 text-xs text-[#7D6853]">
                    <p>Thể loại: {book.genre}</p>
                    <p>Độ dài: {totalPages} trang</p>
                    <p className="pt-2 italic">
                      Nhấn vào bìa bên phải hoặc phím mũi tên → để bắt đầu lật
                      sách.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div
                    className={`flex items-center justify-between text-[11px] font-serif ${theme.text}`}
                  >
                    <span className="truncate">{book.title}</span>
                    <span className="truncate opacity-75">
                      {activeChapter?.title || ''}
                    </span>
                  </div>
                  <div className="flex flex-1 items-center justify-center overflow-hidden py-2">
                    {loadingPages && !leftUrl ? (
                      <div className="h-full w-full animate-pulse rounded bg-black/5" />
                    ) : leftUrl ? (
                      <img
                        src={leftUrl}
                        alt={`Trang ${leftPageNum}`}
                        className={`max-h-full max-w-full object-contain ${theme.imgFilter}`}
                      />
                    ) : null}
                  </div>
                  <div
                    className={`text-center font-serif text-xs ${theme.text}`}
                  >
                    {leftPageNum}
                  </div>
                </>
              )}
              <div className="book-crease-left pointer-events-none absolute inset-0" />
            </div>

            {/* Right Page */}
            <div
              onClick={() => {
                if (currentPage < totalPages) goNext();
              }}
              className={`relative flex h-full w-1/2 cursor-pointer flex-col justify-between overflow-hidden rounded-r-md ${theme.pageBg} px-5 py-3.5 ${
                flipDirection === 'next'
                  ? 'animate-flip-next'
                  : flipDirection === 'prev'
                    ? 'animate-flip-prev'
                    : ''
              }`}
              title={
                currentPage < totalPages ? 'Nhấn để lật sang trang sau' : undefined
              }
            >
              <div
                className={`flex items-center justify-between text-[11px] font-serif ${theme.text}`}
              >
                <span className="truncate opacity-75">{book.author}</span>
                <span>{rightPageNum === 1 ? 'Bìa sách' : ''}</span>
              </div>

              <div className="flex flex-1 items-center justify-center overflow-hidden py-2">
                {rightPageNum === 1 && book.id === 'truong-ca-achilles' ? (
                  <div className="h-full max-w-full aspect-[2/3] overflow-hidden rounded shadow-lg">
                    <AchillesCoverArt />
                  </div>
                ) : loadingPages && !rightUrl ? (
                  <div className="h-full w-full animate-pulse rounded bg-black/5" />
                ) : rightUrl ? (
                  <img
                    src={rightUrl}
                    alt={`Trang ${rightPageNum}`}
                    className={`max-h-full max-w-full object-contain ${theme.imgFilter}`}
                  />
                ) : (
                  <div className="text-center font-serif text-sm italic text-[#8B7663]">
                    — Hết cuốn sách —
                  </div>
                )}
              </div>

              <div className={`text-center font-serif text-xs ${theme.text}`}>
                {rightPageNum ? (rightPageNum === 1 ? 'Bìa trước' : rightPageNum) : ''}
              </div>
              <div className="book-crease-right pointer-events-none absolute inset-0" />
            </div>
          </div>
        )}

        {/* Right Nav Arrow (Desktop) */}
        <button
          type="button"
          onClick={goNext}
          disabled={currentPage >= totalPages}
          className="hidden sm:flex ml-3 lg:ml-6 h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/15 bg-black/30 text-[#F5EAD6] transition hover:bg-black/55 disabled:opacity-25"
          aria-label="Lật trang sau"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      {/* Bottom Reading Scrubber & Page Controls */}
      <footer className="border-t border-white/10 bg-black/35 px-4 sm:px-6 py-2.5 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3">
          {/* Mobile prev/next + Jump */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={goPrev}
              disabled={currentPage <= 1}
              className="flex sm:hidden h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-white/10 disabled:opacity-30"
              aria-label="Trang trước"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <form onSubmit={handleJumpPage} className="flex items-center gap-1.5 text-xs">
              <span className="text-[#CBB89E]">Trang</span>
              <input
                type="number"
                min={1}
                max={totalPages}
                value={pageInput}
                onChange={(e) => setPageInput(e.target.value)}
                className="w-16 rounded-md border border-white/20 bg-white/10 px-2 py-1 text-center text-xs text-white focus:border-[#E5B968] focus:outline-none"
              />
              <span className="text-[#CBB89E]">/ {totalPages}</span>
            </form>

            <button
              type="button"
              onClick={goNext}
              disabled={currentPage >= totalPages}
              className="flex sm:hidden h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-white/10 disabled:opacity-30"
              aria-label="Trang sau"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Interactive Scrubber */}
          <div className="flex flex-1 items-center gap-3 min-w-[160px]">
            <input
              type="range"
              min={1}
              max={totalPages}
              value={currentPage}
              onChange={(e) => setCurrentPage(Number(e.target.value))}
              className="h-1.5 w-full cursor-pointer accent-[#D4A857]"
              aria-label="Thanh tiến độ trang sách"
            />
            <span className="w-10 text-right font-mono text-xs text-[#E5B968]">
              {progressPercent}%
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};
