import type { ReactNode, ButtonHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

type IconButtonVariant = 'default' | 'ghost' | 'danger'
type IconButtonSize = 'sm' | 'md' | 'lg'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    icon: ReactNode
    variant?: IconButtonVariant
    size?: IconButtonSize
    'aria-label'?: string
}

const baseStyles = cn(
    'cursor-pointer rounded-full',
    'transition-all duration-200 ease-out',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30',
    'active:scale-90',
    'disabled:cursor-not-allowed disabled:opacity-50'
)

const variantStyles: Record<IconButtonVariant, string> = {
    default: cn(
        'bg-neutral-100 dark:bg-neutral-700/80',
        'text-neutral-500 dark:text-neutral-400',
        'hover:bg-brand-100 dark:hover:bg-brand-900/40',
        'hover:text-brand-600 dark:hover:text-brand-400',
        'hover:shadow-md hover:shadow-brand-500/10',
        'border border-transparent hover:border-brand-200 dark:hover:border-brand-700/50'
    ),
    ghost: cn(
        'bg-transparent',
        'text-neutral-400 dark:text-neutral-500',
        'hover:bg-neutral-100/80 dark:hover:bg-neutral-800/80',
        'hover:text-neutral-600 dark:hover:text-neutral-300'
    ),
    danger: cn(
        'bg-transparent',
        'text-neutral-400',
        'hover:bg-error-100 hover:text-error-600',
        'dark:hover:bg-error-900/30 dark:hover:text-error-400'
    ),
}

const sizeStyles: Record<IconButtonSize, string> = {
    sm: 'p-1.5',
    md: 'p-2.5',
    lg: 'p-3',
}

export const IconButton = ({
    icon,
    variant = 'default',
    size = 'md',
    className,
    'aria-label': ariaLabel,
    ...props
}: IconButtonProps) => {
    return (
        <button
            type="button"
            className={cn(
                baseStyles,
                variantStyles[variant],
                sizeStyles[size],
                className
            )}
            aria-label={ariaLabel}
            {...props}
        >
            {icon}
        </button>
    )
}
