'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { GradeLevel, Semester, Lesson, SubjectArea } from '@/types/curriculum';
import {
  GraduationCap,
  CheckSquare,
  Square,
  BookOpen,
  ArrowRight,
  Filter,
  Clock,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';

export default function CurriculumPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500 font-bold">Đang tải chương trình KHTN...</div>}>
      <CurriculumContent />
    </Suspense>
  );
}

function CurriculumContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialGrade = (Number(searchParams.get('grade')) || 6) as GradeLevel;

  const [selectedGrade, setSelectedGrade] = useState<GradeLevel>(initialGrade);
  const [selectedSemester, setSelectedSemester] = useState<Semester | 'ALL'>('ALL');
  const [selectedSubject, setSelectedSubject] = useState<SubjectArea | 'ALL'>('ALL');
  const [selectedLessons, setSelectedLessons] = useState<string[]>([]);
  const [activeLessonModal, setActiveLessonModal] = useState<Lesson | null>(null);

  const [curriculumData, setCurriculumData] = useState<{
    grades: any[];
    chapters: any[];
    lessons: Lesson[];
  }>({ grades: [], chapters: [], lessons: [] });

  useEffect(() => {
    // Fetch curriculum data from API
    fetch('/api/curriculum')
      .then(res => res.json())
      .then(data => {
        setCurriculumData(data);
      })
      .catch(err => console.error('Error loading curriculum', err));
  }, []);

  const filteredLessons = curriculumData.lessons.filter(l => {
    if (l.grade !== selectedGrade) return false;
    if (selectedSemester !== 'ALL' && l.semester !== selectedSemester) return false;
    if (selectedSubject !== 'ALL' && l.subjectArea !== selectedSubject) return false;
    return true;
  });

  const toggleSelectLesson = (lessonId: string) => {
    if (selectedLessons.includes(lessonId)) {
      setSelectedLessons(selectedLessons.filter(id => id !== lessonId));
    } else {
      setSelectedLessons([...selectedLessons, lessonId]);
    }
  };

  const selectAllFiltered = () => {
    const ids = filteredLessons.map(l => l.id);
    const allSelected = ids.every(id => selectedLessons.includes(id));
    if (allSelected) {
      setSelectedLessons(selectedLessons.filter(id => !ids.includes(id)));
    } else {
      const merged = Array.from(new Set([...selectedLessons, ...ids]));
      setSelectedLessons(merged);
    }
  };

  const selectedLessonsObjects = curriculumData.lessons.filter(l => selectedLessons.includes(l.id));
  const totalSelectedPeriods = selectedLessonsObjects.reduce((s, l) => s + l.periods, 0);

  const handleProceedToMatrix = () => {
    if (selectedLessons.length === 0) return;
    const lessonQuery = encodeURIComponent(selectedLessons.join(','));
    router.push(`/matrix?grade=${selectedGrade}&lessons=${lessonQuery}`);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
            <GraduationCap className="h-4 w-4" />
            <span>Chương trình Giáo dục Phổ thông 2018</span>
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">QUẢN LÝ CHƯƠNG TRÌNH & KẾ HOẠCH DẠY HỌC</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Trường THCS & THPT Phan Văn Trị • Sách Kết nối tri thức với cuộc sống • 140 tiết/năm
          </p>
        </div>

        {/* Grade Selector Tabs */}
        <div className="flex items-center bg-slate-200/80 p-1 rounded-xl">
          {[6, 7, 8, 9].map(g => (
            <button
              key={g}
              onClick={() => {
                setSelectedGrade(g as GradeLevel);
                setSelectedLessons([]);
              }}
              className={`px-4 py-2 rounded-lg font-bold text-xs transition ${
                selectedGrade === g
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              LỚP {g}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs font-medium">
        <div className="flex items-center space-x-3">
          <span className="text-slate-500 font-semibold flex items-center space-x-1">
            <Filter className="h-3.5 w-3.5" />
            <span>Lọc:</span>
          </span>

          <select
            value={selectedSemester}
            onChange={e => setSelectedSemester(e.target.value as any)}
            className="border border-slate-200 bg-slate-50 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Tất cả Học kì</option>
            <option value="HK1">Học kì I</option>
            <option value="HK2">Học kì II</option>
          </select>

          <select
            value={selectedSubject}
            onChange={e => setSelectedSubject(e.target.value as any)}
            className="border border-slate-200 bg-slate-50 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Tất cả Phân môn</option>
            <option value="PHYSICS">Vật lí</option>
            <option value="CHEMISTRY">Hóa học</option>
            <option value="BIOLOGY">Sinh học</option>
            <option value="INTEGRATED">Tích hợp / Mở đầu</option>
          </select>
        </div>

        <button
          onClick={selectAllFiltered}
          className="text-blue-600 hover:text-blue-700 font-semibold flex items-center space-x-1.5"
        >
          <span>Chọn / Bỏ chọn toàn bộ</span>
        </button>
      </div>

      {/* Lessons List Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/80 text-slate-600 uppercase font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 w-12 text-center">Chọn</th>
                <th className="py-3 px-4 w-16">Bài</th>
                <th className="py-3 px-4">Tên bài học</th>
                <th className="py-3 px-4 w-32">Phân môn</th>
                <th className="py-3 px-4 w-28 text-center">Học kì</th>
                <th className="py-3 px-4 w-24 text-center">Số tiết</th>
                <th className="py-3 px-4 w-36 text-center">Yêu cầu cần đạt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredLessons.map(lesson => {
                const isSelected = selectedLessons.includes(lesson.id);
                return (
                  <tr
                    key={lesson.id}
                    className={`hover:bg-slate-50 transition cursor-pointer ${
                      isSelected ? 'bg-blue-50/40' : ''
                    }`}
                    onClick={() => toggleSelectLesson(lesson.id)}
                  >
                    <td className="py-3 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}} // handled by row click
                        className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-700">Bài {lesson.lessonNumber}</td>
                    <td className="py-3 px-4 font-bold text-slate-800">{lesson.title}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-[11px] font-semibold ${
                          lesson.subjectArea === 'PHYSICS'
                            ? 'bg-blue-100 text-blue-800'
                            : lesson.subjectArea === 'CHEMISTRY'
                            ? 'bg-amber-100 text-amber-800'
                            : lesson.subjectArea === 'BIOLOGY'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {lesson.subjectArea === 'PHYSICS'
                          ? 'Vật lí'
                          : lesson.subjectArea === 'CHEMISTRY'
                          ? 'Hóa học'
                          : lesson.subjectArea === 'BIOLOGY'
                          ? 'Sinh học'
                          : 'Tích hợp'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-slate-600">
                      {lesson.semester === 'HK1' ? 'Học kì 1' : 'Học kì 2'}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-700">{lesson.periods} tiết</td>
                    <td className="py-3 px-4 text-center" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => setActiveLessonModal(lesson)}
                        className="text-blue-600 hover:text-blue-800 font-semibold underline text-[11px] inline-flex items-center space-x-1"
                      >
                        <Info className="h-3 w-3" />
                        <span>Xem {lesson.learningRequirements.length} YCCĐ</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating Selection Action Bar */}
      {selectedLessons.length > 0 && (
        <div className="fixed bottom-6 left-80 right-8 z-30 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between border border-slate-700 animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center space-x-4">
            <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center font-black text-sm">
              {selectedLessons.length}
            </div>
            <div>
              <p className="font-bold text-sm">
                Đã chọn {selectedLessons.length} bài học đưa vào phạm vi kiểm tra
              </p>
              <p className="text-xs text-slate-400">
                Tổng cộng: <span className="text-blue-300 font-bold">{totalSelectedPeriods} tiết</span> thực dạy
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSelectedLessons([])}
              className="text-xs text-slate-400 hover:text-white font-medium px-3 py-2"
            >
              Hủy chọn
            </button>
            <button
              onClick={handleProceedToMatrix}
              className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-blue-500/30 transition"
            >
              <Sparkles className="h-4 w-4" />
              <span>TIẾN HÀNH TẠO MA TRẬN</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* YCCĐ Inspection Modal */}
      {activeLessonModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase">
                  KHTN {activeLessonModal.grade} • Bài {activeLessonModal.lessonNumber}
                </span>
                <h3 className="text-lg font-black text-slate-800">{activeLessonModal.title}</h3>
                <p className="text-xs text-slate-500">
                  Số tiết: {activeLessonModal.periods} tiết • Phân môn: {activeLessonModal.subjectArea}
                </p>
              </div>
              <button
                onClick={() => setActiveLessonModal(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Danh sách Yêu cầu cần đạt (YCCĐ chuẩn GDPT 2018):
              </h4>
              <div className="space-y-2.5">
                {activeLessonModal.learningRequirements.map((req, idx) => (
                  <div
                    key={req.id}
                    className="p-3 rounded-xl border border-slate-100 bg-slate-50 flex items-start space-x-3 text-xs"
                  >
                    <span className="h-5 w-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-slate-800 leading-relaxed font-medium">{req.description}</p>
                      <div className="mt-1 flex items-center space-x-2">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-200">
                          {req.cognitiveLevel === 'M1' ? 'M1 - Nhận biết' : req.cognitiveLevel === 'M2' ? 'M2 - Thông hiểu' : 'M3 - Vận dụng'}
                        </span>
                        <span className="text-[10px] text-slate-400">{req.code}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setActiveLessonModal(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-200 transition"
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
