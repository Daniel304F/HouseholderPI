import { useMemo, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, ImagePlus, Loader2, Mail, Send, User } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { friendsApi, type DirectMessage } from '../../api/friends'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { Button, Textarea } from '../../components/common'
import { getUploadUrl } from '../../lib/axios'
import { cn } from '../../utils/cn'

const FRIEND_PROFILE_QUERY_KEY = (friendId: string) => ['friendProfile', friendId]
const DIRECT_MESSAGES_QUERY_KEY = (friendId: string) => ['directMessages', friendId]

const formatDateTime = (dateStr: string) =>
    new Date(dateStr).toLocaleString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })

export const FriendProfile = () => {
    const { friendId } = useParams<{ friendId: string }>()
    const navigate = useNavigate()
    const toast = useToast()
    const queryClient = useQueryClient()
    const { user } = useAuth()

    const [newMessage, setNewMessage] = useState('')
    const [selectedImage, setSelectedImage] = useState<File | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const {
        data: profile,
        isLoading: profileLoading,
        isError: profileError,
        refetch: refetchProfile,
    } = useQuery({
        queryKey: FRIEND_PROFILE_QUERY_KEY(friendId || ''),
        queryFn: () => friendsApi.getFriendProfile(friendId!),
        enabled: Boolean(friendId),
    })

    const {
        data: directMessagesData,
        isLoading: messagesLoading,
        isError: messagesError,
        refetch: refetchMessages,
    } = useQuery({
        queryKey: DIRECT_MESSAGES_QUERY_KEY(friendId || ''),
        queryFn: () => friendsApi.getDirectMessages(friendId!),
        enabled: Boolean(friendId),
    })

    const messages = useMemo(
        () => directMessagesData?.messages || [],
        [directMessagesData?.messages]
    )
    const hasMore = Boolean(directMessagesData?.hasMore)

    const sendMessageMutation = useMutation({
        mutationFn: () => {
            if (!friendId) throw new Error('friendId fehlt')
            return friendsApi.sendDirectMessage(friendId, newMessage, selectedImage || undefined)
        },
        onSuccess: (message) => {
            queryClient.setQueryData(
                DIRECT_MESSAGES_QUERY_KEY(friendId!),
                (previous:
                    | { messages: DirectMessage[]; hasMore: boolean }
                    | undefined) => ({
                    messages: [...(previous?.messages || []), message],
                    hasMore: previous?.hasMore || false,
                })
            )
            setNewMessage('')
            setSelectedImage(null)
        },
        onError: () => {
            toast.error('Nachricht konnte nicht gesendet werden')
        },
    })

    const loadOlderMutation = useMutation({
        mutationFn: () => {
            if (!friendId) throw new Error('friendId fehlt')
            const oldestMessage = messages[0]
            if (!oldestMessage) {
                return Promise.resolve({ messages: [], hasMore: false })
            }
            return friendsApi.getDirectMessages(friendId, 50, oldestMessage.id)
        },
        onSuccess: (result) => {
            queryClient.setQueryData(
                DIRECT_MESSAGES_QUERY_KEY(friendId!),
                (previous:
                    | { messages: DirectMessage[]; hasMore: boolean }
                    | undefined) => {
                    const existingIds = new Set((previous?.messages || []).map((m) => m.id))
                    const uniqueOlder = result.messages.filter((m) => !existingIds.has(m.id))
                    return {
                        messages: [...uniqueOlder, ...(previous?.messages || [])],
                        hasMore: result.hasMore,
                    }
                }
            )
        },
        onError: () => {
            toast.error('Aeltere Nachrichten konnten nicht geladen werden')
        },
    })

    if (!friendId) {
        navigate('/dashboard/friends')
        return null
    }

    if (profileLoading || messagesLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="size-8 animate-spin text-brand-500" />
            </div>
        )
    }

    if (profileError || messagesError || !profile) {
        return (
            <div className="space-y-4">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Freundesprofil konnte nicht geladen werden.
                </p>
                <Button
                    variant="secondary"
                    onClick={() => {
                        refetchProfile()
                        refetchMessages()
                    }}
                >
                    Erneut versuchen
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Link
                    to="/dashboard/friends"
                    className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200"
                >
                    <ArrowLeft className="size-4" />
                    Zurueck zu Freunden
                </Link>
            </div>

            <section className="ui-panel ui-panel-hover rounded-xl p-5">
                <div className="flex items-start gap-4">
                    {profile.avatar ? (
                        <img
                            src={profile.avatar}
                            alt={profile.name}
                            className="size-16 rounded-full object-cover"
                        />
                    ) : (
                        <div className="flex size-16 items-center justify-center rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
                            <User className="size-8" />
                        </div>
                    )}

                    <div className="min-w-0 flex-1">
                        <h1 className="text-xl font-semibold text-neutral-900 dark:text-white">
                            {profile.name}
                        </h1>
                        <p className="mt-1 flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                            <Mail className="size-4" />
                            {profile.email}
                        </p>
                        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                            Freunde seit {formatDateTime(profile.friendSince)}
                        </p>
                        {profile.bio && (
                            <p className="mt-3 whitespace-pre-wrap text-sm text-neutral-700 dark:text-neutral-300">
                                {profile.bio}
                            </p>
                        )}
                        {profile.achievements.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                                {profile.achievements.map((achievement) => (
                                    <span
                                        key={achievement}
                                        className="rounded-full bg-brand-100 px-2 py-1 text-xs font-medium text-brand-700 dark:bg-brand-900/40 dark:text-brand-300"
                                    >
                                        {achievement}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <section className="ui-panel ui-panel-hover rounded-xl p-4">
                <h2 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">
                    Direktnachrichten
                </h2>

                {hasMore && (
                    <div className="mb-3 flex justify-center">
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => loadOlderMutation.mutate()}
                            disabled={loadOlderMutation.isPending}
                            icon={
                                loadOlderMutation.isPending ? (
                                    <Loader2 className="size-4 animate-spin" />
                                ) : undefined
                            }
                        >
                            Aeltere laden
                        </Button>
                    </div>
                )}

                <div className="mb-4 max-h-[420px] space-y-3 overflow-y-auto rounded-lg border border-neutral-200 p-3 dark:border-neutral-700">
                    {messages.length === 0 ? (
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Noch keine Direktnachrichten.
                        </p>
                    ) : (
                        messages.map((message) => {
                            const isOwn = message.senderId === user?.id
                            return (
                                <article
                                    key={message.id}
                                    className={cn(
                                        'max-w-[85%] rounded-2xl px-3 py-2',
                                        isOwn
                                            ? 'ml-auto bg-brand-500 text-white'
                                            : 'bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-white'
                                    )}
                                >
                                    {message.content && (
                                        <p className="whitespace-pre-wrap break-words text-sm">
                                            {message.content}
                                        </p>
                                    )}

                                    {message.attachments.length > 0 && (
                                        <div className={cn('grid gap-2', message.content && 'mt-2')}>
                                            {message.attachments.map((attachment) => (
                                                <a
                                                    key={attachment.id}
                                                    href={getUploadUrl(attachment.url)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <img
                                                        src={getUploadUrl(attachment.url)}
                                                        alt={attachment.originalName}
                                                        className="max-h-56 w-full rounded-xl object-cover"
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
                                        {formatDateTime(message.createdAt)}
                                    </p>
                                </article>
                            )
                        })
                    )}
                </div>

                {selectedImage && (
                    <div className="mb-2 flex items-center justify-between rounded-lg bg-neutral-100 px-3 py-2 text-sm text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                        <span className="truncate">Bild: {selectedImage.name}</span>
                        <button
                            type="button"
                            onClick={() => setSelectedImage(null)}
                            className="rounded px-2 py-1 text-xs hover:bg-neutral-200 dark:hover:bg-neutral-700"
                        >
                            Entfernen
                        </button>
                    </div>
                )}

                <div className="flex items-end gap-2">
                    <Textarea
                        value={newMessage}
                        onChange={(event) => setNewMessage(event.target.value)}
                        placeholder="Nachricht schreiben..."
                        rows={2}
                        className="min-h-[52px] flex-1 resize-none"
                    />
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(event) => {
                            const file = event.target.files?.[0]
                            if (!file) return
                            setSelectedImage(file)
                            event.currentTarget.value = ''
                        }}
                    />
                    <Button
                        variant="secondary"
                        onClick={() => fileInputRef.current?.click()}
                        className="h-[52px] shrink-0"
                    >
                        <ImagePlus className="size-4" />
                    </Button>
                    <Button
                        onClick={() => sendMessageMutation.mutate()}
                        disabled={
                            sendMessageMutation.isPending ||
                            !newMessage.trim() &&
                            !selectedImage
                        }
                        className="h-[52px] shrink-0"
                    >
                        {sendMessageMutation.isPending ? (
                            <Loader2 className="size-4 animate-spin" />
                        ) : (
                            <Send className="size-4" />
                        )}
                    </Button>
                </div>
            </section>
        </div>
    )
}
