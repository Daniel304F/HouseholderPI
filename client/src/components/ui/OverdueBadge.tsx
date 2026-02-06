import { AlertTriangle } from 'lucide-react'

export const OverdueBadge = () => {
    return (
        <span className="inline-flex items-center gap-1 rounded bg-error-100 px-1.5 py-0.5 text-xs font-medium text-error-700 dark:bg-error-900/30 dark:text-error-400">
            <AlertTriangle className="size-3" />
            Überfällig
        </span>
    )
}
