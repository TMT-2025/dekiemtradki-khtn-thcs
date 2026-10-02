'use client';

import React, { useState, useEffect } from 'react';
import { AssessmentTemplate } from '@/types/matrix';
import { KnowledgeDocument } from '@/types/knowledge';
import {
  Settings,
  ShieldCheck,
  FileText,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  FolderOpen
} from 'lucide-react';

export default function SettingsPage() {
  const [templates, setTemplates] = useState<AssessmentTemplate[]>([]);
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);

  useEffect(() => {
    fetch('/api/matrix/setup')
      .then(res => res.json())
      .then(data => setTemplates(data.templates || []));

    fetch('/api/settings/documents')
      .then(res => res.json())
      .then(data => setDocuments(data.documents || []));
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
          <Settings className="h-4 w-4" />
          <span>Cấu hình khảo thí & Nguồn pháp lý</span>
        </div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">CẤU HÌNH HỆ THỐNG</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Quy tắc phân cấp ưu tiên nguồn 5 bậc • Cấu trúc Template đề kiểm tra • Bật / Tắt mức độ nhận thức
        </p>
      </div>

      {/* 5-Tier Priority Hierarchy */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="h-5 w-5 text-emerald-600" />
          <h2 className="font-bold text-sm text-slate-900">
            Thứ bậc Ưu tiên Nguồn dữ liệu (5-Tier Legal Hierarchy)
          </h2>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          Khi có sự mâu thuẫn giữa các tài liệu, hệ thống tự động áp dụng thứ tự ưu tiên pháp lý sau đây và đưa ra cảnh báo cho giáo viên:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
          <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-xs space-y-1">
            <span className="font-bold text-red-700 block">LEVEL 1: PHÁP LÝ</span>
            <p className="font-semibold text-red-950">Văn bản Cấp Bộ</p>
            <p className="text-[11px] text-red-800">TT 32/2018, TT 22/2021, CV 7991</p>
          </div>

          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 text-xs space-y-1">
            <span className="font-bold text-amber-700 block">LEVEL 2: ĐỊA PHƯƠNG</span>
            <p className="font-semibold text-amber-950">Sở / Phòng GD&ĐT</p>
            <p className="text-[11px] text-amber-800">CV 984 hướng dẫn kiểm tra định kì</p>
          </div>

          <div className="p-4 rounded-xl border border-blue-200 bg-blue-50 text-xs space-y-1">
            <span className="font-bold text-blue-700 block">LEVEL 3: NHÀ TRƯỜNG</span>
            <p className="font-semibold text-blue-950">Kế hoạch dạy học</p>
            <p className="text-[11px] text-blue-800">KHDH KHTN 6, 7, 8, 9 Phan Văn Trị</p>
          </div>

          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-xs space-y-1">
            <span className="font-bold text-emerald-700 block">LEVEL 4: SGK</span>
            <p className="font-semibold text-emerald-950">Sách giáo khoa</p>
            <p className="text-[11px] text-emerald-800">KHTN 6–9 Kết nối tri thức</p>
          </div>

          <div className="p-4 rounded-xl border border-purple-200 bg-purple-50 text-xs space-y-1">
            <span className="font-bold text-purple-700 block">LEVEL 5: THAM KHẢO</span>
            <p className="font-semibold text-purple-950">Tài liệu tham khảo</p>
            <p className="text-[11px] text-purple-800">Mẫu ma trận minh họa</p>
          </div>
        </div>
      </div>

      {/* Document Catalog */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
          <FolderOpen className="h-5 w-5 text-blue-600" />
          <span>Danh mục Tài liệu trong Thư mục /knowledge</span>
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4 w-32">Mã tài liệu</th>
                <th className="py-2.5 px-4">Tên tài liệu / Văn bản</th>
                <th className="py-2.5 px-4 w-32">Cấp bậc nguồn</th>
                <th className="py-2.5 px-4 w-28">Năm học</th>
                <th className="py-2.5 px-4 w-24 text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {documents.map(doc => (
                <tr key={doc.documentId} className="hover:bg-slate-50">
                  <td className="py-2.5 px-4 font-bold text-slate-600">{doc.documentId}</td>
                  <td className="py-2.5 px-4 font-bold text-slate-800">{doc.title}</td>
                  <td className="py-2.5 px-4">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                        doc.sourceLevel === 'LEGAL'
                          ? 'bg-red-100 text-red-800'
                          : doc.sourceLevel === 'LOCAL'
                          ? 'bg-amber-100 text-amber-800'
                          : doc.sourceLevel === 'SCHOOL'
                          ? 'bg-blue-100 text-blue-800'
                          : doc.sourceLevel === 'TEXTBOOK'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {doc.sourceLevel}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-slate-600">{doc.schoolYear}</td>
                  <td className="py-2.5 px-4 text-center">
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {doc.status}
                    </span>
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
