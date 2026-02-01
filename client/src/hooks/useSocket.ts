import { useEffect, useRef, useCallback, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from '../contexts/AuthContext'

interface TypingUser {
    userId: string
    isTyping: boolean
}

interface UseSocketOptions {
    groupId?: string
    onNewMessage?: (message: unknown) => void
    onMessageUpdate?: (message: unknown) => void
    onMessageDelete?: (data: { messageId: string }) => void
    onTypingChange?: (data: TypingUser) => void
}

export const useSocket = ({
    groupId,
    onNewMessage,
    onMessageUpdate,
    onMessageDelete,
    onTypingChange,
}: UseSocketOptions = {}) => {
    const { isAuthenticated } = useAuth()
    const socketRef = useRef<Socket | null>(null)
    const [isConnected, setIsConnected] = useState(false)
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    // Initialize socket connection
    useEffect(() => {
        const accessToken = localStorage.getItem('accessToken')
        if (!isAuthenticated || !accessToken) {
            return
        }

        const socket = io('http://localhost:3000', {
            auth: {
                token: accessToken,
            },
            transports: ['websocket', 'polling'],
        })

        socketRef.current = socket

        socket.on('connect', () => {
            setIsConnected(true)
        })

        socket.on('disconnect', () => {
            setIsConnected(false)
        })

        socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error.message)
            setIsConnected(false)
        })

        return () => {
            socket.disconnect()
            socketRef.current = null
        }
    }, [isAuthenticated])

    // Join/leave group room
    useEffect(() => {
        const socket = socketRef.current
        if (!socket || !isConnected || !groupId) {
            return
        }

        socket.emit('group:join', groupId)

        return () => {
            socket.emit('group:leave', groupId)
        }
    }, [groupId, isConnected])

    // Set up event listeners
    useEffect(() => {
        const socket = socketRef.current
        if (!socket || !isConnected) {
            return
        }

        if (onNewMessage) {
            socket.on('message:new', onNewMessage)
        }
        if (onMessageUpdate) {
            socket.on('message:update', onMessageUpdate)
        }
        if (onMessageDelete) {
            socket.on('message:delete', onMessageDelete)
        }
        if (onTypingChange) {
            socket.on('message:typing', onTypingChange)
        }

        return () => {
            socket.off('message:new')
            socket.off('message:update')
            socket.off('message:delete')
            socket.off('message:typing')
        }
    }, [isConnected, onNewMessage, onMessageUpdate, onMessageDelete, onTypingChange])

    // Send typing indicator
    const sendTyping = useCallback(
        (isTyping: boolean) => {
            const socket = socketRef.current
            if (!socket || !isConnected || !groupId) {
                return
            }

            // Clear existing timeout
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current)
            }

            socket.emit('message:typing', { groupId, isTyping })

            // Auto-stop typing after 3 seconds
            if (isTyping) {
                typingTimeoutRef.current = setTimeout(() => {
                    socket.emit('message:typing', { groupId, isTyping: false })
                }, 3000)
            }
        },
        [groupId, isConnected]
    )

    return {
        isConnected,
        sendTyping,
        socket: socketRef.current,
    }
}
