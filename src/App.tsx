import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Award,
  BookMarked,
  BookOpen,
  Columns3,
  Eye,
  LayoutGrid,
  Library,
  Plus,
  Search,
  Sparkles,
} from 'lucide-react';
import { DEFAULT_BOOKS } from './data/defaultBooks';
import {
  BookItem,
  BookProgress,
  LibraryTab,
  PaperTheme,
  ShelfViewMode,
} from './types/book';
import {
  deleteCustomPdfBlob,
  getOrCreateProgress,
  loadAllProgress,
  loadCustomBooks,
  loadPrefs,
  saveAllProgress,
  saveCustomBooks,
  saveCustomPdfBlob,
  savePrefs,
} from './utils/storage';
import { loadPdfDocument } from './utils/pdfEngine';
import { Bookshelf } from './components/Bookshelf';
import { BookHoverPreview } from './components/BookHoverPreview';
import { BookReader } from './components/BookReader';
import { FinishedArchive } from './components/FinishedArchive';
import { DecorativeBookmark } from './components/DecorativeBookmark';

const SPINE_PALETTE = [
  { bg: '#2B423D', accent: '#D4A857', text: '#F5EAD6' },
  { bg: '#851A2E', accent: '#F4D36A', text: '#F7DC88' },
  { bg: '#1E2A38', accent: '#C5D1DD', text: '#F0F4F8' },
  { bg: '#4E5D4E', accent: '#E2D4B7', text: '#F7F5EE' },
  { bg: '#5B4636', accent: '#E0C08D', text: '#FAF4EA' },
];

