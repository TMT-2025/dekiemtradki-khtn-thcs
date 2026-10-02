import { GradeLevel, Semester, SubjectArea, ContentDomain, CognitiveLevel } from './curriculum';

// Section 6: Context Scope
export type ContextScope = 'PERSONAL' | 'FAMILY_SCHOOL' | 'LOCAL' | 'NATIONAL' | 'GLOBAL';
export type ContextType = ContextScope; // Backward compatibility alias

// Section 7: Application Domain
export type ApplicationDomain =
  | 'HEALTH'
  | 'ENVIRONMENT'
  | 'NATURAL_RESOURCES'
  | 'ENERGY'
  | 'FOOD'
  | 'AGRICULTURE'
  | 'MATERIALS'
  | 'WATER'
  | 'AIR'
  | 'CLIMATE'
  | 'HAZARDS'
  | 'TECHNOLOGY'
  | 'SPACE'
  | 'BIODIVERSITY'
  | 'SAFETY'
  | 'DAILY_LIFE'
  | 'SCIENTIFIC_RESEARCH';
export type ApplicationArea = ApplicationDomain; // Backward compatibility alias

// Section 8: Context Complexity
export type ContextComplexity = 'C1' | 'C2' | 'C3' | 'C4';
export type ContextLevel = ContextComplexity; // Backward compatibility alias

// Section 9: Cognitive Level Code
export type CognitiveLevelCode = 'M1_NB' | 'M2_TH' | 'M3_VD' | 'M4_VDC';

// Section 13: Stimulus Type
export type StimulusType =
  | 'TEXT'
  | 'TABLE'
  | 'CHART'
  | 'GRAPH'
  | 'IMAGE'
  | 'DIAGRAM'
  | 'EXPERIMENT'
  | 'RESEARCH_ABSTRACT'
  | 'OBSERVATION'
  | 'DATASET'
  | 'NEWS_SCENARIO'
  | 'MULTI_SOURCE';

export type ScientificPractice =
  | 'Identify variables'
  | 'Formulate hypothesis'
  | 'Interpret data'
  | 'Evaluate conclusion'
  | 'Identify errors/limitations'
  | 'Design experiment'
  | 'Apply science knowledge'
  | 'Assess reliability';

export type InternationalSourceType = 'INSPIRED_BY' | 'ADAPTED_FROM' | 'DIRECT_SOURCE';
export type SourceMode = InternationalSourceType;

export type LicenseStatus = 'OPEN_LICENSE' | 'PUBLIC_DOMAIN' | 'PERMISSION_REQUIRED' | 'UNKNOWN';
export type VerificationStatus = 'UNVERIFIED' | 'VERIFIED';
export type LocalizationStatus = 'NOT_LOCALIZED' | 'LOCALIZED' | 'VERIFIED' | 'ORIGINAL_VIETNAM' | 'INTERNATIONAL_ADAPTED' | 'INSPIRED_BY';
export type PhenomenonQualityStatus = 'DRAFT' | 'VERIFIED' | 'APPROVED' | 'REJECTED';
export type ContextStatus = 'DRAFT' | 'AI_GENERATED' | 'NEEDS_REVIEW' | 'VERIFIED' | 'APPROVED' | 'REJECTED' | 'ARCHIVED';

// Section 14: Data Table
export interface DataTableColumn {
  key: string;
  label: string;
  unit?: string;
  type: 'NUMBER' | 'TEXT' | 'DATE';
}

export interface DataTable {
  id: string;
  columns: DataTableColumn[];
  rows: Record<string, string | number>[];
  source?: string;
  isSynthetic: boolean;
  scientificBasis?: string;
}

// Section 15: Experiment Design
export interface ExperimentDesign {
  researchQuestion: string;
  hypothesis?: string;
  independentVariable?: string;
  dependentVariable?: string;
  controlledVariables: string[];
  controlGroup?: string;
  experimentalGroup?: string;
  materials?: string[];
  procedure?: string[];
  measurements?: string[];
  expectedData?: DataTable;
  limitations?: string[];
  safetyNotes?: string[];
}

