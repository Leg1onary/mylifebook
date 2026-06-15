import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { personalContextApi } from '@/api/personalContext';
import { PersonalContextHint } from '@/components/ai/PersonalContextHint';

export function PersonalContextPage() {
  const queryClient = useQueryClient();
  const [rawText, setRawText] = useState('');
  const [loadingExtract, setLoadingExtract] = useState(false);
  const [extractSuccess, setExtractSuccess] = useState(false);

  const { data: context, isLoading } = useQuery({
    queryKey: ['personal-context'],
    queryFn: personalContextApi.get,
  });

  const { register, handleSubmit, formState: { isDirty } } = useForm({
    values: {
      core_beliefs: context?.core_beliefs?.join('\n') ?? '',
      grounding_phrases: context?.grounding_phrases?.join('\n') ?? '',
      important_relationships: context?.important_relationships
        ? JSON.stringify(context.important_relationships, null, 2)
        : '',
      triggers_summary: context?.triggers_summary ?? '',
      therapy_goals: context?.therapy_goals ?? '',
    },
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) => personalContextApi.update({
      ...data,
      core_beliefs: data.core_beliefs.split('\n').filter(Boolean),
      grounding_phrases: data.grounding_phrases.split('\n').filter(Boolean),
      important_relationships: data.important_relationships
        ? JSON.parse(data.important_relationships)
        : [],
    }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['personal-context'] }),
  });

  const handleExtract = async () => {
    if (!rawText.trim()) return;
    setLoadingExtract(true);
    try {
      await personalContextApi.extractRaw(rawText);
      queryClient.invalidateQueries({ queryKey: ['personal-context'] });
      setRawText('');
      setExtractSuccess(true);
      setTimeout(() => setExtractSuccess(false), 3000);
    } catch {
      // silent
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

      {/* AI extraction */}
      <div className="card">
        <h3>🤖 Извлечь из текста</h3>
        <p className="text-muted text-sm">Напиши о себе в свободной форме — AI найдёт ключевые паттерны и добавит их в профиль</p>
        <textarea
          value={rawText}
          onChange={e => setRawText(e.target.value)}
          rows={4}
          placeholder="Например: я часто боюсь, что меня осудят, мне важно одобрение близких..."
          className="mt-2"
        />
        <button
          className="btn btn-primary btn-sm mt-2"
          onClick={handleExtract}
          disabled={loadingExtract || !rawText.trim()}
        >
          {loadingExtract ? 'Извлекаю...' : 'Извлечь'}
        </button>
        {extractSuccess && <p className="success-text mt-1">✅ Контекст обновлён</p>}
      </div>

      {/* Manual form */}
      <form onSubmit={handleSubmit(d => saveMutation.mutate(d))} className="context-form">
        <div className="form-field">
          <label>Ключевые убеждения (каждое с новой строки)</label>
          <textarea {...register('core_beliefs')} rows={4}
            placeholder="Я должен быть лучшим...\nЕсли я ошибусь, меня осудят..." />
        </div>

        <div className="form-field">
          <label>Заземляющие фразы (до 5, каждая с новой строки)</label>
          <textarea {...register('grounding_phrases')} rows={3}
            placeholder="Я в безопасности\nЭто временно" />
        </div>

        <div className="form-field">
          <label>Важные отношения (JSON)</label>
          <textarea {...register('important_relationships')} rows={3}
            placeholder='[{"name": "Мама", "role": "важна"}]' />
        </div>

        <div className="form-field">
          <label>Общее о триггерах</label>
          <textarea {...register('triggers_summary')} rows={3} />
        </div>

        <div className="form-field">
          <label>Цели терапии</label>
          <textarea {...register('therapy_goals')} rows={3} />
        </div>

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
