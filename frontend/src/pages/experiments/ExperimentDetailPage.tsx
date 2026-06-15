import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { experimentsApi } from '@/api/experiments';
import { formatDate } from '@/lib/dates';
import { Page } from '@/components/layout/Page';
import styles from './ExperimentDetailPage.module.css';

const followUpSchema = z.object({
  result:      z.string().min(2, 'Опиши что произошло'),
  what_worked: z.string().optional(),
  what_didnt:  z.string().optional(),
  conclusion:  z.string().min(2, 'Напиши вывод'),
  fear_after:  z.number().min(1).max(10),
});

type FollowUpForm = z.infer<typeof followUpSchema>;

const STATUS_LABEL: Record<string, string> = {
  planned:  'Запланирован',
  active:   'Активен',
  complete: 'Завершён',
};

const STATUS_CLASS: Record<string, string> = {
  planned:  styles.statusPlanned,
  active:   styles.statusActive,
  complete: styles.statusComplete,
};

export default function ExperimentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showFollowUp, setShowFollowUp] = useState(false);

  const { data: exp, isLoading, error } = useQuery({
    queryKey: ['experiment', id],
    queryFn: () => experimentsApi.getById(Number(id)).then(r => r.data),
    enabled: !!id,
  });

  const { register, handleSubmit, control, watch, formState: { errors } } = useForm<FollowUpForm>({
    resolver: zodResolver(followUpSchema),
    defaultValues: { fear_after: 4 },
  });

  const fearAfterValue = watch('fear_after');

  const updateMutation = useMutation({
    mutationFn: (data: FollowUpForm) =>
      experimentsApi.update(Number(id!), { ...data, status: 'complete' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiment', id] });
      queryClient.invalidateQueries({ queryKey: ['experiments'] });
      setShowFollowUp(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => experimentsApi.delete(Number(id!)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiments'] });
      navigate('/experiments');
    },
  });

  if (isLoading) return (
    <Page><div className="page-loading"><div className="spinner" /></div></Page>
  );

  if (error || !exp) return (
    <Page>
      <div className="page-error">
        <p>Эксперимент не найден</p>
        <Link to="/experiments" className="btn btn-primary">К экспериментам</Link>
      </div>
    </Page>
  );

  const isCompleted = exp.status === 'complete';
  const statusClass = STATUS_CLASS[exp.status] ?? styles.statusPlanned;

  return (
    <Page>
      <div className="detail-header">
        <button
          onClick={() => navigate(-1)}
          className="btn btn-ghost btn-icon"
          aria-label="Назад"
        >←</button>
        <h1>Эксперимент</h1>
        <button
          onClick={() => { if (window.confirm('Удалить эксперимент?')) deleteMutation.mutate(); }}
          className="btn btn-ghost btn-icon"
          aria-label="Удалить"
          disabled={deleteMutation.isPending}
        >
          🗑
        </button>
      </div>

      {/* Status badge */}
      <span className={`${styles.statusBadge} ${statusClass}`}>
        {STATUS_LABEL[exp.status] ?? exp.status}
      </span>

      <div className="detail-fields">
        <div className="detail-field">
          <span className="detail-field-label">Старый закон</span>
          <p className="detail-field-value">{exp.old_law}</p>
        </div>
        <div className="detail-field">
          <span className="detail-field-label">Страх</span>
          <p className="detail-field-value">{exp.fear_description}</p>
        </div>
        <div className="detail-field">
          <span className="detail-field-label">Действие</span>
          <p className="detail-field-value">{exp.action_plan}</p>
        </div>
        <div className="detail-field">
          <span className="detail-field-label">Прогноз</span>
          <p className="detail-field-value">{exp.forecast}</p>
        </div>
        {exp.planned_date && (
          <div className="detail-field">
            <span className="detail-field-label">Запланировано на</span>
            <p className="detail-field-value">{formatDate(exp.planned_date)}</p>
          </div>
        )}
        <div className="detail-field">
          <span className="detail-field-label">Страх до</span>
          <p className="detail-field-value">{exp.fear_before}/10</p>
        </div>
      </div>

      {/* Completed result block */}
      {isCompleted && (
        <div className="detail-section">
          <h3>Результат</h3>
          <div className="detail-fields">
            <div className="detail-field">
              <span className="detail-field-label">Что произошло</span>
              <p className="detail-field-value">{exp.result}</p>
            </div>
            {exp.what_worked && (
              <div className="detail-field">
                <span className="detail-field-label">Что сработало</span>
                <p className="detail-field-value">{exp.what_worked}</p>
              </div>
            )}
            {exp.what_didnt && (
              <div className="detail-field">
                <span className="detail-field-label">Что не сбылось</span>
                <p className="detail-field-value">{exp.what_didnt}</p>
              </div>
            )}
            <div className="detail-field">
              <span className="detail-field-label">Вывод</span>
              <p className="detail-field-value">{exp.conclusion}</p>
            </div>
            <div className="detail-field">
              <span className="detail-field-label">Страх после</span>
              <p className="detail-field-value">{exp.fear_after}/10</p>
            </div>
          </div>
        </div>
      )}

      {/* Follow-up form */}
      {!isCompleted && (
        <div className="detail-actions">
          {!showFollowUp ? (
            <button
              className="btn btn-primary"
              onClick={() => setShowFollowUp(true)}
            >
              ✅ Завершить эксперимент
            </button>
          ) : (
            <form
              className="card form-card"
              onSubmit={handleSubmit(d => updateMutation.mutate(d))}
            >
              <h3>Что получилось?</h3>

              <div className="form-field">
                <label>Что реально произошло?</label>
                <textarea {...register('result')} rows={3} />
                {errors.result && <span className="error-text">{errors.result.message}</span>}
              </div>

              <div className="form-field">
                <label>Что сработало?</label>
                <textarea {...register('what_worked')} rows={2} />
              </div>

              <div className="form-field">
                <label>Что не сбылось?</label>
                <textarea {...register('what_didnt')} rows={2} />
              </div>

              <div className="form-field">
                <label>Главный вывод</label>
                <textarea {...register('conclusion')} rows={2} />
                {errors.conclusion && <span className="error-text">{errors.conclusion.message}</span>}
              </div>

              <div className="form-field">
                <label>Страх после (1–10)</label>
                <div className={styles.fearRange}>
                  <Controller
                    name="fear_after"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="range"
                        min={1}
                        max={10}
                        value={field.value}
                        onChange={e => field.onChange(Number(e.target.value))}
                      />
                    )}
                  />
                  <span className={styles.fearRangeValue}>{fearAfterValue}/10</span>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setShowFollowUp(false)}
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? 'Сохранение...' : 'Сохранить'}
                </button>
              </div>

              {updateMutation.isError && (
                <p className="error-text">Ошибка сохранения. Попробуй ещё раз.</p>
              )}
            </form>
          )}
        </div>
      )}

      {/* Linked thought record */}
      {exp.linked_thought_record_id && (
        <div className={styles.linkedRecord}>
          <Link
            to={`/thought-records/${exp.linked_thought_record_id}`}
            className="btn btn-ghost btn-sm"
          >
            Связанная запись мышления →
          </Link>
        </div>
      )}
    </Page>
  );
}
