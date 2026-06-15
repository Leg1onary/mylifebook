import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { weeklyApi } from '@/api/weekly';
import { aiApi } from '@/api/ai';
import { formatDate, getCurrentWeekStart } from '@/lib/dates';
import { AIWeeklySummaryCard } from '@/components/ai/AIWeeklySummaryCard';
import type { WeeklyReviewUpdate } from '@/types';

type ReviewFormFields = Required<Pick<WeeklyReviewUpdate,
  'guided_q1' | 'guided_q2' | 'guided_q3' | 'guided_q4' | 'guided_q5' | 'guided_q6' |
  'conclusion' | 'next_week_focus'
>>;

const GUIDED_QUESTIONS = [
  'Где неделя ударила сильнее всего?',
  'Какой старый закон включался чаще всего?',
  'Где ты подчинился ему автоматически?',
  'Где получилось не подчиниться?',
  'Что оказалось не таким страшным, как ожидалось?',
  'Что стоит проверить на следующей неделе?',
] as const;

const GUIDED_KEYS = [
  'guided_q1', 'guided_q2', 'guided_q3',
  'guided_q4', 'guided_q5', 'guided_q6',
] as const;

export default function WeeklyReviewPage() {
  const queryClient = useQueryClient();
  const weekStart = getCurrentWeekStart();
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiError, setAiError] = useState(false);

  const { data: review, isLoading } = useQuery({
    queryKey: ['weekly', weekStart],
    queryFn: () => weeklyApi.getByWeekStart(weekStart).then(r => r.data),
  });

  const { register, handleSubmit, reset, formState: { isDirty } } = useForm<ReviewFormFields>({
    defaultValues: {
      guided_q1: '', guided_q2: '', guided_q3: '',
      guided_q4: '', guided_q5: '', guided_q6: '',
      conclusion: '', next_week_focus: '',
    },
  });

  useEffect(() => {
    if (!review) return;
    reset({
      guided_q1:      review.guided_q1      ?? '',
      guided_q2:      review.guided_q2      ?? '',
      guided_q3:      review.guided_q3      ?? '',
      guided_q4:      review.guided_q4      ?? '',
      guided_q5:      review.guided_q5      ?? '',
      guided_q6:      review.guided_q6      ?? '',
      conclusion:     review.conclusion     ?? '',
      next_week_focus: review.next_week_focus ?? '',
    });
  }, [review, reset]);

  const saveMutation = useMutation({
    mutationFn: (fields: ReviewFormFields) =>
      weeklyApi.update(weekStart, { week_start: weekStart, ...fields }).then(r => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['weekly', weekStart] }),
  });

  const handleAiSummary = async () => {
    setLoadingAi(true);
    setAiError(false);
    try {
      await aiApi.weeklySummary(weekStart);
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

      {review?.ai_summary && (
        <AIWeeklySummaryCard summary={review.ai_summary} />
      )}

      {!review?.ai_summary && (
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

      <form onSubmit={handleSubmit(d => saveMutation.mutate(d))} className="weekly-form">
        <div className="guided-questions-block">
          <h3>Направляющие вопросы</h3>
          {GUIDED_KEYS.map((key, i) => (
            <div key={key} className="form-field">
              <label>{GUIDED_QUESTIONS[i]}</label>
              <textarea {...register(key)} rows={3} />
            </div>
          ))}
        </div>

        <div className="form-field">
          <label>Вывод недели</label>
          <textarea {...register('conclusion')} rows={3} />
        </div>

        <div className="form-field">
          <label>Фокус на следующей неделе</label>
          <textarea {...register('next_week_focus')} rows={2} />
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
