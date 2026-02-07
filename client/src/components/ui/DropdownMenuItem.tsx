import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../utils/cn'

export interface DropdownMenuItemProps
    extends ButtonHTMLAttributes<HTMLButtonElement> {
    icon?: ReactNode
    variant?: 'default' | 'danger'
}

export const DropdownMenuItem = ({
    icon,
    variant = 'default',
    children,
    className,
    ...props
}: DropdownMenuItemProps) => {
    return (
        <button
            type="button"
            className={cn(
                'flex w-full items-center gap-2 rounded-md px-3 py-2',
                'text-sm transition-colors',
                variant === 'danger'
                    ? 'text-error-600 hover:bg-error-50 dark:text-error-400 dark:hover:bg-error-900/20'
                    : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700',
                className
            )}
            {...props}
        >
            {icon}
            {children}
        </button>
    )
}
