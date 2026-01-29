import {
    MessageSquare,
    Paperclip,
    User,
    Pencil,
    ListTree,
    Link2,
} from 'lucide-react'
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
                'group relative w-full cursor-pointer rounded-xl p-4 text-left',
                'bg-white dark:bg-neutral-800/90',
                'border border-neutral-200/80 dark:border-neutral-700/80',
                'shadow-sm',
                'transition-all duration-200 ease-out',
                'hover:shadow-brand-500/5 hover:-translate-y-1 hover:shadow-lg',
                'hover:border-brand-300/80 dark:hover:border-brand-600/60',
                'hover:to-brand-50/30 hover:bg-gradient-to-br hover:from-white',
                'dark:hover:to-brand-950/20 dark:hover:from-neutral-800',
                isDragging &&
                    'ring-brand-500 scale-[0.97] opacity-60 shadow-xl ring-2',
                dragProps?.draggable && 'cursor-grab active:cursor-grabbing'
            )}
            {...dragProps}
        >
            {/* Edit Button */}
            {onEditClick && (
                <button
                    onClick={handleEditClick}
                    className={cn(
                        'absolute top-3 right-3 z-10',
                        'flex h-7 w-7 items-center justify-center rounded-lg',
                        'bg-neutral-100/80 dark:bg-neutral-700/80',
                        'text-neutral-400 dark:text-neutral-500',
                        'opacity-0 group-hover:opacity-100',
                        'hover:bg-brand-100 hover:text-brand-600',
                        'dark:hover:bg-brand-900/40 dark:hover:text-brand-400',
                        'transition-all duration-200',
                        'active:scale-90'
                    )}
                    title="Aufgabe bearbeiten"
                >
                    <Pencil className="size-3.5" />
                </button>
            )}

            {/* Header: Priority Badge + Title */}
            <div className="flex items-start gap-2.5 pr-8">
                <PriorityBadge priority={task.priority} size="sm" />
                <h4
                    className={cn(
                        'flex-1 text-sm font-semibold text-neutral-800 dark:text-neutral-100',
                        'line-clamp-2 transition-colors duration-200',
                        'group-hover:text-brand-600 dark:group-hover:text-brand-400'
                    )}
                >
                    {task.title}
                </h4>
            </div>

            {/* Description */}
            {task.description && (
                <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                    {task.description}
                </p>
            )}

            {/* Footer */}
            <div className="mt-3 flex items-center justify-between border-t border-neutral-100 pt-2 dark:border-neutral-700/50">
                {/* Assignee Avatar */}
                <div className="flex -space-x-1.5">
                    {task.assignedTo ? (
                        <div
                            className={cn(
                                'flex size-6 items-center justify-center rounded-full',
                                'from-brand-100 to-brand-200 bg-gradient-to-br',
                                'dark:from-brand-900/50 dark:to-brand-800/50',
                                'border-2 border-white dark:border-neutral-800',
                                'text-brand-700 dark:text-brand-300 text-[11px] font-bold',
                                'shadow-sm'
                            )}
                        >
                            {task.assignedTo.charAt(0).toUpperCase()}
                        </div>
                    ) : (
                        <div
                            className={cn(
                                'flex size-6 items-center justify-center rounded-full',
                                'bg-neutral-100 dark:bg-neutral-700',
                                'border-2 border-white dark:border-neutral-800'
                            )}
                        >
                            <User className="size-3.5 text-neutral-400" />
                        </div>
                    )}
                </div>

                {/* Meta Icons */}
                <div className="flex items-center gap-2.5 text-neutral-400 dark:text-neutral-500">
                    {/* Subtasks */}
                    {subtaskCount > 0 && (
                        <div className="text-info-500 dark:text-info-400 flex items-center gap-1 text-[11px] font-medium">
                            <ListTree className="size-3.5" />
                            <span>{subtaskCount}</span>
                        </div>
                    )}
                    {/* Links */}
                    {linkedCount > 0 && (
                        <div className="text-brand-500 dark:text-brand-400 flex items-center gap-1 text-[11px] font-medium">
                            <Link2 className="size-3.5" />
                            <span>{linkedCount}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-1 text-[11px]">
                        <Paperclip className="size-3.5" />
                        <span>{attachments}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px]">
                        <MessageSquare className="size-3.5" />
                        <span>{comments}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
