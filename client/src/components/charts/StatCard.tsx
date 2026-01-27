import { cn } from '../../utils/cn'
import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
    title: string
    value: string | number
    subtitle?: string
    icon?: LucideIcon
    trend?: {
        value: number
        label: string
        isPositive?: boolean
    }
    color?: 'default' | 'success' | 'warning' | 'danger' | 'info'
    className?: string
}

const colorVariants = {
    default: {
        icon: 'bg-primary/10 text-primary',
        trend: 'text-muted-foreground',
    },
    success: {
        icon: 'bg-emerald-500/10 text-emerald-500',
        trend: 'text-emerald-500',
    },
    warning: {
        icon: 'bg-amber-500/10 text-amber-500',
        trend: 'text-amber-500',
    },
    danger: {
        icon: 'bg-red-500/10 text-red-500',
        trend: 'text-red-500',
    },
    info: {
        icon: 'bg-blue-500/10 text-blue-500',
        trend: 'text-blue-500',
    },
}

export const StatCard = ({
    title,
    value,
    subtitle,
    icon: Icon,
    trend,
    color = 'default',
    className,
}: StatCardProps) => {
    const colors = colorVariants[color]

    return (
        <div
            className={cn(
                'bg-card border-border rounded-xl border p-5 shadow-sm transition-shadow hover:shadow-md',
                className
            )}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-muted-foreground text-sm font-medium">
                        {title}
                    </p>
                    <p className="text-foreground mt-1 text-2xl font-bold">
                        {value}
                    </p>
                    {subtitle && (
                        <p className="text-muted-foreground mt-1 text-xs">
                            {subtitle}
                        </p>
                    )}
                    {trend && (
                        <div className="mt-2 flex items-center gap-1">
                            <span
                                className={cn(
                                    'text-sm font-medium',
                                    trend.isPositive
                                        ? 'text-emerald-500'
                                        : trend.isPositive === false
                                          ? 'text-red-500'
                                          : colors.trend
                                )}
                            >
                                {trend.isPositive && '+'}
                                {trend.value}%
                            </span>
                            <span className="text-muted-foreground text-xs">
                                {trend.label}
                            </span>
                        </div>
                    )}
                </div>
                {Icon && (
                    <div className={cn('rounded-lg p-2.5', colors.icon)}>
                        <Icon className="size-5" />
                    </div>
                )}
            </div>
        </div>
    )
}
