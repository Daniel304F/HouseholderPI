import { Archive, Calendar } from 'lucide-react'
import { cn } from '../../utils/cn'
import { PriorityBadge } from '../tasks'
import type { Task } from '../../api/tasks'

interface ArchivedTasksListProps {
    tasks: Task[]
    onTaskClick: (task: Task) => void
    isLoading?: boolean
}

const archivedDateFormatter = new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
})

const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-'

    const date = new Date(dateString)
    if (Number.isNaN(date.getTime())) return '-'

    return archivedDateFormatter.format(date)
}

export const ArchivedTasksList = ({
    tasks,
    onTaskClick,
    isLoading = false,
}: ArchivedTasksListProps) => {
    if (isLoading) {
        return (
            <ul className="space-y-3" aria-label="Archiv wird geladen">
                {Array.from({ length: 3 }).map((_, index) => (
                    <li
                        key={`archive-skeleton-${index}`}
                        className="h-20 animate-pulse rounded-xl bg-neutral-100 dark:bg-neutral-800"
                    />
                ))}
            </ul>
        )
    }

    if (tasks.length === 0) {
        return (
            <section className="flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-300 px-6 py-16 dark:border-neutral-600">
                <Archive className="mb-3 size-10 text-neutral-300 dark:text-neutral-600" />
                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                    Keine archivierten Aufgaben
                </p>
                <p className="mt-1 max-w-[44ch] text-center text-xs leading-5 text-neutral-400 dark:text-neutral-500">
                    Erledigte Aufgaben koennen im Board archiviert werden.
                </p>
            </section>
        )
    }

    return (
        <section className="space-y-2" aria-label="Archivierte Aufgaben">
            <header className="flex items-center gap-2 pb-2">
                <Archive className="size-5 text-neutral-500 dark:text-neutral-400" />
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                    Archiv
                </h2>
                <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400">
                    {tasks.length}
                </span>
            </header>

            <ul className="space-y-2" role="list">
                {tasks.map((task) => (
                    <li key={task.id}>
                        <button
                            type="button"
                            onClick={() => onTaskClick(task)}
                            className={cn(
                                'flex w-full items-center gap-4 rounded-xl p-4 text-left',
                                'bg-white/95 dark:bg-neutral-800/90',
                                'border border-neutral-200/80 dark:border-neutral-700/80',
                                'shadow-[var(--shadow-sm)] transition-all duration-200 ease-out',
                                'hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)] hover:border-brand-300/70',
                                'dark:hover:border-brand-600/60',
                                'active:scale-[0.99] active:shadow-[var(--shadow-sm)]',
                                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/45'
                            )}
                        >
                            <PriorityBadge priority={task.priority} size="sm" />

                            <span className="min-w-0 flex-1">
                                <span className="block truncate font-medium text-neutral-900 dark:text-white">
                                    {task.title}
                                </span>
                                {task.description && (
                                    <span className="mt-0.5 block max-w-[40ch] truncate text-xs leading-5 text-neutral-500 dark:text-neutral-400">
                                        {task.description}
                                    </span>
                                )}
                            </span>

                            <time
                                className="flex shrink-0 items-center gap-1.5 text-xs text-neutral-400 dark:text-neutral-500"
                                dateTime={task.completedAt ?? undefined}
                            >
                                <Calendar className="size-3.5" />
                                <span>{formatDate(task.completedAt)}</span>
                            </time>
                        </button>
                    </li>
                ))}
            </ul>
        </section>
    )
}
