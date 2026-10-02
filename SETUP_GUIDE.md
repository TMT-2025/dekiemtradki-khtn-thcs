# HƯỚNG DẪN CÀI ĐẶT & VẬN HÀNH (SETUP GUIDE)
## KHTN ASSESSMENT STUDIO — CHƯƠNG TRÌNH GDPT 2018

Tài liệu này hướng dẫn chi tiết các bước cài đặt, cấu hình và triển khai hệ thống **KHTN Assessment Studio**.

---

## 1. YÊU CẦU HỆ THỐNG TỐI THIỂU

- **Hệ điều hành**: Windows 10/11, macOS, hoặc Linux.
- **Node.js**: Phiên bản 18.17.0 trở lên (khuyên dùng Node.js 20 LTS hoặc 22 LTS).
- **Trình quản lý gói**: `npm` v9+ hoặc `pnpm` / `yarn`.
- **Trình duyệt web**: Google Chrome, Microsoft Edge, Mozilla Firefox hoặc Safari phiên bản mới nhất.

---

## 2. CÀI ĐẶT NHANH (QUICK START - CHẾ ĐỘ LOCAL)

Hệ thống được thiết kế với cơ chế **Local-First Zero-Setup**, tích hợp sẵn cơ sở dữ liệu tệp cục bộ (`database/local_store.json`), có thể hoạt động hoàn toàn offline mà không đòi hỏi cài đặt máy chủ cơ sở dữ liệu bên ngoài.

### Bước 1: Mở Terminal tại thư mục dự án
```bash
cd "e:\. UNG DUNG MOI\KHTN"
```

### Bước 2: Cài đặt các gói phụ thuộc (Dependencies)
```bash
npm install
```

### Bước 3: Khởi chạy ứng dụng ở chế độ Phát triển (Development)
```bash
npm run dev
```

Sau khi khởi chạy thành công, mở trình duyệt web và truy cập địa chỉ:
👉 **`http://localhost:3000`**

---

## 3. CẤU HÌNH BIẾN MÔI TRƯỜNG (`.env.local`)

Hệ thống đi kèm tệp `.env.local` mẫu với các thiết lập mặc định:

```env
# Môi trường chạy
NODE_ENV=development

# Cấu hình AI Provider (GEMINI, OPENAI, ANTHROPIC, hoặc MOCK)
AI_PROVIDER=GEMINI

# Khóa API của Google Gemini (Khuyên dùng gemini-1.5-pro hoặc gemini-2.0-flash)
GEMINI_API_KEY=your_gemini_api_key_here

# (Tùy chọn) Khóa API OpenAI
OPENAI_API_KEY=your_openai_api_key_here

# (Tùy chọn) Khóa API Anthropic Claude
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# (Tùy chọn) Kết nối PostgreSQL / Supabase
DATABASE_URL=postgresql://postgres:password@localhost:5432/khtn_studio
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

> **Lưu ý quan trọng**:
> - Nếu bạn chưa nhập `GEMINI_API_KEY`, hệ thống sẽ tự động kích hoạt **Mock Provider thông minh**, sinh câu hỏi mẫu chuẩn GDPT 2018 theo đúng ma trận và cấu trúc mà không phát sinh lỗi.
> - Khi bạn điền `GEMINI_API_KEY`, hệ thống sẽ gọi trực tiếp mô hình AI của Google để phân tích văn bản và sinh câu hỏi thời gian thực bám sát YCCĐ.

---

## 4. CẤU HÌNH CƠ SỞ DỮ LIỆU ĐÁM MÂY (SUPABASE / POSTGRESQL) - TÙY CHỌN

Nếu muốn triển khai cho trường học hoặc tổ bộ môn nhiều giáo viên cùng truy cập:

1. Tạo một dự án mới trên [Supabase](https://supabase.com) hoặc cài đặt PostgreSQL cục bộ.
2. Mở cửa sổ **SQL Editor** trong trang quản trị Supabase.
3. Chạy lần lượt 2 kịch bản SQL đã chuẩn bị sẵn:
   - **Kịch bản 1 - Cấu trúc bảng và RLS**: Chạy nội dung tệp [database/001_initial_schema.sql](file:///e:/.%20UNG%20DUNG%20MOI/KHTN/database/001_initial_schema.sql).
   - **Kịch bản 2 - Nạp dữ liệu 195 bài học KHTN 6-9**: Chạy nội dung tệp [database/002_seed_curriculum.sql](file:///e:/.%20UNG%20DUNG%20MOI/KHTN/database/002_seed_curriculum.sql).
4. Điền URL và Khóa bí mật vào `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

---

## 5. CHẠY KIỂM THỬ TỰ ĐỘNG (AUTOMATED TEST SUITE)

Hệ thống được trang bị bộ kiểm thử tự động toàn diện bằng `Vitest`:

### Chạy toàn bộ các bộ kiểm thử:
```bash
npm run test
```

### Kết quả kiểm thử chuẩn:
- `tests/matrix-engine.test.ts`: Kiểm tra thuật toán phân bổ Hamilton-Hare 16 bước, bảo đảm chính xác 10,0 điểm và 100%.
- `tests/spec-engine.test.ts`: Kiểm tra tính ánh xạ 1:1 từ Ma trận sang Bản đặc tả.
- `tests/question-engine.test.ts`: Kiểm tra bộ lọc 14 tiêu chuẩn chất lượng câu hỏi khảo thí.
- `tests/test-and-quality.test.ts`: Kiểm tra thuật toán lắp ráp đề thi (Auto & Manual) và Quality Gate.
- `tests/export.test.ts`: Kiểm tra việc đóng gói và xuất 5 tệp Word OpenXML (`.docx`) và Excel (`.xlsx`).
- `tests/e2e-all-grades.test.ts`: Kiểm thử toàn trình (E2E) trên toàn bộ 4 khối lớp (KHTN 6, 7, 8, 9).

---

## 6. ĐÓNG GÓI & TRIỂN KHAI SẢN PHẨM (PRODUCTION BUILD)

Để đóng gói ứng dụng cho môi trường chạy thực tế:

```bash
# Biên dịch và tối ưu hóa ứng dụng
npm run build

# Khởi chạy máy chủ sản xuất
npm run start
```

Hệ thống có thể được triển khai dễ dàng lên các nền tảng đám mây như **Vercel**, **Docker**, **Render**, hoặc máy chủ Windows/Linux nội bộ của trường học.
