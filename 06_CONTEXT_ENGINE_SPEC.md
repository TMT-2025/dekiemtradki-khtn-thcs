# 06_CONTEXT_ENGINE_SPEC.md

# KHTN ASSESSMENT STUDIO — CONTEXT-BASED SCIENCE ASSESSMENT ENGINE

> Version: 1.0  
> Status: Implementation Specification  
> Scope: KHTN 6–9 — CTGDPT 2018  
> Target developer: Antigravity / AI coding agent

---

## 1. MỤC ĐÍCH

Context-Based Science Assessment Engine (CBSAE) là subsystem chuyên quản lý bối cảnh khoa học, hiện tượng thực tiễn, dữ liệu, thí nghiệm và nghiên cứu khoa học để tạo câu hỏi KHTN 6–9 có giá trị đo lường thực chất.

Mục tiêu:

1. Đánh giá kiến thức KHTN trong bối cảnh thực tiễn.
2. Đánh giá phân tích dữ liệu, bằng chứng và tiến trình tìm hiểu khoa học.
3. Hỗ trợ Context-First Workflow.
4. Không biến đề kiểm tra thành bài đọc hiểu dài.
5. Quản lý nguồn, bản quyền, Việt hóa và provenance.
6. Tích hợp Matrix Engine, Specification Engine, Question Engine, Question Bank, Test Generator, RAG và DOCX Export.
7. Mọi context/question phải có traceability và Quality Gate.

---

## 2. PHẠM VI

### 2.1. Khối và phân môn

- KHTN 6, 7, 8, 9
- Vật lí, Hóa học, Sinh học

### 2.2. Loại câu hỏi

- MCQ — Nhiều lựa chọn
- TRUE_FALSE — Đúng/Sai
- SHORT_ANSWER — Trả lời ngắn
- ESSAY — Tự luận

### 2.3. Không được tự động giả định

- tỷ lệ context là quy định pháp lý;
- nguồn Internet là tự do sao chép;
- dữ liệu AI tạo ra là dữ liệu thực tế;
- context-based luôn tương đương M3/M4;
- C4 luôn tương đương M4.

---

## 3. KIẾN TRÚC TỔNG THỂ

```text
CURRICULUM / YCCĐ
       ↓
MATRIX ENGINE
       ↓
SPECIFICATION ENGINE
       ↓
┌───────────────────────────────┐
│ PHENOMENON / CONTEXT LIBRARY  │
│ INTERNATIONAL SOURCES         │
└──────────────┬────────────────┘
               ↓
        CONTEXT ENGINE
               ↓
        STIMULUS ENGINE
               ↓
        QUESTION ENGINE
               ↓
         QUALITY GATE
               ↓
         QUESTION BANK
               ↓
        TEST GENERATOR
          ↙           ↘
 CONTEXT REPORT     DOCX EXPORT
               ↓
          TRACEABILITY
```

---

## 4. CHU TRÌNH CONTEXT-BASED

```text
BỐI CẢNH
  ↓
HIỆN TƯỢNG / VẤN ĐỀ
  ↓
DỮ LIỆU / THỰC NGHIỆM / BẰNG CHỨNG
  ↓
NHIỆM VỤ HỌC SINH
  ↓
VẬN DỤNG KIẾN THỨC KHTN
  ↓
KẾT LUẬN / GIẢI PHÁP / ĐÁNH GIÁ
```

Không bắt buộc mọi item phải có đủ sáu tầng, nhưng hệ thống phải xác định được thành phần nào thực sự được sử dụng.

---

# 5. NGUYÊN TẮC `CONTEXT MUST MATTER`

Đây là Quality Gate bắt buộc.

Một câu hỏi chỉ được đánh dấu `context_based=true` nếu context/stimulus có vai trò nhận thức thực chất.

### 5.1. Remove Context Test

```text
Q_with_context = câu hỏi đầy đủ
Q_without_context = câu hỏi sau khi bỏ context/stimulus

Nếu Q_without_context vẫn có thể trả lời với cùng bản chất,
độ chính xác và mức độ nhận thức
→ FAIL: CONTEXT_NOT_NECESSARY
```

### 5.2. Context phải cung cấp ít nhất một yếu tố

