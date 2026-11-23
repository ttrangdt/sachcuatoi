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
    spineColor: '#2B423D',
    spineAccent: '#D4A857',
    spineTextColor: '#F5EAD6',
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
    spineColor: '#4A1F24',
    spineAccent: '#C99B63',
    spineTextColor: '#F7EFE6',
    totalPages: 1334,
    addedAt: 1700000002000,
  },
];
