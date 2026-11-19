import type {
  ExamConfig,
  ExamPreset,
  ExamResult,
  OptionKey,
  Question,
  QuestionReviewItem,
  SubjectAnalysis,
  SubjectId,
  SubjectMeta,
  SubtopicAnalysis,
} from '../types/exam';
import { ANAYASA_QUESTIONS } from './questionsAnayasa';
import { GENEL_KULTUR_QUESTIONS } from './questionsGenelKultur';
import { KGY_QUESTIONS } from './questionsKgy';
import { MATEMATIK_QUESTIONS } from './questionsMatematik';
import { TURKCE_QUESTIONS } from './questionsTurkce';

export const SUBJECT_ORDER: SubjectId[] = [
  'anayasa',
  'kgy',
  'turkce',
  'matematik',
  'genel_kultur',
];

export const SUBJECT_META: Record<SubjectId, SubjectMeta> = {
  anayasa: {
    id: 'anayasa',
    name: 'Anayasa',
    shortName: 'Anayasa',
    officialWeightPercent: 20,
    officialQuestionCount: 10,
    description: '1985 KKTC Anayasası, temel haklar, yasama, yürütme ve yargı',
  },
  kgy: {
    id: 'kgy',
    name: 'Kamu Görevlileri Yasası',
    shortName: 'K. Görevlileri Yasası',
    officialWeightPercent: 20,
    officialQuestionCount: 10,
    description: '7/1979 Sayılı Yasa, adaylık, izinler, yasaklar ve disiplin',
  },
  turkce: {
    id: 'turkce',
    name: 'Türkçe',
    shortName: 'Türkçe',
    officialWeightPercent: 20,
    officialQuestionCount: 10,
    description: 'KHK resmi örnek soruları · paragraf, anlam, yazım ve noktalama',
  },
  matematik: {
    id: 'matematik',
    name: 'Matematik',
    shortName: 'Matematik',
    officialWeightPercent: 20,
    officialQuestionCount: 10,
    description: 'KHK resmi örnek soruları · işlemler, denklemler ve problemler',
  },
  genel_kultur: {
    id: 'genel_kultur',
    name: 'Genel Kültür',
    shortName: 'Genel Kültür',
    officialWeightPercent: 20,
    officialQuestionCount: 10,
    description: 'KHK resmi örnek soruları · Kıbrıs tarihi, coğrafyası ve kültürü',
  },
};

export const ALL_QUESTIONS: Question[] = [
  ...ANAYASA_QUESTIONS,
  ...KGY_QUESTIONS,
  ...TURKCE_QUESTIONS,
  ...MATEMATIK_QUESTIONS,
  ...GENEL_KULTUR_QUESTIONS,
];

export const PASS_THRESHOLD = 60;

export const EXAM_PRESETS: ExamPreset[] = [
  {
    id: 'official_alt_duzey',
    title: 'Resmi Alt Düzey Simülasyonu',
    subtitle: 'Yeterlik Sınav Tüzüğü tablosuna birebir uyumlu tam deneme',
    summaryLine: '50 Soru · 75 Dakika · 5 Ders (%20 Eşit Dağılım)',
    config: {
      selectedSubjects: ['anayasa', 'kgy', 'turkce', 'matematik', 'genel_kultur'],
      questionCount: 50,
      durationMinutes: 75,
      balancedOfficialDistribution: true,
      officialPdfOnly: false,
      includeAdvancedMath: false,
      shuffleQuestions: false,
    },
  },
  {
    id: 'official_pdfs',
    title: 'Sadece Ekli KHK Örnek Soruları',
    subtitle: 'Türkçe, Matematik (Alt Düzey) ve Genel Kültür PDF kitapçıkları',
    summaryLine: '37 Soru · 55 Dakika · 3 Resmi PDF Kitapçığı',
    config: {
      selectedSubjects: ['turkce', 'matematik', 'genel_kultur'],
      questionCount: 37,
      durationMinutes: 55,
      balancedOfficialDistribution: false,
      officialPdfOnly: true,
      includeAdvancedMath: false,
      shuffleQuestions: false,
    },
  },
  {
    id: 'quick_drill',
    title: 'Hızlı Tarama Denemesi',
    subtitle: 'Tüm derslerden dengeli kısa tekrar oturumu',
    summaryLine: '25 Soru · 35 Dakika · Her Dersten 5 Soru',
    config: {
      selectedSubjects: ['anayasa', 'kgy', 'turkce', 'matematik', 'genel_kultur'],
      questionCount: 25,
      durationMinutes: 35,
      balancedOfficialDistribution: true,
      officialPdfOnly: false,
      includeAdvancedMath: false,
      shuffleQuestions: true,
    },
  },
];

