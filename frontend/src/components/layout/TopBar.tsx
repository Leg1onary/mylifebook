import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, Sun, Moon } from 'lucide-react'
import styles from './TopBar.module.css'

const TITLES: Record<string, string> = {
  '/today':       'Сегодня',
  '/checkin':     'Чекин',
  '/history':     'История',
  '/triggers/new':'Триггер',
  '/thoughts/new':'Мысль',
  '/experiments': 'Эксперименты',
  '/weekly':      'Неделя',
  '/insights':    'Аналитика',
  '/journal':     'Дневник',
  '/profile':     'Профиль',
  '/settings':    'Настройки',
}

export function TopBar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const isRoot = ['/today', '/insights', '/experiments', '/weekly', '/journal'].includes(pathname)
  const title = TITLES[pathname] ?? ''

  function toggleTheme() {
    const html = document.documentElement
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'
    html.setAttribute('data-theme', next)
    localStorage.setItem('mlb-theme', next)
  }

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark'

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
