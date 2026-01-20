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
                'border-border bg-surface/80 border-b backdrop-blur-md',
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
                    <h1 className="text-text text-lg leading-tight font-semibold">
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
                    'flex h-10 w-10 items-center justify-center rounded-full',
                    'transition-all duration-200',
                    isActive
                        ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/50 dark:text-brand-300'
                        : 'text-text-muted hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-950 dark:hover:text-brand-400 active:scale-95'
                )}
            >
                <Settings size={20} />
            </button>
        </header>
    )
}
