import { useMemo, type KeyboardEvent, type MouseEvent } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { cn } from '../../utils/cn'
import { STATUS_ICONS, STATUS_STYLES } from '../../constants/task.constants'
import { CardActionButton, GroupBadge, OverdueBadge } from '../ui'
import { PriorityBadge } from './PriorityBadge'
import { TaskMetadata } from './TaskMetadata'
import type { Task } from '../../api/tasks'

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

    const isOverdue = useMemo(() => {
        if (task.status === 'completed') return false

        const dueDate = new Date(task.dueDate)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        dueDate.setHours(0, 0, 0, 0)

        return dueDate < today
    }, [task.dueDate, task.status])

    const handleCardKeyDown = (event: KeyboardEvent<HTMLElement>) => {
        if (event.key !== 'Enter' && event.key !== ' ') return
        event.preventDefault()
        onClick()
    }

    const handleEditClick = (event: MouseEvent) => {
        event.stopPropagation()
        onEditClick?.()
    }

    const handleDeleteClick = (event: MouseEvent) => {
        event.stopPropagation()
        onDeleteClick?.()
    }

    return (
        <article
            onClick={onClick}
            onKeyDown={handleCardKeyDown}
            role="button"
            tabIndex={0}
            aria-label={`Aufgabe ${task.title}`}
            className={cn(
                'group relative flex w-full cursor-pointer flex-col overflow-hidden rounded-xl border text-left',
                'bg-white/95 dark:bg-neutral-800/95',
                'border-neutral-200/85 dark:border-neutral-700/85',
                'shadow-[var(--shadow-sm)] transition-[transform,box-shadow,border-color,background-color] duration-200 ease-out',
                'hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-[var(--shadow-md)]',
                'dark:hover:border-brand-600/60',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/45',
                'active:scale-[0.99] active:shadow-[var(--shadow-sm)]',
                task.status === 'completed' && 'opacity-60',
                isOverdue &&
                    task.status !== 'completed' &&
                    'border-error-300 bg-error-50/35 dark:border-error-700 dark:bg-error-900/12 hover:border-error-400'
            )}
        >
            <div className="relative flex items-start gap-4 p-4">
                <div className="absolute right-2 top-2 z-10 flex gap-1 opacity-100 transition-opacity duration-200 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-focus-within:opacity-100">
                    {onEditClick && (
                        <CardActionButton
                            icon={<Pencil className="size-3.5" />}
                            onClick={handleEditClick}
                            title="Aufgabe bearbeiten"
                        />
                    )}
                    {onDeleteClick && (
                        <CardActionButton
                            icon={<Trash2 className="size-3.5" />}
                            variant="danger"
                            onClick={handleDeleteClick}
                            title="Aufgabe loeschen"
                        />
                    )}
                </div>

                <span
                    className={cn(
                        'mt-0.5 shrink-0 text-neutral-400 transition-transform duration-200 group-hover:scale-105 dark:text-neutral-500',
                        STATUS_STYLES[task.status]
                    )}
                    aria-hidden
                >
                    <StatusIcon className="size-5" />
                </span>

                <div className="min-w-0 flex-1 pr-10">
                    <header className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                            {showGroupBadge && groupName && <GroupBadge name={groupName} />}
                            <h3
                                className={cn(
                                    'font-medium text-neutral-900 transition-colors duration-200 dark:text-white',
                                    'group-hover:text-brand-700 dark:group-hover:text-brand-300',
                                    task.status === 'completed' && 'line-through'
                                )}
                            >
                                {task.title}
                            </h3>
                        </div>

                        <div className="flex items-center gap-1.5">
                            {isOverdue && <OverdueBadge />}
                            <PriorityBadge priority={task.priority} />
                        </div>
                    </header>

                    {task.description && (
                        <p className="mt-1 max-w-[44ch] line-clamp-2 text-sm leading-5 text-neutral-500 dark:text-neutral-400">
                            {task.description}
                        </p>
                    )}

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
        </article>
    )
}
