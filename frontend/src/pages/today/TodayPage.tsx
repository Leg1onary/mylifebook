import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { todayApi } from '@/api/today'
import { Page } from '@/components/layout/Page'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Flame, Plus, ChevronRight, Zap, Brain, FlaskConical } from 'lucide-react'
import styles from './TodayPage.module.css'

export default function TodayPage() {
  const navigate = useNavigate()
  const { data, isLoading } = useQuery({
    queryKey: ['today'],
    queryFn: () => todayApi.get().then(r => r.data),
  })

  const today = format(new Date(), 'd MMMM', { locale: ru })

  if (isLoading) return (
    <Page>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {[1,2,3,4].map(i => <div key={i} className={`skeleton ${styles.skBlock}`} />)}
      </div>
    </Page>
  )

  const snap = data

  return (
    <Page>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <p className={styles.dateLabel}>{today}</p>
          <h1 className={styles.greeting}>Привет 👋</h1>
        </div>
        {snap && snap.streak_days > 0 && (
          <div className={styles.streak}>
            <Flame size={16} color='var(--color-warning)' />
            <span>{snap.streak_days}</span>
          </div>
        )}
      </div>

      {/* Active old law */}
      {snap?.active_old_law && (
        <div className={styles.lawCard}>
          <p className={styles.lawLabel}>Старый закон</p>
          <p className={styles.lawText}>«{snap.active_old_law}»</p>
        </div>
      )}

      {/* Daily checkin CTA */}
      <div
        className={`${styles.checkinCard} ${snap?.checkin_done ? styles.checkinDone : styles.checkinTodo}`}
        onClick={() => navigate('/checkin')}
        role='button'
        tabIndex={0}
      >
        <div className={styles.checkinLeft}>
          <Zap size={20} />
          <div>
            <p className={styles.checkinTitle}>Ежедневный чекин</p>
            <p className={styles.checkinSub}>
              {snap?.checkin_done
                ? `Настроение: ${snap.checkin?.mood ?? '—'}/10`
                : 'Не выполнен сегодня'}
            </p>
          </div>
        </div>
        <ChevronRight size={18} color='var(--color-text-faint)' />
      </div>

      {/* Week focus */}
      {snap?.current_week_focus && (
        <div className={styles.focusCard}>
          <p className={styles.focusLabel}>Фокус недели</p>
          <p className={styles.focusText}>{snap.current_week_focus}</p>
        </div>
      )}

      {/* Quick actions */}
      <div className={styles.actionsGrid}>
        <button className={styles.actionBtn} onClick={() => navigate('/triggers/new')}>
          <Zap size={22} color='var(--color-warning)' />
          <span>Триггер</span>
        </button>
        <button className={styles.actionBtn} onClick={() => navigate('/thoughts/new')}>
          <Brain size={22} color='var(--color-primary)' />
          <span>Мысль</span>
        </button>
        <button className={styles.actionBtn} onClick={() => navigate('/experiments')}>
          <FlaskConical size={22} color='var(--color-success)' />
          <span>Опыты</span>
          {snap && snap.active_experiments_count > 0 && (
            <span className={`badge badge-success ${styles.badge}`}>{snap.active_experiments_count}</span>
          )}
        </button>
        <button className={styles.actionBtn} onClick={() => navigate('/thoughts/new')}>
          <Plus size={22} color='var(--color-text-muted)' />
          <span>Запись</span>
        </button>
      </div>

      {/* Unfinished thought records */}
      {snap && snap.unfinished_thought_records_count > 0 && (
        <button className={styles.pendingCard} onClick={() => navigate('/thoughts/new')}>  
          <Brain size={18} />
          <span>Есть незавершённые записи ({snap.unfinished_thought_records_count})</span>
          <ChevronRight size={16} />
        </button>
      )}
    </Page>
  )
}