- hiện tượng cần giải thích;
- dữ liệu cần phân tích;
- điều kiện thực tế;
- kết quả thí nghiệm;
- bảng/biểu đồ;
- bằng chứng;
- quan hệ nguyên nhân–kết quả;
- vấn đề cần giải pháp;
- thông tin khoa học cần đánh giá.

### 5.3. Cấm decorative context

Ví dụ: mô tả chuyến dã ngoại dài rồi hỏi một công thức không sử dụng thông tin của chuyến đi → `FAIL: DECORATIVE_CONTEXT`.

---

# 6. CONTEXT TAXONOMY

## 6.1. Context Scope

```ts
type ContextScope =
  | "PERSONAL"
  | "FAMILY_SCHOOL"
  | "LOCAL"
  | "NATIONAL"
  | "GLOBAL";
```

### PERSONAL
Sức khỏe, dinh dưỡng, vận động, giấc ngủ, vệ sinh, an toàn điện/nước.

### FAMILY_SCHOOL
Nước uống học đường, phân loại rác, tiết kiệm điện, bảo quản thực phẩm, an toàn phòng thí nghiệm.

### LOCAL
Nông nghiệp, thủy sản, xâm nhập mặn, ô nhiễm không khí, đất phèn, nguồn nước địa phương.

### NATIONAL
Năng lượng, điện gió, điện mặt trời, tài nguyên rừng, nông nghiệp, công nghệ.

### GLOBAL
Biến đổi khí hậu, nước biển dâng, rác thải nhựa, hiệu ứng nhà kính, đa dạng sinh học.

---

# 7. APPLICATION DOMAIN

```ts
type ApplicationDomain =
  | "HEALTH"
  | "ENVIRONMENT"
  | "NATURAL_RESOURCES"
  | "ENERGY"
  | "FOOD"
  | "AGRICULTURE"
  | "MATERIALS"
  | "WATER"
  | "AIR"
  | "CLIMATE"
  | "HAZARDS"
  | "TECHNOLOGY"
  | "SPACE"
  | "BIODIVERSITY"
  | "SAFETY"
  | "DAILY_LIFE"
  | "SCIENTIFIC_RESEARCH";
```

Một context có thể có một domain chính và nhiều domain phụ.

---

# 8. CONTEXT COMPLEXITY

```ts
type ContextComplexity = "C1" | "C2" | "C3" | "C4";
```

- **C1:** tình huống đời sống ngắn, ít dữ liệu.
- **C2:** có bảng, số liệu, biểu đồ hoặc kết quả đo.
- **C3:** nghiên cứu/thí nghiệm, biến, đối chứng, phương pháp, kết quả.
- **C4:** nhiều nguồn/dữ liệu, đối chiếu bằng chứng và đánh giá độ tin cậy.

`C4` không tự động có nghĩa là `M4`.

---

# 9. COGNITIVE LEVEL

```ts
type CognitiveLevel = "M1_NB" | "M2_TH" | "M3_VD" | "M4_VDC";
```

Context chỉ là môi trường đánh giá; mức độ nhận thức phải được xác định độc lập.

- M1: nhận biết.
- M2: hiểu/giải thích.
- M3: vận dụng.
- M4: vận dụng cao/phân tích, đánh giá, giải quyết vấn đề phức hợp.

---

# 10. PHENOMENON LIBRARY

File:

```text
database/phenomenon-library.json
```

Schema:

```ts
interface Phenomenon {
  id: string;
  title: string;
  description: string;
  grades: number[];
  subjectAreas: SubjectArea[];
  curriculumLinks: CurriculumLink[];
  contextScopes: ContextScope[];
  applicationDomains: ApplicationDomain[];
  complexity: ContextComplexity;
  scientificConcepts: string[];
  keywords: string[];
  phenomenonType:
    | "DAILY_LIFE" | "NATURAL_PHENOMENON" | "EXPERIMENT"
    | "RESEARCH" | "ENVIRONMENT" | "TECHNOLOGY"
    | "HEALTH" | "DATA_BASED";
  recommendedStimulusTypes: StimulusType[];
  sourceRefs: SourceReference[];
  localizationStatus:
    | "ORIGINAL_VIETNAM" | "LOCALIZED"
    | "INTERNATIONAL_ADAPTED" | "INSPIRED_BY";
  qualityStatus: "DRAFT" | "VERIFIED" | "APPROVED" | "REJECTED";
  createdAt: string;
  updatedAt: string;
}
```

