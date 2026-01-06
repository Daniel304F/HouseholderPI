import { type ReactNode } from 'react'

type NavItemVariant = 'default' | 'active'

interface NavItemProps {
    children: ReactNode
    variant?: NavItemVariant
    onClick?: () => void
    className?: string
}

const variantStyles: Record<NavItemVariant, string> = {
    default: `
        text-text-muted
        hover:bg-surface-hover
        hover:text-text
    `,
    active: `
        bg-brand-100
        text-brand-700
        dark:bg-brand-950
        dark:text-brand-300
    `,
}

// for general navItems purposes and used for displaying custom colors since tailwind cant display custom css classes
export const NavItem = ({
    children,
    variant = 'default',
    onClick,
    className = '',
}: NavItemProps) => {
    return (
        <button
            onClick={onClick}
            className={`flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 transition-colors duration-200 ${variantStyles[variant]} ${className} `}
        >
            {children}
        </button>
    )
}
