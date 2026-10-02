# BÁO CÁO TOÀN DIỆN KIỂM TOÁN HIỆN TRẠNG SUPABASE CLOUD
# KHTN ASSESSMENT STUDIO v1.0.0
**Repository:** https://github.com/TMT-2025/dekiemtradki-khtn-thcs  
**Ngày kiểm toán:** 02/10/2026  
**Trạng thái kiểm toán:** HOÀN TẤT CHECKPOINT 1  

---

## 1. HỆ THỐNG MIGRATION & THỨ TỰ THỰC THI (MIGRATION ORDER)

Trong thư mục `database/`, hệ thống có chính xác 4 tệp migration SQL theo thứ tự phụ thuộc nghiêm ngặt:

```
001_initial_schema.sql (Core Tables, GDPT 2018 Schema, Profiles, Matrices, Tests, Questions, Audit)
    │
    ▼
002_seed_curriculum.sql (Seed Khung chương trình KHTN 6, 7, 8, 9, 140 tiết/năm, Ma trận mẫu Đề A & Đề B)
    │
    ▼
003_context_engine_schema.sql (Context-Based Science Assessment Engine: Phenomena, International, Stimuli, Traces)
    │
    ▼
004_multi_tenant_organizations.sql (Multi-Tenant: Organizations, Departments, Memberships, 5 RBAC, RLS Scoping)
```

---

## 2. BẢNG BIỂU, KHÓA NGOẠI, RÀNG BUỘC VÀ CHỈ MỤC (TABLES, FKs, CONSTRAINTS & INDEXES)

### A. Các bảng cốt lõi (Core Tables - 001)
- `profiles`: Khóa chính `id` liên kết `auth.users(id) ON DELETE CASCADE`.
- `knowledge_documents`: Quản lý văn bản pháp quy, CTGDPT 2018, tài liệu địa phương.
- `curriculum_grades`: Khối 6, 7, 8, 9. Ràng buộc `code IN (6, 7, 8, 9)`.
- `curriculum_chapters`: Khóa ngoại `grade_code REFERENCES curriculum_grades(code)`.
- `curriculum_lessons`: Khóa ngoại `chapter_id`, `grade_code`.
- `learning_requirements`: Khóa ngoại `lesson_id`, mức độ nhận thức `M1`, `M2`, `M3`, `M4`.
- `assessment_templates`: Khung ma trận chuẩn (Mẫu A 60 phút, Mẫu B 90 phút).
- `assessment_matrices`: Khóa ngoại `user_id REFERENCES profiles(id)`, `template_id`.
- `matrix_rows`: Khóa ngoại `matrix_id`, `lesson_id`.
- `test_specifications`: Khóa ngoại `matrix_id`.
- `question_bank`: Khóa ngoại `chapter_id`, `lesson_id`, `learning_requirement_id`.
- `tests`: Khóa ngoại `matrix_id`, `specification_id`.
- `quality_checks` & `audit_logs`: Nhật ký kiểm định chất lượng đề thi và ma trận.

### B. Context-Based Science Assessment Engine (003)
- `phenomena`: Thư viện hiện tượng thực tiễn KHTN (vật lý, hóa học, sinh học).
- `international_contexts`: Ngữ cảnh quốc tế (PISA, TIMSS, NGSS).
- `context_stimuli`: Ngữ liệu thực tế (bảng số liệu, biểu đồ, thí nghiệm, mô hình).
- `context_traces`: Truy vết nguồn gốc ngữ cảnh câu hỏi phục vụ kiểm định chất lượng.
- **Chỉ mục hiệu năng:** `idx_phenomena_grade_subject`, `idx_phenomena_context_type`, `idx_stimuli_context_id`, `idx_traces_question`, `idx_traces_test`.

### C. Đa trường học & Đa tổ chuyên môn (Multi-Tenant Entities - 004)
- `organizations`: Trường THCS/THPT (`name`, `code`, `province`, `district`, `status`).
- `departments`: Tổ chuyên môn KHTN thuộc trường (`organization_id`, `name`, `code`). Ràng buộc duy nhất `uq_org_dept_code`.
- `memberships`: Phân quyền người dùng vào trường và tổ. Ràng buộc `uq_user_org_dept_role`.
- `teaching_assignments`: Phân công giảng dạy theo khối (6, 7, 8, 9), phân môn và lớp.
- **Cột mở rộng phân lập:**
  - `question_bank`: `organization_id`, `department_id`, `created_by`, `visibility` (`PUBLIC`, `ORGANIZATION`, `DEPARTMENT`, `PRIVATE`).
  - `assessment_matrices`: `organization_id`, `department_id`, `created_by`, `is_public_template`.
  - `tests`: `organization_id`, `department_id`, `created_by`.