Ví dụ seed data có thể bao gồm các hiện tượng trong báo cáo hiện tại: nước biển khó đóng băng, bảo quản thực phẩm, rơ-le lưỡng kim, quang hợp rong đuôi chó, bón vôi cải tạo đất, phản xạ âm, xâm nhập mặn, huyết áp sau vận động, áp suất khi lặn, hiệu suất pin mặt trời, mưa acid và di truyền ABO. Mọi mapping cụ thể phải được xác minh với dữ liệu curriculum trước khi đánh dấu `APPROVED`.

---

# 11. INTERNATIONAL CONTEXT LIBRARY

File:

```text
database/international-contexts.json
```

Nguồn có thể khai thác:

- OECD/PISA
- UNESCO
- WHO
- NOAA
- NASA
- EPA
- IRRI
- trường đại học/viện nghiên cứu/tổ chức khoa học uy tín

Schema:

```ts
interface InternationalContext {
  id: string;
  title: string;
  organization: string;
  sourceUrl: string;
  sourceDate?: string;
  topic: string;
  grades: number[];
  sourceMode: "INSPIRED_BY" | "ADAPTED_FROM" | "DIRECT_SOURCE";
  licenseStatus:
    | "OPEN_LICENSE" | "PUBLIC_DOMAIN"
    | "PERMISSION_REQUIRED" | "UNKNOWN";
  attributionRequired: boolean;
  localizationStatus: "NOT_LOCALIZED" | "LOCALIZED" | "VERIFIED";
  localizedContext?: string;
  verificationStatus: "UNVERIFIED" | "VERIFIED";
  verifiedBy?: string;
  verifiedAt?: string;
  notes?: string;
}
```

### Copyright

Không được suy luận `Internet = free to copy`.

- `INSPIRED_BY`: chỉ dùng ý tưởng, viết nội dung mới.
- `ADAPTED_FROM`: phỏng tác/điều chỉnh theo quyền hoặc điều kiện nguồn.
- `DIRECT_SOURCE`: chỉ dùng trực tiếp khi quyền/license cho phép.

Nếu license không rõ → `UNKNOWN`, không cho phép xuất bản nguyên văn như nội dung chính thức.

---

# 12. VIỆT HÓA

Pipeline:

```text
SOURCE
 ↓
SCIENTIFIC VALIDATION
 ↓
CURRICULUM MAPPING
 ↓
VIETNAMESE LOCALIZATION
 ↓
UNIT NORMALIZATION
 ↓
AGE CHECK
 ↓
CULTURAL CHECK
 ↓
QUALITY GATE
```

Ưu tiên hệ SI và đơn vị quen thuộc với học sinh Việt Nam: m, cm, mm, g, kg, mL, L, °C, s, min, h.

Nếu phải giữ đơn vị gốc:

```ts
originalUnit
normalizedUnit
conversionFormula
```

---

# 13. STIMULUS ENGINE

```ts
type StimulusType =
  | "TEXT" | "TABLE" | "CHART" | "GRAPH" | "IMAGE"
  | "DIAGRAM" | "EXPERIMENT" | "RESEARCH_ABSTRACT"
  | "OBSERVATION" | "DATASET" | "NEWS_SCENARIO"
  | "MULTI_SOURCE";

interface Stimulus {
  id: string;
  contextId: string;
  type: StimulusType;
  title?: string;
  content: string;
  data?: DataTable[];
  variables?: Variable[];
  figures?: Figure[];
  readingLoad?: "LOW" | "MEDIUM" | "HIGH";
  sourceRefs: SourceReference[];
  localizationStatus: string;
  qualityStatus: "DRAFT" | "PASSED" | "FAILED";
}
```

---

# 14. DATA ENGINE

Hỗ trợ bảng, chuỗi thời gian, dữ liệu so sánh, dữ liệu thực nghiệm, dữ liệu đo và dữ liệu mô phỏng.

