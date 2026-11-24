import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';

const SACH_DIR = 'd:/sachcuatoi/sach';
const OUT_TEXT_DIR = 'd:/sachcuatoi/public/books/text';
const OUT_COVER_DIR = 'd:/sachcuatoi/public/books/covers';

fs.mkdirSync(OUT_TEXT_DIR, { recursive: true });
fs.mkdirSync(OUT_COVER_DIR, { recursive: true });

// Pure-Node zero-dependency PNG encoder for RGB/RGBA pixel buffers from pdfjs-dist
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return (c ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function encodePng(width, height, data, channels) {
  // Downscale if huge (> 420px wide) so covers load super fast on web
  let outW = width;
  let outH = height;
  let src = data;
  if (width > 420) {
    const scale = 420 / width;
    outW = 420;
    outH = Math.max(1, Math.round(height * scale));
    const resized = new Uint8Array(outW * outH * channels);
    for (let y = 0; y < outH; y++) {
      const sy = Math.min(height - 1, Math.floor(y / scale));
      for (let x = 0; x < outW; x++) {
        const sx = Math.min(width - 1, Math.floor(x / scale));
        const di = (y * outW + x) * channels;
        const si = (sy * width + sx) * channels;
        for (let c = 0; c < channels; c++) resized[di + c] = data[si + c];
      }
    }
    src = resized;
  }

  const rowLen = outW * 3 + 1;
  const raw = Buffer.alloc(rowLen * outH);
  for (let y = 0; y < outH; y++) {
    raw[y * rowLen] = 0; // filter None
    for (let x = 0; x < outW; x++) {
      const si = (y * outW + x) * channels;
      const di = y * rowLen + 1 + x * 3;
      if (channels === 1) {
        raw[di] = raw[di + 1] = raw[di + 2] = src[si];
      } else {
        raw[di] = src[si];
        raw[di + 1] = src[si + 1];
        raw[di + 2] = src[si + 2];
      }
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(outW, 0);
  ihdr.writeUInt32BE(outH, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // RGB
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const compressed = zlib.deflateSync(raw, { level: 6 });
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', compressed),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

async function extractCoverImage(doc, outPath) {
  // Check first 3 pages for the largest embedded cover image
  for (let p = 1; p <= Math.min(3, doc.numPages); p++) {
    try {
      const page = await doc.getPage(p);
      const opList = await page.getOperatorList();
      let bestImg = null;

      for (let i = 0; i < opList.fnArray.length; i++) {
        const fn = opList.fnArray[i];
        if (
          fn === pdfjs.OPS.paintImageXObject ||
          fn === pdfjs.OPS.paintJpegXObject ||
          fn === pdfjs.OPS.paintInlineImageXObject
        ) {
          const arg = opList.argsArray[i][0];
          let img = null;
          if (typeof arg === 'string') {
            img = await new Promise((resolve) => {
              try {
                page.objs.get(arg, (obj) => resolve(obj));
              } catch {
                resolve(null);
              }
            });
          } else if (arg && arg.width && arg.data) {
            img = arg;
          }

          if (img && img.width >= 120 && img.height >= 150 && img.data) {
            if (!bestImg || img.width * img.height > bestImg.width * bestImg.height) {
              bestImg = img;
            }
          }
        }
      }

      if (bestImg) {
        const pixels = bestImg.width * bestImg.height;
        const channels = Math.round(bestImg.data.length / pixels);
        if (channels === 1 || channels === 3 || channels === 4) {
          const png = encodePng(bestImg.width, bestImg.height, bestImg.data, channels);
          fs.writeFileSync(outPath, png);
          return true;
        }
      }
    } catch {
      // try next page
    }
  }
  return false;
}

const CURATED_META = [
  { match: 'achilles', id: 'truong-ca-achilles', title: 'Trường Ca Achilles', author: 'Madeline Miller', genre: 'Thần thoại · Tiểu thuyết', year: '2011', spineColor: '#851A2E', spineAccent: '#F4D36A', spineTextColor: '#F7DC88' },
  { match: 'ba ngoai', id: 'ba-ngoai-toi-gui-loi-xin-loi', title: 'Bà Ngoại Tôi Gửi Lời Xin Lỗi', author: 'Fredrik Backman', genre: 'Tiểu thuyết · Gia đình', year: '2013', spineColor: '#9E4B5A', spineAccent: '#F6DFC2', spineTextColor: '#FFF5EB' },
  { match: 'ca gai', id: 'bo-con-ca-gai', title: 'Bố Con Cá Gai', author: 'Cho Chang In', genre: 'Văn học Hàn Quốc', year: '2000', spineColor: '#2E5B6B', spineAccent: '#E8D5A8', spineTextColor: '#F4F8FA' },
  { match: 'britt-marie', id: 'britt-marie-da-o-day', title: 'Britt-Marie Đã Ở Đây', author: 'Fredrik Backman', genre: 'Tiểu thuyết đương đại', year: '2014', spineColor: '#4A6E5D', spineAccent: '#F3DFB2', spineTextColor: '#F7FBF8' },
  { match: 'cay cam ngot', id: 'cay-cam-ngot-cua-toi', title: 'Cây Cam Ngọt Của Tôi', author: 'José Mauro de Vasconcelos', genre: 'Kinh điển · Tuổi thơ', year: '1968', spineColor: '#C86432', spineAccent: '#FCE5B4', spineTextColor: '#FFF7EC' },
  { match: 'pyjama', id: 'chu-be-mang-pyjama-soc', title: 'Chú Bé Mang Pyjama Sọc', author: 'John Boyne', genre: 'Tiểu thuyết lịch sử', year: '2006', spineColor: '#46586C', spineAccent: '#DCE6F0', spineTextColor: '#F5F8FB' },
  { match: 'chung toi dau', id: 'chung-toi-dau-voi-cac-ban', title: 'Chúng Tôi Đấu Với Các Bạn', author: 'Fredrik Backman', genre: 'Tiểu thuyết · Tâm lý', year: '2017', spineColor: '#294054', spineAccent: '#DFC592', spineTextColor: '#F2F6FA' },
  { match: 'brooklyn', id: 'cay-brooklyn-xanh-biec', title: 'Cây Brooklyn Xanh Biếc', author: 'Betty Smith', genre: 'Kinh điển · Trưởng thành', year: '1943', spineColor: '#2C5E4A', spineAccent: '#EED9A4', spineTextColor: '#F2FAF5' },
  { match: 'giang ho hiem ac', id: 'giang-ho-hiem-ac', title: 'Giang Hồ Hiểm Ác', author: 'Leigh Bardugo', genre: 'Kỳ ảo · Grishaverse', year: '2016', spineColor: '#3B283C', spineAccent: '#E5BC74', spineTextColor: '#F8EFF9' },
  { match: 'hai so phan', id: 'hai-so-phan', title: 'Hai Số Phận', author: 'Jeffrey Archer', genre: 'Kinh điển · Cuộc đời', year: '1979', spineColor: '#5B3A29', spineAccent: '#E8C584', spineTextColor: '#FAF2E8' },
  { match: 'london', id: 'hieu-sach-cuoi-cung-o-london', title: 'Hiệu Sách Cuối Cùng Ở London', author: 'Madeline Martin', genre: 'Tiểu thuyết lịch sử', year: '2021', spineColor: '#6C323B', spineAccent: '#F2D498', spineTextColor: '#FCF3F0' },
  { match: 'paris', id: 'hieu-sach-nho-o-paris', title: 'Hiệu Sách Nhỏ Ở Paris', author: 'Nina George', genre: 'Lãng mạn · Chữa lành', year: '2013', spineColor: '#54688A', spineAccent: '#F6E2B8', spineTextColor: '#F5F8FC' },
  { match: 'muu ma chuoc quy', id: 'muu-ma-chuoc-quy', title: 'Mưu Ma Chước Quỷ', author: 'Leigh Bardugo', genre: 'Kỳ ảo · Grishaverse', year: '2016', spineColor: '#242938', spineAccent: '#E6B868', spineTextColor: '#F4F2EC' },
  { match: 'muoi', id: 'muoi-su-hoi-sinh', title: 'Muối - Sự Hồi Sinh Nơi Sâu Thẳm Vụn Vỡ', author: 'Tôn Tần', genre: 'Tản văn · Chữa lành', year: '2022', spineColor: '#5E7A82', spineAccent: '#F4EAE0', spineTextColor: '#F8FBFB' },
  { match: 'ngan mat troi', id: 'ngan-mat-troi-ruc-ro', title: 'Ngàn Mặt Trời Rực Rỡ', author: 'Khaled Hosseini', genre: 'Tiểu thuyết · Nhân văn', year: '2007', spineColor: '#A8482B', spineAccent: '#FBE0A2', spineTextColor: '#FFF6EB' },
  { match: 'ove', id: 'nguoi-dan-ong-mang-ten-ove', title: 'Người Đàn Ông Mang Tên Ove', author: 'Fredrik Backman', genre: 'Tiểu thuyết · Hài ấm áp', year: '2012', spineColor: '#3B647A', spineAccent: '#F5DFB0', spineTextColor: '#F4F9FC' },
  { match: 'nguoi ru ngu', id: 'nguoi-ru-ngu', title: 'Người Ru Ngủ', author: 'Donato Carrisi', genre: 'Trinh thám · Tâm lý', year: '2009', spineColor: '#1E2A38', spineAccent: '#C5D1DD', spineTextColor: '#F0F4F8' },
  { match: 'ngay thang nam', id: 'ngay-thang-nam', title: 'Ngày Tháng Năm', author: 'Diêm Liên Khoa', genre: 'Văn học Trung Quốc', year: '1997', spineColor: '#7A5B3E', spineAccent: '#F2DEC0', spineTextColor: '#FAF5EE' },
  { match: 'phi vu bat kha', id: 'phi-vu-bat-kha', title: 'Phi Vụ Bất Khả', author: 'Leigh Bardugo', genre: 'Kỳ ảo · Grishaverse', year: '2015', spineColor: '#4A2029', spineAccent: '#EBC272', spineTextColor: '#FBF2EE' },
  { match: 'qua chuong', id: 'qua-chuong-ac-mong', title: 'Quả Chuông Ác Mộng', author: 'Sylvia Plath', genre: 'Kinh điển · Tâm lý', year: '1963', spineColor: '#665378', spineAccent: '#EFE2FA', spineTextColor: '#F8F4FC' },
  { match: 'sau ke bat hao', id: 'sau-ke-bat-hao', title: 'Sáu Kẻ Bất Hảo', author: 'Leigh Bardugo', genre: 'Kỳ ảo · Grishaverse', year: '2015', spineColor: '#252129', spineAccent: '#DFB15E', spineTextColor: '#F7EFE4' },
  { match: 'auschwitz', id: 'tho-xam-o-auschwitz', title: 'Thợ Xăm Ở Auschwitz', author: 'Heather Morris', genre: 'Tiểu thuyết lịch sử', year: '2018', spineColor: '#4D4742', spineAccent: '#DFC7A2', spineTextColor: '#F6F2EC' },
  { match: 'thu vien nua dem', id: 'thu-vien-nua-dem', title: 'Thư Viện Nửa Đêm', author: 'Matt Haig', genre: 'Kỳ ảo · Triết lý sống', year: '2020', spineColor: '#1E3C47', spineAccent: '#F0D084', spineTextColor: '#F2F9FA' },
  { match: 'thi tran nho', id: 'thi-tran-nho-giac-mo-lon', title: 'Thị Trấn Nhỏ Giấc Mơ Lớn', author: 'Fredrik Backman', genre: 'Tiểu thuyết · Thị trấn', year: '2016', spineColor: '#2E4D42', spineAccent: '#E8D29B', spineTextColor: '#F3FAF6' },
  { match: 'tan ngay de lai', id: 'tan-ngay-de-lai', title: 'Tàn Ngày Để Lại', author: 'Kazuo Ishiguro', genre: 'Kinh điển · Nobel', year: '1989', spineColor: '#6B4E3D', spineAccent: '#F2DBC0', spineTextColor: '#FAF4EE' },
  { match: 'loai tom hat', id: 'xa-ngoai-kia-noi-loai-tom-hat', title: 'Xa Ngoài Kia Nơi Loài Tôm Hát', author: 'Delia Owens', genre: 'Tiểu thuyết · Thiên nhiên', year: '2018', spineColor: '#2D5954', spineAccent: '#EBD392', spineTextColor: '#F2FAF8' },
];

function normalizeKey(str) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase();
}

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

/**
 * Extract structured visual lines with exact X, Y, and width from PDF text items.
 */
function extractVisualLines(textItems) {
  const rawLines = [];
  let curItems = [];
  let lastY = null;

  for (const item of textItems) {
    if (!item.str) continue;
    const y = Math.round(item.transform[5]);
    if (lastY !== null && Math.abs(y - lastY) > 4) {
      if (curItems.length) rawLines.push({ y: lastY, items: curItems });
      curItems = [item];
    } else {
      curItems.push(item);
    }
    lastY = y;
  }
  if (curItems.length) rawLines.push({ y: lastY ?? 0, items: curItems });

  const lines = [];
  for (const rl of rawLines) {
    rl.items.sort((a, b) => a.transform[4] - b.transform[4]);
    const text = rl.items
      .map((it) => it.str)
      .join(' ')
      .replace(/\s+/g, ' ')
      .replace(/\s+([,.;:!?…”»])/g, '$1')
      .replace(/([“«(])\s+/g, '$1')
      .trim();
    if (!text) continue;
    if (/^\d{1,4}$/.test(text)) continue;
    if (/thuviensach\.vn|sachvui\.com|tve-4u\.org/i.test(text)) continue;

    const minX = rl.items[0].transform[4];
    const lastIt = rl.items[rl.items.length - 1];
    const maxX = lastIt.transform[4] + (lastIt.width || 0);
    lines.push({
      text,
      x: minX,
      y: rl.y,
      width: Math.max(0, maxX - minX),
    });
  }
  return lines;
}

/**
 * Reconstruct smooth, unbroken prose paragraphs across ALL pages of a PDF:
 * - Dynamically measures each page's normal line spacing (median leading) so large fonts NEVER falsely break every line!
 * - Detects true paragraph starts via X-indent, extra vertical spacing (> 1.38x normal leading), dialogue markers, or short terminal lines.
 * - Stitches sentences that wrap across PDF page breaks seamlessly!
 */
function reconstructBookParagraphs(pageLinesList, pageChapters) {
  const paragraphs = [];
  const chapters = [];
  let buffer = '';

  const flush = () => {
    const cleaned = buffer.replace(/\s+/g, ' ').trim();
    if (cleaned) paragraphs.push(cleaned);
    buffer = '';
  };

  for (let pIdx = 0; pIdx < pageLinesList.length; pIdx++) {
    const pdfPageNum = pIdx + 2;
    const lines = pageLinesList[pIdx];

    if (pageChapters.has(pdfPageNum)) {
      flush();
      chapters.push({
        title: pageChapters.get(pdfPageNum),
        paragraphIndex: paragraphs.length,
      });
    }

    if (!lines || lines.length === 0) continue;

    // Compute median normal leading & baseline left X margin for this page
    const gaps = [];
    for (let i = 1; i < lines.length; i++) {
      const g = Math.abs(lines[i - 1].y - lines[i].y);
      if (g > 4 && g < 80) gaps.push(g);
    }
    gaps.sort((a, b) => a - b);
    const normalLeading =
      gaps.length > 0 ? gaps[Math.floor(gaps.length * 0.45)] : 18;

    const xs = lines.map((l) => l.x).sort((a, b) => a - b);
    const baseLeftX = xs[Math.floor(xs.length * 0.25)] ?? 0;
    const maxWidth = Math.max(...lines.map((l) => l.width), 100);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const text = line.text;
      const prevLine = i > 0 ? lines[i - 1] : null;
      const gap = prevLine ? Math.abs(prevLine.y - line.y) : 0;

      const isHeading =
        /^(CHƯƠNG|PHẦN|HỒI|LỜI MỞ ĐẦU|MỞ ĐẦU|BẮT ĐẦU|PHÒNG \d+|CHAPTER|\d+\s+[A-ZĐÀÁẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬÈÉẺẼẸÊẾỀỂỄỆÌÍỈĨỊÒÓỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÙÚỦŨỤƯỨỪỬỮỰỲÝỶỸỴ]{3,})\b/i.test(
          text
        ) && text.length < 65;

      if (isHeading) {
        flush();
        paragraphs.push(`## ${text}`);
        continue;
      }

      const isIndented = line.x > baseLeftX + 12;
      const isExtraVerticalGap = prevLine !== null && gap > normalLeading * 1.38;
      const startsDialogue = /^[-–—«“"]/.test(text);
      const prevEndedCleanly = /[.!?…”»":]$/.test(buffer);
      const prevWasShort = prevLine !== null && prevLine.width < maxWidth * 0.78;

      // Cross-page boundary (i === 0): only start new paragraph if buffer ended cleanly AND (indented or dialogue)
      let startNewPara = false;
      if (i === 0) {
        if (buffer && prevEndedCleanly && (isIndented || startsDialogue)) {
          startNewPara = true;
        }
      } else {
        if (
          buffer &&
          (isExtraVerticalGap ||
            (isIndented && prevEndedCleanly) ||
            (startsDialogue && prevEndedCleanly) ||
            (prevEndedCleanly && prevWasShort))
        ) {
          startNewPara = true;
        }
      }

      if (startNewPara) {
        flush();
        buffer = text;
      } else {
        // Stitch smoothly into ongoing paragraph!
        if (buffer.endsWith('-') && !buffer.endsWith(' -')) {
          buffer = buffer.slice(0, -1) + text;
        } else {
          buffer = buffer ? `${buffer} ${text}` : text;
        }
      }
    }
  }

  flush();
  return { paragraphs, chapters };
}

const files = fs
  .readdirSync(SACH_DIR)
  .filter((f) => f.toLowerCase().endsWith('.pdf'))
  .sort();

const catalog = [];

for (const file of files) {
  const norm = normalizeKey(file);
  const meta = CURATED_META.find((m) => norm.includes(m.match));
  if (!meta) continue;

  const fullPdfPath = path.join(SACH_DIR, file);
  const data = new Uint8Array(fs.readFileSync(fullPdfPath));
  const doc = await pdfjs.getDocument({ data, verbosity: 0 }).promise;

  // 1. Extract real Page-1 Cover PNG (except Achilles which uses its custom collector cover SVG)
  const coverFilePath = path.join(OUT_COVER_DIR, `${meta.id}.png`);
  let hasCoverPng = false;
  if (meta.id !== 'truong-ca-achilles') {
    hasCoverPng = await extractCoverImage(doc, coverFilePath);
  }

  // 2. Extract outline & visual lines from all pages
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

  const pageLinesList = [];
  for (let p = 2; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const tc = await page.getTextContent();
    pageLinesList.push(extractVisualLines(tc.items));
  }

  const { paragraphs, chapters } = reconstructBookParagraphs(
    pageLinesList,
    pageChapters
  );
  const totalChars = paragraphs.reduce((s, p) => s + p.length, 0);

  const isScanned = totalChars < 2000;
  let estimatedPages = doc.numPages;

  if (!isScanned) {
    const outJsonPath = path.join(OUT_TEXT_DIR, `${meta.id}.json`);
    fs.writeFileSync(
      outJsonPath,
      JSON.stringify({
        id: meta.id,
        sourcePages: doc.numPages,
        chapters,
        paragraphs,
      })
    );
    estimatedPages = Math.max(90, Math.round(totalChars / 1450));
  }

  console.log(
    `OK ${meta.id}: cover=${hasCoverPng ? 'PNG' : meta.id === 'truong-ca-achilles' ? 'CUSTOM' : 'NONE'}, paras=${paragraphs.length}, chars=${totalChars}, estPages=${estimatedPages}`
  );

  catalog.push({
    ...meta,
    totalPages: estimatedPages,
    coverUrl: hasCoverPng ? `./books/covers/${meta.id}.png` : undefined,
    textUrl: !isScanned ? `./books/text/${meta.id}.json` : undefined,
    pdfUrl: isScanned
      ? `./books/${meta.id}.pdf`
      : meta.id === 'truong-ca-achilles'
        ? './books/truong-ca-achilles.pdf'
        : meta.id === 'nguoi-ru-ngu'
          ? './books/nguoi-ru-ngu.pdf'
          : undefined,
  });
}

// Write src/data/defaultBooks.ts cleanly
const tsLines = [
  `import { BookItem } from '../types/book';`,
  ``,
  `export const DEFAULT_BOOKS: BookItem[] = [`,
  ...catalog.map(
    (b, idx) => `  {
    id: ${JSON.stringify(b.id)},
    title: ${JSON.stringify(b.title)},
    author: ${JSON.stringify(b.author)},
    genre: ${JSON.stringify(b.genre)},
    year: ${JSON.stringify(b.year)},
    description: ${JSON.stringify(`${b.title} — ${b.author} (${b.genre}, khoảng ${b.totalPages} trang).`)},${
      b.coverUrl ? `\n    coverUrl: ${JSON.stringify(b.coverUrl)},` : ''
    }${b.textUrl ? `\n    textUrl: ${JSON.stringify(b.textUrl)},` : ''}${
      b.pdfUrl ? `\n    pdfUrl: ${JSON.stringify(b.pdfUrl)},` : ''
    }
    spineColor: ${JSON.stringify(b.spineColor)},
    spineAccent: ${JSON.stringify(b.spineAccent)},
    spineTextColor: ${JSON.stringify(b.spineTextColor)},
    totalPages: ${b.totalPages},
    addedAt: ${1700000000000 + (idx + 1) * 1000},
  },`
  ),
  `];`,
  ``,
];

fs.writeFileSync('d:/sachcuatoi/src/data/defaultBooks.ts', tsLines.join('\n'));
console.log(`\nSuccessfully rebuilt ${catalog.length} books!`);
