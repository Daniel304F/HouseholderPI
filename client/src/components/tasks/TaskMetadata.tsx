import { Clock, User, AlertCircle, ListTree, Link2 } from 'lucide-react'
import { cn } from '../../utils/cn'
import { formatDueDate, isOverdue } from '../../utils/date.utils'
import type { TaskLink } from '../../api/tasks'

interface TaskMetadataProps {
    assignedTo: string | null
    assignedToName?: string
    dueDate: string
    status: 'pending' | 'in-progress' | 'completed'
    subtaskCount?: number
    linkedTasks?: TaskLink[]
    size?: 'sm' | 'md'
}

export const TaskMetadata = ({
    assignedTo,
    assignedToName,
    dueDate,
    status,
    subtaskCount = 0,
    linkedTasks,
    size = 'md',
}: TaskMetadataProps) => {
    const overdueCheck = status !== 'completed' && isOverdue(dueDate)
    const hasLinks = linkedTasks && linkedTasks.length > 0

    return (
        <div
            className={cn(
                'flex flex-wrap items-center gap-3 text-neutral-500 dark:text-neutral-400',
                size === 'sm' ? 'text-[10px]' : 'text-xs'
            )}
        >
            {/* Assigned To */}
            <div className="flex items-center gap-1">
                <User className={size === 'sm' ? 'size-3' : 'size-3.5'} />
                <span>
                    {assignedToName || assignedTo || 'Nicht zugewiesen'}
                </span>
            </div>

            {/* Due Date */}
            <div
                className={cn(
                    'flex items-center gap-1',
                    overdueCheck && 'text-error-500 dark:text-error-400'
                )}
            >
                {overdueCheck ? (
                    <AlertCircle
                        className={size === 'sm' ? 'size-3' : 'size-3.5'}
                    />
                ) : (
                    <Clock className={size === 'sm' ? 'size-3' : 'size-3.5'} />
                )}
                <span>{formatDueDate(dueDate)}</span>
            </div>

            {/* Subtask Counter */}
            {subtaskCount > 0 && (
                <div className="text-info-500 dark:text-info-400 flex items-center gap-1">
                    <ListTree
                        className={size === 'sm' ? 'size-3' : 'size-3.5'}
                    />
                    <span>
                        {subtaskCount} Unteraufgabe{subtaskCount > 1 ? 'n' : ''}
                    </span>
                </div>
            )}

            {/* Links Indicator */}
            {hasLinks && (
                <div className="text-brand-500 dark:text-brand-400 flex items-center gap-1">
                    <Link2 className={size === 'sm' ? 'size-3' : 'size-3.5'} />
                    <span>
                        {linkedTasks?.length} Verknüpfung
                        {linkedTasks!.length > 1 ? 'en' : ''}
                    </span>
                </div>
            )}
        </div>
    )
}
