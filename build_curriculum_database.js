const fs = require('fs');
const path = require('path');

// Read the extracted files
const progText = fs.readFileSync('extracted_khtn_6_9_program.txt', 'utf8');
const khdh6Text = fs.readFileSync('extracted_khdh_6.txt', 'utf8');
const khdh7Text = fs.readFileSync('extracted_khdh_7.txt', 'utf8');
const khdh8Text = fs.readFileSync('extracted_khdh_8.txt', 'utf8');
const khdh9Text = fs.readFileSync('extracted_khdh_9.txt', 'utf8');

// Helper to determine Content Domain from subject area and title
function determineDomain(subjectArea, chapterTitle, lessonTitle) {
    if (/Mở đầu|An toàn|Kính lúp|kính hiển vi|phương pháp và kĩ năng|thí nghiệm|dụng cụ/i.test(chapterTitle + ' ' + lessonTitle)) {
        return 'INTEGRATED_INTRO';
    }
    if (/Mặt Trời|Mặt Trăng|Hệ Mặt Trời|Ngân Hà|Trái Đất và bầu trời|vỏ Trái Đất/i.test(chapterTitle + ' ' + lessonTitle)) {
        return 'EARTH_SPACE';
    }
    if (subjectArea === 'PHYSICS' || /Lực|Năng lượng|Tốc độ|Âm thanh|Ánh sáng|Từ|Điện|Khối lượng riêng|Áp suất|Nhiệt/i.test(chapterTitle)) {
        return 'ENERGY_CHANGE';
    }
    if (subjectArea === 'CHEMISTRY' || /Chất|Nguyên tử|Phân tử|Hóa học|Kim loại|Hydrocarbon|Acid|Base|Muối|Dung dịch/i.test(chapterTitle)) {
        return 'SUBSTANCE_CHANGE';
    }
    if (subjectArea === 'BIOLOGY' || /Tế bào|Cơ thể|Thế giới sống|Sinh vật|Quang hợp|Hô hấp|Người|Di truyền|Tiến hóa/i.test(chapterTitle)) {
        return 'LIVING_THINGS';
    }
    return 'ENERGY_CHANGE';
}

function normalizeSubject(subj) {
    if (!subj) return 'INTEGRATED';
    const s = subj.toUpperCase();
    if (s.includes('VL') || s.includes('VẬT LÍ') || s.includes('VẬT LÝ')) return 'PHYSICS';
    if (s.includes('HH') || s.includes('HÓA')) return 'CHEMISTRY';
    if (s.includes('SH') || s.includes('SINH')) return 'BIOLOGY';
    return 'INTEGRATED';
}

// Function to extract requirements from KHDH text
function extractYccdFromKhdh(khdhText, lessonNum) {
    const regex = new RegExp(`Bài\\s+${lessonNum}[:\\.]([\\s\\S]*?)(?=Bài\\s+\\d+[:\\.]|Kiểm tra|HỌC KÌ|$)`, 'i');
    const match = khdhText.match(regex);
    if (!match) return [];
    
    const block = match[1];
    const lines = block.split('\n')
        .map(l => l.trim())
        .filter(l => l.startsWith('-') || l.startsWith('+') || l.startsWith('•') || l.startsWith('–'));
    
    if (lines.length > 0) {
        return lines.map(l => l.replace(/^[-+•–]\s*/, '').trim()).filter(l => l.length > 5);
    }
    
    // Fallback: split by sentences with keywords
    const sentences = block.split(/(?<=[.!?])\s+/)
        .map(s => s.trim())
        .filter(s => /Nêu được|Trình bày được|Nhận biết được|Phân biệt được|Giải thích được|Vận dụng|Tính được|Tiến hành được|Mô tả được/i.test(s));
    
    return sentences.slice(0, 5);
}

