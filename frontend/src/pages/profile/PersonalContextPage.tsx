import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { personalContextApi } from '@/api/personalContext';
import { PersonalContextHint } from '@/components/ai/PersonalContextHint';
import { Page } from '@/components/layout/Page';
import type { PersonalContextUpdate } from '@/types';
import styles from './PersonalContextPage.module.css';

/**
 * Form mirrors backend PersonalContext fields exactly:
 * old_core_belief, new_core_belief, personal_triggers (newline-separated),
 * strengths (newline-separated), grounding_phrases (newline-separated),
 * therapy_goals, ai_context_note
 */
type FormValues = {
  old_core_belief: string;
  new_core_belief: string;
  personal_triggers: string;
  strengths: string;
  grounding_phrases: string;
  therapy_goals: string;
  ai_context_note: string;
};

function splitLines(s?: string | null): string {
  return (s ?? '');
}

function toLines(arr?: string[] | null): string {
  return arr?.join('\n') ?? '';
}

export default function PersonalContextPage() {
  const queryClient = useQueryClient();
  const [rawText, setRawText] = useState('');
  const [loadingExtract, setLoadingExtract] = useState(false);
  const [extractSuccess, setExtractSuccess] = useState(false);
  const [extractError, setExtractError] = useState(false);

  const { data: context, isLoading } = useQuery({
    queryKey: ['personal-context'],
    queryFn: () => personalContextApi.get().then(r => r.data),
  });

  const { register, handleSubmit, reset, formState: { isDirty } } = useForm<FormValues>({
    defaultValues: {
      old_core_belief: '',
      new_core_belief: '',
      personal_triggers: '',
      strengths: '',
      grounding_phrases: '',
      therapy_goals: '',
      ai_context_note: '',
    },
  });

  React.useEffect(() => {
    if (!context) return;
    reset({
      old_core_belief:   context.old_core_belief   ?? '',
      new_core_belief:   context.new_core_belief   ?? '',
      personal_triggers: toLines(context.personal_triggers),
      strengths:         toLines(context.strengths),
      grounding_phrases: toLines(context.grounding_phrases),
      therapy_goals:     context.therapy_goals     ?? '',
      ai_context_note:   context.ai_context_note   ?? '',
    });
  }, [context, reset]);

  const saveMutation = useMutation({
    mutationFn: (data: FormValues) => {
      const payload: PersonalContextUpdate = {
        old_core_belief:   data.old_core_belief   || null,
        new_core_belief:   data.new_core_belief   || null,
        personal_triggers: data.personal_triggers.split('\n').filter(Boolean),
        strengths:         data.strengths.split('\n').filter(Boolean),
        grounding_phrases: data.grounding_phrases.split('\n').filter(Boolean).slice(0, 5),
        therapy_goals:     data.therapy_goals     || null,
        ai_context_note:   data.ai_context_note   || null,
      };
      return personalContextApi.update(payload);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['personal-context'] }),
  });

  const handleExtract = async () => {
    if (!rawText.trim()) return;
    setLoadingExtract(true);
    setExtractError(false);
    try {
      await personalContextApi.extract(rawText);
      await queryClient.invalidateQueries({ queryKey: ['personal-context'] });
      setRawText('');
      setExtractSuccess(true);
      setTimeout(() => setExtractSuccess(false), 4000);
    } catch {
      setExtractError(true);
    } finally {
      setLoadingExtract(false);
    }
  };

  if (isLoading) return (
    <Page><div className={styles.loading}><div className="spinner" /></div></Page>
  );

  return (
    <Page>
      <div className={styles.header}>
        <h1>Личный контекст</h1>
      </div>

      <PersonalContextHint />

      {/* AI extract block */}
      <div className={`card ${styles.extractCard}`}>
        <h3>🤖 Извлечь из текста</h3>
        <p className={styles.extractHint}>
          Напиши о себе в свободной форме — AI найдёт ключевые паттерны и заполнит профиль
        </p>
        <textarea
          className={styles.extractTextarea}
          value={rawText}
          onChange={e => setRawText(e.target.value)}
          rows={4}
          placeholder="Например: я часто боюсь, что меня осудят, мне важно одобрение близких..."
          disabled={loadingExtract}
        />
        <button
          className="btn btn-primary"
          onClick={handleExtract}
          disabled={loadingExtract || !rawText.trim()}
        >
          {loadingExtract ? 'Извлекаю...' : '✨ Извлечь'}
        </button>
        {extractSuccess && <p className={styles.successText}>✅ Контекст обновлён</p>}
        {extractError && <p className={styles.errorText}>Не удалось извлечь. Попробуй ещё раз.</p>}
      </div>

      <form onSubmit={handleSubmit(d => saveMutation.mutate(d))} className={styles.form}>

        <div className={styles.formField}>
          <label>Старый закон (core belief)</label>
          <span className={styles.fieldHint}>Главный внутренний приговор который держит</span>
          <textarea
            {...register('old_core_belief')}
            rows={2}
            placeholder="Моя ценность = моя польза людям..."
          />
        </div>

        <div className={styles.formField}>
          <label>Новый закон</label>
          <span className={styles.fieldHint}>Альтернативное убеждение которое ты формируешь</span>
          <textarea
            {...register('new_core_belief')}
            rows={2}
            placeholder="Я ценен просто потому что существую..."
          />
        </div>

        <div className={styles.formField}>
          <label>Типичные триггеры</label>
          <span className={styles.fieldHint}>Каждый с новой строки</span>
          <textarea
            {...register('personal_triggers')}
            rows={4}
            placeholder="Долгое молчание в переписке...\nОтказ в просьбе..."
          />
        </div>

        <div className={styles.formField}>
          <label>Мои сильные стороны</label>
          <span className={styles.fieldHint}>Каждая с новой строки — используются в AI-подсказках</span>
          <textarea
            {...register('strengths')}
            rows={3}
            placeholder="Умею анализировать ситуацию...\nЗабочусь о близких..."
          />
        </div>

        <div className={styles.formField}>
          <label>Граундинг-фразы</label>
          <span className={styles.fieldHint}>
            До 5 фраз, каждая с новой строки. Показываются в SOS-режиме.
          </span>
          <textarea
            {...register('grounding_phrases')}
            rows={3}
            placeholder="Я в безопасности прямо сейчас...\nЭто пройдёт..."
          />
        </div>

        <div className={styles.formField}>
          <label>Цели терапии</label>
          <textarea
            {...register('therapy_goals')}
            rows={3}
            placeholder="Разорвать связь ценности и полезности...\nНаучиться просить помощи..."
          />
        </div>

        <div className={styles.formField}>
          <label>Заметки для AI</label>
          <span className={styles.fieldHint}>
            Дополнительный контекст который AI учитывает при рефреймингах и резюме
          </span>
          <textarea
            {...register('ai_context_note')}
            rows={3}
            placeholder="Важно учитывать что у меня сложные отношения с отцом..."
          />
        </div>

        {saveMutation.isError && (
          <p className={styles.errorText}>Не удалось сохранить. Попробуй ещё раз.</p>
        )}

        <button
          type="submit"
          className={`btn btn-primary ${styles.btnFull}`}
          disabled={!isDirty || saveMutation.isPending}
        >
          {saveMutation.isPending ? 'Сохранение...' : 'Сохранить'}
        </button>
      </form>
    </Page>
  );
}
