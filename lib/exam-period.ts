export function resolveExamPeriod(matrixOrTest?: {
  assessmentType?: string;
  semester?: string | number;
  title?: string;
} | null): string {
  if (!matrixOrTest) return 'GIỮA HK1';
  if (matrixOrTest.assessmentType === 'MID_TERM_1') return 'GIỮA HK1';
  if (matrixOrTest.assessmentType === 'FINAL_TERM_1') return 'CUỐI HK1';
  if (matrixOrTest.assessmentType === 'MID_TERM_2') return 'GIỮA HK2';
  if (matrixOrTest.assessmentType === 'FINAL_TERM_2') return 'CUỐI HK2';

  const titleUpper = (matrixOrTest.title || '').toUpperCase();
  if (titleUpper.includes('GIỮA HK1') || titleUpper.includes('GIỮA HỌC KÌ 1') || titleUpper.includes('GIỮA HỌC KÌ I')) return 'GIỮA HK1';
  if (titleUpper.includes('CUỐI HK1') || titleUpper.includes('CUỐI HỌC KÌ 1') || titleUpper.includes('CUỐI HỌC KÌ I')) return 'CUỐI HK1';
  if (titleUpper.includes('GIỮA HK2') || titleUpper.includes('GIỮA HỌC KÌ 2') || titleUpper.includes('GIỮA HỌC KÌ II')) return 'GIỮA HK2';
  if (titleUpper.includes('CUỐI HK2') || titleUpper.includes('CUỐI HỌC KÌ 2') || titleUpper.includes('CUỐI HỌC KÌ II')) return 'CUỐI HK2';

  if (matrixOrTest.semester === 'HK2' || matrixOrTest.semester === '2' || matrixOrTest.semester === 2) return 'GIỮA HK2';
  return 'GIỮA HK1';
}