export interface SourceReference {
  id?: string;
  organization: string;
  title: string;
  url?: string;
  sourceDate?: string;
  sourceMode: SourceMode;
  licenseStatus: LicenseStatus;
  attributionRequired: boolean;
  verificationStatus: VerificationStatus;
  verifiedAt?: string;
  notes?: string;
}

export interface CurriculumLink {
  grade: GradeLevel;
  subjectArea: SubjectArea;
  contentDomain?: ContentDomain;
  learningRequirementId?: string;
  learningRequirementText: string;
  topic: string;
}

export interface StimulusContent {
  type: StimulusType;
  title: string;
  leadParagraph: string;
  dataHeaders?: string[];
  dataRows?: (string | number)[][];
  chartLabels?: string[];
  chartValues?: number[];
  chartType?: 'bar' | 'line';
  diagramDescription?: string;
  isSynthetic?: boolean;
  experimentSetup?: {
    hypothesis?: string;
    independentVariable?: string;
    dependentVariable?: string;
    controlVariables?: string[];
    procedureSteps?: string[];
  };
}

export interface Stimulus {
  id: string;
  contextId: string;
  type: StimulusType;
  title?: string;
  content: string;
  data?: DataTable[];
  experiment?: ExperimentDesign;
  readingLoad?: 'LOW' | 'MEDIUM' | 'HIGH';
  sourceRefs: SourceReference[];
  isSynthetic?: boolean;
  localizationStatus: LocalizationStatus;
  qualityStatus: 'DRAFT' | 'PASSED' | 'FAILED';
}

// Section 10: Phenomenon Library Item
export interface PhenomenonItem {
  phenomenon_id: string; // compatibility key
  id?: string;
  title: string;
  description: string;
  grade: GradeLevel; // singular compatibility
  grades?: number[];
  topic: string;
  subject_area: SubjectArea; // singular compatibility
  subjectAreas?: SubjectArea[];
  content_domain: ContentDomain;
  context_type: ContextScope;
  contextScopes?: ContextScope[];
  application_area: ApplicationDomain;
  applicationDomains?: ApplicationDomain[];
  context_level: ContextComplexity;
  complexity?: ContextComplexity;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  stimulus?: StimulusContent;
  source: string;
  source_url?: string;
  source_country?: string;
  source_language?: string;
  age_range: string; // e.g. "11-12 tuổi"
  curriculum_alignment: string;
  curriculumLinks?: CurriculumLink[];
  scientificConcepts?: string[];
  keywords?: string[];
  phenomenonType?: 'DAILY_LIFE' | 'NATURAL_PHENOMENON' | 'EXPERIMENT' | 'RESEARCH' | 'ENVIRONMENT' | 'TECHNOLOGY' | 'HEALTH' | 'DATA_BASED';
  recommendedStimulusTypes?: StimulusType[];
  sourceRefs?: SourceReference[];
  localizationStatus?: LocalizationStatus;
  qualityStatus?: PhenomenonQualityStatus;
  createdAt?: string;
  updatedAt?: string;
}

export type Phenomenon = PhenomenonItem;

// Section 11: International Context
export interface InternationalContextItem {
  id: string;
  title: string;
  country: string;
  organization: string; // PISA, NASA, NOAA, WHO, UNESCO, etc.
  url: string;
  source_url?: string;
  sourceUrl?: string;
  source_type: InternationalSourceType;
  sourceMode?: SourceMode;
  sourceDate?: string;
  topic?: string;
  scientific_topic?: string;
  curriculum_alignment?: string;
  grade: GradeLevel;
  grades?: number[];
  age_range: string;
  description: string;
  original_language: string;
  translated_text: string;
  adapted_context: string;
  application_area: ApplicationDomain;
  context_type: ContextScope;
  context_level: ContextComplexity;
  license: string;
  licenseStatus?: LicenseStatus;
  copyright_status: string;
  attributionRequired?: boolean;
  localizationStatus?: LocalizationStatus;
  localizedContext?: string;
  verified: boolean;
  verificationStatus?: VerificationStatus;
  verifiedBy?: string;
  verifiedAt?: string;
  date_checked: string;
  notes?: string;
}

