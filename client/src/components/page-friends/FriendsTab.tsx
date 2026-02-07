import type { Friend } from '../../api/friends'
import { FriendCard, FriendsEmptyState } from '../friends'

interface FriendsTabProps {
    friends: Friend[]
    onRemove: (friendId: string) => void
    onAddFriend: () => void
}

export const FriendsTab = ({ friends, onRemove, onAddFriend }: FriendsTabProps) => {
    if (friends.length === 0) {
        return <FriendsEmptyState onAddFriend={onAddFriend} />
    }

    return (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {friends.map((friend) => (
                <FriendCard key={friend.id} friend={friend} onRemove={onRemove} />
            ))}
        </div>
    )
}
