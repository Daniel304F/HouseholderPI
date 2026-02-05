import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
    LayoutGrid,
    MessageSquare,
    Calendar as CalendarIcon,
    X,
    RefreshCw,
    UserCircle,
    Paperclip,
} from 'lucide-react'
import { useState, useMemo } from 'react'
import { groupsApi } from '../../api/groups'
import { tasksApi, type Task } from '../../api/tasks'
import { recurringTasksApi, type RecurringTaskTemplate } from '../../api/recurringTasks'
import { cn } from '../../utils/cn'
import { GroupDetailModal } from '../../components/groups'
import {
    PageSkeleton,
    ErrorState,
    PageHeader,
    Toolbar,
    type MemberInfo,
} from '../../components/groups/detail'
import { Tabs, type Tab } from '../../components/display'
import { KanbanBoard, type ColumnStatus } from '../../components/board'
import { TaskCalendar } from '../../components/calendar'
import { GroupChat } from '../../components/chat'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { useViewport } from '../../hooks/useViewport'
import {
    CreateTaskModal,
    EditTaskModal,
    TaskDetailView,
    type CreateTaskData,
} from '../../components/tasks'
import { useTaskMutations } from '../../hooks/useTaskMutations'
import { useTaskModal } from '../../hooks/useTaskModal'

type TabId = 'board' | 'calendar' | 'messages'

const getTabs = (isDesktop: boolean): Tab[] => [
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
    },
]

export const GroupDetail = () => {
    const { groupId } = useParams<{ groupId: string }>()
    const navigate = useNavigate()
    const { user } = useAuth()
    const toast = useToast()
    const { isDesktop } = useViewport()

    // State
    const [activeTab, setActiveTab] = useState<TabId>('board')
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedMembers, setSelectedMembers] = useState<string[]>([])
    const [selectedPriorities, setSelectedPriorities] = useState<string[]>([])
    const [selectedRecurring, setSelectedRecurring] = useState<RecurringTaskTemplate | null>(null)

    // Modal state
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

    // Mutations
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

    // Derived state
    const tabs = useMemo(() => getTabs(isDesktop), [isDesktop])

    const members: MemberInfo[] = useMemo(
        () =>
            group?.members.map((m) => ({
                userId: m.userId,
                name: m.userName || m.userId,
                avatar: m.userAvatar,
            })) || [],
        [group?.members]
    )

    const filteredTasks = useMemo(
        () =>
            tasks.filter((task) => {
                if (
                    selectedMembers.length > 0 &&
                    !selectedMembers.includes(task.assignedTo || '')
                ) {
                    return false
                }
                if (
                    selectedPriorities.length > 0 &&
                    !selectedPriorities.includes(task.priority)
                ) {
                    return false
                }
                return true
            }),
        [tasks, selectedMembers, selectedPriorities]
    )

    const currentMember = group?.members.find((m) => m.userId === user?.id)
    const isAdmin =
        currentMember?.role === 'owner' || currentMember?.role === 'admin'

    // Handlers
    const handleTaskClick = (task: Task) => openTaskDetail(task)
    const handleRecurringClick = (template: RecurringTaskTemplate) => setSelectedRecurring(template)
    const handleAddTask = (status: ColumnStatus) => openCreateModal(status)

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
        await updateTask.mutateAsync({ taskId, data: { status: newStatus } })
    }

    const toggleMember = (id: string) => {
        setSelectedMembers((prev) =>
            prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
        )
    }

    const togglePriority = (priority: string) => {
        setSelectedPriorities((prev) =>
            prev.includes(priority)
                ? prev.filter((p) => p !== priority)
                : [...prev, priority]
        )
    }

    const clearFilters = () => {
        setSelectedMembers([])
        setSelectedPriorities([])
    }

    // Loading state
    if (isLoading) return <PageSkeleton />

    // Error state
    if (isError || !group) {
        return (
            <ErrorState onBack={() => navigate(-1)} onRetry={() => refetch()} />
        )
    }

    return (
        <div className="flex h-full flex-col gap-6">
            {/* Header */}
            <PageHeader
                group={group}
                groupId={groupId!}
                isAdmin={isAdmin}
                onBack={() => navigate('/dashboard/groups')}
                onSettings={openSettingsModal}
            />

            {/* Tabs */}
            <Tabs
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={(id) => setActiveTab(id as TabId)}
            />

            {/* Toolbar */}
            <Toolbar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onAddTask={() => handleAddTask('pending')}
                members={members}
                selectedMembers={selectedMembers}
                onMemberToggle={toggleMember}
                selectedPriorities={selectedPriorities}
                onPriorityToggle={togglePriority}
                onClearFilters={clearFilters}
            />

            {/* Content */}
            <ContentArea
                activeTab={activeTab}
                isDesktop={isDesktop}
                groupId={groupId}
                filteredTasks={filteredTasks}
                recurringTasks={recurringTasks}
                searchQuery={searchQuery}
                members={members}
                onTaskClick={handleTaskClick}
                onRecurringClick={handleRecurringClick}
                onAddTask={handleAddTask}
                onTaskMove={handleTaskMove}
            />

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
                members={group.members}
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
                members={group.members}
            />

            {/* Recurring Task Detail Modal */}
            {selectedRecurring && (
                <RecurringTaskModal
                    template={selectedRecurring}
                    members={group.members}
                    onClose={() => setSelectedRecurring(null)}
                />
            )}
        </div>
    )
}

