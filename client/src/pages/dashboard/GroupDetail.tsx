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
    Filter,
    Share2,
    UserPlus,
    AlertCircle,
    Calendar as CalendarIcon,
} from 'lucide-react'
import { useState } from 'react'
import { Button, IconButton, SearchBar } from '../../components/common'
import { groupsApi } from '../../api/groups'
import { tasksApi } from '../../api/tasks'
import { recurringTasksApi } from '../../api/recurringTasks'
import { cn } from '../../utils/cn'
import { GroupDetailModal } from '../../components/groups'
import { Tabs as ContentTabs, type Tab } from '../../components/display'
import { KanbanBoard, type ColumnStatus } from '../../components/board'
import { MiniCalendar, TaskCalendar } from '../../components/calendar'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { useViewport } from '../../hooks/useViewport'
import {
    CreateTaskModal,
    EditTaskModal,
    TaskDetailView,
    type CreateTaskData,
    type CreateRecurringData,
} from '../../components/tasks'
import { type Task } from '../../api/tasks'
import { useTaskMutations } from '../../hooks/useTaskMutations'
import { useTaskModal } from '../../hooks/useTaskModal'

// Tabs für die Navigation (desktop zeigt Kalender als Sidebar)
const getTabsForViewport = (isDesktop: boolean): Tab[] => [
    { id: 'board', label: 'Board', icon: <LayoutGrid className="size-4" /> },
    ...(!isDesktop
        ? [
              {
                  id: 'calendar',
                  label: 'Kalender',
                  icon: <CalendarIcon className="size-4" />,
              },
          ]
        : []),
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
    const toast = useToast()
    const { isDesktop } = useViewport()

    // Get tabs based on viewport (calendar tab only on mobile/tablet)
    const tabs = getTabsForViewport(isDesktop)

    // UI State
    const [activeTab, setActiveTab] = useState('board')
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedMembers, setSelectedMembers] = useState<string[]>([])
    const [selectedPriorities, setSelectedPriorities] = useState<string[]>([])

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

    const { data: recurringTasks = [] } = useQuery({
        queryKey: ['recurringTasks', groupId],
        queryFn: () => recurringTasksApi.getTemplates(groupId!),
        enabled: !!groupId,
    })

    // Task mutations via custom hook
    const { createTask, updateTask, deleteTask } = useTaskMutations({
        groupId,
        onCreateSuccess: () => {
            closeCreateModal()
            toast.success('Aufgabe erfolgreich erstellt')
        },
        onUpdateSuccess: () => {
            closeEditModal()
            toast.success('Aufgabe erfolgreich aktualisiert')
        },
        onDeleteSuccess: () => {
            closeEditModal()
            toast.success('Aufgabe erfolgreich gelöscht')
        },
        onError: (_error, action) => {
            const messages = {
                create: 'Aufgabe konnte nicht erstellt werden',
                update: 'Aufgabe konnte nicht aktualisiert werden',
                delete: 'Aufgabe konnte nicht gelöscht werden',
            }
            toast.error(messages[action])
        },
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

    const handleCreateRecurring = async (data: CreateRecurringData) => {
        if (!groupId) return
        try {
            await recurringTasksApi.createTemplate(groupId, {
                title: data.title,
                description: data.description,
                priority: data.priority,
                frequency: data.frequency,
                assignmentStrategy: data.assignmentStrategy,
                fixedAssignee: data.fixedAssignee,
                dueDay: data.dueDay,
            })
            closeCreateModal()
            toast.success('Wiederkehrende Aufgabe erfolgreich erstellt')
        } catch {
            toast.error('Wiederkehrende Aufgabe konnte nicht erstellt werden')
        }
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

    const handleMemberToggle = (memberId: string) => {
        setSelectedMembers((prev) =>
            prev.includes(memberId)
                ? prev.filter((id) => id !== memberId)
                : [...prev, memberId]
        )
    }

    const handleClearMemberFilter = () => {
        setSelectedMembers([])
    }

    const handlePriorityToggle = (priority: string) => {
        setSelectedPriorities((prev) =>
            prev.includes(priority)
                ? prev.filter((p) => p !== priority)
                : [...prev, priority]
        )
    }

    const handleClearPriorityFilter = () => {
        setSelectedPriorities([])
    }

    // Filter tasks based on search and selected members
    const filteredTasks = tasks.filter((task) => {
        // Member filter
        if (selectedMembers.length > 0 && !selectedMembers.includes(task.assignedTo || '')) {
            return false
        }
        // Priority filter
        if (selectedPriorities.length > 0 && !selectedPriorities.includes(task.priority)) {
            return false
        }
        // Search filter is handled by KanbanBoard's searchQuery prop
        return true
    })

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
                    members={group?.members.map((m) => ({
                        userId: m.userId,
                        name: m.userName || m.userId,
                        avatar: m.userAvatar,
                    })) || []}
                    selectedMembers={selectedMembers}
                    onMemberToggle={handleMemberToggle}
                    onClearMemberFilter={handleClearMemberFilter}
                    selectedPriorities={selectedPriorities}
                    onPriorityToggle={handlePriorityToggle}
                    onClearPriorityFilter={handleClearPriorityFilter}
                />
            </div>

            {/* Content Area */}
            <div className="min-h-0 flex-1">
                <div className="flex h-full gap-6">
                    {/* Main Content */}
                    <div className="min-w-0 flex-1">
                        {activeTab === 'board' && (
                            <KanbanBoard
                                tasks={filteredTasks}
                                onTaskClick={handleTaskClick}
                                onAddTask={handleAddTask}
                                onTaskMove={handleTaskMove}
                                searchQuery={searchQuery}
                                members={group?.members.map((m) => ({
                                    userId: m.userId,
                                    name: m.userName || m.userId,
                                    avatar: m.userAvatar,
                                })) || []}
                            />
                        )}
                        {activeTab === 'calendar' && !isDesktop && (
                            <TaskCalendar
                                tasks={filteredTasks}
                                recurringTasks={recurringTasks}
                                onTaskClick={handleTaskClick}
                                className="rounded-xl bg-white p-4 shadow-sm dark:bg-neutral-900"
                            />
                        )}
                        {activeTab === 'messages' && (
                            <ComingSoonPlaceholder text="Messages - Coming Soon" />
                        )}
                    </div>

                    {/* Calendar Sidebar (Desktop only) */}
                    {isDesktop && activeTab === 'board' && (
                        <aside className="hidden w-80 flex-shrink-0 xl:block 2xl:w-[360px]">
                            <div className="sticky top-4">
                                <MiniCalendar
                                    tasks={filteredTasks}
                                    recurringTasks={recurringTasks}
                                    onTaskClick={handleTaskClick}
                                    showTaskList
                                />
                            </div>
                        </aside>
                    )}
                </div>
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
                onCreateRecurring={handleCreateRecurring}
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
 * Search and toolbar section with member filter
 */
interface MemberInfo {
    userId: string
    name?: string
    avatar?: string
}

interface SearchToolbarProps {
    searchQuery: string
    onSearchChange: (query: string) => void
    onAddTask: () => void
    members: MemberInfo[]
    selectedMembers: string[]
    onMemberToggle: (memberId: string) => void
    onClearMemberFilter: () => void
    selectedPriorities: string[]
    onPriorityToggle: (priority: string) => void
    onClearPriorityFilter: () => void
}

const PRIORITY_OPTIONS = [
    { value: 'high', label: 'Hoch', color: 'bg-error-500' },
    { value: 'medium', label: 'Mittel', color: 'bg-amber-500' },
    { value: 'low', label: 'Niedrig', color: 'bg-neutral-400' },
]

const SearchToolbar = ({
    searchQuery,
    onSearchChange,
    onAddTask,
    members,
    selectedMembers,
    onMemberToggle,
    onClearMemberFilter,
    selectedPriorities,
    onPriorityToggle,
    onClearPriorityFilter,
}: SearchToolbarProps) => {
    const [showFilterDropdown, setShowFilterDropdown] = useState(false)
    const hasActiveFilters = selectedMembers.length > 0 || selectedPriorities.length > 0

    return (
        <div className="space-y-3">
            {/* Member Filter Row */}
            <div className="flex items-center gap-2">
                <div className="flex -space-x-1">
                    {members.slice(0, 8).map((member) => {
                        const isSelected = selectedMembers.includes(member.userId)
                        return (
                            <button
                                key={member.userId}
                                onClick={() => onMemberToggle(member.userId)}
                                className={cn(
                                    'relative flex size-8 items-center justify-center rounded-full',
                                    'border-2 transition-all duration-200',
                                    'text-xs font-medium',
                                    isSelected
                                        ? 'border-brand-500 ring-brand-500/30 z-10 scale-110 ring-2'
                                        : 'border-white hover:border-brand-300 dark:border-neutral-900 dark:hover:border-brand-700',
                                    member.avatar
                                        ? ''
                                        : 'bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400'
                                )}
                                title={member.name || member.userId}
                            >
                                {member.avatar ? (
                                    <img
                                        src={member.avatar}
                                        alt={member.name || member.userId}
                                        className="size-full rounded-full object-cover"
                                    />
                                ) : (
                                    (member.name || member.userId).charAt(0).toUpperCase()
                                )}
                                {isSelected && (
                                    <div className="bg-brand-500 absolute -bottom-0.5 -right-0.5 flex size-3 items-center justify-center rounded-full">
                                        <div className="size-1.5 rounded-full bg-white" />
                                    </div>
                                )}
                            </button>
                        )
                    })}
                    {members.length > 8 && (
                        <div
                            className={cn(
                                'flex size-8 items-center justify-center rounded-full',
                                'border-2 border-white dark:border-neutral-900',
                                'bg-neutral-200 dark:bg-neutral-700',
                                'text-xs font-medium text-neutral-600 dark:text-neutral-400'
                            )}
                        >
                            +{members.length - 8}
                        </div>
                    )}
                </div>
                {hasActiveFilters && (
                    <button
                        onClick={() => {
                            onClearMemberFilter()
                            onClearPriorityFilter()
                        }}
                        className="text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 text-xs font-medium"
                    >
                        Filter zurücksetzen
                    </button>
                )}
            </div>

            {/* Search and Actions Row */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <SearchBar
                    value={searchQuery}
                    onChange={onSearchChange}
                    placeholder="Aufgabe suchen..."
                    className="flex-1"
                />

                <div className="flex items-center gap-2">
                    {/* Filter Dropdown */}
                    <div className="relative">
                        <Button
                            variant="secondary"
                            icon={<Filter className="size-4" />}
                            className={cn(
                                'flex-1 sm:flex-none',
                                selectedPriorities.length > 0 && 'ring-brand-500 ring-2'
                            )}
                            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                        >
                            Filter
                            {selectedPriorities.length > 0 && (
                                <span className="bg-brand-500 ml-1 flex size-5 items-center justify-center rounded-full text-xs text-white">
                                    {selectedPriorities.length}
                                </span>
                            )}
                        </Button>

                        {showFilterDropdown && (
                            <>
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setShowFilterDropdown(false)}
                                />
                                <div className={cn(
                                    'absolute right-0 top-full z-50 mt-2 w-56 rounded-xl p-3',
                                    'border border-neutral-200 bg-white shadow-lg',
                                    'dark:border-neutral-700 dark:bg-neutral-800'
                                )}>
                                    <div className="mb-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                                        Priorität
                                    </div>
                                    <div className="space-y-1">
                                        {PRIORITY_OPTIONS.map((priority) => {
                                            const isSelected = selectedPriorities.includes(priority.value)
                                            return (
                                                <button
                                                    key={priority.value}
                                                    onClick={() => onPriorityToggle(priority.value)}
                                                    className={cn(
                                                        'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
                                                        isSelected
                                                            ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'
                                                            : 'hover:bg-neutral-100 dark:hover:bg-neutral-700'
                                                    )}
                                                >
                                                    <div className={cn('size-3 rounded-full', priority.color)} />
                                                    <span className="flex-1 text-left">{priority.label}</span>
                                                    {isSelected && (
                                                        <div className="text-brand-500">
                                                            <svg className="size-4" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </button>
                                            )
                                        })}
                                    </div>
                                    {selectedPriorities.length > 0 && (
                                        <button
                                            onClick={onClearPriorityFilter}
                                            className="text-brand-600 hover:text-brand-700 dark:text-brand-400 mt-2 w-full text-center text-xs font-medium"
                                        >
                                            Prioritätsfilter zurücksetzen
                                        </button>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

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
        </div>
    )
}

/**
 * Placeholder for coming soon features
 */
const ComingSoonPlaceholder = ({ text }: { text: string }) => (
    <div className="flex items-center justify-center py-12 text-neutral-500">
        {text}
    </div>
)
