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
                'hide-scrollbar border-border bg-surface flex gap-1 overflow-x-auto border-b px-4',
                className
            )}
        >
            {items.map((item) => (
                <button
                    key={item.id}
                    onClick={() => navigate(item.path)}
                    className={cn(
                        'relative flex shrink-0 items-center gap-2 px-3 py-3',
                        'text-sm font-medium whitespace-nowrap',
                        'transition-colors duration-150',
                        isActive(item.path)
                            ? 'text-brand-600 dark:text-brand-400'
                            : 'text-text-muted hover:text-text'
                    )}
                >
                    {item.icon && (
                        <span className="flex h-4 w-4 items-center justify-center">
                            {item.icon}
                        </span>
                    )}
                    <span>{item.label}</span>

                    {/* Active indicator */}
                    {isActive(item.path) && (
                        <span
                            className={cn(
                                'absolute right-0 bottom-0 left-0 h-0.5',
                                'bg-brand-600 dark:bg-brand-400'
                            )}
                        />
                    )}
                </button>
            ))}
        </nav>
    )
}
