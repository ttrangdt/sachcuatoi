# sachcuatoi

Website lưu trữ và đọc sách cá nhân (Front-end React + Vite), tối ưu cho cả PC và Mobile.

## Tính năng nổi bật

- **Giao diện Tủ Sách gỗ trực quan**: Hiển thị sách với bìa thật (trích xuất từ PDF) hoặc chế độ xếp gáy sách trên kệ gỗ.
- **Rê chuột xem & lật sách ngay (PC)**: Khi lia con trỏ vào gáy bìa hoặc bìa sách, hiển thị khung đọc sách thật với bìa, số trang, mục lục và lật từng trang.
- **Trình đọc sách thật (PC & Mobile)**:
  - PC: Mở 2 trang song song có nếp gáy sách & hiệu ứng lật trang 3D, hỗ trợ phím mũi tên `←` `→`.
  - Mobile: Hiển thị 1 trang sắc nét, hỗ trợ vuốt trái/phải hoặc chạm cạnh để lật trang.
  - Tự động đọc **Mục lục (TOC)** từ tệp PDF, đánh số trang, và 4 chế độ ánh sáng giấy đọc (`Kem ấm`, `Trắng sáng`, `Giấy cổ`, `Đèn đêm`).
- **Đánh dấu trang với công cụ trang trí**: 6 mẫu thẻ kẹp sách trang trí (*Dải lụa đỏ đô, Tua rua hoàng kim, Lá phong ép khô, Kẹp giấy đồng thau, Thẻ hoa anh đào, Nhung xanh ngọc*), tự động mở lại đúng trang đã đánh dấu ở lần đọc tiếp theo.
- **Kho lưu trữ Sách Đã Đọc Xong**: Tự động theo dõi thời gian hoàn thành cuốn sách (tính theo ngày, nếu dưới 1 ngày tính theo giờ) và thời gian kể từ lần cuối đọc sách.
- **Hỗ trợ thêm sách PDF cá nhân**: Có sẵn 2 cuốn *Trường Ca Achilles* và *Người Ru Ngủ*, đồng thời cho phép tải thêm tệp PDF mới lưu trực tiếp trên trình duyệt.

## Chạy dự án

```bash
npm install
npm run dev
```

## Build production

```bash
npm run build
```
