import { useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { tasksApi, type TaskWithDetails, type Task } from '../../api/tasks'
import { groupsApi, type GroupMember } from '../../api/groups'
import { TaskHistoryTable, TaskDetailView, EditTaskModal } from '../../components/tasks'
import { useToast } from '../../contexts/ToastContext'
import {
    useCompletedTasks,
    useCompletedTaskStats,
    PageHeader,
    StatsGrid,
    EmptyState,
    ErrorState,
    TaskHistorySkeleton,
} from './task-history'

export const TaskHistory = () => {
    const toast = useToast()

    // Modal state
    const [selectedTask, setSelectedTask] = useState<TaskWithDetails | null>(null)
    const [taskToEdit, setTaskToEdit] = useState<TaskWithDetails | null>(null)
    const [groupMembers, setGroupMembers] = useState<GroupMember[]>([])

    // Fetch all tasks
    const { data: tasks = [], isLoading, isError, refetch } = useQuery({
        queryKey: ['myTasks'],
        queryFn: () => tasksApi.getMyTasks(),
    })

    // Use extracted hooks
    const completedTasks = useCompletedTasks(tasks)
    const stats = useCompletedTaskStats(completedTasks)

    // Event handlers
    const loadGroupMembers = useCallback(async (groupId: string) => {
        try {
            const group = await groupsApi.getGroup(groupId)
            setGroupMembers(group.members)
        } catch {
            setGroupMembers([])
        }
    }, [])

    const handleTaskClick = useCallback((task: TaskWithDetails) => {
        setSelectedTask(task)
    }, [])

    const handleEditClick = useCallback(async (task: TaskWithDetails) => {
        await loadGroupMembers(task.groupId)
        setTaskToEdit(task)
        setSelectedTask(null)
    }, [loadGroupMembers])

    const handleUpdateTask = useCallback(async (taskId: string, data: Partial<Task>) => {
        if (!taskToEdit) return
        try {
            await tasksApi.updateTask(taskToEdit.groupId, taskId, data)
            refetch()
            setTaskToEdit(null)
            toast.success('Aufgabe aktualisiert!')
        } catch {
            toast.error('Aufgabe konnte nicht aktualisiert werden')
        }
    }, [taskToEdit, refetch, toast])

    const handleDeleteTask = useCallback(async (taskId: string) => {
        if (!taskToEdit) return
        try {
            await tasksApi.deleteTask(taskToEdit.groupId, taskId)
            refetch()
            setTaskToEdit(null)
            toast.success('Aufgabe gelöscht')
        } catch {
            toast.error('Aufgabe konnte nicht gelöscht werden')
        }
    }, [taskToEdit, refetch, toast])

    if (isLoading) {
        return <TaskHistorySkeleton />
    }

    if (isError) {
        return <ErrorState onRetry={() => refetch()} />
    }

    return (
        <div className="space-y-6">
            <PageHeader />

            <StatsGrid
                total={stats.total}
                high={stats.high}
                medium={stats.medium}
                low={stats.low}
            />

            {completedTasks.length === 0 ? (
                <EmptyState />
            ) : (
                <TaskHistoryTable
                    tasks={completedTasks}
                    onTaskClick={handleTaskClick}
                    maxVisible={50}
                />
            )}

            {selectedTask && (
                <TaskDetailView
                    groupId={selectedTask.groupId}
                    taskId={selectedTask.id}
                    onClose={() => setSelectedTask(null)}
                    onEditClick={() => handleEditClick(selectedTask)}
                />
            )}

            {taskToEdit && (
                <EditTaskModal
                    task={taskToEdit}
                    onClose={() => setTaskToEdit(null)}
                    onSubmit={handleUpdateTask}
                    onDelete={handleDeleteTask}
                    members={groupMembers}
                />
            )}
        </div>
    )
}
