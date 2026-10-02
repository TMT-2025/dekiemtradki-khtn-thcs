'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { TestExam } from '@/types/test';
import { AssessmentMatrix } from '@/types/matrix';
import { TestSpecification } from '@/types/specification';
import { QuestionItem } from '@/types/question';
import {
  FileText,
  Sparkles,
  Download,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  Printer,
  ShieldCheck,
  ChevronDown,
  ArrowRight,
  Layers,
  Table as TableIcon,
  ExternalLink,
  Globe,
  FlaskConical,
  Info
} from 'lucide-react';

export default function TestsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500 font-bold">Đang tải đề kiểm tra...</div>}>
      <TestsContent />
    </Suspense>
  );
}

function TestsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const matrixId = searchParams.get('matrixId');
  const specId = searchParams.get('specId');

  const [tests, setTests] = useState<TestExam[]>([]);
  const [activeTest, setActiveTest] = useState<TestExam | null>(null);
  const [activeTab, setActiveTab] = useState<'EXAM' | 'ANSWER_KEY' | 'SCORING_GUIDE'>('EXAM');

  const [matrices, setMatrices] = useState<AssessmentMatrix[]>([]);
  const [selectedMatrixId, setSelectedMatrixId] = useState<string>(matrixId || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationMode, setGenerationMode] = useState<'AUTO' | 'MANUAL'>('AUTO');
  const [sourceModalQuestion, setSourceModalQuestion] = useState<QuestionItem | null>(null);

  useEffect(() => {
    // Fetch existing tests
    fetch('/api/tests')
      .then(res => res.json())
      .then(data => {
        setTests(data.tests || []);
        if (data.tests && data.tests.length > 0) {
          setActiveTest(data.tests[0]);
        }
      });

    // Fetch matrices for test generation dropdown
    fetch('/api/matrix/setup')
      .then(res => res.json())
      .then(data => {
        // fetch existing matrices
        fetch('/api/matrix/list')
          .then(r => r.json())
          .then(mData => {
            setMatrices(mData.matrices || []);
            if (mData.matrices && mData.matrices.length > 0 && !selectedMatrixId) {
              setSelectedMatrixId(mData.matrices[0].id);
            }
          });
      });
  }, [matrixId]);

  const handleGenerateTest = async () => {
    if (!selectedMatrixId) {
      alert('Vui lòng chọn một Ma trận đã duyệt để tạo đề.');
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch('/api/tests/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matrixId: selectedMatrixId,
          mode: generationMode,
          testCode: '101'
        })
      });
      const data = await res.json();
      if (data.test) {
        setTests([data.test, ...tests]);
        setActiveTest(data.test);
      }
    } catch (e) {
      console.error('Error generating test', e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadDocx = (type: 'test' | 'answer' | 'guide') => {
    if (!activeTest) return;
    window.location.href = `/api/export/docx?type=${type}&testId=${activeTest.id}`;
  };

  return (
    <div className="p-8 max-w-[96rem] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-sky-600 uppercase tracking-wider mb-1">
            <FileText className="h-4 w-4" />
            <span>Mô-đun 4 • Lắp ráp đề kiểm tra & Hướng dẫn chấm</span>
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">ĐỀ KIỂM TRA ĐỊNH KÌ KHOA HỌC TỰ NHIÊN</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cấu trúc 4 phần chuẩn • Tự động sinh Đáp án & Biểu điểm chi tiết (Rubric) • Quality Gate 100%
          </p>
        </div>

        {/* Generate Trigger */}
        <div className="flex items-center space-x-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
          <select
            value={selectedMatrixId}
            onChange={e => setSelectedMatrixId(e.target.value)}
            className="text-xs font-bold border border-slate-200 bg-slate-50 rounded-xl px-3 py-2 text-slate-700 max-w-xs"
          >
            {matrices.length === 0 && <option value="">Chưa có ma trận nào</option>}
            {matrices.map(m => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
          </select>

          <button
            onClick={handleGenerateTest}
            disabled={!selectedMatrixId || isGenerating}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-blue-500/20 transition disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4 text-amber-300" />
            <span>{isGenerating ? 'ĐANG TẠO ĐỀ...' : 'TỰ ĐỘNG TẠO ĐỀ THI'}</span>
          </button>
        </div>
      </div>

      {activeTest ? (
        <div className="space-y-4">
          {/* CONTEXT-BASED SCIENCE ASSESSMENT REPORT (Section LXXV) */}
          {activeTest.contextReport && (
            <div className="bg-gradient-to-r from-cyan-950 via-slate-900 to-indigo-950 text-white p-5 rounded-2xl border border-cyan-800/50 shadow-md">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cyan-800/60 pb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="h-8 w-8 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
                    <FlaskConical className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm tracking-wide text-cyan-100 flex items-center space-x-2">
                      <span>BÁO CÁO BỐI CẢNH THỰC TIỄN & ĐÁNH GIÁ KHOA HỌC (CONTEXT REPORT)</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        activeTest.contextReport.qualityStatus === 'PASS'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}>
                        {activeTest.contextReport.qualityStatus}
                      </span>
                    </h3>
                    <p className="text-[11px] text-cyan-200/70">
                      Nguyên tắc: Bối cảnh có ý nghĩa khảo thí (Context Must Matter) • Phù hợp lứa tuổi THCS ({activeTest.grade === 6 ? '11-12' : activeTest.grade === 7 ? '12-13' : activeTest.grade === 8 ? '13-14' : '14-15'} tuổi)
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-xs">
                  <div className="bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700 text-center">
                    <span className="text-slate-400 block text-[10px]">Tỉ lệ có bối cảnh</span>
                    <span className="font-black text-cyan-300 text-sm">
                      {activeTest.contextReport.contextPercentage}% ({activeTest.contextReport.contextQuestions}/{activeTest.contextReport.totalQuestions} câu)
                    </span>
                  </div>
                  <div className="bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700 text-center">
                    <span className="text-slate-400 block text-[10px]">Mục tiêu cấu hình</span>
                    <span className="font-bold text-slate-300 text-sm">{activeTest.contextReport.targetContextPercentage}%</span>
                  </div>
                </div>
              </div>

              {/* Breakdown by Area & Cognitive Level */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 text-xs">
                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                  <span className="font-semibold text-cyan-300 block mb-1.5 text-[11px]">Phân bổ theo Lĩnh vực Thực tiễn:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(activeTest.contextReport.breakdownByArea).map(([area, cnt]) => (
                      <span key={area} className="px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/60 text-cyan-200 text-[11px]">
                        {area}: <strong>{cnt} câu</strong>
                      </span>
                    ))}
                    {Object.keys(activeTest.contextReport.breakdownByArea).length === 0 && (
                      <span className="text-slate-400 italic text-[11px]">Chưa có phân loại bối cảnh</span>
                    )}
                  </div>
                </div>

                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                  <span className="font-semibold text-cyan-300 block mb-1.5 text-[11px]">Mức độ nhận thức & Độ phức hợp bối cảnh:</span>
                  <div className="flex items-center space-x-3 text-[11px] text-slate-300">
                    <span>NB: <strong>{activeTest.contextReport.breakdownByLevel.NB || 0}</strong></span>
                    <span>TH: <strong>{activeTest.contextReport.breakdownByLevel.TH || 0}</strong></span>
                    <span>VD: <strong>{activeTest.contextReport.breakdownByLevel.VD || 0}</strong></span>
                    <span>VDC: <strong>{activeTest.contextReport.breakdownByLevel.VDC || 0}</strong></span>
                    <span className="text-slate-500">|</span>
                    <span className="text-amber-300">C1: <strong>{activeTest.contextReport.breakdownByComplexity.C1 || 0}</strong></span>
                    <span className="text-amber-300">C2: <strong>{activeTest.contextReport.breakdownByComplexity.C2 || 0}</strong></span>
                    <span className="text-amber-300">C3: <strong>{activeTest.contextReport.breakdownByComplexity.C3 || 0}</strong></span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sub-Tabs: Đề thi, Đáp án, Hướng dẫn chấm */}
          <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setActiveTab('EXAM')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  activeTab === 'EXAM'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                03. ĐỀ KIỂM TRA
              </button>
              <button
                onClick={() => setActiveTab('ANSWER_KEY')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  activeTab === 'ANSWER_KEY'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                04. ĐÁP ÁN (ANSWER KEY)
              </button>
              <button
                onClick={() => setActiveTab('SCORING_GUIDE')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  activeTab === 'SCORING_GUIDE'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                05. HƯỚNG DẪN CHẤM & BIỂU ĐIỂM
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleDownloadDocx(activeTab === 'EXAM' ? 'test' : activeTab === 'ANSWER_KEY' ? 'answer' : 'guide')}
                className="inline-flex items-center space-x-1.5 border border-slate-200 bg-slate-50 hover:bg-white text-slate-700 font-bold text-xs px-4 py-2 rounded-xl shadow-sm transition"
              >
                <Download className="h-3.5 w-3.5 text-blue-600" />
                <span>Tải Word (.docx)</span>
              </button>
            </div>
          </div>

          {/* VIEW 1: ĐỀ KIỂM TRA */}
          {activeTab === 'EXAM' && (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 max-w-4xl mx-auto">
              {/* Exam Header */}
              <div className="border-b border-slate-200 pb-5 text-center space-y-1">
                <p className="font-bold text-xs uppercase text-slate-500 tracking-wider">
                  {activeTest.schoolName} — {activeTest.departmentName}
                </p>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">{activeTest.title}</h2>
                <p className="text-xs text-slate-600 font-medium">
                  Thời gian làm bài: {activeTest.durationMinutes} phút • Mã đề: <span className="font-bold text-blue-700">{activeTest.testCode}</span>
                </p>
              </div>

              {/* Exam Parts */}
              <div className="space-y-6 text-xs leading-relaxed">
                {activeTest.parts.map(part => (
                  <div key={part.partNumber} className="space-y-3">
                    <div className="border-b border-slate-100 pb-2">
                      <h3 className="font-black text-slate-900 text-sm">
                        {part.partName} ({part.totalScore.toFixed(1)} điểm)
                      </h3>
                      <p className="text-slate-500 italic mt-0.5">{part.instructions}</p>
                    </div>

                    <div className="space-y-4 pt-1">
                      {part.questions.map(tq => (
                        <div key={tq.globalOrderIndex} className="space-y-2 p-3 rounded-xl hover:bg-slate-50/80 transition border border-transparent hover:border-slate-200">
                          {/* Context Badge & Provenance Button */}
                          {tq.question.contextMetadata?.hasContext && (
                            <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] pb-1 border-b border-slate-100">
                              <span className="px-2 py-0.5 rounded-full font-bold bg-cyan-100 text-cyan-800 flex items-center space-x-1">
                                <FlaskConical className="h-3 w-3" />
                                <span>Bối cảnh: {tq.question.contextMetadata.phenomenon || tq.question.contextMetadata.applicationArea}</span>
                              </span>
                              <button
                                onClick={() => setSourceModalQuestion(tq.question)}
                                className="text-blue-600 hover:text-blue-800 font-semibold flex items-center space-x-1 hover:underline"
                              >
                                <Info className="h-3 w-3" />
                                <span>Xem nguồn & Bối cảnh</span>
                              </button>
                            </div>
                          )}

                          {/* Stimulus Box if present */}
                          {tq.question.contextMetadata?.stimulus && (
                            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs space-y-1.5">
                              <p className="font-bold text-slate-800 text-[11px] flex items-center space-x-1">
                                <TableIcon className="h-3.5 w-3.5 text-cyan-700" />
                                <span>{tq.question.contextMetadata.stimulus.title}</span>
                              </p>
                              {tq.question.contextMetadata.stimulus.dataHeaders && (
                                <div className="overflow-x-auto my-1">
                                  <table className="border-collapse border border-slate-300 text-[10px] w-full text-center">
                                    <thead className="bg-slate-200/80 font-bold">
                                      <tr>
                                        {tq.question.contextMetadata.stimulus.dataHeaders.map((h, idx) => (
                                          <th key={idx} className="border border-slate-300 p-1">{h}</th>
                                        ))}
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {tq.question.contextMetadata.stimulus.dataRows?.map((row, rIdx) => (
                                        <tr key={rIdx} className="hover:bg-slate-100">
                                          {row.map((c, cIdx) => (
                                            <td key={cIdx} className="border border-slate-300 p-1">{c}</td>
                                          ))}
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                          )}

                          <p className="text-slate-800 font-medium whitespace-pre-line">
                            <span className="font-black text-slate-900">Câu {tq.globalOrderIndex}. </span>
                            {tq.question.questionText}
                          </p>

                          {/* Options if MCQ or True/False */}
                          {tq.question.options && tq.question.options.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-4">
                              {tq.question.options.map(opt => (
                                <div key={opt.key} className="flex items-start space-x-1.5 text-slate-700">
                                  <span className="font-bold">{opt.key}.</span>
                                  <span>{opt.text}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="pt-6 border-t border-slate-200 text-center font-bold text-slate-400">
                  ----------------- HẾT -----------------
                </div>
              </div>
            </div>
          )}

          {/* VIEW 2: ĐÁP ÁN (ANSWER KEY) */}
          {activeTab === 'ANSWER_KEY' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                <h3 className="font-bold text-sm text-slate-800">
                  Đáp án chuẩn đề kiểm tra KHTN {activeTest.grade} — Mã đề {activeTest.testCode}
                </h3>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Tổng điểm: {activeTest.totalScore.toFixed(2)}đ
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 font-bold text-slate-700 border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-4 w-16 text-center">Câu</th>
                      <th className="py-2.5 px-4 w-20 text-center">Phần</th>
                      <th className="py-2.5 px-4 w-28 text-center">Dạng câu</th>
                      <th className="py-2.5 px-4 w-44 font-bold text-blue-700">Đáp án đúng</th>
                      <th className="py-2.5 px-4 w-20 text-center">Điểm</th>
                      <th className="py-2.5 px-4">Lời giải / Hướng dẫn chi tiết</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {activeTest.answerKeys.map(ak => (
                      <tr key={ak.questionNumber} className="hover:bg-slate-50">
                        <td className="py-2.5 px-4 text-center font-bold">Câu {ak.questionNumber}</td>
                        <td className="py-2.5 px-4 text-center text-slate-500">Phần {ak.partNumber}</td>
                        <td className="py-2.5 px-4 text-center font-semibold text-slate-600">{ak.questionType}</td>
                        <td className="py-2.5 px-4 font-black text-emerald-700">{ak.correctAnswer}</td>
                        <td className="py-2.5 px-4 text-center font-bold text-slate-700">{ak.score.toFixed(2)}</td>
                        <td className="py-2.5 px-4 text-slate-600 leading-relaxed">{ak.explanation || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW 3: HƯỚNG DẪN CHẤM & BIỂU ĐIỂM (SCORING GUIDE) */}
          {activeTab === 'SCORING_GUIDE' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-bold text-base text-slate-800">
                  HƯỚNG DẪN CHẤM VÀ BIỂU ĐIỂM CHI TIẾT (RUBRIC)
                </h3>
                <p className="text-xs text-slate-500">
                  Môn: Khoa học tự nhiên {activeTest.grade} • Trường THCS & THPT Phan Văn Trị
                </p>
              </div>

              {/* Instructions */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                  I. Nguyên tắc chung khi chấm bài:
                </h4>
                <ul className="list-disc pl-5 space-y-1 text-slate-600">
                  {activeTest.scoringGuide.instructions.map((inst, idx) => (
                    <li key={idx}>{inst}</li>
                  ))}
                </ul>
              </div>

              {/* Rubric Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 font-bold text-slate-700 border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-4 w-20 text-center">Câu</th>
                      <th className="py-2.5 px-4 w-28 text-center">Ý / Bước</th>
                      <th className="py-2.5 px-4">Yêu cầu nội dung & Tiêu chí cho điểm</th>
                      <th className="py-2.5 px-4 w-28 text-center">Điểm</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {activeTest.scoringGuide.rubrics.map((r, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-3 px-4 text-center font-bold">Câu {r.questionNumber}</td>
                        <td className="py-3 px-4 text-center text-slate-500">{r.subItem || 'Toàn câu'}</td>
                        <td className="py-3 px-4 text-slate-700 whitespace-pre-line leading-relaxed">
                          {r.criterion}
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-emerald-700">
                          {r.score.toFixed(2)}đ
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-12 text-center text-xs text-slate-500">
          Chưa có đề kiểm tra nào. Chọn một Ma trận ở trên và bấm "TỰ ĐỘNG TẠO ĐỀ THI".
        </div>
      )}

      {/* CONTEXT TRACEABILITY MODAL (Section LXXVI) */}
      {sourceModalQuestion && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full p-6 space-y-4">
            <div className="flex justify-between items-start border-b pb-3">
              <div>
                <span className="text-[11px] font-bold text-cyan-700 uppercase tracking-wide flex items-center space-x-1">
                  <Globe className="h-3.5 w-3.5" />
                  <span>Truy xuất nguồn gốc & Việt hóa (Context Traceability)</span>
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  {sourceModalQuestion.contextMetadata?.phenomenon || 'Bối cảnh thực tế'}
                </h3>
              </div>
              <button
                onClick={() => setSourceModalQuestion(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px]">Phương thức áp dụng:</span>
                  <strong className="text-indigo-700">{sourceModalQuestion.contextMetadata?.sourceType || 'ADAPTED_FROM'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Không gian bối cảnh:</span>
                  <strong className="text-purple-700">{sourceModalQuestion.contextMetadata?.contextType || 'LOCAL'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Lĩnh vực khoa học:</span>
                  <strong className="text-emerald-700">{sourceModalQuestion.contextMetadata?.applicationArea || 'GENERAL'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Độ phức hợp:</span>
                  <strong className="text-amber-700">Mức {sourceModalQuestion.contextMetadata?.contextLevel || 'C2'}</strong>
                </div>
              </div>

              <div className="bg-cyan-50/60 p-3 rounded-xl border border-cyan-100 space-y-1.5">
                <span className="font-bold text-cyan-900 block">Quy trình Việt hóa & Chuẩn GDPT 2018:</span>
                <p className="text-cyan-800 leading-relaxed">
                  {sourceModalQuestion.contextMetadata?.adaptationNote || 'Bối cảnh được bản địa hóa phù hợp với học sinh THCS Việt Nam, sử dụng đơn vị đo chuẩn SI.'}
                </p>
                <p className="text-slate-600 text-[11px] pt-1 border-t border-cyan-200/60">
                  <strong>YCCĐ:</strong> {sourceModalQuestion.learningRequirementText}
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-800 block">Cơ quan / Tài liệu nguồn:</span>
                <p className="text-slate-600">{sourceModalQuestion.contextMetadata?.sourceTitle || sourceModalQuestion.sourceCitation?.documentName || 'N/A'}</p>
                {sourceModalQuestion.contextMetadata?.sourceUrl && (
                  <p className="pt-1">
                    <a
                      href={sourceModalQuestion.contextMetadata.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline flex items-center space-x-1"
                    >
                      <span className="truncate max-w-sm">{sourceModalQuestion.contextMetadata.sourceUrl}</span>
                      <ExternalLink className="h-3 w-3 inline flex-shrink-0" />
                    </a>
                  </p>
                )}
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end">
              <button
                onClick={() => setSourceModalQuestion(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
