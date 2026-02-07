import { cn } from '../../utils/cn'
import type { Task } from '../../api/tasks'

interface CalendarTaskItemProps {
    task: Task
    onClick?: () => void
}

export const CalendarTaskItem = ({
    task,
    onClick,
}: CalendarTaskItemProps) => {
    const isOverdue =
        task.status !== 'completed' && new Date(task.dueDate) < new Date()

    return (
        <button
            onClick={onClick}
            className={cn(
                'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors',
                'hover:bg-neutral-100 dark:hover:bg-neutral-800',
                'border-l-2',
                task.status === 'completed'
                    ? 'border-emerald-500'
                    : isOverdue
                      ? 'border-error-500'
                      : 'border-amber-500'
            )}
        >
            <div className="min-w-0 flex-1">
                <p
                    className={cn(
                        'truncate text-sm font-medium',
                        task.status === 'completed'
                            ? 'text-neutral-500 line-through'
                            : 'text-neutral-900 dark:text-white'
                    )}
                >
                    {task.title}
                </p>
            </div>
            <span
                className={cn(
                    'rounded px-1.5 py-0.5 text-xs font-medium',
                    task.priority === 'high'
                        ? 'bg-error-100 text-error-700 dark:bg-error-900/30 dark:text-error-400'
                        : task.priority === 'medium'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                          : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                )}
            >
                {task.priority === 'high'
                    ? 'Hoch'
                    : task.priority === 'medium'
                      ? 'Mittel'
                      : 'Niedrig'}
            </span>
        </button>
    )
}
