import { useState } from 'react'
import { cn } from '../../utils/cn'
import { useViewport } from '../../hooks/useViewport'
import {
    KanbanColumn,
    type KanbanColumnData,
    type ColumnStatus,
} from './KanbanColumn'
import { ColumnSelector } from './ColumnSelector'
import type { Task } from '../tasks'

interface KanbanBoardProps {
    tasks: Task[]
    onTaskClick: (task: Task) => void
    onAddTask: (status: ColumnStatus) => void
    className?: string
}

const columns: { id: ColumnStatus; title: string }[] = [
    { id: 'pending', title: 'To Do' },
    { id: 'in-progress', title: 'In Progress' },
    { id: 'completed', title: 'Completed' },
]

export const KanbanBoard = ({
    tasks,
    onTaskClick,
    onAddTask,
    className,
}: KanbanBoardProps) => {
    const { isMobile, isTablet } = useViewport()
    const [activeColumn, setActiveColumn] = useState<ColumnStatus>('pending')

    // Group tasks by status
    const getColumnData = (columnId: ColumnStatus): KanbanColumnData => {
        const columnTasks = tasks.filter((task) => task.status === columnId)

        return {
            id: columnId,
            title: columns.find((c) => c.id === columnId)?.title || '',
            color: '',
            tasks: columnTasks,
        }
    }

    // Get task counts for column selector
    const columnsWithCounts = columns.map((col) => ({
        ...col,
        taskCount: getColumnData(col.id).tasks.length,
    }))

    // Mobile View: Single column with selector
    if (isMobile) {
        return (
            <div className={cn('flex flex-col gap-4', className)}>
                {/* Column Selector */}
                <ColumnSelector
                    columns={columnsWithCounts}
                    activeColumn={activeColumn}
                    onColumnChange={setActiveColumn}
                />

                {/* Single Column Display */}
                <div className="min-h-0 flex-1">
                    <KanbanColumn
                        column={getColumnData(activeColumn)}
                        onTaskClick={onTaskClick}
                        onAddTask={onAddTask}
                        isMobile
                    />
                </div>
            </div>
        )
    }

    // Tablet View: 2x2 Grid with scroll
    if (isTablet) {
        return (
            <div className={cn('flex flex-col gap-4', className)}>
                <div className="grid grid-cols-2 gap-3">
                    {columns.map((column) => (
                        <KanbanColumn
                            key={column.id}
                            column={getColumnData(column.id)}
                            onTaskClick={onTaskClick}
                            onAddTask={onAddTask}
                            isCompact
                        />
                    ))}
                </div>
            </div>
        )
    }

    // Desktop View: All columns horizontal
    return (
        <div
            className={cn(
                'flex gap-4 overflow-x-auto pb-4',
                '-mx-4 px-4 sm:-mx-6 sm:px-6',
                className
            )}
        >
            {columns.map((column) => (
                <KanbanColumn
                    key={column.id}
                    column={getColumnData(column.id)}
                    onTaskClick={onTaskClick}
                    onAddTask={onAddTask}
                />
            ))}
        </div>
    )
}
