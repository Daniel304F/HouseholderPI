import { Send } from 'lucide-react'
import { EmptyState } from '../feedback'

export const SentEmptyState = () => {
    return (
        <EmptyState
            title="Keine gesendeten Anfragen"
            icon={Send}
            size="sm"
        />
    )
}