interface ContentAreaProps {
    activeTab: TabId
    isDesktop: boolean
    groupId: string | undefined
    filteredTasks: Task[]
    recurringTasks: RecurringTaskTemplate[]
    searchQuery: string
    members: MemberInfo[]
    onTaskClick: (task: Task) => void
    onRecurringClick: (template: RecurringTaskTemplate) => void
    onAddTask: (status: ColumnStatus) => void
    onTaskMove: (taskId: string, newStatus: ColumnStatus) => Promise<void>
}

const ContentArea = ({
    activeTab,
    isDesktop,
    groupId,
    filteredTasks,
    recurringTasks,
    searchQuery,
    members,
    onTaskClick,
    onRecurringClick,
    onAddTask,
    onTaskMove,
}: ContentAreaProps) => (
    <main className="min-h-0 flex-1">
        {activeTab === 'board' && (
            <div
                className={cn('h-full', isDesktop && 'grid grid-cols-3 gap-6')}
            >
                {/* Kanban Board - 2/3 */}
                <div className={cn(isDesktop ? 'col-span-2' : 'h-full')}>
                    <KanbanBoard
                        tasks={filteredTasks}
                        onTaskClick={onTaskClick}
                        onAddTask={onAddTask}
                        onTaskMove={onTaskMove}
                        searchQuery={searchQuery}
                        members={members}
                    />
                </div>

                {/* Calendar Sidebar - 1/3 (nur Desktop) */}
                {isDesktop && (
                    <aside className="h-full overflow-auto rounded-xl bg-white p-4 shadow-sm dark:bg-neutral-900">
                        <TaskCalendar
                            tasks={filteredTasks}
                            recurringTasks={recurringTasks}
                            onTaskClick={onTaskClick}
                            onRecurringClick={onRecurringClick}
                        />
                    </aside>
                )}
            </div>
        )}

        {activeTab === 'calendar' && !isDesktop && (
            <TaskCalendar
                tasks={filteredTasks}
                recurringTasks={recurringTasks}
                onTaskClick={onTaskClick}
                onRecurringClick={onRecurringClick}
                className="rounded-xl bg-white p-4 shadow-sm dark:bg-neutral-900"
            />
        )}

        {activeTab === 'messages' && groupId && (
            <div className="h-full rounded-xl bg-white shadow-sm dark:bg-neutral-900">
                <GroupChat groupId={groupId} />
            </div>
        )}
    </main>
)

// Recurring Task Modal
interface RecurringTaskModalProps {
    template: RecurringTaskTemplate
    members: { userId: string; userName?: string }[]
    onClose: () => void
}

