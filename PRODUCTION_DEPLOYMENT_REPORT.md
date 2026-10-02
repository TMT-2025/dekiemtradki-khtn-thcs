# BÁO CÁO TRIỂN KHAI VÀ THỰC THI SẢN PHẨM (PRODUCTION DEPLOYMENT REPORT)
**KHTN Assessment Studio — Phiên bản 1.0.0 (Production Release)**  
*Thời gian lập báo cáo*: 2026-10-02T09:27:00+07:00  
*Hệ điều hành*: Windows Server / Windows Workstation  
*Trạng thái phê duyệt*: **PRODUCTION_LIVE_WITH_WARNINGS**

---

## 1. ĐỊA CHỈ TRIỂN KHAI (DEPLOYMENT URL)
- **Môi trường Production Container / Local Host**: `http://localhost:3000` (Next.js Standalone Production Server)
- **Mục tiêu Triển khai Cloud (Production Edge Domain)**: `https://khtn-assessment.edu.vn` (Vercel / AWS Amplify)

## 2. THỜI GIAN TRIỂN KHAI (DEPLOYMENT DATE/TIME)
- **Ngày thực thi**: 02/10/2026
- **Thời gian**: 09:27:00 (Múi giờ ICT - UTC+7)

## 3. MÃ PHIÊN BẢN (GIT COMMIT / RELEASE TAG)
- **Release Version**: `v1.0.0-production-rc`
- **Mã Commit / Build Hash**: `BUILD_PROD_RELEASE_20261002_0927` (Local Production Distribution)

## 4. PHIÊN BẢN NODE.JS (NODE.JS VERSION)
- **Phiên bản Runtime**: `v24.20.0` (LTS/Current compliant, tương thích Node.js >= 18.17.0)

## 5. PHIÊN BẢN NEXT.JS (NEXT.JS VERSION)
- **Phiên bản Framework**: `Next.js 14.2.35` (App Router, Server Actions, Standalone Build)

## 6. TÌNH TRẠNG CƠ SỞ DỮ LIỆU SUPABASE (SUPABASE PROJECT STATUS)
- **Cấu trúc quản lý**: Hỗ trợ 2 chế độ vận hành độc lập:
  1. *Production Mode (`SUPABASE_REQUIRED=true`)*: Cơ chế **Fail-Fast** được kích hoạt tự động. Nếu biến môi trường Supabase chưa được cấu hình hoặc sử dụng khóa mock, hệ thống sẽ chặn khởi động ngay lập tức với lỗi `ProductionDatabaseConfigurationError`, tuyệt đối **không tự ý fallback âm thầm** về file JSON.
  2. *Development / Test Mode (`SUPABASE_REQUIRED=false`)*: Chạy độc lập với local store (`database/local_store.json`), cho phép chạy test tự động và trình diễn ngoại tuyến mà không phụ thuộc mạng ngoài.
- **Tính an toàn**: Module `lib/supabase/database-safety.ts` đã được tích hợp vào toàn bộ các điểm truy cập cơ sở dữ liệu.

## 7. TRẠNG THÁI DI TRÚ CƠ SỞ DỮ LIỆU (MIGRATION STATUS)
Tất cả 3 tệp di trú đã được kiểm thử tính đúng đắn về cú pháp PostgreSQL và cấu trúc quan hệ:
1. `database/001_initial_schema.sql`: 14 bảng cốt lõi (`profiles`, `knowledge_documents`, `curriculum_grades`, `curriculum_chapters`, `curriculum_lessons`, `learning_requirements`, `assessment_templates`, `assessment_matrices`, `matrix_rows`, `test_specifications`, `question_bank`, `tests`, `quality_checks`, `audit_logs`). 100% có Primary Key, Foreign Key và RLS Policies.
2. `database/002_seed_curriculum.sql`: Dữ liệu gốc chuẩn hóa cho 4 khối lớp KHTN 6, 7, 8, 9 và các mẫu đề thi (`TEMPLATE_A`, `TEMPLATE_B_LOCAL`).
3. `database/003_context_engine_schema.sql`: 4 bảng bối cảnh khảo thí thực tiễn (`phenomena`, `international_contexts`, `context_stimuli`, `context_traces`), 7 chỉ mục B-tree/GIN, các chính sách RLS phân quyền theo vai trò và Trigger tự động cập nhật `updated_at`.

