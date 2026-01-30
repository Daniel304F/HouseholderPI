import { type ReactNode } from 'react'
import { cn } from '../../utils/cn'

type TextAlign = 'left' | 'center' | 'right'

interface HeadlineProps {
    title: string
    subtitle?: string
    children?: ReactNode
    align?: TextAlign
    className?: string
}

const alignStyles: Record<TextAlign, string> = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
}

export const Headline = ({
    title,
    subtitle,
    children,
    align = 'center',
    className,
}: HeadlineProps) => {
    return (
        <div className={cn('px-6 py-10', alignStyles[align], className)}>
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-neutral-900 sm:text-4xl md:text-5xl dark:text-neutral-100">
                {title}
            </h1>
            {subtitle && (
                <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-neutral-500 sm:text-xl dark:text-neutral-400">
                    {subtitle}
                </p>
            )}
            {children && <div className="mt-8">{children}</div>}
        </div>
    )
}

/**
 * Page header with optional back button and badge
 */
interface PageHeaderProps {
    title: string
    subtitle?: string
    backButton?: ReactNode
    badge?: ReactNode
    className?: string
}

export const PageHeader = ({
    title,
    subtitle,
    backButton,
    badge,
    className,
}: PageHeaderProps) => {
    return (
        <div className={cn('flex items-center justify-between', className)}>
            <div>
                <div className="flex items-center gap-3">
                    {backButton}
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                        {title}
                    </h1>
                </div>
                {subtitle && (
                    <p
                        className={cn(
                            'mt-1 text-neutral-500 dark:text-neutral-400',
                            backButton && 'ml-11'
                        )}
                    >
                        {subtitle}
                    </p>
                )}
            </div>
            {badge && <div className="hidden md:block">{badge}</div>}
        </div>
    )
}
