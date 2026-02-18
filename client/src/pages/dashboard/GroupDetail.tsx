import { lazy, Suspense, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Archive, Calendar as CalendarIcon, LayoutGrid, MessageSquare } from 'lucide-react'
import { groupsApi } from '../../api/groups'
import { recurringTasksApi, type RecurringTaskTemplate } from '../../api/recurringTasks'
import { tasksApi, type Task } from '../../api/tasks'
import type { ColumnStatus } from '../../components/board'
import { Tabs, type Tab } from '../../components/display'
import {
    ErrorState,
    PageHeader,
    PageSkeleton,
    Toolbar,
    type MemberInfo,
} from '../../components/groups/detail'
import { type CreateTaskData } from '../../components/tasks'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { useTaskModal } from '../../hooks/useTaskModal'
import { useTaskMutations } from '../../hooks/useTaskMutations'
import { useViewport } from '../../hooks/useViewport'
import {
    GroupDetailContent,
    type GroupDetailTabId,
} from './GroupDetailContent'
import { Skeleton } from '../../components/feedback'

const GroupDetailModal = lazy(() =>
    import('../../components/groups').then((module) => ({
        default: module.GroupDetailModal,
    }))
)

const CreateTaskModal = lazy(() =>
    import('../../components/tasks').then((module) => ({
        default: module.CreateTaskModal,
    }))
)

const EditTaskModal = lazy(() =>
    import('../../components/tasks').then((module) => ({
        default: module.EditTaskModal,
    }))
)

const TaskDetailView = lazy(() =>
    import('../../components/tasks').then((module) => ({
        default: module.TaskDetailView,
    }))
)

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
    {
        id: 'archive',
        label: 'Archiv',
        icon: <Archive className="size-4" />,
    },
]

export const GroupDetail = () => {
    const { groupId } = useParams<{ groupId: string }>()
    const navigate = useNavigate()
    const { user } = useAuth()
    const toast = useToast()
    const queryClient = useQueryClient()
    const { isDesktop } = useViewport()

    const [activeTab, setActiveTab] = useState<GroupDetailTabId>('board')
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedMembers, setSelectedMembers] = useState<string[]>([])
    const [selectedPriorities, setSelectedPriorities] = useState<string[]>([])
    const [selectedRecurring, setSelectedRecurring] = useState<RecurringTaskTemplate | null>(null)

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

    const { data: archivedTasks = [], isLoading: isLoadingArchived } = useQuery({
        queryKey: ['archivedTasks', groupId],
        queryFn: () => tasksApi.getArchivedTasks(groupId!),
        enabled: !!groupId && activeTab === 'archive',
    })

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
            toast.success('Aufgabe erfolgreich geloescht')
        },
        onError: (_error, action) => {
            const messages = {
                create: 'Aufgabe konnte nicht erstellt werden',
                update: 'Aufgabe konnte nicht aktualisiert werden',
                delete: 'Aufgabe konnte nicht geloescht werden',
            }
            toast.error(messages[action])
        },
    })

    const archiveCompleted = useMutation({
        mutationFn: () => tasksApi.archiveCompletedTasks(groupId!),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['tasks', groupId] })
            queryClient.invalidateQueries({ queryKey: ['archivedTasks', groupId] })
            toast.success(`${data.archivedCount} Aufgabe(n) archiviert`)
        },
        onError: () => {
            toast.error('Aufgaben konnten nicht archiviert werden')
        },
    })

    const tabs = useMemo(() => getTabs(isDesktop), [isDesktop])

    const members: MemberInfo[] = useMemo(
        () =>
            group?.members.map((member) => ({
                userId: member.userId,
                name: member.userName || member.userId,
                avatar: member.userAvatar,
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

    const currentMember = group?.members.find((member) => member.userId === user?.id)
    const isAdmin = currentMember?.role === 'owner' || currentMember?.role === 'admin'

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
            prev.includes(id) ? prev.filter((memberId) => memberId !== id) : [...prev, id]
        )
    }

    const togglePriority = (priority: string) => {
        setSelectedPriorities((prev) =>
            prev.includes(priority)
                ? prev.filter((item) => item !== priority)
                : [...prev, priority]
        )
    }

    const clearFilters = () => {
        setSelectedMembers([])
        setSelectedPriorities([])
    }

    if (isLoading) return <PageSkeleton />

    if (isError || !group) {
        return <ErrorState onBack={() => navigate(-1)} onRetry={() => refetch()} />
    }

    return (
        <div className="flex h-full flex-col gap-4 sm:gap-6">
            <PageHeader
                group={group}
                groupId={groupId!}
                isAdmin={isAdmin}
                onBack={() => navigate('/dashboard/groups')}
                onSettings={openSettingsModal}
            />

            <Tabs
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={(id) => setActiveTab(id as GroupDetailTabId)}
            />

            {activeTab === 'board' && (
                <Toolbar
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    onAddTask={() => openCreateModal('pending')}
                    members={members}
                    selectedMembers={selectedMembers}
                    onMemberToggle={toggleMember}
                    selectedPriorities={selectedPriorities}
                    onPriorityToggle={togglePriority}
                    onClearFilters={clearFilters}
                />
            )}

            <GroupDetailContent
                activeTab={activeTab}
                isDesktop={isDesktop}
                groupId={groupId}
                filteredTasks={filteredTasks}
                recurringTasks={recurringTasks}
                searchQuery={searchQuery}
                members={members}
                selectedRecurring={selectedRecurring}
                onTaskClick={openTaskDetail}
                onRecurringClick={setSelectedRecurring}
                onRecurringClose={() => setSelectedRecurring(null)}
                onAddTask={openCreateModal}
                onTaskMove={handleTaskMove}
                onArchiveCompleted={() => archiveCompleted.mutate()}
                archivedTasks={archivedTasks}
                isLoadingArchived={isLoadingArchived}
            />

            <Suspense fallback={<Skeleton height={320} className="rounded-xl" />}>
                <GroupDetailModal
                    group={showSettingsModal ? group : null}
                    onClose={closeSettingsModal}
                    onUpdated={() => {
                        refetch()
                        closeSettingsModal()
                    }}
                    currentUserId={user?.id || ''}
                />
            </Suspense>

            <Suspense fallback={<Skeleton height={320} className="rounded-xl" />}>
                <CreateTaskModal
                    isOpen={showCreateModal}
                    onClose={closeCreateModal}
                    onSubmit={handleCreateTask}
                    initialStatus={initialStatus}
                    members={group.members}
                />
            </Suspense>

            {showTaskDetail && selectedTask && groupId && (
                <Suspense fallback={<Skeleton height={320} className="rounded-xl" />}>
                    <TaskDetailView
                        groupId={groupId}
                        taskId={selectedTask.id}
                        onClose={closeTaskDetail}
                        onEditClick={editFromDetail}
                    />
                </Suspense>
            )}

            <Suspense fallback={<Skeleton height={320} className="rounded-xl" />}>
                <EditTaskModal
                    task={taskToEdit}
                    onClose={closeEditModal}
                    onSubmit={handleUpdateTask}
                    onDelete={handleDeleteTask}
                    members={group.members}
                />
            </Suspense>
        </div>
    )
}
