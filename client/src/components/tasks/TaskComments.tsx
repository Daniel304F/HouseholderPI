import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    MessageSquare,
    Send,
    Loader2,
    Pencil,
    Trash2,
    X,
    Check,
} from 'lucide-react'
import { cn } from '../../utils/cn'
import { Button, IconButton } from '../common'
import { commentsApi, type Comment } from '../../api/comments'
import { useToast } from '../../contexts/ToastContext'
import { useAuth } from '../../contexts/AuthContext'

interface TaskCommentsProps {
    groupId: string
    taskId: string
    readOnly?: boolean
}

export const TaskComments = ({ groupId, taskId, readOnly = false }: TaskCommentsProps) => {
    const queryClient = useQueryClient()
    const toast = useToast()
    const { user } = useAuth()
    const [newComment, setNewComment] = useState('')
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editContent, setEditContent] = useState('')

    const { data: comments = [], isLoading } = useQuery({
        queryKey: ['comments', groupId, taskId],
        queryFn: () => commentsApi.getComments(groupId, taskId),
    })

    const createMutation = useMutation({
        mutationFn: (content: string) =>
            commentsApi.createComment(groupId, taskId, { content }),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['comments', groupId, taskId],
            })
            setNewComment('')
        },
        onError: () => {
            toast.error('Kommentar konnte nicht erstellt werden')
        },
    })

    const updateMutation = useMutation({
        mutationFn: ({
            commentId,
            content,
        }: {
            commentId: string
            content: string
        }) =>
            commentsApi.updateComment(groupId, taskId, commentId, { content }),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['comments', groupId, taskId],
            })
            setEditingId(null)
            setEditContent('')
        },
        onError: () => {
            toast.error('Kommentar konnte nicht aktualisiert werden')
        },
    })

    const deleteMutation = useMutation({
        mutationFn: (commentId: string) =>
            commentsApi.deleteComment(groupId, taskId, commentId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['comments', groupId, taskId],
            })
            toast.success('Kommentar gelöscht')
        },
        onError: () => {
            toast.error('Kommentar konnte nicht gelöscht werden')
        },
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!newComment.trim()) return
        createMutation.mutate(newComment.trim())
    }

    const handleEdit = (comment: Comment) => {
        setEditingId(comment.id)
        setEditContent(comment.content)
    }

    const handleSaveEdit = () => {
        if (!editContent.trim() || !editingId) return
        updateMutation.mutate({
            commentId: editingId,
            content: editContent.trim(),
        })
    }

    const handleCancelEdit = () => {
        setEditingId(null)
        setEditContent('')
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    return (
        <div>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                <MessageSquare className="size-4" />
                Kommentare
                {comments.length > 0 && (
                    <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400">
                        {comments.length}
                    </span>
                )}
            </h3>

            {/* Comments List */}
            <div className="mb-4 space-y-3">
                {isLoading ? (
                    <div className="flex items-center justify-center py-4">
                        <Loader2 className="size-5 animate-spin text-neutral-400" />
                    </div>
                ) : comments.length === 0 ? (
                    <p className="py-4 text-center text-sm text-neutral-500 dark:text-neutral-400">
                        Noch keine Kommentare
                    </p>
                ) : (
                    comments.map((comment) => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            isEditing={editingId === comment.id}
                            editContent={editContent}
                            onEditContentChange={setEditContent}
                            onEdit={() => handleEdit(comment)}
                            onSaveEdit={handleSaveEdit}
                            onCancelEdit={handleCancelEdit}
                            onDelete={() => deleteMutation.mutate(comment.id)}
                            isOwnComment={comment.userId === user?.id}
                            isUpdating={updateMutation.isPending}
                            isDeleting={deleteMutation.isPending}
                            formatDate={formatDate}
                            readOnly={readOnly}
                        />
                    ))
                )}
            </div>

            {/* New Comment Form */}
            {!readOnly && (
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Kommentar schreiben..."
                        className={cn(
                            'flex-1 rounded-lg border px-3 py-2 text-sm',
                            'border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800',
                            'focus:border-brand-500 focus:ring-brand-500 focus:ring-1 focus:outline-none',
                            'text-neutral-900 placeholder:text-neutral-400 dark:text-white'
                        )}
                        disabled={createMutation.isPending}
                    />
                    <Button
                        type="submit"
                        size="sm"
                        disabled={!newComment.trim() || createMutation.isPending}
                        icon={
                            createMutation.isPending ? (
                                <Loader2 className="size-4 animate-spin" />
                            ) : (
                                <Send className="size-4" />
                            )
                        }
                    >
                        Senden
                    </Button>
                </form>
            )}
        </div>
    )
}

