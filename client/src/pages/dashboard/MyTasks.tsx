import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    ClipboardList,
    Filter,
    Search,
    CheckCircle2,
    Clock,
    Circle,
    AlertCircle,
    ChevronDown,
} from 'lucide-react'
import { cn } from '../../utils/cn'
import { Button } from '../../components/Button'
import {
    MyTaskCard,
    TaskDetailView,
    EditTaskModal,
    type EditTaskData,
    type Task,
} from '../../components/tasks'
import { tasksApi, type TaskWithDetails } from '../../api/tasks'
import { groupsApi, type GroupMember } from '../../api/groups'

type StatusFilter = 'all' | 'pending' | 'in-progress' | 'completed'
type SortOption = 'dueDate' | 'priority' | 'status' | 'groupName'

const statusFilters: {
    value: StatusFilter
    label: string
    icon: typeof Circle
}[] = [
    { value: 'all', label: 'Alle', icon: ClipboardList },
    { value: 'pending', label: 'Offen', icon: Circle },
    { value: 'in-progress', label: 'In Bearbeitung', icon: Clock },
    { value: 'completed', label: 'Erledigt', icon: CheckCircle2 },
]

const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'dueDate', label: 'Fälligkeit' },
    { value: 'priority', label: 'Priorität' },
    { value: 'status', label: 'Status' },
    { value: 'groupName', label: 'Gruppe' },
]

const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 }
const statusOrder: Record<string, number> = {
    'in-progress': 0,
    pending: 1,
    completed: 2,
}

