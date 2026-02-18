import { useMemo, useState } from 'react'
import { cn } from '../../utils/cn'
import { useViewport } from '../../hooks/useViewport'
import { useTaskFilter } from '../../hooks/useTaskFilter'
import {
    useKanbanDragDrop,
    type ColumnStatus,
} from '../../hooks/useKanbanDragDrop'
import { KanbanColumn, type KanbanColumnData } from './KanbanColumn'
import { ColumnSelector } from './ColumnSelector'
import type { Task } from '../../api/tasks'

export interface MemberInfo {
    userId: string
    name?: string
    avatar?: string
}

interface KanbanBoardProps {
    tasks: Task[]
    onTaskClick: (task: Task) => void
    onAddTask: (status: ColumnStatus) => void
    onTaskMove?: (taskId: string, newStatus: ColumnStatus) => Promise<void>
    searchQuery?: string
    className?: string
    members?: MemberInfo[]
    onArchiveCompleted?: () => void
}

const COLUMN_DEFINITIONS: { id: ColumnStatus; title: string }[] = [
    { id: 'pending', title: 'To Do' },
    { id: 'in-progress', title: 'In Progress' },
    { id: 'completed', title: 'Completed' },
]

const NOOP_TASK_MOVE = async () => {}

export const KanbanBoard = ({
    tasks,
    onTaskClick,
    onAddTask,
    onTaskMove,
    searchQuery = '',
    className,
    members = [],
    onArchiveCompleted,
}: KanbanBoardProps) => {
    const { isMobile, isTablet } = useViewport()
    const [activeColumn, setActiveColumn] = useState<ColumnStatus>('pending')

    const {
        getFilteredTasksForColumn,
        toggleColumnFilter,
        clearColumnFilter,
        hasActiveFilters,
        columnFilters,
    } = useTaskFilter({ tasks, searchQuery })

    const { dragState, getDragProps, getDropZoneProps, isDropTarget, isUpdating } =
        useKanbanDragDrop({
            onTaskMove: onTaskMove ?? NOOP_TASK_MOVE,
        })

    const columnDataById = useMemo<Record<ColumnStatus, KanbanColumnData>>(
        () => ({
            pending: {
                id: 'pending',
                title: 'To Do',
                color: '',
                tasks: getFilteredTasksForColumn('pending'),
            },
            'in-progress': {
                id: 'in-progress',
                title: 'In Progress',
                color: '',
                tasks: getFilteredTasksForColumn('in-progress'),
            },
            completed: {
                id: 'completed',
                title: 'Completed',
                color: '',
                tasks: getFilteredTasksForColumn('completed'),
            },
        }),
        [getFilteredTasksForColumn]
    )

    const columnsWithCounts = useMemo(
        () =>
            COLUMN_DEFINITIONS.map((column) => ({
                ...column,
                taskCount: columnDataById[column.id].tasks.length,
            })),
        [columnDataById]
    )

    if (isMobile) {
        return (
            <div className={cn('flex flex-col gap-4', className)}>
                <ColumnSelector
                    columns={columnsWithCounts}
                    activeColumn={activeColumn}
                    onColumnChange={setActiveColumn}
                />

                <div className="min-h-0 flex-1">
                    <KanbanColumn
                        column={columnDataById[activeColumn]}
                        onTaskClick={onTaskClick}
                        onAddTask={onAddTask}
                        isMobile
                        activeFilters={columnFilters[activeColumn] || []}
                        onToggleFilter={(priority) =>
                            toggleColumnFilter(activeColumn, priority)
                        }
                        onClearFilters={() => clearColumnFilter(activeColumn)}
                        hasActiveFilters={hasActiveFilters(activeColumn)}
                        getDragProps={getDragProps}
                        getDropZoneProps={getDropZoneProps}
                        isDropTarget={isDropTarget(activeColumn)}
                        draggedTaskId={dragState.draggedTask?.id}
                        members={members}
                        onArchiveCompleted={onArchiveCompleted}
                    />
                </div>
            </div>
        )
    }

    if (isTablet) {
        return (
            <div
                className={cn(
                    'flex h-full snap-x snap-mandatory gap-3 overflow-x-auto pb-2',
                    '-mx-4 px-4',
                    className,
                    isUpdating && 'pointer-events-none opacity-70'
                )}
            >
                {COLUMN_DEFINITIONS.map((column) => (
                    <KanbanColumn
                        key={column.id}
                        column={columnDataById[column.id]}
                        onTaskClick={onTaskClick}
                        onAddTask={onAddTask}
                        isCompact
                        activeFilters={columnFilters[column.id] || []}
                        onToggleFilter={(priority) =>
                            toggleColumnFilter(column.id, priority)
                        }
                        onClearFilters={() => clearColumnFilter(column.id)}
                        hasActiveFilters={hasActiveFilters(column.id)}
                        getDragProps={getDragProps}
                        getDropZoneProps={getDropZoneProps}
                        isDropTarget={isDropTarget(column.id)}
                        draggedTaskId={dragState.draggedTask?.id}
                        members={members}
                        onArchiveCompleted={onArchiveCompleted}
                    />
                ))}
            </div>
        )
    }

    return (
        <div
            className={cn(
                'flex h-full snap-x snap-mandatory gap-4 overflow-x-auto',
                '-mx-4 px-4 sm:-mx-6 sm:px-6',
                className,
                isUpdating && 'pointer-events-none opacity-70'
            )}
        >
            {COLUMN_DEFINITIONS.map((column) => (
                <KanbanColumn
                    key={column.id}
                    column={columnDataById[column.id]}
                    onTaskClick={onTaskClick}
                    onAddTask={onAddTask}
                    activeFilters={columnFilters[column.id] || []}
                    onToggleFilter={(priority) =>
                        toggleColumnFilter(column.id, priority)
                    }
                    onClearFilters={() => clearColumnFilter(column.id)}
                    hasActiveFilters={hasActiveFilters(column.id)}
                    getDragProps={getDragProps}
                    getDropZoneProps={getDropZoneProps}
                    isDropTarget={isDropTarget(column.id)}
                    draggedTaskId={dragState.draggedTask?.id}
                    members={members}
                    onArchiveCompleted={onArchiveCompleted}
                />
            ))}
        </div>
    )
}
