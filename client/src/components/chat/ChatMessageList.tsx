import type { RefObject } from 'react'
import type { Message } from '../../api/messages'
import { MessageBubble } from './MessageBubble'
import { Button } from '../common'
import { Loader2 } from 'lucide-react'

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
    onReactToMessage: (messageId: string, emoji: string) => void
    hasMore: boolean
    isLoadingOlder: boolean
    onLoadOlder: () => void
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
    onReactToMessage,
    hasMore,
    isLoadingOlder,
    onLoadOlder,
    endRef,
}: ChatMessageListProps) => {
    return (
        <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {hasMore && (
                <div className="flex justify-center">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={onLoadOlder}
                        disabled={isLoadingOlder}
                        icon={
                            isLoadingOlder ? (
                                <Loader2 className="size-4 animate-spin" />
                            ) : undefined
                        }
                    >
                        Aeltere Nachrichten laden
                    </Button>
                </div>
            )}

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
                        onReact={(emoji) => onReactToMessage(message.id, emoji)}
                        currentUserId={currentUserId}
                    />
                ))
            )}
            <div ref={endRef} />
        </div>
    )
}