interface CommentItemProps {
    comment: Comment
    isEditing: boolean
    editContent: string
    onEditContentChange: (content: string) => void
    onEdit: () => void
    onSaveEdit: () => void
    onCancelEdit: () => void
    onDelete: () => void
    isOwnComment: boolean
    isUpdating: boolean
    isDeleting: boolean
    formatDate: (date: string) => string
    readOnly?: boolean
}

const CommentItem = ({
    comment,
    isEditing,
    editContent,
    onEditContentChange,
    onEdit,
    onSaveEdit,
    onCancelEdit,
    onDelete,
    isOwnComment,
    isUpdating,
    isDeleting,
    formatDate,
    readOnly = false,
}: CommentItemProps) => {
    return (
        <div
            className={cn(
                'rounded-lg border p-3',
                'border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800/50'
            )}
        >
            <div className="mb-2 flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                    {comment.userAvatar ? (
                        <img
                            src={comment.userAvatar}
                            alt={comment.userName}
                            className="size-6 rounded-full object-cover"
                        />
                    ) : (
                        <div className="bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300 flex size-6 items-center justify-center rounded-full text-xs font-medium">
                            {comment.userName.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <span className="text-sm font-medium text-neutral-900 dark:text-white">
                        {comment.userName}
                    </span>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                        {formatDate(comment.createdAt)}
                        {comment.editedAt && ' (bearbeitet)'}
                    </span>
                </div>
                {isOwnComment && !isEditing && !readOnly && (
                    <div className="flex gap-1">
                        <IconButton
                            icon={<Pencil className="size-3.5" />}
                            variant="ghost"
                            size="sm"
                            onClick={onEdit}
                            aria-label="Bearbeiten"
                        />
                        <IconButton
                            icon={isDeleting ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
                            variant="ghost"
                            size="sm"
                            onClick={onDelete}
                            disabled={isDeleting}
                            aria-label="Löschen"
                        />
                    </div>
                )}
            </div>

            {isEditing ? (
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={editContent}
                        onChange={(e) => onEditContentChange(e.target.value)}
                        className={cn(
                            'flex-1 rounded-lg border px-3 py-1.5 text-sm',
                            'border-neutral-200 bg-white dark:border-neutral-600 dark:bg-neutral-800',
                            'focus:border-brand-500 focus:ring-brand-500 focus:ring-1 focus:outline-none',
                            'text-neutral-900 dark:text-white'
                        )}
                        autoFocus
                    />
                    <button
                        onClick={onSaveEdit}
                        disabled={isUpdating || !editContent.trim()}
                        className={cn(
                            'rounded p-1.5 transition-colors',
                            'bg-brand-500 hover:bg-brand-600 text-white',
                            'disabled:opacity-50'
                        )}
                    >
                        {isUpdating ? (
                            <Loader2 className="size-4 animate-spin" />
                        ) : (
                            <Check className="size-4" />
                        )}
                    </button>
                    <button
                        onClick={onCancelEdit}
                        className={cn(
                            'rounded p-1.5 transition-colors',
                            'bg-neutral-200 text-neutral-600 hover:bg-neutral-300',
                            'dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600'
                        )}
                    >
                        <X className="size-4" />
                    </button>
                </div>
            ) : (
                <p className="text-sm text-neutral-700 dark:text-neutral-300">
                    {comment.content}
                </p>
            )}
        </div>
    )
}
