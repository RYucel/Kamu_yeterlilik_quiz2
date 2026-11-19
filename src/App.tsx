/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useState } from 'react';
import { ExamReport } from './components/ExamReport';
import { ExamSession } from './components/ExamSession';
import { ExamSetup } from './components/ExamSetup';
import { OfflineIndicator } from './components/OfflineIndicator';
import {
  EXAM_PRESETS,
  buildExamQuestions,
  evaluateExam,
} from './data/questionBank';
import type {
  ExamConfig,
  ExamResult,
  OptionKey,
  Question,
} from './types/exam';

type ScreenMode = 'setup' | 'exam' | 'results';

export default function App() {
  const [screen, setScreen] = useState<ScreenMode>('setup');
  const [config, setConfig] = useState<ExamConfig>({
    ...EXAM_PRESETS[0].config,
  });

  const [sessionQuestions, setSessionQuestions] = useState<Question[]>([]);
  const [sessionDurationMinutes, setSessionDurationMinutes] =
    useState<number>(75);
  const [answers, setAnswers] = useState<Record<string, OptionKey>>({});
  const [flaggedIds, setFlaggedIds] = useState<Set<string>>(() => new Set());
  const [result, setResult] = useState<ExamResult | null>(null);

  const handleStartExam = useCallback(() => {
    const selected = buildExamQuestions(config);
    if (selected.length === 0) return;
    setSessionQuestions(selected);
    setSessionDurationMinutes(config.durationMinutes);
    setAnswers({});
    setFlaggedIds(new Set());
    setResult(null);
    setScreen('exam');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [config]);

  const handleSelectAnswer = useCallback(
    (questionId: string, option: OptionKey) => {
      setAnswers((prev) => {
        // Clicking the already selected option clears it (like erasing pencil mark)
        if (prev[questionId] === option) {
          const next = { ...prev };
          delete next[questionId];
          return next;
        }
        return { ...prev, [questionId]: option };
      });
    },
    []
  );

  const handleToggleFlag = useCallback((questionId: string) => {
    setFlaggedIds((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });
  }, []);

  const handleFinishExam = useCallback(
    (elapsedSeconds: number) => {
      const computed = evaluateExam(
        sessionQuestions,
        answers,
        flaggedIds,
        elapsedSeconds,
        sessionDurationMinutes
      );
      setResult(computed);
      setScreen('results');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [sessionQuestions, answers, flaggedIds, sessionDurationMinutes]
  );

  const handleRetryWrongQuestions = useCallback(
    (wrongQuestions: Question[]) => {
      if (wrongQuestions.length === 0) return;
      // Give ~1.5 minutes per question (matching official 75 min / 50 Q ratio) if timed, or untimed if previous was untimed
      const suggestedMinutes =
        sessionDurationMinutes === 0
          ? 0
          : Math.max(5, Math.ceil(wrongQuestions.length * 1.5));

      setSessionQuestions(wrongQuestions);
      setSessionDurationMinutes(suggestedMinutes);
      setAnswers({});
      setFlaggedIds(new Set());
      setResult(null);
      setScreen('exam');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [sessionDurationMinutes]
  );

  const handleNewExam = useCallback(() => {
    setScreen('setup');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <>
      {screen === 'exam' ? (
        <ExamSession
          questions={sessionQuestions}
          durationMinutes={sessionDurationMinutes}
          answers={answers}
          flaggedIds={flaggedIds}
          onSelectAnswer={handleSelectAnswer}
          onToggleFlag={handleToggleFlag}
          onFinishExam={handleFinishExam}
        />
      ) : screen === 'results' && result ? (
        <ExamReport
          result={result}
          onRetryWrongQuestions={handleRetryWrongQuestions}
          onNewExam={handleNewExam}
        />
      ) : (
        <ExamSetup
          config={config}
          onChangeConfig={setConfig}
          onStartExam={handleStartExam}
        />
      )}
      <OfflineIndicator />
    </>
  );
}
