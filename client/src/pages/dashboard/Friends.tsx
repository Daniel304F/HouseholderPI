import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { UserPlus, RefreshCw, Inbox, Send, Users } from 'lucide-react'
import { Button } from '../../components/Button'
import {
    FriendCard,
    FriendCardSkeleton,
    FriendRequestCard,
    SentRequestCard,
    RequestCardSkeleton,
    AddFriendModal,
    FriendsEmptyState,
} from '../../components/friends'
import { ContentTabs, type Tab } from '../../components/ContentTabs'
import { friendsApi } from '../../api/friends'
import { cn } from '../../utils/cn'

const tabs: Tab[] = [
    { id: 'friends', label: 'Freunde', icon: <Users className="size-4" /> },
    { id: 'requests', label: 'Anfragen', icon: <Inbox className="size-4" /> },
    { id: 'sent', label: 'Gesendet', icon: <Send className="size-4" /> },
]

const queryKeys = {
    friends: ['friends'] as const,
    requests: ['friends', 'requests'] as const,
    sent: ['friends', 'sent'] as const,
}

export const Friends = () => {
    const queryClient = useQueryClient()
    const [activeTab, setActiveTab] = useState('friends')
    const [showAddModal, setShowAddModal] = useState(false)

    // Queries
    const {
        data: friends = [],
        isLoading: friendsLoading,
        isError: friendsError,
        refetch: refetchFriends,
    } = useQuery({
        queryKey: queryKeys.friends,
        queryFn: friendsApi.getFriends,
    })

    const {
        data: requests = [],
        isLoading: requestsLoading,
        isError: requestsError,
        refetch: refetchRequests,
    } = useQuery({
        queryKey: queryKeys.requests,
        queryFn: friendsApi.getRequests,
    })

    const {
        data: sentRequests = [],
        isLoading: sentLoading,
        isError: sentError,
        refetch: refetchSent,
    } = useQuery({
        queryKey: queryKeys.sent,
        queryFn: friendsApi.getSentRequests,
    })

    // Mutations
    const sendRequestMutation = useMutation({
        mutationFn: (email: string) => friendsApi.sendRequest({ email }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.sent })
        },
    })

    const respondMutation = useMutation({
        mutationFn: ({
            requestId,
            accept,
        }: {
            requestId: string
            accept: boolean
        }) => friendsApi.respondToRequest(requestId, { accept }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.friends })
            queryClient.invalidateQueries({ queryKey: queryKeys.requests })
        },
    })

    const cancelRequestMutation = useMutation({
        mutationFn: friendsApi.cancelRequest,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.sent })
        },
    })

    const removeFriendMutation = useMutation({
        mutationFn: friendsApi.removeFriend,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.friends })
        },
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
    const tabsWithBadges = tabs.map((tab) => ({
        ...tab,
        badge:
            tab.id === 'requests' && requestCount > 0
                ? requestCount
                : undefined,
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
            {isError && (
                <div className="flex flex-col items-center justify-center gap-4 py-12">
                    <p className="text-neutral-500 dark:text-neutral-400">
                        Daten konnten nicht geladen werden.
                    </p>
                    <Button
                        variant="secondary"
                        onClick={refetch}
                        icon={<RefreshCw className="size-5" />}
                    >
                        Erneut versuchen
                    </Button>
                </div>
            )}

            {/* Loading State */}
            {isLoading && !isError && (
                <div className="space-y-3">
                    {activeTab === 'friends' ? (
                        <FriendCardSkeleton count={4} />
                    ) : (
                        <RequestCardSkeleton count={3} />
                    )}
                </div>
            )}

            {/* Content */}
            {!isLoading && !isError && (
                <>
                    {/* Friends Tab */}
                    {activeTab === 'friends' && (
                        <>
                            {friends.length === 0 ? (
                                <FriendsEmptyState
                                    onAddFriend={() => setShowAddModal(true)}
                                />
                            ) : (
                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                    {friends.map((friend) => (
                                        <FriendCard
                                            key={friend.id}
                                            friend={friend}
                                            onRemove={handleRemoveFriend}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {/* Requests Tab */}
                    {activeTab === 'requests' && (
                        <>
                            {requests.length === 0 ? (
                                <div
                                    className={cn(
                                        'flex flex-col items-center justify-center py-12',
                                        'text-neutral-500 dark:text-neutral-400'
                                    )}
                                >
                                    <Inbox className="mb-4 size-12 opacity-50" />
                                    <p>Keine ausstehenden Anfragen</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {requests.map((request) => (
                                        <FriendRequestCard
                                            key={request.id}
                                            request={request}
                                            onAccept={handleAcceptRequest}
                                            onReject={handleRejectRequest}
                                            isLoading={
                                                respondMutation.isPending
                                            }
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {/* Sent Tab */}
                    {activeTab === 'sent' && (
                        <>
                            {sentRequests.length === 0 ? (
                                <div
                                    className={cn(
                                        'flex flex-col items-center justify-center py-12',
                                        'text-neutral-500 dark:text-neutral-400'
                                    )}
                                >
                                    <Send className="mb-4 size-12 opacity-50" />
                                    <p>Keine gesendeten Anfragen</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {sentRequests.map((request) => (
                                        <SentRequestCard
                                            key={request.id}
                                            request={request}
                                            onCancel={handleCancelRequest}
                                            isLoading={
                                                cancelRequestMutation.isPending
                                            }
                                        />
                                    ))}
                                </div>
                            )}
                        </>
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
