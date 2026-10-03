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
import { ClientStorage } from '@/lib/storage/client-storage';
import { resolveExamPeriod } from '@/lib/exam-period';

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
  const [generationStep, setGenerationStep] = useState<string>('');
  const [generationMode, setGenerationMode] = useState<'AUTO' | 'MANUAL'>('AUTO');
  const [generationSource, setGenerationSource] = useState<'BANK' | 'AI' | 'HYBRID'>('HYBRID');
  const [regeneratingQuestionOrder, setRegeneratingQuestionOrder] = useState<number | null>(null);
  const [sourceModalQuestion, setSourceModalQuestion] = useState<QuestionItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Current active matrix
  const currentMatrix = matrices.find(m => m.id === selectedMatrixId) || (selectedMatrixId ? ClientStorage.getMatrixById(selectedMatrixId) : undefined);

  // All tests that belong to the current active matrix
  const matrixTests = tests.filter(t =>
    t.matrixId === selectedMatrixId ||
    (currentMatrix && t.grade === currentMatrix.grade && t.semester === currentMatrix.semester)
  );

  useEffect(() => {
    // 1. Load from ClientStorage
    const clientMatrices = ClientStorage.getSavedMatrices();
    const clientTests = ClientStorage.getSavedTests();

    setMatrices(clientMatrices);
    setTests(clientTests);

    if (matrixId && clientMatrices.some(m => m.id === matrixId)) {
      setSelectedMatrixId(matrixId);
    } else if (clientMatrices.length > 0 && !selectedMatrixId) {
      setSelectedMatrixId(clientMatrices[0].id);
    }

    // 2. Fetch server tests & matrices and merge
    fetch('/api/tests')
      .then(res => res.json())
      .then(data => {
        if (data.tests && Array.isArray(data.tests)) {
          const merged = [...clientTests];
          data.tests.forEach((st: TestExam) => {
            if (!merged.some(t => t.id === st.id)) merged.push(st);
          });
          setTests(merged);
        }
      })
      .catch(() => {});

    fetch('/api/matrix/list')
      .then(r => r.json())
      .then(mData => {
        if (mData.matrices && Array.isArray(mData.matrices)) {
          const merged = [...clientMatrices];
          mData.matrices.forEach((sm: AssessmentMatrix) => {
            if (!merged.some(m => m.id === sm.id)) merged.push(sm);
          });
          setMatrices(merged);
          if (merged.length > 0 && !selectedMatrixId) {
            setSelectedMatrixId(merged[0].id);
          }
        }
      })
      .catch(() => {});
  }, [matrixId]);

  // Synchronize activeTest with the selected matrix
  useEffect(() => {
    if (!selectedMatrixId) {
      setActiveTest(tests.length > 0 ? tests[0] : null);
      return;
    }

    if (matrixTests.length > 0) {
      // If current activeTest does not belong to this matrix, switch to the first matching test
      if (!activeTest || !matrixTests.some(t => t.id === activeTest.id)) {
        setActiveTest(matrixTests[0]);
      }
    } else {
      // No tests generated yet for this matrix
      setActiveTest(null);
    }
  }, [selectedMatrixId, tests.length]);

  const handleGenerateTest = async (overrideCode?: string, sourceMode: 'BANK' | 'AI' | 'HYBRID' = generationSource) => {
    if (!selectedMatrixId) {
      alert('Vui lòng chọn một Ma trận đã duyệt để tạo đề.');
      return;
    }

    const curMat = matrices.find(m => m.id === selectedMatrixId) || ClientStorage.getMatrixById(selectedMatrixId);
    const currentSpec = ClientStorage.getSpecificationByMatrixId(selectedMatrixId);

    // Compute next test code if not overridden
    let targetCode = overrideCode;
    if (!targetCode) {
      if (matrixTests.length === 0) {
        targetCode = '101';
      } else {
        const codes = matrixTests
          .map(t => parseInt(t.testCode || '100', 10))
          .filter(n => !isNaN(n));
        const maxCode = codes.length > 0 ? Math.max(...codes) : 100;
        targetCode = String(maxCode + 1);
      }
    }

    setIsGenerating(true);
    let stepMsg = 'Hệ thống đang trích xuất 50% câu hỏi từ Ngân hàng & AI đang tạo mới 50% câu hỏi bám sát ma trận (Tự động lưu vào Ngân hàng)...';
    if (sourceMode === 'AI') {
      stepMsg = 'Mô hình AI đang tạo mới 100% câu hỏi bám sát ma trận và chuẩn chương trình khối lớp (Tự động lưu vào Ngân hàng)...';
    } else if (sourceMode === 'BANK') {
      stepMsg = 'Đang trích xuất câu hỏi chuẩn YCCĐ từ ngân hàng & lắp ráp đề thi...';
    }
    setGenerationStep(stepMsg);

    try {
      const res = await fetch('/api/tests/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matrixId: selectedMatrixId,
          matrix: curMat,
          specification: currentSpec,
          mode: sourceMode === 'AI' ? 'AI' : generationMode,
          generationSource: sourceMode,
          aiRatio: sourceMode === 'HYBRID' ? 0.5 : (sourceMode === 'AI' ? 1.0 : 0.0),
          testCode: targetCode
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Lỗi máy chủ (${res.status})`);
      }

      const data = await res.json();
      if (data.test) {
        ClientStorage.saveTest(data.test);
        setTests(prev => [data.test, ...prev.filter(t => t.id !== data.test.id)]);
        setActiveTest(data.test);
        const sourceLabel = sourceMode === 'HYBRID'
          ? '⚡ Chuẩn 50% Ngân hàng + 50% AI — Đã tự động lưu câu hỏi mới vào Ngân hàng'
          : sourceMode === 'AI'
          ? '🤖 100% AI Sinh mới — Đã lưu vào Ngân hàng'
          : '📚 100% Ngân hàng';
        setToastMessage(`Đã tạo thành công Đề kiểm tra KHTN ${data.test.grade} — Mã đề: ${data.test.testCode} (${sourceLabel})!`);
        setTimeout(() => setToastMessage(null), 5000);
      } else {
        throw new Error('Dữ liệu trả về không hợp lệ');
      }
    } catch (e: any) {
      console.error('Error generating test', e);
      alert(`Không thể tạo đề: ${e.message}`);
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  const handleRegenerateQuestion = async (questionOrder: number) => {
    if (!activeTest) return;
    setRegeneratingQuestionOrder(questionOrder);
    try {
      const res = await fetch(`/api/tests/${activeTest.id}/regenerate-question`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionOrder })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi khi tạo lại câu hỏi');
      if (data.test) {
        ClientStorage.saveTest(data.test);
        setActiveTest(data.test);
        setTests(prev => prev.map(t => t.id === data.test.id ? data.test : t));
        setToastMessage(`Đã dùng AI đổi mới thành công Câu ${questionOrder}!`);
        setTimeout(() => setToastMessage(null), 3000);
      }
    } catch (e: any) {
      alert(`Không thể đổi câu hỏi: ${e.message}`);
    } finally {
      setRegeneratingQuestionOrder(null);
    }
  };

  const handleDownloadDocx = async (type: 'test' | 'answer' | 'guide') => {
    if (!activeTest) return;
    try {
      const res = await fetch('/api/export/docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          testId: activeTest.id,
          test: activeTest
        })
      });
      if (!res.ok) throw new Error(await res.text());
      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      const fileNames = {
        test: `03_De_kiem_tra_${activeTest.testCode || '101'}.docx`,
        answer: `04_Dap_an_${activeTest.testCode || '101'}.docx`,
        guide: `05_Huong_dan_cham_${activeTest.testCode || '101'}.docx`
      };
      a.download = fileNames[type];
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (e) {
      console.error('Error downloading test docx', e);
      // Fallback to GET
      window.location.href = `/api/export/docx?type=${type}&testId=${activeTest.id}`;
    }
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
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            {activeTest
              ? (activeTest.title.includes('ĐỀ KIỂM TRA ĐỊNH KÌ')
                  ? activeTest.title.replace('ĐỀ KIỂM TRA ĐỊNH KÌ', `ĐỀ KIỂM TRA ${resolveExamPeriod(activeTest)}`)
                  : activeTest.title)
              : currentMatrix
              ? `ĐỀ KIỂM TRA ${resolveExamPeriod(currentMatrix)} - KHTN ${currentMatrix.grade}`
              : 'ĐỀ KIỂM TRA KHOA HỌC TỰ NHIÊN'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cấu trúc 4 phần chuẩn • Tự động sinh Đáp án & Biểu điểm chi tiết (Rubric) • Quality Gate 100%
          </p>
        </div>

        {/* Generate Trigger */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Ma trận cơ sở:</span>
            <select
              value={selectedMatrixId}
              onChange={e => setSelectedMatrixId(e.target.value)}
              className="text-xs font-bold border border-slate-200 bg-slate-50 rounded-xl px-3 py-2 text-slate-700 max-w-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {matrices.length === 0 && <option value="">Chưa có ma trận nào</option>}
              {matrices.map(m => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleGenerateTest(undefined, 'HYBRID')}
                disabled={!selectedMatrixId || isGenerating}
                title="Tạo đề chuẩn tỉ lệ 50% Ngân hàng + 50% AI sinh mới. Tự động lưu tất cả câu hỏi AI mới vào Ngân hàng câu hỏi"
                className="inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-teal-500/25 transition disabled:opacity-50 ring-2 ring-emerald-400/50"
              >
                <Sparkles className="h-4 w-4 text-amber-300 animate-pulse" />
                <span>{isGenerating ? 'ĐANG TẠO ĐỀ...' : '⚡ TẠO ĐỀ CHUẨN (50% NGÂN HÀNG + 50% AI)'}</span>
              </button>

              <button
                onClick={() => handleGenerateTest(undefined, 'BANK')}
                disabled={!selectedMatrixId || isGenerating}
                title="Lắp ráp đề thi 100% từ Ngân hàng câu hỏi hiện có"
                className="inline-flex items-center justify-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 transition disabled:opacity-50"
              >
                <FileText className="h-4 w-4 text-slate-500" />
                <span>100% Ngân hàng</span>
              </button>

              <button
                onClick={() => handleGenerateTest(undefined, 'AI')}
                disabled={!selectedMatrixId || isGenerating}
                title="Mô hình AI tự động tạo mới 100% câu hỏi theo ma trận và tự động lưu vào Ngân hàng câu hỏi"
                className="inline-flex items-center justify-center space-x-1.5 bg-slate-100 hover:bg-violet-50 text-violet-700 font-bold text-xs px-3.5 py-2.5 rounded-xl border border-violet-300 transition disabled:opacity-50"
              >
                <Sparkles className="h-4 w-4 text-violet-600" />
                <span>100% AI sinh mới</span>
              </button>
            </div>
            <span className="text-[10px] text-slate-500 mt-1 flex items-center gap-1 font-medium">
              <CheckCircle2 className="h-3 w-3 text-emerald-500 inline shrink-0" />
              <span>Tỉ lệ 50/50 chuẩn • Tự động lưu câu hỏi mới vào Ngân hàng • Chuẩn GDPT 2018 THCS</span>
            </span>
          </div>
        </div>
      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold flex items-center space-x-2 shadow-sm">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Generating Progress State */}
      {isGenerating && (
        <div className="p-4 bg-blue-50 border border-blue-200 text-blue-900 rounded-2xl text-xs font-semibold flex items-center space-x-3 shadow-sm">
          <div className="h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin flex-shrink-0" />
          <div>
            <p className="font-bold text-blue-800">Đang tiến hành tạo đề kiểm tra...</p>
            <p className="text-[11px] text-blue-600">{generationStep || 'Hệ thống đang trích xuất câu hỏi chuẩn YCCĐ và phân bổ 4 phần chuẩn theo ma trận.'}</p>
          </div>
        </div>
      )}

      {/* Test Codes Bar for current Matrix */}
      {matrixTests.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">
              Mã đề của ma trận này:
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {matrixTests.map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTest(t)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition ${
                    activeTest?.id === t.id
                      ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-400'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Mã đề: {t.testCode || '101'}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => handleGenerateTest()}
            disabled={isGenerating}
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl border border-blue-200 transition disabled:opacity-50"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>+ Tạo thêm mã đề mới</span>
          </button>
        </div>
      )}

      {activeTest ? (
        <div className="space-y-4">
          {/* 50% Bank / 50% AI Question Composition Banner */}
          {(() => {
            const allQ = activeTest.parts.flatMap(p => p.questions);
            const aiCount = activeTest.stats?.aiQuestionCount ?? allQ.filter(q => q.source === 'AI' || q.question.author === 'AI_SYNTHESIZER' || q.question.tags?.includes('AI_GENERATED')).length;
            const bankCount = activeTest.stats?.bankQuestionCount ?? (allQ.length - aiCount);
            const totalCount = allQ.length || 22;
            const aiPercent = Math.round((aiCount / totalCount) * 100);
            const bankPercent = 100 - aiPercent;

            return (
              <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 rounded-2xl border border-indigo-500/30 shadow-md">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-teal-400 p-0.5 flex items-center justify-center shrink-0">
                      <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                        <Sparkles className="h-4 w-4 text-teal-300" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-black text-xs tracking-wider uppercase text-indigo-200">
                          Cơ chế tạo đề kết hợp: 50% Ngân hàng câu hỏi + 50% AI Sinh mới
                        </h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 className="h-2.5 w-2.5 text-emerald-400" />
                          Đã tự động lưu vào Ngân hàng
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-0.5">
                        Tất cả câu hỏi do AI tạo mới đều bám sát chuẩn kiến thức GDPT 2018 và đã được tự động lưu vào Ngân hàng câu hỏi của hệ thống.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2.5 text-xs">
                    <div className="bg-slate-800/90 px-3.5 py-1.5 rounded-xl border border-slate-700/80 flex items-center space-x-2">
                      <FileText className="h-3.5 w-3.5 text-sky-400" />
                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">Ngân hàng ({bankPercent}%)</span>
                        <span className="font-black text-sky-300 text-xs">{bankCount} câu hỏi</span>
                      </div>
                    </div>

                    <div className="bg-slate-800/90 px-3.5 py-1.5 rounded-xl border border-slate-700/80 flex items-center space-x-2">
                      <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">AI sinh mới ({aiPercent}%)</span>
                        <span className="font-black text-purple-300 text-xs">{aiCount} câu hỏi</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

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
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  {activeTest.title.includes('ĐỀ KIỂM TRA ĐỊNH KÌ')
                    ? activeTest.title.replace('ĐỀ KIỂM TRA ĐỊNH KÌ', `ĐỀ KIỂM TRA ${resolveExamPeriod(activeTest)}`)
                    : activeTest.title}
                </h2>
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
                          {/* Question Action Toolbar: Metadata & AI Regenerate */}
                          <div className="flex flex-wrap items-center justify-between gap-1.5 text-[11px] pb-1.5 border-b border-slate-100">
                            <div className="flex flex-wrap items-center gap-1.5">
                              {/* Question Source Badge: Bank vs AI */}
                              {tq.source === 'AI' || tq.question.author === 'AI_SYNTHESIZER' || tq.question.tags?.includes('AI_GENERATED') ? (
                                <span className="px-2 py-0.5 rounded-full font-bold bg-purple-100 text-purple-800 border border-purple-200 flex items-center space-x-1" title="Câu hỏi do AI tạo mới bám sát ma trận và chuẩn GDPT 2018 (Đã tự động lưu vào Ngân hàng)">
                                  <Sparkles className="h-3 w-3 text-purple-600" />
                                  <span>AI sinh mới (Đã lưu NH)</span>
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full font-bold bg-sky-100 text-sky-800 border border-sky-200 flex items-center space-x-1" title="Câu hỏi chọn lọc từ Ngân hàng câu hỏi chuẩn">
                                  <FileText className="h-3 w-3 text-sky-600" />
                                  <span>Ngân hàng câu hỏi</span>
                                </span>
                              )}

                              {tq.question.contextMetadata?.hasContext && (
                                <span className="px-2 py-0.5 rounded-full font-bold bg-cyan-100 text-cyan-800 flex items-center space-x-1">
                                  <FlaskConical className="h-3 w-3" />
                                  <span>Bối cảnh: {tq.question.contextMetadata.phenomenon || tq.question.contextMetadata.applicationArea}</span>
                                </span>
                              )}
                              <span className="px-2 py-0.5 rounded-md font-semibold bg-slate-100 text-slate-700">
                                {tq.question.topic || `Bài ${tq.question.lessonId}`} • {tq.question.cognitiveLevel} ({tq.assignedScore}đ)
                              </span>
                            </div>

                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleRegenerateQuestion(tq.globalOrderIndex)}
                                disabled={regeneratingQuestionOrder === tq.globalOrderIndex}
                                title="Mô hình AI tự động tạo lại câu hỏi mới cùng YCCĐ & chuẩn GDPT 2018"
                                className="inline-flex items-center space-x-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-violet-50 hover:bg-violet-100 text-violet-700 hover:text-violet-800 border border-violet-200 transition disabled:opacity-50"
                              >
                                <Sparkles className={`h-3 w-3 text-violet-600 ${regeneratingQuestionOrder === tq.globalOrderIndex ? 'animate-spin' : ''}`} />
                                <span>{regeneratingQuestionOrder === tq.globalOrderIndex ? 'AI đang tạo...' : 'Đổi câu hỏi (AI)'}</span>
                              </button>

                              {tq.question.contextMetadata?.hasContext && (
                                <button
                                  onClick={() => setSourceModalQuestion(tq.question)}
                                  className="text-blue-600 hover:text-blue-800 font-semibold flex items-center space-x-1 hover:underline"
                                >
                                  <Info className="h-3 w-3" />
                                  <span>Xem nguồn</span>
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Rich Context & Stimulus Box */}
                          {tq.question.contextMetadata?.stimulus && (
                            <div className="bg-gradient-to-r from-sky-50/80 to-slate-50 p-3 rounded-xl border border-sky-200/80 text-xs space-y-2">
                              <p className="font-bold text-sky-900 text-xs flex items-center space-x-1.5 border-b border-sky-200/60 pb-1.5">
                                <TableIcon className="h-3.5 w-3.5 text-sky-700 flex-shrink-0" />
                                <span>[Tình huống thực tiễn & Bối cảnh khoa học: {tq.question.contextMetadata.stimulus.title}]</span>
                              </p>
                              {tq.question.contextMetadata.stimulus.leadParagraph && (
                                <p className="text-slate-700 italic leading-relaxed text-[11px] bg-white/70 p-2 rounded-lg border border-sky-100">
                                  {tq.question.contextMetadata.stimulus.leadParagraph}
                                </p>
                              )}
                              {tq.question.contextMetadata.stimulus.type === 'TABLE' && (tq.question.questionType === 'TRUE_FALSE' || tq.question.questionType === 'ESSAY') && tq.question.contextMetadata.stimulus.dataHeaders && tq.question.contextMetadata.stimulus.dataRows && (
                                <div className="overflow-x-auto my-1.5">
                                  <table className="border-collapse border border-slate-300 text-[10px] w-full text-center bg-white shadow-sm rounded-lg overflow-hidden">
                                    <thead className="bg-sky-100/80 font-bold text-sky-950">
                                      <tr>
                                        {tq.question.contextMetadata.stimulus.dataHeaders.map((h, idx) => (
                                          <th key={idx} className="border border-slate-300 p-1.5">{h}</th>
                                        ))}
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                      {tq.question.contextMetadata.stimulus.dataRows.map((row, rIdx) => (
                                        <tr key={rIdx} className="hover:bg-slate-50">
                                          {row.map((c, cIdx) => (
                                            <td key={cIdx} className="border border-slate-300 p-1.5">{c}</td>
                                          ))}
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                              {tq.question.contextMetadata.stimulus.experimentSetup?.procedureSteps && (
                                <p className="text-[11px] text-slate-600 italic">
                                  <strong>Các bước thực nghiệm: </strong>
                                  {tq.question.contextMetadata.stimulus.experimentSetup.procedureSteps.join(' → ')}
                                </p>
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
        <div className="p-12 max-w-2xl mx-auto text-center space-y-5 bg-white rounded-3xl border border-slate-200 shadow-sm">
          <div className="h-16 w-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
            <FileText className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-800">
              {currentMatrix ? `Chưa có đề kiểm tra cho: ${currentMatrix.title}` : 'Chưa có đề kiểm tra'}
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-lg mx-auto leading-relaxed">
              {currentMatrix
                ? `Ma trận đã được cấu hình chuẩn GDPT 2018 với ${currentMatrix.durationMinutes} phút làm bài (${currentMatrix.rows.reduce((s, r) => s + (r.periods || 0), 0)} tiết). Nhấn nút dưới đây để hệ thống tự động trích xuất các câu hỏi chuẩn YCCĐ, phân bổ 4 phần (MCQ, Đúng/Sai, Trả lời ngắn, Tự luận) và tự động sinh Đáp án & Biểu điểm chi tiết.`
                : 'Vui lòng chọn một Ma trận từ danh sách trên để xem hoặc tạo đề thi.'}
            </p>
          </div>
          {currentMatrix && (
            <div className="space-y-3">
              <button
                onClick={() => handleGenerateTest(undefined, 'HYBRID')}
                disabled={isGenerating}
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-xs px-6 py-3.5 rounded-2xl shadow-lg shadow-teal-500/25 transition disabled:opacity-50 ring-2 ring-emerald-400/50"
              >
                <Sparkles className="h-4 w-4 text-amber-300 animate-pulse" />
                <span>{isGenerating ? 'ĐANG TẠO ĐỀ...' : '⚡ TẠO ĐỀ CHUẨN (50% NGÂN HÀNG + 50% AI)'}</span>
              </button>
              <p className="text-[11px] text-slate-500 max-w-md mx-auto font-medium">
                Đề thi sẽ được lắp ráp với tỉ lệ 50% câu hỏi từ Ngân hàng và 50% câu hỏi AI sinh mới bám sát ma trận. Tất cả câu hỏi mới sẽ tự động được lưu vào Ngân hàng câu hỏi.
              </p>
            </div>
          )}
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
