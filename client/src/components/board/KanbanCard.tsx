import { MessageSquare, Paperclip, User } from 'lucide-react'
import { cn } from '../../utils/cn'
import type { Task } from '../tasks'

interface KanbanCardProps {
    task: Task
    onClick: () => void
}

const priorityStyles = {
    low: 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400',
    medium: 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400',
    high: 'bg-error-100 text-error-700 dark:bg-error-900/30 dark:text-error-400',
}

const priorityLabels = {
    low: 'Niedrig',
    medium: 'Mittel',
    high: 'Hoch',
}

export const KanbanCard = ({ task, onClick }: KanbanCardProps) => {
    const attachments = 0
    const comments = 0

    return (
        <button
            onClick={onClick}
            className={cn(
                'group w-full rounded-lg p-3 text-left',
                'bg-white dark:bg-neutral-800',
                'border border-neutral-200 dark:border-neutral-700',
                'shadow-sm',
                'transition-all duration-200',
                'hover:-translate-y-0.5 hover:shadow-md',
                'hover:border-brand-300 dark:hover:border-brand-600'
            )}
        >
            {/* Header: Priority Badge + Title */}
            <div className="flex items-start gap-2">
                <span
                    className={cn(
                        'mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium',
                        priorityStyles[task.priority]
                    )}
                >
                    {priorityLabels[task.priority]}
                </span>
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

            {/* Description - only show first line */}
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
        </button>
    )
}
