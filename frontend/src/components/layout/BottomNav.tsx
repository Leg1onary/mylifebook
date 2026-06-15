import { NavLink } from 'react-router-dom'
import { Home, BarChart2, FlaskConical, BookOpen, CalendarDays } from 'lucide-react'
import styles from './BottomNav.module.css'

const NAV = [
  { to: '/today',       icon: Home,          label: 'Сегодня' },
  { to: '/weekly',      icon: CalendarDays,  label: 'Неделя' },
  { to: '/experiments', icon: FlaskConical,  label: 'Опыты' },
  { to: '/journal',     icon: BookOpen,      label: 'Дневник' },
  { to: '/insights',    icon: BarChart2,     label: 'Графики' },
]

export function BottomNav() {
  return (
    <nav className={styles.nav} aria-label='Основная навигация'>
      {NAV.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `${styles.item} ${isActive ? styles.active : ''}`
          }
        >
          <Icon size={22} strokeWidth={isActive => isActive ? 2.2 : 1.6} />
          <span className={styles.label}>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
