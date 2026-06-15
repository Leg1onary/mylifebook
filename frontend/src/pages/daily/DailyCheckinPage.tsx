import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { dailyApi } from '@/api/daily'
import { Page } from '@/components/layout/Page'
import { RangeSlider, CheckboxField } from '@/components/forms'
import { format } from 'date-fns'
import { useUIStore } from '@/store/uiStore'
import styles from './DailyCheckinPage.module.css'

const EMOTIONS = [
  { key: 'mood',        label: 'Настроение',   color: 'var(--color-mood)' },
  { key: 'energy',     label: 'Энергия',     color: 'var(--color-energy)' },
  { key: 'anxiety',    label: 'Тревога',     color: 'var(--color-anxiety)' },
  { key: 'shame',      label: 'Стыд',        color: 'var(--color-shame)' },
  { key: 'loneliness', label: 'Одиночество',  color: 'var(--color-loneliness)' },
  { key: 'anger',      label: 'Злость',       color: 'var(--color-anger)' },
] as const

const schema = z.object({
  mood:        z.number().min(1).max(10).optional(),
  energy:      z.number().min(1).max(10).optional(),
  anxiety:     z.number().min(1).max(10).optional(),
  shame:       z.number().min(1).max(10).optional(),
  loneliness:  z.number().min(1).max(10).optional(),
  anger:       z.number().min(1).max(10).optional(),
  had_trigger: z.boolean(),
  note_main:   z.string().max(1000).optional(),
  note_pain:   z.string().max(1000).optional(),
  note_need:   z.string().max(500).optional(),
})
type Form = z.infer<typeof schema>

export default function DailyCheckinPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const showToast = useUIStore(s => s.showToast)
  const today = format(new Date(), 'yyyy-MM-dd')

  const { data: existing } = useQuery({
    queryKey: ['checkin', today],
    queryFn: () => dailyApi.getByDate(today).then(r => r.data).catch(() => null),
    retry: false,
  })

  const { control, handleSubmit } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {
      mood:        existing?.mood ?? 5,
      energy:      existing?.energy ?? 5,
      anxiety:     existing?.anxiety ?? 5,
      shame:       existing?.shame ?? 5,
      loneliness:  existing?.loneliness ?? 5,
      anger:       existing?.anger ?? 5,
      had_trigger: existing?.had_trigger ?? false,
      note_main:   existing?.note_main ?? '',
      note_pain:   existing?.note_pain ?? '',
      note_need:   existing?.note_need ?? '',
    },
  })

  const mutation = useMutation({
    mutationFn: (data: Form) => existing
      ? dailyApi.update(existing.id, data)
      : dailyApi.create({ entry_date: today, emotion_tags: [], ...data }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['today'] })
      qc.invalidateQueries({ queryKey: ['checkin', today] })
      showToast('Чекин сохранён', 'success')
      navigate('/today')
    },
  })

  return (
    <Page title='Чекин'>
      <form onSubmit={handleSubmit(d => mutation.mutate(d))} className={styles.form}>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Как сейчас?</h2>
          {EMOTIONS.map(({ key, label, color }) => (
            <Controller
              key={key}
              name={key}
              control={control}
              render={({ field }) => (
                <RangeSlider
                  label={label}
                  value={field.value ?? 5}
                  min={1}
                  max={10}
                  color={color}
                  onChange={field.onChange}
                />
              )}
            />
          ))}
        </div>

        <Controller
          name='had_trigger'
          control={control}
          render={({ field }) => (
            <CheckboxField
              label='Был триггер сегодня'
              description='Отметь, если что-то вызвало сильную эмоциональную реакцию'
              checked={field.value}
              onChange={field.onChange}
            />
          )}
        />

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Заметки</h2>

          <Controller name='note_main' control={control} render={({ field }) => (
            <div className={styles.field}>
              <label className='label'>Что произошло сегодня?</label>
              <textarea className='input textarea' placeholder='Главное событие дня...'
                {...field} />
            </div>
          )} />

          <Controller name='note_pain' control={control} render={({ field }) => (
            <div className={styles.field}>
              <label className='label'>Что болит?</label>
              <textarea className='input textarea' placeholder='Что сейчас тяжело...'
                {...field} />
            </div>
          )} />

          <Controller name='note_need' control={control} render={({ field }) => (
            <div className={styles.field}>
              <label className='label'>Что нужно?</label>
              <input className='input' placeholder='Мне сейчас нужно...' {...field} />
            </div>
          )} />
        </div>

        <button type='submit' className='btn btn-primary' style={{ width: '100%' }}
          disabled={mutation.isPending}>
          {mutation.isPending ? 'Сохраняю...' : 'Сохранить'}
        </button>
      </form>
    </Page>
  )
}
