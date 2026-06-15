import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { thoughtRecordsApi } from '@/api/thoughtRecords';
import { aiApi } from '@/api/ai';
import { useDraftStore } from '@/store/draftStore';
import { COGNITIVE_DISTORTIONS } from '@/lib/constants';
import type { ThoughtRecordCreate } from '@/types';

const STEPS = [
  { id: 1, title: 'Ситуация', field: 'situation_text', hint: 'Что происходило? Где, когда, с кем?' },
  { id: 2, title: 'Автоматическая мысль', field: 'automatic_thought_text', hint: 'Какая мысль мелькнула первой?' },
  { id: 3, title: 'Значение', field: 'meaning_text', hint: 'Что эта мысль означает о тебе или мире?' },
  { id: 4, title: 'Страх', field: 'fear_text', hint: 'Чего ты боишься, если эта мысль правда?' },
  { id: 5, title: 'Старый закон', field: 'old_law_text', hint: 'Какое убеждение лежит в основе?' },
  { id: 6, title: 'Реакция тела', field: 'body_reaction_text', hint: 'Что ощущаешь телесно?' },
  { id: 7, title: 'Действие-импульс', field: 'action_taken_text', hint: 'Что хотелось сделать или ты сделал?' },
  { id: 8, title: 'Доказательства «за»', field: 'evidence_for_text', hint: 'Что подтверждает эту мысль?' },
  { id: 9, title: 'Доказательства «против»', field: 'evidence_against_text', hint: 'Что опровергает или ставит под сомнение?' },
  { id: 10, title: 'Игнорируемые факты', field: 'ignored_facts_text', hint: 'Какие факты ты мог не заметить?' },
  { id: 11, title: 'Сбалансированная мысль', field: 'balanced_thought_text', hint: 'Более взвешенный взгляд на ситуацию' },
  { id: 12, title: 'Новое действие', field: 'new_action_text', hint: 'Что можно сделать иначе теперь?' },
];

const stepSchema = z.object({
  text: z.string().min(1, 'Заполни это поле'),
});

type StepForm = z.infer<typeof stepSchema>;

