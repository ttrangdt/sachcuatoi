import { BookItem, BookTextData, TocItem } from '../types/book';
import { loadPdfDocument } from './pdfEngine';

const textCache = new Map<string, Promise<BookTextData>>();

export async function loadBookTextData(book: BookItem): Promise<BookTextData> {
  const cached = textCache.get(book.id);
  if (cached) return cached;

  const loader = (async () => {
    if (book.textUrl) {
      const res = await fetch(book.textUrl);
      if (res.ok) {
        return (await res.json()) as BookTextData;
      }
    }

    // Fallback: extract text on-the-fly from uploaded custom PDF
    const doc = await loadPdfDocument(book);
    const paragraphs: string[] = [];
    const maxPages = Math.min(doc.numPages, 400);
    for (let p = 2; p <= maxPages; p++) {
      const page = await doc.getPage(p);
      const tc = await page.getTextContent();
      const raw = tc.items
        .map((it) => ('str' in it ? it.str : ''))
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
      if (raw) paragraphs.push(raw);
    }

    return {
      id: book.id,
      sourcePages: doc.numPages,
      chapters: [{ title: 'Bắt đầu đọc', paragraphIndex: 0 }],
      paragraphs,
    };
  })();

  textCache.set(book.id, loader);
  loader.catch(() => textCache.delete(book.id));
  return loader;
}

export interface PaginatedBook {
  /** Page 1 is always Cover; pages[0] = Page 2, pages[1] = Page 3, etc. */
  pages: string[][];
  totalPages: number;
  toc: TocItem[];
}

/**
 * Smartly reflow paragraphs into readable pages tailored to PC vs Mobile and current fontSize.
 * Guarantees each page fits cleanly without vertical scrolling.
 */
export function paginateBookText(
  data: BookTextData,
  options: { isMobile: boolean; fontSize: number }
): PaginatedBook {
  const { isMobile, fontSize } = options;

  // Compute ideal character budget per page based on viewport & font size
  // Base comfortable budget at 16px: ~1050 chars on desktop half-spread, ~620 chars on mobile
  const scaleFactor = (16 / fontSize) * (16 / fontSize);
  const baseChars = isMobile ? 600 : 1020;
  const maxCharsPerPage = Math.max(240, Math.min(1800, Math.round(baseChars * scaleFactor)));
  const paraOverhead = Math.round(52 * (fontSize / 16));

  const pages: string[][] = [];
  let currentPageParas: string[] = [];
  let currentWeight = 0;

  // Map paragraph index -> resulting 1-based book page number (Cover = 1, first text page = 2)
  const paraToPage = new Map<number, number>();

  const flushPage = () => {
    if (currentPageParas.length > 0) {
      pages.push(currentPageParas);
      currentPageParas = [];
      currentWeight = 0;
    }
  };

  for (let i = 0; i < data.paragraphs.length; i++) {
    const para = data.paragraphs[i];
    const isHeading = para.startsWith('## ');

    // Start major chapter headings on a fresh page if current page is > 35% full
    if (isHeading && currentWeight > maxCharsPerPage * 0.35) {
      flushPage();
    }

    const weight = para.length + paraOverhead + (isHeading ? 120 : 0);

    // If a single paragraph is very long, split gracefully at sentence boundaries
    if (para.length > maxCharsPerPage * 0.92 && !isHeading) {
      const sentences = para.match(/[^.!?…]+[.!?…]*\s*/g) || [para];
      let chunk = '';
      for (const sentence of sentences) {
        if (chunk.length + sentence.length > maxCharsPerPage * 0.85 && chunk.trim()) {
          if (currentWeight + chunk.length > maxCharsPerPage && currentPageParas.length > 0) {
            flushPage();
          }
          if (!paraToPage.has(i)) paraToPage.set(i, pages.length + 2);
          currentPageParas.push(chunk.trim());
          currentWeight += chunk.length + paraOverhead;
          flushPage();
          chunk = sentence;
        } else {
          chunk += sentence;
        }
      }
      if (chunk.trim()) {
        if (currentWeight + chunk.length > maxCharsPerPage && currentPageParas.length > 0) {
          flushPage();
        }
        if (!paraToPage.has(i)) paraToPage.set(i, pages.length + 2);
        currentPageParas.push(chunk.trim());
        currentWeight += chunk.length + paraOverhead;
      }
      continue;
    }

    if (currentWeight + weight > maxCharsPerPage && currentPageParas.length > 0) {
      flushPage();
    }

    if (!paraToPage.has(i)) {
      paraToPage.set(i, pages.length + 2);
    }
    currentPageParas.push(para);
    currentWeight += weight;
  }

  flushPage();

  // Build accurate dynamic TOC mapped to reflowed page numbers
  const toc: TocItem[] = [{ title: 'Bìa sách', page: 1, level: 0 }];
  for (const ch of data.chapters) {
    let resolvedPage = paraToPage.get(ch.paragraphIndex);
    if (!resolvedPage) {
      // Find nearest following paragraph
      for (let j = ch.paragraphIndex; j < data.paragraphs.length; j++) {
        if (paraToPage.has(j)) {
          resolvedPage = paraToPage.get(j);
          break;
        }
      }
    }
    toc.push({
      title: ch.title,
      page: resolvedPage || 2,
      level: 0,
    });
  }

  return {
    pages,
    totalPages: pages.length + 1, // +1 for Cover page
    toc,
  };
}
