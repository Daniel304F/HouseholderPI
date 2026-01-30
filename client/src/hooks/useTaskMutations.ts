import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tasksApi } from '../api/tasks'
import type { Task } from '../api/tasks'

// Types for mutation data
export interface CreateTaskData {
    title: string
    description?: string
    status: Task['status']
    priority: Task['priority']
    assignedTo?: string | null
    dueDate: string
}

export interface EditTaskData {
    title?: string
    description?: string
    status?: Task['status']
    priority?: Task['priority']
    assignedTo?: string | null
    dueDate?: string
}

interface UseTaskMutationsOptions {
    groupId: string | undefined
    /** Additional query keys to invalidate on success */
    additionalInvalidateKeys?: string[][]
    /** Callbacks */
    onCreateSuccess?: (task: Task) => void
    onUpdateSuccess?: (task: Task) => void
    onDeleteSuccess?: () => void
    onError?: (error: Error, action: 'create' | 'update' | 'delete') => void
}

/**
 * Custom hook for task mutations (create, update, delete)
 * Reduces code duplication across GroupDetail and MyTasks pages
 *
 * @example
 * const { createTask, updateTask, deleteTask } = useTaskMutations({
 *     groupId,
 *     onCreateSuccess: () => setShowModal(false),
 *     onError: (error) => toast.error(error.message)
 * })
 */
export const useTaskMutations = ({
    groupId,
    additionalInvalidateKeys = [],
    onCreateSuccess,
    onUpdateSuccess,
    onDeleteSuccess,
    onError,
}: UseTaskMutationsOptions) => {
    const queryClient = useQueryClient()

    const invalidateTaskQueries = () => {
        // Always invalidate group tasks
        if (groupId) {
            queryClient.invalidateQueries({ queryKey: ['tasks', groupId] })
        }
        // Invalidate user's personal tasks
        queryClient.invalidateQueries({ queryKey: ['myTasks'] })
        // Invalidate any additional queries
        additionalInvalidateKeys.forEach((key) => {
            queryClient.invalidateQueries({ queryKey: key })
        })
    }

    const createTaskMutation = useMutation({
        mutationFn: (data: CreateTaskData) => {
            if (!groupId) throw new Error('groupId is required')
            return tasksApi.createTask(groupId, {
                title: data.title,
                description: data.description,
                status: data.status,
                priority: data.priority,
                assignedTo: data.assignedTo,
                dueDate: data.dueDate,
            })
        },
        onSuccess: (task) => {
            invalidateTaskQueries()
            onCreateSuccess?.(task)
        },
        onError: (error: Error) => {
            onError?.(error, 'create')
        },
    })

    const updateTaskMutation = useMutation({
        mutationFn: ({
            taskId,
            data,
            targetGroupId,
        }: {
            taskId: string
            data: EditTaskData
            targetGroupId?: string
        }) => {
            const gid = targetGroupId || groupId
            if (!gid) throw new Error('groupId is required')
            return tasksApi.updateTask(gid, taskId, data)
        },
        onSuccess: (task) => {
            invalidateTaskQueries()
            onUpdateSuccess?.(task)
        },
        onError: (error: Error) => {
            onError?.(error, 'update')
        },
    })

    const deleteTaskMutation = useMutation({
        mutationFn: ({
            taskId,
            targetGroupId,
        }: {
            taskId: string
            targetGroupId?: string
        }) => {
            const gid = targetGroupId || groupId
            if (!gid) throw new Error('groupId is required')
            return tasksApi.deleteTask(gid, taskId)
        },
        onSuccess: () => {
            invalidateTaskQueries()
            onDeleteSuccess?.()
        },
        onError: (error: Error) => {
            onError?.(error, 'delete')
        },
    })

    const completeTaskMutation = useMutation({
        mutationFn: ({
            taskId,
            targetGroupId,
            proofFile,
            note,
        }: {
            taskId: string
            targetGroupId?: string
            proofFile?: File
            note?: string
        }) => {
            const gid = targetGroupId || groupId
            if (!gid) throw new Error('groupId is required')
            return tasksApi.completeTaskWithProof(gid, taskId, proofFile, note)
        },
        onSuccess: (task) => {
            invalidateTaskQueries()
            onUpdateSuccess?.(task)
        },
        onError: (error: Error) => {
            onError?.(error, 'update')
        },
    })

    return {
        // Mutations
        createTask: createTaskMutation,
        updateTask: updateTaskMutation,
        deleteTask: deleteTaskMutation,
        completeTask: completeTaskMutation,

        // Loading states
        isCreating: createTaskMutation.isPending,
        isUpdating: updateTaskMutation.isPending,
        isDeleting: deleteTaskMutation.isPending,
        isCompleting: completeTaskMutation.isPending,

        // Combined loading state
        isAnyPending:
            createTaskMutation.isPending ||
            updateTaskMutation.isPending ||
            deleteTaskMutation.isPending ||
            completeTaskMutation.isPending,

        // Helper functions for common operations
        createTaskAsync: createTaskMutation.mutateAsync,
        updateTaskAsync: updateTaskMutation.mutateAsync,
        deleteTaskAsync: deleteTaskMutation.mutateAsync,
        completeTaskAsync: completeTaskMutation.mutateAsync,
    }
}

export type TaskMutations = ReturnType<typeof useTaskMutations>
