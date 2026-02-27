import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
    Loader2,
    MessageCircle,
    Send,
    User,
    X,
    Wifi,
    WifiOff,
} from 'lucide-react'
import { type DirectMessage, type Friend, friendsApi } from '../../api/friends'
import { useAuth } from '../../contexts/AuthContext'
import { getUploadUrl } from '../../lib/axios'
import { cn } from '../../utils/cn'
import { useSocket } from '../../hooks/useSocket'
import { DIRECT_CHAT_OPEN_EVENT } from './directChat.events'

const DIRECT_MESSAGES_QUERY_KEY = (friendId: string) => [
    'directMessages',
    'popup',
    friendId,
]

const appendUniqueMessage = (
    messages: DirectMessage[],
    incoming: DirectMessage
): DirectMessage[] => {
    if (messages.some((message) => message.id === incoming.id)) {
        return messages
    }
    return [...messages, incoming]
}

const toOtherFriendId = (message: DirectMessage, currentUserId?: string) =>
    message.senderId === currentUserId ? message.recipientId : message.senderId

const isDirectMessagePayload = (value: unknown): value is DirectMessage => {
    if (!value || typeof value !== 'object') {
        return false
    }
    const maybe = value as Partial<DirectMessage>
    return (
        typeof maybe.id === 'string' &&
        typeof maybe.senderId === 'string' &&
        typeof maybe.recipientId === 'string' &&
        typeof maybe.content === 'string'
    )
}

const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString('de-DE', {
        hour: '2-digit',
        minute: '2-digit',
    })

