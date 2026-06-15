import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { journalApi } from '@/api/journal';
import { triggersApi } from '@/api/triggers';
import { formatDate } from '@/lib/dates';
import type { JournalEntry, TriggerEvent } from '@/types';
import styles from './JournalPage.module.css';

const createSchema = z.object({
  title: z.string().optional(),
  body: z.string().min(1, 'Напиши хоть что-нибудь'),
  mood: z.number().min(1).max(10).optional(),
  linked_trigger_id: z.number().optional(),
});

type CreateForm = z.infer<typeof createSchema>;

export default function JournalPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['journal'],
    queryFn: () => journalApi.list().then((r: { data: JournalEntry[] }) => r.data),
  });

  const { data: triggers = [] } = useQuery({
    queryKey: ['triggers', 'recent'],
    queryFn: () => triggersApi.list({ limit: 20 }).then((r: { data: TriggerEvent[] }) => r.data),
    enabled: showForm,
  });

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<CreateForm>({
    resolver: zodResolver(createSchema),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateForm) => journalApi.create({
      title: data.title,
      body: data.body,
      mood: data.mood,
      linked_trigger_id: data.linked_trigger_id,
    }),
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
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Свободный журнал</h1>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Отмена' : '+ Запись'}
        </button>
      </div>

      {showForm && (
        <form
          className={`card form-card ${styles.form}`}
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
            <input
              type="number"
              min={1}
              max={10}
              {...register('mood', { valueAsNumber: true })}
            />
          </div>

          {triggers.length > 0 && (
            <div className="form-field">
              <label>Связать с триггером (необязательно)</label>
              <Controller
                name="linked_trigger_id"
                control={control}
                render={({ field }) => (
                  <select
                    className="input"
                    value={field.value ?? ''}
                    onChange={e => field.onChange(
                      e.target.value ? Number(e.target.value) : undefined
                    )}
                  >
                    <option value="">— не связывать —</option>
                    {triggers.map((t: TriggerEvent) => (
                      <option key={t.id} value={t.id}>
                        {formatDate(t.created_at)}: {t.situation.slice(0, 60)}{t.situation.length > 60 ? '…' : ''}
                      </option>
                    ))}
                  </select>
                )}
              />
            </div>
          )}

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </form>
      )}

      {entries.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📓</div>
          <h3>Журнал пуст</h3>
          <p>Здесь можно писать свободно — мысли, чувства, заметки</p>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>Первая запись</button>
        </div>
      ) : (
        <div className={styles.list}>
          {entries.map((entry: JournalEntry) => (
            <div key={entry.id} className="card">
              <div className={styles.cardHeader}>
                <time className={styles.cardDate}>{formatDate(entry.entry_date)}</time>
                {entry.mood != null && (
                  <span className={`badge ${styles.moodBadge}`}>настроение {entry.mood}/10</span>
                )}
                {entry.linked_trigger_id != null && (
                  <span className={`badge badge-primary ${styles.linkBadge}`} title={`Триггер #${entry.linked_trigger_id}`}>
                    🔗 триггер
                  </span>
                )}
                <button
                  className="btn btn-icon btn-sm"
                  onClick={() => { if (confirm('Удалить запись?')) deleteMutation.mutate(entry.id); }}
                  aria-label="Удалить запись"
                >🗑</button>
              </div>
              {entry.title && <h3 className={styles.cardTitle}>{entry.title}</h3>}
              <p
                className={`${styles.cardBody} ${expandedId === entry.id ? styles.cardBodyExpanded : styles.cardBodyCollapsed}`}
                onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
              >
                {entry.body}
              </p>
              {entry.body.length > 200 && (
                <button
                  className="btn btn-ghost btn-sm"
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
