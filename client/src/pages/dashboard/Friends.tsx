import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { UserPlus } from 'lucide-react'
import { Button } from '../../components/common'
import { AddFriendModal } from '../../components/friends'
import { Tabs as ContentTabs } from '../../components/display'
import { friendsApi } from '../../api/friends'
import { useFriendsMutations } from '../../hooks'
import {
    TABS,
    QUERY_KEYS,
    LoadingState,
    ErrorState,
    FriendsTab,
    RequestsTab,
    SentTab,
} from '../../components/page-friends'

export const Friends = () => {
    const [activeTab, setActiveTab] = useState('friends')
    const [showAddModal, setShowAddModal] = useState(false)

    // Mutations
    const {
        sendRequestMutation,
        respondMutation,
        cancelRequestMutation,
        removeFriendMutation,
    } = useFriendsMutations()

    // Queries
    const {
        data: friends = [],
        isLoading: friendsLoading,
        isError: friendsError,
        refetch: refetchFriends,
    } = useQuery({
        queryKey: QUERY_KEYS.friends,
        queryFn: friendsApi.getFriends,
    })

    const {
        data: requests = [],
        isLoading: requestsLoading,
        isError: requestsError,
        refetch: refetchRequests,
    } = useQuery({
        queryKey: QUERY_KEYS.requests,
        queryFn: friendsApi.getRequests,
    })

    const {
        data: sentRequests = [],
        isLoading: sentLoading,
        isError: sentError,
        refetch: refetchSent,
    } = useQuery({
        queryKey: QUERY_KEYS.sent,
        queryFn: friendsApi.getSentRequests,
    })

    // Handlers
    const handleSendRequest = async (email: string) => {
        await sendRequestMutation.mutateAsync(email)
    }

    const handleAcceptRequest = (requestId: string) => {
        respondMutation.mutate({ requestId, accept: true })
    }

    const handleRejectRequest = (requestId: string) => {
        respondMutation.mutate({ requestId, accept: false })
    }

    const handleCancelRequest = (requestId: string) => {
        cancelRequestMutation.mutate(requestId)
    }

    const handleRemoveFriend = (friendId: string) => {
        if (confirm('Möchtest du diesen Freund wirklich entfernen?')) {
            removeFriendMutation.mutate(friendId)
        }
    }

    // Badge counts for tabs
    const requestCount = requests.length
    const tabsWithBadges = TABS.map((tab) => ({
        ...tab,
        badge: tab.id === 'requests' && requestCount > 0 ? requestCount : undefined,
    }))

    // Loading states
    const isLoading =
        (activeTab === 'friends' && friendsLoading) ||
        (activeTab === 'requests' && requestsLoading) ||
        (activeTab === 'sent' && sentLoading)

    const isError =
        (activeTab === 'friends' && friendsError) ||
        (activeTab === 'requests' && requestsError) ||
        (activeTab === 'sent' && sentError)

    const refetch = () => {
        if (activeTab === 'friends') refetchFriends()
        else if (activeTab === 'requests') refetchRequests()
        else refetchSent()
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                        Freunde
                    </h1>
                    <p className="text-neutral-500 dark:text-neutral-400">
                        {friends.length} Freund{friends.length !== 1 ? 'e' : ''}
                        {requestCount > 0 &&
                            ` • ${requestCount} neue Anfrage${requestCount !== 1 ? 'n' : ''}`}
                    </p>
                </div>
                <Button
                    onClick={() => setShowAddModal(true)}
                    icon={<UserPlus className="size-5" />}
                >
                    <span className="hidden sm:inline">Freund hinzufügen</span>
                    <span className="sm:hidden">Hinzufügen</span>
                </Button>
            </div>

            {/* Tabs */}
            <ContentTabs
                tabs={tabsWithBadges}
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />

            {/* Error State */}
            {isError && <ErrorState onRetry={refetch} />}

            {/* Loading State */}
            {isLoading && !isError && <LoadingState activeTab={activeTab} />}

            {/* Content */}
            {!isLoading && !isError && (
                <>
                    {activeTab === 'friends' && (
                        <FriendsTab
                            friends={friends}
                            onRemove={handleRemoveFriend}
                            onAddFriend={() => setShowAddModal(true)}
                        />
                    )}

                    {activeTab === 'requests' && (
                        <RequestsTab
                            requests={requests}
                            onAccept={handleAcceptRequest}
                            onReject={handleRejectRequest}
                            isLoading={respondMutation.isPending}
                        />
                    )}

                    {activeTab === 'sent' && (
                        <SentTab
                            sentRequests={sentRequests}
                            onCancel={handleCancelRequest}
                            isLoading={cancelRequestMutation.isPending}
                        />
                    )}
                </>
            )}

            {/* Add Friend Modal */}
            <AddFriendModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSendRequest={handleSendRequest}
            />
        </div>
    )
}
