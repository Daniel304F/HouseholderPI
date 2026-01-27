import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    ArrowLeft,
    Settings,
    Plus,
    Users,
    LayoutGrid,
    BarChart3,
    MessageSquare,
    Search,
    Filter,
    Share2,
    UserPlus,
    AlertCircle,
} from 'lucide-react'
import { Button } from '../../components/Button'
import { IconButton } from '../../components/IconButton'
import { groupsApi } from '../../api/groups'
import { tasksApi } from '../../api/tasks'
import { cn } from '../../utils/cn'
import { GroupDetailModal } from '../../components/groups'
import { ContentTabs, type Tab } from '../../components/ContentTabs'
import { KanbanBoard, type ColumnStatus } from '../../components/board'
import { useAuth } from '../../contexts/AuthContext'
import { useState } from 'react'
import {
    CreateTaskModal,
    EditTaskModal,
    TaskDetailView,
    type CreateTaskData,
    type EditTaskData,
    type Task,
} from '../../components/tasks'

// Tabs für die Navigation
const tabs: Tab[] = [
    { id: 'board', label: 'Board', icon: <LayoutGrid className="size-4" /> },
    {
        id: 'messages',
        label: 'Messages',
        icon: <MessageSquare className="size-4" />,
        disabled: true,
    },
]

