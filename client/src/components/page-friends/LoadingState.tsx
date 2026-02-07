import { FriendCardSkeleton, RequestCardSkeleton } from '../friends'

interface LoadingStateProps {
    activeTab: string
}

export const LoadingState = ({ activeTab }: LoadingStateProps) => {
    if (activeTab === 'friends') {
        return <FriendCardSkeleton count={4} />
    }

    return <RequestCardSkeleton count={3} />
}
