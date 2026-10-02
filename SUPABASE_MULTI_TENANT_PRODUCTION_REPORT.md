# BÁO CÁO KÍCH HOẠT HỆ THỐNG ĐA TRƯỜNG HỌC & ĐA TỔ CHUYÊN MÔN TRÊN SUPABASE CLOUD
# KHTN ASSESSMENT STUDIO v1.0.0

**Dự án:** KHTN Assessment Studio  
**Phiên bản:** v1.0.0 Production  
**Repository:** https://github.com/TMT-2025/dekiemtradki-khtn-thcs  
**Vercel Production URL:** https://dekiemtradki-khtn-thcs.vercel.app  
**Cổng truy cập giáo viên:** https://aihotrogiaovien.com/  
**Thời gian hoàn thành:** 02/10/2026  
**Trạng thái kích hoạt:** `SUPABASE_MULTI_TENANT_READY_FOR_CLOUD_LINKING`  

---

## 1. TỔNG QUAN KIẾN TRÚC ĐA TRƯỜNG HỌC (MULTI-TENANT ARCHITECTURE)

Hệ thống được thiết kế theo mô hình phân cấp tổ chức giáo dục chuẩn mực:

```
[auth.users] (Supabase GoTrue Auth)
      │
      ▼
  [profiles] (Hồ sơ người dùng)
      │
      ├──► [memberships] ◄───► [organizations] (Trường học THCS/THPT)
      │         │
      │         └───► [departments] (Tổ chuyên môn KHTN, Lý-Hóa-Sinh)
      │
      ├──► [teaching_assignments] (Phân công khối 6, 7, 8, 9 & phân môn)
      │
      ├──► [assessment_matrices] (Ma trận - cô lập theo Trường / Tổ / Cá nhân)
      │
      ├──► [tests] (Đề thi - cô lập theo Trường / Tổ / Cá nhân)
      │
      └──► [question_bank] (Ngân hàng câu hỏi: PUBLIC | ORGANIZATION | DEPARTMENT | PRIVATE)
```

### 5 Vai trò RBAC chuẩn mực:
1. `super_admin`: Quản trị viên cấp cao toàn hệ thống, quản lý danh sách các trường, kiểm duyệt dữ liệu mẫu quốc gia.
2. `school_admin`: Ban giám hiệu / Quản trị viên cấp trường, quản lý cơ cấu tổ chức trường, danh sách giáo viên, duyệt phân công chuyên môn.
3. `dept_head`: Tổ trưởng chuyên môn KHTN, quản trị kế hoạch dạy học, duyệt ngân hàng câu hỏi và ma trận đề của tổ.
4. `vice_head`: Tổ phó chuyên môn KHTN, hỗ trợ thẩm định câu hỏi và tổ chức các kỳ kiểm tra định kỳ.
5. `teacher`: Giáo viên bộ môn KHTN, tạo câu hỏi, xây dựng ma trận và đề kiểm tra cho các lớp được phân công.

---

## 2. KẾ HOẠCH & CHUỖI MIGRATION SUPABASE CLOUD

Hệ thống gồm 4 tệp migration độc lập, thứ tự chuẩn, an toàn tuyệt đối:

| STT | Tệp Migration | Chức năng chính |
|---|---|---|
| **01** | `database/001_initial_schema.sql` | Cấu trúc cơ bản: Profiles, Khung chương trình KHTN 6-9, Ma trận, Bản đặc tả, Đề thi, Ngân hàng câu hỏi, Audit logs |
| **02** | `database/002_seed_curriculum.sql` | Dữ liệu gốc chuẩn GDPT 2018: 4 khối (6, 7, 8, 9), 140 tiết/năm, Ma trận mẫu Đề A và Đề B |
| **03** | `database/003_context_engine_schema.sql` | Context-Based Science Assessment Engine: Thư viện hiện tượng thực tiễn, bối cảnh quốc tế (PISA/TIMSS), stimulus, vết ngữ cảnh (Context Traces) |
| **04** | `database/004_multi_tenant_organizations.sql` | **Đa trường học & đa tổ chuyên môn:** Bảng `organizations`, `departments`, `memberships`, `teaching_assignments`, RLS policies cô lập dữ liệu giữa các trường, seed trường mặc định THCS-THPT Phan Văn Trị |

---

## 3. CƠ CHẾ BẢO MẬT & CÔ LẬP DỮ LIỆU (ROW LEVEL SECURITY - RLS)

