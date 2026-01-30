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
    'relative isolate flex flex-col overflow-hidden rounded-3xl',
    'border border-neutral-200/80 dark:border-neutral-700/70',
    'bg-white/90 dark:bg-neutral-900/70 backdrop-blur-sm',
    'shadow-lg shadow-brand-500/5 dark:shadow-black/40',
    'before:absolute before:inset-[-1px] before:-z-10 before:rounded-[26px]',
    'before:bg-gradient-to-br before:from-brand-100/70 before:via-brand-50/30 before:to-transparent',
    'before:opacity-0 before:transition-opacity before:duration-500',
    'transition-all duration-300 ease-out'
)

const hoverableStyles = cn(
    'hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-500/10',
    'dark:hover:shadow-brand-400/10',
    'hover:border-brand-200 dark:hover:border-brand-600/60',
    'hover:before:opacity-100'
)

const headerStyles = cn(
    'flex items-center justify-between px-6 py-4',
    'border-b border-neutral-100/70 dark:border-neutral-700/60',
    'bg-gradient-to-r from-brand-50/70 via-white/70 to-brand-50/40',
    'dark:from-neutral-800/80 dark:via-neutral-800/60 dark:to-brand-900/30'
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
                        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
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
                'rounded-xl border border-neutral-200 bg-white p-6',
                'dark:border-neutral-700 dark:bg-neutral-800',
                className
            )}
        >
            {title && (
                <h2
                    className={cn(
                        'mb-4 text-lg font-semibold text-neutral-900 dark:text-white',
                        icon && 'flex items-center gap-2'
                    )}
                >
                    {icon}
                    {title}
                </h2>
            )}
            <div className={cn(centerContent && 'flex items-center justify-center')}>
                {children}
            </div>
        </div>
    )
}
