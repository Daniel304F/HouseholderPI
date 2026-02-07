import type { ReactNode } from 'react'
import { cn } from '../../utils/cn'

export interface PageIntroProps {
    title: string
    description?: string
    icon?: ReactNode
    action?: ReactNode
    className?: string
}

export const PageIntro = ({
    title,
    description,
    icon,
    action,
    className,
}: PageIntroProps) => {
    return (
        <header
            className={cn(
                'flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between',
                className
            )}
        >
            <div className="flex min-w-0 items-start gap-3">
                {icon && (
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 dark:bg-brand-900/30">
                        {icon}
                    </span>
                )}
                <div className="min-w-0">
                    <h1 className="truncate text-2xl font-bold text-neutral-900 dark:text-white">
                        {title}
                    </h1>
                    {description && (
                        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400 sm:text-base">
                            {description}
                        </p>
                    )}
                </div>
            </div>
            {action && <div className="shrink-0">{action}</div>}
        </header>
    )
}
