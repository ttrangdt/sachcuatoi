export type BookmarkStyleId =
  | 'crimson-silk'
  | 'gold-tassel'
  | 'maple-leaf'
  | 'brass-clip'
  | 'sakura-tag'
  | 'emerald-velvet';

export interface BookmarkEntry {
  id: string;
  page: number;
  style: BookmarkStyleId;
  note?: string;
  createdAt: number;
}

export interface TocItem {
  title: string;
  page: number;
  level: number;
}

export interface BookItem {
  id: string;
  title: string;
  author: string;
  genre: string;
  description: string;
  pdfUrl?: string; // Built-in public path
  isCustom?: boolean; // Stored in IndexedDB
  spineColor: string;
  spineAccent: string;
  spineTextColor: string;
  totalPages: number;
  addedAt: number;
}

export interface BookProgress {
  bookId: string;
  currentPage: number;
  bookmarkedPage: number | null;
  bookmarkStyle: BookmarkStyleId;
  bookmarks: BookmarkEntry[];
  firstOpenedAt: number | null;
  lastReadAt: number | null;
  isFinished: boolean;
  finishedAt: number | null;
  totalPages: number;
}

export type ShelfViewMode = 'cover' | 'spine';
export type LibraryTab = 'all' | 'reading' | 'finished';
export type PaperTheme = 'cream' | 'white' | 'sepia' | 'night';
