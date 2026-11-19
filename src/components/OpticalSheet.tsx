import React from 'react';
import { Flag } from 'lucide-react';
import type { OptionKey, Question } from '../types/exam';

const OPTION_KEYS: OptionKey[] = ['A', 'B', 'C', 'D', 'E'];

interface OpticalSheetProps {
  questions: Question[];
  answers: Record<string, OptionKey>;
  flaggedIds: Set<string>;
  activeQuestionId: string | null;
  onSelectAnswer: (questionId: string, option: OptionKey) => void;
  onJumpToQuestion: (index: number) => void;
}

export function OpticalSheet({
  questions,
  answers,
  flaggedIds,
  activeQuestionId,
  onSelectAnswer,
  onJumpToQuestion,
}: OpticalSheetProps) {
  const answeredCount = Object.keys(answers).length;
  const blankCount = questions.length - answeredCount;
  const flaggedCount = flaggedIds.size;

  return (
    <div className="optical-sheet-surface border border-optical-line flex flex-col h-full">
      {/* Optical Form Header */}
      <div className="px-4 py-3.5 border-b border-optical-line bg-optical-soft/70">
        <div className="border-t-2 border-b border-optical py-1.5 text-center">
          <h2 className="font-serif text-xs font-bold tracking-[0.14em] uppercase text-optical">
            Optik Cevap Kağıdı
          </h2>
        </div>

        <div className="mt-2.5 flex items-center justify-between text-[11px] font-mono text-ink-secondary tabular-nums">
          <span>İşaretli: {answeredCount}</span>
          <span aria-hidden="true">·</span>
          <span>Boş: {blankCount}</span>
          <span aria-hidden="true">·</span>
          <span>Kontrol: {flaggedCount}</span>
        </div>

        {/* Column Header */}
        <div className="mt-3 pt-2 border-t border-optical-line/70 grid grid-cols-[2.25rem_1fr_1.25rem] items-center text-[11px] font-mono font-semibold text-optical">
          <span className="text-center">NO</span>
          <div className="grid grid-cols-5 text-center">
            {OPTION_KEYS.map((k) => (
              <span key={k}>{k}</span>
            ))}
          </div>
          <span className="sr-only">Kontrol</span>
        </div>
      </div>

      {/* Scrollable Optical Rows */}
      <div className="overflow-y-auto flex-1 divide-y divide-optical-line/45 px-2 py-1">
        {questions.map((q, idx) => {
          const selected = answers[q.id] ?? null;
          const isFlagged = flaggedIds.has(q.id);
          const isActive = activeQuestionId === q.id;

          return (
            <div
              key={q.id}
              className={`grid grid-cols-[2.25rem_1fr_1.25rem] items-center py-1.5 px-1.5 transition-colors ${
                isActive ? 'bg-optical-soft' : 'hover:bg-optical-soft/40'
              }`}
            >
              {/* Question Number Jump Button */}
              <button
                type="button"
                onClick={() => onJumpToQuestion(idx)}
                title={`Soru ${idx + 1}'e git`}
                className={`font-mono text-xs font-semibold tabular-nums text-center py-1 cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-optical ${
                  isActive
                    ? 'text-optical underline underline-offset-2'
                    : 'text-ink hover:text-optical'
                }`}
              >
                {String(idx + 1).padStart(2, '0')}
              </button>

              {/* A - E Pencil Bubbles */}
              <div className="grid grid-cols-5 place-items-center">
                {OPTION_KEYS.map((optKey) => {
                  const isFilled = selected === optKey;
                  return (
                    <button
                      key={optKey}
                      type="button"
                      aria-label={`Soru ${idx + 1}, ${optKey} şıkkı${
                        isFilled ? ' (seçili)' : ''
                      }`}
                      aria-pressed={isFilled}
                      onClick={() => onSelectAnswer(q.id, optKey)}
                      className={`w-6 h-6 rounded-full border font-mono text-[10px] font-semibold flex items-center justify-center transition-all duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-navy ${
                        isFilled
                          ? 'bg-graphite border-graphite text-paper scale-[0.96] shadow-inner'
                          : 'bg-white border-optical/65 text-optical/85 hover:border-graphite hover:text-ink'
                      }`}
                    >
                      {optKey}
                    </button>
                  );
                })}
              </div>

              {/* Flag Indicator */}
              <div className="flex items-center justify-center">
                {isFlagged && (
                  <button
                    type="button"
                    onClick={() => onJumpToQuestion(idx)}
                    title="Kontrol için işaretlendi"
                    aria-label={`Soru ${idx + 1} kontrol için işaretlendi`}
                    className="text-warn cursor-pointer"
                  >
                    <Flag className="w-3 h-3 fill-current" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Note */}
      <div className="px-4 py-2.5 border-t border-optical-line bg-optical-soft/45 text-[11px] text-ink-muted leading-snug">
        Soru numarasına tıklayarak kitapçıkta ilgili soruya gidebilirsiniz.
      </div>
    </div>
  );
}
