import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { thoughtRecordsApi } from '@/api/thoughtRecords';
import { aiApi } from '@/api/ai';
import { useDraft } from '@/hooks/useDraft';
import { AIReframeCard } from '@/components/ai/AIReframeCard';
import { COGNITIVE_DISTORTIONS } from '@/lib/constants';
import type { ThoughtRecordCreate } from '@/types';
import type { AIReframe } from '@/types';

const STEPS = [
  { id: 1,  title: 'Ситуация',              field: 'situation_text',          hint: 'Что происходило? Где, когда, с кем?' },
  { id: 2,  title: 'Автоматическая мысль',  field: 'automatic_thought_text',  hint: 'Какая мысль мелькнула первой?' },
  { id: 3,  title: 'Значение',              field: 'meaning_text',            hint: 'Что эта мысль означает о тебе или мире?' },
  { id: 4,  title: 'Страх',                field: 'fear_text',               hint: 'Чего ты боишься, если эта мысль правда?' },
  { id: 5,  title: 'Старый закон',          field: 'old_law_text',            hint: 'Какое убеждение лежит в основе?' },
  { id: 6,  title: 'Реакция тела',          field: 'body_reaction_text',      hint: 'Что ощущаешь телесно?' },
  { id: 7,  title: 'Действие-импульс',      field: 'action_taken_text',       hint: 'Что хотелось сделать или ты сделал?' },
  { id: 8,  title: 'Доказательства «за»',   field: 'evidence_for_text',       hint: 'Что подтверждает эту мысль?' },
  { id: 9,  title: 'Доказательства «против»', field: 'evidence_against_text', hint: 'Что опровергает или ставит под сомнение?' },
  { id: 10, title: 'Игнорируемые факты',    field: 'ignored_facts_text',      hint: 'Какие факты ты мог не заметить?' },
  { id: 11, title: 'Сбалансированная мысль', field: 'balanced_thought_text',  hint: 'Более взвешенный взгляд на ситуацию' },
  { id: 12, title: 'Новое действие',        field: 'new_action_text',         hint: 'Что можно сделать иначе теперь?' },
];

const stepSchema = z.object({
  text: z.string().min(1, 'Заполни это поле'),
});
type StepForm = z.infer<typeof stepSchema>;

