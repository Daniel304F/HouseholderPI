import { type ReactNode } from 'react'
import { cn } from '../../../utils/cn'

interface BottomNavItemProps {
    icon: ReactNode
    label: string
    isActive?: boolean
    onClick?: () => void
}

const BottomNavItem = ({
    icon,
    label,
    isActive = false,
    onClick,
}: BottomNavItemProps) => {
    return (
        <button
            onClick={onClick}
            className={cn(
                'group relative flex flex-1 flex-col items-center justify-center gap-1 py-2',
                'transition-all duration-250',
                isActive
                    ? 'text-brand-700 dark:text-brand-300'
                    : 'text-text-muted hover:text-brand-600 active:scale-95'
            )}
        >
            {/* Active indicator */}
            {isActive && (
                <span className="from-brand-400 via-brand-500 to-brand-600 shadow-brand-500/30 absolute top-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-gradient-to-r shadow" />
            )}

            {/* Icon container */}
            <span
                className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-2xl',
                    'transition-all duration-250',
                    isActive
                        ? 'from-brand-100 to-brand-200 text-brand-700 shadow-brand-500/20 ring-brand-200/70 dark:from-brand-900/40 dark:to-brand-800/30 dark:text-brand-300 dark:ring-brand-800/60 bg-gradient-to-br via-white shadow-md ring-1 dark:via-neutral-900/50'
                        : 'text-text-muted group-hover:border-brand-200/60 group-hover:shadow-brand-500/10 border border-transparent bg-white/70 shadow-sm dark:bg-neutral-900/60 dark:text-neutral-300'
                )}
            >
                {icon}
            </span>

            {/* Label */}
            <span
                className={cn(
                    'text-[11px] font-semibold tracking-tight',
                    isActive && 'text-brand-700 dark:text-brand-200'
                )}
            >
                {label}
            </span>
        </button>
    )
}

interface NavItem {
    id: string
    label: string
    path: string
    icon: ReactNode
}

interface BottomNavigationProps {
    items: NavItem[]
    activePath: string
    onNavigate: (path: string) => void
}

export const BottomNavigation = ({
    items,
    activePath,
    onNavigate,
}: BottomNavigationProps) => {
    return (
        <nav
            className={cn(
                'fixed right-0 bottom-0 left-0 z-50',
                'flex items-center justify-around',
                'h-18 border-t border-neutral-200/80 dark:border-neutral-800/80',
                'bg-white/85 shadow-[0_-6px_30px_-12px_rgba(0,0,0,0.18)] backdrop-blur-xl dark:bg-neutral-950/70',
                'pb-safe pt-1'
            )}
        >
            {items.map((item) => (
                <BottomNavItem
                    key={item.id}
                    icon={item.icon}
                    label={item.label}
                    isActive={activePath === item.path}
                    onClick={() => onNavigate(item.path)}
                />
            ))}
        </nav>
    )
}
