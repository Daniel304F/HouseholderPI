import { lazy, Suspense } from 'react'
import {
    EmptyState,
    ErrorState,
    FilterSection,
    FlatTaskList,
    GroupedTaskList,
    MyTasksSkeleton,
    PageHeader,
    TaskStatsGrid,
} from '../../components/page-my-tasks'
import { useMyTasksPage } from '../../hooks'
import { Skeleton } from '../../components/feedback'

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

export const MyTasks = () => {
    const {
        searchQuery,
        setSearchQuery,
        statusFilter,
        setStatusFilter,
        sortBy,
        setSortBy,
        showFilters,
        toggleFilters,
        filteredTasks,
        stats,
        tasksByGroup,
        isLoading,
        isError,
        retry,
        selectedTask,
        closeTaskDetail,
        taskToEdit,
        closeEditModal,
        groupMembers,
        handleTaskClick,
        handleEditClick,
        handleCompleteTask,
        handleUpdateTask,
        handleDeleteTask,
    } = useMyTasksPage()

    if (isLoading) {
        return <MyTasksSkeleton />
    }

    if (isError) {
        return <ErrorState onRetry={retry} />
    }

    return (
        <div className="ui-page-enter space-y-6">
            <PageHeader />

            <section className="ui-panel ui-panel-hover p-4 sm:p-5">
                <TaskStatsGrid stats={stats} />
            </section>

            <section className="ui-panel ui-focus-ring p-4 sm:p-5">
                <FilterSection
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                    statusFilter={statusFilter}
                    onStatusFilterChange={setStatusFilter}
                    showFilters={showFilters}
                    onToggleFilters={toggleFilters}
                />
            </section>

            <section className="ui-panel ui-panel-hover p-4 sm:p-5">
                {filteredTasks.length === 0 ? (
                    <EmptyState hasFilters={!!searchQuery || statusFilter !== null} />
                ) : sortBy === 'groupName' ? (
                    <GroupedTaskList
                        tasksByGroup={tasksByGroup}
                        onTaskClick={handleTaskClick}
                        onEditClick={handleEditClick}
                        onComplete={handleCompleteTask}
                    />
                ) : (
                    <FlatTaskList
                        tasks={filteredTasks}
                        onTaskClick={handleTaskClick}
                        onEditClick={handleEditClick}
                        onComplete={handleCompleteTask}
                    />
                )}
            </section>

            {selectedTask && (
                <Suspense fallback={<Skeleton height={320} className="rounded-xl" />}>
                    <TaskDetailView
                        groupId={selectedTask.groupId}
                        taskId={selectedTask.id}
                        onClose={closeTaskDetail}
                        onEditClick={() => handleEditClick(selectedTask)}
                    />
                </Suspense>
            )}

            {taskToEdit && (
                <Suspense fallback={<Skeleton height={320} className="rounded-xl" />}>
                    <EditTaskModal
                        task={taskToEdit}
                        onClose={closeEditModal}
                        onSubmit={handleUpdateTask}
                        onDelete={handleDeleteTask}
                        members={groupMembers}
                    />
                </Suspense>
            )}
        </div>
    )
}
