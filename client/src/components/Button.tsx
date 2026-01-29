import { type ButtonHTMLAttributes, type ReactNode, forwardRef } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '../utils/cn'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline'
type ButtonSize = 'sm' | 'md' | 'lg'
type IconPosition = 'left' | 'right'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children?: ReactNode
    variant?: ButtonVariant
    size?: ButtonSize
    fullWidth?: boolean
    icon?: ReactNode
    iconPosition?: IconPosition
    isLoading?: boolean
}

const baseStyles = cn(
    'inline-flex cursor-pointer items-center justify-center gap-2',
    'rounded-2xl font-semibold tracking-tight',
    'transition-all duration-200 ease-out',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-neutral-900',
    'disabled:cursor-not-allowed disabled:opacity-60',
    'active:scale-[0.985]'
)

const variantStyles: Record<ButtonVariant, string> = {
    primary: cn(
        'bg-gradient-to-br from-brand-400 via-brand-500 to-brand-600 text-white',
        'shadow-lg shadow-brand-500/25 hover:shadow-xl hover:shadow-brand-500/35',
        'hover:-translate-y-0.5',
        'active:translate-y-0 active:shadow-md',
        'border border-brand-400/60 dark:border-brand-500/60',
        'dark:from-brand-500 dark:via-brand-600 dark:to-brand-700',
        'disabled:bg-brand-300 dark:disabled:bg-brand-800 disabled:shadow-none disabled:hover:translate-y-0'
    ),
    secondary: cn(
        'bg-white/80 text-neutral-900 backdrop-blur-sm',
        'shadow-sm hover:shadow-md border border-neutral-200/80',
        'hover:bg-neutral-50 hover:-translate-y-0.5',
        'active:translate-y-0',
        'dark:bg-neutral-900/70 dark:text-neutral-50 dark:hover:bg-neutral-800',
        'dark:border-neutral-700/80 dark:shadow-black/30'
    ),
    ghost: cn(
        'bg-transparent text-neutral-600',
        'hover:bg-white/70 hover:text-neutral-900',
        'active:bg-neutral-100',
        'dark:text-neutral-400 dark:hover:bg-neutral-800/70 dark:hover:text-neutral-100'
    ),
    outline: cn(
        'bg-white/60 text-brand-700',
        'border-2 border-brand-200/80',
        'hover:bg-brand-50/70 hover:border-brand-400 hover:-translate-y-0.5',
        'hover:shadow-sm hover:shadow-brand-400/20',
        'active:translate-y-0',
        'dark:bg-transparent dark:text-brand-300 dark:border-brand-700/70',
        'dark:hover:bg-brand-900/30'
    ),
}

const sizeStyles: Record<ButtonSize, string> = {
    sm: 'px-4 py-2 text-sm gap-1.5',
    md: 'px-6 py-3 text-base gap-2',
    lg: 'px-8 py-4 text-lg gap-2.5',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            children,
            variant = 'primary',
            size = 'md',
            fullWidth = false,
            icon,
            iconPosition = 'left',
            isLoading = false,
            className = '',
            disabled,
            type = 'button',
            ...props
        },
        ref
    ) => {
        const iconElement = icon && !isLoading && (
            <span
                className={
                    children
                        ? iconPosition === 'left'
                            ? 'mr-2 flex-shrink-0'
                            : 'ml-2 flex-shrink-0'
                        : ''
                }
            >
                {icon}
            </span>
        )

        return (
            <button
                ref={ref}
                type={type}
                disabled={disabled || isLoading}
                className={cn(
                    baseStyles,
                    variantStyles[variant],
                    sizeStyles[size],
                    fullWidth && 'w-full',
                    className
                )}
                {...props}
            >
                {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
                {iconPosition === 'left' && iconElement}
                {children}
                {iconPosition === 'right' && iconElement}
            </button>
        )
    }
)

Button.displayName = 'Button'
