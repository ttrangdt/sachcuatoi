import { BookItem, BookProgress, BookmarkStyleId } from '../types/book';

const PROGRESS_KEY = 'sachcuatoi_progress_v1';
const CUSTOM_BOOKS_KEY = 'sachcuatoi_custom_books_v1';
const PREFS_KEY = 'sachcuatoi_prefs_v1';

const DB_NAME = 'sachcuatoi_pdfs_db';
const STORE_NAME = 'pdfs';

export interface UserPrefs {
  shelfView: 'cover' | 'spine';
  hoverPreviewEnabled: boolean;
  paperTheme: 'cream' | 'white' | 'sepia' | 'night';
  defaultBookmarkStyle: BookmarkStyleId;
}

const DEFAULT_PREFS: UserPrefs = {
  shelfView: 'cover',
  hoverPreviewEnabled: true,
  paperTheme: 'cream',
  defaultBookmarkStyle: 'crimson-silk',
};

export function loadAllProgress(): Record<string, BookProgress> {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveAllProgress(map: Record<string, BookProgress>): void {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(map));
  } catch {
    // ignore quota errors
  }
}

export function getOrCreateProgress(
  map: Record<string, BookProgress>,
  book: BookItem
): BookProgress {
  const existing = map[book.id];
  if (existing) {
    return {
      ...existing,
      totalPages: existing.totalPages || book.totalPages,
    };
  }
  return {
    bookId: book.id,
    currentPage: 1,
    bookmarkedPage: null,
    bookmarkStyle: 'crimson-silk',
    bookmarks: [],
    firstOpenedAt: null,
    lastReadAt: null,
    isFinished: false,
    finishedAt: null,
    totalPages: book.totalPages,
  };
}

export function loadCustomBooks(): BookItem[] {
  try {
    const raw = localStorage.getItem(CUSTOM_BOOKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomBooks(books: BookItem[]): void {
  try {
    localStorage.setItem(CUSTOM_BOOKS_KEY, JSON.stringify(books));
  } catch {
    // ignore
  }
}

export function loadPrefs(): UserPrefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    return raw ? { ...DEFAULT_PREFS, ...JSON.parse(raw) } : DEFAULT_PREFS;
  } catch {
    return DEFAULT_PREFS;
  }
}

export function savePrefs(prefs: UserPrefs): void {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {
    // ignore
  }
}

// IndexedDB for user-uploaded PDFs
function openPdfDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveCustomPdfBlob(bookId: string, data: ArrayBuffer): Promise<void> {
  const db = await openPdfDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(data, bookId);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function loadCustomPdfBlob(bookId: string): Promise<ArrayBuffer | null> {
  const db = await openPdfDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).get(bookId);
    req.onsuccess = () => resolve((req.result as ArrayBuffer) || null);
    req.onerror = () => reject(req.error);
  });
}

export async function deleteCustomPdfBlob(bookId: string): Promise<void> {
  const db = await openPdfDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(bookId);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