export default function ThoughtRecordWizardPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const triggerId = searchParams.get('trigger_id');
  const { draft, updateDraft, resetDraft } = useDraft();

  const [step, setStep] = useState(draft.currentStep ?? 1);
  const [formData, setFormData] = useState<Partial<ThoughtRecordCreate>>(draft.data ?? {});
  const [distortions, setDistortions] = useState<string[]>([]);
  const [emotionBefore, setEmotionBefore] = useState(5);
  const [emotionAfter, setEmotionAfter] = useState(5);
  // savedDraftId — id черновика, созданного при автосохранении на шагах кратных 3
  const [savedDraftId, setSavedDraftId] = useState<number | null>(null);
  const [aiReframe, setAiReframe] = useState<AIReframe | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiError, setAiError] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<StepForm>({
    resolver: zodResolver(stepSchema),
    defaultValues: { text: (formData as Record<string, unknown>)[STEPS[step - 1]?.field] as string ?? '' },
  });

  const createMutation = useMutation({
    mutationFn: thoughtRecordsApi.create,
    onSuccess: (data) => {
      resetDraft();
      navigate(`/thoughts/${data.data.id}`);
    },
  });

  // Создаём/обновляем черновик для автосохранения и AI reframe
  const saveDraftMutation = useMutation({
    mutationFn: (payload: ThoughtRecordCreate & { id?: number }) => {
      if (payload.id) {
        const { id, ...rest } = payload;
        return thoughtRecordsApi.update(id, { ...rest, is_draft: true });
      }
      return thoughtRecordsApi.create({ ...payload, is_draft: true });
    },
    onSuccess: (data) => {
      const id = data.data.id;
      if (!savedDraftId) setSavedDraftId(id);
    },
  });

  const currentStep = STEPS[step - 1];
  const progress = (step / STEPS.length) * 100;
  const isReframeStep = step === 11;
  const isFinishScreen = step > STEPS.length;

  const onStepSubmit = (values: StepForm) => {
    const updated = { ...formData, [currentStep.field]: values.text };
    setFormData(updated);
    updateDraft({ data: updated, currentStep: step + 1 });

    if (step % 3 === 0) {
      saveDraftMutation.mutate({
        ...updated,
        ...(savedDraftId ? { id: savedDraftId } : {}),
        trigger_event_id: triggerId ? Number(triggerId) : undefined,
        is_draft: true,
      } as ThoughtRecordCreate & { id?: number });
    }

    if (step < STEPS.length) {
      setStep(step + 1);
      setValue('text', (updated as Record<string, unknown>)[STEPS[step]?.field] as string ?? '');
    } else {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      setValue('text', (formData as Record<string, unknown>)[STEPS[step - 2]?.field] as string ?? '');
    } else {
      navigate(-1);
    }
  };

  /**
   * AI reframe flow:
   * 1. Сохраняем текущие данные как черновик (создаём или обновляем)
   * 2. Получаем id черновика
   * 3. Вызываем POST /ai/reframe/{id}
   * 4. Показываем результат через AIReframeCard
   */
  const handleAiReframe = async () => {
    setLoadingAi(true);
    setAiError(false);
    setAiReframe(null);
    try {
      let draftId = savedDraftId;
      // Если черновика ещё нет — создаём
      if (!draftId) {
        const res = await thoughtRecordsApi.create({
          ...formData,
          trigger_event_id: triggerId ? Number(triggerId) : undefined,
          is_draft: true,
        });
        draftId = res.data.id;
        setSavedDraftId(draftId);
      } else {
        // Обновляем существующий черновик свежими данными
        await thoughtRecordsApi.update(draftId, {
          ...formData,
          is_draft: true,
        });
      }
      const result = await aiApi.reframe(draftId);
      setAiReframe(result);
    } catch {
      setAiError(true);
    } finally {
      setLoadingAi(false);
    }
  };

  const handleFinish = () => {
    const payload: ThoughtRecordCreate = {
      ...formData,
      trigger_event_id: triggerId ? Number(triggerId) : undefined,
      distortions,
      emotion_before_score: emotionBefore,
      emotion_after_score: emotionAfter,
      is_draft: false,
    };
    // Если черновик уже существует — обновляем, иначе создаём
    if (savedDraftId) {
      thoughtRecordsApi.update(savedDraftId, { ...payload, is_draft: false }).then(res => {
        resetDraft();
        navigate(`/thoughts/${res.data.id}`);
      });
    } else {
      createMutation.mutate(payload);
    }
  };

  const toggleDistortion = (code: string) => {
    setDistortions(prev =>
      prev.includes(code) ? prev.filter(d => d !== code) : [...prev, code]
    );
  };

  if (isFinishScreen) {
    return (
      <div className='wizard-page'>
        <div className='wizard-header'>
          <h1>Завершение</h1>
          <p>Отметь когнитивные искажения и оцени эмоцию</p>
        </div>

        <div className='wizard-section'>
          <h3>Когнитивные искажения</h3>
          <div className='distortions-grid'>
            {COGNITIVE_DISTORTIONS.map(d => (
              <button
                key={d.code}
                className={`distortion-chip${distortions.includes(d.code) ? ' active' : ''}`}
                onClick={() => toggleDistortion(d.code)}
                type='button'
              >
                {d.name}
              </button>
            ))}
          </div>
        </div>

        <div className='wizard-section'>
          <label className='label'>Интенсивность эмоции ДО (1–10)</label>
          <input
            type='range' min={1} max={10} value={emotionBefore}
            onChange={e => setEmotionBefore(Number(e.target.value))}
          />
          <span className='range-value'>{emotionBefore}</span>
        </div>

        <div className='wizard-section'>
          <label className='label'>Интенсивность эмоции ПОСЛЕ (1–10)</label>
          <input
            type='range' min={1} max={10} value={emotionAfter}
            onChange={e => setEmotionAfter(Number(e.target.value))}
          />
          <span className='range-value'>{emotionAfter}</span>
        </div>

        <button
          className='btn btn-primary btn-full'
          onClick={handleFinish}
          disabled={createMutation.isPending}
          style={{ marginTop: 'var(--space-4)', width: '100%' }}
        >
          {createMutation.isPending ? 'Сохранение...' : 'Сохранить запись'}
        </button>

        {createMutation.isError && (
          <p className='error-text'>Ошибка сохранения. Попробуй ещё раз.</p>
        )}
      </div>
    );
  }

  return (
    <div className='wizard-page'>
      <div className='wizard-progress'>
        <div className='wizard-progress-bar' style={{ width: `${progress}%` }} />
      </div>

      <div className='wizard-header'>
        <span className='wizard-step-counter'>{step} / {STEPS.length}</span>
        <h2>{currentStep.title}</h2>
        <p className='wizard-hint'>{currentStep.hint}</p>
      </div>

      <form onSubmit={handleSubmit(onStepSubmit)} className='wizard-form'>
        <textarea
          {...register('text')}
          className={`wizard-textarea${errors.text ? ' error' : ''}`}
          placeholder='Напиши здесь...'
          rows={5}
          autoFocus
        />
        {errors.text && <span className='error-text'>{errors.text.message}</span>}

        {isReframeStep && (
          <div className='ai-hint-block'>
            <button
              type='button'
              className='btn btn-ghost btn-sm'
              onClick={handleAiReframe}
              disabled={loadingAi}
            >
              {loadingAi ? '🤖 Думаю...' : '🤖 Помощь AI'}
            </button>

            {aiError && (
              <p className='error-text' style={{ marginTop: 'var(--space-2)' }}>
                AI недоступен, попробуй позже
              </p>
            )}

            {aiReframe && (
              <div style={{ marginTop: 'var(--space-3)' }}>
                <AIReframeCard
                  reframe={aiReframe}
                  onUse={(text) => setValue('text', text)}
                  onDismiss={() => setAiReframe(null)}
                />
              </div>
            )}
          </div>
        )}

        <div className='wizard-actions'>
          <button type='button' className='btn btn-ghost' onClick={handleBack}>
            Назад
          </button>
          <button type='submit' className='btn btn-primary'>
            Далее →
          </button>
        </div>
      </form>
    </div>
  );
}
