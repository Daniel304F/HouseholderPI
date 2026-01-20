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
                'border-border bg-surface border-b px-4 py-3',
                className
            )}
        >
            <h1 className="text-text text-lg font-semibold">Householder</h1>

            <button
                onClick={() => navigate(settingsPath)}
                className={cn(
                    'flex items-center gap-2 rounded-lg px-3 py-2',
                    'text-sm font-medium transition-colors duration-150',
                    isActive
                        ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/50 dark:text-brand-300'
                        : 'text-text-muted hover:bg-surface-hover hover:text-text'
                )}
            >
                <Settings size={18} />
                <span>Einstellungen</span>
            </button>
        </header>
    )
}