```ts
interface DataTable {
  id: string;
  columns: {
    key: string;
    label: string;
    unit?: string;
    type: "NUMBER" | "TEXT" | "DATE";
  }[];
  rows: Record<string, string | number>[];
  source?: string;
  isSynthetic: boolean;
  scientificBasis?: string;
}
```

Nếu AI tạo dữ liệu mô phỏng:

```text
isSynthetic = true
```

và khi xuất phải ghi rõ: `Dữ liệu mô phỏng phục vụ mục đích đánh giá.`

Không được trình bày dữ liệu mô phỏng như số liệu thực tế.

---

# 15. EXPERIMENT ENGINE

```ts
interface ExperimentDesign {
  researchQuestion: string;
  hypothesis?: string;
  independentVariable?: string;
  dependentVariable?: string;
  controlledVariables: string[];
  controlGroup?: string;
  experimentalGroup?: string;
  materials?: string[];
  procedure?: string[];
  measurements?: string[];
  expectedData?: DataTable;
  limitations?: string[];
  safetyNotes?: string[];
}
```

Phải kiểm tra tính khả thi ở THCS, biến độc lập/phụ thuộc/kiểm soát, đối chứng, phép đo, dữ liệu, giới hạn và an toàn.

---

# 16. CONTEXT-FIRST WORKFLOW

```text
1. Chọn hiện tượng
2. Xác định khối/phân môn
3. Xác định YCCĐ
4. Chọn M1–M4
5. Chọn Context Scope
6. Chọn Application Domain
7. Chọn C1–C4
8. Tạo Stimulus/Data/Experiment
9. Sinh question family
10. Quality Gate
11. Human Review
12. Lưu Question Bank
```

Một stimulus có thể sinh một family:

```text
STIMULUS A
 ├── Q1 MCQ — M1
 ├── Q2 MCQ — M2
 ├── Q3 True/False — M2
 ├── Q4 Short Answer — M3
 └── Q5 Essay — M4
```

---

# 17. QUESTION TYPES

```ts
type QuestionType = "MCQ" | "TRUE_FALSE" | "SHORT_ANSWER" | "ESSAY";
```

Mỗi câu phải lưu tối thiểu:

```text
contextId
stimulusId
learningRequirementId
specificationId
cognitiveLevel
questionType
```

MCQ: đúng một đáp án; distractor hợp lý; không có hai đáp án tương đương.

True/False: mỗi mệnh đề độc lập và xác định được đúng/sai.

Short Answer: đáp án, đơn vị và sai số cho phép nếu có.

Essay: rubric, tiêu chí và mức điểm.

---

# 18. CONTEXT QUALITY GATE

10 tiêu chí bắt buộc:

| ID | Tiêu chí |
|---|---|
| QG01 | Scientific Accuracy |
| QG02 | Curriculum Alignment |
| QG03 | Age Appropriateness |
| QG04 | Real-world Relevance |
| QG05 | Context Necessity |
| QG06 | Data Validity |
| QG07 | Language Clarity |
| QG08 | Cultural Appropriateness |
| QG09 | Cognitive Match |
| QG10 | Source Reliability |

### QG01
FAIL nếu sai định luật, thuật ngữ, dữ liệu hoặc quan hệ nguyên nhân–kết quả.

### QG02
Phải map được YCCĐ; không yêu cầu kiến thức ngoài cấp học nếu không cần thiết.

### QG03
Chặn biệt ngữ đại học không cần thiết như orbital, Gibbs, entropy nâng cao.

### QG04
Context phải liên quan thực chất tới nhiệm vụ.

### QG05
Phải chạy Remove Context Test.

### QG06
Kiểm tra đơn vị, phạm vi, tính nhất quán và khả năng suy luận từ dữ liệu.

### QG07
Kiểm soát độ dài, ambiguity, thuật ngữ và reading load.

### QG08
Kiểm tra đơn vị, địa danh, văn hóa và khả năng tiếp cận tại Việt Nam.

### QG09
Đối chiếu context với M1–M4; không tự động nâng mức nhận thức chỉ vì context phức tạp.

### QG10
Kiểm tra tổ chức, URL, source mode, license và verification.

---

# 19. QUALITY GATE RESULT

