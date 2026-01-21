import { type ReactNode } from 'react'
import { cn } from '../utils/cn'

export interface CardProps {
    title: string
    children: ReactNode
    className?: string
    actions?: ReactNode
}

const cardStyles = cn(
    'flex flex-col overflow-hidden rounded-xl',
    'border border-neutral-200 dark:border-neutral-700',
    'bg-white dark:bg-neutral-800',
    'shadow-sm'
)

const headerStyles = cn(
    'flex items-center justify-between px-6 py-4',
    'border-b border-neutral-100 dark:border-neutral-700',
    'bg-neutral-50/50 dark:bg-neutral-800/50'
)

export const Card = ({ title, children, className, actions }: CardProps) => {
    return (
        <div className={cn(cardStyles, className)}>
            <div className={headerStyles}>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                    {title}
                </h3>
                {actions && (
                    <div className="flex items-center gap-2">{actions}</div>
                )}
            </div>
            <div className="flex-grow p-6">{children}</div>
        </div>
    )
}
