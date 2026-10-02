'use client';

import React, { useState, useEffect } from 'react';
import { AssessmentMatrix } from '@/types/matrix';
import { TestExam } from '@/types/test';
import {
  Download,
  FileText,
  FileSpreadsheet,
  CheckCircle2,
  Printer,
  Sparkles,
  ArrowDownToLine,
  ShieldCheck
} from 'lucide-react';

export default function ExportPage() {
  const [matrices, setMatrices] = useState<AssessmentMatrix[]>([]);
  const [tests, setTests] = useState<TestExam[]>([]);
  const [selectedMatrixId, setSelectedMatrixId] = useState<string>('');
  const [selectedTestId, setSelectedTestId] = useState<string>('');

  useEffect(() => {
    fetch('/api/matrix/list')
      .then(res => res.json())
      .then(data => {
        setMatrices(data.matrices || []);
        if (data.matrices && data.matrices.length > 0) {
          setSelectedMatrixId(data.matrices[0].id);
        }
      });

    fetch('/api/tests')
      .then(res => res.json())
      .then(data => {
        setTests(data.tests || []);
        if (data.tests && data.tests.length > 0) {
          setSelectedTestId(data.tests[0].id);
        }
      });
  }, []);

  const downloadFile = (url: string) => {
    window.location.href = url;
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
          <label className="block text-slate-700 font-bold mb-1.5">Chọn Ma trận cần xuất file:</label>
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
          <label className="block text-slate-700 font-bold mb-1.5">Chọn Đề thi cần xuất file:</label>
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
              onClick={() => downloadFile(`/api/export/docx?type=matrix&id=${selectedMatrixId}`)}
              disabled={!selectedMatrixId}
              className="inline-flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2 rounded-xl shadow transition disabled:opacity-50"
            >
              <ArrowDownToLine className="h-4 w-4" />
              <span>Tải file DOCX</span>
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
              onClick={() => downloadFile(`/api/export/docx?type=spec&id=${selectedMatrixId}`)}
              disabled={!selectedMatrixId}
              className="inline-flex items-center justify-center space-x-2 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs py-2 rounded-xl shadow transition disabled:opacity-50"
            >
              <ArrowDownToLine className="h-4 w-4" />
              <span>Tải file DOCX</span>
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
              onClick={() => downloadFile(`/api/export/docx?type=test&testId=${selectedTestId}`)}
              disabled={!selectedTestId}
              className="inline-flex items-center justify-center space-x-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs py-2 rounded-xl shadow transition disabled:opacity-50"
            >
              <ArrowDownToLine className="h-4 w-4" />
              <span>Tải file DOCX</span>
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
              onClick={() => downloadFile(`/api/export/docx?type=answer&testId=${selectedTestId}`)}
              disabled={!selectedTestId}
              className="inline-flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2 rounded-xl shadow transition disabled:opacity-50"
            >
              <ArrowDownToLine className="h-4 w-4" />
              <span>Tải file DOCX</span>
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
              onClick={() => downloadFile(`/api/export/docx?type=guide&testId=${selectedTestId}`)}
              disabled={!selectedTestId}
              className="inline-flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs py-2 rounded-xl shadow transition disabled:opacity-50"
            >
              <ArrowDownToLine className="h-4 w-4" />
              <span>Tải file DOCX</span>
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
              onClick={() => downloadFile(`/api/export/xlsx?type=matrix&id=${selectedMatrixId}`)}
              disabled={!selectedMatrixId}
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
              onClick={() => downloadFile('/api/export/xlsx?type=questions')}
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
