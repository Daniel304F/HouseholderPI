import type { LucideIcon } from 'lucide-react'
import { cn } from '../../utils/cn'

export interface MetricCardProps {
    label: string
    value: number
    icon?: LucideIcon
    valueClassName?: string
    className?: string
}

export const MetricCard = ({
    label,
    value,
    icon: Icon,
    valueClassName,
    className,
}: MetricCardProps) => {
    return (
        <article
            className={cn(
                'ui-panel ui-panel-hover animate-card p-4',
                className
            )}
        >
            <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400">
                {Icon && <Icon className="size-4" />}
                <span className="text-sm">{label}</span>
            </div>
            <p
                className={cn(
                    'mt-1 text-2xl font-bold text-neutral-900 dark:text-white',
                    valueClassName
                )}
            >
                {value}
            </p>
        </article>
    )
}
