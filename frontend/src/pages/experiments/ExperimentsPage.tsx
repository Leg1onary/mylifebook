import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { experimentsApi } from '@/api/experiments';
import { formatDate } from '@/lib/dates';
import type { Experiment } from '@/types';

const createSchema = z.object({
  old_law_text: z.string().min(2, 'Укажи убеждение'),
  fear_text: z.string().min(2, 'Укажи страх'),
  experiment_action_text: z.string().min(2, 'Опиши эксперимент'),
  prediction_text: z.string().min(2, 'Опиши предсказание'),
  fear_before_score: z.number().min(1).max(10),
  scheduled_for: z.string().optional(),
});

type CreateForm = z.infer<typeof createSchema>;

const STATUS_LABELS: Record<string, string> = {
  planned: 'Запланирован',
  in_progress: 'В процессе',
  completed: 'Завершён',
  cancelled: 'Отменён',
};

const STATUS_COLORS: Record<string, string> = {
  planned: 'tag-blue',
  in_progress: 'tag-orange',
  completed: 'tag-green',
  cancelled: 'tag-muted',
};

export function ExperimentsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  const { data: experiments = [], isLoading } = useQuery({
    queryKey: ['experiments'],
    queryFn: experimentsApi.list,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateForm>({
    resolver: zodResolver(createSchema),
    defaultValues: { fear_before_score: 6 },
  });

  const createMutation = useMutation({
    mutationFn: experimentsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiments'] });
      setShowForm(false);
      reset();
    },
  });

  const filtered = filter === 'all'
    ? experiments
    : experiments.filter((e: Experiment) => e.status === filter);

  if (isLoading) return <div className="page-loading"><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Эксперименты</h1>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Отмена' : '+ Новый'}
        </button>
      </div>

      {showForm && (
        <form
          className="card form-card"
          onSubmit={handleSubmit(d => createMutation.mutate(d))}
        >
          <h3>Новый эксперимент</h3>

          <div className="form-field">
            <label>Старый закон / убеждение</label>
            <textarea {...register('old_law_text')} rows={2} placeholder="Например: я должен всё делать идеально" />
            {errors.old_law_text && <span className="error-text">{errors.old_law_text.message}</span>}
          </div>

          <div className="form-field">
            <label>Страх (если убеждение правда)</label>
            <textarea {...register('fear_text')} rows={2} />
            {errors.fear_text && <span className="error-text">{errors.fear_text.message}</span>}
          </div>

          <div className="form-field">
            <label>Действие эксперимента</label>
            <textarea {...register('experiment_action_text')} rows={2}
              placeholder="Что конкретно сделать, чтобы проверить убеждение?" />
            {errors.experiment_action_text && <span className="error-text">{errors.experiment_action_text.message}</span>}
          </div>

          <div className="form-field">
            <label>Предсказание</label>
            <textarea {...register('prediction_text')} rows={2}
              placeholder="Что, по-твоему, произойдёт?" />
            {errors.prediction_text && <span className="error-text">{errors.prediction_text.message}</span>}
          </div>

          <div className="form-field">
            <label>Страх ДО (1–10): <strong>{}</strong></label>
            <input type="range" min={1} max={10} {...register('fear_before_score', { valueAsNumber: true })} />
          </div>

          <div className="form-field">
            <label>Дата выполнения (необязательно)</label>
            <input type="date" {...register('scheduled_for')} />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Создание...' : 'Создать'}
            </button>
          </div>
        </form>
      )}

      <div className="filter-tabs">
        {['all', 'planned', 'in_progress', 'completed'].map(s => (
          <button
            key={s}
            className={`filter-tab ${filter === s ? 'active' : ''}`}
            onClick={() => setFilter(s)}
          >
            {s === 'all' ? 'Все' : STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🧪</div>
          <h3>Нет экспериментов</h3>
          <p>Создай поведенческий эксперимент, чтобы проверить убеждение</p>
        </div>
      ) : (
        <div className="card-list">
          {filtered.map((exp: Experiment) => (
            <Link key={exp.id} to={`/experiments/${exp.id}`} className="card card-link">
              <div className="card-header">
                <span className={`tag ${STATUS_COLORS[exp.status]}`}>
                  {STATUS_LABELS[exp.status]}
                </span>
                <time className="card-date">{formatDate(exp.created_at)}</time>
              </div>
              <p className="card-title">{exp.old_law_text}</p>
              <p className="card-subtitle">{exp.experiment_action_text}</p>
              {exp.scheduled_for && (
                <p className="card-meta">📅 {formatDate(exp.scheduled_for)}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
