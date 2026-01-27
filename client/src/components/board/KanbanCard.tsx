import { MessageSquare, Paperclip, User, Pencil, ListTree, Link2 } from 'lucide-react'
import { cn } from '../../utils/cn'
import { PriorityBadge } from '../ui/PriorityBadge'
import type { Task } from '../tasks'

interface KanbanCardProps {
    task: Task
    onClick: () => void
    onEditClick?: () => void
    dragProps?: {
        draggable: boolean
        onDragStart: (e: React.DragEvent) => void
        onDragEnd: (e: React.DragEvent) => void
    }
    isDragging?: boolean
    subtaskCount?: number
}

export const KanbanCard = ({
    task,
    onClick,
    onEditClick,
    dragProps,
    isDragging = false,
    subtaskCount = 0,
}: KanbanCardProps) => {
    const attachments = 0
    const comments = 0
    const linkedCount = task.linkedTasks?.length || 0

    const handleEditClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        onEditClick?.()
    }

    return (
        <div
            onClick={onClick}
            className={cn(
                'group relative w-full cursor-pointer rounded-lg p-3 text-left',
                'bg-white dark:bg-neutral-800',
                'border border-neutral-200 dark:border-neutral-700',
                'shadow-sm',
                'transition-all duration-200',
                'hover:-translate-y-0.5 hover:shadow-md',
                'hover:border-brand-300 dark:hover:border-brand-600',
                isDragging &&
                    'ring-brand-500 scale-95 opacity-50 shadow-lg ring-2',
                dragProps?.draggable && 'cursor-grab active:cursor-grabbing'
            )}
            {...dragProps}
        >
            {/* Edit Button */}
            {onEditClick && (
                <button
                    onClick={handleEditClick}
                    className={cn(
                        'absolute top-2 right-2 z-10',
                        'flex h-6 w-6 items-center justify-center rounded-md',
                        'bg-neutral-100 dark:bg-neutral-700',
                        'text-neutral-500 dark:text-neutral-400',
                        'opacity-0 group-hover:opacity-100',
                        'hover:bg-brand-100 hover:text-brand-600',
                        'dark:hover:bg-brand-900/30 dark:hover:text-brand-400',
                        'transition-all duration-200'
                    )}
                    title="Aufgabe bearbeiten"
                >
                    <Pencil className="size-3" />
                </button>
            )}

            {/* Header: Priority Badge + Title */}
            <div className="flex items-start gap-2 pr-6">
                <PriorityBadge priority={task.priority} size="sm" />
                <h4
                    className={cn(
                        'flex-1 text-sm font-medium text-neutral-900 dark:text-white',
                        'line-clamp-2 transition-colors duration-200',
                        'group-hover:text-brand-600 dark:group-hover:text-brand-400'
                    )}
                >
                    {task.title}
                </h4>
            </div>

            {/* Description */}
            {task.description && (
                <p className="mt-1.5 line-clamp-1 text-xs text-neutral-500 dark:text-neutral-400">
                    {task.description}
                </p>
            )}

            {/* Footer */}
            <div className="mt-2 flex items-center justify-between">
                {/* Assignee Avatar */}
                <div className="flex -space-x-1.5">
                    {task.assignedTo ? (
                        <div
                            className={cn(
                                'flex size-5 items-center justify-center rounded-full',
                                'bg-brand-100 dark:bg-brand-900/30',
                                'border border-white dark:border-neutral-800',
                                'text-brand-600 dark:text-brand-400 text-[10px] font-medium'
                            )}
                        >
                            {task.assignedTo.charAt(0).toUpperCase()}
                        </div>
                    ) : (
                        <div
                            className={cn(
                                'flex size-5 items-center justify-center rounded-full',
                                'bg-neutral-100 dark:bg-neutral-700',
                                'border border-white dark:border-neutral-800'
                            )}
                        >
                            <User className="size-3 text-neutral-400" />
                        </div>
                    )}
                </div>

                {/* Meta Icons */}
                <div className="flex items-center gap-2 text-neutral-400 dark:text-neutral-500">
                    {/* Subtasks */}
                    {subtaskCount > 0 && (
                        <div className="text-info-500 dark:text-info-400 flex items-center gap-0.5 text-[10px]">
                            <ListTree className="size-3" />
                            <span>{subtaskCount}</span>
                        </div>
                    )}
                    {/* Links */}
                    {linkedCount > 0 && (
                        <div className="text-brand-500 dark:text-brand-400 flex items-center gap-0.5 text-[10px]">
                            <Link2 className="size-3" />
                            <span>{linkedCount}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-0.5 text-[10px]">
                        <Paperclip className="size-3" />
                        <span>{attachments}</span>
                    </div>
                    <div className="flex items-center gap-0.5 text-[10px]">
                        <MessageSquare className="size-3" />
                        <span>{comments}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
