import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { weeklyApi } from '@/api/weekly';
import { aiApi } from '@/api/ai';
import { formatDate, getCurrentWeekStart } from '@/lib/dates';
import { AIWeeklySummaryCard } from '@/components/ai/AIWeeklySummaryCard';

// ТЗ п.19: ровно 6 guided review questions
const GUIDED_QUESTIONS = [
  'Где неделя ударила сильнее всего?',
  'Какой старый закон включался чаще всего?',
  'Где ты подчинился ему автоматически?',
  'Где получилось не подчиниться?',
  'Что оказалось не таким страшным, как ожидалось?',
  'Что стоит проверить на следующей неделе?',
];

type ReviewForm = {
  summary_text: string;
  pattern_text: string;
  learning_text: string;
  next_focus_text: string;
};

export default function WeeklyReviewPage() {
  const queryClient = useQueryClient();
  const weekStart = getCurrentWeekStart();
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiError, setAiError] = useState(false);

  const { data: review, isLoading } = useQuery({
    queryKey: ['weekly', weekStart],
    queryFn: () => weeklyApi.getByWeekStart(weekStart).then(r => r.data),
  });

  const { register, handleSubmit, formState: { isDirty } } = useForm<ReviewForm>({
    values: {
      summary_text: review?.summary_text ?? '',
      pattern_text: review?.pattern_text ?? '',
      learning_text: review?.learning_text ?? '',
      next_focus_text: review?.next_focus_text ?? '',
    },
  });

  const saveMutation = useMutation({
    mutationFn: (data: ReviewForm) => weeklyApi.update(weekStart, data).then(r => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['weekly', weekStart] }),
  });

  const handleAiSummary = async () => {
    if (!review?.id) return;
    setLoadingAi(true);
    setAiError(false);
    try {
      // Исправлено: weeklyInsights → weeklySummary
      await aiApi.weeklySummary(review.id);
      queryClient.invalidateQueries({ queryKey: ['weekly', weekStart] });
    } catch {
      setAiError(true);
    } finally {
      setLoadingAi(false);
    }
  };

  if (isLoading) return <div className="page-loading"><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Недельный обзор</h1>
        <time className="page-subtitle">{formatDate(weekStart)}</time>
      </div>

      {/* AI summary — если есть */}
      {review?.ai_summary_text && (
        <AIWeeklySummaryCard summary={review.ai_summary_text} />
      )}

      {/* Кнопка генерации */}
      {!review?.ai_summary_text && (
        <div className="ai-trigger-wrap">
          <button
            className="btn btn-ghost btn-sm ai-trigger"
            onClick={handleAiSummary}
            disabled={loadingAi}
          >
            {loadingAi ? '🤖 Анализирую неделю...' : '🤖 Сгенерировать AI-резюме'}
          </button>
          {aiError && (
            <p className="error-text text-sm">Не удалось сгенерировать. Попробуй позже.</p>
          )}
        </div>
      )}

      {/* Направляющие вопросы — 6 штук по ТЗ п.19 */}
      <div className="guided-questions-block">
        <h3>Направляющие вопросы</h3>
        <ol className="guided-questions-list">
          {GUIDED_QUESTIONS.map((q, i) => (
            <li key={i} className="guided-question">
              <p className="question-text">{q}</p>
            </li>
          ))}
        </ol>
      </div>

      <form onSubmit={handleSubmit(d => saveMutation.mutate(d))} className="weekly-form">
        <div className="form-field">
          <label>Итоги недели</label>
          <textarea {...register('summary_text')} rows={4} placeholder="Кратко о неделе..." />
        </div>

        <div className="form-field">
          <label>Паттерны и закономерности</label>
          <textarea {...register('pattern_text')} rows={3} />
        </div>

        <div className="form-field">
          <label>Главный вывод</label>
          <textarea {...register('learning_text')} rows={3} />
        </div>

        <div className="form-field">
          <label>Фокус на следующей неделе</label>
          <textarea {...register('next_focus_text')} rows={2} />
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-full"
          disabled={!isDirty || saveMutation.isPending}
        >
          {saveMutation.isPending ? 'Сохранение...' : 'Сохранить обзор'}
        </button>
      </form>
    </div>
  );
}
