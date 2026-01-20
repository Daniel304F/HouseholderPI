import { useNavigate, useLocation } from 'react-router-dom'
import { Settings } from 'lucide-react'
import { cn } from '../../../utils/cn'

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
            <div className="flex items-center gap-2">
                <div className="from-brand-500 to-brand-600 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br shadow-sm">
                    <span className="text-sm font-bold text-white">H</span>
                </div>
                <h1 className="text-text text-lg font-semibold">Householder</h1>
            </div>

            {/* Settings Button */}
            <button
                onClick={() => navigate(settingsPath)}
                aria-label="Einstellungen"
                className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full',
                    'transition-all duration-200',
                    isActive
                        ? 'bg-brand-100 text-brand-600 dark:bg-brand-900/50 dark:text-brand-400'
                        : 'text-text-muted hover:bg-surface-hover hover:text-text active:scale-95'
                )}
            >
                <Settings size={20} />
            </button>
        </header>
    )
}
