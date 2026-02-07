import { Wifi, WifiOff } from 'lucide-react'
import { cn } from '../../utils/cn'

interface ChatConnectionStatusProps {
    isConnected: boolean
}

export const ChatConnectionStatus = ({
    isConnected,
}: ChatConnectionStatusProps) => {
    return (
        <div
            className={cn(
                'flex items-center gap-2 border-b px-4 py-2 text-sm',
                isConnected
                    ? 'border-neutral-200 bg-emerald-50 text-emerald-700 dark:border-neutral-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                    : 'border-neutral-200 bg-amber-50 text-amber-700 dark:border-neutral-700 dark:bg-amber-900/20 dark:text-amber-400'
            )}
        >
            {isConnected ? (
                <>
                    <Wifi className="size-4" />
                    <span>Verbunden</span>
                </>
            ) : (
                <>
                    <WifiOff className="size-4" />
                    <span>Verbindung wird hergestellt...</span>
                </>
            )}
        </div>
    )
}
