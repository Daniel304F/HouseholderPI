import { useMemo } from 'react'
import { Archive, MoreHorizontal, Plus } from 'lucide-react'
import { cn } from '../../utils/cn'
import { IconButton } from '../common/IconButton'
import { KanbanCard } from './KanbanCard'
import { PriorityFilterDropdown } from './PriorityFilterDropdown'
import type { Task } from '../../api/tasks'
import type { Priority } from '../../hooks/useTaskFilter'

export type ColumnStatus = 'pending' | 'in-progress' | 'completed'

export interface MemberInfo {
    userId: string
    name?: string
    avatar?: string
}

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
    activeFilters?: Priority[]
    onToggleFilter?: (priority: Priority) => void
    onClearFilters?: () => void
    hasActiveFilters?: boolean
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
    members?: MemberInfo[]
    onArchiveCompleted?: () => void
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
    members = [],
    onArchiveCompleted,
}: KanbanColumnProps) => {
    const dropZoneProps = getDropZoneProps?.(column.id)

    const memberInfoById = useMemo(() => {
        const lookup = new Map<string, MemberInfo>()
        for (const member of members) {
            lookup.set(member.userId, member)
        }
        return lookup
    }, [members])

    return (
        <section
            className={cn(
                'flex flex-col rounded-2xl border border-neutral-200/50 shadow-[var(--shadow-sm)] transition-all duration-300',
                'dark:border-neutral-700/50',
                columnBgColors[column.id],
                isMobile
                    ? 'max-h-[70vh] w-full'
                    : isCompact
                      ? 'max-h-[60vh] min-h-64 min-w-56 max-w-64 flex-shrink-0'
                      : 'max-h-[65vh] max-w-72 min-w-72',
                isDropTarget &&
                    'scale-[1.01] bg-brand-50 ring-2 ring-inset ring-brand-500 shadow-[var(--shadow-lg)] dark:bg-brand-950/30'
            )}
            aria-label={column.title}
            {...dropZoneProps}
        >
            {!isMobile && (
                <header
                    className={cn(
                        'flex items-center justify-between',
                        isCompact ? 'p-3' : 'p-4'
                    )}
                >
                    <div className="flex items-center gap-2.5">
                        <span
                            className={cn(
                                'size-2.5 rounded-full shadow-[var(--shadow-sm)]',
                                columnColors[column.id]
                            )}
                            aria-hidden
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
                                'border border-neutral-200/50 bg-white/80 text-neutral-600 shadow-[var(--shadow-sm)]',
                                'dark:border-neutral-700/50 dark:bg-neutral-800/80 dark:text-neutral-300',
                                isCompact ? 'size-5' : 'size-6'
                            )}
                        >
                            {column.tasks.length}
                        </span>
                    </div>

                    {!isCompact && (
                        <div className="flex items-center gap-1.5">
                            {onToggleFilter && onClearFilters && (
                                <PriorityFilterDropdown
                                    activeFilters={activeFilters}
                                    onToggleFilter={onToggleFilter}
                                    onClearFilters={onClearFilters}
                                    hasActiveFilters={hasActiveFilters}
                                />
                            )}
                            {column.id === 'completed' &&
                                column.tasks.length > 0 &&
                                onArchiveCompleted && (
                                    <IconButton
                                        icon={<Archive className="size-4" />}
                                        variant="ghost"
                                        size="sm"
                                        onClick={onArchiveCompleted}
                                        aria-label="Alle erledigten Aufgaben archivieren"
                                        title="Alle archivieren"
                                    />
                                )}
                            <IconButton
                                icon={<MoreHorizontal className="size-4" />}
                                variant="ghost"
                                size="sm"
                                aria-label="Weitere Optionen"
                            />
                        </div>
                    )}
                </header>
            )}

            <div
                className={cn(
                    'kanban-scrollbar flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-2',
                    !isMobile && 'pt-0'
                )}
            >
                {column.tasks.length === 0 ? (
                    <div
                        className={cn(
                            'flex flex-col items-center justify-center rounded-xl px-4 py-10 text-sm text-neutral-400 dark:text-neutral-500',
                            isDropTarget
                                ? 'border-2 border-dashed border-brand-400 bg-brand-50/50 dark:bg-brand-950/20'
                                : 'border border-dashed border-neutral-300 dark:border-neutral-600'
                        )}
                    >
                        <p className="font-medium">
                            {isDropTarget
                                ? 'Hier ablegen'
                                : 'Keine Aufgaben in dieser Spalte'}
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
                            assigneeInfo={
                                task.assignedTo
                                    ? memberInfoById.get(task.assignedTo)
                                    : undefined
                            }
                        />
                    ))
                )}

                <button
                    type="button"
                    onClick={() => onAddTask(column.id)}
                    className={cn(
                        'flex items-center justify-center gap-2 rounded-xl border-2 border-dashed',
                        'border-neutral-300/80 text-sm font-medium text-neutral-500',
                        'transition-all duration-200 ease-out dark:border-neutral-600/80 dark:text-neutral-400',
                        'hover:border-brand-400 hover:bg-brand-50/50 hover:text-brand-600',
                        'dark:hover:border-brand-500 dark:hover:bg-brand-950/30 dark:hover:text-brand-400',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/45',
                        'active:scale-[0.99] active:border-brand-400 active:bg-brand-50/60 active:text-brand-600',
                        isCompact ? 'p-2.5' : 'p-3.5'
                    )}
                >
                    <Plus className="size-4" />
                    <span className={cn(isCompact && 'sr-only')}>
                        Aufgabe hinzufuegen
                    </span>
                </button>
            </div>
        </section>
    )
}
