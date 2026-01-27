import { MoreHorizontal, Plus } from 'lucide-react'
import { cn } from '../../utils/cn'
import { KanbanCard } from './KanbanCard'
import { PriorityFilterDropdown } from './PriorityFilterDropdown'
import type { Task } from '../tasks'
import type { Priority } from '../../hooks/useTaskFilter'

export type ColumnStatus = 'pending' | 'in-progress' | 'completed'

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
    isMobile?: boolean
    isCompact?: boolean
    // Filter props
    activeFilters?: Priority[]
    onToggleFilter?: (priority: Priority) => void
    onClearFilters?: () => void
    hasActiveFilters?: boolean
    // Drag and Drop props
    getDragProps?: (task: Task) => {
        draggable: boolean
        onDragStart: (e: React.DragEvent) => void
        onDragEnd: (e: React.DragEvent) => void
    }
    getDropZoneProps?: (columnId: ColumnStatus) => {
        onDragOver: (e: React.DragEvent) => void
        onDragLeave: (e: React.DragEvent) => void
        onDrop: (e: React.DragEvent) => void
    }
    isDropTarget?: boolean
    draggedTaskId?: string
}

const columnColors: Record<ColumnStatus, string> = {
    pending: 'bg-amber-400',
    'in-progress': 'bg-blue-400',
    completed: 'bg-green-400',
}

const columnBgColors: Record<ColumnStatus, string> = {
    pending: 'bg-amber-50 dark:bg-amber-950/20',
    'in-progress': 'bg-blue-50 dark:bg-blue-950/20',
    completed: 'bg-green-50 dark:bg-green-950/20',
}

export const KanbanColumn = ({
    column,
    onTaskClick,
    onAddTask,
    isMobile = false,
    isCompact = false,
    activeFilters = [],
    onToggleFilter,
    onClearFilters,
    hasActiveFilters = false,
    getDragProps,
    getDropZoneProps,
    isDropTarget = false,
    draggedTaskId,
}: KanbanColumnProps) => {
    const dropZoneProps = getDropZoneProps?.(column.id)

    return (
        <div
            className={cn(
                'flex flex-col rounded-xl transition-all duration-200',
                columnBgColors[column.id],
                // Desktop: fixed width with max height, Mobile: full width, Compact: flexible
                isMobile
                    ? 'max-h-[70vh] w-full'
                    : isCompact
                      ? 'max-h-[50vh] min-h-64'
                      : 'max-h-[65vh] max-w-72 min-w-72',
                // Drop target styling
                isDropTarget &&
                    'ring-brand-500 bg-brand-50 dark:bg-brand-950/30 ring-2 ring-inset'
            )}
            {...dropZoneProps}
        >
            {/* Column Header - Hidden on mobile (selector shows it) */}
            {!isMobile && (
                <div
                    className={cn(
                        'flex items-center justify-between',
                        isCompact ? 'p-2' : 'p-3'
                    )}
                >
                    <div className="flex items-center gap-2">
                        <div
                            className={cn(
                                'size-2 rounded-full',
                                columnColors[column.id]
                            )}
                        />
                        <h3
                            className={cn(
                                'font-semibold text-neutral-900 dark:text-white',
                                isCompact && 'text-sm'
                            )}
                        >
                            {column.title}
                        </h3>
                        <span
                            className={cn(
                                'flex items-center justify-center rounded-full text-xs font-medium',
                                'bg-neutral-200 dark:bg-neutral-700',
                                'text-neutral-600 dark:text-neutral-400',
                                isCompact ? 'size-4' : 'size-5'
                            )}
                        >
                            {column.tasks.length}
                        </span>
                    </div>
                    {!isCompact && (
                        <div className="flex items-center gap-1">
                            {/* Priority Filter */}
                            {onToggleFilter && onClearFilters && (
                                <PriorityFilterDropdown
                                    activeFilters={activeFilters}
                                    onToggleFilter={onToggleFilter}
                                    onClearFilters={onClearFilters}
                                    hasActiveFilters={hasActiveFilters}
                                />
                            )}
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
                    )}
                </div>
            )}

            {/* Tasks Container */}
            <div
                className={cn(
                    'kanban-scrollbar flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-2',
                    !isMobile && 'pt-0'
                )}
            >
                {column.tasks.length === 0 ? (
                    <div
                        className={cn(
                            'flex flex-col items-center justify-center py-8',
                            'text-sm text-neutral-400 dark:text-neutral-500',
                            isDropTarget &&
                                'border-brand-400 rounded-lg border-2 border-dashed'
                        )}
                    >
                        <p>
                            {isDropTarget ? 'Hier ablegen' : 'Keine Aufgaben'}
                        </p>
                    </div>
                ) : (
                    column.tasks.map((task) => (
                        <KanbanCard
                            key={task.id}
                            task={task}
                            onClick={() => onTaskClick(task)}
                            dragProps={getDragProps?.(task)}
                            isDragging={draggedTaskId === task.id}
                        />
                    ))
                )}

                {/* Add Task Button */}
                <button
                    onClick={() => onAddTask(column.id)}
                    className={cn(
                        'flex items-center justify-center gap-2 rounded-lg',
                        'border border-dashed',
                        'border-neutral-300 dark:border-neutral-600',
                        'text-sm text-neutral-500 dark:text-neutral-400',
                        'transition-all duration-200',
                        'hover:border-brand-400 hover:text-brand-600',
                        'dark:hover:border-brand-500 dark:hover:text-brand-400',
                        'hover:bg-white/50 dark:hover:bg-neutral-800/50',
                        isCompact ? 'p-2' : 'p-3'
                    )}
                >
                    <Plus className="size-4" />
                    <span className={cn(isCompact && 'sr-only')}>
                        Aufgabe hinzufügen
                    </span>
                </button>
            </div>
        </div>
    )
}
