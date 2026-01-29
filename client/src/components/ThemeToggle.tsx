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
    'relative flex size-11 items-center justify-center rounded-2xl',
    'text-neutral-600 dark:text-amber-200',
    'bg-gradient-to-br from-white/70 via-neutral-50/60 to-brand-50/60 dark:from-neutral-900/70 dark:via-neutral-900/60 dark:to-brand-900/30',
    'border border-neutral-200/80 dark:border-neutral-800/80 backdrop-blur',
    'hover:-translate-y-[1px] hover:shadow-lg hover:shadow-brand-500/15',
    'active:scale-95 transition-all duration-300'
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
            <span className="from-brand-400/20 via-brand-200/10 dark:from-brand-500/20 dark:via-brand-900/10 absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br to-transparent opacity-0 blur-md transition-opacity duration-500" />
            <Icon
                className="size-5 transition-transform duration-500"
                strokeWidth={2}
            />
        </button>
    )
}
