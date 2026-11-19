import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  BookOpenCheck,
  CheckCircle2,
  CircleDashed,
  RotateCcw,
  SlidersHorizontal,
  XCircle,
} from 'lucide-react';
import { SUBJECT_META, formatDuration } from '../data/questionBank';
import type { ExamResult, Question, SubjectId } from '../types/exam';
import { MathOptionContent, RichQuestionBlock } from './MathContent';
import { TextWithUnderline } from './TextWithUnderline';

type StatusFilter = 'wrong_blank' | 'wrong' | 'blank' | 'correct' | 'all';

interface ExamReportProps {
  result: ExamResult;
  onRetryWrongQuestions: (wrongQuestions: Question[]) => void;
  onNewExam: () => void;
}

export function ExamReport({
  result,
  onRetryWrongQuestions,
  onNewExam,
}: ExamReportProps) {
  const hasErrorsOrBlanks = result.wrongCount + result.blankCount > 0;

  const [statusFilter, setStatusFilter] = useState<StatusFilter>(
    hasErrorsOrBlanks ? 'wrong_blank' : 'all'
  );
  const [subjectFilter, setSubjectFilter] = useState<SubjectId | 'all'>('all');
  const [subtopicFilter, setSubtopicFilter] = useState<string | null>(null);

  const wrongOrBlankQuestions = useMemo(
    () =>
      result.items
        .filter((it) => it.status === 'wrong' || it.status === 'blank')
        .map((it) => it.question),
    [result.items]
  );

  const filteredItems = useMemo(() => {
    return result.items.filter((item) => {
      if (statusFilter === 'wrong_blank') {
        if (item.status === 'correct') return false;
      } else if (statusFilter !== 'all' && item.status !== statusFilter) {
        return false;
      }
      if (subjectFilter !== 'all' && item.question.subject !== subjectFilter) {
        return false;
      }
      if (subtopicFilter && item.question.subtopic !== subtopicFilter) {
        return false;
      }
      return true;
    });
  }, [result.items, statusFilter, subjectFilter, subtopicFilter]);

  const formattedScore = result.scoreOutOf100.toFixed(2).replace('.', ',');
  const formattedPerQ = result.pointsPerQuestion.toFixed(2).replace('.', ',');

  const handleFocusSubtopic = (subject: SubjectId, subtopic: string) => {
    setStatusFilter('wrong_blank');
    setSubjectFilter(subject);
    setSubtopicFilter(subtopic);
    const el = document.getElementById('detailed-review-section');
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-desk py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1200px] mx-auto space-y-6">
        {/* 1. Official Exam Result Sheet */}
        <section className="exam-paper-sheet border border-rule">
          <header className="px-6 sm:px-10 pt-7 pb-5 border-b border-rule">
            <div className="border-t-2 border-b border-rule-strong py-2.5 text-center">
              <p className="font-serif text-xs font-semibold tracking-[0.14em] uppercase text-ink">
                Kuzey Kıbrıs Türk Cumhuriyeti · Kamu Hizmeti Komisyonu
              </p>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink mt-1">
                Sınav Değerlendirme ve Hata Analiz Belgesi
              </h1>
            </div>
          </header>

          {/* Primary Score & Outcome Row */}
          <div className="px-6 sm:px-10 py-7 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center border-b border-rule">
            <div className="lg:col-span-5">
              <p className="text-xs text-ink-muted font-medium">
                100 Üzerinden Toplam Puan (Her soru {formattedPerQ} puan · Yanlış
                doğruyu götürmez)
              </p>
              <div className="mt-2 flex items-baseline gap-3">
                <span className="font-mono text-5xl sm:text-6xl font-bold text-ink tabular-nums tracking-tight">
                  {formattedScore}
                </span>
                <span className="font-mono text-lg text-ink-muted tabular-nums">
                  / 100
                </span>
              </div>
              <div className="mt-3 flex items-center gap-2">
                {result.passed ? (
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-pass">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    Başarılı — Yeterlik Barajı ({result.passThreshold} puan)
                    geçildi
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-fail">
                    <XCircle className="w-4 h-4 shrink-0" />
                    Baraj Altı — Yeterlik için en az {result.passThreshold} puan
                    gereklidir
                  </span>
                )}
              </div>
            </div>

            {/* 4-Metric Strip */}
            <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 border border-rule divide-y sm:divide-y-0 sm:divide-x divide-rule bg-paper-muted/40">
              <div className="p-4">
                <p className="text-xs text-ink-muted">Doğru</p>
                <p className="font-mono text-2xl font-bold text-pass tabular-nums mt-1">
                  {result.correctCount}
                </p>
                <p className="text-[11px] text-ink-muted mt-0.5 tabular-nums">
                  %{Math.round((result.correctCount / Math.max(1, result.totalQuestions)) * 100)}
                </p>
              </div>
              <div className="p-4">
                <p className="text-xs text-ink-muted">Yanlış</p>
                <p className="font-mono text-2xl font-bold text-fail tabular-nums mt-1">
                  {result.wrongCount}
                </p>
                <p className="text-[11px] text-ink-muted mt-0.5 tabular-nums">
                  %{Math.round((result.wrongCount / Math.max(1, result.totalQuestions)) * 100)}
                </p>
              </div>
              <div className="p-4">
                <p className="text-xs text-ink-muted">Boş</p>
                <p className="font-mono text-2xl font-bold text-warn tabular-nums mt-1">
                  {result.blankCount}
                </p>
                <p className="text-[11px] text-ink-muted mt-0.5 tabular-nums">
                  %{Math.round((result.blankCount / Math.max(1, result.totalQuestions)) * 100)}
                </p>
              </div>
              <div className="p-4">
                <p className="text-xs text-ink-muted">Harcanan Süre</p>
                <p className="font-mono text-2xl font-bold text-ink tabular-nums mt-1">
                  {formatDuration(result.elapsedSeconds)}
                </p>
                <p className="text-[11px] text-ink-muted mt-0.5">
                  {result.configuredDurationMinutes > 0
                    ? `Limit: ${result.configuredDurationMinutes} dk`
                    : 'Süresiz'}
                </p>
              </div>
            </div>
          </div>

          {/* Primary Actions Bar */}
          <div className="px-6 sm:px-10 py-4 bg-paper-muted/45 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs sm:text-sm text-ink-secondary">
              {hasErrorsOrBlanks
                ? `Toplam ${result.wrongCount} yanlış ve ${result.blankCount} boş sorunun adım adım çözüm analizi aşağıda hazırlandı.`
                : 'Tebrikler, bu oturumdaki tüm soruları doğru yanıtladınız.'}
            </p>
            <div className="flex flex-wrap items-center gap-2.5">
              {wrongOrBlankQuestions.length > 0 && (
                <button
                  type="button"
                  onClick={() => onRetryWrongQuestions(wrongOrBlankQuestions)}
                  className="px-4 py-2 bg-navy hover:bg-navy-hover text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Yanlış ve Boş Sorularla Tekrar Dene (
                  {wrongOrBlankQuestions.length})
                </button>
              )}
              <button
                type="button"
                onClick={onNewExam}
                className="px-4 py-2 border border-rule bg-paper hover:bg-paper-muted text-ink text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Yeni Sınav Yapılandır
              </button>
            </div>
          </div>
        </section>

        {/* 2. Subject & Subtopic Diagnostic Breakdown */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Subject Breakdown Table */}
          <div className="lg:col-span-7 exam-paper-sheet border border-rule p-6 sm:p-8">
            <h2 className="font-serif text-lg font-bold text-ink pb-2.5 border-b border-rule-strong">
              Ders Bazlı Başarı Dağılımı
            </h2>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-rule text-xs text-ink-muted">
                    <th className="text-left font-medium py-2.5 pr-3">Ders</th>
                    <th className="text-right font-medium py-2.5 px-2">Soru</th>
                    <th className="text-right font-medium py-2.5 px-2">Doğru</th>
                    <th className="text-right font-medium py-2.5 px-2">Yanlış</th>
                    <th className="text-right font-medium py-2.5 px-2">Boş</th>
                    <th className="text-right font-medium py-2.5 pl-3">Başarı</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rule">
                  {result.subjectBreakdown.map((sub) => {
                    const isPass = sub.accuracyPercent >= result.passThreshold;
                    return (
                      <tr key={sub.subject}>
                        <td className="py-3 pr-3">
                          <div className="font-semibold text-ink">{sub.name}</div>
                          <div className="mt-1.5 h-1.5 w-full max-w-[180px] bg-paper-muted overflow-hidden">
                            <div
                              className={`h-full ${
                                isPass ? 'bg-pass' : 'bg-fail'
                              }`}
                              style={{ width: `${sub.accuracyPercent}%` }}
                            />
                          </div>
                        </td>
                        <td className="py-3 px-2 text-right font-mono tabular-nums text-ink">
                          {sub.total}
                        </td>
                        <td className="py-3 px-2 text-right font-mono tabular-nums text-pass font-semibold">
                          {sub.correct}
                        </td>
                        <td className="py-3 px-2 text-right font-mono tabular-nums text-fail font-semibold">
                          {sub.wrong}
                        </td>
                        <td className="py-3 px-2 text-right font-mono tabular-nums text-warn">
                          {sub.blank}
                        </td>
                        <td className="py-3 pl-3 text-right font-mono tabular-nums font-bold text-ink">
                          %{sub.accuracyPercent}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Weak Subtopics / Priority Study Areas */}
          <div className="lg:col-span-5 exam-paper-sheet border border-rule p-6 sm:p-8 flex flex-col">
            <h2 className="font-serif text-lg font-bold text-ink pb-2.5 border-b border-rule-strong">
              Öncelikli Gelişim Konuları
            </h2>
            <p className="text-xs text-ink-secondary mt-2.5">
              Yanlış veya boş bırakılan alt konular hata sayısına göre sıralandı.
              İlgili soruları görmek için konuya tıklayın.
            </p>

            {result.weakSubtopics.length === 0 ? (
              <div className="mt-6 flex-1 flex flex-col items-center justify-center text-center py-8 border border-rule bg-pass-soft/50 px-4">
                <BookOpenCheck className="w-7 h-7 text-pass mb-2" />
                <p className="font-semibold text-sm text-ink">
                  Hata tespit edilen alt konu bulunmuyor
                </p>
                <p className="text-xs text-ink-secondary mt-1">
                  Tüm derslerde %100 isabet oranına ulaştınız.
                </p>
              </div>
            ) : (
              <ul className="mt-4 divide-y divide-rule border-t border-rule overflow-y-auto max-h-[300px]">
                {result.weakSubtopics.map((st) => (
                  <li key={`${st.subject}-${st.subtopic}`}>
                    <button
                      type="button"
                      onClick={() => handleFocusSubtopic(st.subject, st.subtopic)}
                      className="w-full text-left py-3 px-2 hover:bg-paper-muted/70 transition-colors flex items-center justify-between gap-3 cursor-pointer"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-ink truncate">
                          {st.subtopic}
                        </p>
                        <p className="text-xs text-ink-muted mt-0.5">
                          {st.subjectName}
                          <span aria-hidden="true"> · </span>
                          {st.correct}/{st.total} doğru
                        </p>
                      </div>
                      <span className="font-mono text-xs font-semibold text-fail tabular-nums shrink-0">
                        {st.wrongOrBlank} hata/boş
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* 3. Detailed Question-by-Question Wrong Answer Analysis */}
        <section
          id="detailed-review-section"
          className="exam-paper-sheet border border-rule p-6 sm:p-8"
        >
          <div className="flex flex-wrap items-end justify-between gap-4 pb-4 border-b border-rule-strong">
            <div>
              <h2 className="font-serif text-xl font-bold text-ink">
                Soru Bazlı Çözüm ve Hata İncelemesi
              </h2>
              <p className="text-xs sm:text-sm text-ink-secondary mt-1">
                Verdiğiniz cevaplar, doğru şıklar ve adım adım çözüm açıklamaları
              </p>
            </div>

            {subtopicFilter && (
              <div className="flex items-center gap-2 text-xs text-navy">
                <span>
                  Konu filtresi: <strong>{subtopicFilter}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setSubtopicFilter(null)}
                  className="underline hover:text-ink cursor-pointer"
                >
                  Temizle
                </button>
              </div>
            )}
          </div>

          {/* Filter Bars */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
            {/* Status Segmented Tabs */}
            <div
              className="flex flex-wrap items-center gap-1 p-1 bg-paper-muted border border-rule"
              role="tablist"
              aria-label="Soru durumu filtresi"
            >
              {(
                [
                  {
                    id: 'wrong_blank',
                    label: `Yanlış ve Boşlar (${
                      result.wrongCount + result.blankCount
                    })`,
                  },
                  { id: 'wrong', label: `Yanlışlar (${result.wrongCount})` },
                  { id: 'blank', label: `Boşlar (${result.blankCount})` },
                  { id: 'correct', label: `Doğrular (${result.correctCount})` },
                  { id: 'all', label: `Tümü (${result.totalQuestions})` },
                ] as { id: StatusFilter; label: string }[]
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={statusFilter === tab.id}
                  onClick={() => {
                    setStatusFilter(tab.id);
                    setSubtopicFilter(null);
                  }}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 tabular-nums ${
                    statusFilter === tab.id
                      ? 'bg-paper text-ink font-semibold shadow-xs'
                      : 'text-ink-secondary hover:text-ink'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Subject Filter Tabs */}
            {result.subjectBreakdown.length > 1 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setSubjectFilter('all');
                    setSubtopicFilter(null);
                  }}
                  className={`px-2.5 py-1 text-xs border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    subjectFilter === 'all'
                      ? 'bg-navy text-white border-navy'
                      : 'bg-paper text-ink-secondary border-rule hover:border-ink-secondary'
                  }`}
                >
                  Tüm Dersler
                </button>
                {result.subjectBreakdown.map((sub) => (
                  <button
                    key={sub.subject}
                    type="button"
                    onClick={() => {
                      setSubjectFilter(sub.subject);
                      setSubtopicFilter(null);
                    }}
                    className={`px-2.5 py-1 text-xs border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      subjectFilter === sub.subject
                        ? 'bg-navy text-white border-navy'
                        : 'bg-paper text-ink-secondary border-rule hover:border-ink-secondary'
                    }`}
                  >
                    {SUBJECT_META[sub.subject].shortName}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Filtered Questions List */}
          <div className="mt-6 divide-y divide-rule">
            {filteredItems.length === 0 ? (
              <div className="py-12 text-center text-sm text-ink-secondary">
                Seçilen filtreye uygun soru bulunamadı.
              </div>
            ) : (
              filteredItems.map((item) => {
                const q = item.question;
                return (
                  <article key={q.id} className="py-7 first:pt-2">
                    {/* Question Metadata Line (Zero-Pill discipline) */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <div className="flex flex-wrap items-center gap-x-2 text-xs text-ink-muted">
                        <span className="font-mono font-bold text-ink tabular-nums">
                          Soru {item.index}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="text-ink-secondary font-medium">
                          {SUBJECT_META[q.subject].name}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{q.subtopic}</span>
                        <span aria-hidden="true">·</span>
                        <span>
                          {q.source === 'khk_pdf'
                            ? `KHK Resmi Örnek #${q.pdfNumber}`
                            : 'Mevzuat Hazırlık'}
                        </span>
                      </div>

                      {/* Dual-coded Status Label (Icon + Text) */}
                      <div className="text-xs font-semibold flex items-center gap-1.5 shrink-0">
                        {item.status === 'correct' && (
                          <span className="text-pass flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" />
                            Doğru Cevap
                          </span>
                        )}
                        {item.status === 'wrong' && (
                          <span className="text-fail flex items-center gap-1">
                            <XCircle className="w-4 h-4" />
                            Yanlış Cevap (İşaretlenen: {item.selectedOption} ·
                            Doğru: {q.correctAnswer})
                          </span>
                        )}
                        {item.status === 'blank' && (
                          <span className="text-warn flex items-center gap-1">
                            <CircleDashed className="w-4 h-4" />
                            Boş Bırakıldı (Doğru: {q.correctAnswer})
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Question Content */}
                    <div className="max-w-3xl">
                      {q.passage && (
                        <p className="font-serif text-[15px] leading-relaxed text-ink mb-2.5">
                          {q.passage}
                        </p>
                      )}
                      {q.richBlock && (
                        <div className="mb-2.5">
                          <RichQuestionBlock block={q.richBlock} />
                        </div>
                      )}
                      <p className="font-sans text-[15px] font-bold text-ink leading-snug mb-4">
                        <TextWithUnderline
                          text={q.stem}
                          underlineWord={q.stemUnderline}
                        />
                      </p>

                      {/* Options Comparison */}
                      <div className="space-y-1.5 mb-5">
                        {q.options.map((opt) => {
                          const isCorrectOpt = opt.key === q.correctAnswer;
                          const isUserChoice = opt.key === item.selectedOption;
                          const isUserWrong = isUserChoice && !isCorrectOpt;

                          return (
                            <div
                              key={opt.key}
                              className={`flex items-start justify-between gap-3 px-3 py-2 border text-sm ${
                                isCorrectOpt
                                  ? 'bg-pass-soft border-pass/45'
                                  : isUserWrong
                                    ? 'bg-fail-soft border-fail/45'
                                    : 'bg-paper border-rule/60'
                              }`}
                            >
                              <div className="flex items-start gap-2.5">
                                <span
                                  className={`mt-0.5 w-5 h-5 rounded-full border font-mono text-[11px] font-bold flex items-center justify-center shrink-0 ${
                                    isCorrectOpt
                                      ? 'bg-pass border-pass text-white'
                                      : isUserWrong
                                        ? 'bg-fail border-fail text-white'
                                        : 'border-ink-muted text-ink-secondary'
                                  }`}
                                >
                                  {opt.key}
                                </span>
                                <span className="font-serif text-[14.5px] text-ink pt-0.5">
                                  {opt.mathId ? (
                                    <MathOptionContent mathId={opt.mathId} />
                                  ) : (
                                    <TextWithUnderline
                                      text={opt.text}
                                      underlineWord={opt.underlineWord}
                                    />
                                  )}
                                </span>
                              </div>

                              <div className="text-[11px] font-semibold whitespace-nowrap shrink-0 pt-0.5">
                                {isCorrectOpt && isUserChoice && (
                                  <span className="text-pass">
                                    Sizin Cevabınız · Doğru
                                  </span>
                                )}
                                {isCorrectOpt && !isUserChoice && (
                                  <span className="text-pass">Doğru Cevap</span>
                                )}
                                {isUserWrong && (
                                  <span className="text-fail">
                                    Sizin Cevabınız
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Step-by-Step Solution Box (No thick left border — clean all-around hairline) */}
                      <div className="border border-rule bg-paper-muted/55 p-4">
                        <div className="flex items-center justify-between gap-2 pb-2 border-b border-rule">
                          <span className="text-xs font-bold uppercase tracking-wider text-navy flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5" />
                            Adım Adım Çözüm Açıklaması
                          </span>
                          {q.referenceNote && (
                            <span className="text-[11px] text-ink-muted">
                              {q.referenceNote}
                            </span>
                          )}
                        </div>
                        <ol className="mt-2.5 space-y-1.5 text-sm text-ink leading-relaxed list-decimal list-inside">
                          {q.explanationSteps.map((step, sIdx) => (
                            <li key={sIdx}>{step}</li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
