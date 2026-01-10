import { type ReactNode } from 'react'
import { cn } from '../../../utils/cn'

interface SidebarNavItemProps {
    icon?: ReactNode
    label: string
    isActive?: boolean
    onClick?: () => void
    badge?: string | number
}

export const SidebarNavItem = ({
    icon,
    label,
    isActive = false,
    onClick,
    badge,
}: SidebarNavItemProps) => {
    return (
        <button
            onClick={onClick}
            className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2.5',
                'text-left text-sm font-medium',
                'transition-colors duration-150',
                isActive
                    ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/50 dark:text-brand-300'
                    : 'text-text-muted hover:bg-surface-hover hover:text-text'
            )}
        >
            {icon && (
                <span
                    className={cn(
                        'flex h-5 w-5 shrink-0 items-center justify-center',
                        isActive && 'text-brand-600 dark:text-brand-400'
                    )}
                >
                    {icon}
                </span>
            )}
            <span className="flex-1 truncate">{label}</span>
            {badge !== undefined && (
                <span
                    className={cn(
                        'flex h-5 min-w-5 items-center justify-center rounded-full px-1.5',
                        'text-xs font-semibold',
                        isActive
                            ? 'bg-brand-200 text-brand-800 dark:bg-brand-800 dark:text-brand-200'
                            : 'bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300'
                    )}
                >
                    {badge}
                </span>
            )}
        </button>
    )
}
