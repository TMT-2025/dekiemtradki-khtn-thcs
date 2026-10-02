import { AssessmentMatrix } from '@/types/matrix';
import { TestSpecification } from '@/types/specification';
import { TestExam } from '@/types/test';

const STORAGE_KEYS = {
  MATRICES: 'khtn_saved_matrices',
  SPECIFICATIONS: 'khtn_saved_specifications',
  TESTS: 'khtn_saved_tests',
  ACTIVE_MATRIX_ID: 'khtn_active_matrix_id'
};

function safeGetItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch (e) {
    console.error(`Error reading ${key} from localStorage`, e);
    return defaultValue;
  }
}

function safeSetItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving ${key} to localStorage`, e);
  }
}

export const ClientStorage = {
  // --- Matrices ---
  getSavedMatrices(): AssessmentMatrix[] {
    return safeGetItem<AssessmentMatrix[]>(STORAGE_KEYS.MATRICES, []);
  },

  getMatrixById(id: string): AssessmentMatrix | undefined {
    const list = this.getSavedMatrices();
    return list.find(m => m.id === id);
  },

  saveMatrix(matrix: AssessmentMatrix): void {
    const list = this.getSavedMatrices();
    const idx = list.findIndex(m => m.id === matrix.id);
    if (idx >= 0) {
      list[idx] = matrix;
    } else {
      list.unshift(matrix); // Latest first
    }
    safeSetItem(STORAGE_KEYS.MATRICES, list);
    this.setActiveMatrixId(matrix.id);
  },

  deleteMatrix(id: string): void {
    const list = this.getSavedMatrices().filter(m => m.id !== id);
    safeSetItem(STORAGE_KEYS.MATRICES, list);
  },

  getActiveMatrixId(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_MATRIX_ID);
  },

  setActiveMatrixId(id: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.ACTIVE_MATRIX_ID, id);
  },

  // --- Specifications ---
  getSavedSpecifications(): TestSpecification[] {
    return safeGetItem<TestSpecification[]>(STORAGE_KEYS.SPECIFICATIONS, []);
  },

  getSpecificationByMatrixId(matrixId: string): TestSpecification | undefined {
    return this.getSavedSpecifications().find(s => s.matrixId === matrixId);
  },

  saveSpecification(spec: TestSpecification): void {
    const list = this.getSavedSpecifications();
    const idx = list.findIndex(s => s.id === spec.id);
    if (idx >= 0) {
      list[idx] = spec;
    } else {
      list.unshift(spec);
    }
    safeSetItem(STORAGE_KEYS.SPECIFICATIONS, list);
  },

  // --- Tests ---
  getSavedTests(): TestExam[] {
    return safeGetItem<TestExam[]>(STORAGE_KEYS.TESTS, []);
  },

  getTestById(id: string): TestExam | undefined {
    return this.getSavedTests().find(t => t.id === id);
  },

  saveTest(test: TestExam): void {
    const list = this.getSavedTests();
    const idx = list.findIndex(t => t.id === test.id);
    if (idx >= 0) {
      list[idx] = test;
    } else {
      list.unshift(test);
    }
    safeSetItem(STORAGE_KEYS.TESTS, list);
  }
};
