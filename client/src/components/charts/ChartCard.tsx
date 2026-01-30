import type { ReactNode } from 'react'
import { cn } from '../../utils/cn'

interface ChartCardProps {
    title: string
    icon?: ReactNode
    children: ReactNode
    className?: string
    centerContent?: boolean
    subtitle?: string
}

/**
 * Card wrapper for chart components with consistent styling
 */
export const ChartCard = ({
    title,
    icon,
    children,
    className,
    centerContent = false,
    subtitle,
}: ChartCardProps) => {
    return (
        <div
            className={cn(
                'rounded-xl border border-neutral-200 bg-white p-6',
                'dark:border-neutral-700 dark:bg-neutral-800',
                className
            )}
        >
            <div className="mb-4">
                <h2
                    className={cn(
                        'text-lg font-semibold text-neutral-900 dark:text-white',
                        icon && 'flex items-center gap-2'
                    )}
                >
                    {icon}
                    {title}
                </h2>
                {subtitle && (
                    <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                        {subtitle}
                    </p>
                )}
            </div>
            <div className={cn(centerContent && 'flex items-center justify-center')}>
                {children}
            </div>
        </div>
    )
}
