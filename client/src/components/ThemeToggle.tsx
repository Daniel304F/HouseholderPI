import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

const getInitialTheme = (): Theme => {
    if (typeof window === 'undefined') return 'light'

    const stored = localStorage.getItem('theme') as Theme | null
    if (stored) return stored

    return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
}

export const ThemeToggle = () => {
    const [theme, setTheme] = useState<Theme>(getInitialTheme)

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }

        localStorage.setItem('theme', theme)
    }, [theme])

    useEffect(() => {
        const initialTheme = getInitialTheme()
        if (initialTheme === 'dark') {
            document.documentElement.classList.add('dark')
        }
    }, [])

    const toggleTheme = () => {
        setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
    }

    return (
        <button
            onClick={toggleTheme}
            className="text-secondary hover:bg-muted flex h-9 w-9 items-center justify-center rounded-lg transition-colors"
            aria-label={
                theme === 'dark'
                    ? 'Zum Light Mode wechseln'
                    : 'Zum Dark Mode wechseln'
            }
        >
            {theme === 'dark' ? (
                <Sun size={20} strokeWidth={2} />
            ) : (
                <Moon size={20} strokeWidth={2} />
            )}
        </button>
    )
}
