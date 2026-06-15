import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { triggersApi } from '@/api/triggers'
import { Page } from '@/components/layout/Page'
import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Brain, Trash2 } from 'lucide-react'
import styles from './TriggerPage.module.css'

export default function TriggerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['trigger', id],
    queryFn: () => triggersApi.get(Number(id)).then(r => r.data),
  })

  const deleteMutation = useMutation({
    mutationFn: () => triggersApi.delete(Number(id)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['triggers'] })
      navigate(-1)
    },
  })

  if (isLoading) return <Page><div className='skeleton' style={{ height: '12rem', borderRadius: 'var(--radius-lg)' }} /></Page>
  if (!data) return <Page><p style={{ color: 'var(--color-text-muted)' }}>Не найдено</p></Page>

  return (
    <Page
      title='Триггер'
      action={
        <button className='btn-icon btn-danger' onClick={() => deleteMutation.mutate()}
          aria-label='Удалить'>
          <Trash2 size={18} />
        </button>
      }
    >
      <div className={styles.detail}>
        <p className={styles.detailDate}>
          {format(parseISO(data.created_at), 'd MMMM yyyy, HH:mm', { locale: ru })}
        </p>

        <div className={styles.detailBlock}>
          <p className={styles.detailLabel}>Ситуация</p>
          <p className={styles.detailText}>{data.situation || data.description}</p>
        </div>

        {data.auto_thought && (
          <div className={styles.detailBlock}>
            <p className={styles.detailLabel}>Автоматическая мысль</p>
            <p className={styles.detailText}>{data.auto_thought}</p>
          </div>
        )}

        {data.body_response && (
          <div className={styles.detailBlock}>
            <p className={styles.detailLabel}>Телесный отклик</p>
            <p className={styles.detailText}>{data.body_response}</p>
          </div>
        )}

        {data.impulse && (
          <div className={styles.detailBlock}>
            <p className={styles.detailLabel}>Импульс</p>
            <p className={styles.detailText}>{data.impulse}</p>
          </div>
        )}

        {data.emotion_intensity != null && (
          <div className={styles.detailBlock}>
            <p className={styles.detailLabel}>Интенсивность</p>
            <p className={styles.intensityBar}>
              <span style={{ width: `${data.emotion_intensity * 10}%`, background: 'var(--color-warning)' }} />
            </p>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{data.emotion_intensity}/10</p>
          </div>
        )}

        {data.category && <span className='badge badge-warning'>{data.category}</span>}

        {!data.linked_thought_record_id && (
          <button
            className='btn btn-ghost'
            style={{ width: '100%', marginTop: 'var(--space-4)' }}
            onClick={() => navigate(`/thoughts/new?triggerId=${data.id}`)}
          >
            <Brain size={16} />
            Разобрать мысль
          </button>
        )}
      </div>
    </Page>
  )
}
