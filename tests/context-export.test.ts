import { describe, it, expect } from 'vitest';
import { DocxExportService } from '@/features/export-engine/docx-export';
import { ContextService } from '@/features/context-engine/context-service';
import { TestExam } from '@/types/test';

describe('Context Export Engine (Section 32)', () => {
  it('should export 03_De_kiem_tra.docx preserving stimulus tables and contextual descriptions', async () => {
    const phenomena = ContextService.getPhenomena();
    const phenom = phenomena.find(p => p.stimulus?.type === 'TABLE') || phenomena[0];

    const ctxQuestion = ContextService.buildQuestionFromPhenomenon(
      phenom,
      'M2',
      'MCQ',
      phenom.curriculum_alignment
    );

    const mockTest: TestExam = {
      id: 'TEST_EXPORT_CTX_01',
      matrixId: 'MATRIX_01',
      specificationId: 'SPEC_01',
      testCode: '101',
      schoolName: 'THCS KHTN',
      departmentName: 'TỔ KHTN',
      subjectName: 'Khoa học tự nhiên',
      title: 'ĐỀ KIỂM TRA ĐỊNH KỲ MÔN KHOA HỌC TỰ NHIÊN',
      grade: 6,
      schoolYear: '2026-2027',
      semester: 'HK1',
      durationMinutes: 60,
      totalScore: 10.0,
      parts: [
        {
          partNumber: 1,
          partName: 'PHẦN I. CÂU HỎI TRẮC NGHIỆM NHIỀU PHƯƠNG ÁN LỰA CHỌN',
          questionType: 'MCQ',
          instructions: 'Thí sinh trả lời từ câu 1 đến câu 1. Mỗi câu hỏi chỉ chọn một phương án.',
          totalScore: 0.25,
          questions: [
            {
              orderInPart: 1,
              globalOrderIndex: 1,
              question: ctxQuestion,
              assignedScore: 0.25
            }
          ]
        }
      ],
      answerKeys: [
        {
          questionNumber: 1,
          partNumber: 1,
          questionType: 'MCQ',
          correctAnswer: 'A',
          score: 0.25,
          explanation: 'Lý giải A'
        }
      ],
      scoringGuide: {
        id: 'SG_01',
        testId: 'TEST_EXPORT_CTX_01',
        totalScore: 10.0,
        instructions: ['Thang điểm 10'],
        rubrics: []
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docxBuffer = await DocxExportService.exportTestDocx(mockTest);

    expect(docxBuffer).toBeDefined();
    expect(docxBuffer.length).toBeGreaterThan(1000);
  });
});
