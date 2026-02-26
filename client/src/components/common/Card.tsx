import { type ReactNode } from 'react'
import { cn } from '../../utils/cn'

export interface CardProps {
    title?: string
    children: ReactNode
    className?: string
    actions?: ReactNode
    hoverable?: boolean
    padding?: 'none' | 'sm' | 'md' | 'lg'
}

const cardStyles = cn(
    'card-accent-top relative isolate flex flex-col overflow-hidden rounded-3xl',
    'border border-neutral-200/80 dark:border-neutral-700/60',
    'bg-white/92 dark:bg-neutral-900/75 backdrop-blur-sm',
    /* brand-tinted shadow */
    'shadow-[0_4px_24px_-4px_hsl(149,58%,50%,0.08),0_1px_4px_0_rgb(0_0_0_/0.04)]',
    'dark:shadow-[0_4px_24px_-4px_hsl(149,58%,30%,0.18),0_1px_4px_0_rgb(0_0_0_/0.3)]',
    /* inner gradient overlay */
    'before:absolute before:inset-[-1px] before:-z-10 before:rounded-[26px]',
    'before:bg-gradient-to-br before:from-brand-100/60 before:via-teal-50/20 before:to-transparent',
    'before:opacity-0 before:transition-opacity before:duration-500',
    'transition-all duration-300 ease-out'
)

const hoverableStyles = cn(
    'hover:-translate-y-1',
    'hover:shadow-[0_12px_36px_-6px_hsl(149,58%,50%,0.14),0_4px_10px_-2px_rgb(0_0_0_/0.06)]',
    'dark:hover:shadow-[0_12px_36px_-6px_hsl(149,58%,30%,0.28),0_4px_10px_-2px_rgb(0_0_0_/0.35)]',
    'hover:border-brand-200/70 dark:hover:border-brand-600/50',
    'hover:before:opacity-100'
)

const headerStyles = cn(
    'flex items-center justify-between px-6 py-4',
    'border-b border-neutral-100/80 dark:border-neutral-700/50',
    'bg-gradient-to-r from-brand-50/80 via-white/60 to-teal-50/30',
    'dark:from-neutral-800/90 dark:via-neutral-800/70 dark:to-brand-900/25'
)

const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
}

export const Card = ({
    title,
    children,
    className,
    actions,
    hoverable = false,
    padding = 'md',
}: CardProps) => {
    return (
        <div
            className={cn(cardStyles, hoverable && hoverableStyles, className)}
        >
            {(title || actions) && (
                <div className={headerStyles}>
                    {title && (
                        <h3 className="text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
                            {title}
                        </h3>
                    )}
                    {actions && (
                        <div className="flex items-center gap-2">{actions}</div>
                    )}
                </div>
            )}
            <div className={cn('flex-grow space-y-3', paddingStyles[padding])}>
                {children}
            </div>
        </div>
    )
}

/**
 * Simple card variant for charts and stats
 */
export interface SimpleCardProps {
    title?: string
    icon?: ReactNode
    children: ReactNode
    className?: string
    centerContent?: boolean
}

export const SimpleCard = ({
    title,
    icon,
    children,
    className,
    centerContent = false,
}: SimpleCardProps) => {
    return (
        <div
            className={cn(
                'relative overflow-hidden rounded-2xl p-6',
                /* border */
                'border border-neutral-200/80 dark:border-neutral-700/60',
                /* background with subtle tint */
                'bg-white/90 dark:bg-neutral-900/70 backdrop-blur-sm',
                /* teal accent in top-right corner */
                'before:absolute before:inset-0 before:-z-10 before:rounded-2xl',
                'before:bg-[radial-gradient(ellipse_at_top_right,hsl(183,56%,44%,0.07),transparent_60%)]',
                'dark:before:bg-[radial-gradient(ellipse_at_top_right,hsl(183,56%,28%,0.12),transparent_60%)]',
                /* shadow */
                'shadow-[0_2px_16px_-4px_hsl(149,58%,50%,0.07),0_1px_3px_0_rgb(0_0_0_/0.04)]',
                'dark:shadow-[0_2px_16px_-4px_rgb(0_0_0_/0.25)]',
                className
            )}
        >
            {title && (
                <h2
                    className={cn(
                        'mb-4 text-base font-semibold tracking-tight text-neutral-900 dark:text-white',
                        icon && 'flex items-center gap-2'
                    )}
                >
                    {icon && (
                        <span className="flex size-7 items-center justify-center rounded-lg bg-brand-100 text-brand-600 dark:bg-brand-900/40 dark:text-brand-400">
                            {icon}
                        </span>
                    )}
                    {title}
                </h2>
            )}
            <div className={cn(centerContent && 'flex items-center justify-center')}>
                {children}
            </div>
        </div>
    )
}
