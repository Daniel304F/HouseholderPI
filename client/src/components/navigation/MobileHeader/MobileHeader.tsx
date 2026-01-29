import { useNavigate, useLocation } from 'react-router-dom'
import { Settings } from 'lucide-react'
import { cn } from '../../../utils/cn'
import { useHeaderContext } from '../../../contexts/HeaderContext'

interface MobileHeaderProps {
    settingsPath: string
    className?: string
}

export const MobileHeader = ({
    settingsPath,
    className,
}: MobileHeaderProps) => {
    const navigate = useNavigate()
    const location = useLocation()
    const { title, subtitle } = useHeaderContext()

    const isActive = location.pathname === settingsPath

    return (
        <header
            className={cn(
                'flex items-center justify-between',
                'border-border/80 border-b bg-white/80 backdrop-blur-xl dark:bg-neutral-950/70',
                'shadow-brand-500/10 shadow-md dark:shadow-black/30',
                'px-4 py-3',
                'safe-area-top',
                className
            )}
        >
            {/* Logo / Title */}
            <div className="flex items-center gap-2.5">
                <img
                    src="/householderPI.svg"
                    alt="Householder Logo"
                    className="h-8 w-8"
                />
                <div className="flex flex-col">
                    <h1 className="text-text text-lg leading-tight font-semibold tracking-tight">
                        {title || 'Householder'}
                    </h1>
                    {subtitle && (
                        <span className="text-text-muted text-xs">
                            {subtitle}
                        </span>
                    )}
                </div>
            </div>

            {/* Settings Button */}
            <button
                onClick={() => navigate(settingsPath)}
                aria-label="Einstellungen"
                className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-2xl',
                    'transition-all duration-250',
                    isActive
                        ? 'from-brand-400/80 via-brand-500/80 to-brand-600/80 shadow-brand-500/20 ring-brand-200/60 dark:ring-brand-900/40 bg-gradient-to-br text-white shadow-md ring-2'
                        : 'text-text-muted hover:shadow-brand-500/10 border border-neutral-200/70 bg-white/70 hover:-translate-y-[1px] hover:shadow-lg active:scale-95 dark:border-neutral-800/60 dark:bg-neutral-900/60'
                )}
            >
                <Settings size={20} />
            </button>
        </header>
    )
}
