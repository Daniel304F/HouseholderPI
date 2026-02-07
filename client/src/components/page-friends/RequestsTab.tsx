import type { FriendRequest } from '../../api/friends'
import { FriendRequestCard } from '../friends'
import { RequestsEmptyState } from './RequestsEmptyState'

interface RequestsTabProps {
    requests: FriendRequest[]
    onAccept: (requestId: string) => void
    onReject: (requestId: string) => void
    isLoading: boolean
}

export const RequestsTab = ({
    requests,
    onAccept,
    onReject,
    isLoading,
}: RequestsTabProps) => {
    if (requests.length === 0) {
        return <RequestsEmptyState />
    }

    return (
        <div className="space-y-3">
            {requests.map((request) => (
                <FriendRequestCard
                    key={request.id}
                    request={request}
                    onAccept={onAccept}
                    onReject={onReject}
                    isLoading={isLoading}
                />
            ))}
        </div>
    )
}