```ts
interface QualityGateResult {
  status: "PASS" | "FAIL" | "WARNING";
  score?: number;
  checks: {
    criterionId: string;
    status: "PASS" | "FAIL" | "WARNING";
    message: string;
    evidence?: string;
  }[];
  blockingIssues: string[];
  warnings: string[];
  reviewedAt: string;
}
```

Nếu QG01, QG02, QG05 hoặc QG10 = FAIL → `OVERALL = FAIL`.

---

# 20. CONTEXT RATIO

Matrix field:

```ts
contextTargetPercentage: number;
```

UI cho phép:

```text
20, 30, 40, 50, 60, 70, 80, 90, 100
```

Default hiện tại: `50`.

**Quan trọng:** 50% chỉ là giá trị mặc định của hệ thống theo thiết kế hiện tại; không được mô tả là tỷ lệ bắt buộc của GDPT 2018 nếu không có căn cứ pháp lý tương ứng.

Actual:

```text
(number of context-based questions / total questions) × 100
```

Báo cáo `actual / target / delta`, không tự động sửa đề nếu giáo viên chưa yêu cầu.

---

# 21. CONTEXT REPORT

Route:

```text
/tests
```

Hiển thị:

- tổng số câu;
- số câu có context;
- actual/target;
- phân bố Scope;
- Application Domain;
- Complexity;
- Cognitive Level;
- Question Type;
- nguồn Việt Nam/quốc tế;
- data-based;
- research-based.

Cross-analysis:

```text
Scope × Cognitive Level
Domain × Cognitive Level
Complexity × Cognitive Level
Question Type × Context
```

---

# 22. TRACEABILITY

Chuỗi bắt buộc:

```text
QUESTION
 ↓
STIMULUS
 ↓
CONTEXT
 ↓
PHENOMENON
 ↓
SOURCE
 ↓
YCCĐ
 ↓
SPECIFICATION
 ↓
MATRIX CELL
 ↓
TEST
```

```ts
interface ContextTrace {
  questionId: string;
  stimulusId?: string;
  contextId: string;
  phenomenonId?: string;
  sourceRefs: string[];
  learningRequirementId: string;
  specificationId: string;
  matrixCellId: string;
  testId?: string;
}
```

UI phải có `Xem nguồn & Bối cảnh`.

---

# 23. CONTEXT LIBRARY UI

Route:

```text
/context-library
```

Filters:

- Khối 6–9
- Phân môn
- C1–C4
- Scope
- Application Domain
- Phenomenon Type
- Source Organization
- Verified/Unverified
- Localization Status
- Keyword

Card hiển thị:

```text
Tên hiện tượng
Khối / phân môn
Scope
Domain
Complexity
Nguồn
Verification
```

Actions:

```text
Xem chi tiết
Tạo câu hỏi
Việt hóa
Xem nguồn
Xem Quality Gate
```

---

# 24. AI GENERATION CONTRACT

Input:

```ts
interface ContextGenerationRequest {
  grade: number;
  subjectArea: SubjectArea;
  learningRequirementId: string;
  cognitiveLevel: CognitiveLevel;
  contextScope: ContextScope;
  applicationDomain: ApplicationDomain;
  complexity: ContextComplexity;
  questionType: QuestionType;
  preferredStimulusType?: StimulusType;
  localizeToVietnam: boolean;
}
```

Pipeline:

```text
YCCĐ
 ↓
CONCEPT
 ↓
PHENOMENON
 ↓
CONTEXT
 ↓
STIMULUS
 ↓
TASK
 ↓
QUESTION
 ↓
ANSWER/RUBRIC
 ↓
QUALITY GATE
```

AI MUST NOT:

- bịa nguồn/URL;
- bịa nghiên cứu;
- bịa số liệu thực tế;
- gắn dữ liệu synthetic thành real;
- tự tạo YCCĐ không có nguồn;
- bỏ qua Quality Gate.

Nếu thiếu nguồn → `NEEDS_VERIFICATION`.

---

# 25. HUMAN-IN-THE-LOOP

Luồng chuẩn:

```text
AI_GENERATED
 ↓
NEEDS_REVIEW
 ↓
VERIFIED
 ↓
APPROVED
```

Không cho context chưa xác minh trở thành `official source`.

