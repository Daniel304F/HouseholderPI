import type { SentRequest } from '../../api/friends'
import { SentRequestCard } from '../friends'
import { SentEmptyState } from './SentEmptyState'

interface SentTabProps {
    sentRequests: SentRequest[]
    onCancel: (requestId: string) => void
    isLoading: boolean
}

export const SentTab = ({ sentRequests, onCancel, isLoading }: SentTabProps) => {
    if (sentRequests.length === 0) {
        return <SentEmptyState />
    }

    return (
        <div className="space-y-3">
            {sentRequests.map((request) => (
                <SentRequestCard
                    key={request.id}
                    request={request}
                    onCancel={onCancel}
                    isLoading={isLoading}
                />
            ))}
        </div>
    )
}
