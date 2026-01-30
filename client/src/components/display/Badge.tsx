import { cn } from '../../utils/cn'

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'brand'
type BadgeSize = 'sm' | 'md' | 'lg'

interface BadgeProps {
    children: React.ReactNode
    variant?: BadgeVariant
    size?: BadgeSize
    dot?: boolean
    className?: string
}

const variantStyles: Record<BadgeVariant, string> = {
    default: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300',
    success: 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400',
    warning: 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400',
    error: 'bg-error-100 text-error-700 dark:bg-error-900/30 dark:text-error-400',
    info: 'bg-info-100 text-info-700 dark:bg-info-900/30 dark:text-info-400',
    brand: 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400',
}

const sizeStyles: Record<BadgeSize, string> = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
}

const dotSizes: Record<BadgeSize, string> = {
    sm: 'h-1.5 w-1.5',
    md: 'h-2 w-2',
    lg: 'h-2.5 w-2.5',
}

export const Badge = ({
    children,
    variant = 'default',
    size = 'md',
    dot = false,
    className,
}: BadgeProps) => {
    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 rounded-full font-semibold',
                'border border-current/20',
                'transition-all duration-200',
                variantStyles[variant],
                sizeStyles[size],
                className
            )}
        >
            {dot && (
                <span
                    className={cn(
                        'rounded-full bg-current',
                        dotSizes[size]
                    )}
                />
            )}
            {children}
        </span>
    )
}

/**
 * Status badge with predefined colors
 */
type StatusType = 'pending' | 'in-progress' | 'completed' | 'overdue'

const statusConfig: Record<StatusType, { label: string; variant: BadgeVariant }> = {
    pending: { label: 'Offen', variant: 'default' },
    'in-progress': { label: 'In Bearbeitung', variant: 'info' },
    completed: { label: 'Erledigt', variant: 'success' },
    overdue: { label: 'Überfällig', variant: 'error' },
}

export const StatusBadge = ({
    status,
    size = 'md',
    className,
}: {
    status: StatusType
    size?: BadgeSize
    className?: string
}) => {
    const config = statusConfig[status]
    return (
        <Badge variant={config.variant} size={size} dot className={className}>
            {config.label}
        </Badge>
    )
}
