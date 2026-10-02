'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { GradeLevel, Semester } from '@/types/curriculum';
import { AssessmentMatrix, AssessmentTemplate, MatrixRow, MatrixCellExplain } from '@/types/matrix';
import {
  Grid3X3,
  Sparkles,
  Save,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Download,
  Info,
  Plus,
  Trash2,
  Copy,
  ChevronRight,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

export default function MatrixPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500 font-bold">Đang tải Studio Ma trận...</div>}>
      <MatrixContent />
    </Suspense>
  );
}

function MatrixContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialGrade = (Number(searchParams.get('grade')) || 6) as GradeLevel;
  const initialLessons = searchParams.get('lessons')
    ? decodeURIComponent(searchParams.get('lessons')!).split(',')
    : [];

  const [grade, setGrade] = useState<GradeLevel>(initialGrade);
  const [semester, setSemester] = useState<Semester>('HK1');
  const [schoolYear, setSchoolYear] = useState('2026–2027');
  const [assessmentType, setAssessmentType] = useState<'MID_TERM_1' | 'FINAL_TERM_1' | 'MID_TERM_2' | 'FINAL_TERM_2'>('MID_TERM_1');
  const [duration, setDuration] = useState(60);
  const [enableM4, setEnableM4] = useState(true);
  const [contextRatio, setContextRatio] = useState<number>(0.5);

  const [templates, setTemplates] = useState<AssessmentTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [allLessons, setAllLessons] = useState<any[]>([]);
  const [selectedLessonIds, setSelectedLessonIds] = useState<string[]>(initialLessons);

  const [matrix, setMatrix] = useState<AssessmentMatrix | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState(false);
  const [explainModal, setExplainModal] = useState<MatrixCellExplain | null>(null);
  const [qualityIssues, setQualityIssues] = useState<any[]>([]);

  // Wizard Step (1: Setup, 2: Scope, 3: Matrix Grid)
  const [currentStep, setCurrentStep] = useState<number>(initialLessons.length > 0 ? 3 : 1);

  useEffect(() => {
    // Fetch initial templates & lessons
    fetch('/api/matrix/setup')
      .then(res => res.json())
      .then(data => {
        setTemplates(data.templates || []);
        if (data.templates && data.templates.length > 0) {
          setSelectedTemplateId(data.templates[0].id);
        }
        setAllLessons(data.lessons || []);

        // If lessons were passed in URL, auto-generate initial matrix
        if (initialLessons.length > 0) {
          handleGenerateMatrix(data.templates[0].id, initialLessons);
        }
      })
      .catch(err => console.error('Error loading setup data', err));
  }, []);

  const gradeFilteredLessons = allLessons.filter(l => l.grade === grade && l.semester === semester);

  const handleGenerateMatrix = async (tplId?: string, lessonIds?: string[]) => {
    const targetTplId = tplId || selectedTemplateId;
    const targetLessons = lessonIds || selectedLessonIds;

    if (targetLessons.length === 0) {
      alert('Vui lòng chọn ít nhất một bài học trong phạm vi kiểm tra.');
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch('/api/matrix/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grade,
          semester,
          schoolYear,
          assessmentType,
          templateId: targetTplId,
          selectedLessonIds: targetLessons,
          enableM4,
          contextRatio
        })
      });
      const data = await res.json();
      if (data.matrix) {
        setMatrix(data.matrix);
        setQualityIssues(data.qualityGate?.issues || []);
        setCurrentStep(3);
      }
    } catch (e) {
      console.error('Error generating matrix', e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCellChange = (rowIndex: number, field: keyof MatrixRow, value: number) => {
    if (!matrix) return;
    const updatedRows = [...matrix.rows];
    updatedRows[rowIndex] = {
      ...updatedRows[rowIndex],
      [field]: Math.max(0, value)
    };

    // Send updated matrix to recalculate endpoint
    fetch('/api/matrix/recalculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matrix: { ...matrix, rows: updatedRows } })
    })
      .then(res => res.json())
      .then(data => {
        setMatrix(data.matrix);
        setQualityIssues(data.qualityGate?.issues || []);
      });
  };

  const handleSaveMatrix = async () => {
    if (!matrix) return;
    try {
      const res = await fetch('/api/matrix/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matrix })
      });
      if (res.ok) {
        setSaveSuccessMessage(true);
        setTimeout(() => setSaveSuccessMessage(false), 3000);
      }
    } catch (e) {
      console.error('Error saving matrix', e);
    }
  };

  const handleCreateSpecification = () => {
    if (!matrix) return;
    router.push(`/specification?matrixId=${matrix.id}`);
  };

  return (
    <div className="p-8 max-w-[96rem] mx-auto space-y-6">
      {/* Wizard Header & Steps */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-amber-600 uppercase tracking-wider mb-1">
            <Grid3X3 className="h-4 w-4" />
            <span>Mô-đun 1 • Thiết kế Ma trận đề kiểm tra</span>
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">MA TRẬN ĐỀ KIỂM TRA ĐỊNH KÌ</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Thuật toán phân bổ tự động 16 bước • Cân đối số tiết và 3 mạch kiến thức • Giải trình Explain Why
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold">
          <button
            onClick={() => setCurrentStep(1)}
            className={`px-3 py-1 rounded-lg transition ${
              currentStep === 1 ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            1. Cấu hình đề
          </button>
          <ChevronRight className="h-3 w-3 text-slate-400" />
          <button
            onClick={() => setCurrentStep(2)}
            className={`px-3 py-1 rounded-lg transition ${
              currentStep === 2 ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            2. Phạm vi bài học ({selectedLessonIds.length})
          </button>
          <ChevronRight className="h-3 w-3 text-slate-400" />
          <button
            onClick={() => matrix && setCurrentStep(3)}
            disabled={!matrix}
            className={`px-3 py-1 rounded-lg transition ${
              currentStep === 3
                ? 'bg-blue-600 text-white'
                : matrix
                ? 'text-slate-500 hover:text-slate-800'
                : 'text-slate-300 cursor-not-allowed'
            }`}
          >
            3. Bảng ma trận
          </button>
        </div>
      </div>

      {/* STEP 1: CẤU HÌNH ĐỀ */}
      {currentStep === 1 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6 max-w-4xl">
          <h2 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">
            Bước 1: Thiết lập Thông tin và Cấu trúc Đề kiểm tra
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs font-medium">
            <div>
              <label className="block text-slate-700 font-bold mb-1.5">1. Khối lớp</label>
              <select
                value={grade}
                onChange={e => {
                  setGrade(Number(e.target.value) as GradeLevel);
                  setSelectedLessonIds([]);
                }}
                className="w-full border border-slate-200 bg-slate-50 rounded-xl p-2.5 font-bold focus:ring-2 focus:ring-blue-500"
              >
                <option value={6}>Khoa học tự nhiên 6</option>
                <option value={7}>Khoa học tự nhiên 7</option>
                <option value={8}>Khoa học tự nhiên 8</option>
                <option value={9}>Khoa học tự nhiên 9</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1.5">2. Năm học</label>
              <input
                type="text"
                value={schoolYear}
                onChange={e => setSchoolYear(e.target.value)}
                className="w-full border border-slate-200 bg-slate-50 rounded-xl p-2.5 font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1.5">3. Học kì</label>
              <select
                value={semester}
                onChange={e => setSemester(e.target.value as Semester)}
                className="w-full border border-slate-200 bg-slate-50 rounded-xl p-2.5 font-bold"
              >
                <option value="HK1">Học kì I</option>
                <option value="HK2">Học kì II</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1.5">4. Loại kì kiểm tra</label>
              <select
                value={assessmentType}
                onChange={e => setAssessmentType(e.target.value as any)}
                className="w-full border border-slate-200 bg-slate-50 rounded-xl p-2.5 font-bold"
              >
                <option value="MID_TERM_1">Kiểm tra Giữa Học kì I</option>
                <option value="FINAL_TERM_1">Kiểm tra Cuối Học kì I</option>
                <option value="MID_TERM_2">Kiểm tra Giữa Học kì II</option>
                <option value="FINAL_TERM_2">Kiểm tra Cuối Học kì II</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1.5">5. Thời gian làm bài</label>
              <select
                value={duration}
                onChange={e => setDuration(Number(e.target.value))}
                className="w-full border border-slate-200 bg-slate-50 rounded-xl p-2.5 font-bold"
              >
                <option value={45}>45 phút</option>
                <option value={60}>60 phút (Chuẩn)</option>
                <option value={90}>90 phút</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1.5">6. Cấu trúc Template đề</label>
              <select
                value={selectedTemplateId}
                onChange={e => setSelectedTemplateId(e.target.value)}
                className="w-full border border-slate-200 bg-slate-50 rounded-xl p-2.5 font-bold text-blue-700"
              >
                {templates.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1.5 flex items-center justify-between">
                <span>7. Tỉ lệ câu hỏi có bối cảnh thực tiễn</span>
                <span className="text-cyan-700 font-bold text-xs bg-cyan-100 px-2 py-0.5 rounded">Context Engine</span>
              </label>
              <select
                value={contextRatio}
                onChange={e => setContextRatio(Number(e.target.value))}
                className="w-full border border-slate-200 bg-slate-50 rounded-xl p-2.5 font-bold text-cyan-800"
              >
                <option value={0.2}>20% câu hỏi có bối cảnh</option>
                <option value={0.3}>30% câu hỏi có bối cảnh</option>
                <option value={0.4}>40% câu hỏi có bối cảnh</option>
                <option value={0.5}>50% câu hỏi có bối cảnh (Chuẩn GDPT 2018)</option>
                <option value={0.6}>60% câu hỏi có bối cảnh</option>
                <option value={0.7}>70% câu hỏi có bối cảnh</option>
                <option value={0.8}>80% câu hỏi có bối cảnh</option>
                <option value={1.0}>100% câu hỏi có bối cảnh (Toàn diện thực tiễn)</option>
              </select>
            </div>
          </div>

          {/* M4 Toggle */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/80 flex items-center justify-between">
            <div>
              <p className="font-bold text-xs text-slate-800">Cấu hình mức độ nhận thức M4 (Vận dụng cao)</p>
              <p className="text-[11px] text-slate-500">
                Cho phép bật hoặc tắt phân loại câu hỏi Vận dụng cao trong ma trận theo chỉ đạo chuyên môn.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={enableM4}
                onChange={e => setEnableM4(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex justify-end pt-3">
            <button
              onClick={() => setCurrentStep(2)}
              className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow transition"
            >
              <span>Tiếp tục: Chọn phạm vi bài học</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: CHỌN PHẠM VI BÀI HỌC */}
      {currentStep === 2 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-5">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Bước 2: Chọn các bài học đưa vào phạm vi kiểm tra (KHTN {grade} - {semester})
              </h2>
              <p className="text-xs text-slate-500">
                Đã chọn {selectedLessonIds.length} bài. Hệ thống sẽ căn cứ chính xác số tiết thực dạy để phân bổ tỉ trọng.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  const ids = gradeFilteredLessons.map(l => l.id);
                  setSelectedLessonIds(selectedLessonIds.length === ids.length ? [] : ids);
                }}
                className="text-xs text-blue-600 font-bold hover:underline"
              >
                Chọn tất cả ({gradeFilteredLessons.length} bài)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[55vh] overflow-y-auto p-1">
            {gradeFilteredLessons.map(l => {
              const isChecked = selectedLessonIds.includes(l.id);
              return (
                <div
                  key={l.id}
                  onClick={() => {
                    if (isChecked) {
                      setSelectedLessonIds(selectedLessonIds.filter(id => id !== l.id));
                    } else {
                      setSelectedLessonIds([...selectedLessonIds, l.id]);
                    }
                  }}
                  className={`p-3 rounded-xl border transition cursor-pointer text-xs flex items-start space-x-3 ${
                    isChecked
                      ? 'border-blue-400 bg-blue-50/50 shadow-sm'
                      : 'border-slate-100 bg-slate-50/60 hover:bg-slate-100/60'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}}
                    className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500 mt-0.5"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-slate-800">Bài {l.lessonNumber}</span>
                      <span className="text-[10px] font-semibold text-slate-500">{l.periods} tiết</span>
                    </div>
                    <p className="text-slate-700 font-medium line-clamp-1">{l.title}</p>
                    <span className="text-[10px] text-blue-600 font-semibold">{l.subjectArea}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-slate-100">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2 border border-slate-200 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-50"
            >
              Quay lại
            </button>
            <button
              onClick={() => handleGenerateMatrix()}
              disabled={selectedLessonIds.length === 0 || isGenerating}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-lg shadow-blue-500/20 transition disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4 text-amber-300" />
              <span>{isGenerating ? 'ĐANG TÍNH TOÁN MA TRẬN...' : 'TỰ ĐỘNG SINH MA TRẬN ĐỀ (16 BƯỚC)'}</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: BẢNG MA TRẬN LỚN (STICKY HEADER & CELL EDITING) */}
      {currentStep === 3 && matrix && (
        <div className="space-y-4">
          {/* Action Ribbon */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></span>
              <div>
                <h2 className="font-black text-sm text-slate-800">{matrix.title}</h2>
                <p className="text-xs text-slate-500">
                  Tổng: <span className="font-bold text-blue-600">{matrix.totalQuestions} câu</span> | Tổng điểm:{' '}
                  <span className="font-bold text-emerald-600">{matrix.totalScore.toFixed(2)}đ</span> (100%) | Thời gian:{' '}
                  {matrix.durationMinutes} phút
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2.5">
              <button
                onClick={handleSaveMatrix}
                className="inline-flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl shadow transition"
              >
                <Save className="h-3.5 w-3.5" />
                <span>{saveSuccessMessage ? 'Đã lưu thành công!' : 'Lưu Ma trận'}</span>
              </button>

              <button
                onClick={handleCreateSpecification}
                className="inline-flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow transition"
              >
                <FileSpreadsheet className="h-3.5 w-3.5" />
                <span>Sinh Bản đặc tả</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Quality Alerts Banner if any */}
          {qualityIssues.length > 0 && (
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 space-y-2">
              <div className="flex items-center space-x-2 text-amber-800 font-bold text-xs">
                <ShieldAlert className="h-4 w-4" />
                <span>CẢNH BÁO TÍNH NHẤT QUÁN & KHẢO THÍ:</span>
              </div>
              <ul className="text-xs text-amber-700 space-y-1 list-disc pl-5">
                {qualityIssues.map((issue, idx) => (
                  <li key={idx}>
                    <span className="font-semibold">[{issue.severity}]</span> {issue.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Large Sticky Matrix Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto max-h-[65vh]">
              <table className="w-full text-center text-xs border-collapse">
                {/* Multi-tier sticky header */}
                <thead className="bg-slate-800 text-white font-bold sticky top-0 z-20 shadow-md">
                  <tr>
                    <th rowSpan={3} className="py-2.5 px-3 border border-slate-700 sticky left-0 z-30 bg-slate-900 w-64 text-left">
                      Chủ đề / Đơn vị kiến thức
                    </th>
                    <th rowSpan={3} className="py-2.5 px-2 border border-slate-700 w-16">
                      Số tiết
                    </th>
                    <th colSpan={4} className="py-2 px-2 border border-slate-700 bg-blue-900/80">
                      I. TN Nhiều lựa chọn (0.25đ/câu)
                    </th>
                    <th colSpan={4} className="py-2 px-2 border border-slate-700 bg-indigo-900/80">
                      II. Đúng/Sai (0.25đ/lệnh)
                    </th>
                    <th colSpan={4} className="py-2 px-2 border border-slate-700 bg-violet-900/80">
                      III. Trả lời ngắn (0.5đ/câu)
                    </th>
                    <th colSpan={4} className="py-2 px-2 border border-slate-700 bg-teal-900/80">
                      IV. Tự luận (1.0đ/câu)
                    </th>
                    <th rowSpan={3} className="py-2.5 px-3 border border-slate-700 w-20 bg-slate-900">
                      Tổng câu
                    </th>
                    <th rowSpan={3} className="py-2.5 px-3 border border-slate-700 w-20 bg-slate-900">
                      Điểm số
                    </th>
                    <th rowSpan={3} className="py-2.5 px-2 border border-slate-700 w-16 bg-slate-900">
                      Tỉ lệ %
                    </th>
                  </tr>
                  <tr>
                    {/* Sub-headers for levels */}
                    {['MCQ', 'TF', 'SA', 'ES'].map(cat => (
                      <React.Fragment key={cat}>
                        <th className="py-1 px-1 border border-slate-700 text-[10px] w-10">NB</th>
                        <th className="py-1 px-1 border border-slate-700 text-[10px] w-10">TH</th>
                        <th className="py-1 px-1 border border-slate-700 text-[10px] w-10">VD</th>
                        <th className="py-1 px-1 border border-slate-700 text-[10px] w-10">VDC</th>
                      </React.Fragment>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 font-medium">
                  {matrix.rows.map((row, idx) => (
                    <tr key={row.id} className="hover:bg-slate-50/80 transition">
                      {/* Sticky First Column */}
                      <td className="py-2 px-3 border-r border-slate-200 sticky left-0 z-10 bg-white text-left font-bold text-slate-800 flex items-center justify-between">
                        <span className="line-clamp-1">{row.topicName}</span>
                        <button
                          onClick={() => setExplainModal(row.explainNotes?.['NB'] || null)}
                          title="Cơ chế Explain Why: Giải trình căn cứ pháp lý & YCCĐ"
                          className="text-blue-500 hover:text-blue-700 ml-1.5 flex-shrink-0"
                        >
                          <Info className="h-3.5 w-3.5" />
                        </button>
                      </td>

                      <td className="py-2 px-2 border-r border-slate-100 font-bold text-slate-600">{row.periods}</td>

                      {/* Editable Cells for MCQ */}
                      <td className="py-1 px-1 border-r border-slate-100">
                        <input
                          type="number"
                          min={0}
                          value={row.nbMcq}
                          onChange={e => handleCellChange(idx, 'nbMcq', parseInt(e.target.value) || 0)}
                          className="w-8 text-center p-0.5 rounded border border-slate-200 focus:bg-blue-50"
                        />
                      </td>
                      <td className="py-1 px-1 border-r border-slate-100">
                        <input
                          type="number"
                          min={0}
                          value={row.thMcq}
                          onChange={e => handleCellChange(idx, 'thMcq', parseInt(e.target.value) || 0)}
                          className="w-8 text-center p-0.5 rounded border border-slate-200 focus:bg-blue-50"
                        />
                      </td>
                      <td className="py-1 px-1 border-r border-slate-100 text-slate-300">-</td>
                      <td className="py-1 px-1 border-r border-slate-200 text-slate-300">-</td>

                      {/* True/False */}
                      <td className="py-1 px-1 border-r border-slate-100 text-slate-300">-</td>
                      <td className="py-1 px-1 border-r border-slate-100">
                        <input
                          type="number"
                          min={0}
                          value={row.thTf}
                          onChange={e => handleCellChange(idx, 'thTf', parseInt(e.target.value) || 0)}
                          className="w-8 text-center p-0.5 rounded border border-slate-200 focus:bg-indigo-50"
                        />
                      </td>
                      <td className="py-1 px-1 border-r border-slate-100">
                        <input
                          type="number"
                          min={0}
                          value={row.vdTf}
                          onChange={e => handleCellChange(idx, 'vdTf', parseInt(e.target.value) || 0)}
                          className="w-8 text-center p-0.5 rounded border border-slate-200 focus:bg-indigo-50"
                        />
                      </td>
                      <td className="py-1 px-1 border-r border-slate-200 text-slate-300">-</td>

                      {/* Short Answer */}
                      <td className="py-1 px-1 border-r border-slate-100 text-slate-300">-</td>
                      <td className="py-1 px-1 border-r border-slate-100 text-slate-300">-</td>
                      <td className="py-1 px-1 border-r border-slate-100">
                        <input
                          type="number"
                          min={0}
                          value={row.vdSa}
                          onChange={e => handleCellChange(idx, 'vdSa', parseInt(e.target.value) || 0)}
                          className="w-8 text-center p-0.5 rounded border border-slate-200 focus:bg-violet-50"
                        />
                      </td>
                      <td className="py-1 px-1 border-r border-slate-200">
                        <input
                          type="number"
                          min={0}
                          value={row.vdcSa}
                          onChange={e => handleCellChange(idx, 'vdcSa', parseInt(e.target.value) || 0)}
                          className="w-8 text-center p-0.5 rounded border border-slate-200 focus:bg-violet-50"
                        />
                      </td>

                      {/* Essay */}
                      <td className="py-1 px-1 border-r border-slate-100 text-slate-300">-</td>
                      <td className="py-1 px-1 border-r border-slate-100">
                        <input
                          type="number"
                          min={0}
                          value={row.thEs}
                          onChange={e => handleCellChange(idx, 'thEs', parseInt(e.target.value) || 0)}
                          className="w-8 text-center p-0.5 rounded border border-slate-200 focus:bg-teal-50"
                        />
                      </td>
                      <td className="py-1 px-1 border-r border-slate-100">
                        <input
                          type="number"
                          min={0}
                          value={row.vdEs}
                          onChange={e => handleCellChange(idx, 'vdEs', parseInt(e.target.value) || 0)}
                          className="w-8 text-center p-0.5 rounded border border-slate-200 focus:bg-teal-50"
                        />
                      </td>
                      <td className="py-1 px-1 border-r border-slate-200">
                        <input
                          type="number"
                          min={0}
                          value={row.vdcEs}
                          onChange={e => handleCellChange(idx, 'vdcEs', parseInt(e.target.value) || 0)}
                          className="w-8 text-center p-0.5 rounded border border-slate-200 focus:bg-teal-50"
                        />
                      </td>

                      {/* Row Totals */}
                      <td className="py-2 px-2 border-r border-slate-100 font-bold text-slate-800">
                        {row.totalQuestions}
                      </td>
                      <td className="py-2 px-2 border-r border-slate-100 font-bold text-emerald-700">
                        {row.totalScore.toFixed(2)}
                      </td>
                      <td className="py-2 px-2 font-bold text-slate-600">{row.percentage.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>

                {/* Sticky Summary Footer */}
                <tfoot className="bg-slate-900 text-white font-bold sticky bottom-0 z-20 shadow-inner">
                  <tr>
                    <td className="py-3 px-3 border-r border-slate-700 sticky left-0 z-30 bg-slate-950 text-left font-black">
                      TỔNG CỘNG
                    </td>
                    <td className="py-3 px-2 border-r border-slate-700">
                      {matrix.rows.reduce((s, r) => s + r.periods, 0)}
                    </td>
                    <td colSpan={4} className="py-3 px-2 border-r border-slate-700 bg-blue-950/80">
                      {matrix.summaryByQuestionType.MCQ.count} câu ({matrix.summaryByQuestionType.MCQ.score.toFixed(2)}đ)
                    </td>
                    <td colSpan={4} className="py-3 px-2 border-r border-slate-700 bg-indigo-950/80">
                      {matrix.summaryByQuestionType.TRUE_FALSE.count} câu ({matrix.summaryByQuestionType.TRUE_FALSE.score.toFixed(2)}đ)
                    </td>
                    <td colSpan={4} className="py-3 px-2 border-r border-slate-700 bg-violet-950/80">
                      {matrix.summaryByQuestionType.SHORT_ANSWER.count} câu ({matrix.summaryByQuestionType.SHORT_ANSWER.score.toFixed(2)}đ)
                    </td>
                    <td colSpan={4} className="py-3 px-2 border-r border-slate-700 bg-teal-950/80">
                      {matrix.summaryByQuestionType.ESSAY.count} câu ({matrix.summaryByQuestionType.ESSAY.score.toFixed(2)}đ)
                    </td>
                    <td className="py-3 px-2 border-r border-slate-700 font-black text-amber-300">
                      {matrix.totalQuestions}
                    </td>
                    <td className="py-3 px-2 border-r border-slate-700 font-black text-emerald-400">
                      {matrix.totalScore.toFixed(2)}
                    </td>
                    <td className="py-3 px-2 font-black text-amber-300">{matrix.totalPercentage}%</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* EXPLAIN WHY MODAL (Minh bạch căn cứ khảo thí) */}
      {explainModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Info className="h-5 w-5 text-blue-600" />
                <h3 className="font-bold text-sm text-slate-800">Cơ chế "Explain Why" — Minh bạch khảo thí</h3>
              </div>
              <button
                onClick={() => setExplainModal(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Bài học / Chủ đề:</p>
                <p className="font-bold text-slate-800 text-sm">{explainModal.lessonName}</p>
                <p className="text-slate-500">Khối: KHTN {explainModal.grade} • Thời lượng: {explainModal.periods} tiết</p>
              </div>

              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100">
                <p className="font-bold text-blue-900 text-[11px] mb-1">Căn cứ Yêu cầu cần đạt (GDPT 2018):</p>
                <p className="text-blue-800 font-medium leading-relaxed">{explainModal.learningRequirementText}</p>
              </div>

              <div>
                <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Cơ sở gán Mức độ nhận thức:</p>
                <p className="text-slate-700 leading-relaxed">{explainModal.reason}</p>
              </div>

              <div>
                <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Tài liệu nguồn kiểm chứng:</p>
                <p className="text-slate-700 font-semibold">{explainModal.sourceDocument}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setExplainModal(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-200 transition"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
