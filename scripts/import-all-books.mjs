import fs from 'fs';
import path from 'path';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';

const SACH_DIR = 'd:/sachcuatoi/sach';
const OUT_TEXT_DIR = 'd:/sachcuatoi/public/books/text';
const OUT_COVER_DIR = 'd:/sachcuatoi/public/books/covers';

fs.mkdirSync(OUT_TEXT_DIR, { recursive: true });
fs.mkdirSync(OUT_COVER_DIR, { recursive: true });

// Curated metadata map for crisp Vietnamese titles, authors, genres, publication years & clothbound spine palettes
const CURATED_META = [
  {
    match: 'achilles',
    id: 'truong-ca-achilles',
    title: 'Trường Ca Achilles',
    author: 'Madeline Miller',
    genre: 'Thần thoại · Tiểu thuyết',
    year: '2011',
    spineColor: '#851A2E',
    spineAccent: '#F4D36A',
    spineTextColor: '#F7DC88',
  },
  {
    match: 'ba ngoai',
    id: 'ba-ngoai-toi-gui-loi-xin-loi',
    title: 'Bà Ngoại Tôi Gửi Lời Xin Lỗi',
    author: 'Fredrik Backman',
    genre: 'Tiểu thuyết · Gia đình',
    year: '2013',
    spineColor: '#9E4B5A',
    spineAccent: '#F6DFC2',
    spineTextColor: '#FFF5EB',
  },
  {
    match: 'ca gai',
    id: 'bo-con-ca-gai',
    title: 'Bố Con Cá Gai',
    author: 'Cho Chang In',
    genre: 'Văn học Hàn Quốc',
    year: '2000',
    spineColor: '#2E5B6B',
    spineAccent: '#E8D5A8',
    spineTextColor: '#F4F8FA',
  },
  {
    match: 'britt-marie',
    id: 'britt-marie-da-o-day',
    title: 'Britt-Marie Đã Ở Đây',
    author: 'Fredrik Backman',
    genre: 'Tiểu thuyết đương đại',
    year: '2014',
    spineColor: '#4A6E5D',
    spineAccent: '#F3DFB2',
    spineTextColor: '#F7FBF8',
  },
  {
    match: 'cay cam ngot',
    id: 'cay-cam-ngot-cua-toi',
    title: 'Cây Cam Ngọt Của Tôi',
    author: 'José Mauro de Vasconcelos',
    genre: 'Kinh điển · Tuổi thơ',
    year: '1968',
    spineColor: '#C86432',
    spineAccent: '#FCE5B4',
    spineTextColor: '#FFF7EC',
  },
  {
    match: 'pyjama',
    id: 'chu-be-mang-pyjama-soc',
    title: 'Chú Bé Mang Pyjama Sọc',
    author: 'John Boyne',
    genre: 'Tiểu thuyết lịch sử',
    year: '2006',
    spineColor: '#46586C',
    spineAccent: '#DCE6F0',
    spineTextColor: '#F5F8FB',
  },
  {
    match: 'chung toi dau',
    id: 'chung-toi-dau-voi-cac-ban',
    title: 'Chúng Tôi Đấu Với Các Bạn',
    author: 'Fredrik Backman',
    genre: 'Tiểu thuyết · Tâm lý',
    year: '2017',
    spineColor: '#294054',
    spineAccent: '#DFC592',
    spineTextColor: '#F2F6FA',
  },
  {
    match: 'brooklyn',
    id: 'cay-brooklyn-xanh-biec',
    title: 'Cây Brooklyn Xanh Biếc',
    author: 'Betty Smith',
    genre: 'Kinh điển · Trưởng thành',
    year: '1943',
    spineColor: '#2C5E4A',
    spineAccent: '#EED9A4',
    spineTextColor: '#F2FAF5',
  },
  {
    match: 'giang ho hiem ac',
    id: 'giang-ho-hiem-ac',
    title: 'Giang Hồ Hiểm Ác',
    author: 'Leigh Bardugo',
    genre: 'Kỳ ảo · Grishaverse',
    year: '2016',
    spineColor: '#3B283C',
    spineAccent: '#E5BC74',
    spineTextColor: '#F8EFF9',
  },
  {
    match: 'hai so phan',
    id: 'hai-so-phan',
    title: 'Hai Số Phận',
    author: 'Jeffrey Archer',
    genre: 'Kinh điển · Cuộc đời',
    year: '1979',
    spineColor: '#5B3A29',
    spineAccent: '#E8C584',
    spineTextColor: '#FAF2E8',
  },
  {
    match: 'london',
    id: 'hieu-sach-cuoi-cung-o-london',
    title: 'Hiệu Sách Cuối Cùng Ở London',
    author: 'Madeline Martin',
    genre: 'Tiểu thuyết lịch sử',
    year: '2021',
    spineColor: '#6C323B',
    spineAccent: '#F2D498',
    spineTextColor: '#FCF3F0',
  },
  {
    match: 'paris',
    id: 'hieu-sach-nho-o-paris',
    title: 'Hiệu Sách Nhỏ Ở Paris',
    author: 'Nina George',
    genre: 'Lãng mạn · Chữa lành',
    year: '2013',
    spineColor: '#54688A',
    spineAccent: '#F6E2B8',
    spineTextColor: '#F5F8FC',
  },
  {
    match: 'muu ma chuoc quy',
    id: 'muu-ma-chuoc-quy',
    title: 'Mưu Ma Chước Quỷ',
    author: 'Leigh Bardugo',
    genre: 'Kỳ ảo · Grishaverse',
    year: '2016',
    spineColor: '#242938',
    spineAccent: '#E6B868',
    spineTextColor: '#F4F2EC',
  },
  {
    match: 'muoi',
    id: 'muoi-su-hoi-sinh',
    title: 'Muối - Sự Hồi Sinh Nơi Sâu Thẳm Vụn Vỡ',
    author: 'Tôn Tần',
    genre: 'Tản văn · Chữa lành',
    year: '2022',
    spineColor: '#5E7A82',
    spineAccent: '#F4EAE0',
    spineTextColor: '#F8FBFB',
  },
  {
    match: 'ngan mat troi',
    id: 'ngan-mat-troi-ruc-ro',
    title: 'Ngàn Mặt Trời Rực Rỡ',
    author: 'Khaled Hosseini',
    genre: 'Tiểu thuyết · Nhân văn',
    year: '2007',
    spineColor: '#A8482B',
    spineAccent: '#FBE0A2',
    spineTextColor: '#FFF6EB',
  },
  {
    match: 'ove',
    id: 'nguoi-dan-ong-mang-ten-ove',
    title: 'Người Đàn Ông Mang Tên Ove',
    author: 'Fredrik Backman',
    genre: 'Tiểu thuyết · Hài ấm áp',
    year: '2012',
    spineColor: '#3B647A',
    spineAccent: '#F5DFB0',
    spineTextColor: '#F4F9FC',
  },
  {
    match: 'nguoi ru ngu',
    id: 'nguoi-ru-ngu',
    title: 'Người Ru Ngủ',
    author: 'Donato Carrisi',
    genre: 'Trinh thám · Tâm lý',
    year: '2009',
    spineColor: '#1E2A38',
    spineAccent: '#C5D1DD',
    spineTextColor: '#F0F4F8',
  },
  {
    match: 'ngay thang nam',
    id: 'ngay-thang-nam',
    title: 'Ngày Tháng Năm',
    author: 'Diêm Liên Khoa',
    genre: 'Văn học Trung Quốc',
    year: '1997',
    spineColor: '#7A5B3E',
    spineAccent: '#F2DEC0',
    spineTextColor: '#FAF5EE',
  },
  {
    match: 'phi vu bat kha',
    id: 'phi-vu-bat-kha',
    title: 'Phi Vụ Bất Khả',
    author: 'Leigh Bardugo',
    genre: 'Kỳ ảo · Grishaverse',
    year: '2015',
    spineColor: '#4A2029',
    spineAccent: '#EBC272',
    spineTextColor: '#FBF2EE',
  },
  {
    match: 'qua chuong',
    id: 'qua-chuong-ac-mong',
    title: 'Quả Chuông Ác Mộng',
    author: 'Sylvia Plath',
    genre: 'Kinh điển · Tâm lý',
    year: '1963',
    spineColor: '#665378',
    spineAccent: '#EFE2FA',
    spineTextColor: '#F8F4FC',
  },
  {
    match: 'sau ke bat hao',
    id: 'sau-ke-bat-hao',
    title: 'Sáu Kẻ Bất Hảo',
    author: 'Leigh Bardugo',
    genre: 'Kỳ ảo · Grishaverse',
    year: '2015',
    spineColor: '#252129',
    spineAccent: '#DFB15E',
    spineTextColor: '#F7EFE4',
  },
  {
    match: 'auschwitz',
    id: 'tho-xam-o-auschwitz',
    title: 'Thợ Xăm Ở Auschwitz',
    author: 'Heather Morris',
    genre: 'Tiểu thuyết lịch sử',
    year: '2018',
    spineColor: '#4D4742',
    spineAccent: '#DFC7A2',
    spineTextColor: '#F6F2EC',
  },
  {
    match: 'thu vien nua dem',
    id: 'thu-vien-nua-dem',
    title: 'Thư Viện Nửa Đêm',
    author: 'Matt Haig',
    genre: 'Kỳ ảo · Triết lý sống',
    year: '2020',
    spineColor: '#1E3C47',
    spineAccent: '#F0D084',
    spineTextColor: '#F2F9FA',
  },
  {
    match: 'thi tran nho',
    id: 'thi-tran-nho-giac-mo-lon',
    title: 'Thị Trấn Nhỏ Giấc Mơ Lớn',
    author: 'Fredrik Backman',
    genre: 'Tiểu thuyết · Thị trấn',
    year: '2016',
    spineColor: '#2E4D42',
    spineAccent: '#E8D29B',
    spineTextColor: '#F3FAF6',
  },
  {
    match: 'tan ngay de lai',
    id: 'tan-ngay-de-lai',
    title: 'Tàn Ngày Để Lại',
    author: 'Kazuo Ishiguro',
    genre: 'Kinh điển · Nobel',
    year: '1989',
    spineColor: '#6B4E3D',
    spineAccent: '#F2DBC0',
    spineTextColor: '#FAF4EE',
  },
  {
    match: 'loai tom hat',
    id: 'xa-ngoai-kia-noi-loai-tom-hat',
    title: 'Xa Ngoài Kia Nơi Loài Tôm Hát',
    author: 'Delia Owens',
    genre: 'Tiểu thuyết · Thiên nhiên',
    year: '2018',
    spineColor: '#2D5954',
    spineAccent: '#EBD392',
    spineTextColor: '#F2FAF8',
  },
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

function cleanPageParagraphs(textItems) {
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

  const paragraphs = [];
  let buffer = '';
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].text;
    if (/^\d{1,4}$/.test(line)) continue;
    if (/thuviensach\.vn|sachvui\.com|tve-4u\.org/i.test(line)) continue;

    const prevY = i > 0 ? lines[i - 1].y : null;
    const gap = prevY !== null ? Math.abs(prevY - lines[i].y) : 0;
    const isHeading =
      /^(CHƯƠNG|PHẦN|HỒI|LỜI MỞ ĐẦU|MỞ ĐẦU|BẮT ĐẦU|PHÒNG \d+|CHAPTER)\b/i.test(
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

const files = fs
  .readdirSync(SACH_DIR)
  .filter((f) => f.toLowerCase().endsWith('.pdf'))
  .sort();

const catalog = [];

for (const file of files) {
  const norm = normalizeKey(file);
  const meta = CURATED_META.find((m) => norm.includes(m.match));
  if (!meta) {
    console.warn('Unmatched file:', file);
    continue;
  }

  const outJsonPath = path.join(OUT_TEXT_DIR, `${meta.id}.json`);
  const fullPdfPath = path.join(SACH_DIR, file);
  const data = new Uint8Array(fs.readFileSync(fullPdfPath));
  const doc = await pdfjs.getDocument({ data, verbosity: 0 }).promise;

  let totalChars = 0;
  let paragraphs = [];
  let chapters = [];

  if (fs.existsSync(outJsonPath)) {
    const existing = JSON.parse(fs.readFileSync(outJsonPath, 'utf8'));
    paragraphs = existing.paragraphs || [];
    chapters = existing.chapters || [];
    totalChars = paragraphs.reduce((s, p) => s + p.length, 0);
  } else {
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
        totalChars += para.length;
      }
    }

    // Fallback: if page 2..N had almost no text (e.g. text starts on page 1), include page 1
    if (totalChars < 500) {
      const p1 = await doc.getPage(1);
      const tc1 = await p1.getTextContent();
      const p1Paras = cleanPageParagraphs(tc1.items);
      paragraphs.unshift(...p1Paras);
      totalChars = paragraphs.reduce((s, p) => s + p.length, 0);
    }

    fs.writeFileSync(
      outJsonPath,
      JSON.stringify({
        id: meta.id,
        sourcePages: doc.numPages,
        chapters,
        paragraphs,
      })
    );
  }

  // Estimate standardized print-equivalent page count (~1,450 Vietnamese chars per paperback page)
  // so spine thickness accurately reflects thin vs thick books!
  const estimatedPages = Math.max(80, Math.round(totalChars / 1450));

  console.log(
    `OK ${meta.id}: pdfPages=${doc.numPages}, estPages=${estimatedPages}, chars=${totalChars}, chapters=${chapters.length}`
  );

  catalog.push({
    ...meta,
    totalPages: estimatedPages,
    textUrl: `./books/text/${meta.id}.json`,
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
    description: ${JSON.stringify(`${b.title} — ${b.author} (${b.genre}, khoảng ${b.totalPages} trang).`)},
    textUrl: ${JSON.stringify(b.textUrl)},${
      b.id === 'truong-ca-achilles'
        ? `\n    pdfUrl: './books/truong-ca-achilles.pdf',`
        : b.id === 'nguoi-ru-ngu'
          ? `\n    pdfUrl: './books/nguoi-ru-ngu.pdf',`
          : ''
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
console.log(`\nWrote ${catalog.length} books to src/data/defaultBooks.ts!`);
