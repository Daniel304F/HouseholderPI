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
        'bg-gradient-to-b from-amber-50/80 to-amber-50/35 dark:from-amber-950/30 dark:to-amber-950/10',
    'in-progress':
        'bg-gradient-to-b from-blue-50/80 to-blue-50/35 dark:from-blue-950/30 dark:to-blue-950/10',
    completed:
        'bg-gradient-to-b from-green-50/80 to-green-50/35 dark:from-green-950/30 dark:to-green-950/10',
}

const columnGlowColors: Record<ColumnStatus, string> = {
    pending: 'bg-amber-300/40 dark:bg-amber-700/30',
    'in-progress': 'bg-blue-300/40 dark:bg-blue-700/30',
    completed: 'bg-green-300/40 dark:bg-green-700/30',
}

const columnCountColors: Record<ColumnStatus, string> = {
    pending:
        'bg-amber-200/90 text-amber-800 dark:bg-amber-900/55 dark:text-amber-200',
    'in-progress':
        'bg-blue-200/90 text-blue-800 dark:bg-blue-900/55 dark:text-blue-200',
    completed:
        'bg-green-200/90 text-green-800 dark:bg-green-900/55 dark:text-green-200',
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
                'relative isolate flex flex-col overflow-hidden rounded-2xl border border-neutral-200/55 shadow-[var(--shadow-sm)] transition-all duration-300',
                'dark:border-neutral-700/55',
                columnBgColors[column.id],
                isMobile
                    ? 'max-h-[72vh] w-full'
                    : isCompact
                      ? 'max-h-[60vh] min-h-64 min-w-56 max-w-64 flex-shrink-0 snap-start'
                      : 'max-h-[65vh] max-w-72 min-w-72 snap-start',
                isDropTarget &&
                    'scale-[1.01] border-brand-400 bg-brand-50/85 ring-2 ring-inset ring-brand-500 shadow-[var(--shadow-lg)] dark:bg-brand-950/35'
            )}
            aria-label={column.title}
            {...dropZoneProps}
        >
            <span
                aria-hidden
                className={cn(
                    'pointer-events-none absolute -right-16 -top-16 size-44 rounded-full blur-3xl',
                    columnGlowColors[column.id]
                )}
            />
            <span
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/25 via-transparent to-transparent dark:from-white/[0.03]"
            />

            {!isMobile && (
                <header
                    className={cn(
                        'relative z-10 flex items-center justify-between border-b border-white/65 bg-white/35 backdrop-blur-sm dark:border-neutral-700/60 dark:bg-neutral-900/20',
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
                                'flex min-w-6 items-center justify-center rounded-full px-1.5 text-xs font-bold',
                                columnCountColors[column.id]
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
                    'kanban-scrollbar relative z-10 flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto p-2.5',
                    !isMobile && 'pt-2.5'
                )}
            >
                {column.tasks.length === 0 ? (
                    <div
                        className={cn(
                            'rounded-xl px-4 py-10 text-center text-sm text-neutral-500 dark:text-neutral-400',
                            'backdrop-blur-[1px]',
                            isDropTarget
                                ? 'border-2 border-dashed border-brand-400 bg-brand-50/70 dark:bg-brand-950/25'
                                : 'border border-dashed border-neutral-300/80 bg-white/45 dark:border-neutral-600/80 dark:bg-neutral-900/25'
                        )}
                    >
                        <p className="font-medium">
                            {isDropTarget
                                ? 'Hier ablegen'
                                : 'Keine Aufgaben in dieser Spalte'}
                        </p>
                        <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
                            Ziehe eine Aufgabe hierhin oder erstelle eine neue.
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
                        'group/add flex items-center justify-center gap-2 rounded-xl border-2 border-dashed',
                        'border-neutral-300/80 bg-white/45 text-sm font-medium text-neutral-600 backdrop-blur-[1px]',
                        'transition-all duration-200 ease-out dark:border-neutral-600/80 dark:bg-neutral-900/25 dark:text-neutral-400',
                        'hover:border-brand-400 hover:bg-brand-50/65 hover:text-brand-700',
                        'dark:hover:border-brand-500 dark:hover:bg-brand-950/35 dark:hover:text-brand-300',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/45',
                        'active:scale-[0.99] active:border-brand-400 active:bg-brand-50/70 active:text-brand-700',
                        isCompact ? 'p-2.5' : 'p-3.5'
                    )}
                >
                    <span className="flex size-5 items-center justify-center rounded-full bg-white/75 text-brand-600 transition-colors duration-200 dark:bg-neutral-800/75 dark:text-brand-400 group-hover/add:bg-brand-100 dark:group-hover/add:bg-brand-900/50">
                        <Plus className="size-3.5" />
                    </span>
                    <span className={cn(isCompact && 'sr-only')}>
                        Aufgabe hinzufuegen
                    </span>
                </button>
            </div>
        </section>
    )
}
