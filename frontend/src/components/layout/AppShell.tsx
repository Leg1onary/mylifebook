import { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/appStore'
import { TopBar } from './TopBar'
import { BottomNav } from './BottomNav'
import styles from './AppShell.module.css'

export function AppShell() {
  const isOnline = useAppStore(s => s.isOnline)
  const navigate = useNavigate()

  // Redirect to /offline page when connection is lost
  useEffect(() => {
    if (!isOnline) {
      navigate('/offline', { replace: true })
    }
  }, [isOnline, navigate])

  return (
    <div className={styles.shell}>
      <TopBar />
      <main className={styles.main}>
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
