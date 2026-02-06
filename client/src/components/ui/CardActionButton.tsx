import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../utils/cn'

export interface CardActionButtonProps
    extends ButtonHTMLAttributes<HTMLButtonElement> {
    icon: ReactNode
    variant?: 'default' | 'danger'
}

const baseStyles = cn(
    'flex h-7 w-7 items-center justify-center rounded-lg',
    'bg-neutral-100/90 dark:bg-neutral-700/90',
    'transition-all duration-200 backdrop-blur-sm',
    'active:scale-90'
)

const variantStyles: Record<
    NonNullable<CardActionButtonProps['variant']>,
    string
> = {
    default: cn(
        'text-neutral-500 dark:text-neutral-400',
        'hover:bg-brand-100 hover:text-brand-600',
        'dark:hover:bg-brand-900/40 dark:hover:text-brand-400'
    ),
    danger: cn(
        'text-neutral-500 dark:text-neutral-400',
        'hover:bg-error-100 hover:text-error-600',
        'dark:hover:bg-error-900/40 dark:hover:text-error-400'
    ),
}

export const CardActionButton = ({
    icon,
    variant = 'default',
    className,
    ...props
}: CardActionButtonProps) => {
    return (
        <button
            type="button"
            className={cn(baseStyles, variantStyles[variant], className)}
            {...props}
        >
            {icon}
        </button>
    )
}
