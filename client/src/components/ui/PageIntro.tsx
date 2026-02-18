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
                    <h1 className="break-words text-xl font-bold text-neutral-900 sm:text-2xl dark:text-white">
                        {title}
                    </h1>
                    {description && (
                        <p className="mt-1 max-w-[70ch] text-sm text-neutral-500 sm:text-base dark:text-neutral-400">
                            {description}
                        </p>
                    )}
                </div>
            </div>
            {action && (
                <div className="hide-scrollbar overflow-x-auto pb-1 sm:pb-0">
                    <div className="w-max">{action}</div>
                </div>
            )}
        </header>
    )
}