- **Chỉ mục truy vấn đa trường:** `idx_dept_org_id`, `idx_memberships_user_org`, `idx_memberships_role`, `idx_teaching_assign`, `idx_qbank_org_vis`, `idx_matrices_org`, `idx_tests_org`.

---

## 3. CƠ CHẾ BẢO MẬT ROW LEVEL SECURITY (RLS) & 5 VAI TRÒ RBAC

### A. 5 Vai trò RBAC chuẩn:
1. `super_admin`: Toàn quyền hệ thống, xem và quản trị mọi trường học.
2. `school_admin`: Quản trị viên cấp trường / Ban giám hiệu, quản lý tổ chuyên môn, giáo viên và đề thi trong trường.
3. `dept_head`: Tổ trưởng chuyên môn KHTN, quản lý kế hoạch dạy học, duyệt ngân hàng câu hỏi và ma trận đề của tổ.
4. `vice_head`: Tổ phó chuyên môn KHTN, hỗ trợ kiểm duyệt câu hỏi và tổ chức kiểm tra.
5. `teacher`: Giáo viên bộ môn KHTN, tạo câu hỏi, xây dựng ma trận và đề cho các lớp được phân công.

### B. Hàm an ninh PostgreSQL (Security Definer):
- `auth_user_has_org_role(lookup_org_id UUID, lookup_roles TEXT[])`: Kiểm tra quyền hạn của user trong tổ chức.
- `auth_user_org_ids()`: Lấy danh sách ID tổ chức mà user thuộc về (hoặc toàn bộ nếu là `super_admin`).

### C. Chính sách cô lập dữ liệu (Tenant Isolation Policies):
- **Câu hỏi (`question_bank`)**:
  - Giáo viên chỉ thấy câu hỏi `PUBLIC` (nguồn chuẩn GDPT 2018), câu hỏi của trường mình (`ORGANIZATION`), tổ mình (`DEPARTMENT`), hoặc do chính mình tạo (`created_by = auth.uid()`).
  - Giáo viên Trường A **không thể đọc hoặc can thiệp** câu hỏi nội bộ/riêng tư của Trường B.
- **Ma trận & Đề thi (`assessment_matrices`, `tests`)**:
  - Cô lập tuyệt đối theo `organization_id`. Chỉ thành viên trường đó mới có quyền truy cập.

---

## 4. TRẠNG THÁI TÍCH HỢP CLIENT & SERVER (INTEGRATION STATUS)

| Thành phần | Tệp mã nguồn | Trạng thái hiện tại | Đánh giá |
|---|---|---|---|
| **Browser Client** | `lib/supabase/client.ts` | Sử dụng `NEXT_PUBLIC_SUPABASE_URL` và `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Đạt chuẩn, tuân thủ RLS |
| **Server Client** | `lib/supabase/server.ts` | Sử dụng `SUPABASE_SERVICE_ROLE_KEY` (hoặc Anon Key dự phòng), chặn client bundle | Đạt chuẩn, bảo mật Server-only |
| **Database Safety Gate** | `lib/supabase/database-safety.ts` | Đánh giá tính hợp lệ của URL/Key; ném lỗi `ProductionDatabaseConfigurationError` khi `SUPABASE_REQUIRED=true` mà thiếu key | Đạt chuẩn Fail-Fast |
| **Local Store Bridge** | `database/local-db.ts` | Lưu trữ trên file `database/local_store.json` khi chạy local/fallback | Hoạt động ổn định, bảo toàn dữ liệu |
| **AI Provider** | `lib/ai-providers/gemini-provider.ts` | Sử dụng Google Gemini 3.5 Flash (`gemini-3.5-flash`) | **LIVE PASS** |

---

## 5. CÁC ĐIỂM CÒN THIẾU CẦN BỔ SUNG (REMAINING GAPS)

1. **Supabase Cloud Project**: Chưa có thông tin kết nối Supabase Cloud thực tế (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` chưa có trên Vercel).
2. **Migrations chưa thực thi trên Cloud**: 4 tệp migration (`001`, `002`, `003`, `004`) cần được thực thi trên giao diện Supabase Cloud SQL Editor của Quản trị viên.
3. **Lớp giao diện Auth (UI & Session State)**: Cần bổ sung trang đăng nhập `/login`, thanh hiển thị tài khoản/trường học/tổ chuyên môn trên giao diện người dùng, và hook quản lý session người dùng.
4. **Data Access Repository Bridge**: Cần tạo cầu nối dịch vụ chuyển đổi tự động (Dual-mode Service Bridge) giữa `supabaseClient` và `localDb` để khi kết nối Cloud, toàn bộ câu hỏi, ma trận và đề kiểm tra được lưu thẳng vào PostgreSQL của Supabase.
5. **Circuit Breaker Status**: `SUPABASE_REQUIRED` hiện đang ở mức `false` để giữ cho ứng dụng hoạt động không gián đoạn trên Vercel cho đến khi Cloud hoàn tất xác minh.