function shuffleArray<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function getAvailableQuestions(
  selectedSubjects: SubjectId[],
  officialPdfOnly: boolean,
  includeAdvancedMath: boolean
): Question[] {
  return ALL_QUESTIONS.filter((q) => {
    if (!selectedSubjects.includes(q.subject)) return false;
    if (officialPdfOnly && q.source !== 'khk_pdf') return false;
    if (!includeAdvancedMath && q.isAdvanced) return false;
    return true;
  });
}

export function getSubjectAvailableCount(
  subject: SubjectId,
  officialPdfOnly: boolean,
  includeAdvancedMath: boolean
): number {
  return ALL_QUESTIONS.filter((q) => {
    if (q.subject !== subject) return false;
    if (officialPdfOnly && q.source !== 'khk_pdf') return false;
    if (!includeAdvancedMath && q.isAdvanced) return false;
    return true;
  }).length;
}

/**
 * Selects questions cleanly according to ExamConfig.
 * In balanced mode, distributes evenly across selected subjects while
 * prioritizing official KHK PDF questions first.
 */
export function buildExamQuestions(config: ExamConfig): Question[] {
  const orderedSubjects = SUBJECT_ORDER.filter((s) =>
    config.selectedSubjects.includes(s)
  );
  const available = getAvailableQuestions(
    orderedSubjects,
    config.officialPdfOnly,
    config.includeAdvancedMath
  );

  const targetCount = Math.min(config.questionCount, available.length);
  if (targetCount === 0) return [];

  // Group by subject, putting khk_pdf questions first (and optionally shuffling within source tier)
  const buckets = new Map<SubjectId, Question[]>();
  for (const subject of orderedSubjects) {
    const subQuestions = available.filter((q) => q.subject === subject);
    const pdfPart = subQuestions.filter((q) => q.source === 'khk_pdf');
    const extraPart = subQuestions.filter((q) => q.source !== 'khk_pdf');

    const prepared = config.shuffleQuestions
      ? [...shuffleArray(pdfPart), ...shuffleArray(extraPart)]
      : [...pdfPart, ...extraPart];
    buckets.set(subject, prepared);
  }

  const chosen: Question[] = [];

  if (config.balancedOfficialDistribution) {
    const activeSubjects = orderedSubjects.filter(
      (s) => (buckets.get(s)?.length ?? 0) > 0
    );
    const quotas = new Map<SubjectId, number>();
    let remaining = targetCount;

    // Distribute round-robin up to each bucket's capacity
    const baseShare = Math.floor(targetCount / Math.max(activeSubjects.length, 1));
    for (const s of activeSubjects) {
      const cap = buckets.get(s)?.length ?? 0;
      const take = Math.min(baseShare, cap);
      quotas.set(s, take);
      remaining -= take;
    }

    let safety = 0;
    while (remaining > 0 && safety < 200) {
      safety++;
      let progressed = false;
      for (const s of activeSubjects) {
        if (remaining <= 0) break;
        const cap = buckets.get(s)?.length ?? 0;
        const curr = quotas.get(s) ?? 0;
        if (curr < cap) {
          quotas.set(s, curr + 1);
          remaining--;
          progressed = true;
        }
      }
      if (!progressed) break;
    }

    for (const s of activeSubjects) {
      const take = quotas.get(s) ?? 0;
      const list = buckets.get(s) ?? [];
      chosen.push(...list.slice(0, take));
    }
  } else {
    // Non-balanced: preserve subject sections cleanly up to targetCount
    let list: Question[] = [];
    for (const s of orderedSubjects) {
      list.push(...(buckets.get(s) ?? []));
    }
    if (config.shuffleQuestions) {
      list = shuffleArray(list);
    }
    chosen.push(...list.slice(0, targetCount));
  }

  // Always keep booklet sections grouped in official subject order (like a real KHK exam booklet)
  // unless user specifically enabled shuffle across the whole non-balanced pool
  if (config.balancedOfficialDistribution || !config.shuffleQuestions) {
    const subjectRank = (s: SubjectId) => SUBJECT_ORDER.indexOf(s);
    chosen.sort((a, b) => subjectRank(a.subject) - subjectRank(b.subject));
  }

  return chosen;
}

