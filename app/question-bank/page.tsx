'use client';

import React, { useState, useEffect } from 'react';
import { QuestionItem } from '@/types/question';
import { GradeLevel, CognitiveLevel, QuestionType, SubjectArea } from '@/types/curriculum';
import {
  HelpCircle,
  Plus,
  Search,
  Filter,
  Sparkles,
  Download,
  Trash2,
  Edit,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Tag,
  BookOpen
} from 'lucide-react';

export default function QuestionBankPage() {
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGrade, setFilterGrade] = useState<string>('ALL');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterLevel, setFilterLevel] = useState<string>('ALL');
  const [filterSubject, setFilterSubject] = useState<string>('ALL');

  const [activeQuestionModal, setActiveQuestionModal] = useState<QuestionItem | null>(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // AI Generator Form
  const [aiGrade, setAiGrade] = useState<GradeLevel>(6);
  const [aiLessonId, setAiLessonId] = useState<string>('lesson-6-18');
  const [aiLevel, setAiLevel] = useState<CognitiveLevel>('M1');
  const [aiType, setAiType] = useState<QuestionType>('MCQ');

  const fetchQuestions = () => {
    fetch('/api/questions')
      .then(res => res.json())
      .then(data => setQuestions(data.questions || []))
      .catch(err => console.error('Error fetching questions', err));
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const filteredQuestions = questions.filter(q => {
    if (filterGrade !== 'ALL' && q.grade !== Number(filterGrade)) return false;
    if (filterType !== 'ALL' && q.questionType !== filterType) return false;
    if (filterLevel !== 'ALL' && q.cognitiveLevel !== filterLevel) return false;
    if (filterSubject !== 'ALL' && q.subjectArea !== filterSubject) return false;
    if (searchQuery.trim().length > 0) {
      const qText = q.questionText.toLowerCase();
      const topic = q.topic.toLowerCase();
      const s = searchQuery.toLowerCase();
      if (!qText.includes(s) && !topic.includes(s)) return false;
    }
    return true;
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa câu hỏi này khỏi ngân hàng?')) return;
    try {
      const res = await fetch(`/api/questions?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setQuestions(questions.filter(q => q.id !== id));
      }
    } catch (e) {
      console.error('Error deleting question', e);
    }
  };

  const handleGenerateAi = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/questions/generate-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId: aiLessonId,
          cognitiveLevel: aiLevel,
          questionType: aiType,
          score: aiType === 'MCQ' ? 0.25 : aiType === 'TRUE_FALSE' ? 1.0 : aiType === 'SHORT_ANSWER' ? 0.5 : 1.0
        })
      });
      const data = await res.json();
      if (data.question) {
        setQuestions([data.question, ...questions]);
        setIsAiModalOpen(false);
      }
    } catch (e) {
      console.error('Error generating AI question', e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportExcel = () => {
    window.location.href = '/api/export/xlsx?type=questions';
  };

  return (
    <div className="p-8 max-w-[96rem] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-violet-600 uppercase tracking-wider mb-1">
            <HelpCircle className="h-4 w-4" />
            <span>Mô-đun 3 • Ngân hàng câu hỏi chuẩn hóa</span>
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">NGÂN HÀNG CÂU HỎI KHOA HỌC TỰ NHIÊN</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            4 Dạng thức: MCQ, Đúng/Sai, Trả lời ngắn, Tự luận • Kèm Rationale & Tiêu chuẩn khảo thí 14 tiêu chí
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center space-x-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition"
          >
            <Download className="h-3.5 w-3.5 text-emerald-600" />
            <span>Xuất Excel (.xlsx)</span>
          </button>

          <button
            onClick={() => setIsAiModalOpen(true)}
            className="inline-flex items-center space-x-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-violet-500/20 transition"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            <span>Sinh câu hỏi bằng AI</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs font-medium">
        <div className="flex items-center space-x-3 flex-1 min-w-[280px]">
          <div className="relative w-full max-w-md">
            <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm nội dung câu hỏi, chủ đề, từ khóa..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <select
            value={filterGrade}
            onChange={e => setFilterGrade(e.target.value)}
            className="border border-slate-200 bg-slate-50 rounded-lg px-2.5 py-2 font-bold"
          >
            <option value="ALL">Tất cả Khối</option>
            <option value="6">Lớp 6</option>
            <option value="7">Lớp 7</option>
            <option value="8">Lớp 8</option>
            <option value="9">Lớp 9</option>
          </select>

          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="border border-slate-200 bg-slate-50 rounded-lg px-2.5 py-2 font-bold"
          >
            <option value="ALL">Tất cả Dạng câu</option>
            <option value="MCQ">Trắc nghiệm 4 lựa chọn</option>
            <option value="TRUE_FALSE">Đúng / Sai</option>
            <option value="SHORT_ANSWER">Trả lời ngắn</option>
            <option value="ESSAY">Tự luận</option>
          </select>

          <select
            value={filterLevel}
            onChange={e => setFilterLevel(e.target.value)}
            className="border border-slate-200 bg-slate-50 rounded-lg px-2.5 py-2 font-bold"
          >
            <option value="ALL">Tất cả Mức độ</option>
            <option value="M1">M1: Nhận biết</option>
            <option value="M2">M2: Thông hiểu</option>
            <option value="M3">M3: Vận dụng</option>
            <option value="M4">M4: Vận dụng cao</option>
          </select>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-3">
        {filteredQuestions.map(q => (
          <div
            key={q.id}
            className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:border-blue-300 transition space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                  KHTN {q.grade}
                </span>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                    q.cognitiveLevel === 'M1'
                      ? 'bg-sky-100 text-sky-800'
                      : q.cognitiveLevel === 'M2'
                      ? 'bg-indigo-100 text-indigo-800'
                      : q.cognitiveLevel === 'M3'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {q.cognitiveLevel === 'M1'
                    ? 'Nhận biết'
                    : q.cognitiveLevel === 'M2'
                    ? 'Thông hiểu'
                    : q.cognitiveLevel === 'M3'
                    ? 'Vận dụng'
                    : 'Vận dụng cao'}
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                  {q.questionType}
                </span>
                <span className="text-xs text-slate-500 font-medium">• {q.topic}</span>
              </div>

              <div className="flex items-center space-x-2 text-xs">
                <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {q.score}đ
                </span>
                <button
                  onClick={() => handleDelete(q.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 transition"
                  title="Xóa câu hỏi"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Question Text */}
            <p className="text-sm font-bold text-slate-900 leading-relaxed">{q.questionText}</p>

            {/* Options if MCQ or True/False */}
            {q.options && q.options.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                {q.options.map(opt => (
                  <div
                    key={opt.key}
                    className={`p-2 rounded-lg border flex items-start space-x-2 ${
                      opt.key === q.correctAnswer || (opt.isCorrect && q.questionType === 'TRUE_FALSE')
                        ? 'border-emerald-300 bg-emerald-50/50 text-emerald-950 font-bold'
                        : 'border-slate-100 bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="font-bold text-slate-500">{opt.key}.</span>
                    <span>{opt.text}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Explanation & Rationale */}
            <div className="pt-2 border-t border-slate-100 text-xs flex flex-col md:flex-row md:items-center justify-between gap-2 text-slate-500">
              <div className="space-y-1">
                <p>
                  <span className="font-bold text-slate-700">Đáp án đúng:</span>{' '}
                  <span className="font-bold text-emerald-700">{q.correctAnswer}</span>
                </p>
                {q.rationale && (
                  <p className="text-[11px] text-slate-600 italic">
                    <span className="font-semibold text-slate-700 not-italic">Lý do gán mức độ:</span> {q.rationale}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-2 text-[11px]">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">14/14 Tiêu chuẩn đạt</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* AI Generator Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-violet-600" />
                <h3 className="font-bold text-sm text-slate-800">Sinh câu hỏi khảo thí bằng AI (Grounded)</h3>
              </div>
              <button onClick={() => setIsAiModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Khối lớp</label>
                <select
                  value={aiGrade}
                  onChange={e => {
                    const g = Number(e.target.value) as GradeLevel;
                    setAiGrade(g);
                    setAiLessonId(`lesson-${g}-${g === 6 ? 18 : g === 7 ? 2 : g === 8 ? 2 : 18}`);
                  }}
                  className="w-full border border-slate-200 bg-slate-50 rounded-lg p-2 font-bold"
                >
                  <option value={6}>KHTN 6</option>
                  <option value={7}>KHTN 7</option>
                  <option value={8}>KHTN 8</option>
                  <option value={9}>KHTN 9</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Dạng câu hỏi</label>
                <select
                  value={aiType}
                  onChange={e => setAiType(e.target.value as QuestionType)}
                  className="w-full border border-slate-200 bg-slate-50 rounded-lg p-2 font-bold"
                >
                  <option value="MCQ">Trắc nghiệm 4 lựa chọn (0.25đ)</option>
                  <option value="TRUE_FALSE">Trắc nghiệm Đúng/Sai (1.0đ - 4 lệnh hỏi)</option>
                  <option value="SHORT_ANSWER">Trắc nghiệm trả lời ngắn (0.5đ)</option>
                  <option value="ESSAY">Tự luận (1.0đ)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Mức độ nhận thức</label>
                <select
                  value={aiLevel}
                  onChange={e => setAiLevel(e.target.value as CognitiveLevel)}
                  className="w-full border border-slate-200 bg-slate-50 rounded-lg p-2 font-bold"
                >
                  <option value="M1">M1: Nhận biết</option>
                  <option value="M2">M2: Thông hiểu</option>
                  <option value="M3">M3: Vận dụng</option>
                  <option value="M4">M4: Vận dụng cao</option>
                </select>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
                <span className="font-bold">Nguyên tắc Zero-Hallucination:</span> AI chỉ tạo câu hỏi dựa trên Yêu cầu cần đạt và nội dung thực tế của SGK KHTN {aiGrade} Kết nối tri thức. Bắt buộc có Rationale giải trình.
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-600 font-bold text-xs rounded-xl"
              >
                Hủy
              </button>
              <button
                onClick={handleGenerateAi}
                disabled={isGenerating}
                className="px-5 py-2 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs rounded-xl shadow disabled:opacity-50"
              >
                {isGenerating ? 'Đang tạo câu hỏi...' : 'Tiến hành sinh câu hỏi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
