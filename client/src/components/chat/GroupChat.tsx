import { useEffect, useRef } from 'react'
import { Loader2 } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useGroupChat } from '../../hooks/useGroupChat'
import { ChatConnectionStatus } from './ChatConnectionStatus'
import { ChatInputBar } from './ChatInputBar'
import { ChatMessageList } from './ChatMessageList'
import { ChatTypingIndicator } from './ChatTypingIndicator'

interface GroupChatProps {
    groupId: string
}

export const GroupChat = ({ groupId }: GroupChatProps) => {
    const { user } = useAuth()
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const {
        messages,
        isLoading,
        isConnected,
        newMessage,
        editingMessage,
        editContent,
        typingUsers,
        isSending,
        handleInputChange,
        handleInputKeyDown,
        handleSendMessage,
        setEditContent,
        startEdit,
        cancelEdit,
        submitEdit,
        deleteMessage,
    } = useGroupChat({ groupId })

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="size-8 animate-spin text-brand-500" />
            </div>
        )
    }

    return (
        <div className="flex h-full flex-col">
            <ChatConnectionStatus isConnected={isConnected} />

            <ChatMessageList
                messages={messages}
                currentUserId={user?.id}
                editingMessage={editingMessage}
                editContent={editContent}
                onEditContentChange={setEditContent}
                onStartEdit={startEdit}
                onCancelEdit={cancelEdit}
                onSubmitEdit={submitEdit}
                onDeleteMessage={deleteMessage}
                endRef={messagesEndRef}
            />

            <ChatTypingIndicator isVisible={typingUsers.size > 0} />

            <ChatInputBar
                value={newMessage}
                isConnected={isConnected}
                isSending={isSending}
                onChange={handleInputChange}
                onKeyDown={handleInputKeyDown}
                onSend={handleSendMessage}
            />
        </div>
    )
}
