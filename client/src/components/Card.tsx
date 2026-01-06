import { type ReactNode } from 'react'

export interface CardProps {
    title: string
    children: ReactNode
    className?: string
    actions?: ReactNode
}

export const Card = ({
    title,
    children,
    className = '',
    actions,
}: CardProps) => {
    return (
        <div
            className={`flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-800 ${className} `}
        >
            <div className="flex items-center justify-between border-b border-neutral-100 bg-neutral-50/50 px-6 py-4 dark:border-neutral-700 dark:bg-neutral-800/50">
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
