import type { Message } from '../../api/messages'

export interface TypingUser {
    userId: string
    isTyping: boolean
}

export interface MessageQueryData {
    messages: Message[]
    hasMore: boolean
}
