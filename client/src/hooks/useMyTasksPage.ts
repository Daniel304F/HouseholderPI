import { useCallback, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { groupsApi, type GroupMember } from '../api/groups'
import { tasksApi, type Task, type TaskWithDetails } from '../api/tasks'
import { DEFAULT_MY_TASKS_SORT, type SortOption, type StatusFilter } from '../constants/myTasks.constants'
import { useToast } from '../contexts/ToastContext'
import { useFilteredTasks, useTaskStats, useTasksByGroup } from './useMyTasks'

export const useMyTasksPage = () => {
    const queryClient = useQueryClient()
    const toast = useToast()

    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<StatusFilter | null>(null)
    const [sortBy, setSortBy] = useState<SortOption>(DEFAULT_MY_TASKS_SORT)
    const [showFilters, setShowFilters] = useState(true)
    const [selectedTask, setSelectedTask] = useState<TaskWithDetails | null>(null)
    const [taskToEdit, setTaskToEdit] = useState<TaskWithDetails | null>(null)
    const [groupMembers, setGroupMembers] = useState<GroupMember[]>([])

    const { data: tasks = [], isLoading, isError } = useQuery({
        queryKey: ['myTasks'],
        queryFn: () => tasksApi.getMyTasks(),
    })

    const filteredTasks = useFilteredTasks(tasks, searchQuery, statusFilter, sortBy)
    const stats = useTaskStats(tasks)
    const tasksByGroup = useTasksByGroup(filteredTasks)

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

    const loadGroupMembers = useCallback(async (groupId: string) => {
        try {
            const group = await groupsApi.getGroup(groupId)
            setGroupMembers(group.members)
        } catch {
            setGroupMembers([])
        }
    }, [])

    const retry = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: ['myTasks'] })
    }, [queryClient])

    const toggleFilters = useCallback(() => {
        setShowFilters((prev) => !prev)
    }, [])

    const handleTaskClick = useCallback((task: TaskWithDetails) => {
        setSelectedTask(task)
    }, [])

    const closeTaskDetail = useCallback(() => {
        setSelectedTask(null)
    }, [])

    const closeEditModal = useCallback(() => {
        setTaskToEdit(null)
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

    return {
        searchQuery,
        setSearchQuery,
        statusFilter,
        setStatusFilter,
        sortBy,
        setSortBy,
        showFilters,
        toggleFilters,
        filteredTasks,
        stats,
        tasksByGroup,
        isLoading,
        isError,
        retry,
        selectedTask,
        closeTaskDetail,
        taskToEdit,
        closeEditModal,
        groupMembers,
        handleTaskClick,
        handleEditClick,
        handleCompleteTask,
        handleUpdateTask,
        handleDeleteTask,
    }
}
