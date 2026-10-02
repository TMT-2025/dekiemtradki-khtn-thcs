# KHTN ASSESSMENT STUDIO (GDPT 2018)

> **Hệ thống phần mềm chuyên dụng hỗ trợ giáo viên THCS thiết kế đề kiểm tra - đánh giá môn Khoa học Tự nhiên (Lớp 6, 7, 8, 9) chuẩn Chương trình Giáo dục Phổ thông 2018.**

---

## 🌟 TỔNG QUAN HỆ THỐNG

**KHTN Assessment Studio** không phải là một chatbot AI thông thường. Đây là một **Hệ thống Nghiệp vụ Khảo thí Chuẩn xác (Deterministic Assessment Operating System)** giải quyết triệt để bài toán xây dựng đề kiểm tra môn KHTN THCS theo các quy chuẩn pháp lý hiện hành của Bộ Giáo dục & Đào tạo Việt Nam:

1. **Thông tư 32/2018/TT-BGDĐT**: Chương trình tổng thể và Chương trình môn Khoa học Tự nhiên.
2. **Thông tư 22/2021/TT-BGDĐT**: Quy định về đánh giá học sinh trung học cơ sở và trung học phổ thông.
3. **Công văn 7991/BGDĐT-GDTrH**: Hướng dẫn xây dựng ma trận, bản đặc tả và đề kiểm tra định kỳ.
4. **Công văn hướng dẫn Sở GD&ĐT** (VD: CV 984/SGDĐT-GDTrH) và Kế hoạch dạy học thực tế của nhà trường.

---

## 🚀 CÁC TÍNH NĂNG ĐỘT PHÁ

### 1. Phân Cấp Nguồn Dữ Liệu 5 Cấp (5-Tier Grounding Hierarchy)
Hệ thống tuân thủ nguyên tắc **Grounding First / Zero-Hallucination**. Khi có sự mâu thuẫn, thuật toán tự động ưu tiên theo trật tự pháp lý:
- **Level 1 (Legal)**: TT 32/2018, TT 22/2021, CV 7991/BGDĐT.
- **Level 2 (Local)**: Công văn Sở/Phòng GD&ĐT (Cấu trúc điểm, tỉ lệ trắc nghiệm/tự luận).
- **Level 3 (School Plan)**: Kế hoạch giáo dục nhà trường (Số tiết thực dạy, phân phối chương trình).
- **Level 4 (Textbook)**: Bộ SGK Kết nối tri thức với cuộc sống (Lớp 6, 7, 8, 9).
- **Level 5 (Reference)**: Tài liệu tham khảo, ngân hàng câu hỏi mở rộng.

### 2. Thuật Toán Sinh Ma Trận Tự Động 16 Bước (Deterministic Matrix Engine)
- Tính toán phân bổ số câu, số điểm theo tỷ lệ số tiết thực dạy giữa 3 mạch kiến thức: **Chất và sự biến đổi của chất (Hóa)**, **Vật sống (Sinh)**, **Năng lượng và sự biến đổi (Lý)**, mở rộng **Trái Đất và bầu trời**.
- Áp dụng giải thuật **Hamilton-Hare (Largest Remainder Method)** làm tròn nguyên số lượng câu hỏi mà vẫn bảo đảm:
  - Tổng điểm luôn bằng **chính xác 10,0 điểm**.
  - Tổng tỉ lệ luôn bằng **chính xác 100%**.
  - Tính năng **Bật/Tắt Mức độ Vận dụng cao (M4)** linh hoạt cho bài kiểm tra Giữa kỳ / Cuối kỳ.
  - Cơ chế **"Explain Why"**: Mỗi ô trong ma trận đều lưu vết giải trình minh bạch vì sao có số câu và số điểm đó.
  - Cho phép giáo viên **chỉnh sửa thủ công trực tiếp từng ô** với tính năng `Recalculate` tự động cân bằng lại toàn bảng.

### 3. Bản Đặc Tả Ánh Xạ 1:1 Tuyệt Đối (Strict Specification Engine)
- Bản đặc tả được sinh tự động và phụ thuộc trực tiếp 100% vào ma trận đề.
- Tự động lọc chính xác Yêu cầu cần đạt (YCCĐ) theo đúng mức độ nhận thức (NB/TH/VD/VDC) và dạng thức câu hỏi.
- Hỗ trợ giáo viên tinh chỉnh mô tả tiêu chí câu hỏi cho từng đơn vị kiến thức trước khi xuất bản.

### 4. Ngân Hàng Câu Hỏi Chuẩn Hóa & Bộ Kiểm Soát Chất Lượng 14 Tiêu Chí
Hỗ trợ đầy đủ 4 dạng thức câu hỏi hiện đại:
1. **Trắc nghiệm 4 lựa chọn (MCQ)**: 1 đáp án đúng duy nhất, có phần giải thích/lời giải chi tiết.
2. **Trắc nghiệm Đúng/Sai (TRUE_FALSE)**: Mỗi câu gồm 4 ý định lượng a), b), c), d) độc lập.
3. **Trắc nghiệm Trả lời ngắn (SHORT_ANSWER)**: Điền số hoặc từ ngữ khoa học then chốt.
4. **Tự luận (ESSAY)**: Kèm ma trận barem chấm điểm từng bước (Rubric).

