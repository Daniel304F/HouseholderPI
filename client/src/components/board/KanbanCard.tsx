import { Link2, ListTree, Pencil, Trash2, User } from 'lucide-react'
import { cn } from '../../utils/cn'
import { CardActionButton } from '../ui'
import { PriorityBadge } from '../tasks'
import type { Task } from '../../api/tasks'

interface AssigneeInfo {
    userId: string
    name?: string
    avatar?: string
}

interface KanbanCardProps {
    task: Task
    onClick: () => void
    onEditClick?: () => void
    onDeleteClick?: () => void
    dragProps?: {
        draggable: boolean
        onDragStart: (e: React.DragEvent) => void
        onDragEnd: (e: React.DragEvent) => void
    }
    isDragging?: boolean
    subtaskCount?: number
    assigneeInfo?: AssigneeInfo
}


export const KanbanCard = ({
    task,
    onClick,
    onEditClick,
    onDeleteClick,
    dragProps,
    isDragging = false,
    subtaskCount = 0,
    assigneeInfo,
}: KanbanCardProps) => {
    const linkedCount = task.linkedTasks?.length ?? 0
    const hasMeta = subtaskCount > 0 || linkedCount > 0

    const assigneeLabel = assigneeInfo?.name || task.assignedTo || 'Nicht zugewiesen'
    const assigneeInitial = assigneeLabel.charAt(0).toUpperCase()

    const handleCardKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
        if (event.key !== 'Enter' && event.key !== ' ') return
        event.preventDefault()
        onClick()
    }

    const handleEditClick = (event: React.MouseEvent) => {
        event.stopPropagation()
        onEditClick?.()
    }

    const handleDeleteClick = (event: React.MouseEvent) => {
        event.stopPropagation()
        onDeleteClick?.()
    }

    const priorityAccent: Record<string, string> = {
        high: 'before:bg-error-500',
        medium: 'before:bg-warning-400',
        low: 'before:bg-success-500',
    }

    return (
        <article
            onClick={onClick}
            onKeyDown={handleCardKeyDown}
            role="button"
            tabIndex={0}
            aria-label={`Aufgabe ${task.title}`}
            className={cn(
                'group relative w-full flex-shrink-0 overflow-hidden rounded-xl border text-left',
                'bg-white/92 dark:bg-neutral-800/92',
                'border-neutral-200/85 dark:border-neutral-700/85',
                'shadow-[var(--shadow-sm)]',
                'transition-[transform,box-shadow,border-color,background-color] duration-200 ease-out',
                'hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)] hover:border-brand-300/80',
                'dark:hover:border-brand-600/60',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/45 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900',
                'active:scale-[0.99] active:shadow-[var(--shadow-sm)]',
                // Priority left accent
                'before:absolute before:left-0 before:top-2.5 before:bottom-2.5 before:w-[3px] before:rounded-r-full',
                'before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-200',
                priorityAccent[task.priority],
                isDragging &&
                    'scale-[0.98] opacity-70 ring-2 ring-brand-500 shadow-[var(--shadow-lg)]',
                dragProps?.draggable && 'cursor-grab active:cursor-grabbing'
            )}
            {...dragProps}
        >
            <div className="relative z-10 p-4">
                <div className="absolute right-3 top-3 z-10 flex gap-1 opacity-100 transition-opacity duration-200 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-focus-within:opacity-100">
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

                <header className="flex items-start gap-2.5 pr-12">
                    <PriorityBadge priority={task.priority} size="sm" />
                    <h4
                        className={cn(
                            'flex-1 text-sm font-semibold leading-5 text-neutral-900 dark:text-neutral-100',
                            'line-clamp-2 transition-colors duration-200',
                            'group-hover:text-brand-700 dark:group-hover:text-brand-300'
                        )}
                    >
                        {task.title}
                    </h4>
                </header>

                {task.description && (
                    <p className="mt-2 max-w-[34ch] line-clamp-2 text-xs leading-5 text-neutral-500 dark:text-neutral-400">
                        {task.description}
                    </p>
                )}

                <footer className="mt-3 flex items-center justify-between border-t border-neutral-100/90 pt-2 dark:border-neutral-700/55">
                    <div className="flex -space-x-1.5">
                        {task.assignedTo ? (
                            assigneeInfo?.avatar ? (
                                <img
                                    src={assigneeInfo.avatar}
                                    alt={assigneeLabel}
                                    title={assigneeLabel}
                                    className={cn(
                                        'size-6 rounded-full object-cover',
                                        'border-2 border-white dark:border-neutral-800',
                                        'shadow-[var(--shadow-sm)]'
                                    )}
                                />
                            ) : (
                                <span
                                    className={cn(
                                        'flex size-6 items-center justify-center rounded-full',
                                        'bg-brand-100 dark:bg-brand-900/50',
                                        'border-2 border-white dark:border-neutral-800',
                                        'text-[11px] font-bold text-brand-700 dark:text-brand-300',
                                        'shadow-[var(--shadow-sm)]'
                                    )}
                                    title={assigneeLabel}
                                >
                                    {assigneeInitial}
                                </span>
                            )
                        ) : (
                            <span
                                className={cn(
                                    'flex size-6 items-center justify-center rounded-full',
                                    'bg-neutral-100 dark:bg-neutral-700',
                                    'border-2 border-white dark:border-neutral-800'
                                )}
                                title="Nicht zugewiesen"
                            >
                                <User className="size-3.5 text-neutral-400" />
                            </span>
                        )}
                    </div>

                    {hasMeta && (
                        <ul className="flex items-center gap-1.5 text-[11px] font-medium">
                            {subtaskCount > 0 && (
                                <li className="text-info-700 dark:text-info-200 flex items-center gap-1 rounded-full bg-info-100/80 px-1.5 py-0.5 dark:bg-info-900/35">
                                    <ListTree className="size-3.5" />
                                    <span>{subtaskCount}</span>
                                </li>
                            )}
                            {linkedCount > 0 && (
                                <li className="text-brand-700 dark:text-brand-200 flex items-center gap-1 rounded-full bg-brand-100/80 px-1.5 py-0.5 dark:bg-brand-900/35">
                                    <Link2 className="size-3.5" />
                                    <span>{linkedCount}</span>
                                </li>
                            )}
                        </ul>
                    )}
                </footer>
            </div>
        </article>
    )
}
