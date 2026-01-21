import { MoreHorizontal, Plus } from 'lucide-react'
import { cn } from '../../utils/cn'
import { KanbanCard } from './KanbanCard'
import type { Task } from '../tasks'

export type ColumnStatus = 'pending' | 'in-progress' | 'review' | 'completed'

export interface KanbanColumnData {
    id: ColumnStatus
    title: string
    color: string
    tasks: Task[]
}

interface KanbanColumnProps {
    column: KanbanColumnData
    onTaskClick: (task: Task) => void
    onAddTask: (columnId: ColumnStatus) => void
}

const columnColors: Record<ColumnStatus, string> = {
    pending: 'bg-amber-400',
    'in-progress': 'bg-blue-400',
    review: 'bg-purple-400',
    completed: 'bg-green-400',
}

const columnBgColors: Record<ColumnStatus, string> = {
    pending: 'bg-amber-50 dark:bg-amber-950/20',
    'in-progress': 'bg-blue-50 dark:bg-blue-950/20',
    review: 'bg-purple-50 dark:bg-purple-950/20',
    completed: 'bg-green-50 dark:bg-green-950/20',
}

export const KanbanColumn = ({
    column,
    onTaskClick,
    onAddTask,
}: KanbanColumnProps) => {
    return (
        <div
            className={cn(
                'flex min-w-72 flex-col rounded-xl',
                columnBgColors[column.id]
            )}
        >
            {/* Column Header */}
            <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-2">
                    <div
                        className={cn(
                            'size-2 rounded-full',
                            columnColors[column.id]
                        )}
                    />
                    <h3 className="font-semibold text-neutral-900 dark:text-white">
                        {column.title}
                    </h3>
                    <span
                        className={cn(
                            'flex size-5 items-center justify-center rounded-full text-xs font-medium',
                            'bg-neutral-200 dark:bg-neutral-700',
                            'text-neutral-600 dark:text-neutral-400'
                        )}
                    >
                        {column.tasks.length}
                    </span>
                </div>
                <button
                    className={cn(
                        'rounded-lg p-1 transition-colors',
                        'text-neutral-400 hover:text-neutral-600',
                        'dark:text-neutral-500 dark:hover:text-neutral-300',
                        'hover:bg-white/50 dark:hover:bg-neutral-800/50'
                    )}
                >
                    <MoreHorizontal className="size-4" />
                </button>
            </div>

            {/* Tasks Container */}
            <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-2 pt-0">
                {column.tasks.map((task) => (
                    <KanbanCard
                        key={task.id}
                        task={task}
                        onClick={() => onTaskClick(task)}
                    />
                ))}

                {/* Add Task Button */}
                <button
                    onClick={() => onAddTask(column.id)}
                    className={cn(
                        'flex items-center justify-center gap-2 rounded-lg p-3',
                        'border border-dashed',
                        'border-neutral-300 dark:border-neutral-600',
                        'text-sm text-neutral-500 dark:text-neutral-400',
                        'transition-all duration-200',
                        'hover:border-brand-400 hover:text-brand-600',
                        'dark:hover:border-brand-500 dark:hover:text-brand-400',
                        'hover:bg-white/50 dark:hover:bg-neutral-800/50'
                    )}
                >
                    <Plus className="size-4" />
                    <span>Aufgabe hinzufügen</span>
                </button>
            </div>
        </div>
    )
}