export default function App() {
  const [customBooks, setCustomBooks] = useState<BookItem[]>(() =>
    loadCustomBooks()
  );
  const [progressMap, setProgressMap] = useState<Record<string, BookProgress>>(
    () => loadAllProgress()
  );
  const [prefs, setPrefs] = useState(() => loadPrefs());
  const [activeTab, setActiveTab] = useState<LibraryTab>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [activeBook, setActiveBook] = useState<{
    book: BookItem;
    startPage?: number;
  } | null>(null);

  const [hoveredBook, setHoveredBook] = useState<BookItem | null>(null);
  const hoverEnterTimer = useRef<number | null>(null);
  const hoverLeaveTimer = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  const allBooks = useMemo(
    () => [...DEFAULT_BOOKS, ...customBooks],
    [customBooks]
  );

  useEffect(() => {
    saveAllProgress(progressMap);
  }, [progressMap]);

  useEffect(() => {
    savePrefs(prefs);
  }, [prefs]);

  useEffect(() => {
    saveCustomBooks(customBooks);
  }, [customBooks]);

  const updateBookProgress = (
    book: BookItem,
    updater: (prev: BookProgress) => BookProgress
  ) => {
    setProgressMap((prevMap) => {
      const current = getOrCreateProgress(prevMap, book);
      const updated = updater(current);
      return { ...prevMap, [book.id]: updated };
    });
  };

  const clearHoverTimers = () => {
    if (hoverEnterTimer.current) {
      window.clearTimeout(hoverEnterTimer.current);
      hoverEnterTimer.current = null;
    }
    if (hoverLeaveTimer.current) {
      window.clearTimeout(hoverLeaveTimer.current);
      hoverLeaveTimer.current = null;
    }
  };

  const handleHoverBook = (book: BookItem) => {
    if (!prefs.hoverPreviewEnabled || activeBook) return;
    if (window.innerWidth < 768) return;
    if (hoverLeaveTimer.current) {
      window.clearTimeout(hoverLeaveTimer.current);
      hoverLeaveTimer.current = null;
    }
    if (hoveredBook?.id === book.id) return;
    if (hoverEnterTimer.current) window.clearTimeout(hoverEnterTimer.current);
    hoverEnterTimer.current = window.setTimeout(() => {
      setHoveredBook(book);
    }, 220);
  };

  const handleLeaveBookOrPreview = () => {
    if (hoverEnterTimer.current) {
      window.clearTimeout(hoverEnterTimer.current);
      hoverEnterTimer.current = null;
    }
    hoverLeaveTimer.current = window.setTimeout(() => {
      setHoveredBook(null);
    }, 340);
  };

  const handleOpenBook = (book: BookItem, startPage?: number) => {
    clearHoverTimers();
    setHoveredBook(null);
    setActiveBook({ book, startPage });
  };

  const handleUploadPdf = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const id = `custom-${Date.now()}`;
      const cleanTitle = file.name.replace(/\.pdf$/i, '').replace(/[-_]+/g, ' ');
      const palette = SPINE_PALETTE[allBooks.length % SPINE_PALETTE.length];

      await saveCustomPdfBlob(id, arrayBuffer);

      const newBook: BookItem = {
        id,
        title: cleanTitle,
        author: 'Sách cá nhân',
        genre: 'Tài liệu PDF',
        description: `Tệp sách được thêm từ thiết bị của bạn (${file.name}).`,
        isCustom: true,
        spineColor: palette.bg,
        spineAccent: palette.accent,
        spineTextColor: palette.text,
        totalPages: 1,
        addedAt: Date.now(),
      };

      try {
        const doc = await loadPdfDocument(newBook);
        newBook.totalPages = doc.numPages;
      } catch {
        // fallback 1 page until opened
      }

      setCustomBooks((prev) => [...prev, newBook]);
      setActiveTab('all');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteCustomBook = async (bookId: string) => {
    await deleteCustomPdfBlob(bookId);
    setCustomBooks((prev) => prev.filter((b) => b.id !== bookId));
    setProgressMap((prev) => {
      const copy = { ...prev };
      delete copy[bookId];
      return copy;
    });
  };

  const finishedBooks = useMemo(
    () => allBooks.filter((b) => progressMap[b.id]?.isFinished),
    [allBooks, progressMap]
  );

  const readingBooks = useMemo(
    () =>
      allBooks.filter((b) => {
        const p = progressMap[b.id];
        return p && !p.isFinished && (p.bookmarkedPage || p.currentPage > 1);
      }),
    [allBooks, progressMap]
  );

  const visibleShelfBooks = useMemo(() => {
    const base = activeTab === 'reading' ? readingBooks : allBooks;
    const q = searchQuery.trim().toLowerCase();
    if (!q) return base;
    return base.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.genre.toLowerCase().includes(q)
    );
  }, [activeTab, allBooks, readingBooks, searchQuery]);

  const continueBook = useMemo(() => {
    const candidates = readingBooks
      .map((book) => ({ book, progress: progressMap[book.id] }))
      .filter((x) => x.progress?.lastReadAt)
      .sort(
        (a, b) => (b.progress.lastReadAt || 0) - (a.progress.lastReadAt || 0)
      );
    return candidates[0] || null;
  }, [readingBooks, progressMap]);

  return (
    <div className="reading-room-bg relative min-h-screen flex flex-col overflow-x-hidden">
      {/* Ambient Sunlit Window Rays across the home reading room wall */}
      <div className="sunlight-rays pointer-events-none fixed inset-0 z-0" />

      {/* Soft Potted Fiddle-Leaf / Monstera Silhouette in left room corner (Desktop) */}
      <svg
        viewBox="0 0 180 420"
        className="pointer-events-none fixed bottom-10 left-0 z-0 hidden xl:block h-[380px] w-[150px] opacity-40"
        aria-hidden="true"
      >
        <g fill="#6E9979">
          <ellipse cx="42" cy="180" rx="34" ry="18" transform="rotate(-32 42 180)" />
          <ellipse cx="82" cy="140" rx="38" ry="20" transform="rotate(-14 82 140)" />
          <ellipse cx="36" cy="240" rx="32" ry="17" transform="rotate(18 36 240)" />
          <ellipse cx="92" cy="215" rx="36" ry="18" transform="rotate(24 92 215)" />
          <ellipse cx="64" cy="96" rx="28" ry="16" transform="rotate(-48 64 96)" />
        </g>
        <path
          d="M52 330 Q54 240 62 120"
          fill="none"
          stroke="#4F7459"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path d="M22 330 H88 L80 416 H30 Z" fill="#C9B093" />
      </svg>

      {/* Compact, Airy Floating Top Control Bar so the Bookcase dominates the screen */}
      <header className="sticky top-0 z-30 border-b border-[#CFDDD4]/80 bg-[#F4F8F5]/82 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-2.5 px-3 sm:px-6 py-2">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#4A6B5D] text-[#F4F8F5] shadow-sm">
              <Library className="h-4 w-4" />
            </div>
            <h1 className="font-display text-xl sm:text-2xl font-bold leading-none text-[#23322B]">
              Tủ Sách Của Tôi
            </h1>
          </div>

          {/* Center Tabs */}
          <nav className="inline-flex items-center gap-1 rounded-xl border border-[#D4E1D9] bg-[#E8F0EB]/90 p-0.5">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 sm:px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === 'all'
                  ? 'bg-[#4A6B5D] text-white shadow-sm'
                  : 'text-[#4B6156] hover:bg-white/70'
              }`}
            >
              <Library className="h-3.5 w-3.5" />
              <span>Tủ sách ({allBooks.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('reading')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 sm:px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === 'reading'
                  ? 'bg-[#4A6B5D] text-white shadow-sm'
                  : 'text-[#4B6156] hover:bg-white/70'
              }`}
            >
              <BookMarked className="h-3.5 w-3.5" />
              <span>Đang đọc ({readingBooks.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('finished')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 sm:px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === 'finished'
                  ? 'bg-[#2C6B50] text-white shadow-sm'
                  : 'text-[#4B6156] hover:bg-white/70'
              }`}
            >
              <Award className="h-3.5 w-3.5" />
              <span>Đã đọc xong ({finishedBooks.length})</span>
            </button>
          </nav>

          {/* Compact Right Tools */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {activeTab !== 'finished' && (
              <>
                <div className="relative hidden md:block w-44">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#7A8F83]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm sách..."
                    className="w-full rounded-lg border border-[#D4E1D9] bg-white/85 py-1.5 pl-8 pr-2.5 text-xs text-[#23322B] placeholder:text-[#8A9D92] focus:border-[#4A6B5D] focus:outline-none"
                  />
                </div>

                {/* Cover vs Spine Toggle */}
                <div className="inline-flex rounded-lg border border-[#D4E1D9] bg-white/85 p-0.5">
                  <button
                    type="button"
                    onClick={() =>
                      setPrefs((p) => ({
                        ...p,
                        shelfView: 'cover' as ShelfViewMode,
                      }))
                    }
                    className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition ${
                      prefs.shelfView === 'cover'
                        ? 'bg-[#4A6B5D] text-white'
                        : 'text-[#556B5F] hover:text-[#23322B]'
                    }`}
                    title="Hiển thị bìa sách"
                  >
                    <LayoutGrid className="h-3.5 w-3.5" />
                    <span className="hidden lg:inline">Bìa</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setPrefs((p) => ({
                        ...p,
                        shelfView: 'spine' as ShelfViewMode,
                      }))
                    }
                    className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition ${
                      prefs.shelfView === 'spine'
                        ? 'bg-[#4A6B5D] text-white'
                        : 'text-[#556B5F] hover:text-[#23322B]'
                    }`}
                    title="Hiển thị gáy sách xếp kệ"
                  >
                    <Columns3 className="h-3.5 w-3.5" />
                    <span className="hidden lg:inline">Gáy</span>
                  </button>
                </div>

                {/* Hover Preview Toggle */}
                <button
                  type="button"
                  onClick={() =>
                    setPrefs((p) => ({
                      ...p,
                      hoverPreviewEnabled: !p.hoverPreviewEnabled,
                    }))
                  }
                  className={`hidden md:inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition ${
                    prefs.hoverPreviewEnabled
                      ? 'border-[#4A6B5D]/40 bg-[#4A6B5D]/12 text-[#2E5243]'
                      : 'border-[#D4E1D9] bg-white/80 text-[#687D72]'
                  }`}
                  title="Xem nhanh sách khi rê chuột vào bìa hoặc gáy"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span className="hidden xl:inline">Rê chuột xem</span>
                </button>
              </>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={handleUploadPdf}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-1 rounded-lg bg-[#4A6B5D] px-2.5 sm:px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-[#3A574B] disabled:opacity-60"
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">
                {uploading ? 'Đang thêm...' : 'Thêm PDF'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Reading Room Stage — Bookcase occupies ~88-92% of the viewport */}
      <main className="relative z-10 mx-auto flex w-full max-w-[1380px] flex-1 flex-col px-2 sm:px-6 lg:px-10 pt-3 sm:pt-4 pb-0">
        {/* Compact Resume Pill if reading in progress */}
        {continueBook && activeTab !== 'finished' && (
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#CFE0D6] bg-white/75 px-4 py-2 backdrop-blur-sm shadow-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-7 w-5 shrink-0 flex items-center justify-center">
                <DecorativeBookmark
                  styleId={continueBook.progress.bookmarkStyle}
                  size="sm"
                />
              </div>
              <div className="truncate text-xs text-[#31443B]">
                <Sparkles className="mr-1 inline h-3.5 w-3.5 text-[#4A6B5D]" />
                Đọc tiếp{' '}
                <strong className="font-display text-base text-[#1E2C25]">
                  {continueBook.book.title}
                </strong>{' '}
                <span className="text-[#62786C]">
                  — Trang{' '}
                  {continueBook.progress.bookmarkedPage ||
                    continueBook.progress.currentPage}{' '}
                  / {continueBook.progress.totalPages}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                handleOpenBook(
                  continueBook.book,
                  continueBook.progress.bookmarkedPage ||
                    continueBook.progress.currentPage
                )
              }
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#4A6B5D] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#395549]"
            >
              <BookOpen className="h-3.5 w-3.5" />
              Mở đọc tiếp
            </button>
          </div>
        )}

        {/* Dominant Bookcase or Finished Archive */}
        <div className="flex-1 flex flex-col justify-end">
          {activeTab === 'finished' ? (
            <div className="pb-10">
              <FinishedArchive
                books={finishedBooks}
                progressMap={progressMap}
                onReadAgain={(book) => handleOpenBook(book, 1)}
                onUnmarkFinished={(bookId) => {
                  const target = allBooks.find((b) => b.id === bookId);
                  if (!target) return;
                  updateBookProgress(target, (prev) => ({
                    ...prev,
                    isFinished: false,
                    finishedAt: null,
                  }));
                }}
              />
            </div>
          ) : (
            <Bookshelf
              books={visibleShelfBooks}
              progressMap={progressMap}
              viewMode={prefs.shelfView}
              hoverPreviewEnabled={prefs.hoverPreviewEnabled}
              onOpenBook={(book) => handleOpenBook(book)}
              onHoverBook={handleHoverBook}
              onLeaveBook={handleLeaveBookOrPreview}
              onDeleteCustomBook={handleDeleteCustomBook}
              onAddBookClick={() => fileInputRef.current?.click()}
            />
          )}
        </div>
      </main>

      {/* Pale Oak Home Floorboard Base under the standing bookcase */}
      <div className="oak-floor relative z-10 h-7 sm:h-10 w-full border-t border-[#C6B194]" />

      {/* Desktop Hover Live Open-Book Preview */}
      {hoveredBook && !activeBook && (
        <BookHoverPreview
          book={hoveredBook}
          progress={getOrCreateProgress(progressMap, hoveredBook)}
          onOpenFullReader={(book, page) => handleOpenBook(book, page)}
          onClose={() => setHoveredBook(null)}
          onMouseEnterPreview={clearHoverTimers}
          onMouseLeavePreview={handleLeaveBookOrPreview}
        />
      )}

      {/* Full Realistic Book Reader */}
      {activeBook && (
        <BookReader
          book={activeBook.book}
          progress={getOrCreateProgress(progressMap, activeBook.book)}
          paperTheme={prefs.paperTheme}
          onChangePaperTheme={(paperTheme: PaperTheme) =>
            setPrefs((p) => ({ ...p, paperTheme }))
          }
          onUpdateProgress={(updater) =>
            updateBookProgress(activeBook.book, updater)
          }
          onClose={() => setActiveBook(null)}
          initialPage={activeBook.startPage}
        />
      )}
    </div>
  );
}
