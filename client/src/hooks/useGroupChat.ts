import { useCallback, useMemo, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { messagesApi, type Message } from '../api/messages'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { queryKeys } from '../lib/queryKeys'
import { useSocket } from './useSocket'
import type { MessageQueryData, TypingUser } from '../components/chat/chat.types'

const getMessagesQueryKey = (groupId: string) => queryKeys.messages.byGroup(groupId)

const withDefaultMessages = (data?: MessageQueryData): MessageQueryData => ({
    messages: data?.messages ?? [],
    hasMore: data?.hasMore ?? false,
})

interface UseGroupChatOptions {
    groupId: string
}

interface ToggleReactionPayload {
    messageId: string
    emoji: string
    remove: boolean
}

export const useGroupChat = ({ groupId }: UseGroupChatOptions) => {
    const queryClient = useQueryClient()
    const toast = useToast()
    const { user } = useAuth()

    const [newMessage, setNewMessage] = useState('')
    const [editingMessage, setEditingMessage] = useState<Message | null>(null)
    const [editContent, setEditContent] = useState('')
    const [typingUsers, setTypingUsers] = useState<Map<string, boolean>>(new Map())
    const [selectedImage, setSelectedImage] = useState<File | null>(null)

    const { data, isLoading } = useQuery({
        queryKey: getMessagesQueryKey(groupId),
        queryFn: () => messagesApi.getMessages(groupId),
    })

    const messages = useMemo(() => data?.messages ?? [], [data?.messages])
    const hasMoreMessages = data?.hasMore ?? false

    const setMessagesCache = useCallback(
        (updater: (current: MessageQueryData) => MessageQueryData) => {
            queryClient.setQueryData(
                getMessagesQueryKey(groupId),
                (oldData: MessageQueryData | undefined) =>
                    updater(withDefaultMessages(oldData))
            )
        },
        [groupId, queryClient]
    )

    const updateMessagesCache = useCallback(
        (updater: (current: Message[]) => Message[]) => {
            setMessagesCache((current) => ({
                ...current,
                messages: updater(current.messages),
            }))
        },
        [setMessagesCache]
    )

    const handleNewMessage = useCallback(
        (message: unknown) => {
            const incomingMessage = message as Message
            if (incomingMessage.userId === user?.id) return

            updateMessagesCache((currentMessages) => [
                ...currentMessages,
                incomingMessage,
            ])
        },
        [updateMessagesCache, user?.id]
    )

    const handleMessageUpdate = useCallback(
        (message: unknown) => {
            const updatedMessage = message as Message
            updateMessagesCache((currentMessages) =>
                currentMessages.map((item) =>
                    item.id === updatedMessage.id ? updatedMessage : item
                )
            )
        },
        [updateMessagesCache]
    )

    const handleMessageDelete = useCallback(
        (payload: { messageId: string }) => {
            updateMessagesCache((currentMessages) =>
                currentMessages.filter((item) => item.id !== payload.messageId)
            )
        },
        [updateMessagesCache]
    )

    const handleTypingChange = useCallback((payload: TypingUser) => {
        setTypingUsers((prev) => {
            const next = new Map(prev)
            if (payload.isTyping) next.set(payload.userId, true)
            else next.delete(payload.userId)
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

    const sendMessageMutation = useMutation({
        mutationFn: (content: string) => messagesApi.sendMessage(groupId, content),
        onMutate: async (content) => {
            const optimisticMessage: Message = {
                id: `temp-${Date.now()}`,
                groupId,
                userId: user?.id ?? '',
                userName: user?.name ?? '',
                userAvatar: user?.avatar,
                content,
                attachments: [],
                reactions: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                editedAt: null,
            }

            updateMessagesCache((currentMessages) => [
                ...currentMessages,
                optimisticMessage,
            ])

            return { optimisticMessage }
        },
        onSuccess: (createdMessage, _, context) => {
            updateMessagesCache((currentMessages) =>
                currentMessages.map((item) =>
                    item.id === context?.optimisticMessage.id ? createdMessage : item
                )
            )
        },
        onError: (_, __, context) => {
            updateMessagesCache((currentMessages) =>
                currentMessages.filter(
                    (item) => item.id !== context?.optimisticMessage.id
                )
            )
            toast.error('Nachricht konnte nicht gesendet werden')
        },
    })

    const sendImageMessageMutation = useMutation({
        mutationFn: ({
            image,
            content,
        }: {
            image: File
            content?: string
        }) => messagesApi.sendImageMessage(groupId, image, content),
        onSuccess: (createdMessage) => {
            updateMessagesCache((currentMessages) => [
                ...currentMessages,
                createdMessage,
            ])
        },
        onError: () => {
            toast.error('Bildnachricht konnte nicht gesendet werden')
        },
    })

    const toggleReactionMutation = useMutation({
        mutationFn: ({ messageId, emoji, remove }: ToggleReactionPayload) => {
            if (remove) {
                return messagesApi.removeReaction(groupId, messageId, emoji)
            }
            return messagesApi.addReaction(groupId, messageId, emoji)
        },
        onSuccess: (updatedMessage) => {
            updateMessagesCache((currentMessages) =>
                currentMessages.map((item) =>
                    item.id === updatedMessage.id ? updatedMessage : item
                )
            )
        },
        onError: () => {
            toast.error('Reaktion konnte nicht aktualisiert werden')
        },
    })

    const updateMessageMutation = useMutation({
        mutationFn: ({
            messageId,
            content,
        }: {
            messageId: string
            content: string
        }) => messagesApi.updateMessage(groupId, messageId, content),
        onSuccess: () => {
            setEditingMessage(null)
            setEditContent('')
            queryClient.invalidateQueries({ queryKey: getMessagesQueryKey(groupId) })
        },
        onError: () => {
            toast.error('Nachricht konnte nicht bearbeitet werden')
        },
    })

    const deleteMessageMutation = useMutation({
        mutationFn: (messageId: string) => messagesApi.deleteMessage(groupId, messageId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getMessagesQueryKey(groupId) })
        },
        onError: () => {
            toast.error('Nachricht konnte nicht geloescht werden')
        },
    })

    const loadOlderMessagesMutation = useMutation({
        mutationFn: async () => {
            const oldestMessage = messages[0]
            if (!oldestMessage) {
                return { messages: [], hasMore: false }
            }
            return messagesApi.getMessages(groupId, 50, oldestMessage.id)
        },
        onSuccess: ({ messages: olderMessages, hasMore }) => {
            setMessagesCache((current) => {
                const existingMessageIds = new Set(current.messages.map((m) => m.id))
                const uniqueOlderMessages = olderMessages.filter(
                    (message) => !existingMessageIds.has(message.id)
                )

                return {
                    messages: [...uniqueOlderMessages, ...current.messages],
                    hasMore,
                }
            })
        },
        onError: () => {
            toast.error('Aeltere Nachrichten konnten nicht geladen werden')
        },
    })

    const handleSendMessage = useCallback(() => {
        const content = newMessage.trim()

        if (selectedImage) {
            sendImageMessageMutation.mutate({
                image: selectedImage,
                content: content || undefined,
            })
            setSelectedImage(null)
            setNewMessage('')
            sendTyping(false)
            return
        }

        if (!content) return

        sendMessageMutation.mutate(content)
        setNewMessage('')
        sendTyping(false)
    }, [newMessage, selectedImage, sendImageMessageMutation, sendMessageMutation, sendTyping])

    const handleInputKeyDown = useCallback(
        (event: KeyboardEvent<HTMLTextAreaElement>) => {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                handleSendMessage()
            }
        },
        [handleSendMessage]
    )

    const handleInputChange = useCallback(
        (value: string) => {
            setNewMessage(value)
            sendTyping(value.trim().length > 0)
        },
        [sendTyping]
    )

    const startEdit = useCallback((message: Message) => {
        setEditingMessage(message)
        setEditContent(message.content)
    }, [])

    const cancelEdit = useCallback(() => {
        setEditingMessage(null)
        setEditContent('')
    }, [])

    const submitEdit = useCallback(() => {
        if (!editingMessage || !editContent.trim()) return

        updateMessageMutation.mutate({
            messageId: editingMessage.id,
            content: editContent.trim(),
        })
    }, [editContent, editingMessage, updateMessageMutation])

    const deleteMessage = useCallback(
        (messageId: string) => {
            deleteMessageMutation.mutate(messageId)
        },
        [deleteMessageMutation]
    )

    const setSelectedImageFile = useCallback((file: File | null) => {
        setSelectedImage(file)
    }, [])

    const reactToMessage = useCallback(
        (messageId: string, emoji: string) => {
            if (!user?.id) return

            const targetMessage = messages.find((message) => message.id === messageId)
            if (!targetMessage) return

            const userAlreadyReacted = (targetMessage.reactions || []).some(
                (reaction) =>
                    reaction.emoji === emoji && reaction.userIds.includes(user.id)
            )

            toggleReactionMutation.mutate({
                messageId,
                emoji,
                remove: userAlreadyReacted,
            })
        },
        [messages, toggleReactionMutation, user?.id]
    )

    return {
        messages,
        isLoading,
        isConnected,
        newMessage,
        editingMessage,
        editContent,
        typingUsers,
        selectedImage,
        isSending:
            sendMessageMutation.isPending || sendImageMessageMutation.isPending,
        handleInputChange,
        handleInputKeyDown,
        handleSendMessage,
        setEditContent,
        startEdit,
        cancelEdit,
        submitEdit,
        deleteMessage,
        setSelectedImage: setSelectedImageFile,
        reactToMessage,
        hasMoreMessages,
        loadOlderMessages: loadOlderMessagesMutation.mutate,
        isLoadingOlder: loadOlderMessagesMutation.isPending,
    }
}
