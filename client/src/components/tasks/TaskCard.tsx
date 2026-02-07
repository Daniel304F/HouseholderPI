import { useMemo } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { cn } from '../../utils/cn'
import { STATUS_ICONS, STATUS_STYLES } from '../../constants/task.constants'
import { CardActionButton, OverdueBadge, GroupBadge } from '../ui'
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

    // Check if task is overdue
    const isOverdue = useMemo(() => {
        if (task.status === 'completed') return false
        const dueDate = new Date(task.dueDate)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        dueDate.setHours(0, 0, 0, 0)
        return dueDate < today
    }, [task.dueDate, task.status])

    const handleEditClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        onEditClick?.()
    }

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        onDeleteClick?.()
    }

    return (
        <div
            onClick={onClick}
            className={cn(
                'group relative flex w-full cursor-pointer flex-col text-left',
                'rounded-xl border overflow-hidden',
                'bg-white dark:bg-neutral-800',
                'border-neutral-200 dark:border-neutral-700',
                'transition-all duration-300 ease-out',
                'hover:border-brand-300 dark:hover:border-brand-600',
                'hover:shadow-brand-500/10 hover:shadow-lg',
                'hover:-translate-y-0.5',
                'active:translate-y-0 active:shadow-md',
                task.status === 'completed' && 'opacity-60',
                isOverdue && task.status !== 'completed' && 'border-error-300 bg-error-50/30 dark:border-error-700 dark:bg-error-900/10 hover:border-error-400'
            )}
        >
            <div className="flex items-start gap-4 p-4">
                {/* Action Buttons */}
                <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
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
                            title="Aufgabe löschen"
                        />
                    )}
                </div>

            {/* Status Icon */}
            <div
                className={cn(
                    'mt-0.5 transition-transform duration-300 group-hover:scale-110',
                    STATUS_STYLES[task.status]
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
                            <GroupBadge name={groupName} />
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
                    <div className="flex items-center gap-1.5">
                        {isOverdue && <OverdueBadge />}
                        <PriorityBadge priority={task.priority} />
                    </div>
                </div>

                {task.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-neutral-500 dark:text-neutral-400">
                        {task.description}
                    </p>
                )}

                {/* Meta Info */}
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
        </div>
    )
}
