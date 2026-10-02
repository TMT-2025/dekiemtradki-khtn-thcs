import './globals.css';
import Link from 'next/link';
import React from 'react';
import {
  LayoutDashboard,
  GraduationCap,
  CalendarCheck,
  Grid3X3,
  FileSpreadsheet,
  HelpCircle,
  FileText,
  Download,
  Settings,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

export const metadata = {
  title: 'KHTN Assessment Studio — Khảo thí GDPT 2018 THCS',
  description: 'Hệ thống chuyên sâu tạo ma trận, bản đặc tả, ngân hàng câu hỏi và đề kiểm tra KHTN 6-9'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="flex h-screen overflow-hidden bg-slate-50 text-slate-900">
        {/* Sidebar */}
        <aside className="w-72 bg-slate-900 text-slate-200 flex flex-col flex-shrink-0 border-r border-slate-800">
          {/* Logo & Header */}
          <div className="p-4 border-b border-slate-800 flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-wide text-white uppercase">KHTN STUDIO</h1>
              <p className="text-xs text-blue-400 font-medium">Khảo thí GDPT 2018</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 text-sm font-medium">
            <Link
              href="/"
              className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              <LayoutDashboard className="h-4 w-4 text-blue-400" />
              <span>DASHBOARD</span>
            </Link>

            {/* Curriculum */}
            <div className="pt-2 pb-1">
              <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Chương trình & KHDH</p>
            </div>
            <Link
              href="/curriculum"
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              <GraduationCap className="h-4 w-4 text-emerald-400" />
              <span>Chương trình KHTN 6–9</span>
            </Link>
            <Link
              href="/curriculum?tab=khdh"
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              <CalendarCheck className="h-4 w-4 text-teal-400" />
              <span>Kế hoạch dạy học</span>
            </Link>

            {/* Matrix & Specification */}
            <div className="pt-3 pb-1">
              <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Ma trận & Đặc tả</p>
            </div>
            <Link
              href="/matrix"
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              <Grid3X3 className="h-4 w-4 text-amber-400" />
              <span>Ma trận đề kiểm tra</span>
            </Link>
            <Link
              href="/specification"
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              <FileSpreadsheet className="h-4 w-4 text-orange-400" />
              <span>Bản đặc tả đề</span>
            </Link>

            {/* Question Bank & Tests */}
            <div className="pt-3 pb-1">
              <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Khảo thí & Đề thi</p>
            </div>
            <Link
              href="/question-bank"
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              <HelpCircle className="h-4 w-4 text-violet-400" />
              <span>Ngân hàng câu hỏi</span>
            </Link>
            <Link
              href="/context-library"
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              <Sparkles className="h-4 w-4 text-cyan-400" />
              <span>Thư viện Bối cảnh</span>
            </Link>
            <Link
              href="/tests"
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              <FileText className="h-4 w-4 text-sky-400" />
              <span>Tạo & Quản lý Đề thi</span>
            </Link>

            {/* Export & Settings */}
            <div className="pt-3 pb-1">
              <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Hệ thống</p>
            </div>
            <Link
              href="/export"
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              <Download className="h-4 w-4 text-rose-400" />
              <span>Xuất DOCX / XLSX</span>
            </Link>
            <Link
              href="/settings"
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              <Settings className="h-4 w-4 text-slate-400" />
              <span>Cấu hình & Nguồn pháp lý</span>
            </Link>
          </nav>

          {/* User & Quality Badge Footer */}
          <div className="p-3 border-t border-slate-800 bg-slate-950/60">
            <div className="flex items-center space-x-2 text-xs text-slate-300">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span className="font-semibold text-emerald-400">Quality Gate: ACTIVE</span>
            </div>
            <p className="text-[11px] text-slate-300 mt-1">Grounding First • CV 7991 & CV 984</p>
            <div className="mt-2 text-[11px] text-slate-400 border-t border-slate-800/80 pt-1.5 flex justify-between">
              <span>THCS Phan Văn Trị</span>
              <span>2026–2027</span>
            </div>
          </div>
        </aside>

        {/* Main Workspace Area */}
        <main className="flex-1 flex flex-col overflow-y-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