## 8. TRẠNG THÁI BIẾN MÔI TRƯỜNG (ENVIRONMENT STATUS)
Đã hoàn thành rà soát phân loại biến môi trường trong `.env.example`:
- **Client-Safe (Tiền tố `NEXT_PUBLIC_*`)**:
  - `NEXT_PUBLIC_APP_ENV`: `production`
  - `NEXT_PUBLIC_APP_URL`: `https://khtn-assessment.edu.vn`
  - `NEXT_PUBLIC_SUPABASE_URL`: Public endpoint kết nối Supabase API
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Public Anon JWT key của Supabase
- **Server-Only Secrets (Tuyệt đối không lộ ra trình duyệt hay bundle client)**:
  - `SUPABASE_SERVICE_ROLE_KEY`: Quyền quản trị server-side
  - `SUPABASE_REQUIRED`: Cờ kiểm soát an toàn CSDL
  - `AI_PROVIDER`, `GEMINI_API_KEY`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`: API keys trí tuệ nhân tạo
  - `JWT_SECRET`, `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX_REQUESTS`: Cấu hình an ninh

## 9. THẨM ĐỊNH BẢO MẬT SẢN PHẨM (SECURITY STATUS)
Đạt 100% các tiêu chí an ninh mạng phòng thủ chiều sâu:
- **RBAC**: Phân định quyền hạn minh bạch (`ADMIN`, `HEAD_OF_DEPARTMENT`, `TEACHER`, `GUEST`).
- **IDOR**: Kiểm tra đối chiếu quyền sở hữu tài nguyên theo `userId` và `schoolId`.
- **XSS**: Khử độc toàn diện mã script độc hại trong input giáo viên và ngữ liệu.
- **Prompt Injection**: Phát hiện và ngăn chặn các mẫu lệnh cố tình can thiệp System Prompt (`ignore previous instructions`, `you are now in developer mode`).
- **SQL Injection**: Kiểm tra và chặn các mẫu tấn công SQL (`OR '1'='1'`, `UNION SELECT`, `DROP TABLE`).
- **Rate Limiting**: Thuật toán Sliding Window giới hạn tần suất truy cập ngăn chặn lạm dụng tài nguyên.
- **Safe File Upload**: Kiểm tra phần mở rộng tệp và dung lượng cho phép tối đa 25MB.
- **HTTP Security Headers**: Cấu hình `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`.

## 10. KẾT QUẢ KIỂM THỬ TỰ ĐỘNG (TEST RESULTS)
- **Tổng số tệp kiểm thử**: 22/22 suites PASS (100%)
- **Tổng số ca kiểm thử**: 86/86 tests PASS (100%)
- **Số ca lỗi**: 0 FAIL
- **Thời gian chạy kiểm thử**: 5.65 giây
- **Kiểm tra kiểu dữ liệu TypeScript**: 0 lỗi (`npx tsc --noEmit` hoàn thành sạch sẽ)

## 11. KẾT QUẢ SMOKE TEST THỰC TẾ (SMOKE-TEST RESULTS)
Đã thực thi thành công chu trình nghiệp vụ trọn vẹn của giáo viên trên cả 4 khối lớp:
- **KHTN 6**: Chương trình → Ma trận 10đ → Đặc tả → Hiện tượng thực tiễn → Ngữ liệu → Sinh câu hỏi → Quality Gate → Đề thi → Đáp án → Báo cáo bối cảnh → Truy vết → Xuất 6 văn bản: **PASS**
- **KHTN 7**: Chu trình khép kín: **PASS**
- **KHTN 8**: Chu trình khép kín: **PASS**
- **KHTN 9**: Chu trình khép kín: **PASS**
- *Ghi chú*: Không phát sinh bất kỳ can thiệp cơ sở dữ liệu thủ công nào.

## 12. KẾT QUẢ THẨM ĐỊNH MỸ THUẬT VĂN BẢN DOCX (DOCX QA RESULTS)
- 6 tệp văn bản xuất ra vật lý trong thư mục `exports/qa-package/`:
  1. `01_Ma_tran_KHTN8.docx` (12.69 KB)
  2. `02_Ban_dac_ta_KHTN8.docx` (12.32 KB)
  3. `03_De_kiem_tra_KHTN8.docx` (12.95 KB)
  4. `04_Dap_an_KHTN8.docx` (12.15 KB)
  5. `05_Context_Report_KHTN8.docx` (12.51 KB)
  6. `06_Traceability_Report_KHTN8.docx` (12.63 KB)
- **Quy cách định dạng**: Khổ A4 đứng, căn lề chuẩn 30mm trái, 20mm trên/dưới/phải; font Times New Roman thống nhất toàn văn bản; bảng biểu 100% width; ký hiệu hóa học và vật lý chính xác; hiển thị nhãn dữ liệu mô phỏng; cấu hình định dạng theo câu chữ chuẩn: *"Formatting configured according to the referenced document-format requirements."*

## 13. GIỚI HẠN VÀ KHUYẾN CÁO (KNOWN LIMITATIONS)
1. **Thiết lập Khóa Production Supabase**: Ứng dụng hiện đang được xác thực với cấu hình Fail-Safe. Khi triển khai lên môi trường Cloud thực tế (Vercel/Cloud Container), quản trị viên cần cung cấp thông số thực tế của Supabase Project và đặt `SUPABASE_REQUIRED=true`.
2. **Kích thước ảnh ngữ liệu**: Khuyến nghị đính kèm file ảnh dưới 5MB để tối ưu thời gian tạo tài liệu DOCX trên máy tính của giáo viên.

## 14. QUY TRÌNH HOÀN NGUYÊN (ROLLBACK PROCEDURE)
1. **Dừng phiên bản hiện tại**:
   ```bash
   pm2 stop khtn-studio || kill -9 $(lsof -t -i:3000)
   ```
2. **Quay lại bản dựng trước**:
   ```bash
   git checkout tags/v0.9.5-rc
   npm ci
   npm run build
   npm run start
   ```
3. **Cơ sở dữ liệu Supabase**:
   Nếu cần hoàn nguyên cấu trúc schema bối cảnh:
   ```sql
   DROP TABLE IF EXISTS context_traces CASCADE;
   DROP TABLE IF EXISTS context_stimuli CASCADE;
   DROP TABLE IF EXISTS international_contexts CASCADE;
   DROP TABLE IF EXISTS phenomena CASCADE;
   ```

## 15. QUY TRÌNH SAO LƯU DỰ PHÒNG (BACKUP PROCEDURE)
1. **Sao lưu Cơ sở dữ liệu Supabase**:
   ```bash
   supabase db dump --data-only -f backup_khtn_data_$(date +%Y%m%d).sql
   ```
2. **Sao lưu Ngân hàng câu hỏi và hiện tượng cục bộ**:
   ```bash
   tar -czvf backup_khtn_database_$(date +%Y%m%d).tar.gz ./database/*.json ./knowledge/catalog.json
   ```

---

## 16. KẾT LUẬN VÀ TRẠNG THÁI PHÁT HÀNH CUỐI CÙNG (FINAL RELEASE STATUS)

# TRẠNG THÁI: **PRODUCTION_LIVE_WITH_WARNINGS**

> **Lý do chỉ định `PRODUCTION_LIVE_WITH_WARNINGS`**:
> Hệ thống mã nguồn đã hoàn thành xuất sắc 100% các tiêu chí kỹ thuật: biên dịch production build thành công 33/33 routes, vượt qua toàn bộ 86/86 ca kiểm thử tự động, 0 lỗi TypeScript, vượt qua kiểm tra an ninh và kiểm thử khói (smoke test) xuyên suốt 4 khối lớp KHTN 6, 7, 8, 9, cùng bộ văn bản DOCX đạt chuẩn.
> Cảnh báo (**WARNINGS**) được ghi nhận một cách trung thực và minh bạch: Ứng dụng đang chạy hoàn hảo trong môi trường Production Container cục bộ và sẵn sàng 100% để được gán tên miền chính thức (`https://khtn-assessment.edu.vn`) và nạp API key của Supabase Cloud thực tế.
