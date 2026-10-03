'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Sparkles,
  Globe,
  Search,
  Filter,
  ExternalLink,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  FlaskConical,
  Activity,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
  Table as TableIcon,
  BarChart3,
  FileQuestion,
  Info
} from 'lucide-react';
import { PhenomenonItem, InternationalContextItem, ContextLevel, ContextType, ApplicationArea } from '@/types/context';
import { CognitiveLevel, QuestionType } from '@/types/curriculum';

function ContextLibraryContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'phenomena' | 'international'>('phenomena');
  const [phenomena, setPhenomena] = useState<PhenomenonItem[]>([]);
  const [intlContexts, setIntlContexts] = useState<InternationalContextItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedGrade, setSelectedGrade] = useState<string>('ALL');
  const [selectedArea, setSelectedArea] = useState<string>('ALL');
  const [selectedComplexity, setSelectedComplexity] = useState<string>('ALL');
  const [selectedContextType, setSelectedContextType] = useState<string>('ALL');
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  // Modals
  const [selectedPhenomenon, setSelectedPhenomenon] = useState<PhenomenonItem | null>(null);
  const [selectedIntl, setSelectedIntl] = useState<InternationalContextItem | null>(null);
  
  // Workflow B Generator state
  const [generatingForPhenom, setGeneratingForPhenom] = useState<PhenomenonItem | null>(null);
  const [genCogLevel, setGenCogLevel] = useState<CognitiveLevel>('M2');
  const [genQType, setGenQType] = useState<QuestionType>('MCQ');
  const [isGenerating, setIsGenerating] = useState(false);
  const [genSuccessMsg, setGenSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [selectedGrade, selectedArea, selectedComplexity, selectedContextType]);

  const loadData = async () => {
    setLoading(true);
    try {
      const pParams = new URLSearchParams();
      if (selectedGrade !== 'ALL') pParams.set('grade', selectedGrade);
      if (selectedArea !== 'ALL') pParams.set('applicationArea', selectedArea);
      if (selectedComplexity !== 'ALL') pParams.set('contextLevel', selectedComplexity);
      if (selectedContextType !== 'ALL') pParams.set('contextType', selectedContextType);
      if (searchKeyword) pParams.set('keyword', searchKeyword);

      const pRes = await fetch(`/api/context/phenomena?${pParams.toString()}`);
      const pData = await pRes.json();
      if (pData.success) setPhenomena(pData.data);

      const iRes = await fetch(`/api/context/international?${pParams.toString()}`);
      const iData = await iRes.json();
      if (iData.success) setIntlContexts(iData.data);
    } catch (err) {
      console.error('Error fetching context library data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQuestion = async () => {
    if (!generatingForPhenom) return;
    setIsGenerating(true);
    setGenSuccessMsg(null);
    try {
      const res = await fetch('/api/context/generate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phenomenonId: generatingForPhenom.phenomenon_id,
          cognitiveLevel: genCogLevel,
          questionType: genQType,
          learningRequirementText: generatingForPhenom.curriculum_alignment
        })
      });
      const data = await res.json();
      if (data.success) {
        setGenSuccessMsg(`Đã tạo thành công câu hỏi bối cảnh "${generatingForPhenom.title}" và lưu vào Ngân hàng câu hỏi!`);
        setTimeout(() => {
          setGeneratingForPhenom(null);
          setGenSuccessMsg(null);
        }, 2000);
      } else {
        alert('Lỗi: ' + data.error);
      }
    } catch (err: any) {
      alert('Lỗi khi sinh câu hỏi: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-cyan-100 text-cyan-800">
              Chương trình GDPT 2018
            </span>
            <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">
              Context-Based Science Assessment
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1 flex items-center space-x-2">
            <span>THƯ VIỆN BỐI CẢNH & HIỆN TƯỢNG KHOA HỌC THỰC TIỄN</span>
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Nguyên tắc cốt lõi: <strong>Bối cảnh có ý nghĩa đánh giá (Context Must Matter)</strong>, gắn kết hiện tượng tự nhiên, đời sống, dữ liệu thực nghiệm và nguồn học liệu uy tín PISA, NASA, NOAA, WHO.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('phenomena')}
          className={`pb-3 px-4 font-semibold text-sm border-b-2 transition flex items-center space-x-2 ${
            activeTab === 'phenomena'
              ? 'border-cyan-600 text-cyan-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <FlaskConical className="h-4 w-4" />
          <span>Thư viện Hiện tượng Khoa học ({phenomena.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('international')}
          className={`pb-3 px-4 font-semibold text-sm border-b-2 transition flex items-center space-x-2 ${
            activeTab === 'international'
              ? 'border-cyan-600 text-cyan-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Globe className="h-4 w-4" />
          <span>Bối cảnh Quốc tế Đã Việt hóa ({intlContexts.length})</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        {/* Quick Grade Filter Badges */}
        <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-100">
          <span className="text-xs font-semibold text-slate-500 mr-1">Lọc nhanh khối lớp:</span>
          {[
            { id: 'ALL', label: 'Tất cả khối lớp' },
            { id: '6', label: 'KHTN Lớp 6' },
            { id: '7', label: 'KHTN Lớp 7' },
            { id: '8', label: 'KHTN Lớp 8' },
            { id: '9', label: 'KHTN Lớp 9' },
          ].map(g => {
            const isSelected = selectedGrade === g.id;
            return (
              <button
                key={g.id}
                onClick={() => setSelectedGrade(g.id)}
                className={`px-3 py-1.5 rounded-lg text-xs transition flex items-center space-x-1.5 ${
                  isSelected
                    ? 'bg-cyan-600 text-white shadow-sm font-semibold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{g.label}</span>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {/* Grade */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Khối lớp</label>
            <select
              value={selectedGrade}
              onChange={e => setSelectedGrade(e.target.value)}
              className="w-full text-xs rounded-lg border-slate-300 focus:ring-cyan-500 focus:border-cyan-500 bg-slate-50 p-2"
            >
              <option value="ALL">Tất cả khối lớp</option>
              <option value="6">KHTN Lớp 6 (11-12 tuổi)</option>
              <option value="7">KHTN Lớp 7 (12-13 tuổi)</option>
              <option value="8">KHTN Lớp 8 (13-14 tuổi)</option>
              <option value="9">KHTN Lớp 9 (14-15 tuổi)</option>
            </select>
          </div>

          {/* Complexity */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Mức độ bối cảnh</label>
            <select
              value={selectedComplexity}
              onChange={e => setSelectedComplexity(e.target.value)}
              className="w-full text-xs rounded-lg border-slate-300 focus:ring-cyan-500 focus:border-cyan-500 bg-slate-50 p-2"
            >
              <option value="ALL">Tất cả mức độ</option>
              <option value="C1">C1 — Bối cảnh đơn giản</option>
              <option value="C2">C2 — Bối cảnh có dữ liệu (Bảng/Biểu đồ)</option>
              <option value="C3">C3 — Bối cảnh nghiên cứu / Thí nghiệm</option>
              <option value="C4">C4 — Bối cảnh phức hợp / Đa nguồn</option>
            </select>
          </div>

          {/* Context Taxonomy Type */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Không gian bối cảnh</label>
            <select
              value={selectedContextType}
              onChange={e => setSelectedContextType(e.target.value)}
              className="w-full text-xs rounded-lg border-slate-300 focus:ring-cyan-500 focus:border-cyan-500 bg-slate-50 p-2"
            >
              <option value="ALL">Tất cả không gian</option>
              <option value="PERSONAL">Cá nhân (Sức khỏe, dinh dưỡng)</option>
              <option value="FAMILY_SCHOOL">Gia đình & Trường học</option>
              <option value="LOCAL">Địa phương (ĐBSCL, đô thị, sông hồ)</option>
              <option value="NATIONAL">Quốc gia (Năng lượng, nông nghiệp)</option>
              <option value="GLOBAL">Toàn cầu (Khí hậu, đại dương, PISA)</option>
            </select>
          </div>

          {/* Application Area */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Lĩnh vực ứng dụng</label>
            <select
              value={selectedArea}
              onChange={e => setSelectedArea(e.target.value)}
              className="w-full text-xs rounded-lg border-slate-300 focus:ring-cyan-500 focus:border-cyan-500 bg-slate-50 p-2"
            >
              <option value="ALL">Tất cả lĩnh vực</option>
              <option value="WATER">Nước & Nguồn nước</option>
              <option value="AIR">Không khí & Môi trường</option>
              <option value="HEALTH">Sức khỏe & Cơ thể người</option>
              <option value="FOOD">Thực phẩm & Dinh dưỡng</option>
              <option value="ENERGY">Năng lượng & Điện</option>
              <option value="AGRICULTURE">Nông nghiệp & Thổ nhưỡng</option>
              <option value="CLIMATE">Biến đổi khí hậu</option>
              <option value="SAFETY">An toàn đời sống</option>
              <option value="SCIENTIFIC_RESEARCH">Nghiên cứu khoa học</option>
            </select>
          </div>

          {/* Keyword Search */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Tìm kiếm từ khóa</label>
            <div className="relative">
              <input
                type="text"
                value={searchKeyword}
                onChange={e => setSearchKeyword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && loadData()}
                placeholder="Hiện tượng, tên bài, thí nghiệm..."
                className="w-full text-xs rounded-lg border-slate-300 focus:ring-cyan-500 focus:border-cyan-500 bg-slate-50 p-2 pr-7"
              />
              <button onClick={loadData} className="absolute right-2 top-2.5 text-slate-400 hover:text-cyan-600">
                <Search className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">Đang tải dữ liệu thư viện bối cảnh...</div>
      ) : activeTab === 'phenomena' ? (
        /* Phenomena Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {phenomena.map(phenom => (
            <div
              key={phenom.phenomenon_id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Badges */}
                <div className="flex flex-wrap gap-1.5 items-center">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800">
                    KHTN Lớp {phenom.grade}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-cyan-100 text-cyan-800">
                    Mức độ {phenom.context_level}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-100 text-purple-800">
                    {phenom.context_type}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                    {phenom.application_area}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                    {phenom.subject_area}
                  </span>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-snug">{phenom.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 font-medium">Chủ đề: {phenom.topic}</p>
                  <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                    {phenom.description}
                  </p>
                </div>

                {/* Stimulus Preview */}
                {phenom.stimulus && (
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs">
                    <div className="flex items-center space-x-1.5 font-semibold text-cyan-800 mb-1">
                      {phenom.stimulus.type === 'TABLE' ? (
                        <TableIcon className="h-3.5 w-3.5" />
                      ) : phenom.stimulus.type === 'CHART' ? (
                        <BarChart3 className="h-3.5 w-3.5" />
                      ) : (
                        <FlaskConical className="h-3.5 w-3.5" />
                      )}
                      <span>Dữ liệu kích thích ({phenom.stimulus.type}): {phenom.stimulus.title}</span>
                    </div>
                    <p className="text-slate-600 line-clamp-2 italic">{phenom.stimulus.leadParagraph}</p>
                  </div>
                )}

                {/* Curriculum Alignment */}
                <div className="bg-emerald-50/70 p-2 rounded-lg border border-emerald-100 text-[11px] text-emerald-900">
                  <strong>YCCĐ chuẩn GDPT 2018:</strong> {phenom.curriculum_alignment}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setSelectedPhenomenon(phenom)}
                  className="text-xs font-semibold text-cyan-700 hover:text-cyan-900 flex items-center space-x-1"
                >
                  <Info className="h-3.5 w-3.5" />
                  <span>Chi tiết & Nguồn</span>
                </button>
                <button
                  onClick={() => setGeneratingForPhenom(phenom)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 text-white hover:bg-cyan-700 shadow-sm flex items-center space-x-1"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Tạo câu hỏi (Workflow B)</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* International Contexts Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {intlContexts.map(item => (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex flex-wrap gap-1.5 items-center">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-100 text-indigo-800">
                    {item.organization}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-cyan-100 text-cyan-800">
                    {item.source_type}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                    KHTN Lớp {item.grade} ({item.age_range})
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800">
                    {item.application_area}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-snug">{item.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">Chủ đề khoa học: {item.scientific_topic}</p>
                  <div className="mt-2 text-xs space-y-1.5">
                    <p className="text-slate-500 italic bg-slate-50 p-2 rounded border border-slate-200">
                      <strong>Nguyên bản ({item.original_language.toUpperCase()}):</strong> {item.translated_text}
                    </p>
                    <p className="text-slate-800 bg-cyan-50/60 p-2 rounded border border-cyan-100 font-medium">
                      <strong>Việt hóa cho THCS:</strong> {item.adapted_context}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-[11px] text-slate-500">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Bản quyền: {item.license} • Kiểm định: {item.date_checked}</span>
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Trang nguồn gốc ({item.organization})</span>
                </a>
                <button
                  onClick={() => setSelectedIntl(item)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200"
                >
                  Xem quy trình Việt hóa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Phenomenon Detail Modal */}
      {selectedPhenomenon && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex justify-between items-start border-b pb-3">
              <div>
                <span className="text-xs font-bold text-cyan-600 uppercase tracking-wide">
                  Chi tiết Hiện tượng Khoa học
                </span>
                <h2 className="text-lg font-bold text-slate-900 mt-1">{selectedPhenomenon.title}</h2>
              </div>
              <button
                onClick={() => setSelectedPhenomenon(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <p><strong>Mô tả chi tiết:</strong> {selectedPhenomenon.description}</p>
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div><strong>Khối lớp:</strong> Lớp {selectedPhenomenon.grade} ({selectedPhenomenon.age_range})</div>
                <div><strong>Mức độ nhận thức phù hợp:</strong> M1-NB, M2-TH, M3-VD, M4-VDC</div>
                <div><strong>Lĩnh vực:</strong> {selectedPhenomenon.application_area}</div>
                <div><strong>Phân môn:</strong> {selectedPhenomenon.subject_area}</div>
              </div>

              {selectedPhenomenon.stimulus && (
                <div className="border border-slate-200 rounded-lg p-3 space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs flex items-center space-x-1 text-cyan-800">
                    <TableIcon className="h-3.5 w-3.5" />
                    <span>Dữ liệu thực nghiệm: {selectedPhenomenon.stimulus.title}</span>
                  </h4>
                  <p className="italic text-slate-600">{selectedPhenomenon.stimulus.leadParagraph}</p>
                  
                  {selectedPhenomenon.stimulus.dataHeaders && (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-slate-200 text-[11px] text-center">
                        <thead className="bg-slate-100">
                          <tr>
                            {selectedPhenomenon.stimulus.dataHeaders.map((h, idx) => (
                              <th key={idx} className="border border-slate-200 p-1.5">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {selectedPhenomenon.stimulus.dataRows?.map((row, rIdx) => (
                            <tr key={rIdx} className="hover:bg-slate-50">
                              {row.map((c, cIdx) => (
                                <td key={cIdx} className="border border-slate-200 p-1.5">{c}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {selectedPhenomenon.stimulus.experimentSetup && (
                    <div className="bg-amber-50/60 p-2.5 rounded border border-amber-200 space-y-1">
                      <div><strong>Giả thuyết:</strong> {selectedPhenomenon.stimulus.experimentSetup.hypothesis}</div>
                      <div><strong>Biến độc lập:</strong> {selectedPhenomenon.stimulus.experimentSetup.independentVariable}</div>
                      <div><strong>Biến phụ thuộc:</strong> {selectedPhenomenon.stimulus.experimentSetup.dependentVariable}</div>
                    </div>
                  )}
                </div>
              )}

              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <p><strong>Nguồn gốc tài liệu:</strong> {selectedPhenomenon.source}</p>
                {selectedPhenomenon.source_url && (
                  <p className="mt-1">
                    <a href={selectedPhenomenon.source_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center space-x-1">
                      <span>{selectedPhenomenon.source_url}</span>
                      <ExternalLink className="h-3 w-3 inline" />
                    </a>
                  </p>
                )}
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end">
              <button
                onClick={() => setSelectedPhenomenon(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold text-slate-700"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Workflow B Generator Modal */}
      {generatingForPhenom && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="border-b pb-3">
              <span className="text-xs font-bold text-cyan-600 uppercase">Workflow B: Context-First Generator</span>
              <h2 className="text-base font-bold text-slate-900 mt-1">
                Tạo câu hỏi từ: {generatingForPhenom.title}
              </h2>
            </div>

            {genSuccessMsg ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                <span>{genSuccessMsg}</span>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Mức độ nhận thức mục tiêu</label>
                  <select
                    value={genCogLevel}
                    onChange={e => setGenCogLevel(e.target.value as CognitiveLevel)}
                    className="w-full rounded-lg border-slate-300 bg-slate-50 p-2"
                  >
                    <option value="M1">M1 — Nhận biết (Kiến thức nền tảng trong bối cảnh)</option>
                    <option value="M2">M2 — Thông hiểu (Giải thích cơ chế của hiện tượng)</option>
                    <option value="M3">M3 — Vận dụng (Dự đoán, phân tích dữ liệu thí nghiệm)</option>
                    <option value="M4">M4 — Vận dụng cao (Đề xuất giải pháp, thiết kế thực nghiệm)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Dạng thức câu hỏi</label>
                  <select
                    value={genQType}
                    onChange={e => setGenQType(e.target.value as QuestionType)}
                    className="w-full rounded-lg border-slate-300 bg-slate-50 p-2"
                  >
                    <option value="MCQ">Trắc nghiệm nhiều lựa chọn (4 phương án)</option>
                    <option value="TRUE_FALSE">Trắc nghiệm Đúng/Sai (4 ý a, b, c, d độc lập)</option>
                    <option value="SHORT_ANSWER">Trả lời ngắn (Điền số liệu hoặc thuật ngữ)</option>
                    <option value="ESSAY">Tự luận (Kèm barem biểu điểm chi tiết)</option>
                  </select>
                </div>

                <div className="bg-cyan-50 p-3 rounded-lg border border-cyan-100 text-slate-600 space-y-1">
                  <div><strong>Nguyên tắc Context Must Matter:</strong> Câu hỏi sẽ sử dụng trực tiếp các số liệu và hiện tượng từ bối cảnh, bảo đảm học sinh phải vận dụng kiến thức KHTN để trả lời.</div>
                  <div><strong>YCCĐ:</strong> {generatingForPhenom.curriculum_alignment}</div>
                </div>
              </div>
            )}

            <div className="pt-3 border-t flex justify-end space-x-2">
              <button
                onClick={() => setGeneratingForPhenom(null)}
                disabled={isGenerating}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold text-slate-700"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleGenerateQuestion}
                disabled={isGenerating || !!genSuccessMsg}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1"
              >
                {isGenerating ? (
                  <span>Đang xử lý...</span>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Xác nhận tạo & Lưu</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ContextLibraryPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Đang tải Thư viện Bối cảnh...</div>}>
      <ContextLibraryContent />
    </Suspense>
  );
}
