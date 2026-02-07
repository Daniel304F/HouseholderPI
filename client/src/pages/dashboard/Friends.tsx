import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { UserPlus } from 'lucide-react'
import { Button } from '../../components/common'
import { Tabs as ContentTabs } from '../../components/display'
import { AddFriendModal } from '../../components/friends'
import {
    ErrorState,
    FriendsTab,
    LoadingState,
    QUERY_KEYS,
    RequestsTab,
    SentTab,
    TABS,
} from '../../components/page-friends'
import { PageIntro } from '../../components/ui'
import { friendsApi } from '../../api/friends'
import { useFriendsMutations } from '../../hooks'

export const Friends = () => {
    const [activeTab, setActiveTab] = useState('friends')
    const [showAddModal, setShowAddModal] = useState(false)

    const {
        sendRequestMutation,
        respondMutation,
        cancelRequestMutation,
        removeFriendMutation,
    } = useFriendsMutations()

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
        if (confirm('Moechtest du diesen Freund wirklich entfernen?')) {
            removeFriendMutation.mutate(friendId)
        }
    }

    const requestCount = requests.length
    const tabsWithBadges = useMemo(() => {
        return TABS.map((tab) => ({
            ...tab,
            badge: tab.id === 'requests' && requestCount > 0 ? requestCount : undefined,
        }))
    }, [requestCount])

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

    const summary = `${friends.length} Freund${friends.length !== 1 ? 'e' : ''}${
        requestCount > 0
            ? ` - ${requestCount} neue Anfrage${requestCount !== 1 ? 'n' : ''}`
            : ''
    }`

    return (
        <div className="space-y-6">
            <PageIntro
                title="Freunde"
                description={summary}
                action={
                    <Button
                        onClick={() => setShowAddModal(true)}
                        icon={<UserPlus className="size-5" />}
                    >
                        <span className="hidden sm:inline">Freund hinzufuegen</span>
                        <span className="sm:hidden">Hinzufuegen</span>
                    </Button>
                }
            />

            <ContentTabs
                tabs={tabsWithBadges}
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />

            {isError && <ErrorState onRetry={refetch} />}
            {isLoading && !isError && <LoadingState activeTab={activeTab} />}

            {!isLoading && !isError && activeTab === 'friends' && (
                <FriendsTab
                    friends={friends}
                    onRemove={handleRemoveFriend}
                    onAddFriend={() => setShowAddModal(true)}
                />
            )}

            {!isLoading && !isError && activeTab === 'requests' && (
                <RequestsTab
                    requests={requests}
                    onAccept={handleAcceptRequest}
                    onReject={handleRejectRequest}
                    isLoading={respondMutation.isPending}
                />
            )}

            {!isLoading && !isError && activeTab === 'sent' && (
                <SentTab
                    sentRequests={sentRequests}
                    onCancel={handleCancelRequest}
                    isLoading={cancelRequestMutation.isPending}
                />
            )}

            <AddFriendModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSendRequest={handleSendRequest}
            />
        </div>
    )
}
