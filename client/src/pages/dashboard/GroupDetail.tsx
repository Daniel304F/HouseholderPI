import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
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
import { useState } from 'react'
import { Button, IconButton } from '../../components/common'
import { groupsApi } from '../../api/groups'
import { tasksApi } from '../../api/tasks'
import { cn } from '../../utils/cn'
import { GroupDetailModal } from '../../components/groups'
import { Tabs as ContentTabs, type Tab } from '../../components/display'
import { KanbanBoard, type ColumnStatus } from '../../components/board'
import { useAuth } from '../../contexts/AuthContext'
import {
    CreateTaskModal,
    EditTaskModal,
    TaskDetailView,
    type CreateTaskData,
} from '../../components/tasks'
import { type Task } from '../../api/tasks'
import { useTaskMutations } from '../../hooks/useTaskMutations'
import { useTaskModal } from '../../hooks/useTaskModal'

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
    const { user } = useAuth()

    // UI State
    const [activeTab, setActiveTab] = useState('board')
    const [searchQuery, setSearchQuery] = useState('')

    // Modal state management via custom hook
    const {
        selectedTask,
        taskToEdit,
        showTaskDetail,
        showCreateModal,
        showSettingsModal,
        initialStatus,
        openTaskDetail,
        closeTaskDetail,
        closeEditModal,
        openCreateModal,
        closeCreateModal,
        openSettingsModal,
        closeSettingsModal,
        editFromDetail,
    } = useTaskModal<Task>()

    // Queries
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

    // Task mutations via custom hook
    const { createTask, updateTask, deleteTask } = useTaskMutations({
        groupId,
        onCreateSuccess: () => closeCreateModal(),
        onUpdateSuccess: () => closeEditModal(),
        onDeleteSuccess: () => closeEditModal(),
    })

    // Event handlers
    const handleTaskClick = (task: Task) => {
        openTaskDetail(task)
    }

    const handleAddTask = (status: ColumnStatus) => {
        openCreateModal(status)
    }

    const handleCreateTask = async (data: CreateTaskData) => {
        await createTask.mutateAsync(data)
    }

    const handleUpdateTask = async (taskId: string, data: Partial<Task>) => {
        await updateTask.mutateAsync({ taskId, data })
    }

    const handleDeleteTask = async (taskId: string) => {
        await deleteTask.mutateAsync({ taskId })
    }

    const handleTaskMove = async (taskId: string, newStatus: ColumnStatus) => {
        await updateTask.mutateAsync({
            taskId,
            data: { status: newStatus },
        })
    }

    // Loading state
    if (isLoading) {
        return <GroupDetailSkeleton />
    }

    // Error state
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

    return (
        <div className="flex h-full flex-col space-y-6">
            {/* Header Section */}
            <GroupHeader
                group={group}
                isAdmin={isAdmin}
                onBack={() => navigate('/dashboard/groups')}
                onSettings={openSettingsModal}
            />

            {/* Tabs & Toolbar */}
            <div className="flex flex-col gap-4">
                <ContentTabs
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                />

                <SearchToolbar
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    onAddTask={() => handleAddTask('pending')}
                />
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
                {activeTab === 'messages' && (
                    <ComingSoonPlaceholder text="Messages - Coming Soon" />
                )}
            </div>

            {/* Modals */}
            <GroupDetailModal
                group={showSettingsModal ? group : null}
                onClose={closeSettingsModal}
                onUpdated={() => {
                    refetch()
                    closeSettingsModal()
                }}
                currentUserId={user?.id || ''}
            />

            <CreateTaskModal
                isOpen={showCreateModal}
                onClose={closeCreateModal}
                onSubmit={handleCreateTask}
                initialStatus={initialStatus}
                members={group?.members || []}
            />

            {showTaskDetail && selectedTask && groupId && (
                <TaskDetailView
                    groupId={groupId}
                    taskId={selectedTask.id}
                    onClose={closeTaskDetail}
                    onEditClick={editFromDetail}
                />
            )}

            <EditTaskModal
                task={taskToEdit}
                onClose={closeEditModal}
                onSubmit={handleUpdateTask}
                onDelete={handleDeleteTask}
                members={group?.members || []}
            />
        </div>
    )
}

// ============================================================================
// Sub-components
// ============================================================================

/**
 * Loading skeleton for the page
 */
const GroupDetailSkeleton = () => (
    <div className="space-y-6">
        <div className="flex items-center gap-4">
            <div className="size-10 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-700" />
            <div className="flex-1 space-y-2">
                <div className="h-7 w-48 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
                <div className="h-5 w-64 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
            </div>
        </div>
        <div className="h-12 w-80 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-700" />
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

/**
 * Group header with info and actions
 */
interface GroupHeaderProps {
    group: {
        name: string
        picture?: string
        description?: string
        members: Array<{ userId: string; role: string }>
        activeResidentsCount: number
    }
    isAdmin: boolean
    onBack: () => void
    onSettings: () => void
}

const GroupHeader = ({ group, isAdmin, onBack, onSettings }: GroupHeaderProps) => {
    const displayMembers = group.members.slice(0, 4)
    const extraMemberCount = Math.max(0, group.members.length - 4)
    const { groupId } = useParams<{ groupId: string }>()

    return (
        <div className="space-y-4">
            <div className="flex items-start gap-4">
                <IconButton
                    icon={<ArrowLeft className="size-5" />}
                    onClick={onBack}
                    variant="ghost"
                    aria-label="Zurück zu Gruppen"
                />

                <div className="min-w-0 flex-1">
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

                    {group.description && (
                        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                            {group.description}
                        </p>
                    )}
                </div>

                {/* Member avatars & Actions */}
                <div className="flex items-center gap-4">
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
                                onClick={onSettings}
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
                            <span className="hidden sm:inline">Einladen</span>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

/**
 * Search and toolbar section
 */
interface SearchToolbarProps {
    searchQuery: string
    onSearchChange: (query: string) => void
    onAddTask: () => void
}

const SearchToolbar = ({
    searchQuery,
    onSearchChange,
    onAddTask,
}: SearchToolbarProps) => (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
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
                onChange={(e) => onSearchChange(e.target.value)}
                className={cn(
                    'min-w-0 flex-1 bg-transparent text-sm outline-none',
                    'text-neutral-900 dark:text-white',
                    'placeholder:text-neutral-400'
                )}
            />
        </div>

        <div className="flex items-center gap-2">
            <Button
                variant="secondary"
                icon={<Filter className="size-4" />}
                className="flex-1 sm:flex-none"
            >
                Filter
            </Button>

            <Button
                onClick={onAddTask}
                icon={<Plus className="size-4" />}
                className="flex-1 sm:flex-none"
            >
                <span className="sm:hidden">Aufgabe</span>
                <span className="hidden sm:inline">Neue Aufgabe</span>
            </Button>
        </div>
    </div>
)

/**
 * Placeholder for coming soon features
 */
const ComingSoonPlaceholder = ({ text }: { text: string }) => (
    <div className="flex items-center justify-center py-12 text-neutral-500">
        {text}
    </div>
)
