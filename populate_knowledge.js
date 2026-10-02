const fs = require('fs');
const path = require('path');

const mappings = [
    {
        srcPattern: /11-ctkhoa-hoc-tu-nhien\.pdf/i,
        destFolder: 'knowledge/legal',
        docId: 'DOC-LEGAL-001',
        name: 'Chương trình Giáo dục phổ thông môn Khoa học tự nhiên 2018',
        type: 'CURRICULUM_LEGAL',
        sourceLevel: 'LEGAL',
        grade: 'ALL',
        subject: 'KHTN',
        schoolYear: '2018-present',
        status: 'ACTIVE'
    },
    {
        srcPattern: /thong-tu-32-2018.*\.pdf/i,
        destFolder: 'knowledge/legal',
        docId: 'DOC-LEGAL-002',
        name: 'Thông tư 32/2018/TT-BGDĐT ban hành CT GDPT mới',
        type: 'CIRCULAR',
        sourceLevel: 'LEGAL',
        grade: 'ALL',
        subject: 'ALL',
        schoolYear: '2018-present',
        status: 'ACTIVE'
    },
    {
        srcPattern: /cong-van-7991.*\.pdf/i,
        destFolder: 'knowledge/legal',
        docId: 'DOC-LEGAL-003',
        name: 'Công văn 7991/BGDĐT-GDTrH về kiểm tra, đánh giá định kì THCS, THPT',
        type: 'OFFICIAL_LETTER',
        sourceLevel: 'LEGAL',
        grade: 'ALL',
        subject: 'ALL',
        schoolYear: '2024-2025 onwards',
        status: 'ACTIVE'
    },
    {
        srcPattern: /984_CV.*\.pdf/i,
        destFolder: 'knowledge/local_guidance',
        docId: 'DOC-LOCAL-001',
        name: 'Công văn 984/SGDĐT-GDPT Hướng dẫn kiểm tra cuối kì II năm học 2025-2026',
        type: 'LOCAL_GUIDELINE',
        sourceLevel: 'LOCAL',
        grade: 'ALL',
        subject: 'KHTN',
        schoolYear: '2025-2026',
        status: 'ACTIVE'
    },
    {
        srcPattern: /YEU CAU KIEM TRA MON KHTN.*\.docx/i,
        destFolder: 'knowledge/local_guidance',
        docId: 'DOC-LOCAL-002',
        name: 'Quy định cấu trúc đề kiểm tra định kì 4 phần môn KHTN THCS',
        type: 'LOCAL_ASSESSMENT_SPEC',
        sourceLevel: 'LOCAL',
        grade: '6,7,8,9',
        subject: 'KHTN',
        schoolYear: '2025-2026',
        status: 'ACTIVE'
    },
    {
        srcPattern: /KHTN_6-9_Ket_noi_tri_thuc_Chuong_Bai_Phan_mon_So_tiet\.docx/i,
        destFolder: 'knowledge/school_plan',
        docId: 'DOC-SCHOOL-000',
        name: 'Danh mục chương - bài - phân môn - số tiết KHTN 6-9 Kết nối tri thức',
        type: 'SYLLABUS_REFERENCE',
        sourceLevel: 'SCHOOL',
        grade: '6,7,8,9',
        subject: 'KHTN',
        schoolYear: '2026-2027',
        status: 'ACTIVE'
    },
    {
        srcPattern: /K.*HO.*CH.*KHTN 6\.docx/i,
        destFolder: 'knowledge/school_plan',
        docId: 'DOC-SCHOOL-001',
        name: 'Kế hoạch dạy học môn Khoa học tự nhiên Khối 6 - THCS & THPT Phan Văn Trị',
        type: 'TEACHING_PLAN',
        sourceLevel: 'SCHOOL',
        grade: '6',
        subject: 'KHTN',
        schoolYear: '2026-2027',
        status: 'ACTIVE'
    },
    {
        srcPattern: /K.*HO.*CH.*KHTN 7\.doc/i,
        destFolder: 'knowledge/school_plan',
        docId: 'DOC-SCHOOL-002',
        name: 'Kế hoạch dạy học môn Khoa học tự nhiên Khối 7 - THCS & THPT Phan Văn Trị',
        type: 'TEACHING_PLAN',
        sourceLevel: 'SCHOOL',
        grade: '7',
        subject: 'KHTN',
        schoolYear: '2026-2027',
        status: 'ACTIVE'
    },
    {
        srcPattern: /K.*HO.*CH.*KHTN 8\.docx/i,
        destFolder: 'knowledge/school_plan',
        docId: 'DOC-SCHOOL-003',
        name: 'Kế hoạch dạy học môn Khoa học tự nhiên Khối 8 - THCS & THPT Phan Văn Trị',
        type: 'TEACHING_PLAN',
        sourceLevel: 'SCHOOL',
        grade: '8',
        subject: 'KHTN',
        schoolYear: '2026-2027',
        status: 'ACTIVE'
    },
    {
        srcPattern: /K.*HO.*CH.*KHTN 9\.docx/i,
        destFolder: 'knowledge/school_plan',
        docId: 'DOC-SCHOOL-004',
        name: 'Kế hoạch dạy học môn Khoa học tự nhiên Khối 9 - THCS & THPT Phan Văn Trị',
        type: 'TEACHING_PLAN',
        sourceLevel: 'SCHOOL',
        grade: '9',
        subject: 'KHTN',
        schoolYear: '2026-2027',
        status: 'ACTIVE'
    },
    {
        srcPattern: /SGK.*6.*\.pdf/i,
        destFolder: 'knowledge/textbooks',
        docId: 'DOC-TEXTBOOK-006',
        name: 'SGK Khoa học tự nhiên 6 - Kết nối tri thức với cuộc sống',
        type: 'TEXTBOOK',
        sourceLevel: 'TEXTBOOK',
        grade: '6',
        subject: 'KHTN',
        schoolYear: 'GDPT 2018',
        status: 'ACTIVE'
    },
    {
        srcPattern: /SGK.*7.*\.pdf/i,
        destFolder: 'knowledge/textbooks',
        docId: 'DOC-TEXTBOOK-007',
        name: 'SGK Khoa học tự nhiên 7 - Kết nối tri thức với cuộc sống',
        type: 'TEXTBOOK',
        sourceLevel: 'TEXTBOOK',
        grade: '7',
        subject: 'KHTN',
        schoolYear: 'GDPT 2018',
        status: 'ACTIVE'
    },
    {
        srcPattern: /SGK.*8.*\.pdf/i,
        destFolder: 'knowledge/textbooks',
        docId: 'DOC-TEXTBOOK-008',
        name: 'SGK Khoa học tự nhiên 8 - Kết nối tri thức với cuộc sống',
        type: 'TEXTBOOK',
        sourceLevel: 'TEXTBOOK',
        grade: '8',
        subject: 'KHTN',
        schoolYear: 'GDPT 2018',
        status: 'ACTIVE'
    },
    {
        srcPattern: /SGK.*9.*\.pdf/i,
        destFolder: 'knowledge/textbooks',
        docId: 'DOC-TEXTBOOK-009',
        name: 'SGK Khoa học tự nhiên 9 - Kết nối tri thức với cuộc sống',
        type: 'TEXTBOOK',
        sourceLevel: 'TEXTBOOK',
        grade: '9',
        subject: 'KHTN',
        schoolYear: 'GDPT 2018',
        status: 'ACTIVE'
    },
    {
        srcPattern: /Huong_dan_xay_dung_ma_tran_KHTN_THCS\.docx/i,
        destFolder: 'knowledge/templates',
        docId: 'DOC-TEMPLATE-001',
        name: 'Hướng dẫn xây dựng ma trận và bản đặc tả đề kiểm tra môn KHTN THCS',
        type: 'MATRIX_TEMPLATE_SPEC',
        sourceLevel: 'REFERENCE',
        grade: '6,7,8,9',
        subject: 'KHTN',
        schoolYear: 'GDPT 2018',
        status: 'ACTIVE'
    }
];

const files = fs.readdirSync(__dirname);
const catalog = [];

files.forEach(f => {
    for (const m of mappings) {
        if (m.srcPattern.test(f)) {
            const destPath = path.join(__dirname, m.destFolder, f);
            if (!fs.existsSync(destPath)) {
                fs.copyFileSync(path.join(__dirname, f), destPath);
                console.log(`Copied ${f} -> ${m.destFolder}`);
            }
            catalog.push({
                document_id: m.docId,
                file_name: f,
                title: m.name,
                document_type: m.type,
                grade: m.grade,
                subject: m.subject,
                school_year: m.schoolYear,
                source_level: m.sourceLevel,
                effective_date: '2024-2026',
                version: '1.0',
                status: m.status,
                relative_path: path.join(m.destFolder, f).replace(/\\/g, '/')
            });
            break;
        }
    }
});

fs.writeFileSync(
    path.join(__dirname, 'knowledge', 'catalog.json'),
    JSON.stringify(catalog, null, 2),
    'utf8'
);

console.log(`Knowledge base organized with ${catalog.length} cataloged documents.`);
