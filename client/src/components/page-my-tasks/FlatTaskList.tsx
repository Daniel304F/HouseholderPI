import type { TaskWithDetails } from '../../api/tasks'
import { MyTaskCard } from '../tasks'
import type { TaskListActions } from './types'

interface FlatTaskListProps extends TaskListActions {
    tasks: TaskWithDetails[]
}

export const FlatTaskList = ({
    tasks,
    onTaskClick,
    onEditClick,
    onComplete,
}: FlatTaskListProps) => {
    return (
        <section className="space-y-3">
            {tasks.map((task) => (
                <MyTaskCard
                    key={task.id}
                    task={task}
                    onClick={() => onTaskClick(task)}
                    onEditClick={() => onEditClick(task)}
                    onComplete={() => onComplete(task)}
                    showGroupBadge
                    groupName={task.groupName}
                    subtaskCount={task.subtasks?.length || 0}
                />
            ))}
        </section>
    )
}