export const GroupDetail = () => {
    const { groupId } = useParams<{ groupId: string }>()
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const { user } = useAuth()
    const [showSettingsModal, setShowSettingsModal] = useState(false)
    const [showCreateTaskModal, setShowCreateTaskModal] = useState(false)
    const [selectedTask, setSelectedTask] = useState<Task | null>(null)
    const [taskToEdit, setTaskToEdit] = useState<Task | null>(null)
    const [showTaskDetail, setShowTaskDetail] = useState(false)
    const [initialTaskStatus, setInitialTaskStatus] =
        useState<ColumnStatus>('pending')
    const [activeTab, setActiveTab] = useState('board')
    const [searchQuery, setSearchQuery] = useState('')

    const {
        data: group,
        isLoading,
        isError,
        refetch,
    } = useQuery({
        queryKey: ['group', groupId],
        queryFn: () => groupsApi.getGroup(groupId!),
        enabled: !!groupId,
    })

    const { data: tasks = [] } = useQuery({
        queryKey: ['tasks', groupId],
        queryFn: () => tasksApi.getGroupTasks(groupId!),
        enabled: !!groupId,
    })

    const createTaskMutation = useMutation({
        mutationFn: (data: CreateTaskData) =>
            tasksApi.createTask(groupId!, {
                title: data.title,
                description: data.description,
                status: data.status,
                priority: data.priority,
                assignedTo: data.assignedTo,
                dueDate: data.dueDate,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks', groupId] })
        },
    })

    const updateTaskMutation = useMutation({
        mutationFn: ({
            taskId,
            data,
        }: {
            taskId: string
            data: EditTaskData
        }) => tasksApi.updateTask(groupId!, taskId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks', groupId] })
        },
    })

    const deleteTaskMutation = useMutation({
        mutationFn: (taskId: string) => tasksApi.deleteTask(groupId!, taskId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks', groupId] })
        },
    })

    const handleTaskClick = (task: Task) => {
        setSelectedTask(task)
        setShowTaskDetail(true)
    }

    const handleEditFromDetail = () => {
        setShowTaskDetail(false)
        setTaskToEdit(selectedTask)
    }

    const handleAddTask = (status: ColumnStatus) => {
        setInitialTaskStatus(status)
        setShowCreateTaskModal(true)
    }

    const handleCreateTask = async (data: CreateTaskData) => {
        await createTaskMutation.mutateAsync(data)
    }

    const handleUpdateTask = async (taskId: string, data: EditTaskData) => {
        await updateTaskMutation.mutateAsync({ taskId, data })
    }

    const handleDeleteTask = async (taskId: string) => {
        await deleteTaskMutation.mutateAsync(taskId)
    }

    // Drag and Drop: Task in neue Spalte verschieben
    const handleTaskMove = async (taskId: string, newStatus: ColumnStatus) => {
        await updateTaskMutation.mutateAsync({
            taskId,
            data: { status: newStatus },
        })
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                {/* Header Skeleton */}
                <div className="flex items-center gap-4">
                    <div className="size-10 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-700" />
                    <div className="flex-1 space-y-2">
                        <div className="h-7 w-48 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
                        <div className="h-5 w-64 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
                    </div>
                </div>

                {/* Tabs Skeleton */}
                <div className="h-12 w-80 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-700" />

                {/* Board Skeleton */}
                <div className="flex gap-4 overflow-hidden">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-96 w-72 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-700"
                        />
                    ))}
                </div>
            </div>
        )
    }

    if (isError || !group) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 py-12">
                <AlertCircle className="size-12 text-red-500" />
                <p className="text-neutral-500 dark:text-neutral-400">
                    Gruppe konnte nicht geladen werden.
                </p>
                <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => navigate(-1)}>
                        Zurück
                    </Button>
                    <Button onClick={() => refetch()}>Erneut versuchen</Button>
                </div>
            </div>
        )
    }

    const currentMember = group.members.find((m) => m.userId === user?.id)
    const isAdmin =
        currentMember?.role === 'owner' || currentMember?.role === 'admin'

    // Member avatars for display
    const displayMembers = group.members.slice(0, 4)
    const extraMemberCount = Math.max(0, group.members.length - 4)

    return (
        <div className="flex h-full flex-col space-y-6">
            {/* Header Section */}
            <div className="space-y-4">
                {/* Top Row: Back button, Title, Actions */}
                <div className="flex items-start gap-4">
                    <IconButton
                        icon={<ArrowLeft className="size-5" />}
                        onClick={() => navigate('/dashboard/groups')}
                        variant="ghost"
                        aria-label="Zurück zu Gruppen"
                    />

                    <div className="min-w-0 flex-1">
                        {/* Group Name & Meta */}
                        <div className="flex items-center gap-3">
                            {group.picture ? (
                                <img
                                    src={group.picture}
                                    alt={group.name}
                                    className="size-10 rounded-xl object-cover"
                                />
                            ) : (
                                <div
                                    className={cn(
                                        'flex size-10 items-center justify-center rounded-xl',
                                        'bg-brand-100 dark:bg-brand-900/30'
                                    )}
                                >
                                    <Users className="text-brand-600 dark:text-brand-400 size-5" />
                                </div>
                            )}
                            <div>
                                <h1 className="text-xl font-bold text-neutral-900 sm:text-2xl dark:text-white">
                                    {group.name}
                                </h1>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                    {group.members.length} Mitglieder •{' '}
                                    {group.activeResidentsCount} aktive Bewohner
                                </p>
                            </div>
                        </div>

                        {/* Description */}
                        {group.description && (
                            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                                {group.description}
                            </p>
                        )}
                    </div>

                    {/* Right Side: Members & Actions */}
                    <div className="flex items-center gap-4">
                        {/* Member Avatars */}
                        <div className="hidden items-center sm:flex">
                            <div className="flex -space-x-2">
                                {displayMembers.map((member) => (
                                    <div
                                        key={member.userId}
                                        className={cn(
                                            'flex size-8 items-center justify-center rounded-full',
                                            'bg-brand-100 dark:bg-brand-900/30',
                                            'border-2 border-white dark:border-neutral-900',
                                            'text-brand-600 dark:text-brand-400 text-xs font-medium'
                                        )}
                                    >
                                        {member.userId.charAt(0).toUpperCase()}
                                    </div>
                                ))}
                                {extraMemberCount > 0 && (
                                    <div
                                        className={cn(
                                            'flex size-8 items-center justify-center rounded-full',
                                            'bg-neutral-200 dark:bg-neutral-700',
                                            'border-2 border-white dark:border-neutral-900',
                                            'text-xs font-medium text-neutral-600 dark:text-neutral-400'
                                        )}
                                    >
                                        +{extraMemberCount}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    /* TODO: Share */
                                }}
                                icon={<Share2 className="size-4" />}
                                className="hidden sm:flex"
                            >
                                Teilen
                            </Button>
                            <Link to={`/dashboard/groups/${groupId}/stats`}>
                                <Button
                                    variant="outline"
                                    icon={<BarChart3 className="size-4" />}
                                >
                                    <span className="hidden sm:inline">
                                        Statistiken
                                    </span>
                                </Button>
                            </Link>
                            {isAdmin && (
                                <Button
                                    variant="outline"
                                    onClick={() => setShowSettingsModal(true)}
                                    icon={<Settings className="size-4" />}
                                >
                                    <span className="hidden sm:inline">
                                        Einstellungen
                                    </span>
                                </Button>
                            )}
                            <Button
                                onClick={() => {
                                    /* TODO: Invite */
                                }}
                                icon={<UserPlus className="size-4" />}
                            >
                                <span className="hidden sm:inline">
                                    Einladen
                                </span>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Tabs & Toolbar */}
                <div className="flex flex-col gap-4">
                    {/* Top: Tab Navigation */}
                    <ContentTabs
                        tabs={tabs}
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                    />

                    {/* Bottom: Toolbar - stacks on mobile */}
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        {/* Search - full width on mobile */}
                        <div
                            className={cn(
                                'flex flex-1 items-center gap-2 rounded-lg px-3 py-2',
                                'bg-neutral-100 dark:bg-neutral-800',
                                'border border-transparent',
                                'focus-within:border-brand-500 focus-within:ring-brand-500/20 focus-within:ring-2'
                            )}
                        >
                            <Search className="size-4 flex-shrink-0 text-neutral-400" />
                            <input
                                type="text"
                                placeholder="Aufgabe suchen..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={cn(
                                    'min-w-0 flex-1 bg-transparent text-sm outline-none',
                                    'text-neutral-900 dark:text-white',
                                    'placeholder:text-neutral-400'
                                )}
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                            {/* Filter Button */}
                            <Button
                                variant="secondary"
                                icon={<Filter className="size-4" />}
                                className="flex-1 sm:flex-none"
                            >
                                <span className="sm:hidden">Filter</span>
                                <span className="hidden sm:inline">Filter</span>
                            </Button>

                            {/* Add Task Button */}
                            <Button
                                onClick={() => handleAddTask('pending')}
                                icon={<Plus className="size-4" />}
                                className="flex-1 sm:flex-none"
                            >
                                <span className="sm:hidden">Aufgabe</span>
                                <span className="hidden sm:inline">
                                    Neue Aufgabe
                                </span>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="min-h-0 flex-1">
                {activeTab === 'board' && (
                    <KanbanBoard
                        tasks={tasks}
                        onTaskClick={handleTaskClick}
                        onAddTask={handleAddTask}
                        onTaskMove={handleTaskMove}
                        searchQuery={searchQuery}
                    />
                )}
                {activeTab === 'stats' && (
                    <div className="flex items-center justify-center py-12 text-neutral-500">
                        Statistiken - Coming Soon
                    </div>
                )}
                {activeTab === 'messages' && (
                    <div className="flex items-center justify-center py-12 text-neutral-500">
                        Messages - Coming Soon
                    </div>
                )}
            </div>

            {/* Settings Modal */}
            <GroupDetailModal
                group={showSettingsModal ? group : null}
                onClose={() => setShowSettingsModal(false)}
                onUpdated={() => {
                    refetch()
                    setShowSettingsModal(false)
                }}
                currentUserId={user?.id || ''}
            />

            {/* Create Task Modal */}
            <CreateTaskModal
                isOpen={showCreateTaskModal}
                onClose={() => setShowCreateTaskModal(false)}
                onSubmit={handleCreateTask}
                initialStatus={initialTaskStatus}
                members={group?.members || []}
            />

            {/* Task Detail View */}
            {showTaskDetail && selectedTask && groupId && (
                <TaskDetailView
                    groupId={groupId}
                    taskId={selectedTask.id}
                    onClose={() => {
                        setShowTaskDetail(false)
                        setSelectedTask(null)
                    }}
                    onEditClick={handleEditFromDetail}
                />
            )}

            {/* Edit Task Modal */}
            <EditTaskModal
                task={taskToEdit}
                onClose={() => setTaskToEdit(null)}
                onSubmit={handleUpdateTask}
                onDelete={handleDeleteTask}
                members={group?.members || []}
            />
        </div>
    )
}
