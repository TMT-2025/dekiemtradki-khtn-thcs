# LIVE GEMINI PRODUCTION TEST REPORT
**KHTN Assessment Studio — Real-World Gemini Production Audit**  
*Thời gian thực hiện: 2026-10-02 16:42:00 (ICT)*

---

## 1. Environment
- **`AI_PROVIDER`**: `GEMINI` (Đã cấu hình trên Vercel dạng `Secret`)
- **`GEMINI_API_KEY` configured**: **YES** (Đã cấu hình trên Vercel dạng `Secret`, giá trị ẩn an toàn)
- **`SUPABASE_REQUIRED`**: `false` (Giữ nguyên cấu hình bền bỉ)
- **`NEXT_PUBLIC_APP_ENV`**: `production`
- **`NEXT_PUBLIC_APP_URL`**: `https://dekiemtradki-khtn-thcs.vercel.app`

---

## 2. Deployment
- **Production URL**: [`https://dekiemtradki-khtn-thcs.vercel.app`](https://dekiemtradki-khtn-thcs.vercel.app)
- **Deployment Status**: `Ready` (HTTP 200)
- **Deployment ID**: `dpl_8o3bzW59eVwZCEySUpfKCZ1UhMSe`
- **Build Timestamp**: 2026-10-02 16:39:22 GMT+0700
- **Alias Verified**: Tên miền chính đã trỏ trực tiếp đến deployment mới nhất chứa biến `GEMINI_API_KEY`.

---

## 3. Gemini Provider & Model Architecture
Đã phân tích từ [`lib/ai-providers/gemini-provider.ts`](file:///e:/.%20UNG%20DUNG%20MOI/KHTN/lib/ai-providers/gemini-provider.ts):
- **Model mặc định trong mã nguồn**: `gemini-1.5-pro`
- **Biến ENV dùng để override model**: `GEMINI_MODEL`
- **Endpoint API**:
  `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`
- **Định dạng Request**:
  - `systemInstruction`: Quy chuẩn chuyên gia Khảo thí GDPT 2018.
  - `contents`: Yêu cầu chi tiết về khối lớp, bài học, phân môn, YCCĐ, mức độ nhận thức, dạng câu hỏi, điểm số.
  - `generationConfig`: `temperature: 0.2`, `responseMimeType: "application/json"`.
- **Response Parsing**:
  - Trích xuất `data.candidates[0].content.parts[0].text`.
  - Làm sạch code fence markdown (` ```json `) và parse JSON có cấu trúc.
- **Error Handling & Mock Fallback**:
  - Bắt lỗi qua khối `try { ... } catch (e)`.
  - Nếu xảy ra lỗi gọi API, hệ thống ghi log `console.warn('Gemini API call failed, falling back to pedagogical grounding engine:', e.message)` và kích hoạt `this.mockResponse(request)`.

---

## 4. Kiểm Thử AI Generation & Phân Biệt Live Gemini vs Mock

### 4.1. Request kiểm thử
- **Endpoint**: `POST https://dekiemtradki-khtn-thcs.vercel.app/api/questions/generate-ai`
- **Payload**:
  ```json
  {
    "lessonId": "lesson-6-1",
    "cognitiveLevel": "NHAN_BIET",
    "questionType": "MULTIPLE_CHOICE",
    "score": 0.25
  }
  ```

### 4.2. Response nhận được từ máy chủ Production
- **HTTP Status**: **200 OK**
- **Dữ liệu câu hỏi trả về**:
  - `questionText`: *"Khái niệm hoặc hiện tượng khoa học nào sau đây được mô tả chính xác nhất theo chuẩn SGK Kết nối tri thức?"*
  - `options`:
    - `A`: *"Hiện tượng tuân theo quy luật bảo toàn năng lượng và cấu trúc cơ bản."*
    - `B`: *"Hiện tượng chỉ xảy ra trong điều kiện nhân tạo không có trong tự nhiên."*
    - `C`: *"Quá trình biến đổi không cần bất kì năng lượng hay xúc tác nào."*
    - `D`: *"Tất cả các vật thể đều có khối lượng và kích thước bằng nhau."*
  - `correctAnswer`: `"A"`
  - `qualityReport.isValid`: `true`

### 4.3. Xác minh nguồn gốc response (Live Gemini hay Mock?)
- **Nguồn phản hồi**: **`MOCK`** (Kích hoạt bộ sinh dự phòng)
- **Bằng chứng từ nhật ký runtime của máy chủ Vercel (`vercel logs`)**:
  ```
  TIME: 16:40:18.67
  HOST: dekiemtradki-khtn-thcs.vercel.app
  LEVEL: error
  ROUTE: λ POST /api/questions/generate-ai
  LOG: Gemini API call failed, falling back to pedagogical grounding engine: Gemini API error: 404 Not Found
  ```
- **Nguyên nhân chính xác**:
  - Serverless function trên Vercel đã thực sự nhận được `GEMINI_API_KEY` và đã thực hiện cuộc gọi HTTP tới máy chủ Google Gemini.
  - Tuy nhiên, Google API endpoint `v1beta/models/gemini-1.5-pro:generateContent` trả về lỗi **`404 Not Found`**.
  - Lý do: Tên model mặc định `gemini-1.5-pro` trong source code hiện đã không còn tồn tại hoặc không được hỗ trợ trên endpoint `v1beta` của Google AI Studio (Google đã chuyển dịch sang thế hệ Gemini 2.x/2.5 như `gemini-2.5-flash` và `gemini-2.5-pro`).
  - Do gặp lỗi `404 Not Found`, cơ chế tự vệ (fallback) lập tức tiếp quản, giúp ứng dụng không bị chết và trả về câu hỏi mock chuẩn mực.

---

## 5. Đánh Giá Chất Lượng Câu Hỏi Fallback (AI Output Audit)
- **Đúng chủ đề**: Khái niệm khoa học tự nhiên cơ bản.
- **Có đáp án & giải thích**: Đáp án A kèm giải thích chi tiết theo SGK Kết nối tri thức.
- **Không lỗi JSON**: Parse JSON thành công 100%.
- **Quality Gate**: Hoạt động đầy đủ (`qualityReport.isValid: true`, `hasSingleCorrect: true`, `hasBalancedOptions: true`).

---

## 6. Bảo Mật Bí Mật (Security Check)
- **API key exposed**: **NO** (Không hiển thị trong terminal, không có trong git, không lộ trong log/bundle/response).
- **API key committed to Git**: **NO** (Toàn bộ secret nằm độc quyền trong Secret Store của Vercel).

---

## 7. Đề Xuất Khắc Phục Sau Khi Nghiệm Thu

Vì Rule 8 quy định: *"KHÔNG thêm `GEMINI_MODEL` ở bước này. Giữ model mặc định hiện tại để xác nhận API key trước. Sau khi Live Gemini PASS mới đánh giá việc nâng model"*, hệ thống giữ nguyên hiện trạng.

Tuy nhiên, nguyên nhân kỹ thuật khiến cuộc gọi Gemini trả về 404 đã được làm sáng tỏ 100%:
- Endpoint Google Gemini hiện tại yêu cầu model thế hệ mới: **`gemini-2.5-flash`** (hoặc `gemini-2.0-flash`).
- Để đưa Live Gemini vào hoạt động thực tế, chỉ cần thêm biến môi trường trên Vercel:
  - **Key**: `GEMINI_MODEL`
  - **Value**: `gemini-2.5-flash`

---

## 8. FINAL STATUS

```
GEMINI_LIVE_API_FAILED
```

*(Chi tiết: Khóa `GEMINI_API_KEY` đã được cấu hình và Vercel đã gọi ra ngoài Google Gemini API, nhưng Google API trả về lỗi `404 Not Found` do model mặc định `gemini-1.5-pro` không còn khả dụng trên endpoint Google AI Studio hiện tại; hệ thống đã kích hoạt thành công cơ chế Fallback an toàn).*
