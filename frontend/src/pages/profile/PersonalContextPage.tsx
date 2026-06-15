import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { personalContextApi } from '@/api/personalContext';
import { PersonalContextHint } from '@/components/ai/PersonalContextHint';
import type { PersonalContextUpdate } from '@/types';

type FormValues = {
  old_laws: string;
  triggers: string;
  typical_distortions: string;
  growth_goals: string;
  communication_prefs: string;
  context_notes: string;
};

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
      old_laws: '',
      triggers: '',
      typical_distortions: '',
      growth_goals: '',
      communication_prefs: '',
      context_notes: '',
    },
  });

  React.useEffect(() => {
    if (!context) return;
    reset({
      old_laws:            context.old_laws?.join('\n')            ?? '',
      triggers:            context.triggers?.join('\n')            ?? '',
      typical_distortions: context.typical_distortions?.join('\n') ?? '',
      growth_goals:        context.growth_goals?.join('\n')        ?? '',
      communication_prefs: context.communication_prefs            ?? '',
      context_notes:       context.context_notes                  ?? '',
    });
  }, [context, reset]);

  const saveMutation = useMutation({
    mutationFn: (data: FormValues) => {
      const payload: PersonalContextUpdate = {
        old_laws:            data.old_laws.split('\n').filter(Boolean),
        triggers:            data.triggers.split('\n').filter(Boolean),
        typical_distortions: data.typical_distortions.split('\n').filter(Boolean),
        growth_goals:        data.growth_goals.split('\n').filter(Boolean),
        communication_prefs: data.communication_prefs || undefined,
        context_notes:       data.context_notes || undefined,
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
      // POST /personal-context/extract — { raw_text, merge: false }
      await personalContextApi.extract(rawText, false);
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

  if (isLoading) return <div className="page-loading"><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Личный контекст</h1>
      </div>

      <PersonalContextHint />

      {/* POST /personal-context/extract */}
      <div className="card">
        <h3>🤖 Извлечь из текста</h3>
        <p className="text-muted text-sm">
          Напиши о себе в свободной форме — AI найдёт ключевые паттерны и добавит их в профиль
        </p>
        <textarea
          value={rawText}
          onChange={e => setRawText(e.target.value)}
          rows={4}
          placeholder="Например: я часто боюсь, что меня осудят, мне важно одобрение близких..."
          className="mt-2"
          disabled={loadingExtract}
        />
        <button
          className="btn btn-primary btn-sm mt-2"
          onClick={handleExtract}
          disabled={loadingExtract || !rawText.trim()}
        >
          {loadingExtract ? 'Извлекаю...' : '✨ Извлечь'}
        </button>
        {extractSuccess && <p className="success-text mt-1">✅ Контекст обновлён</p>}
        {extractError && <p className="error-text mt-1">Не удалось извлечь. Попробуй ещё раз.</p>}
      </div>

      <form onSubmit={handleSubmit(d => saveMutation.mutate(d))} className="context-form">
        <div className="form-field">
          <label>Старые законы</label>
          <p className="field-hint text-xs text-muted">Каждый с новой строки</p>
          <textarea {...register('old_laws')} rows={4}
            placeholder="Моя ценность = моя польза...\nЕсли я слабый — меня бросят..." />
        </div>

        <div className="form-field">
          <label>Типичные триггеры</label>
          <p className="field-hint text-xs text-muted">Каждый с новой строки</p>
          <textarea {...register('triggers')} rows={3}
            placeholder="Долгое молчание в переписке...\nОтказ в просьбе..." />
        </div>

        <div className="form-field">
          <label>Типичные искажения</label>
          <p className="field-hint text-xs text-muted">Каждое с новой строки</p>
          <textarea {...register('typical_distortions')} rows={3}
            placeholder="Чтение мыслей...\nКатастрофизация..." />
        </div>

        <div className="form-field">
          <label>Цели роста</label>
          <p className="field-hint text-xs text-muted">Каждая с новой строки. Используются в SOS и AI-подсказках.</p>
          <textarea {...register('growth_goals')} rows={3}
            placeholder="Разорвать связь ценности и полезности...\nНаучиться просить помощи..." />
        </div>

        <div className="form-field">
          <label>Предпочтения общения</label>
          <textarea {...register('communication_prefs')} rows={2}
            placeholder="Предпочитаю прямую обратную связь без смягчений..." />
        </div>

        <div className="form-field">
          <label>Заметки</label>
          <textarea {...register('context_notes')} rows={3} />
        </div>

        {saveMutation.isError && <p className="error-text">Не удалось сохранить. Попробуй ещё раз.</p>}

        <button
          type="submit"
          className="btn btn-primary btn-full"
          disabled={!isDirty || saveMutation.isPending}
        >
          {saveMutation.isPending ? 'Сохранение...' : 'Сохранить'}
        </button>
      </form>
    </div>
  );
}
