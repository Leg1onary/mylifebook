import { ReactNode } from 'react'
import styles from './Page.module.css'

interface PageProps {
  children: ReactNode
  title?: string
  action?: ReactNode
  className?: string
}

export function Page({ children, title, action, className }: PageProps) {
  return (
    <div className={`${styles.page} ${className ?? ''}`}>
      {(title || action) && (
        <div className={styles.header}>
          {title && <h1 className={styles.title}>{title}</h1>}
          {action && <div className={styles.action}>{action}</div>}
        </div>
      )}
      {children}
    </div>
  )
}

export function PageLoader() {
  return (
    <div className={styles.loader}>
      <div className={`skeleton ${styles.skLine}`} />
      <div className={`skeleton ${styles.skLine}`} style={{ width: '60%' }} />
      <div className={`skeleton ${styles.skCard}`} />
      <div className={`skeleton ${styles.skCard}`} />
    </div>
  )
}
