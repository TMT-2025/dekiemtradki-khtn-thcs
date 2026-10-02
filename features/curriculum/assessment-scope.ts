import { GradeLevel, Lesson, Semester } from '@/types/curriculum';
import { AssessmentType } from '@/types/matrix';

export interface AssessmentScopeDetail {
  grade: GradeLevel;
  assessmentType: AssessmentType;
  semester: Semester;
  title: string;
  timing: string; // ví dụ: "Tuần 9 (Tiết 33–36)"
  accumulatedPeriods: number;
  subjectRatio: string; // ví dụ: "35% Vật lí : 35% Hóa học : 30% Sinh học"
  recommendedLessonNumbers: number[];
  description: string;
}

export const ASSESSMENT_SCOPE_STANDARDS: Record<string, AssessmentScopeDetail> = {
  // =================== KHTN 6 ===================
  '6_MID_TERM_1': {
    grade: 6,
    assessmentType: 'MID_TERM_1',
    semester: 'HK1',
    title: 'Kiểm tra Giữa Học kỳ I — KHTN 6',
    timing: 'Tuần 9 (Tiết 33 – 36)',
    accumulatedPeriods: 36,
    subjectRatio: 'Tích hợp & Đo lường: 35% | Sinh học: 65%',
    recommendedLessonNumbers: [1, 2, 3, 4, 5, 6, 7, 8, 18, 19, 20, 21, 22, 23, 24],
    description: 'Chương I (Bài 1-8: Mở đầu & Đo lường), Chương V (Bài 18-21: Tế bào), Chương VI (Bài 22-24: Từ tế bào đến cơ thể).'
  },
  '6_FINAL_TERM_1': {
    grade: 6,
    assessmentType: 'FINAL_TERM_1',
    semester: 'HK1',
    title: 'Kiểm tra Cuối Học kỳ I — KHTN 6',
    timing: 'Tuần 18 (Tiết 69 – 72)',
    accumulatedPeriods: 72,
    subjectRatio: 'Hóa học: 45% | Sinh học: 40% | Vật lí: 15%',
    recommendedLessonNumbers: [1, 2, 6, 7, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 22, 25, 26, 27, 28, 29, 30, 31, 40, 41],
    description: 'Toàn bộ HK1 trọng tâm nửa sau: Chất quanh ta, Hỗn hợp (Bài 9-17), Phân loại thế giới sống & Vi sinh vật (Bài 25-31), Lực nhập môn (Bài 40-41).'
  },
  '6_MID_TERM_2': {
    grade: 6,
    assessmentType: 'MID_TERM_2',
    semester: 'HK2',
    title: 'Kiểm tra Giữa Học kỳ II — KHTN 6',
    timing: 'Tuần 26 (Tiết 101 – 104)',
    accumulatedPeriods: 104,
    subjectRatio: 'Sinh học: 45% | Vật lí: 55%',
    recommendedLessonNumbers: [32, 33, 34, 35, 42, 43, 44, 45, 46, 47, 48],
    description: 'Chương VII tiếp (Bài 32-35: Nấm, Thực vật), Chương VIII tiếp (Bài 42-45: Biến dạng lò xo, Trọng lực, Ma sát, Lực cản), Chương IX (Bài 46-48: Năng lượng).'
  },
  '6_FINAL_TERM_2': {
    grade: 6,
    assessmentType: 'FINAL_TERM_2',
    semester: 'HK2',
    title: 'Kiểm tra Cuối Học kỳ II — KHTN 6',
    timing: 'Tuần 34 – 35 (Tiết 137 – 140)',
    accumulatedPeriods: 140,
    subjectRatio: 'Sinh học: 50% | Vật lí & Vũ trụ: 50%',
    recommendedLessonNumbers: [34, 36, 37, 38, 39, 44, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55],
    description: 'Toàn bộ HK2 trọng tâm nửa sau: Động vật & Đa dạng sinh học (Bài 36-39), Tiết kiệm năng lượng (Bài 49-51), Trái Đất và Bầu trời (Bài 52-55).'
  },

  // =================== KHTN 7 ===================
  '7_MID_TERM_1': {
    grade: 7,
    assessmentType: 'MID_TERM_1',
    semester: 'HK1',
    title: 'Kiểm tra Giữa Học kỳ I — KHTN 7',
    timing: 'Tuần 9 (Tiết 33 – 36)',
    accumulatedPeriods: 32,
    subjectRatio: 'Tích hợp / Mở đầu: 20% | Hóa học: 80%',
    recommendedLessonNumbers: [1, 2, 3, 4, 5, 6, 7],
    description: 'Mở đầu (Bài 1), Chương I: Nguyên tử & Bảng tuần hoàn (Bài 2-4), Chương II: Phân tử & Liên kết hóa học (Bài 5-7).'
  },
  '7_FINAL_TERM_1': {
    grade: 7,
    assessmentType: 'FINAL_TERM_1',
    semester: 'HK1',
    title: 'Kiểm tra Cuối Học kỳ I — KHTN 7',
    timing: 'Tuần 18 (Tiết 69 – 72)',
    accumulatedPeriods: 70,
    subjectRatio: 'Vật lí: 65% | Hóa học: 35%',
    recommendedLessonNumbers: [2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
    description: 'Toàn bộ HK1 trọng tâm nửa sau: Chương III (Tốc độ: Bài 8-11), Chương IV (Âm thanh: Bài 12-14), Chương V (Ánh sáng: Bài 15-17), củng cố Hóa học.'
  },
  '7_MID_TERM_2': {
    grade: 7,
    assessmentType: 'MID_TERM_2',
    semester: 'HK2',
    title: 'Kiểm tra Giữa Học kỳ II — KHTN 7',
    timing: 'Tuần 26 (Tiết 101 – 104)',
    accumulatedPeriods: 104,
    subjectRatio: 'Vật lí (Từ học): 35% | Sinh học (Trao đổi chất): 65%',
    recommendedLessonNumbers: [18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32],
    description: 'Chương VI: Từ học (Bài 18-20: Nam châm, Từ trường) và Chương VII: Trao đổi chất và chuyển hóa năng lượng ở sinh vật (Bài 21-32).'
  },
  '7_FINAL_TERM_2': {
    grade: 7,
    assessmentType: 'FINAL_TERM_2',
    semester: 'HK2',
    title: 'Kiểm tra Cuối Học kỳ II — KHTN 7',
    timing: 'Tuần 34 – 35 (Tiết 137 – 140)',
    accumulatedPeriods: 140,
    subjectRatio: 'Sinh học: 70% | Vật lí: 30%',
    recommendedLessonNumbers: [18, 19, 22, 25, 28, 30, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42],
    description: 'Toàn bộ HK2 trọng tâm nửa sau: Chương VIII (Cảm ứng: Bài 33-35), Chương IX (Sinh trưởng: Bài 36-38), Chương X (Sinh sản: Bài 39-42), củng cố Từ & Trao đổi chất.'
  },

  // =================== KHTN 8 ===================
  '8_MID_TERM_1': {
    grade: 8,
    assessmentType: 'MID_TERM_1',
    semester: 'HK1',
    title: 'Kiểm tra Giữa Học kỳ I — KHTN 8',
    timing: 'Tuần 9 (Tiết 35 – 36)',
    accumulatedPeriods: 36,
    subjectRatio: 'Hóa học: 40% | Vật lí: 30% | Sinh học: 30%',
    recommendedLessonNumbers: [1, 2, 3, 4, 5, 13, 14, 15, 16, 30, 31, 32],
    description: 'Hóa học (Bài 1-5: Phản ứng HH, Mol, Dung dịch, ĐLBTKL), Vật lí (Bài 13-16: Khối lượng riêng, Áp suất), Sinh học (Bài 30-32: Vận động, Tiêu hóa).'
  },
  '8_FINAL_TERM_1': {
    grade: 8,
    assessmentType: 'FINAL_TERM_1',
    semester: 'HK1',
    title: 'Kiểm tra Cuối Học kỳ I — KHTN 8',
    timing: 'Tuần 18 (Tiết 71 – 72)',
    accumulatedPeriods: 72,
    subjectRatio: 'Hóa học: 35% | Vật lí: 35% | Sinh học: 30%',
    recommendedLessonNumbers: [2, 3, 4, 5, 6, 7, 13, 15, 16, 17, 18, 19, 20, 31, 32, 33, 34, 35, 36, 37, 38],
    description: 'Toàn bộ HK1: Hóa học (Bài 6-7: Tính theo PTHH, Tốc độ PƯ), Vật lí (Bài 17-20: Archimedes, Moment, Đòn bẩy, Nhiễm điện), Sinh học (Bài 33-38: Tuần hoàn, Hô hấp, Bài tiết, Thần kinh, Nội tiết).'
  },
  '8_MID_TERM_2': {
    grade: 8,
    assessmentType: 'MID_TERM_2',
    semester: 'HK2',
    title: 'Kiểm tra Giữa Học kỳ II — KHTN 8',
    timing: 'Tuần 26 (Tiết 103 – 104)',
    accumulatedPeriods: 104,
    subjectRatio: 'Hóa học: 35% | Vật lí: 35% | Sinh học: 30%',
    recommendedLessonNumbers: [8, 9, 10, 21, 22, 23, 24, 39, 40, 41, 42],
    description: 'Hóa học (Bài 8-10: Acid, Base & pH, Oxide), Vật lí (Bài 21-24: Dòng điện, Mạch điện, Tác dụng, Cường độ & HĐT), Sinh học (Bài 39-42: Da, Thân nhiệt, Sinh sản người, Quần thể).'
  },
  '8_FINAL_TERM_2': {
    grade: 8,
    assessmentType: 'FINAL_TERM_2',
    semester: 'HK2',
    title: 'Kiểm tra Cuối Học kỳ II — KHTN 8',
    timing: 'Tuần 34 – 35 (Tiết 137 – 140)',
    accumulatedPeriods: 140,
    subjectRatio: 'Hóa học: 30% | Vật lí: 35% | Sinh học: 35%',
    recommendedLessonNumbers: [8, 9, 10, 11, 12, 22, 23, 25, 26, 27, 28, 29, 41, 42, 43, 44, 45, 46, 47],
    description: 'Toàn bộ HK2: Hóa học (Bài 11-12: Muối, Phân bón), Vật lí (Bài 25-29: Nhiệt & sự truyền nhiệt, Nở vì nhiệt), Sinh học (Bài 43-47: Quần xã, Hệ sinh thái, Sinh quyển, Bảo vệ MT).'
  },

  // =================== KHTN 9 ===================
  '9_MID_TERM_1': {
    grade: 9,
    assessmentType: 'MID_TERM_1',
    semester: 'HK1',
    title: 'Kiểm tra Giữa Học kỳ I — KHTN 9',
    timing: 'Tuần 9 (Tiết 15)',
    accumulatedPeriods: 36,
    subjectRatio: 'Vật lí: 35% | Hóa học: 35% | Sinh học: 30%',
    recommendedLessonNumbers: [1, 2, 3, 4, 5, 6, 7, 18, 19, 20, 36, 37, 38],
    description: 'Vật lí/Mở đầu (Bài 1-7: Cơ năng, Công & công suất, Khúc xạ, Phản xạ toàn phần, Lăng kính), Hóa học (Bài 18-20: Kim loại & Tách kim loại), Sinh học (Bài 36-38: Mendel, Gene, DNA).'
  },
  '9_FINAL_TERM_1': {
    grade: 9,
    assessmentType: 'FINAL_TERM_1',
    semester: 'HK1',
    title: 'Kiểm tra Cuối Học kỳ I — KHTN 9',
    timing: 'Tuần 18 (Tiết 32)',
    accumulatedPeriods: 72,
    subjectRatio: 'Vật lí: 35% | Hóa học: 35% | Sinh học: 30%',
    recommendedLessonNumbers: [2, 3, 4, 5, 8, 9, 10, 11, 18, 19, 21, 22, 23, 24, 25, 36, 38, 39, 40, 41, 42, 43],
    description: 'Toàn bộ HK1: Vật lí (Bài 8-11: Thấu kính, Kính lúp, Định luật Ohm), Hóa học (Bài 21-25: Phi kim, Hữu cơ, Alkane, Alkene, Nhiên liệu), Sinh học (Bài 39-43: Phiên mã/dịch mã, Đột biến, NST, Nguyên phân/giảm phân).'
  },
  '9_MID_TERM_2': {
    grade: 9,
    assessmentType: 'MID_TERM_2',
    semester: 'HK2',
    title: 'Kiểm tra Giữa Học kỳ II — KHTN 9',
    timing: 'Tuần 26 (Tiết 45)',
    accumulatedPeriods: 104,
    subjectRatio: 'Vật lí: 30% | Hóa học: 40% | Sinh học: 30%',
    recommendedLessonNumbers: [12, 13, 14, 15, 26, 27, 28, 29, 30, 33, 34, 35, 44, 45, 46],
    description: 'Vật lí (Bài 12-15: Mạch điện, Công suất điện, Cảm ứng điện từ, Xoay chiều), Hóa học (Bài 26-30, 33-35: Rượu, Acid, Lipid, Đường, Đá vôi, Silicate), Sinh học (Bài 44-46: Giới tính, Di truyền LK, Đột biến NST).'
  },
  '9_FINAL_TERM_2': {
    grade: 9,
    assessmentType: 'FINAL_TERM_2',
    semester: 'HK2',
    title: 'Kiểm tra Cuối Học kỳ II — KHTN 9',
    timing: 'Tuần 34 – 35 (Tiết 62 – 63)',
    accumulatedPeriods: 140,
    subjectRatio: 'Vật lí: 30% | Hóa học: 30% | Sinh học: 40%',
    recommendedLessonNumbers: [12, 13, 14, 16, 17, 26, 27, 31, 32, 33, 34, 44, 45, 46, 47, 48, 49, 50, 51],
    description: 'Toàn bộ HK2: Vật lí (Bài 16-17: Năng lượng tái tạo & Tổng hợp), Hóa học (Bài 31-32: Protein, Polymer), Sinh học (Bài 47-51: Di truyền người, Công nghệ gene, Tiến hóa, Sự sống trên Trái Đất).'
  }
};

export class AssessmentScopeService {
  public static getScopeKey(grade: GradeLevel, assessmentType: AssessmentType): string {
    return `${grade}_${assessmentType}`;
  }

  public static getScopeDetail(grade: GradeLevel, assessmentType: AssessmentType): AssessmentScopeDetail | undefined {
    const key = this.getScopeKey(grade, assessmentType);
    return ASSESSMENT_SCOPE_STANDARDS[key];
  }

  public static getRecommendedLessonNumbers(grade: GradeLevel, assessmentType: AssessmentType): number[] {
    const detail = this.getScopeDetail(grade, assessmentType);
    return detail ? detail.recommendedLessonNumbers : [];
  }

  public static getRecommendedLessonIds(grade: GradeLevel, assessmentType: AssessmentType, lessons: Lesson[]): string[] {
    const recommendedNumbers = this.getRecommendedLessonNumbers(grade, assessmentType);
    if (recommendedNumbers.length === 0) return [];

    return lessons
      .filter(l => l.grade === grade && recommendedNumbers.includes(l.lessonNumber))
      .map(l => l.id);
  }
}
