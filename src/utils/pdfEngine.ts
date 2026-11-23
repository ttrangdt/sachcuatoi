import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { BookItem, TocItem } from '../types/book';
import { loadCustomPdfBlob } from './storage';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

const docCache = new Map<string, Promise<PDFDocumentProxy>>();
const coverCache = new Map<string, string>();
const tocCache = new Map<string, TocItem[]>();

export async function loadPdfDocument(book: BookItem): Promise<PDFDocumentProxy> {
  const cached = docCache.get(book.id);
  if (cached) return cached;

  const loader = (async () => {
    if (book.isCustom) {
      const buffer = await loadCustomPdfBlob(book.id);
      if (!buffer) {
        throw new Error('Không tìm thấy tệp PDF đã lưu trong trình duyệt.');
      }
      const copy = buffer.slice(0);
      return pdfjsLib.getDocument({ data: new Uint8Array(copy) }).promise;
    }

    if (!book.pdfUrl) {
      throw new Error('Thiếu đường dẫn tệp sách.');
    }

    return pdfjsLib.getDocument({ url: book.pdfUrl }).promise;
  })();

  docCache.set(book.id, loader);
  loader.catch(() => docCache.delete(book.id));
  return loader;
}

export async function renderPageToDataUrl(
  doc: PDFDocumentProxy,
  pageNumber: number,
  targetWidth: number = 600
): Promise<string> {
  const clamped = Math.max(1, Math.min(pageNumber, doc.numPages));
  const page = await doc.getPage(clamped);
  const baseViewport = page.getViewport({ scale: 1 });
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const scale = (targetWidth / baseViewport.width) * dpr;
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement('canvas');
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Không thể khởi tạo khung vẽ trang sách.');

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  await page.render({
    canvas,
    canvasContext: ctx,
    viewport,
  }).promise;

  return canvas.toDataURL('image/jpeg', 0.9);
}

export async function getBookCoverUrl(book: BookItem): Promise<string | null> {
  if (coverCache.has(book.id)) {
    return coverCache.get(book.id) || null;
  }
  try {
    const doc = await loadPdfDocument(book);
    const dataUrl = await renderPageToDataUrl(doc, 1, 320);
    coverCache.set(book.id, dataUrl);
    return dataUrl;
  } catch {
    return null;
  }
}

type OutlineNode = {
  title: string;
  dest: string | unknown[] | null;
  items?: OutlineNode[];
};

async function resolveDestPage(
  doc: PDFDocumentProxy,
  dest: string | unknown[] | null
): Promise<number | null> {
  if (!dest) return null;
  try {
    let explicitDest: unknown[] | null = null;
    if (typeof dest === 'string') {
      explicitDest = await doc.getDestination(dest);
    } else if (Array.isArray(dest)) {
      explicitDest = dest;
    }
    if (!explicitDest || !explicitDest[0]) return null;
    const ref = explicitDest[0];
    if (typeof ref === 'number') {
      return ref + 1;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pageIndex = await doc.getPageIndex(ref as any);
    return pageIndex + 1;
  } catch {
    return null;
  }
}

export async function extractBookToc(book: BookItem): Promise<TocItem[]> {
  if (tocCache.has(book.id)) {
    return tocCache.get(book.id) || [];
  }

  try {
    const doc = await loadPdfDocument(book);
    const outline = (await doc.getOutline()) as OutlineNode[] | null;
    const result: TocItem[] = [{ title: 'Bìa sách', page: 1, level: 0 }];

    if (outline && outline.length > 0) {
      const walk = async (nodes: OutlineNode[], level: number) => {
        for (const node of nodes) {
          const page = await resolveDestPage(doc, node.dest);
          if (page && page >= 1) {
            result.push({
              title: node.title.trim() || `Trang ${page}`,
              page,
              level,
            });
          }
          if (node.items && node.items.length > 0 && level < 2) {
            await walk(node.items, level + 1);
          }
        }
      };
      await walk(outline, 0);
    } else {
      // Fallback milestones if PDF has no embedded outline
      const step = Math.max(10, Math.floor(doc.numPages / 10));
      for (let p = 2; p <= doc.numPages; p += step) {
        result.push({ title: `Phần trang ${p}`, page: p, level: 0 });
      }
    }

    tocCache.set(book.id, result);
    return result;
  } catch {
    return [{ title: 'Bìa sách', page: 1, level: 0 }];
  }
}