export const MyTasks = () => {
    const queryClient = useQueryClient()
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
    const [sortBy, setSortBy] = useState<SortOption>('dueDate')
    const [selectedTask, setSelectedTask] = useState<TaskWithDetails | null>(
        null
    )
    const [taskToEdit, setTaskToEdit] = useState<TaskWithDetails | null>(null)
    const [showFilters, setShowFilters] = useState(false)
    const [groupMembers, setGroupMembers] = useState<GroupMember[]>([])

    const {
        data: tasks = [],
        isLoading,
        isError,
    } = useQuery({
        queryKey: ['myTasks'],
        queryFn: () => tasksApi.getMyTasks(),
    })

    const updateTaskMutation = useMutation({
        mutationFn: ({
            groupId,
            taskId,
            data,
        }: {
            groupId: string
            taskId: string
            data: EditTaskData
        }) => tasksApi.updateTask(groupId, taskId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['myTasks'] })
            setTaskToEdit(null)
        },
    })

    const completeTaskMutation = useMutation({
        mutationFn: ({
            groupId,
            taskId,
        }: {
            groupId: string
            taskId: string
        }) => tasksApi.completeTaskWithProof(groupId, taskId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['myTasks'] })
        },
    })

    const deleteTaskMutation = useMutation({
        mutationFn: ({
            groupId,
            taskId,
        }: {
            groupId: string
            taskId: string
        }) => tasksApi.deleteTask(groupId, taskId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['myTasks'] })
            setTaskToEdit(null)
        },
    })

    // Load group members when task is selected for editing
    const loadGroupMembers = async (groupId: string) => {
        try {
            const group = await groupsApi.getGroup(groupId)
            setGroupMembers(group.members)
        } catch {
            setGroupMembers([])
        }
    }

    const handleTaskClick = (task: TaskWithDetails) => {
        setSelectedTask(task)
    }

    const handleEditClick = async (task: TaskWithDetails) => {
        await loadGroupMembers(task.groupId)
        setTaskToEdit(task)
        setSelectedTask(null)
    }

    const handleCompleteTask = async (task: TaskWithDetails) => {
        await completeTaskMutation.mutateAsync({
            groupId: task.groupId,
            taskId: task.id,
        })
    }

    const handleUpdateTask = async (taskId: string, data: EditTaskData) => {
        if (!taskToEdit) return
        await updateTaskMutation.mutateAsync({
            groupId: taskToEdit.groupId,
            taskId,
            data,
        })
    }

    const handleDeleteTask = async (taskId: string) => {
        if (!taskToEdit) return
        await deleteTaskMutation.mutateAsync({
            groupId: taskToEdit.groupId,
            taskId,
        })
    }

    // Filter and sort tasks
    const filteredTasks = tasks
        .filter((task) => {
            // Status filter
            if (statusFilter !== 'all' && task.status !== statusFilter)
                return false
            // Search filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase()
                return (
                    task.title.toLowerCase().includes(query) ||
                    task.description?.toLowerCase().includes(query) ||
                    task.groupName?.toLowerCase().includes(query)
                )
            }
            return true
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'dueDate':
                    return (
                        new Date(a.dueDate).getTime() -
                        new Date(b.dueDate).getTime()
                    )
                case 'priority':
                    return priorityOrder[a.priority] - priorityOrder[b.priority]
                case 'status':
                    return statusOrder[a.status] - statusOrder[b.status]
                case 'groupName':
                    return (a.groupName || '').localeCompare(b.groupName || '')
                default:
                    return 0
            }
        })

    // Group tasks by group for display
    const tasksByGroup = filteredTasks.reduce(
        (acc, task) => {
            const groupName = task.groupName || 'Unbekannte Gruppe'
            if (!acc[groupName]) {
                acc[groupName] = []
            }
            acc[groupName].push(task)
            return acc
        },
        {} as Record<string, TaskWithDetails[]>
    )

    const totalCount = tasks.length
    const pendingCount = tasks.filter((t) => t.status === 'pending').length
    const inProgressCount = tasks.filter(
        (t) => t.status === 'in-progress'
    ).length
    const completedCount = tasks.filter((t) => t.status === 'completed').length

    if (isLoading) {
        return (
            <div className="space-y-6">
                {/* Header Skeleton */}
                <div className="flex items-center justify-between">
                    <div className="h-8 w-48 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-700" />
                    <div className="h-10 w-32 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-700" />
                </div>
                {/* Cards Skeleton */}
                <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-24 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-700"
                        />
                    ))}
                </div>
            </div>
        )
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 py-12">
                <AlertCircle className="text-error-500 size-12" />
                <p className="text-neutral-500 dark:text-neutral-400">
                    Aufgaben konnten nicht geladen werden.
                </p>
                <Button
                    onClick={() =>
                        queryClient.invalidateQueries({ queryKey: ['myTasks'] })
                    }
                >
                    Erneut versuchen
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                        Meine Aufgaben
                    </h1>
                    <p className="mt-1 text-neutral-500 dark:text-neutral-400">
                        Alle Aufgaben, die dir zugewiesen sind
                    </p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-800">
                    <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400">
                        <ClipboardList className="size-4" />
                        <span className="text-sm">Gesamt</span>
                    </div>
                    <p className="mt-1 text-2xl font-bold text-neutral-900 dark:text-white">
                        {totalCount}
                    </p>
                </div>
                <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-800">
                    <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400">
                        <Circle className="size-4" />
                        <span className="text-sm">Offen</span>
                    </div>
                    <p className="text-warning-600 dark:text-warning-400 mt-1 text-2xl font-bold">
                        {pendingCount}
                    </p>
                </div>
                <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-800">
                    <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400">
                        <Clock className="size-4" />
                        <span className="text-sm">In Bearbeitung</span>
                    </div>
                    <p className="text-info-600 dark:text-info-400 mt-1 text-2xl font-bold">
                        {inProgressCount}
                    </p>
                </div>
                <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-800">
                    <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400">
                        <CheckCircle2 className="size-4" />
                        <span className="text-sm">Erledigt</span>
                    </div>
                    <p className="text-success-600 dark:text-success-400 mt-1 text-2xl font-bold">
                        {completedCount}
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-400" />
                        <input
                            type="text"
                            placeholder="Aufgaben suchen..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={cn(
                                'w-full rounded-lg border py-2 pr-4 pl-10',
                                'border-neutral-300 dark:border-neutral-600',
                                'bg-white dark:bg-neutral-800',
                                'text-neutral-900 dark:text-white',
                                'placeholder-neutral-400 dark:placeholder-neutral-500',
                                'focus:border-brand-500 focus:ring-brand-500/20 focus:ring-2',
                                'transition-colors'
                            )}
                        />
                    </div>

                    {/* Sort */}
                    <div className="relative">
                        <select
                            value={sortBy}
                            onChange={(e) =>
                                setSortBy(e.target.value as SortOption)
                            }
                            className={cn(
                                'appearance-none rounded-lg border py-2 pr-10 pl-4',
                                'border-neutral-300 dark:border-neutral-600',
                                'bg-white dark:bg-neutral-800',
                                'text-neutral-900 dark:text-white',
                                'focus:border-brand-500 focus:ring-brand-500/20 focus:ring-2'
                            )}
                        >
                            {sortOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    Sortieren: {option.label}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-neutral-400" />
                    </div>

                    {/* Filter Toggle */}
                    <Button
                        variant="secondary"
                        onClick={() => setShowFilters(!showFilters)}
                        className={cn(
                            showFilters && 'bg-brand-100 dark:bg-brand-900/30'
                        )}
                    >
                        <Filter className="mr-2 size-4" />
                        Filter
                    </Button>
                </div>

                {/* Status Filter Pills */}
                {showFilters && (
                    <div className="flex flex-wrap gap-2">
                        {statusFilters.map((filter) => {
                            const Icon = filter.icon
                            const isActive = statusFilter === filter.value
                            return (
                                <button
                                    key={filter.value}
                                    onClick={() =>
                                        setStatusFilter(filter.value)
                                    }
                                    className={cn(
                                        'flex items-center gap-2 rounded-full px-4 py-2 text-sm',
                                        'border transition-all',
                                        isActive
                                            ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400'
                                            : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:border-neutral-600'
                                    )}
                                >
                                    <Icon className="size-4" />
                                    {filter.label}
                                </button>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Tasks List */}
            {filteredTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-neutral-300 py-12 dark:border-neutral-600">
                    <ClipboardList className="size-12 text-neutral-400" />
                    <div className="text-center">
                        <p className="font-medium text-neutral-700 dark:text-neutral-300">
                            Keine Aufgaben gefunden
                        </p>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            {searchQuery || statusFilter !== 'all'
                                ? 'Versuche andere Filter oder Suchbegriffe'
                                : 'Dir sind noch keine Aufgaben zugewiesen'}
                        </p>
                    </div>
                </div>
            ) : sortBy === 'groupName' ? (
                // Grouped by Group
                <div className="space-y-6">
                    {Object.entries(tasksByGroup).map(
                        ([groupName, groupTasks]) => (
                            <div key={groupName}>
                                <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-neutral-900 dark:text-white">
                                    <span className="bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400 rounded-lg px-2 py-1 text-sm">
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
                                            task={task as Task}
                                            onClick={() =>
                                                handleTaskClick(task)
                                            }
                                            onEditClick={() =>
                                                handleEditClick(task)
                                            }
                                            onComplete={() =>
                                                handleCompleteTask(task)
                                            }
                                            subtaskCount={
                                                task.subtasks?.length || 0
                                            }
                                        />
                                    ))}
                                </div>
                            </div>
                        )
                    )}
                </div>
            ) : (
                // Flat List with Group Badges
                <div className="space-y-3">
                    {filteredTasks.map((task) => (
                        <MyTaskCard
                            key={task.id}
                            task={task as Task}
                            onClick={() => handleTaskClick(task)}
                            onEditClick={() => handleEditClick(task)}
                            onComplete={() => handleCompleteTask(task)}
                            showGroupBadge
                            groupName={task.groupName}
                            subtaskCount={task.subtasks?.length || 0}
                        />
                    ))}
                </div>
            )}

            {/* Task Detail View */}
            {selectedTask && (
                <TaskDetailView
                    groupId={selectedTask.groupId}
                    taskId={selectedTask.id}
                    onClose={() => setSelectedTask(null)}
                    onEditClick={() => handleEditClick(selectedTask)}
                />
            )}

            {/* Edit Task Modal */}
            {taskToEdit && (
                <EditTaskModal
                    task={taskToEdit as Task}
                    onClose={() => setTaskToEdit(null)}
                    onSubmit={handleUpdateTask}
                    onDelete={handleDeleteTask}
                    members={groupMembers}
                />
            )}
        </div>
    )
}
