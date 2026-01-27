import {
    Clock,
    User,
    AlertCircle,
    CheckCircle2,
    Circle,
    Pencil,
    Link2,
    ListTree,
} from 'lucide-react'
import { cn } from '../../utils/cn'
import type { TaskLink } from '../../api/tasks'

export interface Task {
    id: string
    title: string
    description?: string
    status: 'pending' | 'in-progress' | 'completed'
    priority: 'low' | 'medium' | 'high'
    assignedTo: string | null
    dueDate: string
    // Optional API fields
    groupId?: string
    createdBy?: string
    createdAt?: string
    updatedAt?: string
    parentTaskId?: string | null
    linkedTasks?: TaskLink[]
}

interface TaskCardProps {
    task: Task
    onClick: () => void
    onEditClick?: () => void
    showGroupBadge?: boolean
    groupName?: string
    subtaskCount?: number
}

const priorityStyles = {
    low: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400',
    medium: 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400',
    high: 'bg-error-100 text-error-700 dark:bg-error-900/30 dark:text-error-400',
}

const priorityLabels = {
    low: 'Niedrig',
    medium: 'Mittel',
    high: 'Hoch',
}

const statusIcons = {
    pending: Circle,
    'in-progress': Clock,
    completed: CheckCircle2,
}

const statusStyles = {
    pending: 'text-neutral-400 dark:text-neutral-500',
    'in-progress': 'text-info-500 dark:text-info-400',
    completed: 'text-success-500 dark:text-success-400',
}

export const TaskCard = ({
    task,
    onClick,
    onEditClick,
    showGroupBadge = false,
    groupName,
    subtaskCount = 0,
}: TaskCardProps) => {
    const StatusIcon = statusIcons[task.status]
    const isOverdue =
        task.status !== 'completed' && new Date(task.dueDate) < new Date()
    const hasLinks = task.linkedTasks && task.linkedTasks.length > 0

    const formatDueDate = (dateStr: string) => {
        const date = new Date(dateStr)
        const now = new Date()
        const diffDays = Math.ceil(
            (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        )

        if (diffDays < 0) return `${Math.abs(diffDays)} Tag(e) überfällig`
        if (diffDays === 0) return 'Heute'
        if (diffDays === 1) return 'Morgen'
        if (diffDays < 7) return `In ${diffDays} Tagen`
        return date.toLocaleDateString('de-DE', {
            day: '2-digit',
            month: '2-digit',
        })
    }

    const handleEditClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        onEditClick?.()
    }

    return (
        <div
            onClick={onClick}
            className={cn(
                'group relative flex w-full cursor-pointer items-start gap-4 p-4 text-left',
                'rounded-xl border',
                'bg-white dark:bg-neutral-800',
                'border-neutral-200 dark:border-neutral-700',
                'transition-all duration-300 ease-out',
                'hover:border-brand-300 dark:hover:border-brand-600',
                'hover:shadow-brand-500/10 hover:shadow-lg',
                'hover:-translate-y-0.5',
                'active:translate-y-0 active:shadow-md',
                task.status === 'completed' && 'opacity-60'
            )}
        >
            {/* Edit Button*/}
            {onEditClick && (
                <button
                    onClick={handleEditClick}
                    className={cn(
                        'absolute top-2 right-2 z-10',
                        'flex h-7 w-7 items-center justify-center rounded-md',
                        'bg-neutral-100 dark:bg-neutral-700',
                        'text-neutral-500 dark:text-neutral-400',
                        'opacity-0 group-hover:opacity-100',
                        'hover:bg-brand-100 hover:text-brand-600',
                        'dark:hover:bg-brand-900/30 dark:hover:text-brand-400',
                        'transition-all duration-200'
                    )}
                    title="Aufgabe bearbeiten"
                >
                    <Pencil className="size-3.5" />
                </button>
            )}

            {/* Status Icon */}
            <div
                className={cn(
                    'mt-0.5 transition-transform duration-300 group-hover:scale-110',
                    statusStyles[task.status]
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
                    <span
                        className={cn(
                            'shrink-0 rounded-full px-2 py-0.5 text-xs font-medium',
                            priorityStyles[task.priority]
                        )}
                    >
                        {priorityLabels[task.priority]}
                    </span>
                </div>

                {task.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-neutral-500 dark:text-neutral-400">
                        {task.description}
                    </p>
                )}

                {/* Meta Info */}
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
                    {/* Assigned To */}
                    <div className="flex items-center gap-1">
                        <User className="size-3.5" />
                        <span>{task.assignedTo || 'Nicht zugewiesen'}</span>
                    </div>

                    {/* Due Date */}
                    <div
                        className={cn(
                            'flex items-center gap-1',
                            isOverdue && 'text-error-500 dark:text-error-400'
                        )}
                    >
                        {isOverdue ? (
                            <AlertCircle className="size-3.5" />
                        ) : (
                            <Clock className="size-3.5" />
                        )}
                        <span>{formatDueDate(task.dueDate)}</span>
                    </div>

                    {/* Subtask Counter */}
                    {subtaskCount > 0 && (
                        <div className="text-info-500 dark:text-info-400 flex items-center gap-1">
                            <ListTree className="size-3.5" />
                            <span>
                                {subtaskCount} Unteraufgabe
                                {subtaskCount > 1 ? 'n' : ''}
                            </span>
                        </div>
                    )}

                    {/* Links Indicator */}
                    {hasLinks && (
                        <div className="text-brand-500 dark:text-brand-400 flex items-center gap-1">
                            <Link2 className="size-3.5" />
                            <span>
                                {task.linkedTasks?.length} Verknüpfung
                                {task.linkedTasks!.length > 1 ? 'en' : ''}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
