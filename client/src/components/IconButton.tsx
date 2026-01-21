import type { LucideIcon } from 'lucide-react'

interface IconButtonProps {
    icon: LucideIcon
    onClick: () => void
    size?: number
    variant?: 'default' | 'ghost'
    className?: string
    ariaLabel?: string
}

export const IconButton = ({
    icon: Icon,
    onClick,
    size = 14,
    variant = 'default',
    className = '',
    ariaLabel,
}: IconButtonProps) => {
    const variantClasses =
        variant === 'ghost'
            ? 'bg-transparent hover:bg-transparent text-slate-400 hover:text-slate-600'
            : 'bg-slate-200 hover:bg-slate-300 text-slate-500 hover:text-slate-700'

    return (
        <button
            type="button"
            onClick={onClick}
            className={`cursor-pointer rounded-full p-1.5 transition-all duration-200 focus:outline-none ${variantClasses} ${className} `}
            aria-label={ariaLabel}
        >
            <Icon size={size} />
        </button>
    )
}
