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
    // Mock data for demo - later these would come from the task
    const progress =
        task.status === 'completed'
            ? 100
            : task.status === 'in-progress'
              ? 50
              : 0
    const attachments = 0
    const comments = 0

    return (
        <button
            onClick={onClick}
            className={cn(
                'group w-full rounded-xl p-4 text-left',
                'bg-white dark:bg-neutral-800',
                'border border-neutral-200 dark:border-neutral-700',
                'shadow-sm',
                'transition-all duration-200',
                'hover:-translate-y-0.5 hover:shadow-md',
                'hover:border-brand-300 dark:hover:border-brand-600'
            )}
        >
            {/* Priority Badge */}
            <span
                className={cn(
                    'inline-block rounded-md px-2 py-1 text-xs font-medium',
                    priorityStyles[task.priority]
                )}
            >
                {priorityLabels[task.priority]}
            </span>

            {/* Title */}
            <h4
                className={cn(
                    'mt-2 font-semibold text-neutral-900 dark:text-white',
                    'transition-colors duration-200',
                    'group-hover:text-brand-600 dark:group-hover:text-brand-400'
                )}
            >
                {task.title}
            </h4>

            {/* Description */}
            {task.description && (
                <p className="mt-1 line-clamp-2 text-sm text-neutral-500 dark:text-neutral-400">
                    {task.description}
                </p>
            )}

            {/* Progress Bar */}
            <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                    <span>Fortschritt</span>
                    <span>{progress}%</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
                    <div
                        className={cn(
                            'h-full rounded-full transition-all duration-300',
                            progress === 100 ? 'bg-success-500' : 'bg-brand-500'
                        )}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Footer */}
            <div className="mt-3 flex items-center justify-between">
                {/* Assignee Avatar */}
                <div className="flex -space-x-2">
                    {task.assignedTo ? (
                        <div
                            className={cn(
                                'flex size-7 items-center justify-center rounded-full',
                                'bg-brand-100 dark:bg-brand-900/30',
                                'border-2 border-white dark:border-neutral-800',
                                'text-brand-600 dark:text-brand-400 text-xs font-medium'
                            )}
                        >
                            {task.assignedTo.charAt(0).toUpperCase()}
                        </div>
                    ) : (
                        <div
                            className={cn(
                                'flex size-7 items-center justify-center rounded-full',
                                'bg-neutral-100 dark:bg-neutral-700',
                                'border-2 border-white dark:border-neutral-800'
                            )}
                        >
                            <User className="size-3.5 text-neutral-400" />
                        </div>
                    )}
                </div>

                {/* Meta Icons */}
                <div className="flex items-center gap-3 text-neutral-400 dark:text-neutral-500">
                    <div className="flex items-center gap-1 text-xs">
                        <Paperclip className="size-3.5" />
                        <span>{attachments}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                        <MessageSquare className="size-3.5" />
                        <span>{comments}</span>
                    </div>
                </div>
            </div>
        </button>
    )
}
