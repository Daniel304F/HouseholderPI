import { History } from 'lucide-react'
import { EmptyState as GenericEmptyState } from '../feedback'

export const EmptyState = () => {
    return (
        <GenericEmptyState
            title="Keine erledigten Aufgaben"
            message="Sobald du Aufgaben abschliesst, erscheinen sie hier"
            icon={History}
        />
    )
}
