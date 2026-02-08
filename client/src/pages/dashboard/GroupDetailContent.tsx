import { lazy, Suspense } from 'react'
import { cn } from '../../utils/cn'
import { type ColumnStatus } from '../../components/board'
import type { MemberInfo } from '../../components/groups/detail'
import type { Task } from '../../api/tasks'
import type { RecurringTaskTemplate } from '../../api/recurringTasks'
import { Skeleton } from '../../components/feedback'

const ArchivedTasksList = lazy(() =>
    import('../../components/board').then((module) => ({
        default: module.ArchivedTasksList,
    }))
)

const KanbanBoard = lazy(() =>
    import('../../components/board').then((module) => ({
        default: module.KanbanBoard,
    }))
)

const GroupChat = lazy(() =>
    import('../../components/chat').then((module) => ({
        default: module.GroupChat,
    }))
)

const RecurringTaskModal = lazy(() =>
    import('../../components/calendar').then((module) => ({
        default: module.RecurringTaskModal,
    }))
)

const TaskCalendar = lazy(() =>
    import('../../components/calendar').then((module) => ({
        default: module.TaskCalendar,
    }))
)

export type GroupDetailTabId = 'board' | 'calendar' | 'messages' | 'archive'

interface GroupDetailContentProps {
    activeTab: GroupDetailTabId
    isDesktop: boolean
    groupId: string | undefined
    filteredTasks: Task[]
    recurringTasks: RecurringTaskTemplate[]
    searchQuery: string
    members: MemberInfo[]
    selectedRecurring: RecurringTaskTemplate | null
    onTaskClick: (task: Task) => void
    onRecurringClick: (template: RecurringTaskTemplate) => void
    onRecurringClose: () => void
    onAddTask: (status: ColumnStatus) => void
    onTaskMove: (taskId: string, newStatus: ColumnStatus) => Promise<void>
    onArchiveCompleted: () => void
    archivedTasks: Task[]
    isLoadingArchived: boolean
}

export const GroupDetailContent = ({
    activeTab,
    isDesktop,
    groupId,
    filteredTasks,
    recurringTasks,
    searchQuery,
    members,
    selectedRecurring,
    onTaskClick,
    onRecurringClick,
    onRecurringClose,
    onAddTask,
    onTaskMove,
    onArchiveCompleted,
    archivedTasks,
    isLoadingArchived,
}: GroupDetailContentProps) => {
    return (
        <>
            <main className="min-h-0 flex-1">
                {activeTab === 'board' && (
                    <div className={cn('h-full', isDesktop && 'grid grid-cols-3 gap-6')}>
                        <div className={cn(isDesktop ? 'col-span-2' : 'h-full')}>
                            <Suspense fallback={<Skeleton height={520} className="rounded-xl" />}>
                                <KanbanBoard
                                    tasks={filteredTasks}
                                    onTaskClick={onTaskClick}
                                    onAddTask={onAddTask}
                                    onTaskMove={onTaskMove}
                                    searchQuery={searchQuery}
                                    members={members}
                                    onArchiveCompleted={onArchiveCompleted}
                                />
                            </Suspense>
                        </div>

                        {isDesktop && (
                            <aside className="ui-panel ui-panel-hover h-full overflow-auto p-4">
                                <Suspense fallback={<Skeleton height={480} className="rounded-xl" />}>
                                    <TaskCalendar
                                        tasks={filteredTasks}
                                        recurringTasks={recurringTasks}
                                        onTaskClick={onTaskClick}
                                        onRecurringClick={onRecurringClick}
                                    />
                                </Suspense>
                            </aside>
                        )}
                    </div>
                )}

                {activeTab === 'calendar' && !isDesktop && (
                    <div className="ui-panel ui-panel-hover p-4">
                        <Suspense fallback={<Skeleton height={480} className="rounded-xl" />}>
                            <TaskCalendar
                                tasks={filteredTasks}
                                recurringTasks={recurringTasks}
                                onTaskClick={onTaskClick}
                                onRecurringClick={onRecurringClick}
                            />
                        </Suspense>
                    </div>
                )}

                {activeTab === 'archive' && (
                    <div className="ui-panel ui-panel-hover p-4 sm:p-6">
                        <Suspense fallback={<Skeleton height={420} className="rounded-xl" />}>
                            <ArchivedTasksList
                                tasks={archivedTasks}
                                onTaskClick={onTaskClick}
                                isLoading={isLoadingArchived}
                            />
                        </Suspense>
                    </div>
                )}

                {activeTab === 'messages' && groupId && (
                    <div className="ui-panel ui-panel-hover h-full">
                        <Suspense fallback={<Skeleton height={480} className="rounded-xl" />}>
                            <GroupChat groupId={groupId} />
                        </Suspense>
                    </div>
                )}
            </main>

            {selectedRecurring && (
                <Suspense fallback={<Skeleton height={300} className="rounded-xl" />}>
                    <RecurringTaskModal
                        template={selectedRecurring}
                        members={members}
                        onClose={onRecurringClose}
                    />
                </Suspense>
            )}
        </>
    )
}
