import { cn } from '../../utils/cn'
import { TrendingUp, TrendingDown } from 'lucide-react'
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
        icon: 'bg-gradient-to-br from-brand-100 via-white to-brand-200 dark:from-brand-900/50 dark:via-neutral-900/50 dark:to-brand-800/50 text-brand-600 dark:text-brand-400',
        iconRing: 'ring-brand-200/50 dark:ring-brand-800/50',
        glow: 'var(--color-brand-500)',
    },
    success: {
        icon: 'bg-gradient-to-br from-success-100 via-white to-success-200 dark:from-success-900/50 dark:via-neutral-900/50 dark:to-success-800/50 text-success-600 dark:text-success-400',
        iconRing: 'ring-success-200/50 dark:ring-success-800/50',
        glow: 'var(--color-success-500)',
    },
    warning: {
        icon: 'bg-gradient-to-br from-warning-100 via-white to-warning-200 dark:from-warning-900/50 dark:via-neutral-900/50 dark:to-warning-800/50 text-warning-600 dark:text-warning-400',
        iconRing: 'ring-warning-200/50 dark:ring-warning-800/50',
        glow: 'var(--color-warning-500)',
    },
    danger: {
        icon: 'bg-gradient-to-br from-error-100 via-white to-error-200 dark:from-error-900/50 dark:via-neutral-900/50 dark:to-error-800/50 text-error-600 dark:text-error-400',
        iconRing: 'ring-error-200/50 dark:ring-error-800/50',
        glow: 'var(--color-error-500)',
    },
    info: {
        icon: 'bg-gradient-to-br from-info-100 via-white to-info-200 dark:from-info-900/50 dark:via-neutral-900/50 dark:to-info-800/50 text-info-600 dark:text-info-400',
        iconRing: 'ring-info-200/50 dark:ring-info-800/50',
        glow: 'var(--color-info-500)',
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
                'group relative overflow-hidden rounded-2xl p-5',
                'bg-white/80 backdrop-blur-sm dark:bg-neutral-900/60',
                'border border-neutral-200/60 dark:border-neutral-800/60',
                'shadow-brand-500/5 shadow-md',
                'transition-all duration-300 ease-out',
                'hover:shadow-brand-500/10 hover:shadow-xl',
                'hover:-translate-y-0.5',
                'hover:border-brand-200/60 dark:hover:border-brand-800/40',
                className
            )}
        >
            {/* Background glow on hover */}
            <div
                className="absolute -top-8 -right-8 size-24 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-20"
                style={{ backgroundColor: colors.glow }}
            />

            <div className="relative flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-xs font-semibold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
                        {title}
                    </p>
                    <p className="mt-2 text-3xl font-bold text-neutral-800 dark:text-neutral-100">
                        {value}
                    </p>
                    {subtitle && (
                        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                            {subtitle}
                        </p>
                    )}
                    {trend && (
                        <div className="mt-3 flex items-center gap-1.5">
                            {trend.isPositive !== undefined && (
                                <div
                                    className={cn(
                                        'flex items-center gap-1 rounded-full px-2 py-0.5',
                                        trend.isPositive
                                            ? 'bg-success-100/80 dark:bg-success-900/30 text-success-600 dark:text-success-400'
                                            : 'bg-error-100/80 dark:bg-error-900/30 text-error-600 dark:text-error-400'
                                    )}
                                >
                                    {trend.isPositive ? (
                                        <TrendingUp className="size-3" />
                                    ) : (
                                        <TrendingDown className="size-3" />
                                    )}
                                    <span className="text-xs font-bold">
                                        {trend.isPositive && '+'}
                                        {trend.value}%
                                    </span>
                                </div>
                            )}
                            <span className="text-[10px] text-neutral-400 dark:text-neutral-500">
                                {trend.label}
                            </span>
                        </div>
                    )}
                </div>
                {Icon && (
                    <div
                        className={cn(
                            'rounded-xl p-3 ring-2 transition-transform duration-300 group-hover:scale-110',
                            colors.icon,
                            colors.iconRing
                        )}
                        style={{
                            boxShadow: `0 4px 12px ${colors.glow}20`,
                        }}
                    >
                        <Icon className="size-5" strokeWidth={2.5} />
                    </div>
                )}
            </div>
        </div>
    )
}
