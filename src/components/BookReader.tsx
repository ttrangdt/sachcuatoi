import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  Bookmark,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  List,
  Minus,
  Moon,
  Plus,
  Sparkles,
  Sun,
  Trash2,
  X,
  BookOpen,
} from 'lucide-react';
import {
  BookItem,
  BookProgress,
  BookTextData,
  BookmarkStyleId,
  PaperTheme,
} from '../types/book';
import { getBookCoverUrl } from '../utils/pdfEngine';
import { loadBookTextData, paginateBookText } from '../utils/bookPagination';
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
  fontSize: number;
  onChangeFontSize: (size: number) => void;
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
    bodyText: string;
    mutedText: string;
    headingText: string;
  }
> = {
  cream: {
    label: 'Kem ấm',
    backdrop: 'bg-[#231912]',
    pageBg: 'bg-[#FCF8EE]',
    bodyText: 'text-[#2C221A]',
    mutedText: 'text-[#7C6A58]',
    headingText: 'text-[#3A2317]',
  },
  white: {
    label: 'Trắng sáng',
    backdrop: 'bg-[#1D1E22]',
    pageBg: 'bg-[#FFFFFF]',
    bodyText: 'text-[#1F2329]',
    mutedText: 'text-[#6A717C]',
    headingText: 'text-[#14171C]',
  },
  sepia: {
    label: 'Giấy cổ',
    backdrop: 'bg-[#2C1E14]',
    pageBg: 'bg-[#F3E5CA]',
    bodyText: 'text-[#362617]',
    mutedText: 'text-[#7A5E42]',
    headingText: 'text-[#4C2C16]',
  },
  night: {
    label: 'Đèn đêm',
    backdrop: 'bg-[#0B0C14]',
    pageBg: 'bg-[#171822]',
    bodyText: 'text-[#CFC9BE]',
    mutedText: 'text-[#847E90]',
    headingText: 'text-[#F3D89B]',
  },
};

