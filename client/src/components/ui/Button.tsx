import { type ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps {
    children: ReactNode
    variant?: ButtonVariant
    size?: ButtonSize
    onClick?: () => void
    disabled?: boolean
    fullWidth?: boolean
    icon?: ReactNode
    className?: string
}

const variantStyles: Record<ButtonVariant, string> = {
    primary: `
        bg-brand-500 text-white
        hover:bg-brand-600
        active:bg-brand-700
        dark:bg-brand-600 dark:hover:bg-brand-500
    `,
    secondary: `
        bg-neutral-100 text-neutral-900
        hover:bg-neutral-200
        active:bg-neutral-300
        dark:bg-neutral-800 dark:text-neutral-100
        dark:hover:bg-neutral-700
    `,
    ghost: `
        bg-transparent text-text-muted
        hover:bg-surface-hover hover:text-text
    `,
    outline: `
        bg-transparent text-brand-600
        border-2 border-brand-500
        hover:bg-brand-50
        dark:text-brand-400 dark:border-brand-400
        dark:hover:bg-brand-950
    `,
}

const sizeStyles: Record<ButtonSize, string> = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-5 py-2.5 text-base gap-2',
    lg: 'px-8 py-4 text-lg gap-2.5',
}

export const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    onClick,
    disabled = false,
    fullWidth = false,
    icon,
    className = '',
}: ButtonProps) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`focus:ring-brand-500 inline-flex cursor-pointer items-center justify-center rounded-xl font-semibold transition-all duration-200 ease-out focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${variantStyles[variant]} ${sizeStyles[size]} ${fullWidth ? 'w-full' : ''} ${className} `}
        >
            {icon && <span className="flex-shrink-0">{icon}</span>}
            {children}
        </button>
    )
}
