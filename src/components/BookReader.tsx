import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PageFlip } from 'page-flip/dist/js/page-flip.module.js';
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
import {
  getBookCoverUrl,
  loadPdfDocument,
  renderPageToDataUrl,
} from '../utils/pdfEngine';
import {
  PageBlock,
  loadBookTextData,
  paginateBookText,
} from '../utils/bookPagination';
import {
  BOOKMARK_STYLES,
  DecorativeBookmark,
} from './DecorativeBookmark';
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

const THEME_VARS: Record<
  PaperTheme,
  {
    label: string;
    backdrop: string;
    pageBg: string;
    bodyColor: string;
    mutedColor: string;
    headingColor: string;
  }
> = {
  cream: {
    label: 'Kem ấm',
    backdrop: 'bg-[#231912]',
    pageBg: '#FCF8EE',
    bodyColor: '#2C221A',
    mutedColor: '#7C6A58',
    headingColor: '#3A2317',
  },
  white: {
    label: 'Trắng sáng',
    backdrop: 'bg-[#1D1E22]',
    pageBg: '#FFFFFF',
    bodyColor: '#1F2329',
    mutedColor: '#6A717C',
    headingColor: '#14171C',
  },
  sepia: {
    label: 'Giấy cổ',
    backdrop: 'bg-[#2C1E14]',
    pageBg: '#F3E5CA',
    bodyColor: '#362617',
    mutedColor: '#7A5E42',
    headingColor: '#4C2C16',
  },
  night: {
    label: 'Đèn đêm',
    backdrop: 'bg-[#0B0C14]',
    pageBg: '#171822',
    bodyColor: '#CFC9BE',
    mutedColor: '#847E90',
    headingColor: '#F3D89B',
  },
};

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildAchillesCoverSvgHtml(): string {
  return `
    <svg viewBox="0 0 320 480" style="width:100%;height:100%;display:block;" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="acBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#9C2338"/><stop offset="50%" stop-color="#851A2E"/><stop offset="100%" stop-color="#6B1224"/>
        </linearGradient>
        <pattern id="acWaves" width="48" height="24" patternUnits="userSpaceOnUse">
          <path d="M0 12 Q12 2 24 12 T48 12" fill="none" stroke="#D96B7C" stroke-width="1.2" opacity="0.45"/>
          <path d="M0 18 Q12 8 24 18 T48 18" fill="none" stroke="#E58997" stroke-width="0.9" opacity="0.35"/>
        </pattern>
        <linearGradient id="acGold" x1="0.15" y1="0.05" x2="0.85" y2="0.95">
          <stop offset="0%" stop-color="#FCE786"/><stop offset="30%" stop-color="#E7BD49"/><stop offset="65%" stop-color="#C9962B"/><stop offset="100%" stop-color="#D8AA3F"/>
        </linearGradient>
      </defs>
      <rect width="320" height="480" fill="url(#acBg)"/>
      <rect width="320" height="480" fill="url(#acWaves)"/>
      <text x="160" y="36" text-anchor="middle" fill="#F4D36A" font-size="11" font-weight="700" letter-spacing="2.2" font-family="Be Vietnam Pro,sans-serif">#1 NEW YORK TIMES BESTSELLER</text>
      <path d="M92 220 C92 200 135 198 148 228 L151 285 C151 294 169 294 169 285 L172 228 C185 198 228 200 228 220 L226 355 L94 355 Z" fill="#1C1610"/>
      <path fill-rule="evenodd" d="M160 66 C92 66 56 122 56 196 C56 266 64 342 74 378 C78 390 100 392 128 386 L132 332 C120 326 112 314 112 296 L110 264 C98 258 92 246 94 232 C96 214 114 205 132 212 C144 216 148 228 148 242 L148 282 C148 292 172 292 172 282 L172 242 C172 228 176 216 188 212 C206 205 224 214 226 232 C228 246 222 258 210 264 L208 296 C208 314 200 326 188 332 L192 386 C220 392 242 390 246 378 C256 342 264 266 264 196 C264 122 228 66 160 66 Z" fill="url(#acGold)"/>
      <text x="160" y="112" text-anchor="middle" fill="#24190C" font-size="30" font-style="italic" font-family="Cormorant Garamond,Georgia,serif">The</text>
      <text x="160" y="151" text-anchor="middle" fill="#23180B" font-size="33" font-weight="600" letter-spacing="2.2" font-family="Newsreader,Georgia,serif">SONG OF</text>
      <text x="160" y="190" text-anchor="middle" fill="#23180B" font-size="35" font-weight="600" letter-spacing="2.8" font-family="Newsreader,Georgia,serif">ACHILLES</text>
      <text x="160" y="394" text-anchor="middle" fill="#F4D36A" font-size="9.5" font-weight="600" letter-spacing="2.2" font-family="Be Vietnam Pro,sans-serif">A NOVEL · TRƯỜNG CA ACHILLES</text>
      <text x="160" y="436" text-anchor="middle" fill="#F4D36A" font-size="21" font-weight="600" letter-spacing="4" font-family="Newsreader,Georgia,serif">MADELINE MILLER</text>
    </svg>
  `;
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
  const [bookText, setBookText] = useState<BookTextData | null>(null);
  const [scannedPdfPages, setScannedPdfPages] = useState<number>(0);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [viewport, setViewport] = useState(() => ({
    w: typeof window !== 'undefined' ? window.innerWidth : 1280,
    h: typeof window !== 'undefined' ? window.innerHeight : 800,
  }));

  const isMobile = viewport.w < 860;

  const [showToc, setShowToc] = useState<boolean>(false);
  const [showBookmarkPanel, setShowBookmarkPanel] = useState<boolean>(false);
  const [selectedStyle, setSelectedStyle] = useState<BookmarkStyleId>(
    progress.bookmarkStyle || 'mystic-moon'
  );
  const [bookmarkNote, setBookmarkNote] = useState<string>('');
  const [pageInput, setPageInput] = useState<string>(String(startPage));
  const [justFinishedBanner, setJustFinishedBanner] = useState<boolean>(false);
  const [spotlight, setSpotlight] = useState<{
    x: number;
    y: number;
    active: boolean;
  }>({ x: 0, y: 0, active: false });

  const flipContainerRef = useRef<HTMLDivElement | null>(null);
  const pageFlipRef = useRef<PageFlip | null>(null);
  const pageNodesRef = useRef<HTMLElement[]>([]);
  const populatedRef = useRef<Set<number>>(new Set());
  const currentPageRef = useRef<number>(startPage);
  const prevTotalRef = useRef<number>(progress.totalPages || book.totalPages);

  useEffect(() => {
    currentPageRef.current = currentPage;
  }, [currentPage]);

  useEffect(() => {
    const onResize = () =>
      setViewport({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Compute crisp single-page dimensions for StPageFlip
  const pageDims = useMemo(() => {
    const availH = Math.max(460, Math.min(820, viewport.h - 126));
    if (isMobile) {
      const w = Math.max(300, Math.min(440, viewport.w - 24));
      return { width: Math.floor(w), height: Math.floor(availH) };
    }
    const maxSpreadW = Math.min(1240, viewport.w - 130);
    const singleW = Math.max(380, Math.floor(maxSpreadW / 2));
    return { width: singleW, height: Math.floor(availH) };
  }, [viewport, isMobile]);

  // Text column interior size (subtracting horizontal/vertical padding & header/footer)
  const textColWidth = pageDims.width - (isMobile ? 44 : 76);
  const textColHeight = pageDims.height - 92;

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
    setBookText(null);
    setScannedPdfPages(0);

    if (book.textUrl) {
      loadBookTextData(book)
        .then((data) => {
          if (!active) return;
          if (data.paragraphs.length > 0) {
            setBookText(data);
            setLoading(false);
          } else {
            return loadPdfDocument(book).then((doc) => {
              if (!active) return;
              setScannedPdfPages(doc.numPages);
              setLoading(false);
            });
          }
        })
        .catch((err) => {
          if (!active) return;
          setErrorMsg(err?.message || 'Không thể tải nội dung cuốn sách này.');
          setLoading(false);
        });
    } else {
      // Scanned image PDF or custom uploaded PDF without pre-extracted JSON
      loadBookTextData(book)
        .then(async (data) => {
          if (!active) return;
          if (data.paragraphs.length > 10) {
            setBookText(data);
            setLoading(false);
          } else {
            const doc = await loadPdfDocument(book);
            if (!active) return;
            setScannedPdfPages(doc.numPages);
            setLoading(false);
          }
        })
        .catch(async () => {
          try {
            const doc = await loadPdfDocument(book);
            if (!active) return;
            setScannedPdfPages(doc.numPages);
            setLoading(false);
          } catch (err) {
            if (!active) return;
            setErrorMsg(
              err instanceof Error
                ? err.message
                : 'Không thể tải nội dung cuốn sách này.'
            );
            setLoading(false);
          }
        });
    }

    if (book.id !== 'truong-ca-achilles') {
      if (book.coverUrl) {
        setCoverUrl(book.coverUrl);
      } else if (book.pdfUrl) {
        getBookCoverUrl(book).then((url) => {
          if (active) setCoverUrl(url);
        });
      } else {
        setCoverUrl(null);
      }
    }

    return () => {
      active = false;
    };
  }, [book]);

  // Lossless exact canvas word-wrap pagination matching StPageFlip's exact single-page size!
  const paginated = useMemo(() => {
    if (scannedPdfPages > 0) {
      return {
        pages: [] as PageBlock[][],
        totalPages: scannedPdfPages,
        toc: [{ title: 'Bìa sách', page: 1, level: 0 }],
        isScannedPdf: true,
      };
    }
    if (!bookText) return null;
    return {
      ...paginateBookText(bookText, {
        isMobile,
        fontSize,
        colWidth: textColWidth,
        colHeight: textColHeight,
      }),
      isScannedPdf: false,
    };
  }, [bookText, scannedPdfPages, isMobile, fontSize, textColWidth, textColHeight]);

  const totalPages = paginated?.totalPages || progress.totalPages || book.totalPages;
  const toc = paginated?.toc || [{ title: 'Bìa sách', page: 1, level: 0 }];

  // Preserve reading ratio when fontSize or screen size changes
  useEffect(() => {
    if (!paginated) return;
    const oldTotal = prevTotalRef.current;
    const newTotal = paginated.totalPages;
    if (oldTotal > 1 && newTotal !== oldTotal) {
      const cur = currentPageRef.current;
      const next =
        cur <= 1
          ? 1
          : Math.max(
              2,
              Math.min(
                newTotal,
                Math.round(((cur - 1) / (oldTotal - 1)) * (newTotal - 1)) + 1
              )
            );
      setCurrentPage(next);
      currentPageRef.current = next;
    }
    prevTotalRef.current = newTotal;
    onUpdateProgress((prev) => ({ ...prev, totalPages: newTotal }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paginated?.totalPages]);

  // Populate HTML for a window of pages around centerIdx (0-based) for instant 0ms rendering
  const populateWindow = useCallback(
    (centerIdx: number) => {
      if (!paginated) return;
      const nodes = pageNodesRef.current;
      const start = Math.max(0, centerIdx - 6);
      const end = Math.min(nodes.length - 1, centerIdx + 8);

      for (let idx = start; idx <= end; idx++) {
        if (populatedRef.current.has(idx)) continue;
        const el = nodes[idx];
        if (!el) continue;
        populatedRef.current.add(idx);

        const pageNum = idx + 1;

        if (paginated.isScannedPdf) {
          el.innerHTML = `<div class="stf-page-inner" style="align-items:center;justify-content:center;padding:8px;"><div style="font-size:12px;opacity:0.6;">Đang tải trang ${pageNum}...</div></div>`;
          loadPdfDocument(book)
            .then((doc) => renderPageToDataUrl(doc, pageNum, pageDims.width))
            .then((imgUrl) => {
              el.innerHTML = `<div class="stf-cover-wrap" style="background:#fff;display:flex;align-items:center;justify-content:center;"><img src="${imgUrl}" alt="Trang ${pageNum}" style="max-width:100%;max-height:100%;object-fit:contain;" /></div>`;
            })
            .catch(() => {});
          continue;
        }

        if (pageNum === 1) {
          // Page 1: Cover Page
          if (book.id === 'truong-ca-achilles') {
            el.innerHTML = `<div class="stf-cover-wrap">${buildAchillesCoverSvgHtml()}</div>`;
          } else if (coverUrl) {
            el.innerHTML = `<div class="stf-cover-wrap"><img src="${coverUrl}" alt="${escapeHtml(book.title)}" style="width:100%;height:100%;object-fit:cover;object-position:top;" /></div>`;
          } else {
            el.innerHTML = `<div class="stf-cover-wrap stf-cover-fallback" style="background:${book.spineColor};color:${book.spineTextColor}">
              <div style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;opacity:0.75">${escapeHtml(book.genre)}</div>
              <div style="font-family:'Cormorant Garamond',serif;font-size:34px;font-weight:700;line-height:1.15">${escapeHtml(book.title)}</div>
              <div style="font-family:'Newsreader',serif;font-style:italic;opacity:0.85">${escapeHtml(book.author)}</div>
            </div>`;
          }
          continue;
        }

        const blocks: PageBlock[] = paginated.pages[idx - 1] || [];
        const isLeft = idx % 2 === 1;
        const runningHeader = isLeft
          ? escapeHtml(book.title)
          : escapeHtml(book.author);

        const bodyHtml = blocks
          .map((b) => {
            if (b.isHeading) {
              return `<h3 class="stf-heading" style="font-size:${Math.round(fontSize * 1.42)}px">${escapeHtml(b.text)}</h3>`;
            }
            return `<p class="stf-para ${b.continued ? 'stf-continued' : ''}">${escapeHtml(b.text)}</p>`;
          })
          .join('');

        el.innerHTML = `
          <div class="stf-page-inner ${isMobile ? 'stf-mobile-pad' : 'stf-desktop-pad'}">
            <div class="stf-running-header">${runningHeader}</div>
            <div class="stf-body" style="font-size:${fontSize}px">${bodyHtml}</div>
            <div class="stf-page-num">${pageNum}</div>
          </div>
        `;
      }
    },
    [paginated, book, coverUrl, fontSize, isMobile]
  );

  // Mount / Re-mount StPageFlip cleanly when book, fontSize, or page dimensions change
  useEffect(() => {
    const container = flipContainerRef.current;
    if (!container || !paginated) return;

    // Clean up previous instance
    if (pageFlipRef.current) {
      try {
        pageFlipRef.current.destroy();
      } catch {
        // ignore
      }
      pageFlipRef.current = null;
    }

    container.innerHTML = '';
    populatedRef.current.clear();

    const bookEl = document.createElement('div');
    bookEl.className = 'stf-book-root';
    container.appendChild(bookEl);

    const nodes: HTMLElement[] = [];
    for (let i = 0; i < paginated.totalPages; i++) {
      const pageDiv = document.createElement('div');
      pageDiv.className = i === 0 ? 'stf-page stf-hard-cover' : 'stf-page';
      if (i === 0) pageDiv.setAttribute('data-density', 'hard');
      bookEl.appendChild(pageDiv);
      nodes.push(pageDiv);
    }
    pageNodesRef.current = nodes;

    const initialIdx = Math.max(
      0,
      Math.min(paginated.totalPages - 1, currentPageRef.current - 1)
    );
    populateWindow(initialIdx);

    const pf = new PageFlip(bookEl, {
      width: pageDims.width,
      height: pageDims.height,
      size: 'fixed',
      drawShadow: true,
      maxShadowOpacity: 0.44,
      flippingTime: 820,
      usePortrait: isMobile,
      showCover: true,
      showPageCorners: true,
      useMouseEvents: true,
      swipeDistance: 25,
      clickEventForward: false,
      mobileScrollSupport: false,
      startPage: initialIdx,
    });

    pf.loadFromHTML(nodes);
    pf.on('flip', (e) => {
      const newIdx = Number(e.data) || 0;
      populateWindow(newIdx);
      setCurrentPage(newIdx + 1);
    });

    pageFlipRef.current = pf;

    return () => {
      try {
        pf.destroy();
      } catch {
        // ignore
      }
      pageFlipRef.current = null;
    };
  }, [paginated, pageDims.width, pageDims.height, isMobile, populateWindow]);

  // If coverUrl loads after initial mount, refresh page 0 cleanly
  useEffect(() => {
    if (!coverUrl || book.id === 'truong-ca-achilles') return;
    populatedRef.current.delete(0);
    populateWindow(0);
  }, [coverUrl, book.id, populateWindow]);

  // Debounced progress persistence
  useEffect(() => {
    setPageInput(String(currentPage));
    const timer = window.setTimeout(() => {
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
    }, 300);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, totalPages]);

  const goNext = useCallback(() => {
    const pf = pageFlipRef.current;
    if (!pf) return;
    populateWindow(currentPageRef.current + 1);
    pf.flipNext('bottom');
  }, [populateWindow]);

  const goPrev = useCallback(() => {
    const pf = pageFlipRef.current;
    if (!pf) return;
    populateWindow(Math.max(0, currentPageRef.current - 3));
    pf.flipPrev('bottom');
  }, [populateWindow]);

  const jumpToPage = useCallback(
    (targetPage: number) => {
      const clamped = Math.max(1, Math.min(totalPages, targetPage));
      populateWindow(clamped - 1);
      setCurrentPage(clamped);
      pageFlipRef.current?.turnToPage(clamped - 1);
    },
    [totalPages, populateWindow]
  );

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

  const theme = THEME_VARS[paperTheme];
  const activeChapter = [...toc]
    .reverse()
    .find((item) => item.page <= currentPage);

  const activeBookmark =
    progress.bookmarks.find(
      (b) => Math.abs(b.page - currentPage) <= (isMobile ? 0 : 1)
    ) ||
    (progress.bookmarkedPage &&
    Math.abs(progress.bookmarkedPage - currentPage) <= (isMobile ? 0 : 1)
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

  const handleJumpForm = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(pageInput, 10);
    if (!Number.isNaN(parsed)) {
      jumpToPage(parsed);
    }
  };

  const progressPercent = Math.round(
    (currentPage / Math.max(1, totalPages)) * 100
  );

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col ${theme.backdrop} text-[#F7F1E5] select-none`}
      style={
        {
          '--reader-bg': theme.pageBg,
          '--reader-body': theme.bodyColor,
          '--reader-muted': theme.mutedColor,
          '--reader-heading': theme.headingColor,
        } as React.CSSProperties
      }
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

      {/* Main Soft-Paper StPageFlip Reading Stage */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden px-2 py-2 sm:px-4">
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
                      jumpToPage(item.page);
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

              <input
                type="text"
                value={bookmarkNote}
                onChange={(e) => setBookmarkNote(e.target.value)}
                placeholder="Ghi chú ngắn (tuỳ chọn)..."
                className="w-full rounded-lg border border-[#D8C7AE] bg-white px-3 py-2 text-xs text-[#221A14] placeholder:text-[#A5937F] focus:border-[#8E2C5A] focus:outline-none"
              />

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
                            jumpToPage(bm.page);
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

        {/* Left Arrow */}
        <button
          type="button"
          onClick={goPrev}
          disabled={currentPage <= 1}
          className="hidden sm:flex mr-3 h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-black/30 text-[#F5EAD6] transition hover:bg-black/55 disabled:opacity-20"
          aria-label="Lật trang trước"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* STPAGEFLIP SOFT-PAPER CORNER-CURL BOOK WRAPPER */}
        {errorMsg ? (
          <div className="rounded-2xl bg-[#FAF5EC] p-8 text-center text-[#221A14] shadow-xl">
            <BookOpen className="mx-auto h-10 w-10 text-[#8E2C2C]" />
            <p className="mt-3 font-medium">{errorMsg}</p>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center gap-3 text-sm text-[#DEC9A6]">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E5B968] border-t-transparent" />
            <span className="font-serif italic">Đang mở từng trang sách...</span>
          </div>
        ) : (
          <div
            className="relative flex items-center justify-center rounded-xl bg-[#3D2518] p-2.5 shadow-[0_34px_80px_-14px_rgba(0,0,0,0.85)] ring-1 ring-white/10"
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
            {/* Bright Night-Mode Cursor Reading Spotlight */}
            {paperTheme === 'night' && spotlight.active && (
              <div
                className="pointer-events-none absolute inset-2.5 z-30 rounded-md"
                style={{
                  background: `radial-gradient(circle 240px at ${spotlight.x}px ${spotlight.y}px, rgba(255, 242, 200, 0.46) 0%, rgba(255, 218, 142, 0.22) 38%, rgba(255, 198, 110, 0.06) 64%, transparent 82%)`,
                  mixBlendMode: 'screen',
                }}
              />
            )}

            {/* Center-Spine Enchanted Bookmark (runs cleanly inside center gutter, ZERO text overlap!) */}
            {activeBookmark && currentPage > 1 && (
              <div className="pointer-events-none absolute inset-y-0 left-1/2 z-30 -translate-x-1/2 flex flex-col items-center">
                <div className="-mt-2.5 h-3 w-5 rounded-t-full border border-[#F5D680] bg-gradient-to-b from-[#FFEAA6] to-[#B88428] shadow" />
                {!isMobile && (
                  <div className="w-[3px] flex-1 bg-gradient-to-b from-[#E5BD60] via-[#C89632] to-[#E5BD60] opacity-85 shadow-[0_0_6px_rgba(0,0,0,0.45)]" />
                )}
                <div className={isMobile ? '-mt-1' : '-mt-2 translate-y-4'}>
                  <DecorativeBookmark
                    styleId={activeBookmark.style}
                    size={isMobile ? 'sm' : 'md'}
                  />
                </div>
              </div>
            )}

            {/* StPageFlip Mount Container */}
            <div ref={flipContainerRef} className="stf-host" />
          </div>
        )}

        {/* Right Arrow */}
        <button
          type="button"
          onClick={goNext}
          disabled={currentPage >= totalPages}
          className="hidden sm:flex ml-3 h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-black/30 text-[#F5EAD6] transition hover:bg-black/55 disabled:opacity-20"
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
              disabled={currentPage <= 1}
              className="flex sm:hidden h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-white/10 disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <form
              onSubmit={handleJumpForm}
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
              disabled={currentPage >= totalPages}
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
              onChange={(e) => jumpToPage(Number(e.target.value))}
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
