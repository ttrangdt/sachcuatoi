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
  { bg: '#4A1F24', accent: '#C99B63', text: '#F7EFE6' },
  { bg: '#273549', accent: '#D5B278', text: '#F2EDE4' },
  { bg: '#4E3B2B', accent: '#E0B46A', text: '#FAF2E6' },
  { bg: '#3B2D44', accent: '#D6A96C', text: '#F6EEF8' },
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

  // Active reader state
  const [activeBook, setActiveBook] = useState<{
    book: BookItem;
    startPage?: number;
  } | null>(null);

  // Hover preview state (desktop)
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

      // Probe page count
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

  // Filtered lists
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

  // Most recently read in-progress book for "Tiếp tục đọc" banner
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
    <div className="paper-grain min-h-screen flex flex-col">
      {/* Top Literary Header */}
      <header className="sticky top-0 z-30 border-b border-[#DFD2BE] bg-[#F7F2E8]/92 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#3A2317] text-[#E9C47C] shadow-sm">
              <Library className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold leading-none tracking-tight text-[#221A14]">
                Tủ Sách Của Tôi
              </h1>
              <p className="mt-0.5 text-[11px] sm:text-xs text-[#786554]">
                Không gian lưu trữ & đọc sách cá nhân
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
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
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#3A2317] px-3.5 py-2 text-xs font-medium text-[#F8F2E7] shadow-sm transition hover:bg-[#52301E] disabled:opacity-60"
            >
              <Plus className="h-4 w-4" />
              <span>{uploading ? 'Đang thêm...' : 'Thêm sách PDF'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Quick Resume Reading Banner (if a book is bookmarked or in progress) */}
        {continueBook && (
          <section className="relative overflow-hidden rounded-2xl border border-[#DFD0B9] bg-gradient-to-r from-[#FAF4E8] via-[#F6ECDC] to-[#F2E5CF] px-5 py-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="hidden sm:flex h-12 w-10 items-center justify-center">
                  <DecorativeBookmark
                    styleId={continueBook.progress.bookmarkStyle}
                    size="sm"
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#8E2C2C]">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Tiếp tục hành trình đọc</span>
                  </div>
                  <p className="mt-0.5 truncate font-display text-xl sm:text-2xl font-bold text-[#221A14]">
                    {continueBook.book.title}
                  </p>
                  <p className="text-xs text-[#6B5B4E]">
                    {continueBook.progress.bookmarkedPage
                      ? `Đang đánh dấu tại trang ${continueBook.progress.bookmarkedPage} / ${continueBook.progress.totalPages}`
                      : `Đang đọc dở trang ${continueBook.progress.currentPage} / ${continueBook.progress.totalPages}`}
                  </p>
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
                className="inline-flex items-center gap-2 rounded-xl bg-[#8E2C2C] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#732121]"
              >
                <BookOpen className="h-4 w-4" />
                Đọc tiếp ngay
              </button>
            </div>
          </section>
        )}

        {/* Navigation Tabs + Shelf Controls */}
        <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Tabs */}
          <div className="inline-flex flex-wrap items-center gap-1.5 rounded-xl border border-[#DFD2BE] bg-[#EFE6D7] p-1">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition ${
                activeTab === 'all'
                  ? 'bg-[#3A2317] text-[#F7F1E5] shadow-sm'
                  : 'text-[#5A483A] hover:bg-[#E5D7C2]'
              }`}
            >
              <Library className="h-3.5 w-3.5" />
              Tủ sách ({allBooks.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('reading')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition ${
                activeTab === 'reading'
                  ? 'bg-[#3A2317] text-[#F7F1E5] shadow-sm'
                  : 'text-[#5A483A] hover:bg-[#E5D7C2]'
              }`}
            >
              <BookMarked className="h-3.5 w-3.5" />
              Đang đọc ({readingBooks.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('finished')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition ${
                activeTab === 'finished'
                  ? 'bg-[#1F4E3D] text-[#F0FAF4] shadow-sm'
                  : 'text-[#5A483A] hover:bg-[#E5D7C2]'
              }`}
            >
              <Award className="h-3.5 w-3.5" />
              Đã đọc xong ({finishedBooks.length})
            </button>
          </div>

          {/* Search & Shelf View Controls */}
          {activeTab !== 'finished' && (
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 sm:flex-none sm:w-56">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#8C7762]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm tên sách, tác giả..."
                  className="w-full rounded-xl border border-[#DDD0BC] bg-[#FCF8F1] py-2 pl-8.5 pr-3 text-xs text-[#221A14] placeholder:text-[#9D8A76] focus:border-[#7C4F33] focus:outline-none"
                />
              </div>

              {/* Cover vs Spine Toggle */}
              <div className="inline-flex rounded-xl border border-[#DDD0BC] bg-[#FCF8F1] p-0.5">
                <button
                  type="button"
                  onClick={() =>
                    setPrefs((p) => ({ ...p, shelfView: 'cover' as ShelfViewMode }))
                  }
                  className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                    prefs.shelfView === 'cover'
                      ? 'bg-[#3A2317] text-[#F7F1E5]'
                      : 'text-[#6B5B4E] hover:text-[#221A14]'
                  }`}
                  title="Hiển thị bìa sách"
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Bìa sách</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setPrefs((p) => ({ ...p, shelfView: 'spine' as ShelfViewMode }))
                  }
                  className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                    prefs.shelfView === 'spine'
                      ? 'bg-[#3A2317] text-[#F7F1E5]'
                      : 'text-[#6B5B4E] hover:text-[#221A14]'
                  }`}
                  title="Hiển thị gáy sách xếp kệ"
                >
                  <Columns3 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Gáy sách</span>
                </button>
              </div>

              {/* Hover Preview Toggle (PC) */}
              <button
                type="button"
                onClick={() =>
                  setPrefs((p) => ({
                    ...p,
                    hoverPreviewEnabled: !p.hoverPreviewEnabled,
                  }))
                }
                className={`hidden md:inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition ${
                  prefs.hoverPreviewEnabled
                    ? 'border-[#8E2C2C]/40 bg-[#8E2C2C]/10 text-[#7A2323]'
                    : 'border-[#DDD0BC] bg-[#FCF8F1] text-[#6B5B4E]'
                }`}
                title="Bật/tắt xem nhanh sách khi rê chuột vào bìa hoặc gáy sách"
              >
                <Eye className="h-3.5 w-3.5" />
                <span>Xem khi rê chuột</span>
              </button>
            </div>
          )}
        </section>

        {/* Active View: Bookshelf or Finished Archive */}
        {activeTab === 'finished' ? (
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
          />
        )}
      </main>

      {/* Subtle Footer */}
      <footer className="border-t border-[#E4D8C5] py-4 text-center text-xs text-[#8A7662]">
        Tủ Sách Của Tôi · Dữ liệu tiến độ, thẻ đánh dấu và sách đã đọc xong được lưu tự động trên trình duyệt của bạn.
      </footer>

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
