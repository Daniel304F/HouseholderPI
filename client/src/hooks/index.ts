// Custom hooks for the application
export { useSidebar } from './useSidebar'
export { useViewport, type ViewportSize } from './useViewport'
export { useTaskFilter, type Priority, type ColumnFilters } from './useTaskFilter'
export { useKanbanDragDrop, type DragState } from './useKanbanDragDrop'
export { useKeyboardShortcut } from './useKeyboardShortcut'

// Task-related hooks
export {
    useTaskMutations,
    type CreateTaskData,
    type EditTaskData,
    type TaskMutations,
} from './useTaskMutations'
export { useTaskModal, type TaskModalState } from './useTaskModal'

// Page-specific hooks
export { useFriendsMutations } from './useFriendsMutations'
export {
    useFilteredTasks,
    useTaskStats,
    useTasksByGroup,
    type StatusFilter,
    type SortOption,
} from './useMyTasks'
export { useCompletedTasks, useCompletedTaskStats } from './useTaskHistory'