export function ThoughtRecordWizardPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const triggerId = searchParams.get('trigger_id');
  const { draft, updateDraft, clearDraft } = useDraftStore();

  const [step, setStep] = useState(draft.currentStep ?? 1);
  const [formData, setFormData] = useState<Partial<ThoughtRecordCreate>>(draft.data ?? {});
  const [distortions, setDistortions] = useState<string[]>([]);
  const [emotionBefore, setEmotionBefore] = useState(5);
  const [emotionAfter, setEmotionAfter] = useState(5);
  const [aiReframe, setAiReframe] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<StepForm>({
    resolver: zodResolver(stepSchema),
    defaultValues: { text: (formData as any)[STEPS[step - 1]?.field] ?? '' },
  });

  const createMutation = useMutation({
    mutationFn: thoughtRecordsApi.create,
    onSuccess: (data) => {
      clearDraft();
      navigate(`/thought-records/${data.id}`);
    },
  });

  const saveDraftMutation = useMutation({
    mutationFn: thoughtRecordsApi.createDraft,
  });

  const currentStep = STEPS[step - 1];
  const progress = (step / STEPS.length) * 100;

  const onStepSubmit = (values: StepForm) => {
    const updated = { ...formData, [currentStep.field]: values.text };
    setFormData(updated);
    updateDraft({ data: updated, currentStep: step + 1 });

    // Auto-save draft every 3 steps
    if (step % 3 === 0) {
      saveDraftMutation.mutate({ ...updated, is_draft: true } as any);
    }

    if (step < STEPS.length) {
      setStep(step + 1);
      setValue('text', (updated as any)[STEPS[step]?.field] ?? '');
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      setValue('text', (formData as any)[STEPS[step - 2]?.field] ?? '');
    } else {
      navigate(-1);
    }
  };

  const handleAiReframe = async () => {
    setLoadingAi(true);
    try {
      const result = await aiApi.reframe({
        situation: formData.situation_text ?? '',
        automatic_thought: formData.automatic_thought_text ?? '',
        evidence_for: formData.evidence_for_text ?? '',
        evidence_against: formData.evidence_against_text ?? '',
      });
      setAiReframe(result.alternative_thought);
    } catch {
      // silent fail
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
    } as ThoughtRecordCreate;
    createMutation.mutate(payload);
  };

  const toggleDistortion = (code: string) => {
    setDistortions(prev =>
      prev.includes(code) ? prev.filter(d => d !== code) : [...prev, code]
    );
  };

  // Step 11 special: show AI reframe button
  const isReframeStep = step === 11;
  // After step 12: distortions + emotions
  const isFinishScreen = step > STEPS.length;

  if (isFinishScreen) {
    return (
      <div className="wizard-page">
        <div className="wizard-header">
          <h1>Завершение</h1>
          <p>Отметь когнитивные искажения и оцени эмоцию</p>
        </div>

        <div className="wizard-section">
          <h3>Когнитивные искажения</h3>
          <div className="distortions-grid">
            {COGNITIVE_DISTORTIONS.map(d => (
              <button
                key={d.code}
                className={`distortion-chip ${distortions.includes(d.code) ? 'active' : ''}`}
                onClick={() => toggleDistortion(d.code)}
                type="button"
              >
                {d.name}
              </button>
            ))}
          </div>
        </div>

        <div className="wizard-section">
          <label>Интенсивность эмоции ДО (1–10)</label>
          <input
            type="range" min={1} max={10} value={emotionBefore}
            onChange={e => setEmotionBefore(Number(e.target.value))}
          />
          <span>{emotionBefore}</span>
        </div>

        <div className="wizard-section">
          <label>Интенсивность эмоции ПОСЛЕ (1–10)</label>
          <input
            type="range" min={1} max={10} value={emotionAfter}
            onChange={e => setEmotionAfter(Number(e.target.value))}
          />
          <span>{emotionAfter}</span>
        </div>

        <button
          className="btn btn-primary btn-full"
          onClick={handleFinish}
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? 'Сохранение...' : 'Сохранить запись'}
        </button>
        {createMutation.isError && (
          <p className="error-text">Ошибка сохранения. Попробуй ещё раз.</p>
        )}
      </div>
    );
  }

  return (
    <div className="wizard-page">
      <div className="wizard-progress">
        <div className="wizard-progress-bar" style={{ width: `${progress}%` }} />
      </div>

      <div className="wizard-header">
        <span className="wizard-step-counter">{step} / {STEPS.length}</span>
        <h2>{currentStep.title}</h2>
        <p className="wizard-hint">{currentStep.hint}</p>
      </div>

      <form onSubmit={handleSubmit(onStepSubmit)} className="wizard-form">
        <textarea
          {...register('text')}
          className={`wizard-textarea ${errors.text ? 'error' : ''}`}
          placeholder="Напиши здесь..."
          rows={5}
          autoFocus
        />
        {errors.text && <span className="error-text">{errors.text.message}</span>}

        {isReframeStep && (
          <div className="ai-hint-block">
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={handleAiReframe}
              disabled={loadingAi}
            >
              {loadingAi ? '🤖 Думаю...' : '🤖 Помощь AI'}
            </button>
            {aiReframe && (
              <div className="ai-suggestion">
                <p className="ai-suggestion-label">Предложение AI:</p>
                <p>{aiReframe}</p>
                <button
                  type="button"
                  className="btn btn-ghost btn-xs"
                  onClick={() => setValue('text', aiReframe)}
                >
                  Использовать
                </button>
              </div>
            )}
          </div>
        )}

        <div className="wizard-actions">
          <button type="button" className="btn btn-ghost" onClick={handleBack}>
            Назад
          </button>
          <button type="submit" className="btn btn-primary">
            {step === STEPS.length ? 'Далее →' : 'Далее →'}
          </button>
        </div>
      </form>
    </div>
  );
}
