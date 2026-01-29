import type { ReactNode } from 'react'
import { cn } from '../../utils/cn'

interface ChartCardProps {
    title: string
    icon?: ReactNode
    children: ReactNode
    className?: string
    centerContent?: boolean
}

export const ChartCard = ({
    title,
    icon,
    children,
    className,
    centerContent = false,
}: ChartCardProps) => {
    return (
        <div
            className={cn(
                'rounded-xl border border-neutral-200 bg-white p-6',
                'dark:border-neutral-700 dark:bg-neutral-800',
                className
            )}
        >
            <h2
                className={cn(
                    'mb-4 text-lg font-semibold text-neutral-900 dark:text-white',
                    icon && 'flex items-center gap-2'
                )}
            >
                {icon}
                {title}
            </h2>
            <div className={cn(centerContent && 'flex items-center justify-center')}>
                {children}
            </div>
        </div>
    )
}
