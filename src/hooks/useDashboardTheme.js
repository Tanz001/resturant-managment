import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'maison-noir-dashboard-theme'

function readTheme() {
  if (typeof window === 'undefined') return 'dark'
  const saved = window.localStorage.getItem(STORAGE_KEY)
  return saved === 'light' || saved === 'dark' ? saved : 'dark'
}

export function useDashboardTheme() {
  const [theme, setTheme] = useState(readTheme)

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, theme)
    document.body.setAttribute('data-dash-theme', theme)
    return () => document.body.removeAttribute('data-dash-theme')
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }, [])

  return { theme, setTheme, toggleTheme, isLight: theme === 'light' }
}
