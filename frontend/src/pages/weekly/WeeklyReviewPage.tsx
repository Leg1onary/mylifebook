import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { weeklyApi } from '@/api/weekly';
import { aiApi } from '@/api/ai';
import { formatDate, getCurrentWeekStart } from '@/lib/dates';
import { AIWeeklySummaryCard } from '@/components/ai/AIWeeklySummaryCard';

const GUIDED_QUESTIONS = [
  'Что было самым трудным на этой неделе?',
  'Какие паттерны ты заметил в своих мыслях или поведении?',
  'Что помогло тебе справляться?',
  'Что ты хочешь изменить или продолжить на следующей неделе?',
];

export default function WeeklyReviewPage() {
  const queryClient = useQueryClient();
  const weekStart = getCurrentWeekStart();
  const [loadingAi, setLoadingAi] = useState(false);

  const { data: review, isLoading } = useQuery({
    queryKey: ['weekly', weekStart],
    queryFn: () => weeklyApi.getByWeekStart(weekStart).then(r => r.data),
  });

  const { register, handleSubmit, formState: { isDirty } } = useForm({
    values: {
      summary_text: review?.summary_text ?? '',
      pattern_text: review?.pattern_text ?? '',
      learning_text: review?.learning_text ?? '',
      next_focus_text: review?.next_focus_text ?? '',
    },
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) => weeklyApi.update(weekStart, data).then(r => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['weekly', weekStart] }),
  });

  const handleAiSummary = async () => {
    if (!review?.id) return;
    setLoadingAi(true);
    try {
      await aiApi.weeklyInsights(review.id);
      queryClient.invalidateQueries({ queryKey: ['weekly', weekStart] });
    } catch {
      // silent
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

      {review?.ai_summary_text && (
        <AIWeeklySummaryCard summary={review.ai_summary_text} />
      )}

      {!review?.ai_summary_text && (
        <button
          className="btn btn-ghost btn-sm ai-trigger"
          onClick={handleAiSummary}
          disabled={loadingAi}
        >
          {loadingAi ? '🤖 Анализирую неделю...' : '🤖 Сгенерировать AI-резюме'}
        </button>
      )}

      <form onSubmit={handleSubmit(d => saveMutation.mutate(d))} className="weekly-form">
        <h3>Направляющие вопросы</h3>
        {GUIDED_QUESTIONS.map((q, i) => (
          <div key={i} className="guided-question">
            <p className="question-text">{q}</p>
          </div>
        ))}

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
