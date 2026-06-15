import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { AuthGuard } from './guards/AuthGuard'
import { GuestGuard } from './guards/GuestGuard'

// Pages — lazy loaded
import { lazy, Suspense } from 'react'
import { PageLoader } from '@/components/layout/Page'

const lazy_ = (fn: () => Promise<{ default: React.ComponentType }>) =>
  function LazyPage() {
    const Comp = lazy(fn)
    return <Suspense fallback={<PageLoader />}><Comp /></Suspense>
  }

const LoginPage           = lazy_(() => import('@/pages/auth/LoginPage'))
const RegisterPage        = lazy_(() => import('@/pages/auth/RegisterPage'))
const TodayPage           = lazy_(() => import('@/pages/today/TodayPage'))
const DailyCheckinPage    = lazy_(() => import('@/pages/daily/DailyCheckinPage'))
const DailyHistoryPage    = lazy_(() => import('@/pages/daily/DailyHistoryPage'))
const TriggerCapturePage  = lazy_(() => import('@/pages/triggers/TriggerCapturePage'))
const TriggerDetailPage   = lazy_(() => import('@/pages/triggers/TriggerDetailPage'))
const ThoughtWizardPage   = lazy_(() => import('@/pages/thought-records/ThoughtRecordWizardPage'))
const ThoughtDetailPage   = lazy_(() => import('@/pages/thought-records/ThoughtRecordDetailPage'))
const ExperimentsPage     = lazy_(() => import('@/pages/experiments/ExperimentsPage'))
const ExperimentDetail    = lazy_(() => import('@/pages/experiments/ExperimentDetailPage'))
const WeeklyReviewPage    = lazy_(() => import('@/pages/weekly/WeeklyReviewPage'))
const InsightsPage        = lazy_(() => import('@/pages/insights/InsightsPage'))
const JournalPage         = lazy_(() => import('@/pages/journal/JournalPage'))
const ProfilePage         = lazy_(() => import('@/pages/profile/PersonalContextPage'))
const SettingsPage        = lazy_(() => import('@/pages/settings/SettingsPage'))
const NotFoundPage        = lazy_(() => import('@/pages/system/NotFoundPage'))

export const router = createBrowserRouter([
  // Auth routes (guest only)
  {
    element: <GuestGuard />,
    children: [
      { path: '/login',    element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
    ],
  },
  // App routes (auth required)
  {
    element: <AuthGuard />,
    children: [
      {
        element: <AppShell />,
        children: [
          { index: true,                    element: <Navigate to='/today' replace /> },
          { path: '/today',                 element: <TodayPage /> },
          { path: '/checkin',               element: <DailyCheckinPage /> },
          { path: '/history',               element: <DailyHistoryPage /> },
          { path: '/triggers/new',          element: <TriggerCapturePage /> },
          { path: '/triggers/:id',          element: <TriggerDetailPage /> },
          { path: '/thoughts/new',          element: <ThoughtWizardPage /> },
          { path: '/thoughts/:id',          element: <ThoughtDetailPage /> },
          { path: '/thoughts/:id/edit',     element: <ThoughtWizardPage /> },
          { path: '/experiments',           element: <ExperimentsPage /> },
          { path: '/experiments/:id',       element: <ExperimentDetail /> },
          { path: '/weekly',                element: <WeeklyReviewPage /> },
          { path: '/insights',              element: <InsightsPage /> },
          { path: '/journal',               element: <JournalPage /> },
          { path: '/profile',               element: <ProfilePage /> },
          { path: '/settings',              element: <SettingsPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
