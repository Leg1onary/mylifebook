import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { weeklyApi } from '@/api/weekly';
import { aiApi } from '@/api/ai';
import { formatDate, getCurrentWeekStart } from '@/lib/dates';
import { AIWeeklySummaryCard } from '@/components/ai/AIWeeklySummaryCard';
import { Page } from '@/components/layout/Page';
import type { WeeklyReviewUpdate, WeeklyReview } from '@/types';
import styles from './WeeklyReviewPage.module.css';

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

function ScoreBar({ label, value }: { label: string; value?: number | null }) {
  if (value == null) return null;
  const pct = Math.round((value / 10) * 100);
  return (
    <div className={styles.scoreRow}>
      <span className={styles.scoreLabel}>{label}</span>
      <div className={styles.scoreBarTrack}>
        <div className={styles.scoreBarFill} style={{ width: `${pct}%` }} />
      </div>
      <span className={styles.scoreValue}>{value.toFixed(1)}</span>
    </div>
  );
}

function WeekMetrics({ review }: { review: WeeklyReview }) {
  const hasScores = review.avg_mood != null || review.avg_anxiety != null ||
    review.avg_shame != null || review.avg_loneliness != null;
  const hasCounts = review.checkins_count != null || review.triggers_count != null ||
    review.tr_count != null || review.experiments_count != null;
  const hasTopLaws = (review.top_old_laws?.length ?? 0) > 0;
  const hasTopTriggers = (review.top_trigger_categories?.length ?? 0) > 0;

  if (!hasScores && !hasCounts && !hasTopLaws && !hasTopTriggers) return null;

  return (
    <div className={styles.metricsBlock}>
      <h3 className={styles.metricsTitle}>📊 Статистика недели</h3>

      {hasCounts && (
        <div className={styles.countsGrid}>
          {review.checkins_count != null && (
            <div className={styles.countCard}>
              <span className={styles.countValue}>{review.checkins_count}</span>
              <span className={styles.countLabel}>чекинов</span>
            </div>
          )}
          {review.triggers_count != null && (
            <div className={styles.countCard}>
              <span className={styles.countValue}>{review.triggers_count}</span>
              <span className={styles.countLabel}>триггеров</span>
            </div>
          )}
          {review.tr_count != null && (
            <div className={styles.countCard}>
              <span className={styles.countValue}>{review.tr_count}</span>
              <span className={styles.countLabel}>записей мыслей</span>
            </div>
          )}
          {review.experiments_count != null && (
            <div className={styles.countCard}>
              <span className={styles.countValue}>{review.experiments_count}</span>
              <span className={styles.countLabel}>экспериментов</span>
            </div>
          )}
        </div>
      )}

      {hasScores && (
        <div className={styles.scoresBlock}>
          <ScoreBar label="Настроение" value={review.avg_mood} />
          <ScoreBar label="Тревога" value={review.avg_anxiety} />
          <ScoreBar label="Стыд" value={review.avg_shame} />
          <ScoreBar label="Одиночество" value={review.avg_loneliness} />
        </div>
      )}

      {hasTopLaws && (
        <div className={styles.topList}>
          <h4>Топ старых законов</h4>
          <ul>
            {review.top_old_laws!.map((item, i) => (
              <li key={i} className={styles.topItem}>
                <span className={styles.topRank}>#{i + 1}</span>
                <span className={styles.topText}>{item.law}</span>
                <span className={styles.topCount}>{item.count}×</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {hasTopTriggers && (
        <div className={styles.topList}>
          <h4>Топ категорий триггеров</h4>
          <ul>
            {review.top_trigger_categories!.map((item, i) => (
              <li key={i} className={styles.topItem}>
                <span className={styles.topRank}>#{i + 1}</span>
                <span className={styles.topText}>{item.category}</span>
                <span className={styles.topCount}>{item.count}×</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

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
      guided_q1:       review.guided_q1       ?? '',
      guided_q2:       review.guided_q2       ?? '',
      guided_q3:       review.guided_q3       ?? '',
      guided_q4:       review.guided_q4       ?? '',
      guided_q5:       review.guided_q5       ?? '',
      guided_q6:       review.guided_q6       ?? '',
      conclusion:      review.conclusion      ?? '',
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

  if (isLoading) return (
    <Page><div className={styles.loading}><div className="spinner" /></div></Page>
  );

  return (
    <Page>
      <div className={styles.header}>
        <h1>Недельный обзор</h1>
        <time className={styles.subtitle}>{formatDate(weekStart)}</time>
      </div>

      {/* Auto-metrics block — TZ п.19 */}
      {review && <WeekMetrics review={review} />}

      {/* AI summary */}
      {review?.ai_summary && (
        <AIWeeklySummaryCard summary={review.ai_summary} />
      )}

      {!review?.ai_summary && (
        <div className={styles.aiTriggerWrap}>
          <button
            className="btn btn-ghost"
            onClick={handleAiSummary}
            disabled={loadingAi}
          >
            {loadingAi ? '🤖 Анализирую неделю...' : '🤖 Сгенерировать AI-резюме'}
          </button>
          {aiError && (
            <p className={styles.errorText}>Не удалось сгенерировать. Попробуй позже.</p>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit(d => saveMutation.mutate(d))} className={styles.form}>
        <div className={styles.guidedBlock}>
          <h3>Направляющие вопросы</h3>
          {GUIDED_KEYS.map((key, i) => (
            <div key={key} className={styles.formField}>
              <label>{GUIDED_QUESTIONS[i]}</label>
              <textarea {...register(key)} rows={3} />
            </div>
          ))}
        </div>

        <div className={styles.formField}>
          <label>Вывод недели</label>
          <textarea {...register('conclusion')} rows={3} />
        </div>

        <div className={styles.formField}>
          <label>Фокус на следующей неделе</label>
          <textarea {...register('next_week_focus')} rows={2} />
        </div>

        <button
          type="submit"
          className={`btn btn-primary ${styles.btnFull}`}
          disabled={!isDirty || saveMutation.isPending}
        >
          {saveMutation.isPending ? 'Сохранение...' : 'Сохранить обзор'}
        </button>
      </form>
    </Page>
  );
}
