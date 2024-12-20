import { Monitor, Moon, Sun } from 'lucide-react'
import { useAtom } from 'jotai'
import { themeAtom, type Theme } from '../store/atoms'
import { useEffect } from 'react'

export const ThemeSwitcher = () => {
  const [theme, setTheme] = useAtom(themeAtom)

  useEffect(() => {
    const isDark = theme === 'dark' || 
      (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    document.documentElement.classList.toggle('dark', isDark)
  }, [theme])

  const options: { value: Theme; icon: JSX.Element }[] = [
    { value: 'light', icon: <Sun size={20} /> },
    { value: 'dark', icon: <Moon size={20} /> },
    { value: 'system', icon: <Monitor size={20} /> },
  ]

  return (
    <div className="absolute top-4 right-4 bg-white dark:bg-slate-800 rounded-lg shadow-lg flex p-1 gap-1">
      {options.map(({ value, icon }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={`p-2 rounded-lg transition-colors ${
            theme === value 
              ? 'bg-slate-100 dark:bg-slate-700' 
              : 'hover:bg-slate-50 dark:hover:bg-slate-700'
          }`}
        >
          {icon}
        </button>
      ))}
    </div>
  )
}
