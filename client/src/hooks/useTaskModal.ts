import { useState, useCallback } from 'react'
import type { Task } from '../api/tasks'
import type { ColumnStatus } from '../components/board'

/**
 * Modal state management for task-related modals
 * Reduces code duplication in pages that manage task creation, editing, and viewing
 *
 * @example
 * const {
 *     selectedTask,
 *     taskToEdit,
 *     showTaskDetail,
 *     showCreateModal,
 *     initialStatus,
 *     openTaskDetail,
 *     openEditModal,
 *     openCreateModal,
 *     closeAll
 * } = useTaskModal()
 */
export const useTaskModal = <T extends Task = Task>() => {
    // State for task detail view
    const [selectedTask, setSelectedTask] = useState<T | null>(null)
    const [showTaskDetail, setShowTaskDetail] = useState(false)

    // State for create task modal
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [initialStatus, setInitialStatus] = useState<ColumnStatus>('pending')

    // State for edit task modal
    const [taskToEdit, setTaskToEdit] = useState<T | null>(null)

    // State for settings modal (group settings, etc.)
    const [showSettingsModal, setShowSettingsModal] = useState(false)

    /**
     * Opens the task detail view for a specific task
     */
    const openTaskDetail = useCallback((task: T) => {
        setSelectedTask(task)
        setShowTaskDetail(true)
    }, [])

    /**
     * Closes the task detail view
     */
    const closeTaskDetail = useCallback(() => {
        setShowTaskDetail(false)
        setSelectedTask(null)
    }, [])

    /**
     * Opens the edit modal for a specific task
     * Optionally closes the detail view first
     */
    const openEditModal = useCallback(
        (task: T, closeDetail = true) => {
            if (closeDetail) {
                setShowTaskDetail(false)
            }
            setTaskToEdit(task)
        },
        []
    )

    /**
     * Closes the edit modal
     */
    const closeEditModal = useCallback(() => {
        setTaskToEdit(null)
    }, [])

    /**
     * Opens the create modal with an optional initial status
     */
    const openCreateModal = useCallback((status: ColumnStatus = 'pending') => {
        setInitialStatus(status)
        setShowCreateModal(true)
    }, [])

    /**
     * Closes the create modal
     */
    const closeCreateModal = useCallback(() => {
        setShowCreateModal(false)
    }, [])

    /**
     * Opens the settings modal
     */
    const openSettingsModal = useCallback(() => {
        setShowSettingsModal(true)
    }, [])

    /**
     * Closes the settings modal
     */
    const closeSettingsModal = useCallback(() => {
        setShowSettingsModal(false)
    }, [])

    /**
     * Closes all modals
     */
    const closeAll = useCallback(() => {
        setShowTaskDetail(false)
        setSelectedTask(null)
        setShowCreateModal(false)
        setTaskToEdit(null)
        setShowSettingsModal(false)
    }, [])

    /**
     * Transition from detail view to edit mode
     */
    const editFromDetail = useCallback(() => {
        if (selectedTask) {
            setShowTaskDetail(false)
            setTaskToEdit(selectedTask)
        }
    }, [selectedTask])

    return {
        // State
        selectedTask,
        taskToEdit,
        showTaskDetail,
        showCreateModal,
        showSettingsModal,
        initialStatus,

        // Actions
        openTaskDetail,
        closeTaskDetail,
        openEditModal,
        closeEditModal,
        openCreateModal,
        closeCreateModal,
        openSettingsModal,
        closeSettingsModal,
        closeAll,
        editFromDetail,

        // Direct setters (for advanced use cases)
        setSelectedTask,
        setTaskToEdit,
        setShowTaskDetail,
        setShowCreateModal,
        setShowSettingsModal,
        setInitialStatus,
    }
}

export type TaskModalState<T extends Task = Task> = ReturnType<
    typeof useTaskModal<T>
>