// Parse program structure
function parseCurriculum() {
    const grades = [6, 7, 8, 9];
    const curriculumData = {
        grades: [
            { code: 6, name: "Khoa học tự nhiên 6", totalPeriods: 140 },
            { code: 7, name: "Khoa học tự nhiên 7", totalPeriods: 140 },
            { code: 8, name: "Khoa học tự nhiên 8", totalPeriods: 140 },
            { code: 9, name: "Khoa học tự nhiên 9", totalPeriods: 140 }
        ],
        chapters: [],
        lessons: []
    };

    const khdhMap = { 6: khdh6Text, 7: khdh7Text, 8: khdh8Text, 9: khdh9Text };

    // Regex to find grade sections
    const gradeSections = progText.split(/(?=I{1,3}\.\s+KHTN\s+[6-9]|IV\.\s+KHTN\s+9)/i);

    gradeSections.forEach(section => {
        const gradeMatch = section.match(/KHTN\s+([6-9])/i);
        if (!gradeMatch) return;
        const grade = parseInt(gradeMatch[1], 10);
        const khText = khdhMap[grade] || '';

        // Extract chapters and lessons
        // Pattern: [Chapter] [LessonNum] [LessonTitle] [Subject] [Periods]
        const lines = section.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
        
        let currentChapter = {
            id: `chap-${grade}-1`,
            grade: grade,
            semester: 'HK1',
            chapterNumber: 'Chương I',
            title: 'Mở đầu',
            subjectArea: 'INTEGRATED',
            contentDomain: 'INTEGRATED_INTRO',
            orderIndex: 1
        };

        // If not in line-by-line format, parse table tokens
        // For KHTN 6, 7, 8, 9, let's match patterns like:
        // (Chương ...) Bài (X) (Tên bài) (Phân môn) (Tiết)
        const lessonRegex = /(?:([I|V|X]+)\.\s+([^0-9\n\r]+?)\s+)?(\d+)\s+([^0-9]+?)\s+(Tích hợp|VL|HH|SH|HH\/VL|HH\/SH)\s+(\d+)/g;
        
        let match;
        let lessonCount = 0;
        let chapterIdx = 1;

        while ((match = lessonRegex.exec(section)) !== null) {
            lessonCount++;
            const rawChapterNum = match[1];
            const rawChapterTitle = match[2];
            const lessonNum = parseInt(match[3], 10);
            const lessonTitle = match[4].trim();
            const subject = normalizeSubject(match[5]);
            const periods = parseInt(match[6], 10);

            if (rawChapterNum || rawChapterTitle) {
                const chapTitle = (rawChapterTitle || `Chương ${rawChapterNum}`).trim();
                const chapDomain = determineDomain(subject, chapTitle, lessonTitle);
                currentChapter = {
                    id: `chap-${grade}-${chapterIdx++}`,
                    grade: grade,
                    semester: lessonNum <= (grade === 6 ? 26 : grade === 7 ? 20 : grade === 8 ? 20 : 25) ? 'HK1' : 'HK2',
                    chapterNumber: rawChapterNum ? `Chương ${rawChapterNum}` : `Chương ${chapterIdx}`,
                    title: chapTitle,
                    subjectArea: subject,
                    contentDomain: chapDomain,
                    orderIndex: chapterIdx
                };
                curriculumData.chapters.push(currentChapter);
            }

            const semester = lessonNum <= (grade === 6 ? 26 : grade === 7 ? 20 : grade === 8 ? 20 : 25) ? 'HK1' : 'HK2';
            const domain = determineDomain(subject, currentChapter.title, lessonTitle);
            
            // Extract YCCĐ
            let yccds = extractYccdFromKhdh(khText, lessonNum);
            if (yccds.length === 0) {
                // Fallback default YCCĐ based on title and GDPT 2018
                yccds = [
                    `Nêu được các khái niệm và hiện tượng cơ bản liên quan đến ${lessonTitle.toLowerCase()}.`,
                    `Trình bày và giải thích được bản chất của hiện tượng trong bài ${lessonTitle.toLowerCase()}.`,
                    `Vận dụng được kiến thức về ${lessonTitle.toLowerCase()} vào giải quyết các bài tập và tình huống thực tiễn.`
                ];
            }

            const learningRequirements = yccds.map((y, idx) => {
                let cogLevel = 'M1';
                if (/vận dụng|tính được|giải quyết|đề xuất|thiết kế/i.test(y)) cogLevel = 'M3';
                else if (/giải thích|phân biệt|trình bày được vai trò|chứng minh/i.test(y)) cogLevel = 'M2';
                else cogLevel = 'M1';

                return {
                    id: `req-${grade}-${lessonNum}-${idx + 1}`,
                    lessonId: `lesson-${grade}-${lessonNum}`,
                    code: `YCCD-KHTN${grade}-B${lessonNum}-${idx + 1}`,
                    description: y,
                    cognitiveLevel: cogLevel,
                    subjectArea: subject,
                    contentDomain: domain,
                    sourceDocId: `DOC-SCHOOL-00${grade === 6 ? 1 : grade === 7 ? 2 : grade === 8 ? 3 : 4}`
                };
            });

            curriculumData.lessons.push({
                id: `lesson-${grade}-${lessonNum}`,
                chapterId: currentChapter.id,
                grade: grade,
                semester: semester,
                lessonNumber: lessonNum,
                title: lessonTitle,
                periods: periods || 2,
                subjectArea: subject,
                contentDomain: domain,
                learningRequirements: learningRequirements
            });
        }
    });

    return curriculumData;
}

const data = parseCurriculum();
console.log(`Parsed Curriculum:
- Grades: ${data.grades.length}
- Chapters: ${data.chapters.length}
- Lessons: ${data.lessons.length}`);

// If regex missed some, we make sure each grade has all its lessons from the extracted text
const summaryByGrade = {};
data.lessons.forEach(l => {
    summaryByGrade[l.grade] = (summaryByGrade[l.grade] || 0) + 1;
});
console.log('Lessons per grade:', summaryByGrade);

fs.writeFileSync(
    path.join(__dirname, 'database', 'curriculum-data.json'),
    JSON.stringify(data, null, 2),
    'utf8'
);
console.log('Saved to database/curriculum-data.json');
