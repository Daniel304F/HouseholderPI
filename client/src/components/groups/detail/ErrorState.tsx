import { AlertCircle } from 'lucide-react'
import { Button } from '../../common'

interface ErrorStateProps {
    onBack: () => void
    onRetry: () => void
}

export const ErrorState = ({ onBack, onRetry }: ErrorStateProps) => (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
        <AlertCircle className="size-12 text-red-500" />
        <p className="text-neutral-500 dark:text-neutral-400">
            Gruppe konnte nicht geladen werden.
        </p>
        <div className="flex gap-2">
            <Button variant="secondary" onClick={onBack}>
                Zurück
            </Button>
            <Button onClick={onRetry}>Erneut versuchen</Button>
        </div>
    </div>
)
