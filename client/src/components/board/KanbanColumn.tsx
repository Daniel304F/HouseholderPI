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
    pending: 'bg-gradient-to-r from-amber-400 to-orange-400',
    'in-progress': 'bg-gradient-to-r from-blue-400 to-indigo-400',
    completed: 'bg-gradient-to-r from-green-400 to-emerald-400',
}

const columnBgColors: Record<ColumnStatus, string> = {
    pending:
        'bg-gradient-to-b from-amber-50/80 to-amber-50/30 dark:from-amber-950/30 dark:to-amber-950/10',
    'in-progress':
        'bg-gradient-to-b from-blue-50/80 to-blue-50/30 dark:from-blue-950/30 dark:to-blue-950/10',
    completed:
        'bg-gradient-to-b from-green-50/80 to-green-50/30 dark:from-green-950/30 dark:to-green-950/10',
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
                'flex flex-col rounded-2xl transition-all duration-300',
                'border border-neutral-200/50 dark:border-neutral-700/50',
                'shadow-sm',
                columnBgColors[column.id],
                // Desktop: fixed width with max height, Mobile: full width, Compact: flexible
                isMobile
                    ? 'max-h-[70vh] w-full'
                    : isCompact
                      ? 'max-h-[50vh] min-h-64'
                      : 'max-h-[65vh] max-w-72 min-w-72',
                // Drop target styling
                isDropTarget &&
                    'ring-brand-500 bg-brand-50 dark:bg-brand-950/30 scale-[1.02] shadow-lg ring-2 ring-inset'
            )}
            {...dropZoneProps}
        >
            {/* Column Header - Hidden on mobile (selector shows it) */}
            {!isMobile && (
                <div
                    className={cn(
                        'flex items-center justify-between',
                        isCompact ? 'p-3' : 'p-4'
                    )}
                >
                    <div className="flex items-center gap-2.5">
                        <div
                            className={cn(
                                'size-2.5 rounded-full shadow-sm',
                                columnColors[column.id]
                            )}
                        />
                        <h3
                            className={cn(
                                'font-bold text-neutral-800 dark:text-neutral-100',
                                isCompact && 'text-sm'
                            )}
                        >
                            {column.title}
                        </h3>
                        <span
                            className={cn(
                                'flex items-center justify-center rounded-full text-xs font-bold',
                                'bg-white/80 dark:bg-neutral-800/80',
                                'text-neutral-600 dark:text-neutral-300',
                                'border border-neutral-200/50 shadow-sm dark:border-neutral-700/50',
                                isCompact ? 'size-5' : 'size-6'
                            )}
                        >
                            {column.tasks.length}
                        </span>
                    </div>
                    {!isCompact && (
                        <div className="flex items-center gap-1.5">
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
                                    'rounded-lg p-1.5 transition-all duration-200',
                                    'text-neutral-400 hover:text-neutral-600',
                                    'dark:text-neutral-500 dark:hover:text-neutral-300',
                                    'hover:bg-white/70 dark:hover:bg-neutral-800/70',
                                    'active:scale-90'
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
                            'flex flex-col items-center justify-center px-4 py-10',
                            'text-sm text-neutral-400 dark:text-neutral-500',
                            'rounded-xl',
                            isDropTarget
                                ? 'border-brand-400 bg-brand-50/50 dark:bg-brand-950/20 border-2 border-dashed'
                                : 'border border-dashed border-neutral-300 dark:border-neutral-600'
                        )}
                    >
                        <p className="font-medium">
                            {isDropTarget
                                ? '✨ Hier ablegen'
                                : 'Keine Aufgaben'}
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
                        'flex items-center justify-center gap-2 rounded-xl',
                        'border-2 border-dashed',
                        'border-neutral-300/80 dark:border-neutral-600/80',
                        'text-sm font-medium text-neutral-500 dark:text-neutral-400',
                        'transition-all duration-200',
                        'hover:border-brand-400 hover:text-brand-600',
                        'dark:hover:border-brand-500 dark:hover:text-brand-400',
                        'hover:bg-brand-50/50 dark:hover:bg-brand-950/30',
                        'hover:scale-[1.02]',
                        'active:scale-[0.98]',
                        isCompact ? 'p-2.5' : 'p-3.5'
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
