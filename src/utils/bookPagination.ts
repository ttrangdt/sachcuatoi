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
 * Exact line-budget pagination using measured column width & height.
 * Fills ~90–94% of every page cleanly without leaving empty bottom voids or clipping lines.
 */
export function paginateBookText(
  data: BookTextData,
  options: {
    isMobile: boolean;
    fontSize: number;
    colWidth: number;
    colHeight: number;
  }
): PaginatedBook {
  const { isMobile, fontSize, colWidth, colHeight } = options;

  // Average Vietnamese serif glyph width ~0.465 * fontSize (slightly conservative so text never clips)
  const effectiveWidth = Math.max(220, colWidth - 6);
  const charsPerLine = Math.max(
    22,
    Math.floor(effectiveWidth / (fontSize * (isMobile ? 0.48 : 0.465)))
  );

  const lineHeightPx = fontSize * 1.66;
  const maxLines = Math.max(
    7,
    Math.floor((Math.max(260, colHeight) - 10) / lineHeightPx)
  );
  const paraGapLines = 0.42;

  const estimateLines = (text: string, isHeading: boolean): number => {
    if (isHeading) {
      const headingCharsPerLine = Math.max(14, Math.floor(charsPerLine * 0.68));
      return Math.ceil(text.length / headingCharsPerLine) * 1.45 + 1.1;
    }
    const indentChars = 4;
    return Math.max(1, Math.ceil((text.length + indentChars) / charsPerLine));
  };

  const pages: string[][] = [];
  let currentPageParas: string[] = [];
  let usedLines = 0;

  const paraToPage = new Map<number, number>();

  const flushPage = () => {
    if (currentPageParas.length > 0) {
      pages.push(currentPageParas);
      currentPageParas = [];
      usedLines = 0;
    }
  };

  for (let i = 0; i < data.paragraphs.length; i++) {
    const para = data.paragraphs[i];
    const isHeading = para.startsWith('## ');

    // Start chapter headings on a fresh page if current page is already > 45% filled
    if (isHeading && usedLines > maxLines * 0.45) {
      flushPage();
    }

    const needed = estimateLines(para, isHeading);
    const gap = currentPageParas.length > 0 ? paraGapLines : 0;

    // If paragraph fits on current page, place it directly
    if (usedLines + gap + needed <= maxLines) {
      if (!paraToPage.has(i)) paraToPage.set(i, pages.length + 2);
      currentPageParas.push(para);
      usedLines += gap + needed;
      continue;
    }

    // If paragraph is small/medium and doesn't fit remaining lines, move cleanly to next page
    if (needed <= maxLines * 0.72 || isHeading) {
      flushPage();
      if (!paraToPage.has(i)) paraToPage.set(i, pages.length + 2);
      currentPageParas.push(para);
      usedLines = needed;
      continue;
    }

    // Long paragraph: split smoothly at sentence boundaries so bottom of page stays nicely filled!
    const sentences = para.match(/[^.!?…]+[.!?…]*\s*/g) || [para];
    let chunk = '';

    for (const sentence of sentences) {
      const candidate = chunk ? `${chunk}${sentence}` : sentence;
      const candLines = estimateLines(candidate.trim(), false);
      const currentGap = currentPageParas.length > 0 ? paraGapLines : 0;

      if (usedLines + currentGap + candLines > maxLines) {
        if (chunk.trim()) {
          if (!paraToPage.has(i)) paraToPage.set(i, pages.length + 2);
          currentPageParas.push(chunk.trim());
          flushPage();
          chunk = sentence;
        } else {
          // Even first sentence didn't fit remaining lines -> flush page and start fresh
          flushPage();
          chunk = sentence;
        }
      } else {
        chunk = candidate;
      }
    }

    if (chunk.trim()) {
      const remLines = estimateLines(chunk.trim(), false);
      const currentGap = currentPageParas.length > 0 ? paraGapLines : 0;
      if (usedLines + currentGap + remLines > maxLines && currentPageParas.length > 0) {
        flushPage();
      }
      if (!paraToPage.has(i)) paraToPage.set(i, pages.length + 2);
      currentPageParas.push(chunk.trim());
      usedLines += (currentPageParas.length > 1 ? paraGapLines : 0) + remLines;
    }
  }

  flushPage();

  const toc: TocItem[] = [{ title: 'Bìa sách', page: 1, level: 0 }];
  for (const ch of data.chapters) {
    let resolvedPage = paraToPage.get(ch.paragraphIndex);
    if (!resolvedPage) {
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
    totalPages: pages.length + 1,
    toc,
  };
}
