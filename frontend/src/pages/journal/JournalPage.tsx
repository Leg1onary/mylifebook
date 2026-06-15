import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { journalApi } from '@/api/journal';
import { formatDate } from '@/lib/dates';
import type { JournalEntry } from '@/types';

const createSchema = z.object({
  title: z.string().optional(),
  body: z.string().min(1, 'Напиши хоть что-нибудь'),
  mood: z.number().min(1).max(10).optional(),
});

type CreateForm = z.infer<typeof createSchema>;

export function JournalPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['journal'],
    queryFn: journalApi.list,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateForm>({
    resolver: zodResolver(createSchema),
  });

  const createMutation = useMutation({
    mutationFn: journalApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal'] });
      setShowForm(false);
      reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: journalApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['journal'] }),
  });

  if (isLoading) return <div className="page-loading"><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Свободный журнал</h1>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Отмена' : '+ Запись'}
        </button>
      </div>

      {showForm && (
        <form
          className="card form-card"
          onSubmit={handleSubmit(d => createMutation.mutate(d))}
        >
          <div className="form-field">
            <label>Заголовок (необязательно)</label>
            <input {...register('title')} placeholder="О чём эта запись?" />
          </div>
          <div className="form-field">
            <label>Текст</label>
            <textarea
              {...register('body')}
              rows={6}
              placeholder="Пиши свободно — без структуры, без правил..."
              autoFocus
            />
            {errors.body && <span className="error-text">{errors.body.message}</span>}
          </div>
          <div className="form-field">
            <label>Настроение (1–10, необязательно)</label>
            <input type="number" min={1} max={10} {...register('mood', { valueAsNumber: true })} />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </form>
      )}

      {entries.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📓</div>
          <h3>Журнал пуст</h3>
          <p>Здесь можно писать свободно — мысли, чувства, заметки</p>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>Первая запись</button>
        </div>
      ) : (
        <div className="card-list">
          {entries.map((entry: JournalEntry) => (
            <div key={entry.id} className="card">
              <div className="card-header">
                <time className="card-date">{formatDate(entry.entry_date)}</time>
                {entry.mood && (
                  <span className="tag tag-muted">настроение {entry.mood}/10</span>
                )}
                <button
                  className="btn btn-ghost btn-icon btn-xs text-error"
                  onClick={() => { if (confirm('Удалить?')) deleteMutation.mutate(entry.id); }}
                  aria-label="Удалить"
                >🗑</button>
              </div>
              {entry.title && <h3 className="card-title">{entry.title}</h3>}
              <p
                className={`card-body ${expandedId === entry.id ? '' : 'card-body-collapsed'}`}
                onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
              >
                {entry.body}
              </p>
              {entry.body.length > 200 && (
                <button
                  className="btn btn-ghost btn-xs"
                  onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                >
                  {expandedId === entry.id ? 'Свернуть' : 'Читать далее'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