Tích hợp **Quality Engine** kiểm tra 14 lỗi khảo thí thường gặp:
- Tránh phủ định kép ("Không phải là không đúng...").
- Tránh các đáp án cấm như: "Tất cả các đáp án trên", "Cả A và B đều đúng".
- Kiểm tra độ đồng nhất về độ dài và ngữ pháp giữa các phương án.
- Tự động tính chỉ số tương đồng (Jaccard similarity) để phát hiện và cảnh báo câu hỏi trùng lặp.

### 5. Động Cơ Đánh Giá KHTN Gắn Với Bối Cảnh Thực Tiễn (Context-Based Science Assessment Engine)
- **Nguyên tắc "Context Must Matter"**: Bối cảnh có ý nghĩa quyết định trong việc giải quyết vấn đề khoa học, kiên quyết loại bỏ bối cảnh thuần túy mang tính chất "trang trí" hoặc thuần đọc hiểu.
- **Thư viện Hiện tượng Khoa học Thực tiễn (Phenomenon Library)**: Tích hợp sẵn hàng chục hiện tượng thực tế sinh động (nước biển đóng băng, quang hợp rong đuôi chó, vôi bột khử phèn ĐBSCL, tiếng ồn đô thị, rơ-le lưỡng kim ấm siêu tốc, hiệu suất pin mặt trời, mưa acid, nhóm máu ABO, v.v.) kèm bảng số liệu và quy trình thí nghiệm.
- **Thư viện Bối cảnh Quốc tế Uy tín (International Context Library)**: Khai thác có chọn lọc từ PISA, NASA, NOAA, WHO, UNESCO, EPA, IRRI với 3 chế độ (`INSPIRED_BY`, `ADAPTED_FROM`, `DIRECT_SOURCE`) và **100% được Việt hóa** (chuẩn hóa đơn vị đo SI, bối cảnh văn hóa Việt Nam, lứa tuổi THCS 11-15 tuổi).
- **Phân loại Đa Chiều (Context Taxonomy)**: 5 không gian (*Cá nhân, Gia đình/Trường học, Địa phương, Quốc gia, Toàn cầu*), 4 mức độ phức hợp (*C1 Đơn giản, C2 Có dữ liệu bảng/biểu đồ, C3 Nghiên cứu/thí nghiệm, C4 Phức hợp đa nguồn*), 17 lĩnh vực ứng dụng khoa học.
- **Context Quality Gate (10 Tiêu Chí)**: Đánh giá độ chính xác khoa học, tính cần thiết của bối cảnh, sự phù hợp lứa tuổi (chặn thuật ngữ đại học), độ chuẩn hóa ngôn ngữ và nguồn gốc tài liệu.
- **Quy trình Sinh Câu Hỏi Context-First (Workflow B)**: Cho phép giáo viên chọn hiện tượng khoa học trước, sau đó hệ thống tự động sinh trọn bộ câu hỏi đánh giá theo 4 mức độ nhận thức (M1-M4) và 4 dạng thức câu hỏi.
- **Báo Cáo Bối Cảnh (Context Report) & Truy Xuất Nguồn Gốc (Context Traceability)**: Thống kê trực quan tỉ lệ câu hỏi bối cảnh (mặc định 50%, tùy biến 20%-100%), cân đối đa dạng lĩnh vực, và nút "Xem nguồn" minh bạch nguồn gốc tài liệu và giấy phép bản quyền.

### 6. Khởi Tạo Đề Kiểm Tra Linh Hoạt (Auto & Manual Test Assembly)
- **Chế độ Tự Động (Auto)**: Quét ma trận & đặc tả, khớp chính xác câu hỏi từ Ngân hàng. Nếu thiếu, AI sinh bổ sung bám sát YCCĐ và bối cảnh thực tế.
- **Chế độ Thủ Công (Manual)**: Giáo viên tự do chọn từng câu hỏi theo bộ lọc Chủ đề / Mức độ / Dạng câu / Bối cảnh.
- Tự động sinh đồng bộ: **Mã Đề**, **Phiếu Đáp Án**, và **Hướng Dẫn Chấm / Barem Chi Tiết**.

### 7. Cổng Kiểm Tra Tính Nhất Quán Toàn Diện (End-to-End Quality Gate)
Kiểm tra chuỗi liên kết xuyên suốt:
$$\text{YCCĐ} \longrightarrow \text{Ma trận} \longrightarrow \text{Đặc tả} \longrightarrow \text{Ngân hàng} \longrightarrow \text{Đề thi} \longrightarrow \text{Đáp án} \longrightarrow \text{Barem}$$
Cảnh báo tức thì nếu phát hiện câu hỏi vượt mức nhận thức của ma trận, lệch điểm, hoặc thiếu câu hỏi ở bất kỳ mạch nội dung nào.

