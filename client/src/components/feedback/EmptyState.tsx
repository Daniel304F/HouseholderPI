import type { LucideIcon } from 'lucide-react'
import { Inbox } from 'lucide-react'
import { cn } from '../../utils/cn'

interface EmptyStateProps {
    title: string
    message?: string
    icon?: LucideIcon
    action?: React.ReactNode
    className?: string
    size?: 'sm' | 'md' | 'lg'
}

const sizeStyles = {
    sm: 'py-6 gap-2',
    md: 'py-12 gap-3',
    lg: 'py-16 gap-4',
}

const iconSizes = {
    sm: 'size-8',
    md: 'size-12',
    lg: 'size-16',
}

export const EmptyState = ({
    title,
    message,
    icon: Icon = Inbox,
    action,
    className,
    size = 'md',
}: EmptyStateProps) => {
    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center text-center',
                'rounded-xl border border-dashed border-neutral-300',
                'dark:border-neutral-600',
                sizeStyles[size],
                className
            )}
        >
            <div
                className={cn(
                    'flex items-center justify-center rounded-full',
                    'bg-neutral-100 dark:bg-neutral-800',
                    size === 'sm' ? 'p-2' : size === 'md' ? 'p-3' : 'p-4'
                )}
            >
                <Icon
                    className={cn('text-neutral-400', iconSizes[size])}
                />
            </div>
            <div className="mt-2">
                <p className="font-medium text-neutral-700 dark:text-neutral-300">
                    {title}
                </p>
                {message && (
                    <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                        {message}
                    </p>
                )}
            </div>
            {action && <div className="mt-4">{action}</div>}
        </div>
    )
}
