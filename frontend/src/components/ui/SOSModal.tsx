import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { triggersApi } from '@/api/triggers';
import { personalContextApi } from '@/api/personalContext';
import { useUIStore } from '@/store/uiStore';
import styles from './SOSModal.module.css';

// ТЗ п.21: полный SOS flow
const sosSchema = z.object({
  situation:      z.string().min(2, 'Опиши что происходит'),
  auto_thought:   z.string().optional(),
  emotion_intensity: z.number().min(0).max(10),
  body_response:  z.string().optional(),
  old_law:        z.string().optional(),
  impulse:        z.string().optional(),
});

type SOSForm = z.infer<typeof sosSchema>;

const STEPS = [
  {
    id: 1,
    label: 'Что происходит?',
    field: 'situation' as const,
    type: 'textarea' as const,
    hint: 'Опиши ситуацию кратко',
    required: true,
  },
  {
    id: 2,
    label: 'Первая мысль',
    field: 'auto_thought' as const,
    type: 'textarea' as const,
    hint: 'Что мелькнуло в голове?',
    required: false,
  },
  {
    id: 3,
    label: 'Интенсивность (0–10)',
    field: 'emotion_intensity' as const,
    type: 'range' as const,
    hint: 'Насколько сильно накрыло?',
    required: true,
  },
  {
    id: 4,
    label: 'Какой старый закон?',
    field: 'old_law' as const,
    type: 'textarea' as const,
    hint: 'Какой внутренний приговор включился?',
    required: false,
  },
  {
    id: 5,
    label: 'Импульс',
    field: 'impulse' as const,
    type: 'textarea' as const,
    hint: 'Что хочется сделать прямо сейчас?',
    required: false,
  },
] as const;

type StepField = typeof STEPS[number]['field'];

export function SOSModal() {
  const { sosOpen, closeSOS } = useUIStore();
  const [step, setStep] = React.useState(1);
  const [saved, setSaved] = React.useState(false);
  const [savedId, setSavedId] = React.useState<number | null>(null);

  const { data: context } = useQuery({
    queryKey: ['personal-context'],
    queryFn: personalContextApi.get,
    enabled: sosOpen,
    select: d => d.data,
  });
  const groundingPhrase = context?.grounding_phrases?.[0] ?? null;

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<SOSForm>({
    resolver: zodResolver(sosSchema),
    defaultValues: { emotion_intensity: 5 },
  });

  const emotionScore = watch('emotion_intensity');

  const saveMutation = useMutation({
    mutationFn: (data: SOSForm) => triggersApi.create({
      // description is required — derive from situation (max 100 chars)
      description: data.situation.slice(0, 100),
      situation:        data.situation,
      auto_thought:     data.auto_thought,
      body_response:    data.body_response,
      impulse:          data.impulse,
      old_law:          data.old_law,
      emotion_intensity: data.emotion_intensity,
    }),
    onSuccess: (res) => {
      setSavedId(res.data?.id ?? null);
      setSaved(true);
    },
  });

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const handleClose = () => {
    closeSOS();
    setTimeout(() => {
      setStep(1);
      setSaved(false);
      setSavedId(null);
      reset();
    }, 300);
  };

  if (!sosOpen) return null;

  if (saved) {
    return (
      <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="SOS сохранён">
        <div className={styles.modal}>
          <div className={styles.savedState}>
            <div className={styles.savedIcon}>✅</div>
            <p className={styles.savedTitle}>Момент зафиксирован</p>

            {groundingPhrase && (
              <div className={styles.groundingCard}>
                <p className={styles.groundingLabel}>Сейчас:</p>
                <p className={styles.groundingPhrase}>«{groundingPhrase}»</p>
              </div>
            )}

            <div className={styles.savedActions}>
              <button className="btn btn-ghost btn-sm" onClick={handleClose}>
                Закрыть
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  handleClose();
                  setTimeout(() => {
                    window.location.href = '/thoughts/new';
                  }, 350);
                }}
              >
                Разобрать подробнее →
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentStep = STEPS[step - 1];

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label="SOS — быстрая фиксация"
      onClick={e => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>🆘 SOS</h2>
          <button className="btn btn-ghost btn-icon" onClick={handleClose} aria-label="Закрыть">✕</button>
        </div>

        <div className={styles.progress} role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={STEPS.length}>
          {STEPS.map(s => (
            <div key={s.id} className={`${styles.dot} ${step >= s.id ? styles.dotActive : ''}`} />
          ))}
        </div>

        <form
          onSubmit={handleSubmit(d => saveMutation.mutate(d))}
          className={styles.form}
        >
          <div className={styles.stepContent}>
            <label className={styles.stepLabel}>{currentStep.label}</label>
            <p className={styles.stepHint}>{currentStep.hint}</p>

            {currentStep.type === 'range' ? (
              <div className={styles.rangeWrap}>
                <input
                  type="range"
                  min={0}
                  max={10}
                  step={1}
                  {...register('emotion_intensity', { valueAsNumber: true })}
                  className={styles.range}
                />
                <span className={styles.rangeValue}>{emotionScore ?? 5}</span>
              </div>
            ) : (
              <textarea
                {...register(currentStep.field as Exclude<StepField, 'emotion_intensity'>)}
                rows={3}
                autoFocus
                className={errors[currentStep.field as keyof SOSForm] ? styles.inputError : ''}
              />
            )}

            {currentStep.field === 'situation' && errors.situation && (
              <span className={styles.errorText}>{errors.situation.message}</span>
            )}
          </div>

          <div className={styles.actions}>
            {step > 1 && (
              <button type="button" className="btn btn-ghost" onClick={() => setStep(s => s - 1)}>
                Назад
              </button>
            )}
            {step < STEPS.length ? (
              <button type="button" className="btn btn-primary" onClick={() => setStep(s => s + 1)}>
                Далее
              </button>
            ) : (
              <button type="submit" className="btn btn-primary" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? 'Сохраняю...' : 'Сохранить'}
              </button>
            )}
          </div>
        </form>

        {saveMutation.isError && (
          <p className={styles.errorText}>Не удалось сохранить. Попробуй ещё раз.</p>
        )}
      </div>
    </div>
  );
}
