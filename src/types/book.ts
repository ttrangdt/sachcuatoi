export type BookmarkStyleId =
  | 'sunset-magnetic'
  | 'vangogh-starry'
  | 'little-prince'
  | 'mystic-moon'
  | 'monet-sunrise'
  | 'crystal-butterfly'
  | 'silver-jade-hook'
  | 'golden-feather'
  | 'sakura-cat-chain';

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

export interface BookTextData {
  id: string;
  sourcePages: number;
  chapters: { title: string; paragraphIndex: number }[];
  paragraphs: string[];
}

export interface BookItem {
  id: string;
  title: string;
  author: string;
  genre: string;
  description: string;
  pdfUrl?: string;
  textUrl?: string;
  isCustom?: boolean;
  spineColor: string;
  spineAccent: string;
  spineTextColor: string;
  totalPages: number;
  addedAt: number;
  cabinetIndex?: 0 | 1 | 2; // 0 = left, 1 = center, 2 = right
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
