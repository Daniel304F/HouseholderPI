import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
    LayoutGrid,
    MessageSquare,
    Calendar as CalendarIcon,
} from 'lucide-react'
import { useState, useMemo } from 'react'
import { groupsApi } from '../../api/groups'
import { tasksApi, type Task } from '../../api/tasks'
import { recurringTasksApi } from '../../api/recurringTasks'
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
    type CreateRecurringData,
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
    const handleAddTask = (status: ColumnStatus) => openCreateModal(status)

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
                onCreateRecurring={handleCreateRecurring}
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
        </div>
    )
}

interface ContentAreaProps {
    activeTab: TabId
    isDesktop: boolean
    groupId: string | undefined
    filteredTasks: Task[]
    recurringTasks: ReturnType<
        typeof recurringTasksApi.getTemplates
    > extends Promise<infer T>
        ? T
        : never
    searchQuery: string
    members: MemberInfo[]
    onTaskClick: (task: Task) => void
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
