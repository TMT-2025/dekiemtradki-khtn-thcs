'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AssessmentMatrix } from '@/types/matrix';
import { TestExam } from '@/types/test';
import { ClientStorage } from '@/lib/storage/client-storage';
import {
  Download,
  FileText,
  FileSpreadsheet,
  CheckCircle2,
  Printer,
  Sparkles,
  ArrowDownToLine,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export default function ExportPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500 font-bold">Đang tải Trung tâm Xuất bản...</div>}>
      <ExportContent />
    </Suspense>
  );
}

function ExportContent() {
  const searchParams = useSearchParams();
  const initialMatrixId = searchParams.get('matrixId');

  const [matrices, setMatrices] = useState<AssessmentMatrix[]>([]);
  const [tests, setTests] = useState<TestExam[]>([]);
  const [selectedMatrixId, setSelectedMatrixId] = useState<string>(initialMatrixId || '');
  const [selectedTestId, setSelectedTestId] = useState<string>('');
  const [downloadingType, setDownloadingType] = useState<string | null>(null);

  useEffect(() => {
    // 1. Load from ClientStorage first
    const clientMatrices = ClientStorage.getSavedMatrices();
    const clientTests = ClientStorage.getSavedTests();

    setMatrices(clientMatrices);
    setTests(clientTests);

    if (initialMatrixId && clientMatrices.some(m => m.id === initialMatrixId)) {
      setSelectedMatrixId(initialMatrixId);
    } else if (clientMatrices.length > 0) {
      setSelectedMatrixId(clientMatrices[0].id);
    }

    if (clientTests.length > 0) {
      setSelectedTestId(clientTests[0].id);
    }

    // 2. Fetch server matrices & tests and merge
    fetch('/api/matrix/list')
      .then(res => res.json())
      .then(data => {
        if (data.matrices && Array.isArray(data.matrices)) {
          const merged = [...clientMatrices];
          data.matrices.forEach((sm: AssessmentMatrix) => {
            if (!merged.some(m => m.id === sm.id)) merged.push(sm);
          });
          setMatrices(merged);
          if (!selectedMatrixId && merged.length > 0) {
            setSelectedMatrixId(merged[0].id);
          }
        }
      })
      .catch(() => {});

    fetch('/api/tests')
      .then(res => res.json())
      .then(data => {
        if (data.tests && Array.isArray(data.tests)) {
          const merged = [...clientTests];
          data.tests.forEach((st: TestExam) => {
            if (!merged.some(t => t.id === st.id)) merged.push(st);
          });
          setTests(merged);
          if (!selectedTestId && merged.length > 0) {
            setSelectedTestId(merged[0].id);
          }
        }
      })
      .catch(() => {});
  }, [initialMatrixId]);

  const handleDownloadDocx = async (type: string, fallbackFileName: string) => {
    setDownloadingType(type);
    try {
      const currentMatrix = matrices.find(m => m.id === selectedMatrixId) || ClientStorage.getMatrixById(selectedMatrixId);
      const currentTest = tests.find(t => t.id === selectedTestId) || ClientStorage.getTestById(selectedTestId);

      const res = await fetch('/api/export/docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          matrixId: selectedMatrixId,
          testId: selectedTestId,
          matrix: currentMatrix,
          test: currentTest
        })
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = fallbackFileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (e: any) {
      console.error('Error downloading DOCX:', e);
      alert('Lỗi tải file DOCX: ' + (e.message || 'Không thể tạo file'));
    } finally {
      setDownloadingType(null);
    }
  };

  const handleDownloadXlsx = async (type: string, fallbackFileName: string) => {
    setDownloadingType(type);
    try {
      const currentMatrix = matrices.find(m => m.id === selectedMatrixId) || ClientStorage.getMatrixById(selectedMatrixId);

      const res = await fetch('/api/export/xlsx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          matrixId: selectedMatrixId,
          matrix: currentMatrix
        })
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = fallbackFileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (e: any) {
      console.error('Error downloading XLSX:', e);
      alert('Lỗi tải file XLSX: ' + (e.message || 'Không thể tạo file'));
    } finally {
      setDownloadingType(null);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-center space-x-2 text-xs font-semibold text-rose-600 uppercase tracking-wider mb-1">
          <Download className="h-4 w-4" />
          <span>Trung tâm Xuất văn bản khảo thí chuẩn mực</span>
        </div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">XUẤT HỒ SƠ KIỂM TRA ĐÁNH GIÁ (DOCX / XLSX)</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Bộ 5 file Word & 2 file Excel quy chuẩn Bộ GDĐT • Header Trường THCS & THPT Phan Văn Trị • Footer số trang
        </p>
      </div>

      {/* Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm text-xs font-medium">
        <div>
          <label className="block text-slate-700 font-bold mb-1.5 flex items-center justify-between">
            <span>Chọn Ma trận cần xuất file:</span>
            {matrices.length > 0 && (
              <span className="text-[11px] font-normal text-emerald-600">Đã nạp {matrices.length} ma trận</span>
            )}
          </label>
          <select
            value={selectedMatrixId}
            onChange={e => setSelectedMatrixId(e.target.value)}
            className="w-full border border-slate-200 bg-slate-50 rounded-xl p-2.5 font-bold"
          >
            {matrices.length === 0 && <option value="">Chưa có ma trận</option>}
            {matrices.map(m => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-slate-700 font-bold mb-1.5 flex items-center justify-between">
            <span>Chọn Đề thi cần xuất file:</span>
            {tests.length > 0 && (
              <span className="text-[11px] font-normal text-blue-600">Đã nạp {tests.length} đề thi</span>
            )}
          </label>
          <select
            value={selectedTestId}
            onChange={e => setSelectedTestId(e.target.value)}
            className="w-full border border-slate-200 bg-slate-50 rounded-xl p-2.5 font-bold"
          >
            {tests.length === 0 && <option value="">Chưa có đề thi</option>}
            {tests.map(t => (
              <option key={t.id} value={t.id}>
                {t.title} (Mã đề: {t.testCode})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Word Files Section */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
          <FileText className="h-4 w-4 text-blue-600" />
          <span>Danh mục 05 File Word (.DOCX) chuẩn thể thức sư phạm THCS</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* File 1: Ma trận */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4 hover:border-blue-300 transition">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                01_Ma_tran.docx
              </span>
              <h3 className="font-bold text-slate-900 text-sm">Ma trận Đề kiểm tra</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Bảng ma trận hoàn chỉnh với 4 phần, 4 mức độ nhận thức, tổng số tiết, điểm và tỷ lệ %.
              </p>
            </div>
            <button
              onClick={() => handleDownloadDocx('matrix', '01_Ma_tran.docx')}
              disabled={!selectedMatrixId || downloadingType === 'matrix'}
              className="inline-flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2 rounded-xl shadow transition disabled:opacity-50"
            >
              <ArrowDownToLine className="h-4 w-4" />
              <span>{downloadingType === 'matrix' ? 'Đang xuất file...' : 'Tải file DOCX'}</span>
            </button>
          </div>

          {/* File 2: Bản đặc tả */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4 hover:border-blue-300 transition">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-100 text-orange-800">
                02_Ban_dac_ta.docx
              </span>
              <h3 className="font-bold text-slate-900 text-sm">Bản đặc tả chi tiết</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Ánh xạ 1:1 từ Ma trận với YCCĐ, mức độ nhận thức, dạng thức câu hỏi và mô tả chi tiết.
              </p>
            </div>
            <button
              onClick={() => handleDownloadDocx('spec', '02_Ban_dac_ta.docx')}
              disabled={!selectedMatrixId || downloadingType === 'spec'}
              className="inline-flex items-center justify-center space-x-2 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs py-2 rounded-xl shadow transition disabled:opacity-50"
            >
              <ArrowDownToLine className="h-4 w-4" />
              <span>{downloadingType === 'spec' ? 'Đang xuất file...' : 'Tải file DOCX'}</span>
            </button>
          </div>

          {/* File 3: Đề kiểm tra */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4 hover:border-blue-300 transition">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800">
                03_De_kiem_tra.docx
              </span>
              <h3 className="font-bold text-slate-900 text-sm">Đề kiểm tra in giấy</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Đề thi 4 phần có tiêu đề trường, tổ chuyên môn, lời dặn giám thị và bảng phương án.
              </p>
            </div>
            <button
              onClick={() => handleDownloadDocx('test', '03_De_kiem_tra.docx')}
              disabled={!selectedTestId || downloadingType === 'test'}
              className="inline-flex items-center justify-center space-x-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs py-2 rounded-xl shadow transition disabled:opacity-50"
            >
              <ArrowDownToLine className="h-4 w-4" />
              <span>{downloadingType === 'test' ? 'Đang xuất file...' : 'Tải file DOCX'}</span>
            </button>
          </div>

          {/* File 4: Đáp án */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4 hover:border-blue-300 transition">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                04_Dap_an.docx
              </span>
              <h3 className="font-bold text-slate-900 text-sm">Bảng Đáp án chính thức</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Đáp án chuẩn xác của từng câu, từng phần kèm lời giải chi tiết phục vụ tra cứu.
              </p>
            </div>
            <button
              onClick={() => handleDownloadDocx('answer', '04_Dap_an.docx')}
              disabled={!selectedTestId || downloadingType === 'answer'}
              className="inline-flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2 rounded-xl shadow transition disabled:opacity-50"
            >
              <ArrowDownToLine className="h-4 w-4" />
              <span>{downloadingType === 'answer' ? 'Đang xuất file...' : 'Tải file DOCX'}</span>
            </button>
          </div>

          {/* File 5: Hướng dẫn chấm */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4 hover:border-blue-300 transition">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                05_Huong_dan_cham.docx
              </span>
              <h3 className="font-bold text-slate-900 text-sm">Hướng dẫn chấm & Rubric</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Biểu điểm chi tiết cho từng ý (0.25đ/ý, tự luận có barem từng bước lập luận).
              </p>
            </div>
            <button
              onClick={() => handleDownloadDocx('guide', '05_Huong_dan_cham.docx')}
              disabled={!selectedTestId || downloadingType === 'guide'}
              className="inline-flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs py-2 rounded-xl shadow transition disabled:opacity-50"
            >
              <ArrowDownToLine className="h-4 w-4" />
              <span>{downloadingType === 'guide' ? 'Đang xuất file...' : 'Tải file DOCX'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Excel Section */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
          <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
          <span>Danh mục Bảng tính Excel (.XLSX)</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                Ma_tran.xlsx
              </span>
              <h3 className="font-bold text-slate-900 text-sm">Bảng tính Ma trận đề</h3>
              <p className="text-xs text-slate-500">Đầy đủ công thức tính điểm và tỷ lệ tự động.</p>
            </div>
            <button
              onClick={() => handleDownloadXlsx('matrix', 'Ma_tran.xlsx')}
              disabled={!selectedMatrixId || downloadingType === 'matrix-xlsx'}
              className="border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition disabled:opacity-50"
            >
              Tải Excel
            </button>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                Ngan_hang_cau_hoi.xlsx
              </span>
              <h3 className="font-bold text-slate-900 text-sm">Xuất Toàn bộ Ngân hàng câu hỏi</h3>
              <p className="text-xs text-slate-500">Dữ liệu câu hỏi, đáp án, mức độ nhận thức và rationale.</p>
            </div>
            <button
              onClick={() => handleDownloadXlsx('questions', 'Ngan_hang_cau_hoi.xlsx')}
              className="border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition"
            >
              Tải Excel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