export const DirectMessagePopup = () => {
    const { user } = useAuth()
    const queryClient = useQueryClient()
    const messageContainerRef = useRef<HTMLDivElement>(null)
    const [isOpen, setIsOpen] = useState(false)
    const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null)
    const [draft, setDraft] = useState('')
    const [unreadByFriend, setUnreadByFriend] = useState<Record<string, number>>({})

    const { data: friends = [] } = useQuery({
        queryKey: ['friends'],
        queryFn: friendsApi.getFriends,
    })

    const selectedFriend = useMemo(
        () => friends.find((friend) => friend.friendId === selectedFriendId) || null,
        [friends, selectedFriendId]
    )

    useEffect(() => {
        if (selectedFriendId && friends.some((friend) => friend.friendId === selectedFriendId)) {
            return
        }
        if (friends.length > 0) {
            setSelectedFriendId(friends[0]?.friendId || null)
        } else {
            setSelectedFriendId(null)
        }
    }, [friends, selectedFriendId])

    const {
        data: directMessagesData,
        isLoading: isLoadingMessages,
        isFetching: isFetchingMessages,
    } = useQuery({
        queryKey: DIRECT_MESSAGES_QUERY_KEY(selectedFriendId || ''),
        queryFn: () => friendsApi.getDirectMessages(selectedFriendId!, 50),
        enabled: isOpen && Boolean(selectedFriendId),
    })

    const messages = useMemo(
        () => directMessagesData?.messages || [],
        [directMessagesData?.messages]
    )

    useEffect(() => {
        if (!isOpen) return
        const container = messageContainerRef.current
        if (!container) return
        container.scrollTop = container.scrollHeight
    }, [isOpen, messages.length, selectedFriendId])

    const handleDirectMessage = useCallback(
        (payload: unknown) => {
            if (!isDirectMessagePayload(payload)) return
            const incoming = payload
            const otherFriendId = toOtherFriendId(incoming, user?.id)

            queryClient.setQueryData(
                DIRECT_MESSAGES_QUERY_KEY(otherFriendId),
                (
                    previous:
                        | { messages: DirectMessage[]; hasMore: boolean }
                        | undefined
                ) => ({
                    messages: appendUniqueMessage(previous?.messages || [], incoming),
                    hasMore: previous?.hasMore || false,
                })
            )

            const fromOtherUser = incoming.senderId !== user?.id
            const isActiveConversation =
                isOpen && selectedFriendId !== null && selectedFriendId === otherFriendId

            if (fromOtherUser && !isActiveConversation) {
                setUnreadByFriend((previous) => ({
                    ...previous,
                    [otherFriendId]: (previous[otherFriendId] || 0) + 1,
                }))
            }
        },
        [isOpen, queryClient, selectedFriendId, user?.id]
    )

    const { isConnected } = useSocket({
        onDirectMessage: handleDirectMessage,
    })

    useEffect(() => {
        const onOpenChat = (event: Event) => {
            const customEvent = event as CustomEvent<{ friendId?: string }>
            const friendId = customEvent.detail?.friendId
            if (!friendId) return
            setIsOpen(true)
            setSelectedFriendId(friendId)
            setUnreadByFriend((previous) => ({
                ...previous,
                [friendId]: 0,
            }))
        }

        window.addEventListener(DIRECT_CHAT_OPEN_EVENT, onOpenChat as EventListener)

        return () => {
            window.removeEventListener(
                DIRECT_CHAT_OPEN_EVENT,
                onOpenChat as EventListener
            )
        }
    }, [])

    const sendMutation = useMutation({
        mutationFn: () => {
            if (!selectedFriendId) {
                throw new Error('Kein Freund ausgewaehlt')
            }
            return friendsApi.sendDirectMessage(selectedFriendId, draft)
        },
        onSuccess: (message) => {
            queryClient.setQueryData(
                DIRECT_MESSAGES_QUERY_KEY(selectedFriendId || ''),
                (
                    previous:
                        | { messages: DirectMessage[]; hasMore: boolean }
                        | undefined
                ) => ({
                    messages: appendUniqueMessage(previous?.messages || [], message),
                    hasMore: previous?.hasMore || false,
                })
            )
            setDraft('')
        },
    })

    const totalUnread = useMemo(
        () => Object.values(unreadByFriend).reduce((sum, value) => sum + value, 0),
        [unreadByFriend]
    )

    const selectFriend = (friendId: string) => {
        setSelectedFriendId(friendId)
        setUnreadByFriend((previous) => ({
            ...previous,
            [friendId]: 0,
        }))
    }

    const handleSend = () => {
        if (!draft.trim() || sendMutation.isPending) {
            return
        }
        sendMutation.mutate()
    }

    const canSend = draft.trim().length > 0 && !sendMutation.isPending

    return (
        <>
            {isOpen && (
                <div className="fixed right-4 bottom-24 z-40 w-[min(96vw,420px)] rounded-2xl border border-neutral-200 bg-white/95 shadow-2xl backdrop-blur sm:right-6 sm:bottom-6 dark:border-neutral-700 dark:bg-neutral-900/95">
                    <div className="flex items-center justify-between border-b border-neutral-200 px-3 py-2 dark:border-neutral-700">
                        <div className="flex items-center gap-2">
                            <MessageCircle className="size-4 text-brand-500" />
                            <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                                Direktchat
                            </p>
                            <span
                                className={cn(
                                    'inline-flex items-center gap-1 text-xs',
                                    isConnected
                                        ? 'text-success-600 dark:text-success-400'
                                        : 'text-neutral-500 dark:text-neutral-400'
                                )}
                            >
                                {isConnected ? (
                                    <Wifi className="size-3.5" />
                                ) : (
                                    <WifiOff className="size-3.5" />
                                )}
                                {isConnected ? 'Online' : 'Offline'}
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="rounded-md p-1 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
                            aria-label="Chat schliessen"
                        >
                            <X className="size-4" />
                        </button>
                    </div>

                    <div className="border-b border-neutral-200 px-3 py-2 dark:border-neutral-700">
                        {friends.length === 0 ? (
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                Keine Freunde verfuegbar.
                            </p>
                        ) : (
                            <div className="flex gap-2 overflow-x-auto pb-1">
                                {friends.map((friend) => {
                                    const unread = unreadByFriend[friend.friendId] || 0
                                    const isActive = selectedFriendId === friend.friendId
                                    return (
                                        <FriendChip
                                            key={friend.id}
                                            friend={friend}
                                            isActive={isActive}
                                            unread={unread}
                                            onClick={() => selectFriend(friend.friendId)}
                                        />
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    <div
                        ref={messageContainerRef}
                        className="h-72 space-y-2 overflow-y-auto px-3 py-3"
                    >
                        {isLoadingMessages || isFetchingMessages ? (
                            <div className="flex h-full items-center justify-center">
                                <Loader2 className="size-5 animate-spin text-brand-500" />
                            </div>
                        ) : !selectedFriend ? (
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                Waehle einen Freund aus.
                            </p>
                        ) : messages.length === 0 ? (
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                Noch keine Nachrichten mit {selectedFriend.friendName}.
                            </p>
                        ) : (
                            messages.map((message) => {
                                const isOwn = message.senderId === user?.id
                                return (
                                    <article
                                        key={message.id}
                                        className={cn(
                                            'max-w-[84%] rounded-2xl px-3 py-2',
                                            isOwn
                                                ? 'ml-auto bg-brand-500 text-white'
                                                : 'bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-white'
                                        )}
                                    >
                                        {message.content && (
                                            <p className="break-words whitespace-pre-wrap text-sm">
                                                {message.content}
                                            </p>
                                        )}
                                        {message.attachments.length > 0 && (
                                            <div
                                                className={cn(
                                                    'grid gap-2',
                                                    message.content && 'mt-2'
                                                )}
                                            >
                                                {message.attachments.map((attachment) => (
                                                    <a
                                                        key={attachment.id}
                                                        href={getUploadUrl(attachment.url)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="block"
                                                    >
                                                        <img
                                                            src={getUploadUrl(attachment.url)}
                                                            alt={attachment.originalName}
                                                            className="max-h-40 w-full rounded-xl object-cover"
                                                        />
                                                    </a>
                                                ))}
                                            </div>
                                        )}
                                        <p
                                            className={cn(
                                                'mt-1 text-[11px]',
                                                isOwn
                                                    ? 'text-white/80'
                                                    : 'text-neutral-500 dark:text-neutral-400'
                                            )}
                                        >
                                            {formatTime(message.createdAt)}
                                        </p>
                                    </article>
                                )
                            })
                        )}
                    </div>

                    <div className="flex items-end gap-2 border-t border-neutral-200 px-3 py-2 dark:border-neutral-700">
                        <textarea
                            value={draft}
                            onChange={(event) => setDraft(event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter' && !event.shiftKey) {
                                    event.preventDefault()
                                    handleSend()
                                }
                            }}
                            placeholder={
                                selectedFriend
                                    ? `Nachricht an ${selectedFriend.friendName}...`
                                    : 'Nachricht schreiben...'
                            }
                            rows={2}
                            className={cn(
                                'min-h-[44px] flex-1 resize-none rounded-xl border px-3 py-2 text-sm',
                                'border-neutral-200 bg-white text-neutral-900',
                                'focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20',
                                'dark:border-neutral-700 dark:bg-neutral-900 dark:text-white'
                            )}
                            disabled={!selectedFriend}
                        />
                        <button
                            type="button"
                            onClick={handleSend}
                            disabled={!canSend || !selectedFriend}
                            className={cn(
                                'inline-flex h-[44px] w-[44px] items-center justify-center rounded-xl transition-colors',
                                'bg-brand-500 text-white hover:bg-brand-600',
                                'disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-500',
                                'dark:disabled:bg-neutral-700 dark:disabled:text-neutral-400'
                            )}
                            aria-label="Nachricht senden"
                        >
                            {sendMutation.isPending ? (
                                <Loader2 className="size-4 animate-spin" />
                            ) : (
                                <Send className="size-4" />
                            )}
                        </button>
                    </div>
                </div>
            )}

            <button
                type="button"
                onClick={() => setIsOpen((previous) => !previous)}
                className={cn(
                    'fixed right-4 bottom-24 z-30 inline-flex size-12 items-center justify-center rounded-full shadow-xl transition-transform',
                    'bg-brand-500 text-white hover:scale-105 hover:bg-brand-600',
                    'sm:right-6 sm:bottom-6'
                )}
                aria-label="Direktchat oeffnen"
            >
                <MessageCircle className="size-5" />
                {totalUnread > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex min-w-[20px] items-center justify-center rounded-full bg-error-500 px-1 text-[11px] font-bold text-white">
                        {totalUnread > 99 ? '99+' : totalUnread}
                    </span>
                )}
            </button>
        </>
    )
}

interface FriendChipProps {
    friend: Friend
    isActive: boolean
    unread: number
    onClick: () => void
}

const FriendChip = ({ friend, isActive, unread, onClick }: FriendChipProps) => {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                'inline-flex min-w-0 items-center gap-2 rounded-full border px-2.5 py-1.5 text-xs transition-colors',
                isActive
                    ? 'border-brand-400 bg-brand-50 text-brand-700 dark:border-brand-500 dark:bg-brand-900/40 dark:text-brand-200'
                    : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800'
            )}
        >
            {friend.friendAvatar ? (
                <img
                    src={friend.friendAvatar}
                    alt={friend.friendName}
                    className="size-5 rounded-full object-cover"
                />
            ) : (
                <span className="inline-flex size-5 items-center justify-center rounded-full bg-neutral-200 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300">
                    <User className="size-3.5" />
                </span>
            )}
            <span className="max-w-24 truncate font-medium">{friend.friendName}</span>
            {unread > 0 && (
                <span className="rounded-full bg-error-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                    {unread > 9 ? '9+' : unread}
                </span>
            )}
        </button>
    )
}
