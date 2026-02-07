import { EditTaskModal, TaskDetailView } from '../../components/tasks'
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
        <div className="space-y-6">
            <PageHeader />

            <TaskStatsGrid stats={stats} />

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

            {selectedTask && (
                <TaskDetailView
                    groupId={selectedTask.groupId}
                    taskId={selectedTask.id}
                    onClose={closeTaskDetail}
                    onEditClick={() => handleEditClick(selectedTask)}
                />
            )}

            {taskToEdit && (
                <EditTaskModal
                    task={taskToEdit}
                    onClose={closeEditModal}
                    onSubmit={handleUpdateTask}
                    onDelete={handleDeleteTask}
                    members={groupMembers}
                />
            )}
        </div>
    )
}
