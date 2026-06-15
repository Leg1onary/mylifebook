import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { triggersApi } from '@/api/triggers';
import { useUIStore } from '@/store/uiStore';

const sosSchema = z.object({
  situation_text: z.string().min(2, 'Опиши что происходит'),
  first_thought_text: z.string().optional(),
  body_reaction_text: z.string().optional(),
  action_urge_text: z.string().optional(),
});

type SOSForm = z.infer<typeof sosSchema>;

export function SOSModal() {
  const { sosOpen, closeSOS } = useUIStore();
  const [step, setStep] = React.useState(1);
  const [saved, setSaved] = React.useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<SOSForm>({
    resolver: zodResolver(sosSchema),
  });

  const saveMutation = useMutation({
    mutationFn: triggersApi.create,
    onSuccess: () => {
      setSaved(true);
      setTimeout(() => {
        closeSOS();
        setStep(1);
        setSaved(false);
        reset();
      }, 2000);
    },
  });

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSOS();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [closeSOS]);

  if (!sosOpen) return null;

  const STEPS = [
    {
      id: 1,
      label: 'Что происходит?',
      field: 'situation_text' as const,
      hint: 'Опиши ситуацию кратко',
      required: true,
    },
    {
      id: 2,
      label: 'Первая мысль',
      field: 'first_thought_text' as const,
      hint: 'Что мелькнуло в голове?',
      required: false,
    },
    {
      id: 3,
      label: 'Реакция тела',
      field: 'body_reaction_text' as const,
      hint: 'Что ощущаешь телесно?',
      required: false,
    },
    {
      id: 4,
      label: 'Импульс к действию',
      field: 'action_urge_text' as const,
      hint: 'Что хочется сделать прямо сейчас?',
      required: false,
    },
  ];

  const currentStep = STEPS[step - 1];

  if (saved) {
    return (
      <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="SOS сохранён">
        <div className="modal sos-modal">
          <div className="sos-saved">
            <span className="sos-saved-icon">✅</span>
            <p>Момент зафиксирован</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="SOS — быстрая фиксация"
      onClick={e => { if (e.target === e.currentTarget) closeSOS(); }}
    >
      <div className="modal sos-modal">
        <div className="modal-header">
          <h2>🆘 SOS</h2>
          <button className="btn btn-ghost btn-icon" onClick={closeSOS} aria-label="Закрыть">✕</button>
        </div>

        <div className="sos-progress">
          {STEPS.map(s => (
            <div key={s.id} className={`sos-dot ${step >= s.id ? 'active' : ''}`} />
          ))}
        </div>

        <form
          onSubmit={handleSubmit(d => saveMutation.mutate(d))}
          className="sos-form"
        >
          <div className="sos-step">
            <label className="sos-label">{currentStep.label}</label>
            <p className="sos-hint">{currentStep.hint}</p>
            <textarea
              {...register(currentStep.field)}
              rows={3}
              autoFocus
              className={errors[currentStep.field] ? 'error' : ''}
            />
            {currentStep.field === 'situation_text' && errors.situation_text && (
              <span className="error-text">{errors.situation_text.message}</span>
            )}
          </div>

          <div className="sos-actions">
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
      </div>
    </div>
  );
}