### 7. Xuất Bản Trọn Bộ Hồ Sơ Khảo Thí Chuẩn Quốc Gia
Hệ thống cho phép tải về trọn bộ hồ sơ kiểm tra định dạng `.docx` và `.xlsx` trình bày chuẩn thể thức văn bản hành chính Việt Nam (Phông Times New Roman, Quốc hiệu, Tiêu ngữ, Khung chữ ký duyệt của Tổ trưởng chuyên môn và Ban Giám hiệu):
- `01_Ma_tran_De_kiem_tra.docx`
- `02_Ban_dac_ta_De_kiem_tra.docx`
- `03_De_kiem_tra_Chinh_thuc.docx`
- `04_Dap_an_Chi_tiet.docx`
- `05_Huong_dan_cham_va_Barem.docx`
- `Ma_tran_KHTN.xlsx` & `Ngan_hang_cau_hoi.xlsx`

---

## 🏗️ KIẾN TRÚC KỸ THUẬT

- **Framework**: Next.js 14 (App Router) + React 18 + TypeScript.
- **Styling**: Tailwind CSS + Lucide Icons + Radix UI Primitives.
- **Export Engines**: `docx` (Word OpenXML), `exceljs` (Bảng tính phân tích).
- **Testing**: Vitest (100% Passing Unit, Integration & E2E Suites).
- **Database Abstraction**:
  - PostgreSQL / Supabase DDL chuẩn hóa với RLS, Audit Logs (`database/001_initial_schema.sql`).
  - Local File-based Atomic Store (`database/local-db.ts`) hỗ trợ chạy offline hoàn toàn độc lập mà không bắt buộc cài database server.
- **AI Engine Abstraction**:
  - Hỗ trợ đa nhà cung cấp: **Google Gemini API** (`@google/genai`), **OpenAI API**, **Anthropic Claude API**.
  - Mock Provider thông minh tích hợp sẵn phục vụ kiểm thử và chạy offline.

---

## 📁 CẤU TRÚC THƯ MỤC DỰ ÁN

```plaintext
├── app/                        # Next.js 14 App Router
│   ├── curriculum/             # Quản lý 4 khối lớp 6, 7, 8, 9 & YCCĐ
│   ├── matrix/                 # Wizard lập ma trận & chỉnh sửa inline
│   ├── specification/          # Bản đặc tả đề kiểm tra
│   ├── question-bank/          # Ngân hàng câu hỏi & AI Generator
│   ├── tests/                  # Lắp ráp đề, đáp án, hướng dẫn chấm
│   ├── export/                 # Trung tâm xuất bản DOCX / XLSX
│   ├── settings/               # Pháp lý 5 cấp & Cấu hình AI Provider
│   └── api/                    # 14 RESTful Endpoints
├── database/                   # Schema SQL, Seed Data (195 bài KHTN) & Local Store
├── features/                   # Core Domain Logic
│   ├── curriculum/             # Xử lý KHDH, số tiết, mạch kiến thức
│   ├── matrix-engine/          # Thuật toán phân bổ Hamilton-Hare 16 bước
│   ├── spec-engine/            # Chuyển đổi 1:1 Ma trận -> Bản đặc tả
│   ├── question-bank/          # Bộ kiểm định chất lượng 14 tiêu chí
│   ├── test-generator/         # Lắp ráp đề, sinh đáp án và barem
│   ├── quality-gate/           # Kiểm định tính nhất quán toàn chuỗi
│   └── export-engine/          # Xuất Word DOCX & Excel XLSX
├── knowledge/                  # Thư viện tài liệu pháp lý & SGK đã phân loại
│   ├── legal/                  # TT 32, TT 22, CV 7991
│   ├── local_guidance/         # CV 984 Sở GD&ĐT
│   ├── school_plan/            # Kế hoạch dạy học KHTN 6, 7, 8, 9
│   ├── textbooks/              # Sách giáo khoa KHTN Kết nối tri thức
│   ├── templates/              # Mẫu ma trận, đặc tả chuẩn
│   └── question_bank/          # Ngân hàng câu hỏi nguồn
├── lib/ai-providers/           # AI Abstraction Layer (Gemini, OpenAI, Claude)
├── tests/                      # Bộ kiểm thử Unit, Integration, E2E
└── docs/                       # Tài liệu kiến trúc chuyên sâu
```

---

## 🛠️ HƯỚNG DẪN CÀI ĐẶT & KHỞI CHẠY

Xem chi tiết tại tệp [SETUP_GUIDE.md](file:///e:/.%20UNG%20DUNG%20MOI/KHTN/SETUP_GUIDE.md).

### Khởi chạy nhanh (Quick Start):

```bash
# 1. Cài đặt thư viện phụ thuộc
npm install

# 2. Chạy môi trường phát triển
npm run dev

# 3. Mở trình duyệt tại:
http://localhost:3000
```

### Chạy kiểm thử tự động:

```bash
npm run test
```

---

## 📜 BẢN QUYỀN & TIÊU CHUẨN

Hệ thống được phát triển tuân thủ nghiêm ngặt khung chương trình Giáo dục Phổ thông 2018 và quy chế đánh giá của Bộ Giáo dục và Đào tạo Việt Nam.