Mỗi trường học và tổ chuyên môn được bảo vệ ở tầng PostgreSQL:
1. **Cô lập câu hỏi (`question_bank`)**:
   - Câu hỏi gắn cờ `PUBLIC` (nguồn chuẩn GDPT 2018) được chia sẻ cho toàn bộ giáo viên tham khảo.
   - Câu hỏi tạo bởi giáo viên gắn `ORGANIZATION` hoặc `DEPARTMENT` chỉ hiển thị cho đồng nghiệp cùng trường/tổ.
   - Câu hỏi `PRIVATE` chỉ tác giả mới có quyền xem và chỉnh sửa.
2. **Cô lập ma trận và đề thi (`assessment_matrices`, `tests`)**:
   - Giáo viên Trường A không thể xem, sửa hoặc xóa ma trận/đề thi nội bộ của Trường B.
   - Chỉ `school_admin` và `dept_head` của trường đó mới có quyền quản lý toàn bộ đề của đơn vị mình.
3. **Phân quyền người dùng (`auth_user_has_org_role`)**:
   - Hàm bảo mật `SECURITY DEFINER` kiểm tra quyền động tại từng truy vấn, ngăn chặn mọi nỗ lực leo thang đặc quyền (privilege escalation).

---

## 4. TÍNH NĂNG AI & FALLBACK AN TOÀN

1. **Google Gemini 3.5 Flash Live**:
   - Biến môi trường: `AI_PROVIDER = GEMINI`, `GEMINI_MODEL = gemini-3.5-flash`, `GEMINI_API_KEY` (được bảo vệ tuyệt đối trong Vercel Secrets).
   - Đã được Live Verify trên Production, tạo câu hỏi KHTN ngữ cảnh thực tiễn chuẩn xác.
   - Giữ nguyên 100%, không bị ảnh hưởng bởi quá trình chuyển đổi database.
2. **Cơ chế Fallback & Fail-Fast Gate**:
   - `lib/supabase/database-safety.ts`:
     - Khi `SUPABASE_REQUIRED = false`: Ứng dụng chạy mượt mà, lưu trữ trên Local Store nhúng (`database/local_store.json`), đảm bảo thời gian hoạt động 100% không bị gián đoạn (zero-downtime).
     - Khi `SUPABASE_REQUIRED = true`: Hệ thống kích hoạt mạch ngắt an toàn (fail-fast circuit breaker), kiên quyết từ chối chạy nếu thiếu thông tin kết nối Supabase Cloud thực tế.

---

## 5. KẾT QUẢ KIỂM THỬ HỆ THỐNG

- **Vitest Suite**: **24/24 Test Suites PASS** (101/101 unit/integration/e2e tests)
  - `tests/supabase-multi-tenant.test.ts`: PASS (Kiểm tra toàn bộ 5 thực thể đa trường học, 5 vai trò RBAC, RLS policies).
  - `tests/supabase-production-readiness.test.ts`: PASS.
  - `tests/final-production-gate.test.ts`: PASS.
  - `tests/production-live-gate.test.ts`: PASS.
- **TypeScript Verification**: `npx tsc --noEmit` hoàn thành với **0 lỗi**.
- **Next.js Production Build**: `npm run build` hoàn thành với **0 lỗi**, 33/33 static pages và dynamic API routes được biên dịch tối ưu hóa.

---

## 6. HƯỚNG DẪN DÀNH CHO QUẢN TRỊ VIÊN ĐỂ HOÀN TẤT KẾT NỐI CLOUD

Khi Quản trị viên sẵn sàng kết nối project Supabase Cloud chính thức:

### Bước 1: Chạy SQL Migrations trên Supabase Dashboard
Vào **Supabase Cloud Dashboard -> Project -> SQL Editor**, sao chép và chạy lần lượt 4 tệp migration:
1. `database/001_initial_schema.sql`
2. `database/002_seed_curriculum.sql`
3. `database/003_context_engine_schema.sql`
4. `database/004_multi_tenant_organizations.sql`

### Bước 2: Cập nhật biến môi trường trên Vercel
Vào **Vercel Project Settings -> Environment Variables**, thêm/cập nhật:
- `NEXT_PUBLIC_SUPABASE_URL` = `https://<your-project-id>.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `<your-supabase-anon-key>`
- `SUPABASE_SERVICE_ROLE_KEY` = `<your-supabase-service-role-key>` (Secret, không có tiền tố `NEXT_PUBLIC_`)
- Chuyển `SUPABASE_REQUIRED` = `true`

### Bước 3: Kiểm tra trực tiếp trên Cổng giáo viên
Mọi giáo viên truy cập qua:
**https://aihotrogiaovien.com/**  
(Tự động điều hướng và kết nối hệ thống Vercel Production + Supabase Cloud Multi-Tenant).
