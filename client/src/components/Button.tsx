import { type ButtonHTMLAttributes, type ReactNode, forwardRef } from 'react'
import { Loader2 } from 'lucide-react'

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

const variantStyles: Record<ButtonVariant, string> = {
    primary: `
        bg-brand-500 text-white
        hover:bg-brand-600 active:bg-brand-700
        dark:bg-brand-600 dark:hover:bg-brand-500
        disabled:bg-brand-300 dark:disabled:bg-brand-800
    `,
    secondary: `
        bg-neutral-100 text-neutral-900
        hover:bg-neutral-200 active:bg-neutral-300
        dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700
    `,
    ghost: `
        bg-transparent text-neutral-600
        hover:bg-neutral-100 hover:text-neutral-900
        dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100
    `,
    outline: `
        bg-transparent text-brand-600
        border-2 border-brand-500
        hover:bg-brand-50
        dark:text-brand-400 dark:border-brand-400 dark:hover:bg-brand-950
    `,
}

const sizeStyles: Record<ButtonSize, string> = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-8 py-4 text-lg',
}

const baseClasses =
    'focus:ring-brand-500 inline-flex cursor-pointer items-center justify-center rounded-xl font-semibold transition-all duration-200 ease-out focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-70'

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
                className={` ${baseClasses} ${variantStyles[variant]} ${sizeStyles[size]} ${fullWidth ? 'w-full' : ''} ${className} `}
                {...props}
            >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {iconPosition === 'left' && iconElement}
                {children}
                {iconPosition === 'right' && iconElement}
            </button>
        )
    }
)

Button.displayName = 'Button'
