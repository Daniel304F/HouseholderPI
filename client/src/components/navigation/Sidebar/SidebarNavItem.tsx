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
                // Base Layout
                'group relative flex w-full items-center gap-3 px-3 py-2.5',
                'text-left text-sm font-medium',
                // Rounded & Overflow
                'overflow-hidden rounded-xl',
                // Transitions
                'transition-all duration-200 ease-out',
                // States
                isActive
                    ? [
                          'from-brand-500/15 to-brand-500/5 bg-gradient-to-r',
                          'text-brand-700 dark:text-brand-300',
                          'shadow-sm',
                      ]
                    : [
                          'text-neutral-600 dark:text-neutral-400',
                          'hover:bg-neutral-100 dark:hover:bg-neutral-800/50',
                          'hover:text-neutral-900 dark:hover:text-neutral-100',
                          'hover:translate-x-1',
                      ]
            )}
        >
            {/* Active Indicator Bar */}
            <span
                className={cn(
                    'absolute top-1/2 left-0 h-6 w-1 -translate-y-1/2 rounded-r-full',
                    'transition-all duration-200',
                    isActive
                        ? 'bg-brand-500 opacity-100'
                        : 'bg-brand-500 opacity-0 group-hover:opacity-50'
                )}
            />

            {/* Icon */}
            {icon && (
                <span
                    className={cn(
                        'flex size-5 shrink-0 items-center justify-center',
                        'transition-transform duration-200',
                        isActive
                            ? 'text-brand-600 dark:text-brand-400 scale-110'
                            : 'text-neutral-500 group-hover:scale-110 dark:text-neutral-500'
                    )}
                >
                    {icon}
                </span>
            )}

            {/* Label */}
            <span className="flex-1 truncate">{label}</span>

            {/* Badge */}
            {badge !== undefined && (
                <span
                    className={cn(
                        'flex h-5 min-w-5 items-center justify-center rounded-full px-1.5',
                        'text-xs font-semibold',
                        'transition-colors duration-200',
                        isActive
                            ? 'bg-brand-500/20 text-brand-700 dark:bg-brand-500/30 dark:text-brand-300'
                            : 'group-hover:bg-brand-100 group-hover:text-brand-600 dark:group-hover:bg-brand-900/50 dark:group-hover:text-brand-400 bg-neutral-200/80 text-neutral-600 dark:bg-neutral-700/80 dark:text-neutral-400'
                    )}
                >
                    {badge}
                </span>
            )}
        </button>
    )
}
