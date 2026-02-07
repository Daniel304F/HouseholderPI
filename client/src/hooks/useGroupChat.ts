import { useCallback, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { messagesApi, type Message } from '../api/messages'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { useSocket } from './useSocket'
import type { MessageQueryData, TypingUser } from '../components/chat/chat.types'

const getMessagesQueryKey = (groupId: string) => ['messages', groupId] as const

const withDefaultMessages = (data?: MessageQueryData): MessageQueryData => ({
    messages: data?.messages ?? [],
    hasMore: data?.hasMore ?? false,
})

interface UseGroupChatOptions {
    groupId: string
}

export const useGroupChat = ({ groupId }: UseGroupChatOptions) => {
    const queryClient = useQueryClient()
    const toast = useToast()
    const { user } = useAuth()

    const [newMessage, setNewMessage] = useState('')
    const [editingMessage, setEditingMessage] = useState<Message | null>(null)
    const [editContent, setEditContent] = useState('')
    const [typingUsers, setTypingUsers] = useState<Map<string, boolean>>(new Map())

    const { data, isLoading } = useQuery({
        queryKey: getMessagesQueryKey(groupId),
        queryFn: () => messagesApi.getMessages(groupId),
    })

    const messages = data?.messages ?? []

    const updateMessagesCache = useCallback(
        (updater: (current: Message[]) => Message[]) => {
            queryClient.setQueryData(
                getMessagesQueryKey(groupId),
                (oldData: MessageQueryData | undefined) => {
                    const normalized = withDefaultMessages(oldData)
                    return {
                        ...normalized,
                        messages: updater(normalized.messages),
                    }
                }
            )
        },
        [groupId, queryClient]
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

    const handleSendMessage = useCallback(() => {
        const content = newMessage.trim()
        if (!content) return

        sendMessageMutation.mutate(content)
        setNewMessage('')
        sendTyping(false)
    }, [newMessage, sendMessageMutation, sendTyping])

    const handleInputKeyDown = useCallback(
        (event: KeyboardEvent<HTMLInputElement>) => {
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

    return {
        messages,
        isLoading,
        isConnected,
        newMessage,
        editingMessage,
        editContent,
        typingUsers,
        isSending: sendMessageMutation.isPending,
        handleInputChange,
        handleInputKeyDown,
        handleSendMessage,
        setEditContent,
        startEdit,
        cancelEdit,
        submitEdit,
        deleteMessage,
    }
}
