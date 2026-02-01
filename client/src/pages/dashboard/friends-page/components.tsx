import { RefreshCw, Inbox, Send } from 'lucide-react'
import { cn } from '../../../utils/cn'
import { Button } from '../../../components/common'
import {
    FriendCard,
    FriendCardSkeleton,
    FriendRequestCard,
    SentRequestCard,
    RequestCardSkeleton,
    FriendsEmptyState,
} from '../../../components/friends'
import type { Friend, FriendRequest, SentFriendRequest } from '../../../api/friends'

// =============================================================================
// Loading States
// =============================================================================

interface LoadingStateProps {
    activeTab: string
}

export const LoadingState = ({ activeTab }: LoadingStateProps) => (
    <div className="space-y-3">
        {activeTab === 'friends' ? (
            <FriendCardSkeleton count={4} />
        ) : (
            <RequestCardSkeleton count={3} />
        )}
    </div>
)

// =============================================================================
// Error State
// =============================================================================

interface ErrorStateProps {
    onRetry: () => void
}

export const ErrorState = ({ onRetry }: ErrorStateProps) => (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
        <p className="text-neutral-500 dark:text-neutral-400">
            Daten konnten nicht geladen werden.
        </p>
        <Button
            variant="secondary"
            onClick={onRetry}
            icon={<RefreshCw className="size-5" />}
        >
            Erneut versuchen
        </Button>
    </div>
)

// =============================================================================
// Empty States
// =============================================================================

export const RequestsEmptyState = () => (
    <div
        className={cn(
            'flex flex-col items-center justify-center py-12',
            'text-neutral-500 dark:text-neutral-400'
        )}
    >
        <Inbox className="mb-4 size-12 opacity-50" />
        <p>Keine ausstehenden Anfragen</p>
    </div>
)

export const SentEmptyState = () => (
    <div
        className={cn(
            'flex flex-col items-center justify-center py-12',
            'text-neutral-500 dark:text-neutral-400'
        )}
    >
        <Send className="mb-4 size-12 opacity-50" />
        <p>Keine gesendeten Anfragen</p>
    </div>
)

// =============================================================================
// Tab Contents
// =============================================================================

interface FriendsTabProps {
    friends: Friend[]
    onRemove: (friendId: string) => void
    onAddFriend: () => void
}

export const FriendsTab = ({ friends, onRemove, onAddFriend }: FriendsTabProps) => (
    <>
        {friends.length === 0 ? (
            <FriendsEmptyState onAddFriend={onAddFriend} />
        ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {friends.map((friend) => (
                    <FriendCard
                        key={friend.id}
                        friend={friend}
                        onRemove={onRemove}
                    />
                ))}
            </div>
        )}
    </>
)

interface RequestsTabProps {
    requests: FriendRequest[]
    onAccept: (requestId: string) => void
    onReject: (requestId: string) => void
    isLoading: boolean
}

export const RequestsTab = ({ requests, onAccept, onReject, isLoading }: RequestsTabProps) => (
    <>
        {requests.length === 0 ? (
            <RequestsEmptyState />
        ) : (
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
        )}
    </>
)

interface SentTabProps {
    sentRequests: SentFriendRequest[]
    onCancel: (requestId: string) => void
    isLoading: boolean
}

export const SentTab = ({ sentRequests, onCancel, isLoading }: SentTabProps) => (
    <>
        {sentRequests.length === 0 ? (
            <SentEmptyState />
        ) : (
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
        )}
    </>
)