---

# 26. DATABASE MODEL

Bảng tối thiểu:

```text
contexts
phenomena
context_sources
context_stimuli
context_data_tables
context_experiments
context_quality_checks
context_localizations
context_traces
context_audit_logs
```

### contexts

```text
id
title
description
grade
subject_area
scope
application_domain
complexity
phenomenon_type
status
created_by
created_at
updated_at
```

### context_sources

```text
id
context_id
organization
title
url
source_mode
license_status
attribution_required
verification_status
verified_at
notes
```

### context_stimuli

```text
id
context_id
type
title
content
reading_load
is_synthetic
quality_status
```

### context_quality_checks

```text
id
context_id
question_id
criterion
status
score
message
evidence
checked_at
```

---

# 27. SERVICES / API

Services:

```text
contextService
phenomenonService
stimulusService
contextSourceService
contextQualityService
contextGenerationService
contextTraceService
contextReportService
```

API:

```text
GET    /api/contexts
POST   /api/contexts
GET    /api/contexts/:id
PATCH  /api/contexts/:id
DELETE /api/contexts/:id

GET    /api/phenomena
POST   /api/phenomena

POST   /api/contexts/:id/stimulus
POST   /api/contexts/:id/generate-question
POST   /api/contexts/:id/quality-gate
GET    /api/contexts/:id/trace
GET    /api/tests/:id/context-report
```

---

# 28. RAG INTEGRATION

Context Engine phải truy xuất được:

```text
Curriculum
YCCĐ
Textbook
Local Guidance
Scientific Source
Phenomenon Library
Question Bank
```

Ưu tiên provenance:

```text
LEGAL/OFFICIAL
  > CURRICULUM
  > TEXTBOOK
  > VERIFIED SCIENTIFIC SOURCE
  > EDUCATIONAL REFERENCE
  > AI GENERATED
```

Mọi AI output phải giữ source provenance.

---

# 29. SEARCH / RETRIEVAL

Hỗ trợ:

- keyword search;
- semantic search;
- grade;
- subject;
- curriculum;
- domain;
- scope;
- complexity;
- source.

Ví dụ:

```text
KHTN 8 + Hóa học + xâm nhập mặn + dung dịch
```

Chỉ cho phép sử dụng context sau khi curriculum mapping hợp lệ.

---

# 30. DIVERSITY ENGINE

Trong cùng một đề phải hạn chế lặp:

- phenomenon;
- source;
- địa phương;
- domain;
- stimulus type.

```ts
interface DiversityReport {
  scopeDistribution: Record<string, number>;
  domainDistribution: Record<string, number>;
  complexityDistribution: Record<string, number>;
  stimulusDistribution: Record<string, number>;
  repeatedPhenomena: string[];
  repeatedSources: string[];
  diversityWarnings: string[];
}
```

---

# 31. TEST GENERATION

```text
MATRIX
 ↓
SPECIFICATION
 ↓
QUESTION CANDIDATES
 ↓
CONTEXT FILTER
 ↓
DIVERSITY FILTER
 ↓
QUALITY GATE
 ↓
TEST
```

Không chọn context chỉ vì `context=true`; phải đồng thời đạt curriculum, cognitive, question type, target, quality và diversity.

---

# 32. DOCX EXPORT

File đề:

```text
03_De_kiem_tra.docx
```

Phải bảo toàn:

- context title;
- stimulus;
- bảng dữ liệu;
- hình/biểu đồ;
- câu hỏi;
- phương án;
- formatting.

Không đưa metadata nội bộ vào đề học sinh.

Có thể xuất báo cáo riêng:

```text
04_Context_Traceability.docx
```

---

# 33. SECURITY

Sanitize toàn bộ imported/source content.

Không cho source/stimulus thực thi:

- script;
- HTML độc hại;
- prompt injection;
- nội dung executable.

Không render HTML không kiểm soát.

---

# 34. VERSIONING

Context phải versioned:

```text
v1 → v2 → v3
```

Không overwrite nội dung đã được sử dụng trong đề chính thức.

Đề cũ phải giữ reference tới version cũ.

---

# 35. AUDIT LOG

Actions:

