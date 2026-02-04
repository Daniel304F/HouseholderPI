import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tasksApi, type TaskWithDetails, type Task } from '../../api/tasks'
import { groupsApi, type GroupMember } from '../../api/groups'
import { TaskDetailView, EditTaskModal } from '../../components/tasks'
import { useToast } from '../../contexts/ToastContext'
import {
    useFilteredTasks,
    useTaskStats,
    useTasksByGroup,
    type StatusFilter,
    type SortOption,
} from '../../hooks'
import {
    PageHeader,
    TaskStatsGrid,
    FilterSection,
    GroupedTaskList,
    FlatTaskList,
    EmptyState,
    ErrorState,
    MyTasksSkeleton,
} from '../../components/page-my-tasks'

export const MyTasks = () => {
    const queryClient = useQueryClient()
    const toast = useToast()

    // Filter state
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<StatusFilter | null>(null)
    const [sortBy, setSortBy] = useState<SortOption>('dueDate')
    const [showFilters, setShowFilters] = useState(true)

    // Modal state
    const [selectedTask, setSelectedTask] = useState<TaskWithDetails | null>(null)
    const [taskToEdit, setTaskToEdit] = useState<TaskWithDetails | null>(null)
    const [groupMembers, setGroupMembers] = useState<GroupMember[]>([])

    // Fetch tasks
    const { data: tasks = [], isLoading, isError } = useQuery({
        queryKey: ['myTasks'],
        queryFn: () => tasksApi.getMyTasks(),
    })

    // Computed values using extracted hooks
    const filteredTasks = useFilteredTasks(tasks, searchQuery, statusFilter, sortBy)
    const stats = useTaskStats(tasks)
    const tasksByGroup = useTasksByGroup(filteredTasks)

    // Mutations
    const updateTaskMutation = useMutation({
        mutationFn: ({ groupId, taskId, data }: { groupId: string; taskId: string; data: Partial<Task> }) =>
            tasksApi.updateTask(groupId, taskId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['myTasks'] })
            setTaskToEdit(null)
            toast.success('Aufgabe aktualisiert!')
        },
        onError: () => {
            toast.error('Aufgabe konnte nicht aktualisiert werden')
        },
    })

    const completeTaskMutation = useMutation({
        mutationFn: ({ groupId, taskId }: { groupId: string; taskId: string }) =>
            tasksApi.completeTaskWithProof(groupId, taskId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['myTasks'] })
            toast.success('Aufgabe erledigt!')
        },
        onError: () => {
            toast.error('Aufgabe konnte nicht abgeschlossen werden')
        },
    })

    const deleteTaskMutation = useMutation({
        mutationFn: ({ groupId, taskId }: { groupId: string; taskId: string }) =>
            tasksApi.deleteTask(groupId, taskId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['myTasks'] })
            setTaskToEdit(null)
            toast.success('Aufgabe gelöscht')
        },
        onError: () => {
            toast.error('Aufgabe konnte nicht gelöscht werden')
        },
    })

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

    const handleCompleteTask = useCallback(async (task: TaskWithDetails) => {
        await completeTaskMutation.mutateAsync({
            groupId: task.groupId,
            taskId: task.id,
        })
    }, [completeTaskMutation])

    const handleUpdateTask = useCallback(async (taskId: string, data: Partial<Task>) => {
        if (!taskToEdit) return
        await updateTaskMutation.mutateAsync({
            groupId: taskToEdit.groupId,
            taskId,
            data,
        })
    }, [taskToEdit, updateTaskMutation])

    const handleDeleteTask = useCallback(async (taskId: string) => {
        if (!taskToEdit) return
        await deleteTaskMutation.mutateAsync({
            groupId: taskToEdit.groupId,
            taskId,
        })
    }, [taskToEdit, deleteTaskMutation])

    // Loading state
    if (isLoading) {
        return <MyTasksSkeleton />
    }

    // Error state
    if (isError) {
        return (
            <ErrorState
                onRetry={() => queryClient.invalidateQueries({ queryKey: ['myTasks'] })}
            />
        )
    }

    return (
        <div className="space-y-6">
            <PageHeader />

            <TaskStatsGrid stats={stats} />

            <FilterSection
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                sortBy={sortBy}
                onSortChange={setSortBy}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                showFilters={showFilters}
                onToggleFilters={() => setShowFilters(!showFilters)}
            />

            {filteredTasks.length === 0 ? (
                <EmptyState hasFilters={!!searchQuery || statusFilter !== null} />
            ) : sortBy === 'groupName' ? (
                <GroupedTaskList
                    tasksByGroup={tasksByGroup}
                    onTaskClick={handleTaskClick}
                    onEditClick={handleEditClick}
                    onComplete={handleCompleteTask}
                />
            ) : (
                <FlatTaskList
                    tasks={filteredTasks}
                    onTaskClick={handleTaskClick}
                    onEditClick={handleEditClick}
                    onComplete={handleCompleteTask}
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
