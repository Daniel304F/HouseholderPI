import { cn } from '../../utils/cn'
import {
    KanbanColumn,
    type KanbanColumnData,
    type ColumnStatus,
} from './KanbanColumn'
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
    { id: 'review', title: 'In Review' },
    { id: 'completed', title: 'Completed' },
]

export const KanbanBoard = ({
    tasks,
    onTaskClick,
    onAddTask,
    className,
}: KanbanBoardProps) => {
    // Group tasks by status
    const getColumnData = (columnId: ColumnStatus): KanbanColumnData => {
        // Map 'review' to tasks that might have that status, or filter by other logic
        const columnTasks = tasks.filter((task) => {
            if (columnId === 'review') {
                // For now, we don't have 'review' status in Task, so this column will be empty
                return false
            }
            return task.status === columnId
        })

        return {
            id: columnId,
            title: columns.find((c) => c.id === columnId)?.title || '',
            color: '',
            tasks: columnTasks,
        }
    }

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
