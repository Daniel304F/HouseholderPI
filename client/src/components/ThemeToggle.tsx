import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import { cn } from '../utils/cn'

type Theme = 'light' | 'dark'

const getInitialTheme = (): Theme => {
    if (typeof window === 'undefined') return 'light'

    const stored = localStorage.getItem('theme') as Theme | null
    if (stored) return stored

    return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
}

const buttonStyles = cn(
    'flex size-9 items-center justify-center rounded-lg',
    'text-neutral-600 dark:text-neutral-400',
    'hover:bg-neutral-100 dark:hover:bg-neutral-800',
    'transition-colors duration-200'
)

export const ThemeToggle = () => {
    const [theme, setTheme] = useState<Theme>(getInitialTheme)

    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark')
        localStorage.setItem('theme', theme)
    }, [theme])

    useEffect(() => {
        if (getInitialTheme() === 'dark') {
            document.documentElement.classList.add('dark')
        }
    }, [])

    const toggleTheme = () => {
        setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
    }

    const Icon = theme === 'dark' ? Sun : Moon

    return (
        <button
            onClick={toggleTheme}
            className={buttonStyles}
            aria-label={
                theme === 'dark'
                    ? 'Zum Light Mode wechseln'
                    : 'Zum Dark Mode wechseln'
            }
        >
            <Icon className="size-5" strokeWidth={2} />
        </button>
    )
}
