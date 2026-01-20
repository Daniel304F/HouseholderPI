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
                'flex flex-1 flex-col items-center justify-center gap-1 py-2',
                'transition-colors duration-150',
                isActive
                    ? 'text-brand-600 dark:text-brand-400'
                    : 'text-text-muted hover:text-text'
            )}
        >
            <span
                className={cn(
                    'flex h-6 w-6 items-center justify-center',
                    isActive && 'text-brand-600 dark:text-brand-400'
                )}
            >
                {icon}
            </span>
            <span className="text-xs font-medium">{label}</span>
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
                'border-border h-16 border-t',
                'bg-surface-elevated/95 backdrop-blur-sm',
                'safe-area-bottom'
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