const PageTextColumn: React.FC<{
  paragraphs: string[] | null;
  fontSize: number;
  theme: (typeof THEME_STYLES)[PaperTheme];
}> = ({ paragraphs, fontSize, theme }) => {
  if (!paragraphs || paragraphs.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <span className={`font-serif text-sm italic ${theme.mutedText}`}>
          — Hết cuốn sách —
        </span>
      </div>
    );
  }

  return (
    <div
      className={`flex-1 overflow-hidden py-1 font-serif leading-[1.66] ${theme.bodyText}`}
      style={{ fontSize: `${fontSize}px` }}
    >
      <div className="space-y-2.5">
        {paragraphs.map((para, idx) => {
          if (para.startsWith('## ')) {
            return (
              <h3
                key={idx}
                className={`pt-2 pb-1 text-center font-display font-bold tracking-wide ${theme.headingText}`}
                style={{ fontSize: `${Math.round(fontSize * 1.45)}px` }}
              >
                {para.replace(/^##\s+/, '')}
              </h3>
            );
          }
          return (
            <p key={idx} className="indent-6 text-justify">
              {para}
            </p>
          );
        })}
      </div>
    </div>
  );
};

interface FlipTransitionState {
  direction: 'next' | 'prev';
  fromPage: number;
  toPage: number;
}

export const BookReader: React.FC<BookReaderProps> = ({
  book,
  progress,
  paperTheme,
  fontSize,
  onChangeFontSize,
  onChangePaperTheme,
  onUpdateProgress,
  onClose,
  initialPage,
}) => {
  const startPage =
    initialPage || progress.bookmarkedPage || progress.currentPage || 1;

  const [currentPage, setCurrentPage] = useState<number>(startPage);
  const [flipState, setFlipState] = useState<FlipTransitionState | null>(null);
  const [bookText, setBookText] = useState<BookTextData | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [isMobile, setIsMobile] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth < 860 : false
  );
  const [showToc, setShowToc] = useState<boolean>(false);
  const [showBookmarkPanel, setShowBookmarkPanel] = useState<boolean>(false);
  const [selectedStyle, setSelectedStyle] = useState<BookmarkStyleId>(
    progress.bookmarkStyle || 'mystic-moon'
  );
  const [bookmarkNote, setBookmarkNote] = useState<string>('');
  const [pageInput, setPageInput] = useState<string>(String(startPage));
  const [justFinishedBanner, setJustFinishedBanner] = useState<boolean>(false);

  // Night-mode warm cursor reading spotlight coordinates (relative to open book)
  const [spotlight, setSpotlight] = useState<{ x: number; y: number; active: boolean }>({
    x: 0,
    y: 0,
    active: false,
  });

  const touchStartX = useRef<number | null>(null);
  const prevTotalRef = useRef<number>(progress.totalPages || book.totalPages);
  const flipTimerRef = useRef<number | null>(null);
  const measureColRef = useRef<HTMLDivElement | null>(null);
  const [colDims, setColDims] = useState<{ width: number; height: number }>(() => ({
    width: typeof window !== 'undefined' && window.innerWidth < 860 ? 340 : 540,
    height: typeof window !== 'undefined' ? Math.max(460, window.innerHeight * 0.72) : 600,
  }));

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 860);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const el = measureColRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;
      if (rect && rect.width > 120 && rect.height > 180) {
        setColDims((prev) =>
          Math.abs(prev.width - rect.width) > 10 ||
          Math.abs(prev.height - rect.height) > 10
            ? { width: rect.width, height: rect.height }
            : prev
        );
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [isMobile]);

  useEffect(() => {
    const now = Date.now();
    onUpdateProgress((prev) => ({
      ...prev,
      firstOpenedAt: prev.firstOpenedAt ?? now,
      lastReadAt: now,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [book.id]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setErrorMsg(null);

    loadBookTextData(book)
      .then((data) => {
        if (!active) return;
        setBookText(data);
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        setErrorMsg(err?.message || 'Không thể tải nội dung cuốn sách này.');
        setLoading(false);
      });

    if (book.id !== 'truong-ca-achilles') {
      getBookCoverUrl(book).then((url) => {
        if (active) setCoverUrl(url);
      });
    }

    return () => {
      active = false;
      if (flipTimerRef.current) window.clearTimeout(flipTimerRef.current);
    };
  }, [book]);

  const paginated = useMemo(() => {
    if (!bookText) return null;
    return paginateBookText(bookText, {
      isMobile,
      fontSize,
      colWidth: colDims.width,
      colHeight: colDims.height,
    });
  }, [bookText, isMobile, fontSize, colDims.width, colDims.height]);

  const totalPages = paginated?.totalPages || progress.totalPages || book.totalPages;
  const toc = paginated?.toc || [{ title: 'Bìa sách', page: 1, level: 0 }];

  useEffect(() => {
    if (!paginated) return;
    const oldTotal = prevTotalRef.current;
    const newTotal = paginated.totalPages;
    if (oldTotal > 1 && newTotal !== oldTotal) {
      setCurrentPage((p) => {
        if (p <= 1) return 1;
        const ratio = (p - 1) / (oldTotal - 1);
        return Math.max(2, Math.min(newTotal, Math.round(ratio * (newTotal - 1)) + 1));
      });
    }
    prevTotalRef.current = newTotal;
    onUpdateProgress((prev) => ({
      ...prev,
      totalPages: newTotal,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paginated?.totalPages]);

  useEffect(() => {
    setPageInput(String(currentPage));
    const now = Date.now();
    const reachedEnd = totalPages > 1 && currentPage >= totalPages;

    onUpdateProgress((prev) => {
      const nextFinished = prev.isFinished || reachedEnd;
      const nextFinishedAt = prev.finishedAt ?? (reachedEnd ? now : null);
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

  /** Helper: get [leftPageNum, rightPageNum] for a desktop spread anchor */
  const getSpreadNums = useCallback(
    (anchor: number): [number | null, number | null] => {
      if (anchor <= 1) return [null, 1];
      const left = anchor % 2 === 0 ? anchor : anchor - 1;
      const right = left + 1 <= totalPages ? left + 1 : null;
      return [left, right];
    },
    [totalPages]
  );

  /** Real Two-Sided Smooth 3D Page Flip */
  const triggerFlip = useCallback(
    (direction: 'next' | 'prev') => {
      if (flipState) return; // avoid overlapping flips mid-air

      let target = currentPage;
      if (direction === 'next') {
        if (currentPage >= totalPages) return;
        if (isMobile) {
          target = Math.min(totalPages, currentPage + 1);
        } else if (currentPage <= 1) {
          target = Math.min(totalPages, 2);
        } else {
          const left = currentPage % 2 === 0 ? currentPage : currentPage - 1;
          target = Math.min(totalPages, left + 2);
        }
      } else {
        if (currentPage <= 1) return;
        if (isMobile) {
          target = Math.max(1, currentPage - 1);
        } else if (currentPage <= 2) {
          target = 1;
        } else {
          const left = currentPage % 2 === 0 ? currentPage : currentPage - 1;
          target = Math.max(1, left - 2);
        }
      }

      if (target === currentPage) return;

      setFlipState({ direction, fromPage: currentPage, toPage: target });
    },
    [currentPage, flipState, isMobile, totalPages]
  );

  const handleFlipAnimationEnd = useCallback(() => {
    if (!flipState) return;
    const dest = flipState.toPage;
    setCurrentPage(dest);
    setFlipState(null);
  }, [flipState]);

  const goNext = useCallback(() => triggerFlip('next'), [triggerFlip]);
  const goPrev = useCallback(() => triggerFlip('prev'), [triggerFlip]);

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

  const theme = THEME_STYLES[paperTheme];
  const activeChapter = [...toc]
    .reverse()
    .find((item) => item.page <= currentPage);

  // Render any single page face cleanly (Cover or Text)
  const renderPageFace = (pageNum: number | null, side: 'left' | 'right') => {
    if (pageNum === null) {
      if (side === 'left') {
        // Inside front cover title plate
        return (
          <div className="flex h-full flex-col justify-between rounded border border-[#D8C6AB]/60 p-8 text-[#2A1F18]">
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
              <p>{book.genre}</p>
              <p>{totalPages} trang ({fontSize}px)</p>
            </div>
          </div>
        );
      }
      return (
        <div className="flex h-full items-center justify-center">
          <span className={`font-serif text-sm italic ${theme.mutedText}`}>
            — Hết cuốn sách —
          </span>
        </div>
      );
    }

    if (pageNum === 1) {
      return (
        <div className="flex h-full flex-col justify-between">
          <div className={`text-right text-[11px] font-serif ${theme.mutedText}`}>
            Bìa sách
          </div>
          <div className="flex flex-1 items-center justify-center py-2">
            {book.id === 'truong-ca-achilles' ? (
              <div className="h-full max-h-[68vh] aspect-[2/3] overflow-hidden rounded shadow-xl">
                <AchillesCoverArt />
              </div>
            ) : coverUrl ? (
              <img
                src={coverUrl}
                alt={book.title}
                className="max-h-full max-w-full rounded object-contain shadow-lg"
              />
            ) : (
              <div className="text-center font-display text-3xl font-bold">
                {book.title}
              </div>
            )}
          </div>
          <div className={`text-center font-serif text-xs ${theme.mutedText}`}>
            1
          </div>
        </div>
      );
    }

    const paras = paginated?.pages[pageNum - 2] || null;
    return (
      <div className="flex h-full flex-col justify-between">
        <div
          className={`flex items-center justify-between text-[11px] font-serif ${theme.mutedText}`}
        >
          <span className="truncate">{side === 'left' ? book.title : book.author}</span>
          <span className="truncate opacity-75">
            {side === 'left' ? activeChapter?.title || '' : ''}
          </span>
        </div>
        {loading ? (
          <div className="my-3 flex-1 animate-pulse rounded bg-black/5" />
        ) : (
          <PageTextColumn paragraphs={paras} fontSize={fontSize} theme={theme} />
        )}
        <div className={`text-center font-serif text-xs ${theme.mutedText}`}>
          {pageNum}
        </div>
      </div>
    );
  };

  // Compute Base Left/Right pages & Turning Sheet Front/Back faces for real two-sided 3D flip
  const [curLeft, curRight] = getSpreadNums(currentPage);
  const [destLeft, destRight] = flipState
    ? getSpreadNums(flipState.toPage)
    : [curLeft, curRight];

  const baseLeftNum =
    flipState?.direction === 'prev' ? destLeft : curLeft;
  const baseRightNum =
    flipState?.direction === 'next' ? destRight : curRight;

  const activeBookmark =
    progress.bookmarks.find(
      (b) => b.page === currentPage || b.page === curLeft || b.page === curRight
    ) ||
    (progress.bookmarkedPage &&
    (progress.bookmarkedPage === currentPage ||
      progress.bookmarkedPage === curLeft ||
      progress.bookmarkedPage === curRight)
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

  const progressPercent = Math.round((currentPage / Math.max(1, totalPages)) * 100);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col ${theme.backdrop} text-[#F7F1E5] select-none`}
    >
      {/* Top Reader Toolbar */}
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-black/30 px-3 sm:px-6 py-1.5 backdrop-blur-md">
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
          <div className="inline-flex items-center rounded-lg border border-white/15 bg-white/5 p-0.5">
            <button
              type="button"
              onClick={() => onChangeFontSize(Math.max(13, fontSize - 1))}
              disabled={fontSize <= 13}
              className="flex h-7 w-7 items-center justify-center rounded-md text-[#F5EAD6] transition hover:bg-white/15 disabled:opacity-35"
              aria-label="Giảm cỡ chữ"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="px-1.5 font-mono text-[11px] text-[#F2D694]">
              {fontSize}px
            </span>
            <button
              type="button"
              onClick={() => onChangeFontSize(Math.min(24, fontSize + 1))}
              disabled={fontSize >= 24}
              className="flex h-7 w-7 items-center justify-center rounded-md text-[#F5EAD6] transition hover:bg-white/15 disabled:opacity-35"
              aria-label="Tăng cỡ chữ"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

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

          <button
            type="button"
            onClick={() => {
              setShowBookmarkPanel((s) => !s);
              setShowToc(false);
            }}
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
              showBookmarkPanel || activeBookmark
                ? 'bg-[#8E2C5A] text-white shadow'
                : 'border border-white/15 bg-white/5 text-[#F5EAD6] hover:bg-white/15'
            }`}
          >
            <Bookmark
              className={`h-4 w-4 ${activeBookmark ? 'fill-current' : ''}`}
            />
            <span className="hidden sm:inline">
              {activeBookmark ? 'Đã đánh dấu' : 'Đánh dấu'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              const order: PaperTheme[] = ['cream', 'white', 'sepia', 'night'];
              const next = order[(order.indexOf(paperTheme) + 1) % order.length];
              onChangePaperTheme(next);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-[#F5EAD6] transition hover:bg-white/15"
            title={`Ánh sáng giấy: ${theme.label}`}
          >
            {paperTheme === 'night' ? (
              <Moon className="h-4 w-4 text-[#E7C27D]" />
            ) : (
              <Sun className="h-4 w-4 text-[#E7C27D]" />
            )}
            <span className="hidden md:inline">{theme.label}</span>
          </button>

          <button
            type="button"
            onClick={handleToggleFinished}
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
              progress.isFinished
                ? 'bg-[#256D4F] text-white'
                : 'border border-white/15 bg-white/5 text-[#F5EAD6] hover:bg-white/15'
            }`}
          >
            <CheckCircle2 className="h-4 w-4" />
            <span className="hidden md:inline">
              {progress.isFinished ? 'Đã đọc xong' : 'Hoàn thành'}
            </span>
          </button>
        </div>
      </header>

      {justFinishedBanner && (
        <div className="flex items-center justify-between bg-[#1F4E3D] px-5 py-1.5 text-xs text-[#E7F8EE]">
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
              .
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

      {/* Main Immersive Large-Format Reading Stage */}
      <div
        className="relative flex flex-1 items-center justify-center overflow-hidden px-2 py-2 sm:px-5 sm:py-3"
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
        {/* TOC Drawer */}
        {showToc && (
          <aside className="absolute inset-y-0 left-0 z-40 flex w-72 sm:w-80 flex-col border-r border-[#C9B393]/30 bg-[#FAF5EC] text-[#221A14] shadow-2xl">
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

        {/* Bookmark Studio Drawer */}
        {showBookmarkPanel && (
          <aside className="absolute inset-y-0 right-0 z-40 flex w-80 sm:w-[400px] flex-col border-l border-[#C9B393]/30 bg-[#FAF5EC] text-[#221A14] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E3D5BF] px-5 py-3.5">
              <div>
                <h2 className="font-display text-xl font-bold">
                  Bộ sưu tập Bookmark ✨
                </h2>
                <p className="text-[11px] text-[#7A6451]">
                  Kẹp tại chính giữa gáy sách trang {currentPage}
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

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="grid grid-cols-2 gap-2.5">
                {BOOKMARK_STYLES.map((opt) => {
                  const active = selectedStyle === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelectedStyle(opt.id)}
                      className={`flex items-center gap-2 rounded-xl border p-2 text-left transition ${
                        active
                          ? 'border-[#8E2C5A] bg-[#F6E8F0] ring-2 ring-[#8E2C5A]/25'
                          : 'border-[#E0D2BC] bg-white hover:border-[#C2A47E]'
                      }`}
                    >
                      <div className="flex h-14 w-9 shrink-0 items-center justify-center">
                        <DecorativeBookmark styleId={opt.id} size="sm" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-[11px] font-semibold text-[#221A14]">
                          {opt.name}
                        </p>
                        <p className="line-clamp-2 text-[9.5px] leading-snug text-[#7A6451]">
                          {opt.tagline}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div>
                <input
                  type="text"
                  value={bookmarkNote}
                  onChange={(e) => setBookmarkNote(e.target.value)}
                  placeholder="Ghi chú ngắn (tuỳ chọn)..."
                  className="w-full rounded-lg border border-[#D8C7AE] bg-white px-3 py-2 text-xs text-[#221A14] placeholder:text-[#A5937F] focus:border-[#8E2C5A] focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={handleSaveBookmark}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#8E2C5A] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#722047]"
              >
                <Sparkles className="h-4 w-4" />
                Kẹp bookmark tại trang {currentPage}
              </button>

              <div className="border-t border-[#E3D5BF] pt-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#7A6451]">
                  Các trang đã đánh dấu ({progress.bookmarks.length})
                </p>
                {progress.bookmarks.length === 0 ? (
                  <p className="rounded-lg bg-[#F2E9DA] p-3 text-xs italic text-[#7A6451]">
                    Chưa có trang nào được đánh dấu.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {progress.bookmarks.map((bm) => (
                      <div
                        key={bm.id}
                        className="flex items-center justify-between gap-2 rounded-xl border border-[#E2D4BF] bg-white p-2"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setCurrentPage(bm.page);
                            setShowBookmarkPanel(false);
                          }}
                          className="flex flex-1 items-center gap-2 text-left min-w-0"
                        >
                          <DecorativeBookmark styleId={bm.style} size="sm" />
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-[#221A14]">
                              Trang {bm.page}
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

        {/* Left Page Turn Button */}
        <button
          type="button"
          onClick={goPrev}
          disabled={currentPage <= 1 || Boolean(flipState)}
          className="hidden sm:flex mr-2 lg:mr-4 h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-black/30 text-[#F5EAD6] transition hover:bg-black/55 disabled:opacity-20"
          aria-label="Lật trang trước"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* ============================================================
            THE LARGE-FORMAT REALISTIC OPEN BOOK
           ============================================================ */}
        {errorMsg ? (
          <div className="rounded-2xl bg-[#FAF5EC] p-8 text-center text-[#221A14] shadow-xl">
            <BookOpen className="mx-auto h-10 w-10 text-[#8E2C2C]" />
            <p className="mt-3 font-medium">{errorMsg}</p>
          </div>
        ) : isMobile ? (
          /* Mobile Single Page Book with underneath next-page reveal */
          <div className="flip-stage relative h-[82vh] w-full max-w-[460px] rounded-xl border-4 border-[#4A2E1D] shadow-[0_22px_50px_rgba(0,0,0,0.65)] overflow-visible">
            {/* Bookmark peeking cleanly from top-center edge (never covers text!) */}
            {activeBookmark && (
              <div className="pointer-events-none absolute -top-9 left-1/2 z-30 -translate-x-1/2">
                <DecorativeBookmark styleId={activeBookmark.style} size="sm" />
              </div>
            )}

            {/* Base destination page visible underneath during flip */}
            <div
              ref={measureColRef}
              className={`relative flex h-full w-full flex-col overflow-hidden rounded-lg ${theme.pageBg} px-5 py-3`}
            >
              {renderPageFace(
                flipState ? flipState.toPage : currentPage,
                'right'
              )}
              <button
                type="button"
                onClick={goPrev}
                disabled={currentPage <= 1}
                className="absolute inset-y-0 left-0 w-1/5 cursor-pointer focus:outline-none"
                aria-label="Trang trước"
              />
              <button
                type="button"
                onClick={goNext}
                disabled={currentPage >= totalPages}
                className="absolute inset-y-0 right-0 w-1/5 cursor-pointer focus:outline-none"
                aria-label="Trang sau"
              />
            </div>

            {/* Mobile turning sheet */}
            {flipState && (
              <div
                onAnimationEnd={handleFlipAnimationEnd}
                className={`pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-lg ${theme.pageBg} px-5 py-3 shadow-2xl ${
                  flipState.direction === 'next'
                    ? 'animate-mobile-peel-next'
                    : 'animate-mobile-peel-prev'
                }`}
              >
                {renderPageFace(flipState.fromPage, 'right')}
              </div>
            )}
          </div>
        ) : (
          /* Desktop Large 2-Page Spread (94vw / max 1320px / 84vh) with REAL 2-sided 3D page turn */
          <div
            className="flip-stage relative flex h-[84vh] max-h-[900px] w-[92vw] max-w-[1320px] rounded-xl bg-[#462B1B] p-2.5 shadow-[0_36px_80px_-14px_rgba(0,0,0,0.82)] ring-1 ring-white/10"
            onMouseMove={(e) => {
              if (paperTheme !== 'night') return;
              const rect = e.currentTarget.getBoundingClientRect();
              setSpotlight({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
                active: true,
              });
            }}
            onMouseLeave={() =>
              setSpotlight((s) => (s.active ? { ...s, active: false } : s))
            }
          >
            {/* BRIGHTER NIGHT MODE WARM CURSOR READING SPOTLIGHT */}
            {paperTheme === 'night' && spotlight.active && (
              <div
                className="pointer-events-none absolute inset-2.5 z-30 rounded-md"
                style={{
                  background: `radial-gradient(circle 240px at ${spotlight.x}px ${spotlight.y}px, rgba(255, 242, 200, 0.44) 0%, rgba(255, 218, 142, 0.22) 38%, rgba(255, 198, 110, 0.06) 64%, transparent 82%)`,
                  mixBlendMode: 'screen',
                }}
              />
            )}

            {/* ENCHANTED CENTER-SPINE BOOKMARK (ZERO TEXT OVERLAP! Runs down the center gutter & dangles below book!) */}
            {activeBookmark && (
              <div className="pointer-events-none absolute inset-y-0 left-1/2 z-30 -translate-x-1/2 flex flex-col items-center">
                {/* Tiny golden clasp peeking at top of spine */}
                <div className="-mt-2.5 h-3 w-5 rounded-t-full border border-[#F5D680] bg-gradient-to-b from-[#FFEAA6] to-[#B88428] shadow" />
                {/* Thin golden silk ribbon running strictly inside the center gutter between the 2 pages */}
                <div className="w-[3px] flex-1 bg-gradient-to-b from-[#E5BD60] via-[#C89632] to-[#E5BD60] opacity-85 shadow-[0_0_6px_rgba(0,0,0,0.45)]" />
                {/* Ornate jewel bookmark hanging gracefully BELOW the bottom edge of the open book */}
                <div className="-mt-2 translate-y-4">
                  <DecorativeBookmark styleId={activeBookmark.style} size="md" />
                </div>
              </div>
            )}

            {/* BASE LEFT PAGE (Static) */}
            <div
              onClick={() => {
                if (currentPage > 1 && !flipState) goPrev();
              }}
              className={`relative flex h-full w-1/2 cursor-pointer flex-col overflow-hidden rounded-l-md ${theme.pageBg} px-10 py-6`}
            >
              {renderPageFace(baseLeftNum, 'left')}
              <div className="book-crease-left pointer-events-none absolute inset-0" />
            </div>

            {/* BASE RIGHT PAGE (Static — already shows destination right page underneath during Next flip!) */}
            <div
              ref={measureColRef}
              onClick={() => {
                if (currentPage < totalPages && !flipState) goNext();
              }}
              className={`relative flex h-full w-1/2 cursor-pointer flex-col overflow-hidden rounded-r-md ${theme.pageBg} px-10 py-6`}
            >
              {renderPageFace(baseRightNum, 'right')}
              <div className="book-crease-right pointer-events-none absolute inset-0" />
            </div>

            {/* REAL SUPPLE TWO-SIDED 3D TURNING SHEET (ZERO MIRRORING, ZERO JITTER!) */}
            {flipState?.direction === 'next' && (
              <div
                onAnimationEnd={handleFlipAnimationEnd}
                className="turning-sheet-next pointer-events-none absolute top-2.5 bottom-2.5 right-2.5 left-1/2 z-20"
              >
                {/* Front Face = Old Right Page (lifted slightly forward in Z so Chrome never Z-fights/mirrors) */}
                <div
                  className={`sheet-face-front absolute inset-0 rounded-r-md ${theme.pageBg} shadow-2xl`}
                >
                  <div className="relative flex h-full w-full flex-col overflow-hidden rounded-r-md px-10 py-6">
                    {renderPageFace(curRight, 'right')}
                    <div className="book-crease-right pointer-events-none absolute inset-0" />
                    <div className="sheet-curl-shadow-front pointer-events-none absolute inset-0" />
                  </div>
                </div>
                {/* Back Face = New Left Page (cleanly separated in Z, revealed smoothly past 90°) */}
                <div
                  className={`sheet-face-back absolute inset-0 rounded-l-md ${theme.pageBg} shadow-2xl`}
                >
                  <div className="relative flex h-full w-full flex-col overflow-hidden rounded-l-md px-10 py-6">
                    {renderPageFace(destLeft, 'left')}
                    <div className="book-crease-left pointer-events-none absolute inset-0" />
                    <div className="sheet-curl-shadow-back pointer-events-none absolute inset-0" />
                  </div>
                </div>
              </div>
            )}

            {flipState?.direction === 'prev' && (
              <div
                onAnimationEnd={handleFlipAnimationEnd}
                className="turning-sheet-prev pointer-events-none absolute top-2.5 bottom-2.5 left-2.5 right-1/2 z-20"
              >
                {/* Front Face = Old Left Page */}
                <div
                  className={`sheet-face-front absolute inset-0 rounded-l-md ${theme.pageBg} shadow-2xl`}
                >
                  <div className="relative flex h-full w-full flex-col overflow-hidden rounded-l-md px-10 py-6">
                    {renderPageFace(curLeft, 'left')}
                    <div className="book-crease-left pointer-events-none absolute inset-0" />
                    <div className="sheet-curl-shadow-front pointer-events-none absolute inset-0" />
                  </div>
                </div>
                {/* Back Face = New Right Page */}
                <div
                  className={`sheet-face-back absolute inset-0 rounded-r-md ${theme.pageBg} shadow-2xl`}
                >
                  <div className="relative flex h-full w-full flex-col overflow-hidden rounded-r-md px-10 py-6">
                    {renderPageFace(destRight, 'right')}
                    <div className="book-crease-right pointer-events-none absolute inset-0" />
                    <div className="sheet-curl-shadow-back pointer-events-none absolute inset-0" />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Right Page Turn Button */}
        <button
          type="button"
          onClick={goNext}
          disabled={currentPage >= totalPages || Boolean(flipState)}
          className="hidden sm:flex ml-2 lg:ml-4 h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-black/30 text-[#F5EAD6] transition hover:bg-black/55 disabled:opacity-20"
          aria-label="Lật trang sau"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Bottom Scrubber */}
      <footer className="border-t border-white/10 bg-black/35 px-4 sm:px-6 py-2 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={goPrev}
              disabled={currentPage <= 1 || Boolean(flipState)}
              className="flex sm:hidden h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-white/10 disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <form
              onSubmit={handleJumpPage}
              className="flex items-center gap-1.5 text-xs"
            >
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
              disabled={currentPage >= totalPages || Boolean(flipState)}
              className="flex sm:hidden h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-white/10 disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

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
