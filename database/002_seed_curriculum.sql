-- ============================================================
-- KHTN ASSESSMENT STUDIO - CURRICULUM SEED DATA (GDPT 2018)
-- Generated automatically from official syllabus & KHDH
-- ============================================================

INSERT INTO curriculum_grades (code, name, total_periods) VALUES
(6, 'Khoa học tự nhiên 6', 140),
(7, 'Khoa học tự nhiên 7', 140),
(8, 'Khoa học tự nhiên 8', 140),
(9, 'Khoa học tự nhiên 9', 140)
ON CONFLICT (code) DO NOTHING;

-- Default Assessment Templates
INSERT INTO assessment_templates (name, code, description, duration_minutes, total_score, cognitive_level_target, enable_m4, parts_config) VALUES
(
  'Cấu trúc chuẩn Sở GD&ĐT Vĩnh Long (CV 984 / CV 7991)',
  'TEMPLATE_B_LOCAL',
  'Cấu trúc 4 phần chuẩn: Phần I (14 MCQ - 3.5đ), Phần II (2 Đ/S - 2.0đ), Phần III (3 TLN - 1.5đ), Phần IV (3 TL - 3.0đ)',
  60,
  10.00,
  '{"M1": 40, "M2": 30, "M3": 20, "M4": 10}'::jsonb,
  true,
  '[
    {"partNumber": 1, "name": "Trắc nghiệm nhiều lựa chọn", "questionType": "MCQ", "questionCount": 14, "scorePerQuestion": 0.25, "totalScore": 3.5, "description": "Mỗi câu có 4 phương án, chọn 1 đáp án đúng."},
    {"partNumber": 2, "name": "Trắc nghiệm Đúng/Sai", "questionType": "TRUE_FALSE", "questionCount": 2, "scorePerQuestion": 1.0, "totalScore": 2.0, "description": "Mỗi câu gồm 4 ý (a, b, c, d), mỗi ý đúng được 0.25đ."},
    {"partNumber": 3, "name": "Trắc nghiệm trả lời ngắn", "questionType": "SHORT_ANSWER", "questionCount": 3, "scorePerQuestion": 0.5, "totalScore": 1.5, "description": "Điền kết quả tính toán hoặc số liệu chính xác."},
    {"partNumber": 4, "name": "Tự luận", "questionType": "ESSAY", "questionCount": 3, "scorePerQuestion": 1.0, "totalScore": 3.0, "description": "Trình bày giải thích, lập luận và bài tập tự luận."}
  ]'::jsonb
),
(
  'Cấu trúc mặc định hệ thống (Template A - Trắc nghiệm & Tự luận cân bằng)',
  'TEMPLATE_A',
  'Cấu trúc kết hợp Trắc nghiệm nhiều lựa chọn (16 câu - 4.0đ) và Tự luận (4 câu - 6.0đ)',
  60,
  10.00,
  '{"M1": 40, "M2": 30, "M3": 20, "M4": 10}'::jsonb,
  true,
  '[
    {"partNumber": 1, "name": "Trắc nghiệm nhiều lựa chọn", "questionType": "MCQ", "questionCount": 16, "scorePerQuestion": 0.25, "totalScore": 4.0, "description": "16 câu trắc nghiệm nhiều lựa chọn (12 NB, 4 TH)"},
    {"partNumber": 2, "name": "Tự luận", "questionType": "ESSAY", "questionCount": 4, "scorePerQuestion": 1.5, "totalScore": 6.0, "description": "4 câu tự luận (NB 1.0đ, TH 2.0đ, VD 2.0đ, VDC 1.0đ)"}
  ]'::jsonb
)
ON CONFLICT (code) DO NOTHING;
