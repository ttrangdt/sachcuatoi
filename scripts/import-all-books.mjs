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

function sampleDominantCoverColor(width, height, data, channels) {
  let rSum = 0;
  let gSum = 0;
  let bSum = 0;
  let weightSum = 0;

  // Sample grid across the cover, emphasizing the left edge & background where real book spines meet the front cover
  const stepX = Math.max(1, Math.floor(width / 28));
  const stepY = Math.max(1, Math.floor(height / 36));

  for (let y = Math.floor(height * 0.05); y < height * 0.95; y += stepY) {
    for (let x = Math.floor(width * 0.03); x < width * 0.95; x += stepX) {
      const idx = (y * width + x) * channels;
      const r = data[idx];
      const g = channels === 1 ? r : data[idx + 1];
      const b = channels === 1 ? r : data[idx + 2];

      const maxC = Math.max(r, g, b);
      const minC = Math.min(r, g, b);
      const sat = maxC === 0 ? 0 : (maxC - minC) / maxC;
      const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

      // Give higher weight to left-border colors and rich non-blown-out tones
      const leftBonus = x < width * 0.22 ? 2.2 : 1.0;
      const toneBonus = lum > 0.94 ? 0.35 : 0.7 + sat * 1.4;
      const w = leftBonus * toneBonus;

      rSum += r * w;
      gSum += g * w;
      bSum += b * w;
      weightSum += w;
    }
  }

  if (weightSum === 0) return null;
  const r = Math.round(rSum / weightSum);
  const g = Math.round(gSum / weightSum);
  const b = Math.round(bSum / weightSum);
  const toHex = (n) => Math.max(0, Math.min(255, n)).toString(16).padStart(2, '0');
  const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;

  // Compute perceived brightness for crisp readable spine typography
  const perceivedLum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  const isLight = perceivedLum > 0.62;
  return {
    spineColor: hex,
    spineTextColor: isLight ? '#1F1A17' : '#F8F4EC',
    spineAccent: isLight ? '#5C4328' : '#F0D594',
  };
}

async function extractCoverImage(doc, outPath) {
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
          const sampled = sampleDominantCoverColor(
            bestImg.width,
            bestImg.height,
            bestImg.data,
            channels
          );
          return { ok: true, sampled };
        }
      }
    } catch {
      // try next page
    }
  }
  return { ok: false, sampled: null };
}

const MONG_VUOT_SERIES = {
  id: 'mong-vuot-qua-den',
  name: 'Móng Vuốt Quạ Đen',
  boxColor: '#1E1A22',
  boxAccent: '#DFB664',
};

