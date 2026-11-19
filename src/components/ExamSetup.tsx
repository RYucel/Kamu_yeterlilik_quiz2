import React from 'react';
import {
  BookOpen,
  Clock,
  FileText,
  Play,
  SlidersHorizontal,
  Check,
} from 'lucide-react';
import {
  EXAM_PRESETS,
  PASS_THRESHOLD,
  SUBJECT_META,
  SUBJECT_ORDER,
  getAvailableQuestions,
  getSubjectAvailableCount,
} from '../data/questionBank';
import type { ExamConfig, SubjectId } from '../types/exam';
import { PWAInstallButton } from './PWAInstallButton';

interface ExamSetupProps {
  config: ExamConfig;
  onChangeConfig: (next: ExamConfig) => void;
  onStartExam: () => void;
}

const DURATION_QUICK_OPTIONS = [
  { label: 'Süresiz', minutes: 0 },
  { label: '20 dk', minutes: 20 },
  { label: '35 dk', minutes: 35 },
  { label: '55 dk', minutes: 55 },
  { label: '75 dk', minutes: 75 },
  { label: '90 dk', minutes: 90 },
];

export function ExamSetup({
  config,
  onChangeConfig,
  onStartExam,
}: ExamSetupProps) {
  const availablePool = getAvailableQuestions(
    config.selectedSubjects,
    config.officialPdfOnly,
    config.includeAdvancedMath
  );
  const maxQuestions = availablePool.length;
  const effectiveCount = Math.min(config.questionCount, maxQuestions);
  const pointsPerQuestion =
    effectiveCount > 0 ? (100 / effectiveCount).toFixed(2).replace('.', ',') : '0,00';

  const activePresetId =
    EXAM_PRESETS.find(
      (p) =>
        p.config.questionCount === config.questionCount &&
        p.config.durationMinutes === config.durationMinutes &&
        p.config.officialPdfOnly === config.officialPdfOnly &&
        p.config.balancedOfficialDistribution ===
          config.balancedOfficialDistribution &&
        p.config.selectedSubjects.length === config.selectedSubjects.length &&
        p.config.selectedSubjects.every((s) =>
          config.selectedSubjects.includes(s)
        )
    )?.id ?? null;

  const toggleSubject = (subject: SubjectId) => {
    const exists = config.selectedSubjects.includes(subject);
    const nextSubjects = exists
      ? config.selectedSubjects.filter((s) => s !== subject)
      : [...config.selectedSubjects, subject];

    if (nextSubjects.length === 0) return;

    const nextMax = getAvailableQuestions(
      nextSubjects,
      config.officialPdfOnly,
      config.includeAdvancedMath
    ).length;

    onChangeConfig({
      ...config,
      selectedSubjects: nextSubjects,
      questionCount: Math.max(1, Math.min(config.questionCount, nextMax)),
    });
  };

  const handleTogglePdfOnly = (checked: boolean) => {
    let nextSubjects = config.selectedSubjects;
    if (checked) {
      const pdfSubjects: SubjectId[] = ['turkce', 'matematik', 'genel_kultur'];
      const filtered = nextSubjects.filter((s) => pdfSubjects.includes(s));
      nextSubjects = filtered.length > 0 ? filtered : pdfSubjects;
    }
    const nextMax = getAvailableQuestions(
      nextSubjects,
      checked,
      config.includeAdvancedMath
    ).length;

    onChangeConfig({
      ...config,
      officialPdfOnly: checked,
      selectedSubjects: nextSubjects,
      questionCount: Math.max(1, Math.min(config.questionCount, nextMax)),
    });
  };

  const handleToggleAdvancedMath = (checked: boolean) => {
    const nextMax = getAvailableQuestions(
      config.selectedSubjects,
      config.officialPdfOnly,
      checked
    ).length;
    onChangeConfig({
      ...config,
      includeAdvancedMath: checked,
      questionCount: Math.max(1, Math.min(config.questionCount, nextMax)),
    });
  };

  const handleApplyPreset = (presetConfig: ExamConfig) => {
    onChangeConfig({ ...presetConfig });
  };

  const questionQuickChoices = [10, 20, 25, 37, 50, maxQuestions].filter(
    (v, idx, arr) => v > 0 && v <= maxQuestions && arr.indexOf(v) === idx
  );

  return (
    <div className="min-h-screen bg-desk py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1200px] mx-auto">
        {/* Institutional Cover Sheet */}
        <div className="exam-paper-sheet border border-rule">
          {/* Official Double-Rule Header */}
          <header className="px-6 sm:px-10 pt-8 pb-6 border-b border-rule">
            <div className="border-t-2 border-b border-rule-strong py-3 text-center">
              <p className="font-serif text-xs sm:text-sm font-semibold tracking-[0.14em] uppercase text-ink">
                Kuzey Kıbrıs Türk Cumhuriyeti · Kamu Hizmeti Komisyonu
              </p>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink mt-1.5 tracking-tight">
                Alt Düzey Yeterlilik Sınavı Hazırlık Kitapçığı
              </h1>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm text-ink-secondary">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span>Yazılı ve Çoktan Seçmeli Simülasyon</span>
                <span aria-hidden="true">·</span>
                <span>5 Seçenekli (A–E) Optik Kodlama</span>
                <span aria-hidden="true">·</span>
                <span>100 Üzerinden Puanlama (Baraj: {PASS_THRESHOLD})</span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="font-mono text-xs text-ink-muted tabular-nums">
                  Toplam Havuz: {maxQuestions} Aktif Soru
                </span>
                <PWAInstallButton />
              </div>
            </div>
          </header>

          {/* Main 2-Column Configuration Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-rule">
            {/* Left 8 Columns: Presets & Flexible Controls */}
            <div className="lg:col-span-8 p-6 sm:p-8 lg:p-10 space-y-9">
              {/* 1. Ready Presets */}
              <section aria-labelledby="presets-heading">
                <div className="flex items-center justify-between mb-4">
                  <h2
                    id="presets-heading"
                    className="font-serif text-lg font-semibold text-ink flex items-center gap-2"
                  >
                    <BookOpen className="w-4 h-4 text-navy shrink-0" />
                    Hazır Sınav Profilleri
                  </h2>
                  <span className="text-xs text-ink-muted">
                    Tek tıkla uygulayın veya aşağıdan özelleştirin
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  {EXAM_PRESETS.map((preset) => {
                    const isSelected = activePresetId === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleApplyPreset(preset.config)}
                        className={`text-left p-4 border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy ${
                          isSelected
                            ? 'bg-paper-muted border-navy'
                            : 'bg-paper border-rule hover:border-ink-secondary'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-semibold text-sm text-ink leading-snug">
                            {preset.title}
                          </span>
                          <span
                            className={`w-4 h-4 mt-0.5 rounded-full border flex items-center justify-center shrink-0 ${
                              isSelected
                                ? 'bg-navy border-navy text-white'
                                : 'border-ink-muted'
                            }`}
                          >
                            {isSelected && <Check className="w-2.5 h-2.5" />}
                          </span>
                        </div>
                        <p className="text-xs text-ink-secondary mt-2 leading-relaxed">
                          {preset.subtitle}
                        </p>
                        <p className="font-mono text-[11px] text-navy mt-3 pt-2.5 border-t border-rule tabular-nums">
                          {preset.summaryLine}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* 2. Subject Selection */}
              <section aria-labelledby="subjects-heading">
                <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
                  <h2
                    id="subjects-heading"
                    className="font-serif text-lg font-semibold text-ink flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4 text-navy shrink-0" />
                    Sınav Konuları ve Ders Seçimi
                  </h2>
                  <span className="text-xs text-ink-muted">
                    Resmi Alt Düzey Dağılımı: Her ders %20 (10 soru)
                  </span>
                </div>

                <div className="border border-rule divide-y divide-rule">
                  {SUBJECT_ORDER.map((subjectId) => {
                    const meta = SUBJECT_META[subjectId];
                    const subjectAvail = getSubjectAvailableCount(
                      subjectId,
                      config.officialPdfOnly,
                      config.includeAdvancedMath
                    );
                    const isChecked = config.selectedSubjects.includes(subjectId);
                    const isDisabled = subjectAvail === 0;

                    return (
                      <label
                        key={subjectId}
                        className={`flex items-center justify-between gap-4 px-4 py-3 transition-colors ${
                          isDisabled
                            ? 'opacity-50 cursor-not-allowed bg-paper-muted/50'
                            : 'cursor-pointer hover:bg-paper-muted/60'
                        }`}
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <input
                            type="checkbox"
                            checked={isChecked && !isDisabled}
                            disabled={isDisabled}
                            onChange={() => toggleSubject(subjectId)}
                            className="mt-1 h-4 w-4 accent-navy rounded-none cursor-pointer"
                          />
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-x-2 text-sm">
                              <span className="font-semibold text-ink">
                                {meta.name}
                              </span>
                              <span className="text-xs text-ink-muted font-mono tabular-nums">
                                Resmi Ağırlık %{meta.officialWeightPercent}
                              </span>
                            </div>
                            <p className="text-xs text-ink-secondary mt-0.5">
                              {meta.description}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0 font-mono text-xs text-ink-secondary tabular-nums">
                          {subjectAvail} soru
                        </div>
                      </label>
                    );
                  })}
                </div>
              </section>

              {/* 3. Flexible Question Count & Duration Controls */}
              <section aria-labelledby="flexible-heading">
                <h2
                  id="flexible-heading"
                  className="font-serif text-lg font-semibold text-ink flex items-center gap-2 mb-5"
                >
                  <SlidersHorizontal className="w-4 h-4 text-navy shrink-0" />
                  Soru Sayısı ve Süre Ayarları
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Question Count */}
                  <div className="p-4 border border-rule bg-paper-muted/40">
                    <div className="flex items-baseline justify-between mb-2">
                      <label
                        htmlFor="question-count-range"
                        className="text-sm font-semibold text-ink"
                      >
                        Soru Sayısı
                      </label>
                      <span className="font-mono text-base font-semibold text-navy tabular-nums">
                        {effectiveCount} / {maxQuestions} Soru
                      </span>
                    </div>
                    <input
                      id="question-count-range"
                      type="range"
                      min={Math.min(5, maxQuestions)}
                      max={Math.max(1, maxQuestions)}
                      step={1}
                      value={effectiveCount}
                      onChange={(e) =>
                        onChangeConfig({
                          ...config,
                          questionCount: Number(e.target.value),
                        })
                      }
                      className="w-full exam-slider my-2"
                    />
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {questionQuickChoices.map((count) => (
                        <button
                          key={count}
                          type="button"
                          onClick={() =>
                            onChangeConfig({ ...config, questionCount: count })
                          }
                          className={`px-2.5 py-1 text-xs font-mono border transition-colors whitespace-nowrap shrink-0 tabular-nums ${
                            effectiveCount === count
                              ? 'bg-navy text-white border-navy'
                              : 'bg-paper text-ink border-rule hover:border-ink-secondary'
                          }`}
                        >
                          {count === maxQuestions ? `Tümü (${count})` : count}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Exam Duration */}
                  <div className="p-4 border border-rule bg-paper-muted/40">
                    <div className="flex items-baseline justify-between mb-2">
                      <label
                        htmlFor="duration-range"
                        className="text-sm font-semibold text-ink flex items-center gap-1.5"
                      >
                        <Clock className="w-3.5 h-3.5 text-navy" />
                        Sınav Süresi
                      </label>
                      <span className="font-mono text-base font-semibold text-navy tabular-nums">
                        {config.durationMinutes === 0
                          ? 'Süresiz'
                          : `${config.durationMinutes} Dakika`}
                      </span>
                    </div>
                    <input
                      id="duration-range"
                      type="range"
                      min={0}
                      max={120}
                      step={5}
                      value={config.durationMinutes}
                      onChange={(e) =>
                        onChangeConfig({
                          ...config,
                          durationMinutes: Number(e.target.value),
                        })
                      }
                      className="w-full exam-slider my-2"
                    />
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {DURATION_QUICK_OPTIONS.map((opt) => (
                        <button
                          key={opt.minutes}
                          type="button"
                          onClick={() =>
                            onChangeConfig({
                              ...config,
                              durationMinutes: opt.minutes,
                            })
                          }
                          className={`px-2.5 py-1 text-xs font-mono border transition-colors whitespace-nowrap shrink-0 tabular-nums ${
                            config.durationMinutes === opt.minutes
                              ? 'bg-navy text-white border-navy'
                              : 'bg-paper text-ink border-rule hover:border-ink-secondary'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Additional Options */}
                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <label className="flex items-start gap-2.5 p-3 border border-rule cursor-pointer hover:bg-paper-muted/50">
                    <input
                      type="checkbox"
                      checked={config.balancedOfficialDistribution}
                      onChange={(e) =>
                        onChangeConfig({
                          ...config,
                          balancedOfficialDistribution: e.target.checked,
                        })
                      }
                      className="mt-0.5 h-4 w-4 accent-navy cursor-pointer"
                    />
                    <span>
                      <span className="block font-medium text-ink text-xs sm:text-sm">
                        Seçili derslere eşit dağıt
                      </span>
                      <span className="block text-xs text-ink-muted mt-0.5">
                        5 derste resmi %20 oranını korur
                      </span>
                    </span>
                  </label>

                  <label className="flex items-start gap-2.5 p-3 border border-rule cursor-pointer hover:bg-paper-muted/50">
                    <input
                      type="checkbox"
                      checked={config.shuffleQuestions}
                      onChange={(e) =>
                        onChangeConfig({
                          ...config,
                          shuffleQuestions: e.target.checked,
                        })
                      }
                      className="mt-0.5 h-4 w-4 accent-navy cursor-pointer"
                    />
                    <span>
                      <span className="block font-medium text-ink text-xs sm:text-sm">
                        Soruları karıştır
                      </span>
                      <span className="block text-xs text-ink-muted mt-0.5">
                        Her denemede farklı soru sıralaması oluşturur
                      </span>
                    </span>
                  </label>

                  <label className="flex items-start gap-2.5 p-3 border border-rule cursor-pointer hover:bg-paper-muted/50">
                    <input
                      type="checkbox"
                      checked={config.officialPdfOnly}
                      onChange={(e) => handleTogglePdfOnly(e.target.checked)}
                      className="mt-0.5 h-4 w-4 accent-navy cursor-pointer"
                    />
                    <span>
                      <span className="block font-medium text-ink text-xs sm:text-sm">
                        Sadece ekli KHK PDF soruları
                      </span>
                      <span className="block text-xs text-ink-muted mt-0.5">
                        Türkçe, Matematik ve Genel Kültür resmi kitapçıkları
                      </span>
                    </span>
                  </label>

                  <label className="flex items-start gap-2.5 p-3 border border-rule cursor-pointer hover:bg-paper-muted/50">
                    <input
                      type="checkbox"
                      checked={config.includeAdvancedMath}
                      onChange={(e) =>
                        handleToggleAdvancedMath(e.target.checked)
                      }
                      className="mt-0.5 h-4 w-4 accent-navy cursor-pointer"
                    />
                    <span>
                      <span className="block font-medium text-ink text-xs sm:text-sm">
                        İleri düzey matematik sorularını ekle
                      </span>
                      <span className="block text-xs text-ink-muted mt-0.5">
                        Matematik PDF 13–15. sorular (Mimarlık/Mühendislik)
                      </span>
                    </span>
                  </label>
                </div>
              </section>
            </div>

            {/* Right 4 Columns: Official Exam Instructions & Launch Box */}
            <aside className="lg:col-span-4 p-6 sm:p-8 bg-paper-muted/50 flex flex-col justify-between gap-8">
              <div className="space-y-6">
                <div>
                  <h2 className="font-serif text-base font-bold text-ink uppercase tracking-wider pb-2 border-b border-rule-strong">
                    Sınav Oturum Özeti
                  </h2>
                  <dl className="mt-4 space-y-3 text-sm">
                    <div className="flex justify-between gap-2 pb-2.5 border-b border-rule">
                      <dt className="text-ink-secondary">Sınav Düzeyi</dt>
                      <dd className="font-semibold text-ink">Alt Düzey Yeterlik</dd>
                    </div>
                    <div className="flex justify-between gap-2 pb-2.5 border-b border-rule">
                      <dt className="text-ink-secondary">Soru Sayısı</dt>
                      <dd className="font-mono font-semibold text-ink tabular-nums">
                        {effectiveCount} Soru
                      </dd>
                    </div>
                    <div className="flex justify-between gap-2 pb-2.5 border-b border-rule">
                      <dt className="text-ink-secondary">Süre</dt>
                      <dd className="font-mono font-semibold text-ink tabular-nums">
                        {config.durationMinutes === 0
                          ? 'Süresiz'
                          : `${config.durationMinutes} Dakika`}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-2 pb-2.5 border-b border-rule">
                      <dt className="text-ink-secondary">Soru Başına Puan</dt>
                      <dd className="font-mono font-semibold text-ink tabular-nums">
                        {pointsPerQuestion} Puan
                      </dd>
                    </div>
                    <div className="flex justify-between gap-2 pb-2.5 border-b border-rule">
                      <dt className="text-ink-secondary">Puanlama Kuralı</dt>
                      <dd className="font-medium text-ink text-right">
                        Yanlış doğruyu götürmez
                      </dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="text-ink-secondary">Başarı Barajı</dt>
                      <dd className="font-mono font-semibold text-navy tabular-nums">
                        {PASS_THRESHOLD} / 100 Puan
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* Official KHK Regulation Reference Table */}
                <div className="border border-rule bg-paper p-4">
                  <p className="font-serif text-xs font-bold text-ink uppercase tracking-wider mb-2.5">
                    Resmi KHK Alt Düzey Dağılımı
                  </p>
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-rule text-ink-muted">
                        <th className="text-left font-medium py-1.5">Sınav Konusu</th>
                        <th className="text-right font-medium py-1.5">Oran</th>
                        <th className="text-right font-medium py-1.5">Soru</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-rule/70">
                      {SUBJECT_ORDER.map((id) => (
                        <tr key={id}>
                          <td className="py-1.5 text-ink">
                            {SUBJECT_META[id].shortName}
                          </td>
                          <td className="py-1.5 text-right font-mono tabular-nums text-ink-secondary">
                            %20
                          </td>
                          <td className="py-1.5 text-right font-mono tabular-nums text-ink-secondary">
                            10
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-rule-strong font-semibold text-ink">
                        <td className="pt-2">Toplam (75 Dakika)</td>
                        <td className="pt-2 text-right font-mono tabular-nums">%100</td>
                        <td className="pt-2 text-right font-mono tabular-nums">50</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <div className="text-xs text-ink-secondary leading-relaxed space-y-1.5">
                  <p className="font-semibold text-ink">Adaylara Hatırlatma:</p>
                  <p>
                    İşaretlemelerinizi hem kitapçık üzerinden hem de sağdaki optik
                    cevap kağıdından yapabilirsiniz. Aynı şıkka tekrar tıklayarak
                    işaretinizi silebilirsiniz.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-rule">
                <button
                  type="button"
                  disabled={effectiveCount === 0}
                  onClick={onStartExam}
                  className="w-full py-3.5 px-6 bg-navy hover:bg-navy-hover disabled:opacity-40 text-white font-semibold text-sm tracking-wide flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Sınavı Başlat ({effectiveCount} Soru)
                </button>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
