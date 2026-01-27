import { BarChart3, AlertCircle } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '../../utils/cn'

interface ErrorStateProps {
    title?: string
    message?: string
    icon?: LucideIcon
    children?: React.ReactNode
    className?: string
}

export const ErrorState = ({
    title = 'Daten konnten nicht geladen werden',
    message = 'Bitte versuche es später erneut',
    icon: Icon = AlertCircle,
    children,
    className,
}: ErrorStateProps) => {
    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center gap-4',
                'rounded-xl border border-dashed border-neutral-300 py-12',
                'dark:border-neutral-600',
                className
            )}
        >
            <Icon className="size-12 text-neutral-400" />
            <div className="text-center">
                <p className="font-medium text-neutral-700 dark:text-neutral-300">
                    {title}
                </p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {message}
                </p>
            </div>
            {children}
        </div>
    )
}

interface StatsErrorStateProps {
    children?: React.ReactNode
}

export const StatsErrorState = ({ children }: StatsErrorStateProps) => (
    <ErrorState
        title="Statistiken konnten nicht geladen werden"
        message="Bitte versuche es später erneut"
        icon={BarChart3}
    >
        {children}
    </ErrorState>
)
