import { Link } from 'react-router-dom'
import styles from './Auth.module.css'

/**
 * Registration is disabled: MyLifeBook is a private single-user MVP.
 * Access is granted only via direct admin setup.
 */
export default function RegisterPage() {
  return (
    <div className={styles.wrap}>
      <div className={styles.logo}>
        <svg width='40' height='40' viewBox='0 0 40 40' fill='none' aria-label='MyLifeBook'>
          <rect width='40' height='40' rx='12' fill='var(--color-primary)' />
          <path d='M12 28V14l8 8 8-8v14' stroke='white' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round' />
          <circle cx='20' cy='12' r='2' fill='white' />
        </svg>
        <span className={styles.logoText}>MyLifeBook</span>
      </div>

      <h1 className={styles.heading}>Закрытый доступ</h1>
      <p className={styles.subtitle}>
        MyLifeBook — приватный инструмент. Регистрация не открыта.
      </p>

      <Link to='/login' className='btn btn-primary' style={{ width: '100%', textAlign: 'center' }}>
        Войти
      </Link>
    </div>
  )
}
