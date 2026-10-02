'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { TestSpecification, SpecificationItem } from '@/types/specification';
import { AssessmentMatrix } from '@/types/matrix';
import {
  FileSpreadsheet,
  Save,
  FileText,
  Download,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Info
} from 'lucide-react';
import { ClientStorage } from '@/lib/storage/client-storage';

export default function SpecificationPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500 font-bold">Đang tải bản đặc tả...</div>}>
      <SpecificationContent />
    </Suspense>
  );
}

function SpecificationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const matrixId = searchParams.get('matrixId');

  const [specification, setSpecification] = useState<TestSpecification | null>(null);
  const [matrix, setMatrix] = useState<AssessmentMatrix | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const localMatrix = matrixId
      ? ClientStorage.getMatrixById(matrixId)
      : (ClientStorage.getSavedMatrices()[0] || null);

    const fetchPromise = localMatrix
      ? fetch('/api/specification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ matrix: localMatrix, matrixId })
        })
      : fetch(`/api/specification?matrixId=${matrixId || ''}`);

    fetchPromise
      .then(res => res.json())
      .then(data => {
        if (data.specification) {
          setSpecification(data.specification);
          setMatrix(data.matrix || localMatrix);
          ClientStorage.saveSpecification(data.specification);
        } else if (localMatrix) {
          setMatrix(localMatrix);
        }
      })
      .catch(err => console.error('Error fetching specification', err))
      .finally(() => setLoading(false));
  }, [matrixId]);

  const handleDescriptionChange = (index: number, newDesc: string) => {
    if (!specification) return;
    const updatedItems = [...specification.items];
    updatedItems[index] = {
      ...updatedItems[index],
      description: newDesc
    };
    const updated = { ...specification, items: updatedItems };
    setSpecification(updated);
    ClientStorage.saveSpecification(updated);
  };

  const handleSave = async () => {
    if (!specification) return;
    ClientStorage.saveSpecification(specification);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
    try {
      await fetch('/api/specification/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ specification })
      });
    } catch (e) {
      console.warn('Server save warning (using client fallback):', e);
    }
  };

  const handleProceedToTest = () => {
    if (!specification) return;
    router.push(`/tests?matrixId=${specification.matrixId}&specId=${specification.id}`);
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-slate-500 font-bold">
        Đang tải bản đặc tả đề kiểm tra...
      </div>
    );
  }

  if (!specification) {
    return (
      <div className="p-12 max-w-2xl mx-auto text-center space-y-4">
        <div className="h-16 w-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
          <FileSpreadsheet className="h-8 w-8" />
        </div>
        <h2 className="text-lg font-black text-slate-800">Chưa có Bản đặc tả nào</h2>
        <p className="text-xs text-slate-500">
          Bản đặc tả phải được tạo tự động trực tiếp từ một Ma trận đã phê duyệt để đảm bảo tính nhất quán 1:1.
        </p>
        <button
          onClick={() => router.push('/matrix')}
          className="inline-flex items-center space-x-2 bg-blue-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow hover:bg-blue-500 transition"
        >
          <span>Đến Studio Ma trận đề</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[96rem] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-orange-600 uppercase tracking-wider mb-1">
            <FileSpreadsheet className="h-4 w-4" />
            <span>Mô-đun 2 • Bản đặc tả chi tiết đề kiểm tra</span>
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">{specification.title}</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Ánh xạ 1:1 từ Ma trận • Thời gian: {specification.durationMinutes} phút • Tổng: 10.0 điểm
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleSave}
            className="inline-flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow transition"
          >
            <Save className="h-3.5 w-3.5" />
            <span>{saveSuccess ? 'Đã lưu!' : 'Lưu Bản đặc tả'}</span>
          </button>

          <button
            onClick={handleProceedToTest}
            className="inline-flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow transition"
          >
            <FileText className="h-4 w-4" />
            <span>Tạo Đề thi từ Đặc tả</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Specification Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-[70vh]">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-800 text-white font-bold sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="py-3 px-3 w-12 text-center border-r border-slate-700">STT</th>
                <th className="py-3 px-4 w-52 border-r border-slate-700">Chủ đề / Đơn vị kiến thức</th>
                <th className="py-3 px-4 border-r border-slate-700">Yêu cầu cần đạt (GDPT 2018)</th>
                <th className="py-3 px-3 w-20 text-center border-r border-slate-700">Mức độ</th>
                <th className="py-3 px-3 w-24 text-center border-r border-slate-700">Dạng câu</th>
                <th className="py-3 px-3 w-16 text-center border-r border-slate-700">Số câu</th>
                <th className="py-3 px-3 w-16 text-center border-r border-slate-700">Điểm</th>
                <th className="py-3 px-4 w-72 border-r border-slate-700">Mô tả yêu cầu câu hỏi (Edit)</th>
                <th className="py-3 px-3 w-24 text-center">Câu số</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {specification.items.map((item, idx) => (
                <tr key={item.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-3 text-center font-bold text-slate-500 border-r border-slate-100">
                    {item.stt}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-800 border-r border-slate-100">
                    {item.contentUnit}
                  </td>
                  <td className="py-3 px-4 text-slate-700 leading-relaxed border-r border-slate-100">
                    {item.learningRequirement}
                  </td>
                  <td className="py-3 px-3 text-center border-r border-slate-100 font-bold">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded text-[10px] ${
                        item.cognitiveLevel === 'M1'
                          ? 'bg-sky-100 text-sky-800'
                          : item.cognitiveLevel === 'M2'
                          ? 'bg-indigo-100 text-indigo-800'
                          : item.cognitiveLevel === 'M3'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {item.cognitiveLevel}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center border-r border-slate-100 font-bold text-slate-600">
                    {item.questionType}
                  </td>
                  <td className="py-3 px-3 text-center border-r border-slate-100 font-bold text-blue-700">
                    {item.questionCount}
                  </td>
                  <td className="py-3 px-3 text-center border-r border-slate-100 font-bold text-emerald-700">
                    {item.score.toFixed(2)}
                  </td>
                  <td className="py-2 px-3 border-r border-slate-100">
                    <textarea
                      rows={2}
                      value={item.description}
                      onChange={e => handleDescriptionChange(idx, e.target.value)}
                      className="w-full text-xs p-1.5 rounded-lg border border-slate-200 bg-slate-50/60 focus:bg-white focus:ring-1 focus:ring-blue-500"
                    />
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-slate-600">
                    {item.questionNumbers || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
