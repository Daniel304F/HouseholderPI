import { MyTaskCard } from '../tasks'
import type { TaskWithDetails } from '../../api/tasks'
import type { TaskListActions } from './types'

interface GroupedTaskListProps extends TaskListActions {
    tasksByGroup: Record<string, TaskWithDetails[]>
}

export const GroupedTaskList = ({
    tasksByGroup,
    onTaskClick,
    onEditClick,
    onComplete,
}: GroupedTaskListProps) => {
    return (
        <section className="space-y-6">
            {Object.entries(tasksByGroup).map(([groupName, groupTasks]) => (
                <article key={groupName}>
                    <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-neutral-900 dark:text-white">
                        <span className="rounded-lg bg-brand-100 px-2 py-1 text-sm text-brand-700 dark:bg-brand-900/30 dark:text-brand-400">
                            {groupName}
                        </span>
                        <span className="text-sm font-normal text-neutral-500">
                            ({groupTasks.length})
                        </span>
                    </h2>
                    <div className="space-y-3">
                        {groupTasks.map((task) => (
                            <MyTaskCard
                                key={task.id}
                                task={task}
                                onClick={() => onTaskClick(task)}
                                onEditClick={() => onEditClick(task)}
                                onComplete={() => onComplete(task)}
                                subtaskCount={task.subtasks?.length || 0}
                            />
                        ))}
                    </div>
                </article>
            ))}
        </section>
    )
}
