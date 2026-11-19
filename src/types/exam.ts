export type SubjectId =
  | 'anayasa'
  | 'kgy'
  | 'turkce'
  | 'matematik'
  | 'genel_kultur';

export type OptionKey = 'A' | 'B' | 'C' | 'D' | 'E';

export type QuestionSource = 'khk_pdf' | 'mevzuat_hazirlik';

export type QuestionRichBlock =
  | { type: 'text'; content: string }
  | { type: 'math_id'; id: 'mat_1' | 'mat_2' | 'mat_3' | 'mat_4' | 'mat_5' | 'mat_7' | 'mat_13' | 'mat_14' | 'mat_15' }
  | { type: 'matchstick_grid'; rows: number; cols: number }
  | { type: 'numbered_lines'; lines: string[] };

export interface QuestionOption {
  key: OptionKey;
  text: string;
  /** Optional substring inside `text` to underline (e.g. Türkçe Q14) */
  underlineWord?: string;
  /** Optional rich mathematical rendering key for option */
  mathId?:
    | 'sqrt_13'
    | 'sqrt_35'
    | 'cyc_a'
    | 'cyc_b'
    | 'cyc_c'
    | 'cyc_d'
    | 'cyc_e'
    | 'exp_m1'
    | 'exp_m4'
    | 'exp_m2'
    | 'exp_m3'
    | 'int_a'
    | 'int_b'
    | 'int_c'
    | 'int_d'
    | 'int_e';
}

export interface Question {
  id: string;
  subject: SubjectId;
  subtopic: string;
  source: QuestionSource;
  pdfNumber?: number;
  isAdvanced?: boolean;
  advancedNote?: string;
  /** Introductory passage, premise, or math block shown above the bold question stem */
  passage?: string;
  richBlock?: QuestionRichBlock;
  /** The bold question stem (e.g. "işleminin sonucu kaça eşittir?") */
  stem: string;
  /** Optional word inside stem to underline (e.g. "getirilemez", "yanlışı") */
  stemUnderline?: string;
  options: QuestionOption[];
  correctAnswer: OptionKey;
  /** Step-by-step explanation lines shown in the evaluation screen */
  explanationSteps: string[];
  /** Concise key takeaway or legal reference */
  referenceNote?: string;
}

export interface SubjectMeta {
  id: SubjectId;
  name: string;
  shortName: string;
  officialWeightPercent: number;
  officialQuestionCount: number;
  description: string;
}

export interface ExamConfig {
  selectedSubjects: SubjectId[];
  questionCount: number;
  durationMinutes: number; // 0 means untimed (Süresiz)
  balancedOfficialDistribution: boolean;
  officialPdfOnly: boolean;
  includeAdvancedMath: boolean;
  shuffleQuestions: boolean;
}

export interface ExamPreset {
  id: string;
  title: string;
  subtitle: string;
  summaryLine: string;
  config: ExamConfig;
}

export interface QuestionReviewItem {
  index: number;
  question: Question;
  selectedOption: OptionKey | null;
  status: 'correct' | 'wrong' | 'blank';
  wasFlagged: boolean;
}

export interface SubjectAnalysis {
  subject: SubjectId;
  name: string;
  total: number;
  correct: number;
  wrong: number;
  blank: number;
  accuracyPercent: number;
  earnedPoints: number;
  maxPoints: number;
}

export interface SubtopicAnalysis {
  subject: SubjectId;
  subjectName: string;
  subtopic: string;
  total: number;
  wrongOrBlank: number;
  correct: number;
  accuracyPercent: number;
}

export interface ExamResult {
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  blankCount: number;
  scoreOutOf100: number;
  pointsPerQuestion: number;
  passed: boolean;
  passThreshold: number;
  elapsedSeconds: number;
  configuredDurationMinutes: number;
  subjectBreakdown: SubjectAnalysis[];
  weakSubtopics: SubtopicAnalysis[];
  items: QuestionReviewItem[];
}
