# BÁO CÁO CẤU HÌNH VÀ KÍCH HOẠT GEMINI AI TRÊN VERCEL
**KHTN Assessment Studio — Vercel Production Deployment**  
*Thời gian thực hiện: 2026-10-02*

---

## 1. Vercel Project
- **Project Name**: `dekiemtradki-khtn-thcs`
- **Vercel Team / Account**: `tm-thanh-s-projects` (`tranminhthanhpvt-2415`)
- **GitHub Repository**: `https://github.com/TMT-2025/dekiemtradki-khtn-thcs`
- **Framework**: Next.js 14.2.35 (App Router)

---

## 2. Deployment URLs
- **Vercel Production Canonical**: [`https://dekiemtradki-khtn-thcs.vercel.app`](https://dekiemtradki-khtn-thcs.vercel.app)
- **Latest Deployment**: `https://dekiemtradki-khtn-thcs-fb2a9byhc-tm-thanh-s-projects.vercel.app`
- **Custom Domain (Chờ DNS)**: `https://khtn-assessment.edu.vn`

---

## 3. Environment Variables Configured on Vercel
Các biến môi trường hiện diện trên môi trường Production của Vercel (được kiểm tra qua `vercel env ls`):

| Tên biến | Trạng thái / Kiểu | Môi trường | Giá trị thực tế |
|---|---|---|---|
| `NEXT_PUBLIC_APP_ENV` | `Config` | Production | `production` |
| `NEXT_PUBLIC_APP_URL` | `Config` | Production | `https://dekiemtradki-khtn-thcs.vercel.app` |
| `SUPABASE_REQUIRED` | `Secret` (Hidden) | Production | `false` (Giữ nguyên, không thay đổi) |
| `AI_PROVIDER` | `Secret` (Hidden) | Production | `GEMINI` (Đã cấu hình thành công) |
| `GEMINI_API_KEY` | *Chưa cấu hình* | Production | Đang chờ người dùng thêm trực tiếp trên Vercel Dashboard |

> **Bảo mật tuyệt đối**: Không có API key nào được hiển thị trong log, terminal, commit git hay tài liệu.

---

## 4. Trạng Thái Gemini Model (Kiểm Tra Kỹ Thuật)

### 4.1. Khảo sát mã nguồn hiện tại
- **Tệp định nghĩa**: `lib/ai-providers/gemini-provider.ts` (dòng 10)
- **Model mặc định trong mã nguồn**:
  ```typescript
  this.model = model || process.env.GEMINI_MODEL || 'gemini-1.5-pro';
  ```
- **Endpoint gọi API**:
  `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`

### 4.2. Đánh giá tính tương thích và khuyến nghị
1. **Model hiện tại (`gemini-1.5-pro`)**:
   - Vẫn được endpoint Google Gemini REST `v1beta` hỗ trợ cho sinh văn bản và JSON có cấu trúc.
   - Tuy nhiên, đây là thế hệ 1.5 cũ hơn.
2. **Model được khuyến nghị**:
   - **`gemini-2.5-flash`** *(Khuyến nghị số 1)*: Thế hệ Gemini 2.5 GA mới nhất, tốc độ phản hồi cực nhanh (<1s), chi phí tối ưu, hỗ trợ suy luận và sinh JSON cấu trúc chuẩn mực cho các bài kiểm tra KHTN.
   - **`gemini-2.5-pro`** *(Khuyến nghị số 2)*: Chuyên sâu cho các bài toán suy luận phức tạp và câu hỏi Vận dụng cao (M4).
3. **Quyết định tuân thủ nguyên tắc**:
   - Giữ nguyên cấu hình mặc định trong source code (`gemini-1.5-pro`).
   - KHÔNG tự ý sửa mã nguồn hay ép model mới lên production trước khi có sự chấp thuận từ người dùng.
   - Nếu muốn chuyển đổi, người dùng chỉ cần thêm biến môi trường `GEMINI_MODEL=gemini-2.5-flash` trên Vercel Dashboard mà không cần thay đổi source code.

---

## 5. Kiểm Thử Hệ Thống Thực Tế (Live Production Smoke Test)

### 5.1. Kiểm thử giao diện và định tuyến (HTTP 200 OK)
Tất cả các route cốt lõi trên `https://dekiemtradki-khtn-thcs.vercel.app` đã được truy vấn và phản hồi HTTP 200:
- `GET /` — **200 OK** (Trang chủ & Dashboard tổng quan)
- `GET /curriculum` — **200 OK** (Dữ liệu 195 bài học KHTN 6, 7, 8, 9)
- `GET /matrix` — **200 OK** (Giao diện thiết lập ma trận đề thi)
- `GET /specification` — **200 OK** (Bản đặc tả câu hỏi theo YCCĐ)
- `GET /question-bank` — **200 OK** (Ngân hàng câu hỏi 4 dạng thức)
- `GET /context-library` — **200 OK** (Thư viện bối cảnh thực tiễn KHTN)
- `GET /tests` — **200 OK** (Tạo và quản lý đề thi)
- `GET /export` — **200 OK** (Xuất trọn gói 6 văn bản DOCX/XLSX)
- `GET /settings` — **200 OK** (Cấu hình và quy chuẩn pháp lý GDPT 2018)

### 5.2. Kiểm thử AI Mock Fallback trên Production
- **Endpoint**: `POST https://dekiemtradki-khtn-thcs.vercel.app/api/questions/generate-ai`
- **Payload kiểm thử**:
  ```json
  {
    "lessonId": "lesson-6-1",
    "cognitiveLevel": "THONG_HIEU",
    "questionType": "MULTIPLE_CHOICE",
    "score": 0.25
  }
  ```
- **Kết quả thực tế từ máy chủ Vercel**:
  - Trả về mã HTTP: **200 OK**
  - Đối tượng câu hỏi: Tạo thành công câu hỏi chuẩn theo bài học KHTN 6 Kết nối tri thức.
  - Phân loại nhận thức: `THONG_HIEU` (M2).
  - Đáp án chuẩn: `A` kèm giải thích khoa học và căn cứ sư phạm.
  - Báo cáo chất lượng (`qualityReport.isValid`): `true`.
  - Cơ chế tự vệ (Fallback): Do chưa có `GEMINI_API_KEY`, hệ thống kích hoạt mượt mà bộ sinh sư phạm bản địa (pedagogical grounding mock) mà không phát sinh lỗi 500 hay làm gián đoạn trải nghiệm người dùng.

---

## 6. Trạng Thái Supabase
- **Trạng thái**: `NOT ACTIVATED`
- Biến `SUPABASE_REQUIRED` = `false` trên Vercel.
- Không có bất kỳ biến nhạy cảm hay bí mật Supabase nào bị tạo giả mạo.

---

## 7. Hướng Dẫn Kích Hoạt Live Gemini API Key (Dành Cho Giáo Viên / Quản Trị Viên)

Để kích hoạt tính năng gọi trực tiếp Google Gemini AI bằng API Key thật:
1. Đăng nhập vào tài khoản Vercel tại:
   `https://vercel.com/tm-thanh-s-projects/dekiemtradki-khtn-thcs/settings/environment-variables`
2. Bấm **Add Environment Variable**:
   - **Key**: `GEMINI_API_KEY`
   - **Value**: Dán khóa API của bạn từ Google AI Studio (bắt đầu bằng `AIzaSy...`)
   - **Environments**: Chọn **Production**
   - **Type**: Chọn **Secret** (để khóa được ẩn hoàn toàn)
3. *(Tùy chọn)* Nếu muốn dùng model mới nhất:
   - **Key**: `GEMINI_MODEL`
   - **Value**: `gemini-2.5-flash`
   - **Environments**: Chọn **Production**
4. Vào tab **Deployments** -> Bấm vào dấu 3 chấm cạnh deployment mới nhất -> Chọn **Redeploy** (để biến mới có hiệu lực ngay lập tức).
> **Lưu ý bảo mật quan trọng**: KHÔNG gửi khóa API vào ô chat AI. Luôn tự nhập trực tiếp trên Vercel Dashboard.

---

## 8. Kết Luận & Trạng Thái Cuối Cùng

- **Build Status**: `PASS` (33/33 static & serverless routes compiled)
- **Deployment Status**: `READY` trên Production Vercel
- **Fallback Engine**: `PASS` (Hoạt động 100% khi chưa có live API key)
- **Security Check**: `PASS` (Không rò rỉ secret, không có key trong code/bundle)
- **Supabase**: `NOT ACTIVATED`

### FINAL STATUS:
```
GEMINI_CONFIGURATION_READY_BUT_NOT_RUNTIME_VERIFIED
```
*(Lý do: Ứng dụng đã được cấu hình sẵn sàng với `AI_PROVIDER=GEMINI` và cơ chế fallback hoàn hảo; sẵn sàng kết nối ngay khi người dùng nhập `GEMINI_API_KEY` trên Vercel Dashboard).*
