import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, Sun, Moon } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import styles from './TopBar.module.css'

const TITLES: Record<string, string> = {
  '/today':        'Сегодня',
  '/checkin':      'Чекин',
  '/history':      'История',
  '/triggers/new': 'Триггер',
  '/thoughts/new': 'Мысль',
  '/experiments':  'Эксперименты',
  '/weekly':       'Неделя',
  '/insights':     'Аналитика',
  '/journal':      'Дневник',
  '/profile':      'Профиль',
  '/settings':     'Настройки',
}

export function TopBar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()

  const isRoot = ['/today', '/insights', '/experiments', '/weekly', '/journal'].includes(pathname)
  const title = TITLES[pathname] ?? ''
  const isDark = theme === 'dark' || (
    theme === 'system' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  )

  function toggleTheme() {
    setTheme(isDark ? 'light' : 'dark')
  }

  return (
    <header className={styles.bar}>
      <div className={styles.left}>
        {!isRoot && (
          <button className='btn-icon' onClick={() => navigate(-1)} aria-label='Назад'>
            <ArrowLeft size={20} />
          </button>
        )}
      </div>

      <span className={styles.title}>{title}</span>

      <div className={styles.right}>
        <button className='btn-icon' onClick={toggleTheme} aria-label='Сменить тему'>
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  )
}
