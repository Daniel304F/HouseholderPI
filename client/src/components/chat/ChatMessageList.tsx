import type { RefObject } from 'react'
import type { Message } from '../../api/messages'
import { MessageBubble } from './MessageBubble'

interface ChatMessageListProps {
    messages: Message[]
    currentUserId?: string
    editingMessage: Message | null
    editContent: string
    onEditContentChange: (value: string) => void
    onStartEdit: (message: Message) => void
    onCancelEdit: () => void
    onSubmitEdit: () => void
    onDeleteMessage: (messageId: string) => void
    endRef: RefObject<HTMLDivElement | null>
}

export const ChatMessageList = ({
    messages,
    currentUserId,
    editingMessage,
    editContent,
    onEditContentChange,
    onStartEdit,
    onCancelEdit,
    onSubmitEdit,
    onDeleteMessage,
    endRef,
}: ChatMessageListProps) => {
    return (
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
                        isOwn={message.userId === currentUserId}
                        isEditing={editingMessage?.id === message.id}
                        editContent={editContent}
                        onEditContentChange={onEditContentChange}
                        onStartEdit={() => onStartEdit(message)}
                        onCancelEdit={onCancelEdit}
                        onSubmitEdit={onSubmitEdit}
                        onDelete={() => onDeleteMessage(message.id)}
                    />
                ))
            )}
            <div ref={endRef} />
        </div>
    )
}
