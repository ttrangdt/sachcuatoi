import fs from 'fs';
import path from 'path';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';

const BOOKS = [
  {
    id: 'truong-ca-achilles',
    input: 'public/books/truong-ca-achilles.pdf',
    output: 'public/books/text/truong-ca-achilles.json',
  },
  {
    id: 'nguoi-ru-ngu',
    input: 'public/books/nguoi-ru-ngu.pdf',
    output: 'public/books/text/nguoi-ru-ngu.json',
  },
];

async function resolveDestPage(doc, dest) {
  if (!dest) return null;
  try {
    const explicit =
      typeof dest === 'string' ? await doc.getDestination(dest) : dest;
    if (!Array.isArray(explicit) || !explicit[0]) return null;
    const ref = explicit[0];
    if (typeof ref === 'number') return ref + 1;
    const idx = await doc.getPageIndex(ref);
    return idx + 1;
  } catch {
    return null;
  }
}

function cleanPageParagraphs(textItems) {
  // Group text items by vertical Y coordinate to reconstruct clean lines & paragraphs
  const lines = [];
  let currentLine = [];
  let lastY = null;

  for (const item of textItems) {
    const str = item.str;
    if (!str) continue;
    const y = Math.round(item.transform[5]);
    if (lastY !== null && Math.abs(y - lastY) > 4) {
      const joined = currentLine.join(' ').replace(/\s+/g, ' ').trim();
      if (joined) lines.push({ text: joined, y: lastY });
      currentLine = [str];
    } else {
      currentLine.push(str);
    }
    lastY = y;
  }
  if (currentLine.length > 0) {
    const joined = currentLine.join(' ').replace(/\s+/g, ' ').trim();
    if (joined) lines.push({ text: joined, y: lastY ?? 0 });
  }

  // Merge wrapped lines into coherent paragraphs
  const paragraphs = [];
  let buffer = '';
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].text;
    // Skip standalone page numbers
    if (/^\d{1,4}$/.test(line)) continue;
    // Skip watermarks like thuviensach.vn
    if (/thuviensach\.vn/i.test(line)) continue;

    const prevY = i > 0 ? lines[i - 1].y : null;
    const gap = prevY !== null ? Math.abs(prevY - lines[i].y) : 0;
    const isHeading =
      /^(CHƯƠNG|PHẦN|HỒI|LỜI MỞ ĐẦU|MỞ ĐẦU|BẮT ĐẦU|PHÒNG \d+|MILA|BERISH|ALICE|KAIRUS)\b/i.test(
        line
      ) && line.length < 70;

    if (isHeading) {
      if (buffer.trim()) {
        paragraphs.push(buffer.trim());
        buffer = '';
      }
      paragraphs.push(`## ${line}`);
      continue;
    }

    const startsDialogue = /^[-–—«“"]/.test(line);
    const prevEndedSentence = /[.!?…”»"]$/.test(buffer);
    const largeGap = gap > 22;

    if (buffer && (largeGap || startsDialogue || (prevEndedSentence && line.length < 48))) {
      paragraphs.push(buffer.trim());
      buffer = line;
    } else {
      buffer = buffer ? `${buffer} ${line}` : line;
    }
  }
  if (buffer.trim()) paragraphs.push(buffer.trim());
  return paragraphs;
}

fs.mkdirSync('public/books/text', { recursive: true });

for (const b of BOOKS) {
  console.log(`Extracting ${b.id}...`);
  const data = new Uint8Array(fs.readFileSync(b.input));
  const doc = await pdfjs.getDocument({ data, verbosity: 0 }).promise;

  // Map PDF page -> outline titles
  const outline = (await doc.getOutline().catch(() => null)) || [];
  const pageChapters = new Map();
  const walkOutline = async (nodes) => {
    for (const node of nodes) {
      const p = await resolveDestPage(doc, node.dest);
      if (p && !pageChapters.has(p)) {
        pageChapters.set(p, node.title.trim());
      }
      if (node.items?.length) await walkOutline(node.items);
    }
  };
  await walkOutline(outline);

  const paragraphs = [];
  const chapters = []; // { title, paragraphIndex }

  // Skip page 1 (cover) when extracting body text
  for (let p = 2; p <= doc.numPages; p++) {
    if (pageChapters.has(p)) {
      chapters.push({
        title: pageChapters.get(p),
        paragraphIndex: paragraphs.length,
      });
    }
    const page = await doc.getPage(p);
    const tc = await page.getTextContent();
    const pageParas = cleanPageParagraphs(tc.items);
    for (const para of pageParas) {
      paragraphs.push(para);
    }
  }

  const outData = {
    id: b.id,
    sourcePages: doc.numPages,
    chapters,
    paragraphs,
  };
  fs.writeFileSync(b.output, JSON.stringify(outData));
  const sizeKb = Math.round(fs.statSync(b.output).size / 1024);
  console.log(
    `  Done ${b.id}: ${paragraphs.length} paragraphs, ${chapters.length} chapters (${sizeKb} KB)`
  );
}
