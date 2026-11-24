import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BookOpen, Feather, Plus, X } from 'lucide-react';
import { DEFAULT_BOOKS } from './data/defaultBooks';
import { BookItem, BookProgress, PaperTheme } from './types/book';
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
import {
  AmbientRoomEffects,
  PullChainSwitch,
  RoomMood,
  getLocalTimeMood,
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

  // Automatically initialized from local time of day!
  const [roomMood, setRoomMood] = useState<RoomMood>(() => getLocalTimeMood());
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const [showJournal, setShowJournal] = useState(false);

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

  const handleCycleMood = () => {
    const order: RoomMood[] = ['morning', 'golden', 'evening'];
    setRoomMood((cur) => order[(order.indexOf(cur) + 1) % order.length]);
  };

  const handleStartReading = (book: BookItem, startPage?: number) => {
    setShowJournal(false);
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

  const isEvening = roomMood === 'evening';

  return (
    <div
      className="relative h-dvh overflow-hidden flex flex-col"
      onMouseMove={(e) => {
        if (window.innerWidth < 768) return;
        const x = (e.clientX / window.innerWidth - 0.5) * 2;
        const y = (e.clientY / window.innerHeight - 0.5) * 2;
        setParallax({ x, y });
      }}
    >
      {/* Unified Library Room Background */}
      <AmbientRoomEffects mood={roomMood} parallax={parallax} />

      {/* Physical Brass Pull-Chain Switch in Top-Left Corner (replaces 3 buttons!) */}
      {!activeBook && (
        <PullChainSwitch mood={roomMood} onPull={handleCycleMood} />
      )}

      {/* Minimal Floating Top-Right Leather Reading Journal & Add PDF Icon (replaces generic tabs!) */}
      {!activeBook && (
        <div className="fixed top-3 right-3 sm:right-5 z-40 flex items-center gap-2">
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
            className={`flex h-9 w-9 items-center justify-center rounded-full border shadow-md backdrop-blur-md transition hover:scale-105 ${
              isEvening
                ? 'border-[#E5C16C]/35 bg-[#241A13]/85 text-[#F6E2B3]'
                : 'border-[#C9B79B] bg-[#FAF6EE]/88 text-[#463222]'
            }`}
            title="Thêm sách PDF mới"
            aria-label="Thêm sách PDF mới"
          >
            <Plus className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => setShowJournal(true)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-medium shadow-md backdrop-blur-md transition hover:scale-105 ${
              isEvening
                ? 'border-[#E5C16C]/40 bg-[#2C1E14]/90 text-[#F7E4B6]'
                : 'border-[#C9B79B] bg-[#FAF6EE]/90 text-[#3F2C1E]'
            }`}
            title="Mở Sổ Nhật Ký Đọc Sách"
          >
            <Feather className="h-3.5 w-3.5 text-[#C48B3B]" />
            <span className="hidden sm:inline font-serif">Nhật ký đọc</span>
            {finishedBooks.length > 0 && (
              <span className="rounded-full bg-[#24664B] px-1.5 py-0.2 text-[10px] font-bold text-white">
                {finishedBooks.length}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Full-Screen Built-In 3-Cabinet Library Wall */}
      <main className="relative z-10 flex flex-1 min-h-0 w-full flex-col pt-1 sm:pt-2 pb-0">
        <Bookshelf
          books={allBooks}
          progressMap={progressMap}
          roomMood={roomMood}
          onOpenBook={handleStartReading}
          onDeleteCustomBook={handleDeleteCustomBook}
          onAddBookClick={() => fileInputRef.current?.click()}
        />
      </main>

      {/* Cozy Library Wooden Baseboard & Floor */}
      <div
        className={`${
          isEvening
            ? 'room-floor-evening border-[#160F0B]'
            : 'room-floor-day border-[#5B3B25]'
        } relative z-20 h-5 sm:h-7 shrink-0 w-full border-t transition-colors duration-700`}
      />

      {/* Bespoke Leather-Bound Reading Journal Modal (for Finished Books Archive & Reading Stats) */}
      {showJournal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm"
          onClick={() => setShowJournal(false)}
        >
          <div
            className="relative flex max-h-[86vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border-4 border-[#5C3D28] bg-[#FAF4E8] text-[#241B14] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#E2D4BC] bg-[#F2E8D5] px-6 py-4">
              <div className="flex items-center gap-2.5">
                <BookOpen className="h-5 w-5 text-[#7A4B2A]" />
                <h2 className="font-display text-2xl font-bold">
                  Sổ Nhật Ký Đọc Sách
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowJournal(false)}
                className="rounded-lg p-1.5 text-[#6B5A4C] hover:bg-[#E5D7BF]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
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
          </div>
        </div>
      )}

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
