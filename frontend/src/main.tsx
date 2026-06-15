import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/globals.css'
import { Providers } from './app/providers'
import { App } from './app/App'

// Apply saved theme before first paint
const saved = localStorage.getItem('mlb-theme')
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
const theme = saved ?? (prefersDark ? 'dark' : 'light')
document.documentElement.setAttribute('data-theme', theme)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Providers>
      <App />
    </Providers>
  </StrictMode>
)
