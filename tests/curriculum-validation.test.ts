import { describe, it, expect } from 'vitest';
import { ContextService } from '@/features/context-engine/context-service';
import { CurriculumService } from '@/features/curriculum/curriculum-service';
import { GradeLevel, SubjectArea } from '@/types/curriculum';

describe('Phase 7.2: Curriculum Data Validation & Context Records Audit', () => {
  const allowedGrades: GradeLevel[] = [6, 7, 8, 9];
  const allowedSubjectAreas: SubjectArea[] = ['PHYSICS', 'CHEMISTRY', 'BIOLOGY', 'INTEGRATED'];
  const phenomena = ContextService.getPhenomena();
  const internationalContexts = ContextService.getInternationalContexts();

  it('should validate all phenomenon records adhere strictly to supported KHTN Grades (6, 7, 8, 9)', () => {
    expect(phenomena.length).toBeGreaterThan(0);
    phenomena.forEach(p => {
      expect(allowedGrades).toContain(p.grade);
      expect(allowedSubjectAreas).toContain(p.subject_area);
      expect(p.title).toBeDefined();
      expect(p.title.trim().length).toBeGreaterThan(5);
      expect(p.description).toBeDefined();
      expect(p.description.trim().length).toBeGreaterThan(15);
    });
  });

  it('should validate curriculum alignment and YCCĐ mapping for each phenomenon', () => {
    phenomena.forEach(p => {
      // Must have curriculum alignment text
      expect(p.curriculum_alignment).toBeDefined();
      expect(p.curriculum_alignment.trim().length).toBeGreaterThan(10);

      // Must correspond to actual lessons in curriculum data
      const gradeLessons = CurriculumService.getLessons(p.grade);
      expect(gradeLessons.length).toBeGreaterThan(0);

      // Verify that the subject area is supported in CTGDPT 2018
      const hasSubjectMatch = gradeLessons.some(l => l.subjectArea === p.subject_area);
      expect(hasSubjectMatch).toBe(true);
    });
  });

  it('should validate all international contexts have valid grade and subject mapping', () => {
    expect(internationalContexts.length).toBeGreaterThan(0);
    internationalContexts.forEach(c => {
      expect(allowedGrades).toContain(c.grade);
      expect(c.organization).toBeDefined();
      expect(c.adapted_context).toBeDefined();
      expect(c.adapted_context.length).toBeGreaterThan(20);
      expect(c.license).toBeDefined();
    });
  });

  it('should detect and flag invalid or missing curriculum mapping without inventing data', () => {
    const auditRecord = (item: {
      grade?: any;
      subject_area?: any;
      curriculum_alignment?: any;
    }) => {
      const issues: string[] = [];
      if (!allowedGrades.includes(item.grade)) {
        issues.push('UNSUPPORTED_GRADE');
      }
      if (!allowedSubjectAreas.includes(item.subject_area)) {
        issues.push('UNSUPPORTED_SUBJECT_AREA');
      }
      if (!item.curriculum_alignment || item.curriculum_alignment.trim().length < 5) {
        issues.push('MISSING_YCCD_MAPPING');
      }
      return {
        status: issues.length > 0 ? 'NEEDS_VERIFICATION' : 'VERIFIED',
        issues
      };
    };

    // Valid item
    const validAudit = auditRecord(phenomena[0]);
    expect(validAudit.status).toBe('VERIFIED');
    expect(validAudit.issues.length).toBe(0);

    // Invalid item (Grade 10, invalid subject)
    const invalidAudit = auditRecord({
      grade: 10,
      subject_area: 'GEOGRAPHY',
      curriculum_alignment: ''
    });
    expect(invalidAudit.status).toBe('NEEDS_VERIFICATION');
    expect(invalidAudit.issues).toContain('UNSUPPORTED_GRADE');
    expect(invalidAudit.issues).toContain('UNSUPPORTED_SUBJECT_AREA');
    expect(invalidAudit.issues).toContain('MISSING_YCCD_MAPPING');
  });

  it('should verify uniqueness of phenomenon identifiers', () => {
    const ids = phenomena.map(p => p.phenomenon_id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});