export type InternationalContext = InternationalContextItem;

// Section 18 & 19: 10 Criteria Context Quality Gate
export type QualityCriterionId =
  | 'QG01'
  | 'QG02'
  | 'QG03'
  | 'QG04'
  | 'QG05'
  | 'QG06'
  | 'QG07'
  | 'QG08'
  | 'QG09'
  | 'QG10';

export interface ContextQualityCriterionResult {
  criterionId: QualityCriterionId;
  criterionName: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  message: string;
  evidence?: string;
}

export interface DetailedQualityGateResult {
  status: 'PASS' | 'FAIL' | 'WARNING';
  score: number; // 0 - 100
  checks: ContextQualityCriterionResult[];
  blockingIssues: string[];
  warnings: string[];
  reviewedAt: string;
  passed: boolean;
}

// Backward compatibility for basic check
export interface ContextQualityCheckResult {
  scientificAccuracy: boolean;
  curriculumAlignment: boolean;
  ageAppropriateness: boolean;
  realWorldRelevance: boolean;
  contextNecessity: boolean;
  dataValidity: boolean;
  languageClarity: boolean;
  culturalAppropriateness: boolean;
  cognitiveAppropriateness: boolean;
  sourceReliability: boolean;
  score: number;
  passed: boolean;
  issues: string[];
  detailed?: DetailedQualityGateResult;
}

// Section 22: Context Traceability
export interface ContextTrace {
  questionId: string;
  stimulusId?: string;
  contextId: string;
  phenomenonId?: string;
  sourceRefs: string[];
  learningRequirementId: string;
  specificationId: string;
  matrixCellId: string;
  testId?: string;
}

// Section 30: Diversity Report
export interface DiversityReport {
  scopeDistribution: Record<string, number>;
  domainDistribution: Record<string, number>;
  complexityDistribution: Record<string, number>;
  stimulusDistribution: Record<string, number>;
  repeatedPhenomena: string[];
  repeatedSources: string[];
  diversityWarnings: string[];
}

// Section 40: Configurable Rule Engine
export interface ContextRulesConfig {
  contextTargetDefault: number;
  allowedContextPercentages: number[];
  requireSourceForInternational: boolean;
  requireQualityGateForQuestion: boolean;
  allowSyntheticData: boolean;
  requireSyntheticDataLabel: boolean;
  requireHumanApproval: boolean;
}

export interface ContextMetadata {
  hasContext: boolean;
  contextId?: string;
  contextType?: ContextScope;
  contextLevel?: ContextComplexity;
  applicationArea?: ApplicationDomain;
  phenomenon?: string;
  stimulus?: StimulusContent;
  realWorldRelevance?: boolean;
  scientificPractice?: ScientificPractice;
  sourceType?: InternationalSourceType;
  sourceUrl?: string;
  sourceTitle?: string;
  sourceOrganization?: string;
  sourceCountry?: string;
  adaptationNote?: string;
  isSyntheticData?: boolean;
  trace?: ContextTrace;
}

export interface ContextReport {
  totalQuestions: number;
  contextQuestions: number;
  nonContextQuestions: number;
  contextPercentage: number;
  targetContextPercentage: number;
  breakdownByArea: Record<string, number>;
  breakdownByLevel: Record<string, number>;
  breakdownByComplexity: Record<string, number>;
  crossAnalysis?: {
    scopeByCognitive: Record<string, Record<string, number>>;
    domainByCognitive: Record<string, Record<string, number>>;
    complexityByCognitive: Record<string, Record<string, number>>;
    questionTypeByContext: Record<string, { context: number; nonContext: number }>;
  };
  diversityReport?: DiversityReport;
  qualityStatus: 'PASS' | 'WARNING' | 'FAIL';
  feedbackNotes: string[];
}
