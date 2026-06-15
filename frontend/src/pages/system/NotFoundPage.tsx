import { Link } from 'react-router-dom'
import styles from './NotFoundPage.module.css'

export default function NotFoundPage() {
  return (
    <div className={styles.wrap}>
      <span className={styles.code}>404</span>
      <h1 className={styles.title}>Страница не найдена</h1>
      <p className={styles.sub}>Возможно, ты перешёл не туда</p>
      <Link to='/today' className='btn btn-primary'>На главную</Link>
    </div>
  )
}
