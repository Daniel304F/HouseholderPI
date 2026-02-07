import { useState, useEffect, useRef, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Send, Loader2, Wifi, WifiOff, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { cn } from '../../utils/cn'
import { messagesApi, type Message } from '../../api/messages'
import { useSocket } from '../../hooks/useSocket'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { Button, Input, IconButton } from '../common'
import { DropdownMenuItem } from '../ui'

interface GroupChatProps {
    groupId: string
}

interface TypingUser {
    userId: string
    isTyping: boolean
}

export const GroupChat = ({ groupId }: GroupChatProps) => {
    const queryClient = useQueryClient()
    const toast = useToast()
    const { user } = useAuth()
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const [newMessage, setNewMessage] = useState('')
    const [editingMessage, setEditingMessage] = useState<Message | null>(null)
    const [editContent, setEditContent] = useState('')
    const [typingUsers, setTypingUsers] = useState<Map<string, boolean>>(new Map())

    // Fetch messages
    const { data, isLoading } = useQuery({
        queryKey: ['messages', groupId],
        queryFn: () => messagesApi.getMessages(groupId),
    })

    const messages = data?.messages ?? []

    // Socket connection
    const handleNewMessage = useCallback(
        (message: unknown) => {
            const msg = message as Message
            // Only add if not from current user (we add optimistically)
            if (msg.userId !== user?.id) {
                queryClient.setQueryData(
                    ['messages', groupId],
                    (old: { messages: Message[]; hasMore: boolean } | undefined) => ({
                        messages: [...(old?.messages ?? []), msg],
                        hasMore: old?.hasMore ?? false,
                    })
                )
            }
        },
        [groupId, queryClient, user?.id]
    )

    const handleMessageUpdate = useCallback(
        (message: unknown) => {
            const msg = message as Message
            queryClient.setQueryData(
                ['messages', groupId],
                (old: { messages: Message[]; hasMore: boolean } | undefined) => ({
                    messages: (old?.messages ?? []).map((m) =>
                        m.id === msg.id ? msg : m
                    ),
                    hasMore: old?.hasMore ?? false,
                })
            )
        },
        [groupId, queryClient]
    )

    const handleMessageDelete = useCallback(
        (data: { messageId: string }) => {
            queryClient.setQueryData(
                ['messages', groupId],
                (old: { messages: Message[]; hasMore: boolean } | undefined) => ({
                    messages: (old?.messages ?? []).filter((m) => m.id !== data.messageId),
                    hasMore: old?.hasMore ?? false,
                })
            )
        },
        [groupId, queryClient]
    )

    const handleTypingChange = useCallback((data: TypingUser) => {
        setTypingUsers((prev) => {
            const next = new Map(prev)
            if (data.isTyping) {
                next.set(data.userId, true)
            } else {
                next.delete(data.userId)
            }
            return next
        })
    }, [])

    const { isConnected, sendTyping } = useSocket({
        groupId,
        onNewMessage: handleNewMessage,
        onMessageUpdate: handleMessageUpdate,
        onMessageDelete: handleMessageDelete,
        onTypingChange: handleTypingChange,
    })

    // Mutations
    const sendMessageMutation = useMutation({
        mutationFn: (content: string) => messagesApi.sendMessage(groupId, content),
        onMutate: async (content) => {
            // Optimistic update
            const optimisticMessage: Message = {
                id: `temp-${Date.now()}`,
                groupId,
                userId: user?.id ?? '',
                userName: user?.name ?? '',
                userAvatar: user?.avatar,
                content,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                editedAt: null,
            }
            queryClient.setQueryData(
                ['messages', groupId],
                (old: { messages: Message[]; hasMore: boolean } | undefined) => ({
                    messages: [...(old?.messages ?? []), optimisticMessage],
                    hasMore: old?.hasMore ?? false,
                })
            )
            return { optimisticMessage }
        },
        onSuccess: (newMessage, _, context) => {
            // Replace optimistic message with real one
            queryClient.setQueryData(
                ['messages', groupId],
                (old: { messages: Message[]; hasMore: boolean } | undefined) => ({
                    messages: (old?.messages ?? []).map((m) =>
                        m.id === context?.optimisticMessage.id ? newMessage : m
                    ),
                    hasMore: old?.hasMore ?? false,
                })
            )
        },
        onError: (_, __, context) => {
            // Remove optimistic message on error
            queryClient.setQueryData(
                ['messages', groupId],
                (old: { messages: Message[]; hasMore: boolean } | undefined) => ({
                    messages: (old?.messages ?? []).filter(
                        (m) => m.id !== context?.optimisticMessage.id
                    ),
                    hasMore: old?.hasMore ?? false,
                })
            )
            toast.error('Nachricht konnte nicht gesendet werden')
        },
    })

    const updateMessageMutation = useMutation({
        mutationFn: ({ messageId, content }: { messageId: string; content: string }) =>
            messagesApi.updateMessage(groupId, messageId, content),
        onSuccess: () => {
            setEditingMessage(null)
            setEditContent('')
            queryClient.invalidateQueries({ queryKey: ['messages', groupId] })
        },
        onError: () => {
            toast.error('Nachricht konnte nicht bearbeitet werden')
        },
    })

    const deleteMessageMutation = useMutation({
        mutationFn: (messageId: string) => messagesApi.deleteMessage(groupId, messageId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['messages', groupId] })
        },
        onError: () => {
            toast.error('Nachricht konnte nicht gelöscht werden')
        },
    })

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    // Handle send message
    const handleSendMessage = () => {
        if (!newMessage.trim()) return
        sendMessageMutation.mutate(newMessage.trim())
        setNewMessage('')
        sendTyping(false)
    }

    // Handle key press
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage()
        }
    }

    // Handle input change with typing indicator
    const handleInputChange = (value: string) => {
        setNewMessage(value)
        if (value.trim()) {
            sendTyping(true)
        } else {
            sendTyping(false)
        }
    }

    // Handle edit
    const startEdit = (message: Message) => {
        setEditingMessage(message)
        setEditContent(message.content)
    }

    const cancelEdit = () => {
        setEditingMessage(null)
        setEditContent('')
    }

    const submitEdit = () => {
        if (!editingMessage || !editContent.trim()) return
        updateMessageMutation.mutate({
            messageId: editingMessage.id,
            content: editContent.trim(),
        })
    }

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="size-8 animate-spin text-brand-500" />
            </div>
        )
    }

    return (
        <div className="flex h-full flex-col">
            {/* Connection Status */}
            <div
                className={cn(
                    'flex items-center gap-2 border-b px-4 py-2 text-sm',
                    isConnected
                        ? 'border-neutral-200 bg-emerald-50 text-emerald-700 dark:border-neutral-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                        : 'border-neutral-200 bg-amber-50 text-amber-700 dark:border-neutral-700 dark:bg-amber-900/20 dark:text-amber-400'
                )}
            >
                {isConnected ? (
                    <>
                        <Wifi className="size-4" />
                        <span>Verbunden</span>
                    </>
                ) : (
                    <>
                        <WifiOff className="size-4" />
                        <span>Verbindung wird hergestellt...</span>
                    </>
                )}
            </div>

            {/* Messages */}
            <div className="flex-1 space-y-4 overflow-y-auto p-4">
                {messages.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-neutral-500 dark:text-neutral-400">
                        <p>Noch keine Nachrichten. Starte die Konversation!</p>
                    </div>
                ) : (
                    messages.map((message) => (
                        <MessageBubble
                            key={message.id}
                            message={message}
                            isOwn={message.userId === user?.id}
                            isEditing={editingMessage?.id === message.id}
                            editContent={editContent}
                            onEditContentChange={setEditContent}
                            onStartEdit={() => startEdit(message)}
                            onCancelEdit={cancelEdit}
                            onSubmitEdit={submitEdit}
                            onDelete={() => deleteMessageMutation.mutate(message.id)}
                        />
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Typing Indicator */}
            {typingUsers.size > 0 && (
                <div className="px-4 py-2 text-sm text-neutral-500 dark:text-neutral-400">
                    <span className="italic">Jemand schreibt...</span>
                </div>
            )}

            {/* Input */}
            <div className="border-t border-neutral-200 p-4 dark:border-neutral-700">
                <div className="flex gap-2">
                    <Input
                        value={newMessage}
                        onChange={(e) => handleInputChange(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Nachricht schreiben..."
                        className="flex-1"
                        disabled={!isConnected}
                    />
                    <Button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || sendMessageMutation.isPending}
                    >
                        {sendMessageMutation.isPending ? (
                            <Loader2 className="size-4 animate-spin" />
                        ) : (
                            <Send className="size-4" />
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
}

interface MessageBubbleProps {
    message: Message
    isOwn: boolean
    isEditing: boolean
    editContent: string
    onEditContentChange: (value: string) => void
    onStartEdit: () => void
    onCancelEdit: () => void
    onSubmitEdit: () => void
    onDelete: () => void
}

const MessageBubble = ({
    message,
    isOwn,
    isEditing,
    editContent,
    onEditContentChange,
    onStartEdit,
    onCancelEdit,
    onSubmitEdit,
    onDelete,
}: MessageBubbleProps) => {
    const [showMenu, setShowMenu] = useState(false)

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr)
        return date.toLocaleTimeString('de-DE', {
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        const today = new Date()
        const isToday = date.toDateString() === today.toDateString()

        if (isToday) {
            return 'Heute'
        }

        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)
        if (date.toDateString() === yesterday.toDateString()) {
            return 'Gestern'
        }

        return date.toLocaleDateString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        })
    }

    return (
        <div
            className={cn(
                'group flex gap-3',
                isOwn ? 'flex-row-reverse' : 'flex-row'
            )}
        >
            {/* Avatar */}
            <div
                className={cn(
                    'flex size-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-medium',
                    isOwn
                        ? 'bg-brand-500 text-white'
                        : 'bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300'
                )}
            >
                {message.userAvatar ? (
                    <img
                        src={message.userAvatar}
                        alt={message.userName}
                        className="size-full rounded-full object-cover"
                    />
                ) : (
                    message.userName.charAt(0).toUpperCase()
                )}
            </div>

            {/* Content */}
            <div
                className={cn(
                    'max-w-[70%] flex-1',
                    isOwn ? 'text-right' : 'text-left'
                )}
            >
                {/* Header */}
                <div
                    className={cn(
                        'mb-1 flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400',
                        isOwn ? 'flex-row-reverse' : 'flex-row'
                    )}
                >
                    <span className="font-medium">{message.userName}</span>
                    <span>{formatDate(message.createdAt)}, {formatTime(message.createdAt)}</span>
                    {message.editedAt && (
                        <span className="italic">(bearbeitet)</span>
                    )}
                </div>

                {/* Message Bubble */}
                <div className="relative inline-block">
                    {isEditing ? (
                        <div className="flex flex-col gap-2">
                            <Input
                                value={editContent}
                                onChange={(e) => onEditContentChange(e.target.value)}
                                className="min-w-[200px]"
                                autoFocus
                            />
                            <div className="flex justify-end gap-2">
                                <Button variant="secondary" size="sm" onClick={onCancelEdit}>
                                    Abbrechen
                                </Button>
                                <Button size="sm" onClick={onSubmitEdit}>
                                    Speichern
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div
                            className={cn(
                                'rounded-2xl px-4 py-2',
                                isOwn
                                    ? 'bg-brand-500 text-white'
                                    : 'bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-white'
                            )}
                        >
                            <p className="whitespace-pre-wrap break-words">{message.content}</p>
                        </div>
                    )}

                    {/* Menu */}
                    {isOwn && !isEditing && (
                        <div className="absolute top-0 -right-8 opacity-0 transition-opacity group-hover:opacity-100">
                            <IconButton
                                icon={<MoreVertical className="size-4" />}
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowMenu(!showMenu)}
                                aria-label="Nachricht-Optionen"
                            />

                            {showMenu && (
                                <div className="absolute right-0 z-10 mt-1 w-32 rounded-lg border border-neutral-200 bg-white py-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-800">
                                    <DropdownMenuItem
                                        icon={<Pencil className="size-4" />}
                                        onClick={() => {
                                            setShowMenu(false)
                                            onStartEdit()
                                        }}
                                    >
                                        Bearbeiten
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        icon={<Trash2 className="size-4" />}
                                        variant="danger"
                                        onClick={() => {
                                            setShowMenu(false)
                                            onDelete()
                                        }}
                                    >
                                        Löschen
                                    </DropdownMenuItem>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