const CURATED_META = [
  { match: 'achilles', id: 'truong-ca-achilles', title: 'Trường Ca Achilles', author: 'Madeline Miller', genre: 'Thần thoại · Tiểu thuyết', year: '2011', spineColor: '#851A2E', spineAccent: '#F4D36A', spineTextColor: '#F7DC88' },
  { match: 'ba ngoai', id: 'ba-ngoai-toi-gui-loi-xin-loi', title: 'Bà Ngoại Tôi Gửi Lời Xin Lỗi', author: 'Fredrik Backman', genre: 'Tiểu thuyết · Gia đình', year: '2013', spineColor: '#9E4B5A', spineAccent: '#F6DFC2', spineTextColor: '#FFF5EB' },
  { match: 'ca gai', id: 'bo-con-ca-gai', title: 'Bố Con Cá Gai', author: 'Cho Chang In', genre: 'Văn học Hàn Quốc', year: '2000', spineColor: '#2E5B6B', spineAccent: '#E8D5A8', spineTextColor: '#F4F8FA' },
  { match: 'britt-marie', id: 'britt-marie-da-o-day', title: 'Britt-Marie Đã Ở Đây', author: 'Fredrik Backman', genre: 'Tiểu thuyết đương đại', year: '2014', spineColor: '#4A6E5D', spineAccent: '#F3DFB2', spineTextColor: '#F7FBF8' },
  { match: 'cay cam ngot', id: 'cay-cam-ngot-cua-toi', title: 'Cây Cam Ngọt Của Tôi', author: 'José Mauro de Vasconcelos', genre: 'Kinh điển · Tuổi thơ', year: '1968', spineColor: '#C86432', spineAccent: '#FCE5B4', spineTextColor: '#FFF7EC' },
  { match: 'pyjama', id: 'chu-be-mang-pyjama-soc', title: 'Chú Bé Mang Pyjama Sọc', author: 'John Boyne', genre: 'Tiểu thuyết lịch sử', year: '2006', spineColor: '#46586C', spineAccent: '#DCE6F0', spineTextColor: '#F5F8FB' },
  { match: 'chung toi dau', id: 'chung-toi-dau-voi-cac-ban', title: 'Chúng Tôi Đấu Với Các Bạn', author: 'Fredrik Backman', genre: 'Tiểu thuyết · Tâm lý', year: '2017', spineColor: '#294054', spineAccent: '#DFC592', spineTextColor: '#F2F6FA' },
  { match: 'con hoang', id: 'con-hoang', title: 'Con Hoang', author: 'Lê Hồng Nguyên', genre: 'Văn học Việt Nam', year: '2020', spineColor: '#4B3E35', spineAccent: '#EAD2AC', spineTextColor: '#FAF4EC' },
  { match: 'brooklyn', id: 'cay-brooklyn-xanh-biec', title: 'Cây Brooklyn Xanh Biếc', author: 'Betty Smith', genre: 'Kinh điển · Trưởng thành', year: '1943', spineColor: '#2C5E4A', spineAccent: '#EED9A4', spineTextColor: '#F2FAF5' },
  { match: 'sau ke bat hao', id: 'sau-ke-bat-hao', title: 'Sáu Kẻ Bất Hảo', author: 'Leigh Bardugo', genre: 'Kỳ ảo · Móng Vuốt Quạ Đen', year: '2015', spineColor: '#252129', spineAccent: '#DFB15E', spineTextColor: '#F7EFE4', series: { ...MONG_VUOT_SERIES, order: 1 } },
  { match: 'phi vu bat kha', id: 'phi-vu-bat-kha', title: 'Phi Vụ Bất Khả', author: 'Leigh Bardugo', genre: 'Kỳ ảo · Móng Vuốt Quạ Đen', year: '2015', spineColor: '#4A2029', spineAccent: '#EBC272', spineTextColor: '#FBF2EE', series: { ...MONG_VUOT_SERIES, order: 2 } },
  { match: 'muu ma chuoc quy', id: 'muu-ma-chuoc-quy', title: 'Mưu Ma Chước Quỷ', author: 'Leigh Bardugo', genre: 'Kỳ ảo · Móng Vuốt Quạ Đen', year: '2016', spineColor: '#242938', spineAccent: '#E6B868', spineTextColor: '#F4F2EC', series: { ...MONG_VUOT_SERIES, order: 3 } },
  { match: 'giang ho hiem ac', id: 'giang-ho-hiem-ac', title: 'Giang Hồ Hiểm Ác', author: 'Leigh Bardugo', genre: 'Kỳ ảo · Móng Vuốt Quạ Đen', year: '2016', spineColor: '#3B283C', spineAccent: '#E5BC74', spineTextColor: '#F8EFF9', series: { ...MONG_VUOT_SERIES, order: 4 } },
  { match: 'hai so phan', id: 'hai-so-phan', title: 'Hai Số Phận', author: 'Jeffrey Archer', genre: 'Kinh điển · Cuộc đời', year: '1979', spineColor: '#5B3A29', spineAccent: '#E8C584', spineTextColor: '#FAF2E8' },
  { match: 'london', id: 'hieu-sach-cuoi-cung-o-london', title: 'Hiệu Sách Cuối Cùng Ở London', author: 'Madeline Martin', genre: 'Tiểu thuyết lịch sử', year: '2021', spineColor: '#6C323B', spineAccent: '#F2D498', spineTextColor: '#FCF3F0' },
  { match: 'paris', id: 'hieu-sach-nho-o-paris', title: 'Hiệu Sách Nhỏ Ở Paris', author: 'Nina George', genre: 'Lãng mạn · Chữa lành', year: '2013', spineColor: '#54688A', spineAccent: '#F6E2B8', spineTextColor: '#F5F8FC' },
  { match: 'muoi', id: 'muoi-su-hoi-sinh', title: 'Muối - Sự Hồi Sinh Nơi Sâu Thẳm Vụn Vỡ', author: 'Tôn Tần', genre: 'Tản văn · Chữa lành', year: '2022', spineColor: '#5E7A82', spineAccent: '#F4EAE0', spineTextColor: '#F8FBFB' },
  { match: 'ngan mat troi', id: 'ngan-mat-troi-ruc-ro', title: 'Ngàn Mặt Trời Rực Rỡ', author: 'Khaled Hosseini', genre: 'Tiểu thuyết · Nhân văn', year: '2007', spineColor: '#A8482B', spineAccent: '#FBE0A2', spineTextColor: '#FFF6EB' },
  { match: 'ove', id: 'nguoi-dan-ong-mang-ten-ove', title: 'Người Đàn Ông Mang Tên Ove', author: 'Fredrik Backman', genre: 'Tiểu thuyết · Hài ấm áp', year: '2012', spineColor: '#3B647A', spineAccent: '#F5DFB0', spineTextColor: '#F4F9FC' },
  { match: 'nguoi ru ngu', id: 'nguoi-ru-ngu', title: 'Người Ru Ngủ', author: 'Donato Carrisi', genre: 'Trinh thám · Tâm lý', year: '2009', spineColor: '#1E2A38', spineAccent: '#C5D1DD', spineTextColor: '#F0F4F8' },
  { match: 'ngay thang nam', id: 'ngay-thang-nam', title: 'Ngày Tháng Năm', author: 'Diêm Liên Khoa', genre: 'Văn học Trung Quốc', year: '1997', spineColor: '#7A5B3E', spineAccent: '#F2DEC0', spineTextColor: '#FAF5EE' },
  { match: 'qua chuong', id: 'qua-chuong-ac-mong', title: 'Quả Chuông Ác Mộng', author: 'Sylvia Plath', genre: 'Kinh điển · Tâm lý', year: '1963', spineColor: '#665378', spineAccent: '#EFE2FA', spineTextColor: '#F8F4FC' },
  { match: 'auschwitz', id: 'tho-xam-o-auschwitz', title: 'Thợ Xăm Ở Auschwitz', author: 'Heather Morris', genre: 'Tiểu thuyết lịch sử', year: '2018', spineColor: '#4D4742', spineAccent: '#DFC7A2', spineTextColor: '#F6F2EC' },
  { match: 'thu vien nua dem', id: 'thu-vien-nua-dem', title: 'Thư Viện Nửa Đêm', author: 'Matt Haig', genre: 'Kỳ ảo · Triết lý sống', year: '2020', spineColor: '#1E3C47', spineAccent: '#F0D084', spineTextColor: '#F2F9FA' },
  { match: 'thi tran nho', id: 'thi-tran-nho-giac-mo-lon', title: 'Thị Trấn Nhỏ Giấc Mơ Lớn', author: 'Fredrik Backman', genre: 'Tiểu thuyết · Thị trấn', year: '2016', spineColor: '#2E4D42', spineAccent: '#E8D29B', spineTextColor: '#F3FAF6' },
  { match: 'tan ngay de lai', id: 'tan-ngay-de-lai', title: 'Tàn Ngày Để Lại', author: 'Kazuo Ishiguro', genre: 'Kinh điển · Nobel', year: '1989', spineColor: '#6B4E3D', spineAccent: '#F2DBC0', spineTextColor: '#FAF4EE' },
  { match: 'bay ngay cho chet', id: 'bay-ngay-cho-chet', title: 'Bảy Ngày Chờ Chết', author: 'Holly Jackson', genre: 'Trinh thám · Giật gân', year: '2024', spineColor: '#2A2F3D', spineAccent: '#E8C57B', spineTextColor: '#F4F6FA' },
  { match: 'chien-tranh-khong-co-mot-khuon-mat', id: 'chien-tranh-khong-co-mot-khuon-mat-phu-nu', title: 'Chiến Tranh Không Có Một Khuôn Mặt Phụ Nữ', author: 'Svetlana Alexievich', genre: 'Phi hư cấu · Nobel', year: '1985', spineColor: '#5B3A38', spineAccent: '#ECD3A8', spineTextColor: '#FAF4EE' },
  { match: 'nam ke song sot', id: 'nam-ke-song-sot', title: 'Năm Kẻ Sống Sót', author: 'Holly Jackson', genre: 'Trinh thám · Giật gân', year: '2022', spineColor: '#23303B', spineAccent: '#E4B86E', spineTextColor: '#F2F6FA' },
  { match: 'nguoi-dua-dieu', id: 'nguoi-dua-dieu', title: 'Người Đua Diều', author: 'Khaled Hosseini', genre: 'Kinh điển · Nhân văn', year: '2003', spineColor: '#3D5D73', spineAccent: '#F3DAB0', spineTextColor: '#F5F9FC' },
  { match: 'hoathan', id: 'hoa-than', title: 'Hóa Thân', author: 'Franz Kafka', genre: 'Kinh điển · Văn học Đức', year: '1915', spineColor: '#3A3A38', spineAccent: '#DFC79A', spineTextColor: '#F5F2EB' },
  { match: 'suoinguon', id: 'suoi-nguon', title: 'Suối Nguồn', author: 'Ayn Rand', genre: 'Kinh điển · Triết lý', year: '1943', spineColor: '#2B4257', spineAccent: '#EBC878', spineTextColor: '#F5F7FA' },
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
  // Group items into visual lines by Y-coordinate (±4pt tolerance), handling out-of-order PDF streams
  const rawLines = [];
  for (const item of textItems) {
    if (!item.str) continue;
    const y = Math.round(item.transform[5]);
    let bucket = rawLines.find((rl) => Math.abs(rl.y - y) <= 4);
    if (!bucket) {
      bucket = { y, items: [] };
      rawLines.push(bucket);
    }
    bucket.items.push(item);
  }

  // Sort top-to-bottom (higher PDF Y = higher on the page) so headers/titles ALWAYS precede body prose!
  rawLines.sort((a, b) => b.y - a.y);

  const lines = [];
  for (let idx = 0; idx < rawLines.length; idx++) {
    const rl = rawLines[idx];
    rl.items.sort((a, b) => a.transform[4] - b.transform[4]);
    const text = rl.items
      .map((it) => it.str)
      .join(' ')
      .replace(/\s+/g, ' ')
      .replace(/\s+([,.;:!?…”»])/g, '$1')
      .replace(/([“«(])\s+/g, '$1')
      .trim();
    if (!text) continue;
    // Strip pure page numbers (usually 1-3 digits, or 4 digits <= 1500 at very top/bottom of page),
    // while keeping year headings like "1952", "1969" inside the story!
    const isEdgeLine = idx === 0 || idx === rawLines.length - 1;
    if (/^\d{1,3}$/.test(text) && isEdgeLine) continue;
    if (/^\d{4}$/.test(text) && isEdgeLine && Number(text) <= 1500) continue;
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
function fixDropCapSpacing(text) {
  // Fix PDF drop-cap split like "B ố thật là..." -> "Bố thật là...", "G iống như..." -> "Giống như..."
  // Preserve valid standalone 1-letter Vietnamese words (Ô, Ơ, À, Á, Ở, Ý, A, E, I, O, U)
  return text.replace(
    /^([BCDĐFGHJKLMNPQRSTVWXZ])\s+([a-zđàáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵ]{2,})/,
    '$1$2'
  );
}

function isCopyrightPage(lines) {
  if (!lines || lines.length === 0 || lines.length > 14) return false;
  const joined = lines.map((l) => l.text).join(' ');
  if (joined.length > 420) return false; // Real prose page is much longer!
  return /(tác giả\s*:|người dịch\s*:|dịch giả\s*:|phát hành\s*:|ebook©|vctvegroup|mọt truyện|quét mã qr|isbn|bản quyền)/i.test(
    joined
  );
}

function reconstructBookParagraphs(pageLinesList, pageChapters) {
  const paragraphs = [];
  const chapters = [];
  let buffer = '';

  const flush = () => {
    const cleaned = fixDropCapSpacing(buffer.replace(/\s+/g, ' ').trim());
    if (cleaned) paragraphs.push(cleaned);
    buffer = '';
  };

  const pushPageBreak = () => {
    flush();
    if (
      paragraphs.length > 0 &&
      paragraphs[paragraphs.length - 1] !== '---PAGEBREAK---'
    ) {
      paragraphs.push('---PAGEBREAK---');
    }
  };

  for (let pIdx = 0; pIdx < pageLinesList.length; pIdx++) {
    const pdfPageNum = pIdx + 2;
    const lines = pageLinesList[pIdx];

    if (!lines || lines.length === 0) continue;

    // 1. Dedicated Copyright / Publisher Info Page (ONLY on first 5 PDF pages and strictly short!)
    if (pdfPageNum <= 5 && isCopyrightPage(lines)) {
      pushPageBreak();
      for (const line of lines) {
        const t = fixDropCapSpacing(line.text.trim());
        if (t) paragraphs.push(`:: ${t}`);
      }
      pushPageBreak();
      continue;
    }

    // 2. Dedicated TOC page (ONLY on first 6 PDF pages if titled "MỤC LỤC" or "Table of Contents")
    if (
      pdfPageNum <= 6 &&
      lines.some((l) => /^(MỤC LỤC|TABLE OF CONTENTS)$/i.test(l.text.trim()))
    ) {
      pushPageBreak();
      for (const line of lines) {
        const t = fixDropCapSpacing(line.text.trim());
        if (!t) continue;
        if (/^(MỤC LỤC|TABLE OF CONTENTS)$/i.test(t)) {
          paragraphs.push(`## ${t}`);
        } else {
          paragraphs.push(`:: ${t}`);
        }
      }
      pushPageBreak();
      continue;
    }

    // 3. Official PDF Outline Chapter / Section Start: ALWAYS start on a fresh page & ensure title is shown!
    let outlineHeadingInserted = false;
    if (pageChapters.has(pdfPageNum)) {
      const outlineTitle = pageChapters.get(pdfPageNum);
      const isNoiseTitle =
        /^(bìa|cover|bìa sách|title page|start|thông tin|thông tin ebook|\.\.\.)$/i.test(outlineTitle) ||
        /^\[\d+\]$/.test(outlineTitle) ||
        /\.x?html?$/i.test(outlineTitle);
      if (!isNoiseTitle) {
        pushPageBreak();
        chapters.push({
          title: outlineTitle,
          paragraphIndex: paragraphs.length,
        });

        // Check if the first 2 lines on this PDF page already contain this heading text
        const firstTwoNorm = lines
          .slice(0, 2)
          .map((l) => normalizeKey(l.text))
          .join(' ');
        const titleNorm = normalizeKey(outlineTitle);
        if (!firstTwoNorm.includes(titleNorm)) {
          // Original PDF rendered the heading as an image graphic -> preserve it cleanly!
          paragraphs.push(`## ${outlineTitle}`);
          outlineHeadingInserted = true;
        }
      }
    }

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
      const text = fixDropCapSpacing(line.text);
      const prevLine = i > 0 ? lines[i - 1] : null;
      const gap = prevLine ? Math.abs(prevLine.y - line.y) : 0;

      // STRICT heading detection: numbered chapters, known literary sections, or exact outline match
      const isNumberedChapter =
        /^(CHƯƠNG|PHẦN|HỒI|QUYỂN|CHAPTER|PART)\s+(\d+|[IVXLCDM]+|MỘT|HAI|BA|BỐN|NĂM|SÁU|BẢY|TÁM|CHÍN|MƯỜI)(\b|\s|:|-)/i.test(
          text
        ) &&
        text.length < 55 &&
        !/[.,!?]$/.test(text);

      const isKnownSectionTitle =
        /^(LỜI MỞ ĐẦU|MỞ ĐẦU|LỜI GIỚI THIỆU|LỜI NÓI ĐẦU|LỜI TỰA|LỜI CẢM ƠN|MỤC LỤC|PHẦN MỞ ĐẦU|PHẦN KẾT|VĨ THANH|BẮT ĐẦU|PHÒNG \d+)$/i.test(
          text
        );

      const matchesOutline =
        pageChapters.has(pdfPageNum) &&
        normalizeKey(text) === normalizeKey(pageChapters.get(pdfPageNum));

      const isHeading = isNumberedChapter || isKnownSectionTitle || matchesOutline;

      // Avoid duplicating heading if we already injected a richer outline title on line 0 (e.g. "## I: ĐỒNG LẦY" vs "ĐỒNG LẦY")
      if (
        outlineHeadingInserted &&
        i === 0 &&
        text.length >= 3 &&
        paragraphs.length > 0 &&
        normalizeKey(paragraphs[paragraphs.length - 1].replace(/^##\s+/, '')).includes(
          normalizeKey(text)
        )
      ) {
        continue;
      }

      if (isHeading) {
        // Avoid duplicating heading if we already injected it from outline
        if (
          outlineHeadingInserted &&
          paragraphs.length > 0 &&
          normalizeKey(paragraphs[paragraphs.length - 1].replace(/^##\s+/, '')) ===
          normalizeKey(text)
        ) {
          continue;
        }
        // Only start a new page if there's already substantial content before this heading (not right after another heading)
        const prevItem = paragraphs[paragraphs.length - 1] || '';
        if (!prevItem.startsWith('## ') && prevItem !== '---PAGEBREAK---') {
          pushPageBreak();
        } else {
          flush();
        }
        paragraphs.push(`## ${text}`);
        continue;
      }

      const isIndented = line.x > baseLeftX + 12;
      const isExtraVerticalGap = prevLine !== null && gap > normalLeading * 1.38;
      const startsDialogue = /^[-–—«“"]/.test(text);
      const prevEndedCleanly = /[.!?…”»":]$/.test(buffer);
      const prevWasShort = prevLine !== null && prevLine.width < maxWidth * 0.78;

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

  // 1. Extract real Page-1 Cover PNG & sample its real dominant color for the book spine!
  const coverFilePath = path.join(OUT_COVER_DIR, `${meta.id}.png`);
  let hasCoverPng = false;
  let sampledColors = null;
  if (meta.id !== 'truong-ca-achilles') {
    const res = await extractCoverImage(doc, coverFilePath);
    hasCoverPng = res.ok;
    sampledColors = res.sampled;
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
    spineColor: sampledColors?.spineColor || meta.spineColor,
    spineAccent: sampledColors?.spineAccent || meta.spineAccent,
    spineTextColor: sampledColors?.spineTextColor || meta.spineTextColor,
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

// Auto-detect any future series sharing a common prefix (e.g. "Tên Truyện - Tập 1", "Tên Truyện - Tập 2")
const prefixBuckets = new Map();
for (const b of catalog) {
  if (b.series) continue;
  const m = b.title.match(/^(.+?)\s*(?:[-–—:]\s*)?(?:Tập|Phần|Quyển|Book|Vol\.?)\s*(\d+)$/i);
  if (m) {
    const baseName = m[1].trim();
    const volNum = parseInt(m[2], 10);
    const key = normalizeKey(baseName).replace(/\s+/g, '-');
    const arr = prefixBuckets.get(key) || [];
    arr.push({ book: b, baseName, volNum });
    prefixBuckets.set(key, arr);
  }
}
for (const [key, items] of prefixBuckets.entries()) {
  if (items.length >= 2) {
    items.sort((a, b) => a.volNum - b.volNum);
    const first = items[0].book;
    for (const item of items) {
      item.book.series = {
        id: key,
        name: item.baseName,
        order: item.volNum,
        boxColor: first.spineColor,
        boxAccent: first.spineAccent,
      };
    }
  }
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
    description: ${JSON.stringify(`${b.title} — ${b.author} (${b.genre}, khoảng ${b.totalPages} trang).`)},${b.coverUrl ? `\n    coverUrl: ${JSON.stringify(b.coverUrl)},` : ''
      }${b.textUrl ? `\n    textUrl: ${JSON.stringify(b.textUrl)},` : ''}${b.pdfUrl ? `\n    pdfUrl: ${JSON.stringify(b.pdfUrl)},` : ''
      }
    spineColor: ${JSON.stringify(b.spineColor)},
    spineAccent: ${JSON.stringify(b.spineAccent)},
    spineTextColor: ${JSON.stringify(b.spineTextColor)},
    totalPages: ${b.totalPages},
    addedAt: ${1700000000000 + (idx + 1) * 1000},${b.series ? `\n    series: ${JSON.stringify(b.series)},` : ''
      }
  },`
  ),
  `];`,
  ``,
];

fs.writeFileSync('d:/sachcuatoi/src/data/defaultBooks.ts', tsLines.join('\n'));
console.log(`\nSuccessfully rebuilt ${catalog.length} books!`);
