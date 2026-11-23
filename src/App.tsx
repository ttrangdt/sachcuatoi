import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Award,
  BookMarked,
  BookOpen,
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

  // Full open book reader
  const [activeBook, setActiveBook] = useState<{
    book: BookItem;
    startPage?: number;
  } | null>(null);

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

  const handleStartReading = (book: BookItem, startPage?: number) => {
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
        // fallback
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
      className={`${moodBgClass} relative h-dvh overflow-hidden flex flex-col transition-all duration-1000`}
      onMouseMove={(e) => {
        if (window.innerWidth < 768) return;
        const x = (e.clientX / window.innerWidth - 0.5) * 2;
        const y = (e.clientY / window.innerHeight - 0.5) * 2;
        setParallax({ x, y });
      }}
    >
      {/* Dreamy Fairy-Tale Reading Room Background & Mood Effects */}
      <AmbientRoomEffects mood={roomMood} parallax={parallax} />

      {/* Slim Floating Top Bar */}
      <header
        className={`relative z-30 shrink-0 border-b backdrop-blur-md transition-colors duration-700 ${
          isEvening
            ? 'border-white/10 bg-[#15152C]/78 text-[#F2ECFA]'
            : roomMood === 'golden'
              ? 'border-[#E6C5A8]/70 bg-[#FDF3E8]/78 text-[#36241B]'
              : 'border-[#C9DFD8]/70 bg-[#F4FAF8]/78 text-[#22342E]'
        }`}
      >
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-2 px-3 sm:px-5 py-1.5">
          {/* Brand + Vivid Mood Switcher */}
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#4A314D] text-[#F9DF96] shadow-xs">
              <Library className="h-3.5 w-3.5" />
            </div>
            <h1 className="font-display text-lg sm:text-xl font-bold leading-none">
              Tủ Sách Của Tôi
            </h1>

            {/* 3 Vivid Fairy-Tale Room Moods */}
            <div
              className={`inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 ml-1 ${
                isEvening
                  ? 'border-white/15 bg-white/8'
                  : 'border-black/10 bg-white/70'
              }`}
              title="Đổi không gian ánh sáng phòng đọc"
            >
              {ROOM_MOODS.map((m) => {
                const active = roomMood === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setRoomMood(m.id)}
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold transition ${
                      active
                        ? isEvening
                          ? 'bg-[#6F58C9] text-white shadow-xs'
                          : roomMood === 'golden'
                            ? 'bg-[#C96B36] text-white shadow-xs'
                            : 'bg-[#3B6B5C] text-white shadow-xs'
                        : isEvening
                          ? 'text-slate-300 hover:text-white'
                          : 'text-[#55505C] hover:text-[#1D1B22]'
                    }`}
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: m.dotColor }}
                    />
                    <span className="hidden sm:inline">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Center Tabs */}
          <nav
            className={`inline-flex items-center gap-1 rounded-xl border p-0.5 ${
              isEvening
                ? 'border-white/15 bg-white/8'
                : 'border-black/10 bg-white/60'
            }`}
          >
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                activeTab === 'all'
                  ? 'bg-[#4A314D] text-white shadow-xs'
                  : isEvening
                    ? 'text-slate-300 hover:bg-white/10'
                    : 'text-[#4D4754] hover:bg-white/80'
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
                  ? 'bg-[#4A314D] text-white shadow-xs'
                  : isEvening
                    ? 'text-slate-300 hover:bg-white/10'
                    : 'text-[#4D4754] hover:bg-white/80'
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
                    : 'text-[#4D4754] hover:bg-white/80'
              }`}
            >
              <Award className="h-3 w-3" />
              <span>Đã đọc xong ({finishedBooks.length})</span>
            </button>
          </nav>

          {/* Right Tools: Search + Upload PDF */}
          <div className="flex items-center gap-1.5">
            {activeTab !== 'finished' && (
              <div className="relative hidden md:block w-36 lg:w-44">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 opacity-60" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm sách..."
                  className={`w-full rounded-lg border py-1 pl-7 pr-2 text-[11px] focus:outline-none ${
                    isEvening
                      ? 'border-white/15 bg-white/10 text-white placeholder:text-slate-400'
                      : 'border-black/10 bg-white/85 text-[#232026] placeholder:text-[#847E8B]'
                  }`}
                />
              </div>
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
              className="inline-flex items-center gap-1 rounded-lg bg-[#4A314D] px-2.5 py-1 text-[11px] font-medium text-[#FDF6E9] shadow-xs transition hover:bg-[#5E3E62] disabled:opacity-60"
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">
                {uploading ? 'Đang thêm...' : 'Thêm PDF'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Viewport-Fitted 3-Bookcase Room Stage */}
      <main className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-1 min-h-0 flex-col px-1 sm:px-4 pt-2 pb-0">
        {continueBook && activeTab !== 'finished' && (
          <div
            className={`mx-auto mb-1.5 flex w-full max-w-2xl shrink-0 items-center justify-between gap-2 rounded-full border px-3.5 py-1 backdrop-blur-md ${
              isEvening
                ? 'border-white/15 bg-white/10 text-slate-100'
                : 'border-black/10 bg-white/75 text-[#302836]'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="h-6 w-4 shrink-0 flex items-center justify-center">
                <DecorativeBookmark
                  styleId={continueBook.progress.bookmarkStyle}
                  size="sm"
                />
              </div>
              <div className="truncate text-[11px]">
                <Sparkles className="mr-1 inline h-3 w-3 text-[#C98B44]" />
                Đọc tiếp{' '}
                <strong className="font-display text-sm">
                  {continueBook.book.title}
                </strong>{' '}
                <span className="opacity-75">
                  — Trang{' '}
                  {continueBook.progress.bookmarkedPage ||
                    continueBook.progress.currentPage}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                handleStartReading(
                  continueBook.book,
                  continueBook.progress.bookmarkedPage ||
                    continueBook.progress.currentPage
                )
              }
              className="inline-flex items-center gap-1 rounded-full bg-[#4A314D] px-2.5 py-1 text-[10px] font-semibold text-white transition hover:bg-[#5F3F63]"
            >
              <BookOpen className="h-3 w-3" />
              Đọc tiếp
            </button>
          </div>
        )}

        <div className="flex flex-1 min-h-0 flex-col">
          {activeTab === 'finished' ? (
            <div className="mx-auto w-full max-w-5xl flex-1 overflow-y-auto px-3 pb-8 pt-2">
              <FinishedArchive
                books={finishedBooks}
                progressMap={progressMap}
                onReadAgain={(book) => handleStartReading(book, 1)}
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
              roomMood={roomMood}
              onOpenBook={handleStartReading}
              onDeleteCustomBook={handleDeleteCustomBook}
              onAddBookClick={() => fileInputRef.current?.click()}
            />
          )}
        </div>
      </main>

      {/* Dark Walnut Floorboard Base */}
      <div
        className={`${
          isEvening
            ? 'room-floor-evening border-[#160F0B]'
            : 'room-floor-day border-[#5B3B25]'
        } relative z-10 h-5 sm:h-7 shrink-0 w-full border-t transition-colors duration-700`}
      />

      {/* Full Realistic Reflow Book Reader */}
      {activeBook && (
        <BookReader
          book={activeBook.book}
          progress={getOrCreateProgress(progressMap, activeBook.book)}
          paperTheme={prefs.paperTheme}
          fontSize={prefs.fontSize}
          onChangeFontSize={(fontSize) =>
            setPrefs((p) => ({ ...p, fontSize }))
          }
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
