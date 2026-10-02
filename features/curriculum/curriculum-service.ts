import { localDb } from '@/database/local-db';
import { GradeLevel, Semester, Lesson, Chapter, SubjectArea, ContentDomain } from '@/types/curriculum';

export class CurriculumService {
  /**
   * Get all grades available (6, 7, 8, 9)
   */
  public static getGrades() {
    return localDb.getGrades();
  }

  /**
   * Get chapters for a grade and semester
   */
  public static getChapters(grade: GradeLevel, semester?: Semester): Chapter[] {
    return localDb.getChapters(grade, semester);
  }

  /**
   * Get lessons for a grade and semester
   */
  public static getLessons(grade: GradeLevel, semester?: Semester): Lesson[] {
    return localDb.getLessons(grade, semester);
  }

  /**
   * Get a specific lesson by id
   */
  public static getLessonById(lessonId: string): Lesson | undefined {
    return localDb.getLessonById(lessonId);
  }

  /**
   * Get multiple lessons by ids
   */
  public static getLessonsByIds(lessonIds: string[]): Lesson[] {
    return lessonIds
      .map(id => localDb.getLessonById(id))
      .filter((l): l is Lesson => !!l);
  }

  /**
   * Calculate domain summary (periods and percentages) for a list of selected lessons
   */
  public static calculateDomainSummary(lessons: Lesson[]) {
    let totalPeriods = 0;
    let physicsPeriods = 0;
    let chemistryPeriods = 0;
    let biologyPeriods = 0;
    let integratedPeriods = 0;

    lessons.forEach(l => {
      totalPeriods += l.periods;
      if (l.subjectArea === 'PHYSICS' || l.contentDomain === 'ENERGY_CHANGE' || l.contentDomain === 'EARTH_SPACE') {
        physicsPeriods += l.periods;
      } else if (l.subjectArea === 'CHEMISTRY' || l.contentDomain === 'SUBSTANCE_CHANGE') {
        chemistryPeriods += l.periods;
      } else if (l.subjectArea === 'BIOLOGY' || l.contentDomain === 'LIVING_THINGS') {
        biologyPeriods += l.periods;
      } else {
        integratedPeriods += l.periods;
      }
    });

    // Distribute integrated intro periods proportionally if any
    if (integratedPeriods > 0 && totalPeriods > integratedPeriods) {
      const remainingTotal = physicsPeriods + chemistryPeriods + biologyPeriods;
      if (remainingTotal > 0) {
        physicsPeriods += Math.round((physicsPeriods / remainingTotal) * integratedPeriods);
        chemistryPeriods += Math.round((chemistryPeriods / remainingTotal) * integratedPeriods);
        biologyPeriods = totalPeriods - physicsPeriods - chemistryPeriods;
      }
    }

    return {
      totalPeriods,
      physics: {
        periods: physicsPeriods,
        ratio: totalPeriods > 0 ? physicsPeriods / totalPeriods : 0,
        percentage: totalPeriods > 0 ? Math.round((physicsPeriods / totalPeriods) * 100) : 0
      },
      chemistry: {
        periods: chemistryPeriods,
        ratio: totalPeriods > 0 ? chemistryPeriods / totalPeriods : 0,
        percentage: totalPeriods > 0 ? Math.round((chemistryPeriods / totalPeriods) * 100) : 0
      },
      biology: {
        periods: biologyPeriods,
        ratio: totalPeriods > 0 ? biologyPeriods / totalPeriods : 0,
        percentage: totalPeriods > 0 ? Math.round((biologyPeriods / totalPeriods) * 100) : 0
      }
    };
  }
}
