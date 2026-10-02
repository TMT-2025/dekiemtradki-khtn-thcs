import React from 'react';
import Link from 'next/link';
import { localDb } from '@/database/local-db';
import { CurriculumService } from '@/features/curriculum/curriculum-service';
import {
  Grid3X3,
  FileText,
  HelpCircle,
  GraduationCap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export default function DashboardPage() {
  const grades = CurriculumService.getGrades();
  const matrices = localDb.getMatrices();
  const tests = localDb.getTests();
  const questions = localDb.getQuestions();

  // Statistics by grade
  const gradeCounts = {
    6: CurriculumService.getLessons(6).length,
    7: CurriculumService.getLessons(7).length,
    8: CurriculumService.getLessons(8).length,
    9: CurriculumService.getLessons(9).length
  };

  // Questions breakdown by subject area
  const physicsQ = questions.filter(q => q.subjectArea === 'PHYSICS').length;
  const chemistryQ = questions.filter(q => q.subjectArea === 'CHEMISTRY').length;
  const biologyQ = questions.filter(q => q.subjectArea === 'BIOLOGY').length;
  const totalQ = questions.length || 1;

  // Questions breakdown by cognitive level
  const m1Q = questions.filter(q => q.cognitiveLevel === 'M1').length;
  const m2Q = questions.filter(q => q.cognitiveLevel === 'M2').length;
  const m3Q = questions.filter(q => q.cognitiveLevel === 'M3').length;
  const m4Q = questions.filter(q => q.cognitiveLevel === 'M4').length;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 p-6 rounded-2xl text-white shadow-xl shadow-blue-900/10">
        <div>
          <div className="inline-flex items-center space-x-2 bg-blue-500/30 px-3 py-1 rounded-full text-xs font-semibold text-blue-100 mb-2 border border-blue-400/30">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Chuẩn hóa GDPT 2018 • Công văn 7991 & 984</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight">KHTN ASSESSMENT STUDIO</h1>
          <p className="text-blue-100 text-sm mt-1 max-w-2xl">
            Hệ thống chuyên sâu hỗ trợ giáo viên THCS thiết kế Ma trận, Bản đặc tả, Ngân hàng câu hỏi và Đề kiểm tra định kì chuẩn mực, bảo đảm tính nhất quán tuyệt đối.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            href="/matrix"
            className="inline-flex items-center space-x-2 bg-white text-blue-900 px-4 py-2.5 rounded-xl font-bold text-sm shadow hover:bg-blue-50 transition"
          >
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span>Tạo Ma trận mới</span>
          </Link>
          <Link
            href="/tests"
            className="inline-flex items-center space-x-2 bg-blue-600/80 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-bold text-sm border border-blue-400/30 transition"
          >
            <span>Tạo Đề thi</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Grid3X3 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ma trận đề</p>
            <p className="text-2xl font-black text-slate-800">{matrices.length}</p>
            <p className="text-[11px] text-emerald-600 font-medium">Bảo đảm tổng 10.0đ</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="h-12 w-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Đề kiểm tra</p>
            <p className="text-2xl font-black text-slate-800">{tests.length}</p>
            <p className="text-[11px] text-blue-600 font-medium">Kèm đáp án & rubric</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="h-12 w-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
            <HelpCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ngân hàng câu hỏi</p>
            <p className="text-2xl font-black text-slate-800">{questions.length}</p>
            <p className="text-[11px] text-violet-600 font-medium">4 dạng thức chuẩn</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tổng số bài học</p>
            <p className="text-2xl font-black text-slate-800">195</p>
            <p className="text-[11px] text-emerald-600 font-medium">KHTN 6, 7, 8, 9</p>
          </div>
        </div>
      </div>

      {/* Curriculum Coverage by Grade */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center space-x-2">
          <GraduationCap className="h-5 w-5 text-blue-600" />
          <span>Dữ liệu Chương trình & Kế hoạch dạy học 4 Khối lớp</span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[6, 7, 8, 9].map(grade => (
            <Link
              key={grade}
              href={`/curriculum?grade=${grade}`}
              className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-blue-50/50 hover:border-blue-200 transition group"
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-slate-800 text-sm group-hover:text-blue-600">KHTN {grade}</span>
                <span className="text-xs font-semibold text-slate-500">140 tiết</span>
              </div>
              <p className="text-xs text-slate-500">{gradeCounts[grade as 6|7|8|9]} bài học chính khóa</p>
              <div className="mt-3 flex items-center text-xs font-semibold text-blue-600 group-hover:translate-x-1 transition">
                <span>Xem kế hoạch</span>
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Charts Section: Subject Area & Cognitive Level Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Subject Area Balance */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <h2 className="text-sm font-bold text-slate-800 mb-1">Phân bố câu hỏi theo 3 Mạch kiến thức liên môn</h2>
          <p className="text-xs text-slate-500 mb-5">Đảm bảo tính cân đối giữa Vật lí, Hóa học và Sinh học</p>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-blue-700">Vật lí (Năng lượng & Trái Đất)</span>
                <span>{physicsQ} câu ({Math.round((physicsQ / totalQ) * 100)}%)</span>
              </div>
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all"
                  style={{ width: `${Math.max(5, (physicsQ / totalQ) * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-amber-700">Hóa học (Chất và sự biến đổi của chất)</span>
                <span>{chemistryQ} câu ({Math.round((chemistryQ / totalQ) * 100)}%)</span>
              </div>
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all"
                  style={{ width: `${Math.max(5, (chemistryQ / totalQ) * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-emerald-700">Sinh học (Vật sống)</span>
                <span>{biologyQ} câu ({Math.round((biologyQ / totalQ) * 100)}%)</span>
              </div>
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all"
                  style={{ width: `${Math.max(5, (biologyQ / totalQ) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Cognitive Level Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <h2 className="text-sm font-bold text-slate-800 mb-1">Phân bố theo 4 Mức độ nhận thức</h2>
          <p className="text-xs text-slate-500 mb-5">Định hướng đánh giá năng lực theo chuẩn GDPT 2018</p>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700">M1: Nhận biết (~40%)</span>
                <span>{m1Q} câu ({Math.round((m1Q / totalQ) * 100)}%)</span>
              </div>
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-sky-400 rounded-full transition-all"
                  style={{ width: `${Math.max(5, (m1Q / totalQ) * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700">M2: Thông hiểu (~30%)</span>
                <span>{m2Q} câu ({Math.round((m2Q / totalQ) * 100)}%)</span>
              </div>
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all"
                  style={{ width: `${Math.max(5, (m2Q / totalQ) * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700">M3: Vận dụng (~20%)</span>
                <span>{m3Q} câu ({Math.round((m3Q / totalQ) * 100)}%)</span>
              </div>
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all"
                  style={{ width: `${Math.max(5, (m3Q / totalQ) * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700">M4: Vận dụng cao (~10%)</span>
                <span>{m4Q} câu ({Math.round((m4Q / totalQ) * 100)}%)</span>
              </div>
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full transition-all"
                  style={{ width: `${Math.max(5, (m4Q / totalQ) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grounding & Verification Banner */}
      <div className="bg-emerald-50 border border-emerald-200/80 p-5 rounded-2xl flex items-start space-x-4">
        <div className="h-10 w-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <div>
          <h3 className="font-bold text-sm text-emerald-950">Grounding First — Nguyên tắc chống Hallucination tuyệt đối</h3>
          <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
            Hệ thống chỉ sinh nội dung khảo thí dựa trên văn bản pháp lý (Thông tư 32/2018, Thông tư 22/2021, Công văn 7991), hướng dẫn chuyên môn địa phương (Công văn 984) và Kế hoạch dạy học thực tế của nhà trường. Nếu thiếu dữ liệu nguồn, hệ thống cảnh báo minh bạch thay vì tự suy đoán.
          </p>
        </div>
      </div>
    </div>
  );
}
