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
import {
  AmbientRoomEffects,
  ROOM_MOODS,
  RoomMood,
} from './components/AmbientRoomEffects';

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
  const [roomMood, setRoomMood] = useState<RoomMood>('morning');
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

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
        // fallback 1 page
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

  const isEvening = roomMood === 'evening';
  const moodBgClass =
    roomMood === 'golden'
      ? 'room-mood-golden'
      : roomMood === 'evening'
        ? 'room-mood-evening'
        : 'room-mood-morning';

  return (
    <div
      className={`${moodBgClass} relative min-h-dvh md:h-dvh md:overflow-hidden flex flex-col transition-colors duration-700`}
      onMouseMove={(e) => {
        if (window.innerWidth < 768) return;
        const x = (e.clientX / window.innerWidth - 0.5) * 2;
        const y = (e.clientY / window.innerHeight - 0.5) * 2;
        setParallax({ x, y });
      }}
    >
      {/* Living Room Sunbeams, Dust Motes & Plant Parallax */}
      <AmbientRoomEffects mood={roomMood} parallax={parallax} />

      {/* Ultra-slim Floating Reading Room Header */}
      <header
        className={`relative z-30 shrink-0 border-b backdrop-blur-md transition-colors duration-500 ${
          isEvening
            ? 'border-white/10 bg-[#1B232D]/78 text-[#EFF4F0]'
            : 'border-[#CFDDD4]/75 bg-[#F5F9F6]/80 text-[#23322B]'
        }`}
      >
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-2 px-3 sm:px-5 py-1.5">
          {/* Brand + Mood Switcher */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#4A6B5D] text-white shadow-xs">
              <Library className="h-3.5 w-3.5" />
            </div>
            <h1 className="font-display text-lg sm:text-xl font-bold leading-none">
              Tủ Sách Của Tôi
            </h1>

            {/* 3 Living Room Lighting Moods */}
            <div
              className={`hidden sm:inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 ml-1 ${
                isEvening
                  ? 'border-white/15 bg-white/5'
                  : 'border-[#D2DFD7] bg-white/70'
              }`}
              title="Đổi ánh sáng phòng đọc"
            >
              {ROOM_MOODS.map((m) => {
                const active = roomMood === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setRoomMood(m.id)}
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium transition ${
                      active
                        ? isEvening
                          ? 'bg-white/20 text-white'
                          : 'bg-[#4A6B5D] text-white'
                        : isEvening
                          ? 'text-slate-300 hover:text-white'
                          : 'text-[#556B5F] hover:text-[#23322B]'
                    }`}
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: m.dotColor }}
                    />
                    <span className="hidden lg:inline">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Center Tabs */}
          <nav
            className={`inline-flex items-center gap-1 rounded-xl border p-0.5 ${
              isEvening
                ? 'border-white/15 bg-white/5'
                : 'border-[#D4E1D9] bg-[#E8F0EB]/90'
            }`}
          >
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                activeTab === 'all'
                  ? 'bg-[#4A6B5D] text-white shadow-xs'
                  : isEvening
                    ? 'text-slate-300 hover:bg-white/10'
                    : 'text-[#4B6156] hover:bg-white/70'
              }`}
            >
              <Library className="h-3 w-3" />
              <span>Tủ sách ({allBooks.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('reading')}
              className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                activeTab === 'reading'
                  ? 'bg-[#4A6B5D] text-white shadow-xs'
                  : isEvening
                    ? 'text-slate-300 hover:bg-white/10'
                    : 'text-[#4B6156] hover:bg-white/70'
              }`}
            >
              <BookMarked className="h-3 w-3" />
              <span>Đang đọc ({readingBooks.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('finished')}
              className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                activeTab === 'finished'
                  ? 'bg-[#2C6B50] text-white shadow-xs'
                  : isEvening
                    ? 'text-slate-300 hover:bg-white/10'
                    : 'text-[#4B6156] hover:bg-white/70'
              }`}
            >
              <Award className="h-3 w-3" />
              <span>Đã đọc xong ({finishedBooks.length})</span>
            </button>
          </nav>

          {/* Compact Right Controls */}
          <div className="flex items-center gap-1.5">
            {activeTab !== 'finished' && (
              <>
                <div className="relative hidden md:block w-36 lg:w-44">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-[#7A8F83]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm sách..."
                    className={`w-full rounded-lg border py-1 pl-7 pr-2 text-[11px] focus:outline-none ${
                      isEvening
                        ? 'border-white/15 bg-white/10 text-white placeholder:text-slate-400 focus:border-[#7CB898]'
                        : 'border-[#D4E1D9] bg-white/85 text-[#23322B] placeholder:text-[#8A9D92] focus:border-[#4A6B5D]'
                    }`}
                  />
                </div>

                {/* Cover vs Spine Toggle */}
                <div
                  className={`inline-flex rounded-lg border p-0.5 ${
                    isEvening
                      ? 'border-white/15 bg-white/10'
                      : 'border-[#D4E1D9] bg-white/85'
                  }`}
                >
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
                        : isEvening
                          ? 'text-slate-300 hover:text-white'
                          : 'text-[#556B5F] hover:text-[#23322B]'
                    }`}
                    title="Hiển thị bìa sách"
                  >
                    <LayoutGrid className="h-3 w-3" />
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
                        : isEvening
                          ? 'text-slate-300 hover:text-white'
                          : 'text-[#556B5F] hover:text-[#23322B]'
                    }`}
                    title="Hiển thị gáy sách xếp kệ"
                  >
                    <Columns3 className="h-3 w-3" />
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
                  className={`hidden md:inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-medium transition ${
                    prefs.hoverPreviewEnabled
                      ? isEvening
                        ? 'border-emerald-400/40 bg-emerald-400/15 text-emerald-200'
                        : 'border-[#4A6B5D]/40 bg-[#4A6B5D]/12 text-[#2E5243]'
                      : isEvening
                        ? 'border-white/15 bg-white/5 text-slate-400'
                        : 'border-[#D4E1D9] bg-white/80 text-[#687D72]'
                  }`}
                  title="Xem nhanh sách khi rê chuột vào bìa hoặc gáy"
                >
                  <Eye className="h-3 w-3" />
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
              className="inline-flex items-center gap-1 rounded-lg bg-[#4A6B5D] px-2.5 py-1 text-[11px] font-medium text-white shadow-xs transition hover:bg-[#3A574B] disabled:opacity-60"
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">
                {uploading ? 'Đang thêm...' : 'Thêm PDF'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Viewport-Fitted Reading Room Stage */}
      <main className="relative z-10 mx-auto flex w-full max-w-[1320px] flex-1 min-h-0 flex-col px-2 sm:px-6 lg:px-10 pt-2.5 pb-0">
        {/* Compact floating Resume Reading Pill (only if reading in progress) */}
        {continueBook && activeTab !== 'finished' && (
          <div
            className={`mb-2 flex shrink-0 flex-wrap items-center justify-between gap-2 rounded-xl border px-3.5 py-1.5 backdrop-blur-sm ${
              isEvening
                ? 'border-white/15 bg-white/10 text-slate-100'
                : 'border-[#CFE0D6] bg-white/75 text-[#31443B]'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="h-6 w-4 shrink-0 flex items-center justify-center">
                <DecorativeBookmark
                  styleId={continueBook.progress.bookmarkStyle}
                  size="sm"
                />
              </div>
              <div className="truncate text-xs">
                <Sparkles className="mr-1 inline h-3 w-3 text-[#4A6B5D]" />
                Đọc tiếp{' '}
                <strong className="font-display text-sm">
                  {continueBook.book.title}
                </strong>{' '}
                <span className="opacity-75">
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
              className="inline-flex items-center gap-1 rounded-lg bg-[#4A6B5D] px-2.5 py-1 text-[11px] font-semibold text-white transition hover:bg-[#395549]"
            >
              <BookOpen className="h-3 w-3" />
              Mở đọc tiếp
            </button>
          </div>
        )}

        {/* Bookcase fills the exact remaining height inside the screen frame */}
        <div className="flex flex-1 min-h-0 flex-col">
          {activeTab === 'finished' ? (
            <div className="flex-1 overflow-y-auto pb-8 pr-1">
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
              roomMood={roomMood}
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
      <div
        className={`${
          isEvening ? 'oak-floor-evening border-[#2C2118]' : 'oak-floor border-[#C6B194]'
        } relative z-10 h-5 sm:h-7 shrink-0 w-full border-t transition-colors duration-700`}
      />

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
