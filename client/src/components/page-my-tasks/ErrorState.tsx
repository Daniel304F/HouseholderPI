import { AlertCircle } from 'lucide-react'
import { ErrorState as GenericErrorState } from '../feedback'

interface ErrorStateProps {
    onRetry: () => void
}

export const ErrorState = ({ onRetry }: ErrorStateProps) => {
    return (
        <GenericErrorState
            title="Aufgaben konnten nicht geladen werden"
            message="Bitte versuche es erneut."
            icon={AlertCircle}
            onRetry={onRetry}
        />
    )
}
