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
                'transition-all duration-200',
                isActive
                    ? 'text-brand-600 dark:text-brand-400'
                    : 'text-text-muted hover:text-brand-500 active:scale-95'
            )}
        >
            {/* Active indicator */}
            {isActive && (
                <span className="absolute top-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-brand-500 dark:bg-brand-400" />
            )}

            {/* Icon container */}
            <span
                className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-lg',
                    'transition-all duration-200',
                    isActive
                        ? 'bg-brand-100 text-brand-600 dark:bg-brand-900/50 dark:text-brand-400'
                        : 'group-hover:bg-brand-50 dark:group-hover:bg-brand-950'
                )}
            >
                {icon}
            </span>

            {/* Label */}
            <span
                className={cn(
                    'text-[11px] font-medium',
                    isActive && 'font-semibold'
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
                'h-18 border-t border-border',
                'bg-surface/80 backdrop-blur-md',
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
