import { AlertCircle, BarChart3, RefreshCw } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '../../utils/cn'
import { Button } from '../common/Button'

interface ErrorStateProps {
    title?: string
    message?: string
    icon?: LucideIcon
    onRetry?: () => void
    retryLabel?: string
    children?: React.ReactNode
    className?: string
    size?: 'sm' | 'md' | 'lg'
}

const sizeStyles = {
    sm: 'py-6 gap-3',
    md: 'py-12 gap-4',
    lg: 'py-16 gap-5',
}

const iconSizes = {
    sm: 'size-8',
    md: 'size-12',
    lg: 'size-16',
}

export const ErrorState = ({
    title = 'Daten konnten nicht geladen werden',
    message = 'Bitte versuche es später erneut',
    icon: Icon = AlertCircle,
    onRetry,
    retryLabel = 'Erneut versuchen',
    children,
    className,
    size = 'md',
}: ErrorStateProps) => {
    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center',
                'rounded-xl border border-dashed border-neutral-300',
                'dark:border-neutral-600',
                sizeStyles[size],
                className
            )}
        >
            <Icon className={cn('text-neutral-400', iconSizes[size])} />
            <div className="text-center">
                <p className="font-medium text-neutral-700 dark:text-neutral-300">
                    {title}
                </p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {message}
                </p>
            </div>
            {onRetry && (
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={onRetry}
                    icon={<RefreshCw className="size-4" />}
                >
                    {retryLabel}
                </Button>
            )}
            {children}
        </div>
    )
}

/**
 * Pre-configured error states for common scenarios
 */
export const StatsErrorState = ({ onRetry }: { onRetry?: () => void }) => (
    <ErrorState
        title="Statistiken konnten nicht geladen werden"
        message="Bitte versuche es später erneut"
        icon={BarChart3}
        onRetry={onRetry}
    />
)

export const NetworkErrorState = ({ onRetry }: { onRetry?: () => void }) => (
    <ErrorState
        title="Netzwerkfehler"
        message="Überprüfe deine Internetverbindung"
        onRetry={onRetry}
    />
)
