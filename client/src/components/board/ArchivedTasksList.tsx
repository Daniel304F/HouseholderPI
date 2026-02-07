import { Archive, Calendar } from 'lucide-react'
import { cn } from '../../utils/cn'
import { PriorityBadge } from '../tasks'
import type { Task } from '../../api/tasks'

interface ArchivedTasksListProps {
    tasks: Task[]
    onTaskClick: (task: Task) => void
    isLoading?: boolean
}

const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    })
}

export const ArchivedTasksList = ({
    tasks,
    onTaskClick,
    isLoading = false,
}: ArchivedTasksListProps) => {
    if (isLoading) {
        return (
            <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div
                        key={i}
                        className="h-20 animate-pulse rounded-xl bg-neutral-100 dark:bg-neutral-800"
                    />
                ))}
            </div>
        )
    }

    if (tasks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-300 px-6 py-16 dark:border-neutral-600">
                <Archive className="mb-3 size-10 text-neutral-300 dark:text-neutral-600" />
                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                    Keine archivierten Aufgaben
                </p>
                <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
                    Erledigte Aufgaben können im Board archiviert werden
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2 pb-2">
                <Archive className="size-5 text-neutral-500 dark:text-neutral-400" />
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                    Archiv
                </h2>
                <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400">
                    {tasks.length}
                </span>
            </div>

            <div className="space-y-2">
                {tasks.map((task) => (
                    <button
                        key={task.id}
                        onClick={() => onTaskClick(task)}
                        className={cn(
                            'flex w-full items-center gap-4 rounded-xl p-4 text-left',
                            'bg-white dark:bg-neutral-800/90',
                            'border border-neutral-200/80 dark:border-neutral-700/80',
                            'shadow-sm transition-all duration-200',
                            'hover:shadow-md hover:border-neutral-300 dark:hover:border-neutral-600',
                        )}
                    >
                        <PriorityBadge priority={task.priority} size="sm" />

                        <div className="min-w-0 flex-1">
                            <p className="truncate font-medium text-neutral-900 dark:text-white">
                                {task.title}
                            </p>
                            {task.description && (
                                <p className="mt-0.5 truncate text-xs text-neutral-500 dark:text-neutral-400">
                                    {task.description}
                                </p>
                            )}
                        </div>

                        <div className="flex shrink-0 items-center gap-1.5 text-xs text-neutral-400 dark:text-neutral-500">
                            <Calendar className="size-3.5" />
                            <span>{formatDate(task.completedAt)}</span>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    )
}
