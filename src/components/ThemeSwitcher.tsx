import { Monitor, Moon, Sun } from 'lucide-react'
import { useAtom } from 'jotai'
import { themeAtom, type Theme } from '../store/atoms'
import { useEffect } from 'react'

export const ThemeSwitcher = () => {
  const [theme, setTheme] = useAtom(themeAtom)

  // Handle system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleChange = () => {
      if (theme === 'system') {
        document.documentElement.classList.toggle('dark', mediaQuery.matches)
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  // Apply theme changes
  useEffect(() => {
    const isDark = 
      theme === 'dark' || 
      (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    
    document.documentElement.classList.toggle('dark', isDark)
  }, [theme])

  const options: { value: Theme; icon: JSX.Element }[] = [
    { value: 'light', icon: <Sun size={20} /> },
    { value: 'dark', icon: <Moon size={20} /> },
    { value: 'system', icon: <Monitor size={20} /> },
  ]

  return (
    <div className="absolute top-4 right-4 bg-white dark:bg-slate-800 rounded-lg shadow-lg flex p-1 gap-1 z-50">
      {options.map(({ value, icon }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={`p-2 rounded-lg transition-colors ${
            theme === value 
              ? 'bg-slate-100 dark:bg-slate-700 text-blue-600 dark:text-blue-400' 
              : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400'
          }`}
          aria-label={`Switch to ${value} theme`}
        >
          {icon}
        </button>
      ))}
    </div>
  )
}
