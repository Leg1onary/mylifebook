import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { dailyApi } from '@/api/daily'
import { Page } from '@/components/layout/Page'
import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import styles from './DailyHistoryPage.module.css'

export default function DailyHistoryPage() {
  const navigate = useNavigate()
  const { data, isLoading } = useQuery({
    queryKey: ['checkins'],
    queryFn: () => dailyApi.list({ limit: 60 }).then(r => r.data),
  })

  const MOOD_COLOR = (v: number | null) => {
    if (!v) return 'var(--color-text-faint)'
    if (v >= 7) return 'var(--color-success)'
    if (v >= 4) return 'var(--color-warning)'
    return 'var(--color-error)'
  }

  return (
    <Page title='История чекинов'
      action={
        <button className='btn btn-primary' onClick={() => navigate('/checkin')}>
          + Чекин
        </button>
      }
    >
      {isLoading && (
        <div style={{ display:'flex', flexDirection:'column', gap:'var(--space-3)' }}>
          {[1,2,3,4,5].map(i => <div key={i} className='skeleton' style={{ height:'4rem', borderRadius:'var(--radius-lg)' }} />)}
        </div>
      )}

      <div className={styles.list}>
        {data?.items.map(c => (
          <div key={c.id} className={styles.item} onClick={() => navigate(`/checkin`)}>
            <div className={styles.dateCol}>
              <span className={styles.day}>{format(parseISO(c.entry_date), 'd')}</span>
              <span className={styles.month}>{format(parseISO(c.entry_date), 'MMM', { locale: ru })}</span>
            </div>
            <div className={styles.body}>
              {c.note_main && <p className={styles.note}>{c.note_main}</p>}
              <div className={styles.pills}>
                {c.had_trigger && <span className='badge badge-warning'>триггер</span>}
              </div>
            </div>
            <div className={styles.mood} style={{ color: MOOD_COLOR(c.mood) }}>
              {c.mood ?? '—'}
            </div>
          </div>
        ))}
      </div>

      {data?.items.length === 0 && (
        <div style={{ textAlign:'center', padding:'var(--space-12)', color:'var(--color-text-muted)' }}>
          <p style={{ fontSize:'var(--text-lg)', marginBottom:'var(--space-3)' }}>📝</p>
          <p>Чекинов пока нет</p>
          <button className='btn btn-primary' style={{ marginTop:'var(--space-4)' }}
            onClick={() => navigate('/checkin')}>Сделать первый</button>
        </div>
      )}
    </Page>
  )
}
