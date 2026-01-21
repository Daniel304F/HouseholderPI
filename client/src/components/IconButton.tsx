import type { LucideIcon } from 'lucide-react'
import { cn } from '../utils/cn'

type IconButtonVariant = 'default' | 'ghost'

interface IconButtonProps {
    icon: LucideIcon
    onClick: () => void
    size?: number
    variant?: IconButtonVariant
    className?: string
    ariaLabel?: string
}

const baseStyles = cn(
    'cursor-pointer rounded-full p-1.5',
    'transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-brand-500/20'
)

const variantStyles: Record<IconButtonVariant, string> = {
    default: cn(
        'bg-neutral-200 dark:bg-neutral-700',
        'text-neutral-500 dark:text-neutral-400',
        'hover:bg-neutral-300 dark:hover:bg-neutral-600',
        'hover:text-neutral-700 dark:hover:text-neutral-200'
    ),
    ghost: cn(
        'bg-transparent',
        'text-neutral-400 dark:text-neutral-500',
        'hover:bg-neutral-100 dark:hover:bg-neutral-800',
        'hover:text-neutral-600 dark:hover:text-neutral-300'
    ),
}

export const IconButton = ({
    icon: Icon,
    onClick,
    size = 14,
    variant = 'default',
    className,
    ariaLabel,
}: IconButtonProps) => {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(baseStyles, variantStyles[variant], className)}
            aria-label={ariaLabel}
        >
            <Icon size={size} />
        </button>
    )
}
