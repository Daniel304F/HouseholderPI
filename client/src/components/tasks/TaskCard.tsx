import { useMemo } from 'react'
import { Pencil, Trash2, ImageIcon, AlertTriangle } from 'lucide-react'
import { cn } from '../../utils/cn'
import { STATUS_ICONS, STATUS_STYLES } from '../../constants/task.constants'
import { PriorityBadge } from './PriorityBadge'
import { TaskMetadata } from './TaskMetadata'
import type { TaskLink } from '../../api/tasks'

// Helper to check if a mime type is an image
const isImageMimeType = (mimeType: string) => mimeType.startsWith('image/')

export interface TaskAttachment {
    id: string
    filename: string
    originalName: string
    mimeType: string
    size: number
    uploadedBy: string
    uploadedAt: string
    url: string
}

export interface CompletionProof {
    filename: string
    originalName: string
    mimeType: string
    uploadedBy: string
    uploadedAt: string
    note?: string
    url: string
}

export interface Task {
    id: string
    title: string
    description?: string
    status: 'pending' | 'in-progress' | 'completed'
    priority: 'low' | 'medium' | 'high'
    assignedTo: string | null
    dueDate: string
    groupId?: string
    createdBy?: string
    createdAt?: string
    updatedAt?: string
    parentTaskId?: string | null
    linkedTasks?: TaskLink[]
    attachments?: TaskAttachment[]
    completionProof?: CompletionProof | null
}

interface TaskCardProps {
    task: Task
    onClick: () => void
    onEditClick?: () => void
    onDeleteClick?: () => void
    showGroupBadge?: boolean
    groupName?: string
    subtaskCount?: number
}

export const TaskCard = ({
    task,
    onClick,
    onEditClick,
    onDeleteClick,
    showGroupBadge = false,
    groupName,
    subtaskCount = 0,
}: TaskCardProps) => {
    const StatusIcon = STATUS_ICONS[task.status]

    // Get first image from attachments or completion proof
    const taskImage = useMemo(() => {
        // First check completion proof
        if (task.completionProof && isImageMimeType(task.completionProof.mimeType)) {
            return task.completionProof.url
        }
        // Then check attachments
        const imageAttachment = task.attachments?.find((a) => isImageMimeType(a.mimeType))
        return imageAttachment?.url || null
    }, [task.attachments, task.completionProof])

    // Check if task is overdue
    const isOverdue = useMemo(() => {
        if (task.status === 'completed') return false
        const dueDate = new Date(task.dueDate)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        dueDate.setHours(0, 0, 0, 0)
        return dueDate < today
    }, [task.dueDate, task.status])

    const handleEditClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        onEditClick?.()
    }

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        onDeleteClick?.()
    }

    return (
        <div
            onClick={onClick}
            className={cn(
                'group relative flex w-full cursor-pointer flex-col text-left',
                'rounded-xl border overflow-hidden',
                'bg-white dark:bg-neutral-800',
                'border-neutral-200 dark:border-neutral-700',
                'transition-all duration-300 ease-out',
                'hover:border-brand-300 dark:hover:border-brand-600',
                'hover:shadow-brand-500/10 hover:shadow-lg',
                'hover:-translate-y-0.5',
                'active:translate-y-0 active:shadow-md',
                task.status === 'completed' && 'opacity-60',
                isOverdue && task.status !== 'completed' && 'border-error-300 bg-error-50/30 dark:border-error-700 dark:bg-error-900/10 hover:border-error-400'
            )}
        >
            {/* Task Image */}
            {taskImage && (
                <div className="relative h-32 w-full overflow-hidden bg-neutral-100 dark:bg-neutral-700">
                    <img
                        src={taskImage}
                        alt={task.title}
                        className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    {task.completionProof && (
                        <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded bg-success-500/80 px-1.5 py-0.5 text-xs font-medium text-white">
                            <ImageIcon className="size-3" />
                            Beweis
                        </div>
                    )}
                </div>
            )}

            <div className="flex items-start gap-4 p-4">
                {/* Action Buttons */}
                <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {onEditClick && (
                        <button
                            onClick={handleEditClick}
                            className={cn(
                                'flex h-7 w-7 items-center justify-center rounded-md',
                                'bg-neutral-100/90 dark:bg-neutral-700/90',
                                'text-neutral-500 dark:text-neutral-400',
                                'hover:bg-brand-100 hover:text-brand-600',
                                'dark:hover:bg-brand-900/30 dark:hover:text-brand-400',
                                'transition-all duration-200 backdrop-blur-sm'
                            )}
                            title="Aufgabe bearbeiten"
                        >
                            <Pencil className="size-3.5" />
                        </button>
                    )}
                    {onDeleteClick && (
                        <button
                            onClick={handleDeleteClick}
                            className={cn(
                                'flex h-7 w-7 items-center justify-center rounded-md',
                                'bg-neutral-100/90 dark:bg-neutral-700/90',
                                'text-neutral-500 dark:text-neutral-400',
                                'hover:bg-error-100 hover:text-error-600',
                                'dark:hover:bg-error-900/30 dark:hover:text-error-400',
                                'transition-all duration-200 backdrop-blur-sm'
                            )}
                            title="Aufgabe löschen"
                        >
                            <Trash2 className="size-3.5" />
                        </button>
                    )}
                </div>

            {/* Status Icon */}
            <div
                className={cn(
                    'mt-0.5 transition-transform duration-300 group-hover:scale-110',
                    STATUS_STYLES[task.status]
                )}
            >
                <StatusIcon className="size-5" />
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1 pr-6">
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                        {/* Group Badge */}
                        {showGroupBadge && groupName && (
                            <span className="bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400 mb-1 inline-block rounded px-1.5 py-0.5 text-xs font-medium">
                                {groupName}
                            </span>
                        )}
                        <h3
                            className={cn(
                                'font-medium text-neutral-900 dark:text-white',
                                'transition-colors duration-300',
                                'group-hover:text-brand-600 dark:group-hover:text-brand-400',
                                task.status === 'completed' && 'line-through'
                            )}
                        >
                            {task.title}
                        </h3>
                    </div>

                    {/* Priority Badge */}
                    <div className="flex items-center gap-1.5">
                        {isOverdue && (
                            <span className="inline-flex items-center gap-1 rounded bg-error-100 px-1.5 py-0.5 text-xs font-medium text-error-700 dark:bg-error-900/30 dark:text-error-400">
                                <AlertTriangle className="size-3" />
                                Überfällig
                            </span>
                        )}
                        <PriorityBadge priority={task.priority} />
                    </div>
                </div>

                {task.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-neutral-500 dark:text-neutral-400">
                        {task.description}
                    </p>
                )}

                {/* Meta Info */}
                <div className="mt-2">
                    <TaskMetadata
                        assignedTo={task.assignedTo}
                        dueDate={task.dueDate}
                        status={task.status}
                        subtaskCount={subtaskCount}
                        linkedTasks={task.linkedTasks}
                    />
                </div>
            </div>
            </div>
        </div>
    )
}
