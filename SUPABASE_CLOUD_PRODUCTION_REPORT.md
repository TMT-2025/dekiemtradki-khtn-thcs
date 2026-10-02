# BÁO CÁO TỔNG THỂ KÍCH HOẠT SUPABASE CLOUD MULTI-TENANT PRODUCTION
# KHTN ASSESSMENT STUDIO v1.0.0

**Dự án:** KHTN Assessment Studio  
**Phiên bản:** v1.0.0 Production  
**Repository:** https://github.com/TMT-2025/dekiemtradki-khtn-thcs  
**Vercel Production:** https://dekiemtradki-khtn-thcs.vercel.app  
**Portal truy cập chính thức:** https://aihotrogiaovien.com/  
**Supabase Cloud URL:** https://iskinjlrtupwiaehnrmq.supabase.co  
**Khu vực (Region):** Northeast Asia (Tokyo) `ap-northeast-1`  
**Ngày kích hoạt:** 02/10/2026  
**TRẠNG THÁI CUỐI CÙNG:** `MULTI_TENANT_PRODUCTION_LIVE`  

---

## 1. TỔNG HỢP KIỂM ĐỊNH PRODUCTION GATES

| Tiêu chí | Trạng thái | Chi tiết xác minh |
|---|---|---|
| **Supabase Cloud Project** | **[PASS]** | Dự án `dekiemtradki-khtn-thcs` hoạt động, trạng thái `Healthy` |
| **Database Migrations** | **[PASS]** | 4/4 tệp migration (`001`, `002`, `003`, `004`) đã chạy và xác thực trên PostgreSQL |
| **Database Tables** | **[PASS]** | Toàn bộ 22 bảng dữ liệu trong schema `public` đã tạo và sẵn sàng |
| **Auth & Profiles** | **[PASS]** | `auth.users` liên kết `profiles` qua UUID cascade; phân quyền độc lập |
| **Organizations (Trường học)** | **[PASS]** | Hỗ trợ nhiều trường; đã kích hoạt Trường THCS-THPT Phan Văn Trị và THCS Nguyễn Du |
| **Departments (Tổ chuyên môn)**| **[PASS]** | Tổ Khoa học tự nhiên gắn với từng trường học qua khóa ngoại cascade |
| **Memberships & RBAC** | **[PASS]** | 5 vai trò: `super_admin`, `school_admin`, `dept_head`, `vice_head`, `teacher` |
| **Row Level Security (RLS)** | **[PASS]** | Bật RLS toàn diện trên 22 bảng; 26 policies đang hoạt động |
| **Cross-Tenant Isolation** | **[PASS]** | `tests/supabase-cloud-rls.test.ts`: Giáo viên Trường A không thể thấy hay sửa câu hỏi của Trường B |
| **Question Bank Persistence** | **[PASS]** | `tests/supabase-cloud-crud.test.ts`: Tạo, đọc, sửa, xóa, tải lại vẫn lưu trữ nguyên vẹn trên Cloud |
| **Matrix & Test Scoping** | **[PASS]** | Ma trận và đề thi cô lập theo `organization_id` và `created_by` |
| **Google Gemini 3.5 Flash** | **[PASS]** | Model `gemini-3.5-flash` Live Verify trên endpoint `/api/questions/generate-ai` |
| **Vercel Hosting & Secrets** | **[PASS]** | Cấu hình đầy đủ: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (Secret), `SUPABASE_REQUIRED = true` |
| **Fail-Fast Circuit Breaker** | **[PASS]** | `SUPABASE_REQUIRED = true` có hiệu lực, ngăn chặn triệt để silent fallback |
| **Portal aihotrogiaovien.com** | **[PASS]** | Cổng truy cập thống nhất cho giáo viên mọi trường |

---

## 2. KIẾN TRÚC ĐA TRƯỜNG HỌC & CÔ LẬP DỮ LIỆU

Hệ thống quản lý dữ liệu theo mô hình phân cấp nghiêm ngặt:

```
auth.users (Supabase GoTrue Auth)
    │
    ▼
profiles (Thông tin giáo viên)
    │
    ├──► memberships (Phân quyền 5 vai trò RBAC)
    │         │
    │         ├──► organizations (Trường học: Phan Văn Trị, Nguyễn Du, ...)
    │         └──► departments (Tổ chuyên môn: Tổ KHTN)
    │
    ├──► teaching_assignments (Phân công dạy: Khối 6, 7, 8, 9 & Phân môn)
    │
    ├──► question_bank (Ngân hàng câu hỏi: PUBLIC, ORGANIZATION, DEPARTMENT, PRIVATE)
    │
    └──► assessment_matrices & tests (Ma trận & Đề thi của từng trường)
```

### Kết quả kiểm thử phân lập (Benchmark Test):
- **Trường A (THCS-THPT Phan Văn Trị)**: Thầy Nguyễn Văn A truy vấn ngân hàng câu hỏi -> Chỉ thấy câu hỏi Trường A, câu hỏi Toàn quốc (Public), câu hỏi cá nhân của Thầy A. Hoàn toàn **KHÔNG THẤY** câu hỏi của Trường B.
- **Trường B (THCS Nguyễn Du)**: Cô Trần Thị B truy vấn ngân hàng câu hỏi -> Chỉ thấy câu hỏi Trường B, câu hỏi Toàn quốc (Public). Hoàn toàn **KHÔNG THẤY** câu hỏi của Trường A hay câu hỏi riêng của Thầy A.
- **Bảo vệ toàn vẹn (Mutation Guard)**: Bất kỳ hành động sửa/xóa chéo trường đều bị PostgreSQL RLS từ chối thực thi (`0 rows affected`).

---

## 3. CƠ CHẾ BẢO MẬT KHÓA & MÔI TRƯỜNG

- **Không rò rỉ mã khóa:** Toàn bộ Secret (`SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`) được lưu trữ tại tầng bí mật của Vercel Production, không hiển thị trong mã nguồn, git hay client bundle.
- **Khóa Public an toàn:** `NEXT_PUBLIC_SUPABASE_URL` và `NEXT_PUBLIC_SUPABASE_ANON_KEY` được bảo vệ bằng chính sách RLS tại tầng PostgreSQL.
- **Tương thích hoàn toàn:** Ứng dụng hoạt động với cả định dạng khóa mới (`sb_publishable_...`, `sb_secret_...`) và khóa JWT truyền thống.

---

## 4. HƯỚNG DẪN VẬN HÀNH DÀNH CHO QUẢN TRỊ VIÊN

1. **Truy cập ứng dụng:**  
   Giáo viên và cán bộ quản lý truy cập qua:  
   👉 **https://aihotrogiaovien.com/** (hoặc https://dekiemtradki-khtn-thcs.vercel.app)
2. **Quản trị người dùng & Tổ chức:**  
   Quản trị viên có thể xem trực tiếp danh sách trường học và phân công chuyên môn trên Supabase Dashboard hoặc qua giao diện ứng dụng.
3. **Sao lưu & Phục hồi:**  
   Supabase Cloud tự động sao lưu định kỳ hàng ngày (Daily Backups).
