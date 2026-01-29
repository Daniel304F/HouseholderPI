import type { ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { cn } from '../../../utils/cn'

interface TabItem {
    id: string
    label: string
    path: string
    icon?: ReactNode
}

interface TabNavigationProps {
    items: TabItem[]
    className?: string
}

export const TabNavigation = ({ items, className }: TabNavigationProps) => {
    const navigate = useNavigate()
    const location = useLocation()

    const isActive = (path: string) => location.pathname === path

    return (
        <nav
            className={cn(
                'hide-scrollbar flex gap-1 overflow-x-auto px-4 py-2',
                'from-brand-50/70 to-brand-50/60 dark:to-brand-900/30 rounded-2xl bg-gradient-to-r via-white/80 dark:from-neutral-900/70 dark:via-neutral-900/60',
                'shadow-brand-500/10 border border-neutral-200/70 shadow-sm backdrop-blur-sm dark:border-neutral-800/70',
                className
            )}
        >
            {items.map((item) => (
                <button
                    key={item.id}
                    onClick={() => navigate(item.path)}
                    className={cn(
                        'relative flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5',
                        'text-sm font-semibold tracking-tight whitespace-nowrap',
                        'transition-all duration-200',
                        isActive(item.path)
                            ? 'via-brand-50/80 to-brand-100/60 text-brand-700 shadow-brand-500/15 border-brand-200/70 dark:via-brand-900/40 dark:to-brand-800/40 dark:text-brand-300 dark:border-brand-800/60 border bg-gradient-to-br from-white shadow-md dark:from-neutral-800/90'
                            : 'text-text-muted hover:text-brand-700 dark:hover:text-brand-300 hover:-translate-y-[1px] dark:text-neutral-400'
                    )}
                >
                    {item.icon && (
                        <span className="flex h-4 w-4 items-center justify-center">
                            {item.icon}
                        </span>
                    )}
                    <span>{item.label}</span>
                </button>
            ))}
        </nav>
    )
}
