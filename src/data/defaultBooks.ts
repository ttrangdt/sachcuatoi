import { BookItem } from '../types/book';

export const DEFAULT_BOOKS: BookItem[] = [
  {
    id: 'truong-ca-achilles',
    title: 'Trường Ca Achilles',
    author: 'Madeline Miller',
    genre: 'Tiểu thuyết · Thần thoại',
    description:
      'Bản trường ca sâu lắng về tình bạn, định mệnh và vinh quang giữa Patroclus và anh hùng Achilles trước cuộc chiến thành Troy.',
    pdfUrl: './books/truong-ca-achilles.pdf',
    spineColor: '#851A2E',
    spineAccent: '#F4D36A',
    spineTextColor: '#F7DC88',
    totalPages: 378,
    addedAt: 1700000001000,
  },
  {
    id: 'nguoi-ru-ngu',
    title: 'Người Ru Ngủ',
    author: 'Donato Carrisi',
    genre: 'Trinh thám · Tâm lý',
    description:
      'Một vụ án bí ẩn với sáu cánh tay bị chôn vùi trong khu rừng tĩnh lặng, mở ra hành trình lần theo dấu vết kẻ thao túng bóng tối.',
    pdfUrl: './books/nguoi-ru-ngu.pdf',
    spineColor: '#1E2A38',
    spineAccent: '#C5D1DD',
    spineTextColor: '#F0F4F8',
    totalPages: 1334,
    addedAt: 1700000002000,
  },
];
