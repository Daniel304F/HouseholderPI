import { cn } from '../../utils/cn'
import { ArchivedTasksList, KanbanBoard, type ColumnStatus } from '../../components/board'
import { GroupChat } from '../../components/chat'
import { RecurringTaskModal, TaskCalendar } from '../../components/calendar'
import type { MemberInfo } from '../../components/groups/detail'
import type { Task } from '../../api/tasks'
import type { RecurringTaskTemplate } from '../../api/recurringTasks'

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
                            <KanbanBoard
                                tasks={filteredTasks}
                                onTaskClick={onTaskClick}
                                onAddTask={onAddTask}
                                onTaskMove={onTaskMove}
                                searchQuery={searchQuery}
                                members={members}
                                onArchiveCompleted={onArchiveCompleted}
                            />
                        </div>

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

                {activeTab === 'archive' && (
                    <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-neutral-900 sm:p-6">
                        <ArchivedTasksList
                            tasks={archivedTasks}
                            onTaskClick={onTaskClick}
                            isLoading={isLoadingArchived}
                        />
                    </div>
                )}

                {activeTab === 'messages' && groupId && (
                    <div className="h-full rounded-xl bg-white shadow-sm dark:bg-neutral-900">
                        <GroupChat groupId={groupId} />
                    </div>
                )}
            </main>

            {selectedRecurring && (
                <RecurringTaskModal
                    template={selectedRecurring}
                    members={members}
                    onClose={onRecurringClose}
                />
            )}
        </>
    )
}
