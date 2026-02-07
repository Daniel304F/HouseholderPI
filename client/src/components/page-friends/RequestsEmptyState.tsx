import { Inbox } from 'lucide-react'
import { EmptyState } from '../feedback'

export const RequestsEmptyState = () => {
    return (
        <EmptyState
            title="Keine ausstehenden Anfragen"
            icon={Inbox}
            size="sm"
        />
    )
}
