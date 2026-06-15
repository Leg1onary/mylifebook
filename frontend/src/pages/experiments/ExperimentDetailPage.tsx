import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { experimentsApi } from '@/api/experiments';
import { formatDate } from '@/lib/dates';
import { Page } from '@/components/layout/Page';

const followUpSchema = z.object({
  actual_result_text: z.string().min(2, 'Опиши что произошло'),
  came_true_text: z.string().optional(),
  did_not_come_true_text: z.string().optional(),
  learning_text: z.string().min(2, 'Напиши вывод'),
  fear_after_score: z.number().min(1).max(10),
});

type FollowUpForm = z.infer<typeof followUpSchema>;

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

  const { register, handleSubmit, formState: { errors } } = useForm<FollowUpForm>({
    resolver: zodResolver(followUpSchema),
    defaultValues: { fear_after_score: 4 },
  });

  const updateMutation = useMutation({
    mutationFn: (data: FollowUpForm) => experimentsApi.update(Number(id), {
      ...data,
      status: 'completed',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiment', id] });
      queryClient.invalidateQueries({ queryKey: ['experiments'] });
      setShowFollowUp(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => experimentsApi.delete(Number(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiments'] });
      navigate('/experiments');
    },
  });

  if (isLoading) return (
    <Page>
      <div className="page-loading"><div className="spinner" /></div>
    </Page>
  );

  if (error || !exp) return (
    <Page>
      <div className="page-error">
        <p>Эксперимент не найден</p>
        <Link to="/experiments" className="btn btn-primary">К экспериментам</Link>
      </div>
    </Page>
  );

  const isCompleted = exp.status === 'completed';

  return (
    <Page>
      <div className="detail-header">
        <button onClick={() => navigate(-1)} className="btn btn-ghost btn-icon" aria-label="Назад">←</button>
        <h1>Эксперимент</h1>
        <button
          onClick={() => { if (window.confirm('Удалить эксперимент?')) deleteMutation.mutate(); }}
          className="btn btn-ghost btn-icon"
          aria-label="Удалить"
          style={{ color: 'var(--color-error)' }}
          disabled={deleteMutation.isPending}
        >
          🗑
        </button>
      </div>

      <div className="detail-fields">
        <div className="detail-field">
          <span className="detail-field-label">Убеждение</span>
          <p className="detail-field-value">{exp.old_law_text}</p>
        </div>
        <div className="detail-field">
          <span className="detail-field-label">Страх</span>
          <p className="detail-field-value">{exp.fear_text}</p>
        </div>
        <div className="detail-field">
          <span className="detail-field-label">Действие</span>
          <p className="detail-field-value">{exp.experiment_action_text}</p>
        </div>
        <div className="detail-field">
          <span className="detail-field-label">Предсказание</span>
          <p className="detail-field-value">{exp.prediction_text}</p>
        </div>
        {exp.scheduled_for && (
          <div className="detail-field">
            <span className="detail-field-label">Запланировано на</span>
            <p className="detail-field-value">{formatDate(exp.scheduled_for)}</p>
          </div>
        )}
        <div className="detail-field">
          <span className="detail-field-label">Страх ДО</span>
          <p className="detail-field-value">{exp.fear_before_score}/10</p>
        </div>
      </div>

      {/* Результат если завершён */}
      {isCompleted && (
        <div className="detail-section">
          <h3>Результат</h3>
          <div className="detail-fields">
            <div className="detail-field">
              <span className="detail-field-label">Что произошло</span>
              <p className="detail-field-value">{exp.actual_result_text}</p>
            </div>
            {exp.came_true_text && (
              <div className="detail-field">
                <span className="detail-field-label">Что сбылось</span>
                <p className="detail-field-value">{exp.came_true_text}</p>
              </div>
            )}
            {exp.did_not_come_true_text && (
              <div className="detail-field">
                <span className="detail-field-label">Что не сбылось</span>
                <p className="detail-field-value">{exp.did_not_come_true_text}</p>
              </div>
            )}
            <div className="detail-field">
              <span className="detail-field-label">Вывод</span>
              <p className="detail-field-value">{exp.learning_text}</p>
            </div>
            <div className="detail-field">
              <span className="detail-field-label">Страх ПОСЛЕ</span>
              <p className="detail-field-value">{exp.fear_after_score}/10</p>
            </div>
          </div>
        </div>
      )}

      {/* Follow-up форма */}
      {!isCompleted && (
        <div className="detail-actions">
          {!showFollowUp ? (
            <button className="btn btn-primary" onClick={() => setShowFollowUp(true)}>
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
                <textarea {...register('actual_result_text')} rows={3} />
                {errors.actual_result_text && <span className="error-text">{errors.actual_result_text.message}</span>}
              </div>

              <div className="form-field">
                <label>Что из предсказания сбылось?</label>
                <textarea {...register('came_true_text')} rows={2} />
              </div>

              <div className="form-field">
                <label>Что НЕ сбылось?</label>
                <textarea {...register('did_not_come_true_text')} rows={2} />
              </div>

              <div className="form-field">
                <label>Главный вывод</label>
                <textarea {...register('learning_text')} rows={2} />
                {errors.learning_text && <span className="error-text">{errors.learning_text.message}</span>}
              </div>

              <div className="form-field">
                <label>Страх ПОСЛЕ (1–10)</label>
                <input
                  type="range" min={1} max={10}
                  {...register('fear_after_score', { valueAsNumber: true })}
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowFollowUp(false)}>Отмена</button>
                <button type="submit" className="btn btn-primary" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? 'Сохранение...' : 'Сохранить'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {exp.thought_record_id && (
        <Link to={`/thought-records/${exp.thought_record_id}`} className="btn btn-ghost btn-sm">
          Связанная запись мышления →
        </Link>
      )}
    </Page>
  );
}
