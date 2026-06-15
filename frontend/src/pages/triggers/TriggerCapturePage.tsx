import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { triggersApi } from '@/api/triggers'
import { Page } from '@/components/layout/Page'
import { useUIStore } from '@/store/uiStore'
import styles from './TriggerPage.module.css'

const CATEGORIES = ['отношения', 'одиночество', 'работа', 'семья', 'чувство бесполезности', 'ревность']

const schema = z.object({
  situation:        z.string().min(1, 'Опиши ситуацию'),
  auto_thought:     z.string().optional(),
  body_response:    z.string().optional(),
  impulse:          z.string().optional(),
  emotion_intensity:z.number().min(0).max(10).optional(),
  category:         z.string().optional(),
  old_script_activated: z.boolean(),
})
type Form = z.infer<typeof schema>

export default function TriggerCapturePage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const showToast = useUIStore(s => s.showToast)

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { emotion_intensity: 5, old_script_activated: true },
  })

  const intensity = watch('emotion_intensity') ?? 5
  const category  = watch('category')

  const mutation = useMutation({
    mutationFn: (data: Form) => triggersApi.create({
      ...data,
      description: data.situation,
      emotion_tags: [],
    }),
    onSuccess: ({ data }) => {
      qc.invalidateQueries({ queryKey: ['triggers'] })
      showToast('Триггер записан', 'success')
      navigate(`/triggers/${data.id}`)
    },
  })

  return (
    <Page title='Триггер'>
      <form onSubmit={handleSubmit(d => mutation.mutate(d))} className={styles.form}>

        <div className={styles.field}>
          <label className='label'>Что произошло? *</label>
          <textarea className={`input textarea ${errors.situation ? 'input-error' : ''}`}
            placeholder='Опиши ситуацию кратко...'
            {...register('situation')} />
          {errors.situation && <span className={styles.err}>{errors.situation.message}</span>}
        </div>

        <div className={styles.field}>
          <label className='label'>Автоматическая мысль</label>
          <input className='input' placeholder='Первая мысль которая пришла...'
            {...register('auto_thought')} />
        </div>

        <div className={styles.field}>
          <label className='label'>Интенсивность — {intensity}</label>
          <input type='range' min={0} max={10} step={1} className='slider'
            value={intensity}
            onChange={e => setValue('emotion_intensity', Number(e.target.value))} />
        </div>

        <div className={styles.field}>
          <label className='label'>Ощущение в теле</label>
          <input className='input' placeholder='Сжатие в груди, комок в горле...'
            {...register('body_response')} />
        </div>

        <div className={styles.field}>
          <label className='label'>Импульс</label>
          <input className='input' placeholder='Что хотелось сделать...'
            {...register('impulse')} />
        </div>

        <div className={styles.field}>
          <label className='label'>Категория</label>
          <div className={styles.chips}>
            {CATEGORIES.map(c => (
              <button key={c} type='button'
                className={`${styles.chip} ${category === c ? styles.chipActive : ''}`}
                onClick={() => setValue('category', category === c ? undefined : c)}>
                {c}
              </button>
            ))}
          </div>
        </div>

        <label className={styles.checkRow}>
          <input type='checkbox' {...register('old_script_activated')} />
          <span>Сработал старый сценарий</span>
        </label>

        <button type='submit' className='btn btn-primary' style={{ width:'100%' }}
          disabled={mutation.isPending}>
          {mutation.isPending ? 'Сохраняю...' : 'Записать триггер'}
        </button>
      </form>
    </Page>
  )
}
