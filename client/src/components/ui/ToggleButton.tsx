import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

export interface ToggleButtonProps
    extends ButtonHTMLAttributes<HTMLButtonElement> {
    selected: boolean
}

export const ToggleButton = ({
    selected,
    children,
    className,
    ...props
}: ToggleButtonProps) => {
    return (
        <button
            type="button"
            className={cn(
                'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                selected
                    ? 'bg-brand-500 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700',
                className
            )}
            {...props}
        >
            {children}
        </button>
    )
}