```text
created
updated
localized
source_changed
quality_checked
approved
rejected
archived
used_in_question
used_in_test
```

```ts
interface ContextAuditLog {
  id: string;
  contextId: string;
  action: string;
  actorId: string;
  timestamp: string;
  before?: unknown;
  after?: unknown;
}
```

---

# 36. ROLE / PERMISSION

| Role | Quyền chính |
|---|---|
| super_admin | toàn quyền |
| school_admin | quản lý cấp trường |
| dept_head | duyệt chuyên môn |
| teacher | tạo/sử dụng context |
| reviewer | kiểm định context |

Teacher có thể CREATE/DRAFT/GENERATE; quyền APPROVE OFFICIAL có thể yêu cầu reviewer/dept_head.

---

# 37. STATUS MODEL

```text
DRAFT
AI_GENERATED
NEEDS_REVIEW
VERIFIED
APPROVED
REJECTED
ARCHIVED
```

---

# 38. ERROR CODES

```text
CONTEXT_NOT_FOUND
PHENOMENON_NOT_FOUND
SOURCE_NOT_VERIFIED
LICENSE_UNKNOWN
CURRICULUM_MISMATCH
CONTEXT_NOT_NECESSARY
DECORATIVE_CONTEXT
DATA_INVALID
AGE_INAPPROPRIATE
CULTURAL_MISMATCH
COGNITIVE_MISMATCH
READING_LOAD_TOO_HIGH
DUPLICATE_CONTEXT
DUPLICATE_QUESTION
```

---

# 39. OBSERVABILITY

Events:

```text
context_generation_started
context_generation_completed
quality_gate_started
quality_gate_failed
quality_gate_passed
question_generated_from_context
context_used_in_test
export_context_completed
```

---

# 40. CONFIGURABLE RULE ENGINE

Rules không hard-code trong UI.

```json
{
  "contextTargetDefault": 50,
  "allowedContextPercentages": [20,30,40,50,60,70,80,90,100],
  "requireSourceForInternational": true,
  "requireQualityGateForQuestion": true,
  "allowSyntheticData": true,
  "requireSyntheticDataLabel": true,
  "requireHumanApproval": true
}
```

---

# 41. FILE STRUCTURE

```text
database/
├── phenomenon-library.json
├── international-contexts.json
├── context-rules.json
└── context-stimuli.json

src/
├── modules/context-engine/
│   ├── types/
│   ├── services/
│   ├── validators/
│   ├── generators/
│   ├── quality-gate/
│   ├── reports/
│   └── traceability/
├── app/context-library/
└── app/api/contexts/

tests/
├── context-engine.test.ts
├── context-quality.test.ts
├── context-traceability.test.ts
├── context-report.test.ts
├── context-generation.test.ts
├── context-localization.test.ts
├── context-source.test.ts
└── context-export.test.ts
```

---

# 42. INTEGRATION CONTRACTS

### Matrix Engine → Context Engine

```text
matrixCellId
learningRequirementId
cognitiveLevel
questionType
contextTarget
```

### Specification Engine → Context Engine

```text
specificationId
contentUnit
expectedPerformance
cognitiveLevel
```

### Context Engine → Question Engine

```text
contextId
stimulusId
questionType
cognitiveLevel
```

### Test Generator → Context Engine

```text
contextTargetPercentage
contextDiversityRules
qualityGateRules
```

### RAG → Context Engine

```text
sourceRefs
embedding
metadata
provenance
```

---

# 43. ACCEPTANCE TESTS

## AT01 — Phenomenon Library

Load/filter phenomena KHTN 6–9.

Expected: PASS.

## AT02 — International Sources

Verify configured sources such as NOAA, WHO, OECD/PISA, EPA, IRRI when present in dataset.

Expected: source metadata and verification state are correct.

## AT03 — High-quality context

Expected: all blocking criteria PASS.

## AT04 — Age appropriateness

University jargon unnecessary for THCS → FAIL/WARNING according to configured severity; never silently PASS.

## AT05 — Cultural/unit validation

Unnormalized °F, gallon, inch → FAIL unless there is a documented reason and normalized representation.

## AT06 — Context report

Actual percentage, target, delta, scope/domain/cognitive distributions must be correct.

## AT07 — Workflow B

