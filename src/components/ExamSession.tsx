import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Columns2,
  Flag,
  Grid2x2,
  Pause,
  Play,
  Rows2,
  X,
} from 'lucide-react';
import { SUBJECT_META, formatDuration } from '../data/questionBank';
import type { OptionKey, Question, SubjectId } from '../types/exam';
import { MathOptionContent, RichQuestionBlock } from './MathContent';
import { OpticalSheet } from './OpticalSheet';
import { TextWithUnderline } from './TextWithUnderline';

interface ExamSessionProps {
  questions: Question[];
  durationMinutes: number; // 0 = untimed
  answers: Record<string, OptionKey>;
  flaggedIds: Set<string>;
  onSelectAnswer: (questionId: string, option: OptionKey) => void;
  onToggleFlag: (questionId: string) => void;
  onFinishExam: (elapsedSeconds: number) => void;
}

export function ExamSession({
  questions,
  durationMinutes,
  answers,
  flaggedIds,
  onSelectAnswer,
  onToggleFlag,
  onFinishExam,
}: ExamSessionProps) {
  const isTimed = durationMinutes > 0;
  const totalConfiguredSeconds = durationMinutes * 60;

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [twoColumnMode, setTwoColumnMode] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(
    questions[0]?.id ?? null
  );
  const [showConfirmFinish, setShowConfirmFinish] = useState(false);
  const [mobileOpticalOpen, setMobileOpticalOpen] = useState(false);

  const bookletTopRef = useRef<HTMLDivElement | null>(null);
  const questionRefs = useRef<Record<string, HTMLElement | null>>({});

  const questionsPerPage = twoColumnMode ? 6 : 5;
  const totalPages = Math.max(1, Math.ceil(questions.length / questionsPerPage));

  // Keep currentPage valid if layout switches between 2-col and 1-col
  useEffect(() => {
    if (currentPage >= totalPages) {
      setCurrentPage(Math.max(0, totalPages - 1));
    }
  }, [currentPage, totalPages]);

  // Countdown / Elapsed Timer
  useEffect(() => {
    if (isPaused || showConfirmFinish) return;
    const interval = window.setInterval(() => {
      setElapsedSeconds((prev) => {
        const next = prev + 1;
        if (isTimed && next >= totalConfiguredSeconds) {
          window.clearInterval(interval);
          onFinishExam(totalConfiguredSeconds);
          return totalConfiguredSeconds;
        }
        return next;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [isPaused, showConfirmFinish, isTimed, totalConfiguredSeconds, onFinishExam]);

  const remainingSeconds = isTimed
    ? Math.max(0, totalConfiguredSeconds - elapsedSeconds)
    : elapsedSeconds;
  const isLowTime = isTimed && remainingSeconds <= 300; // last 5 minutes

  const pageStartIndex = currentPage * questionsPerPage;
  const pageQuestions = useMemo(
    () => questions.slice(pageStartIndex, pageStartIndex + questionsPerPage),
    [questions, pageStartIndex, questionsPerPage]
  );

  // Subject quick-jump markers (first question index for each subject in this exam)
  const subjectStarts = useMemo(() => {
    const seen = new Set<SubjectId>();
    const list: { subject: SubjectId; firstIndex: number }[] = [];
    questions.forEach((q, idx) => {
      if (!seen.has(q.subject)) {
        seen.add(q.subject);
        list.push({ subject: q.subject, firstIndex: idx });
      }
    });
    return list;
  }, [questions]);

  const jumpToQuestion = (globalIndex: number) => {
    const targetPage = Math.floor(globalIndex / questionsPerPage);
    const targetQuestion = questions[globalIndex];
    if (!targetQuestion) return;

    setCurrentPage(targetPage);
    setActiveQuestionId(targetQuestion.id);
    setMobileOpticalOpen(false);

    window.setTimeout(() => {
      const el = questionRefs.current[targetQuestion.id];
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 60);
  };

  const goToPage = (nextPage: number) => {
    const clamped = Math.max(0, Math.min(totalPages - 1, nextPage));
    setCurrentPage(clamped);
    const firstOnPage = questions[clamped * questionsPerPage];
    if (firstOnPage) setActiveQuestionId(firstOnPage.id);
    bookletTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const answeredCount = Object.keys(answers).length;
  const blankCount = questions.length - answeredCount;
  const currentSubjectOnPage = pageQuestions[0]?.subject;

  return (
    <div className="min-h-screen bg-desk flex flex-col">
      {/* Compact Sticky Top Bar (Single Row, High Contrast, <= 15% mobile height) */}
      <header className="sticky top-0 z-30 bg-paper border-b border-rule shadow-xs">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          {/* Zone 1: Brand Title */}
          <div className="font-serif font-bold text-sm sm:text-base text-ink whitespace-nowrap shrink-0 truncate max-w-[180px] sm:max-w-none">
            KHK Alt Düzey Yeterlik Sınavı
          </div>

          {/* Zone 2: Progress & Layout Switcher */}
          <div className="hidden md:flex items-center gap-5 text-xs text-ink-secondary">
            <span className="font-mono tabular-nums whitespace-nowrap shrink-0">
              İşaretlenen: <strong className="text-ink">{answeredCount}</strong> /{' '}
              {questions.length}
            </span>
            <span aria-hidden="true" className="text-rule">
              |
            </span>
            <div
              className="inline-flex items-center border border-rule bg-paper-muted p-0.5"
              role="group"
              aria-label="Kitapçık sütun görünümü"
            >
              <button
                type="button"
                onClick={() => setTwoColumnMode(true)}
                className={`px-2.5 py-1 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  twoColumnMode
                    ? 'bg-paper text-ink shadow-xs'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                <Columns2 className="w-3.5 h-3.5" />
                Çift Sütun
              </button>
              <button
                type="button"
                onClick={() => setTwoColumnMode(false)}
                className={`px-2.5 py-1 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  !twoColumnMode
                    ? 'bg-paper text-ink shadow-xs'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                <Rows2 className="w-3.5 h-3.5" />
                Tek Sütun
              </button>
            </div>
          </div>

          {/* Zone 3: Timer, Pause, Mobile Optical Toggle & Finish CTA */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 border font-mono text-xs sm:text-sm font-semibold tabular-nums whitespace-nowrap shrink-0 ${
                isLowTime
                  ? 'bg-fail-soft border-fail/40 text-fail'
                  : 'bg-paper-muted border-rule text-ink'
              }`}
              aria-live="off"
              title={isTimed ? 'Kalan sınav süresi' : 'Geçen süre'}
            >
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span>{formatDuration(remainingSeconds)}</span>
              {isLowTime && (
                <span className="hidden sm:inline font-sans text-[11px] font-semibold">
                  Son 5 dk
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsPaused((p) => !p)}
              title={isPaused ? 'Devam Et' : 'Duraklat'}
              aria-label={isPaused ? 'Sınava devam et' : 'Sınavı duraklat'}
              className="p-2 border border-rule bg-paper hover:bg-paper-muted text-ink transition-colors cursor-pointer shrink-0"
            >
              {isPaused ? (
                <Play className="w-4 h-4" />
              ) : (
                <Pause className="w-4 h-4" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setMobileOpticalOpen(true)}
              className="lg:hidden px-2.5 py-1.5 border border-optical-line bg-optical-soft text-optical text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
            >
              <Grid2x2 className="w-3.5 h-3.5" />
              Optik ({answeredCount}/{questions.length})
            </button>

            <button
              type="button"
              onClick={() => setShowConfirmFinish(true)}
              className="px-3.5 py-2 bg-navy hover:bg-navy-hover text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              Sınavı Bitir
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace: Exam Booklet (Left) + Sticky Optical Sheet (Right) */}
      <div
        ref={bookletTopRef}
        className="max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-6 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
      >
        {/* LEFT COLUMN: Printed Exam Booklet */}
        <main className="lg:col-span-8 xl:col-span-9 space-y-4">
          {/* Subject Jump Strip */}
          {subjectStarts.length > 1 && (
            <nav
              aria-label="Sınav bölümleri"
              className="flex items-center gap-1 overflow-x-auto pb-1"
            >
              {subjectStarts.map(({ subject, firstIndex }) => {
                const isCurr = currentSubjectOnPage === subject;
                return (
                  <button
                    key={subject}
                    type="button"
                    onClick={() => jumpToQuestion(firstIndex)}
                    className={`px-3 py-1.5 text-xs font-medium border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      isCurr
                        ? 'bg-paper border-rule-strong text-ink font-semibold'
                        : 'bg-paper-muted/70 border-rule text-ink-secondary hover:bg-paper hover:text-ink'
                    }`}
                  >
                    {SUBJECT_META[subject].shortName}
                    <span className="ml-1.5 font-mono text-[11px] text-ink-muted tabular-nums">
                      ({firstIndex + 1})
                    </span>
                  </button>
                );
              })}
            </nav>
          )}

          {/* Authentic Printed Exam Booklet Page */}
          <article className="exam-paper-sheet border border-rule min-h-[720px] flex flex-col justify-between">
            <div>
              {/* Printed Booklet Page Running Header (matches KHK PDF top rules) */}
              <div className="px-6 sm:px-9 pt-6 pb-4">
                <div className="border-b-2 border-rule-strong pb-2 text-center">
                  <div className="font-sans text-xs sm:text-[13px] font-bold tracking-[0.08em] uppercase text-ink">
                    KAMU HİZMETİ KOMİSYONU
                  </div>
                  <div className="font-sans text-[11px] sm:text-xs font-semibold tracking-[0.06em] uppercase text-ink-secondary mt-0.5">
                    ALT DÜZEY YETERLİK SINAVI
                    {currentSubjectOnPage
                      ? ` — ${SUBJECT_META[currentSubjectOnPage].name.toUpperCase()}`
                      : ''}
                  </div>
                </div>
              </div>

              {/* Questions Grid (2-column printed sheet or 1-column reading mode) */}
              <div
                className={`px-6 sm:px-9 py-4 ${
                  twoColumnMode
                    ? 'grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8 relative'
                    : 'space-y-8 max-w-3xl mx-auto'
                }`}
              >
                {/* Center Vertical Column Rule for authentic 2-column exam booklet */}
                {twoColumnMode && (
                  <div
                    aria-hidden="true"
                    className="hidden md:block absolute top-4 bottom-4 left-1/2 -translate-x-1/2 w-px bg-rule"
                  />
                )}

                {pageQuestions.map((question, idxInPage) => {
                  const globalNumber = pageStartIndex + idxInPage + 1;
                  const selected = answers[question.id] ?? null;
                  const isFlagged = flaggedIds.has(question.id);
                  const isFocused = activeQuestionId === question.id;

                  // Show a crisp printed subject divider when subject changes mid-page
                  const prevQuestion =
                    idxInPage > 0
                      ? pageQuestions[idxInPage - 1]
                      : pageStartIndex > 0
                        ? questions[pageStartIndex - 1]
                        : null;
                  const isNewSubjectSection =
                    !prevQuestion || prevQuestion.subject !== question.subject;

                  return (
                    <section
                      key={question.id}
                      ref={(el) => {
                        questionRefs.current[question.id] = el;
                      }}
                      onClick={() => setActiveQuestionId(question.id)}
                      className={`pb-6 border-b border-rule/75 last:border-b-0 transition-colors ${
                        isFocused ? 'bg-transparent' : ''
                      }`}
                    >
                      {isNewSubjectSection && (
                        <div className="mb-3 pb-1 border-b border-rule-strong/60 flex items-center justify-between text-[11px] font-semibold tracking-wider uppercase text-navy">
                          <span>{SUBJECT_META[question.subject].name}</span>
                          <span className="font-mono font-normal text-ink-muted">
                            Bölüm Başlangıcı
                          </span>
                        </div>
                      )}

                      {/* Question Header Row */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-baseline gap-2">
                          <span className="font-mono text-sm font-bold text-ink tabular-nums">
                            {globalNumber}.
                          </span>
                          <span className="text-[11px] text-ink-muted">
                            {SUBJECT_META[question.subject].shortName}
                            <span aria-hidden="true"> · </span>
                            {question.source === 'khk_pdf'
                              ? 'KHK Resmi Örnek'
                              : 'Hazırlık'}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleFlag(question.id);
                          }}
                          className={`text-[11px] flex items-center gap-1 px-1.5 py-0.5 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                            isFlagged
                              ? 'text-warn font-semibold'
                              : 'text-ink-muted hover:text-ink'
                          }`}
                          aria-pressed={isFlagged}
                        >
                          <Flag
                            className={`w-3 h-3 ${isFlagged ? 'fill-current' : ''}`}
                          />
                          <span>{isFlagged ? 'İşaretli' : 'Kontrol Et'}</span>
                        </button>
                      </div>

                      {/* Optional Passage */}
                      {question.passage && (
                        <p className="font-serif text-[15px] leading-[1.65] text-ink mb-3">
                          {question.passage}
                        </p>
                      )}

                      {/* Optional Rich Math / Diagram / Numbered Lines */}
                      {question.richBlock && (
                        <div className="mb-3">
                          <RichQuestionBlock block={question.richBlock} />
                        </div>
                      )}

                      {/* Bold Question Stem (Authentic KHK PDF style) */}
                      <p className="font-sans text-[14.5px] font-bold leading-snug text-ink mb-3.5">
                        <TextWithUnderline
                          text={question.stem}
                          underlineWord={question.stemUnderline}
                        />
                      </p>

                      {question.advancedNote && (
                        <p className="text-xs italic text-ink-muted -mt-2 mb-3">
                          ({question.advancedNote})
                        </p>
                      )}

                      {/* 5 Options (A - E) */}
                      <div className="space-y-1.5" role="radiogroup" aria-label={`Soru ${globalNumber} seçenekleri`}>
                        {question.options.map((opt) => {
                          const isSelected = selected === opt.key;
                          return (
                            <button
                              key={opt.key}
                              type="button"
                              role="radio"
                              aria-checked={isSelected}
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveQuestionId(question.id);
                                onSelectAnswer(question.id, opt.key);
                              }}
                              className={`w-full text-left flex items-start gap-2.5 px-2.5 py-2 border transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-navy ${
                                isSelected
                                  ? 'bg-paper-muted border-graphite'
                                  : 'bg-transparent border-transparent hover:bg-paper-muted/60 hover:border-rule'
                              }`}
                            >
                              <span
                                className={`mt-0.5 w-5 h-5 rounded-full border font-mono text-[11px] font-bold flex items-center justify-center shrink-0 transition-colors ${
                                  isSelected
                                    ? 'bg-graphite border-graphite text-paper'
                                    : 'border-ink-secondary/60 text-ink'
                                }`}
                              >
                                {opt.key}
                              </span>
                              <span className="font-serif text-[14.5px] leading-snug text-ink pt-0.5">
                                {opt.mathId ? (
                                  <MathOptionContent mathId={opt.mathId} />
                                ) : (
                                  <TextWithUnderline
                                    text={opt.text}
                                    underlineWord={opt.underlineWord}
                                  />
                                )}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </section>
                  );
                })}
              </div>
            </div>

            {/* Printed Booklet Footer & Page Navigation */}
            <footer className="px-6 sm:px-9 py-4 mt-4 border-t border-rule flex items-center justify-between gap-4 bg-paper-muted/35">
              <button
                type="button"
                disabled={currentPage === 0}
                onClick={() => goToPage(currentPage - 1)}
                className="px-3.5 py-2 border border-rule bg-paper hover:bg-paper-muted disabled:opacity-40 text-xs sm:text-sm font-medium text-ink flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed whitespace-nowrap shrink-0"
              >
                <ChevronLeft className="w-4 h-4" />
                Önceki Sayfa
              </button>

              <div className="text-center font-mono text-xs text-ink-secondary tabular-nums">
                Sayfa <strong className="text-ink">{currentPage + 1}</strong> /{' '}
                {totalPages}
              </div>

              {currentPage < totalPages - 1 ? (
                <button
                  type="button"
                  onClick={() => goToPage(currentPage + 1)}
                  className="px-3.5 py-2 border border-rule bg-paper hover:bg-paper-muted text-xs sm:text-sm font-medium text-ink flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                >
                  Sonraki Sayfa
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowConfirmFinish(true)}
                  className="px-4 py-2 bg-navy hover:bg-navy-hover text-white text-xs sm:text-sm font-semibold cursor-pointer whitespace-nowrap shrink-0"
                >
                  Sınavı Tamamla
                </button>
              )}
            </footer>
          </article>
        </main>

        {/* RIGHT COLUMN: Sticky Optical Answer Sheet (Desktop) */}
        <aside className="hidden lg:block lg:col-span-4 xl:col-span-3 sticky top-20 h-[calc(100vh-6.5rem)]">
          <OpticalSheet
            questions={questions}
            answers={answers}
            flaggedIds={flaggedIds}
            activeQuestionId={activeQuestionId}
            onSelectAnswer={onSelectAnswer}
            onJumpToQuestion={jumpToQuestion}
          />
        </aside>
      </div>

      {/* Mobile Optical Sheet Slide-Over Drawer */}
      {mobileOpticalOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden bg-ink/45 flex justify-end"
          role="dialog"
          aria-modal="true"
          aria-label="Optik Cevap Kağıdı"
        >
          <div className="w-full max-w-xs bg-paper h-full flex flex-col">
            <div className="px-4 py-3 border-b border-rule flex items-center justify-between">
              <span className="font-serif text-sm font-bold text-ink">
                Optik Cevap Kağıdı
              </span>
              <button
                type="button"
                onClick={() => setMobileOpticalOpen(false)}
                aria-label="Optik formu kapat"
                className="p-1.5 text-ink-secondary hover:text-ink cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <OpticalSheet
                questions={questions}
                answers={answers}
                flaggedIds={flaggedIds}
                activeQuestionId={activeQuestionId}
                onSelectAnswer={onSelectAnswer}
                onJumpToQuestion={jumpToQuestion}
              />
            </div>
          </div>
        </div>
      )}

      {/* Pause Overlay (Masks questions for realistic exam timing) */}
      {isPaused && (
        <div
          className="fixed inset-0 z-50 bg-desk/95 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Sınav duraklatıldı"
        >
          <div className="exam-paper-sheet border border-rule max-w-md w-full p-8 text-center">
            <h2 className="font-serif text-2xl font-bold text-ink">
              Sınav Duraklatıldı
            </h2>
            <p className="text-sm text-ink-secondary mt-2 leading-relaxed">
              Süre durduruldu ve sınav kitapçığı gizlendi. Hazır olduğunuzda
              kaldığınız sorudan devam edebilirsiniz.
            </p>
            <div className="mt-5 py-3 border-y border-rule font-mono text-sm text-ink tabular-nums">
              {isTimed ? 'Kalan Süre: ' : 'Geçen Süre: '}
              <strong>{formatDuration(remainingSeconds)}</strong>
              <span aria-hidden="true"> · </span>
              İşaretli: <strong>{answeredCount}</strong>/{questions.length}
            </div>
            <button
              type="button"
              onClick={() => setIsPaused(false)}
              className="mt-6 w-full py-3 px-6 bg-navy hover:bg-navy-hover text-white text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              Sınava Devam Et
            </button>
          </div>
        </div>
      )}

      {/* Finish Exam Confirmation Modal */}
      {showConfirmFinish && (
        <div
          className="fixed inset-0 z-50 bg-ink/50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="finish-modal-title"
        >
          <div className="exam-paper-sheet border border-rule max-w-md w-full p-6 sm:p-7">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-warn shrink-0 mt-0.5" />
              <div>
                <h2
                  id="finish-modal-title"
                  className="font-serif text-xl font-bold text-ink"
                >
                  Sınavı Bitirmek İstiyor musunuz?
                </h2>
                <p className="text-sm text-ink-secondary mt-1.5 leading-relaxed">
                  Sınavı tamamladığınızda optik cevap kağıdınız değerlendirilecek ve
                  yanlış cevap analizi açılacaktır.
                </p>
              </div>
            </div>

            <dl className="mt-5 grid grid-cols-3 border border-rule divide-x divide-rule text-center bg-paper-muted/40">
              <div className="p-3">
                <dt className="text-[11px] text-ink-muted">İşaretlenen</dt>
                <dd className="font-mono text-lg font-bold text-ink tabular-nums mt-0.5">
                  {answeredCount}
                </dd>
              </div>
              <div className="p-3">
                <dt className="text-[11px] text-ink-muted">Boş</dt>
                <dd className="font-mono text-lg font-bold text-warn tabular-nums mt-0.5">
                  {blankCount}
                </dd>
              </div>
              <div className="p-3">
                <dt className="text-[11px] text-ink-muted">Kontrol</dt>
                <dd className="font-mono text-lg font-bold text-navy tabular-nums mt-0.5">
                  {flaggedIds.size}
                </dd>
              </div>
            </dl>

            {blankCount > 0 && (
              <p className="mt-4 text-xs text-ink-secondary">
                Not: Yanlış cevaplar doğruyu götürmediği için boş bıraktığınız{' '}
                <strong className="text-ink">{blankCount}</strong> soruyu
                gözden geçirebilirsiniz.
              </p>
            )}

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmFinish(false)}
                className="px-4 py-2.5 border border-rule bg-paper hover:bg-paper-muted text-sm font-medium text-ink cursor-pointer"
              >
                Kitapçığa Dön
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowConfirmFinish(false);
                  onFinishExam(elapsedSeconds);
                }}
                className="px-5 py-2.5 bg-navy hover:bg-navy-hover text-white text-sm font-semibold cursor-pointer"
              >
                Değerlendirmeye Geç
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