const FREQUENCY_LABELS: Record<string, string> = {
    daily: 'Täglich',
    weekly: 'Wöchentlich',
    biweekly: 'Alle 2 Wochen',
    monthly: 'Monatlich',
}

const WEEKDAY_LABELS = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']

const RecurringTaskModal = ({ template, members, onClose }: RecurringTaskModalProps) => {
    const getMemberName = (userId: string) => {
        const member = members.find((m) => m.userId === userId)
        return member?.userName || 'Unbekannt'
    }

    const getDueDaysLabel = () => {
        if (template.frequency === 'daily') return 'Jeden Tag'
        if (template.frequency === 'weekly' || template.frequency === 'biweekly') {
            const days = template.dueDays || []
            if (days.length === 0) return '-'
            if (days.length === 7) return 'Jeden Tag'
            return days.map((d) => WEEKDAY_LABELS[d]).join(', ')
        }
        return `${template.dueDays?.[0] || 1}. des Monats`
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div
                className={cn(
                    'w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-neutral-900',
                    'animate-in fade-in zoom-in-95 duration-200'
                )}
            >
                {/* Header */}
                <div className="mb-4 flex items-start justify-between">
                    <div className="flex items-center gap-2">
                        <RefreshCw className="size-5 text-brand-500" />
                        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                            Wiederkehrende Aufgabe
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    >
                        <X className="size-5 text-neutral-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="space-y-4">
                    <div>
                        <h3 className="text-xl font-medium text-neutral-900 dark:text-white">
                            {template.title}
                        </h3>
                        {template.description && (
                            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                                {template.description}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-neutral-500 dark:text-neutral-400">Häufigkeit</span>
                            <p className="font-medium text-neutral-900 dark:text-white">
                                {FREQUENCY_LABELS[template.frequency]}
                            </p>
                        </div>
                        <div>
                            <span className="text-neutral-500 dark:text-neutral-400">Fällig</span>
                            <p className="font-medium text-neutral-900 dark:text-white">
                                {getDueDaysLabel()}
                            </p>
                        </div>
                        <div>
                            <span className="text-neutral-500 dark:text-neutral-400">Zuweisung</span>
                            <p className="font-medium text-neutral-900 dark:text-white">
                                {template.assignmentStrategy === 'fixed' ? 'Feste Person' : 'Rotation'}
                            </p>
                        </div>
                        <div>
                            <span className="text-neutral-500 dark:text-neutral-400">Status</span>
                            <p className={cn(
                                'font-medium',
                                template.isActive ? 'text-success-600' : 'text-neutral-500'
                            )}>
                                {template.isActive ? 'Aktiv' : 'Inaktiv'}
                            </p>
                        </div>
                    </div>

                    {/* Next assignee */}
                    {template.nextSuggestedAssignee && (
                        <div className="flex items-center gap-2 rounded-lg bg-brand-50 p-3 dark:bg-brand-900/20">
                            <UserCircle className="size-5 text-brand-500" />
                            <div>
                                <span className="text-xs text-brand-600 dark:text-brand-400">
                                    Nächste Zuweisung
                                </span>
                                <p className="font-medium text-brand-700 dark:text-brand-300">
                                    {getMemberName(template.nextSuggestedAssignee)}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Attachments */}
                    {template.attachments && template.attachments.length > 0 && (
                        <div className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-700">
                            <div className="mb-2 flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                                <Paperclip className="size-4" />
                                <span>{template.attachments.length} Anhänge</span>
                            </div>
                            <div className="space-y-1">
                                {template.attachments.map((att) => (
                                    <p key={att.id} className="truncate text-xs text-neutral-500">
                                        {att.originalName}
                                    </p>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="mt-6 flex justify-end">
                    <button
                        onClick={onClose}
                        className={cn(
                            'rounded-lg px-4 py-2 text-sm font-medium',
                            'bg-neutral-100 text-neutral-700 hover:bg-neutral-200',
                            'dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'
                        )}
                    >
                        Schließen
                    </button>
                </div>
            </div>
        </div>
    )
}