Generate MCQ, TRUE/FALSE, SHORT_ANSWER, ESSAY with full traceability.

## AT08 — Context necessity

Remove context and rerun equivalence check. If answer remains essentially unchanged → `FAIL: CONTEXT_NOT_NECESSARY`.

## AT09 — Synthetic data

Synthetic dataset must be marked and must not be represented as real-world measured data.

## AT10 — Provenance

Every international context must retain source organization, URL, source mode, license state and verification state.

---

# 44. PERFORMANCE

- pagination;
- debounced search;
- lazy-load stimulus;
- server-side filtering for large datasets;
- caching lookup data;
- avoid loading the entire Context Library on initial page load.

---

# 45. IMPLEMENTATION ORDER

```text
PHASE 1  Types + Schema
PHASE 2  Phenomenon Library
PHASE 3  International Source Library
PHASE 4  Context Library UI
PHASE 5  Stimulus/Data/Experiment Engine
PHASE 6  Quality Gate
PHASE 7  Context-First Generation
PHASE 8  Question Bank Integration
PHASE 9  Matrix/Test Integration
PHASE 10 Traceability + Reports
PHASE 11 DOCX Export
PHASE 12 Full E2E QA
```

Không chuyển phase khi acceptance test của phase hiện tại chưa PASS.

---

# 46. DEFINITION OF DONE

### Data

- [ ] Phenomenon Library hoạt động.
- [ ] International Context Library hoạt động.
- [ ] Source/License tracking.
- [ ] Localization.

### Generation

- [ ] Context generation.
- [ ] Stimulus generation.
- [ ] Data generation.
- [ ] Experiment generation.
- [ ] Question generation.

### Quality

- [ ] QG01–QG10.
- [ ] Context Must Matter.
- [ ] Curriculum Alignment.
- [ ] Source Reliability.
- [ ] Age/Cultural validation.

### Integration

- [ ] Matrix Engine.
- [ ] Specification Engine.
- [ ] Question Bank.
- [ ] Test Generator.
- [ ] RAG.
- [ ] DOCX Export.

### Traceability

- [ ] Question → Context.
- [ ] Context → Phenomenon.
- [ ] Context → Source.
- [ ] Question → YCCĐ.
- [ ] Question → Specification.
- [ ] Question → Matrix.
- [ ] Test → Context Report.

### QA

- [ ] Unit tests.
- [ ] Integration tests.
- [ ] E2E tests.
- [ ] Quality Gate tests.
- [ ] Export tests.
- [ ] TypeScript check.
- [ ] ESLint.
- [ ] Zero runtime errors.

---

# 47. MASTER IMPLEMENTATION COMMAND FOR ANTIGRAVITY

> Implement the Context-Based Science Assessment Engine according to this specification.
>
> Do not simplify the architecture. Do not remove traceability. Do not hard-code curriculum assumptions. Do not invent legal requirements, scientific sources, research, URLs or real-world data. Do not treat context as decoration. Do not bypass Quality Gate. Do not expose unverified content as official.
>
> Preserve compatibility with Matrix Engine, Specification Engine, Question Engine, Question Bank, Test Generator, RAG and DOCX Export.
>
> Every generated context/question must be traceable. Every international source must have provenance. Every synthetic dataset must be labeled. Every context-based question must pass Context Must Matter.
>
> After implementation, run TypeScript check, ESLint, unit tests, integration tests, E2E tests and export tests. Report actual results. Never claim PASS unless the tests actually pass.

---

# 48. FINAL DESIGN PRINCIPLE

> **Context phải có giá trị đo lường. Nếu bỏ bối cảnh mà nhiệm vụ nhận thức của học sinh gần như không thay đổi, bối cảnh đó không đạt chuẩn Context-Based Science Assessment.**

Context Engine không phải tính năng “thêm đoạn văn thực tế” vào Question Generator. Đây là một subsystem độc lập gồm:

```text
CONTEXT
+ PHENOMENON
+ STIMULUS
+ DATA / EXPERIMENT
+ SCIENTIFIC EVIDENCE
+ QUESTION GENERATION
+ QUALITY GATE
+ PROVENANCE
+ TRACEABILITY
+ TEST INTEGRATION
```