export function evaluateExam(
  questions: Question[],
  answers: Record<string, OptionKey>,
  flaggedIds: Set<string>,
  elapsedSeconds: number,
  configuredDurationMinutes: number
): ExamResult {
  const totalQuestions = questions.length;
  const pointsPerQuestion = totalQuestions > 0 ? 100 / totalQuestions : 0;

  let correctCount = 0;
  let wrongCount = 0;
  let blankCount = 0;

  const items: QuestionReviewItem[] = questions.map((question, idx) => {
    const selectedOption = answers[question.id] ?? null;
    let status: 'correct' | 'wrong' | 'blank' = 'blank';
    if (selectedOption === null) {
      blankCount++;
      status = 'blank';
    } else if (selectedOption === question.correctAnswer) {
      correctCount++;
      status = 'correct';
    } else {
      wrongCount++;
      status = 'wrong';
    }

    return {
      index: idx + 1,
      question,
      selectedOption,
      status,
      wasFlagged: flaggedIds.has(question.id),
    };
  });

  // Scoring rule: No negative marking; every question is equal out of 100
  const scoreOutOf100 =
    totalQuestions > 0
      ? Math.round((correctCount / totalQuestions) * 10000) / 100
      : 0;

  // Subject breakdown
  const subjectBreakdown: SubjectAnalysis[] = [];
  for (const subject of SUBJECT_ORDER) {
    const subItems = items.filter((it) => it.question.subject === subject);
    if (subItems.length === 0) continue;

    const correct = subItems.filter((it) => it.status === 'correct').length;
    const wrong = subItems.filter((it) => it.status === 'wrong').length;
    const blank = subItems.filter((it) => it.status === 'blank').length;
    const accuracyPercent = Math.round((correct / subItems.length) * 100);

    subjectBreakdown.push({
      subject,
      name: SUBJECT_META[subject].name,
      total: subItems.length,
      correct,
      wrong,
      blank,
      accuracyPercent,
      earnedPoints: Math.round(correct * pointsPerQuestion * 100) / 100,
      maxPoints: Math.round(subItems.length * pointsPerQuestion * 100) / 100,
    });
  }

  // Subtopic weakness breakdown (grouped by subject + subtopic)
  const subtopicMap = new Map<string, SubtopicAnalysis>();
  for (const item of items) {
    const key = `${item.question.subject}::${item.question.subtopic}`;
    const existing = subtopicMap.get(key) ?? {
      subject: item.question.subject,
      subjectName: SUBJECT_META[item.question.subject].name,
      subtopic: item.question.subtopic,
      total: 0,
      wrongOrBlank: 0,
      correct: 0,
      accuracyPercent: 0,
    };

    existing.total += 1;
    if (item.status === 'correct') {
      existing.correct += 1;
    } else {
      existing.wrongOrBlank += 1;
    }
    existing.accuracyPercent = Math.round(
      (existing.correct / existing.total) * 100
    );
    subtopicMap.set(key, existing);
  }

  const weakSubtopics = Array.from(subtopicMap.values())
    .filter((s) => s.wrongOrBlank > 0)
    .sort((a, b) => {
      if (b.wrongOrBlank !== a.wrongOrBlank) {
        return b.wrongOrBlank - a.wrongOrBlank;
      }
      return a.accuracyPercent - b.accuracyPercent;
    });

  return {
    totalQuestions,
    correctCount,
    wrongCount,
    blankCount,
    scoreOutOf100,
    pointsPerQuestion,
    passed: scoreOutOf100 >= PASS_THRESHOLD,
    passThreshold: PASS_THRESHOLD,
    elapsedSeconds,
    configuredDurationMinutes,
    subjectBreakdown,
    weakSubtopics,
    items,
  };
}

export function formatDuration(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hrs = Math.floor(safe / 3600);
  const mins = Math.floor((safe % 3600) / 60);
  const secs = safe % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  if (hrs > 0) {
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  }
  return `${pad(mins)}:${pad(secs)}`;
}
