import { useState, useCallback, lazy, Suspense } from 'react'
import { useQuery } from '@tanstack/react-query'
import { tasksApi, type TaskWithDetails } from '../../api/tasks'
import { useCompletedTasks, useCompletedTaskStats } from '../../hooks'
import {
    PageHeader,
    StatsGrid,
    EmptyState,
    ErrorState,
    TaskHistorySkeleton,
} from '../../components/page-task-history'
import { Skeleton } from '../../components/feedback'

const TaskHistoryTable = lazy(() =>
    import('../../components/tasks').then((module) => ({
        default: module.TaskHistoryTable,
    }))
)

const TaskDetailView = lazy(() =>
    import('../../components/tasks').then((module) => ({
        default: module.TaskDetailView,
    }))
)

export const TaskHistory = () => {
    // Modal state
    const [selectedTask, setSelectedTask] = useState<TaskWithDetails | null>(null)

    // Fetch all tasks
    const { data: tasks = [], isLoading, isError, refetch } = useQuery({
        queryKey: ['myTasks'],
        queryFn: () => tasksApi.getMyTasks(),
    })

    // Use extracted hooks
    const completedTasks = useCompletedTasks(tasks)
    const stats = useCompletedTaskStats(completedTasks)

    const handleTaskClick = useCallback((task: TaskWithDetails) => {
        setSelectedTask(task)
    }, [])

    if (isLoading) {
        return <TaskHistorySkeleton />
    }

    if (isError) {
        return <ErrorState onRetry={() => refetch()} />
    }

    return (
        <div className="ui-page-enter space-y-6">
            <PageHeader />

            <section className="ui-panel ui-panel-hover p-4 sm:p-5">
                <StatsGrid stats={stats} />
            </section>

            <section className="ui-panel ui-panel-hover p-4 sm:p-5">
                {completedTasks.length === 0 ? (
                    <EmptyState />
                ) : (
                    <Suspense fallback={<Skeleton height={420} className="rounded-xl" />}>
                        <TaskHistoryTable
                            tasks={completedTasks}
                            onTaskClick={handleTaskClick}
                            maxVisible={50}
                        />
                    </Suspense>
                )}
            </section>

            {selectedTask && (
                <Suspense fallback={<Skeleton height={320} className="rounded-xl" />}>
                    <TaskDetailView
                        groupId={selectedTask.groupId}
                        taskId={selectedTask.id}
                        onClose={() => setSelectedTask(null)}
                        readOnly
                    />
                </Suspense>
            )}
        </div>
    )
}
