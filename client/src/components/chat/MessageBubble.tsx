import { useMemo, useState } from 'react'
import { MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { cn } from '../../utils/cn'
import type { Message } from '../../api/messages'
import { formatChatDate, formatChatTime } from './chat.utils'
import { Button, IconButton, Input } from '../common'
import { DropdownMenuItem } from '../ui'
import { getUploadUrl } from '../../lib/axios'

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
    onReact: (emoji: string) => void
    currentUserId?: string
}

const QUICK_REACTIONS = ['👍', '🎉', '🔥', '❤️']

export const MessageBubble = ({
    message,
    isOwn,
    isEditing,
    editContent,
    onEditContentChange,
    onStartEdit,
    onCancelEdit,
    onSubmitEdit,
    onDelete,
    onReact,
    currentUserId,
}: MessageBubbleProps) => {
    const [showMenu, setShowMenu] = useState(false)

    const hasImageAttachments = message.attachments.length > 0
    const hasText = message.content.trim().length > 0

    const reactionLookup = useMemo(() => {
        const map = new Set<string>()
        for (const reaction of message.reactions) {
            if (currentUserId && reaction.userIds.includes(currentUserId)) {
                map.add(reaction.emoji)
            }
        }
        return map
    }, [currentUserId, message.reactions])

    return (
        <article className={cn('group flex gap-3', isOwn ? 'flex-row-reverse' : 'flex-row')}>
            <div
                className={cn(
                    'flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-medium',
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

            <div className={cn('max-w-[75%] flex-1', isOwn ? 'text-right' : 'text-left')}>
                <div
                    className={cn(
                        'mb-1 flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400',
                        isOwn ? 'flex-row-reverse' : 'flex-row'
                    )}
                >
                    <span className="font-medium">{message.userName}</span>
                    <span>
                        {formatChatDate(message.createdAt)}, {formatChatTime(message.createdAt)}
                    </span>
                    {message.editedAt && <span className="italic">(bearbeitet)</span>}
                </div>

                <div className={cn('relative inline-block max-w-full', isOwn && 'text-left')}>
                    {isEditing ? (
                        <div className="flex flex-col gap-2">
                            <Input
                                value={editContent}
                                onChange={(event) => onEditContentChange(event.target.value)}
                                className="min-w-[220px]"
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
                            {hasText && (
                                <p className="whitespace-pre-wrap break-words">{message.content}</p>
                            )}

                            {hasImageAttachments && (
                                <div className={cn('grid gap-2', hasText && 'mt-2')}>
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
                        </div>
                    )}

                    {!isEditing && (
                        <div className="mt-2 flex flex-wrap items-center gap-1">
                            {message.reactions.map((reaction) => {
                                const isActive = reactionLookup.has(reaction.emoji)
                                return (
                                    <button
                                        key={reaction.emoji}
                                        type="button"
                                        onClick={() => onReact(reaction.emoji)}
                                        className={cn(
                                            'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-colors',
                                            isActive
                                                ? 'border-brand-400 bg-brand-100 text-brand-700 dark:border-brand-500 dark:bg-brand-900/40 dark:text-brand-300'
                                                : 'border-neutral-300 bg-white text-neutral-600 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800'
                                        )}
                                    >
                                        <span>{reaction.emoji}</span>
                                        <span>{reaction.userIds.length}</span>
                                    </button>
                                )
                            })}

                            <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                {QUICK_REACTIONS.map((emoji) => (
                                    <button
                                        key={emoji}
                                        type="button"
                                        onClick={() => onReact(emoji)}
                                        className="rounded-full border border-neutral-300 bg-white px-2 py-0.5 text-xs hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800"
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {isOwn && !isEditing && (
                        <div className="absolute top-0 -right-8 opacity-0 transition-opacity group-hover:opacity-100">
                            <IconButton
                                icon={<MoreVertical className="size-4" />}
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowMenu((prev) => !prev)}
                                aria-label="Nachricht Optionen"
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
                                        Loeschen
                                    </DropdownMenuItem>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </article>
    )
}
