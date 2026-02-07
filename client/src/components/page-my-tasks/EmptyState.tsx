import { ClipboardList } from 'lucide-react'
import { EmptyState as GenericEmptyState } from '../feedback'

interface EmptyStateProps {
    hasFilters: boolean
}

export const EmptyState = ({ hasFilters }: EmptyStateProps) => {
    return (
        <GenericEmptyState
            title="Keine Aufgaben gefunden"
            message={
                hasFilters
                    ? 'Versuche andere Filter oder Suchbegriffe'
                    : 'Dir sind noch keine Aufgaben zugewiesen'
            }
            icon={ClipboardList}
        />
    )
}
