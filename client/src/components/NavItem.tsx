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
        hover:bg-white/80 hover:shadow-sm hover:shadow-brand-500/10
        dark:hover:bg-neutral-900/70 dark:hover:shadow-brand-900/20
        hover:text-brand-700
        dark:hover:text-brand-300
        hover:border-brand-200/60
        dark:hover:border-brand-800/60
    `,
    active: `
        bg-gradient-to-r from-brand-100 via-white to-brand-50
        dark:from-brand-950 dark:via-neutral-900 dark:to-brand-900/40
        text-brand-700 dark:text-brand-200
        border-brand-200/80 dark:border-brand-800
        shadow-md shadow-brand-500/15
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
            className={`flex cursor-pointer items-center gap-2.5 rounded-2xl border border-transparent px-4 py-2.5 font-semibold tracking-tight transition-all duration-200 ease-out hover:-translate-y-[1px] active:scale-[0.985] ${variantStyles[variant]} ${className} `}
        >
            {children}
        </button>
    )
}
