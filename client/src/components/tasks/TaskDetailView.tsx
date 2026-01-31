import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import { Button } from '../common'
import { BaseModal } from '../modal'
import { ModalWidth, ModalHeight } from '../modal/types'
import { tasksApi } from '../../api/tasks'
import { TaskSubtasks } from './TaskSubtasks'
import { TaskLinks } from './TaskLinks'
import { TaskDetailSidebar } from './TaskDetailSidebar'
import { TaskComments } from './TaskComments'

interface TaskDetailViewProps {
    groupId: string
    taskId: string
    onClose: () => void
    onEditClick: () => void
}

/**
 * Modal component for viewing task details
 * Composed of TaskSubtasks, TaskLinks, and TaskDetailSidebar sub-components
 */
export const TaskDetailView = ({
    groupId,
    taskId,
    onClose,
    onEditClick,
}: TaskDetailViewProps) => {
    const { data: taskDetails, isLoading } = useQuery({
        queryKey: ['taskDetails', groupId, taskId],
        queryFn: () => tasksApi.getTaskWithDetails(groupId, taskId),
        enabled: !!groupId && !!taskId,
    })

    const { data: allTasks = [] } = useQuery({
        queryKey: ['tasks', groupId],
        queryFn: () => tasksApi.getGroupTasks(groupId),
        enabled: !!groupId,
    })

    if (isLoading) {
        return (
            <BaseModal
                isOpen={true}
                onClose={onClose}
                title="Aufgabe lädt..."
                width={ModalWidth.XLarge}
                height={ModalHeight.Large}
            >
                <LoadingState />
            </BaseModal>
        )
    }

    if (!taskDetails) {
        return (
            <BaseModal
                isOpen={true}
                onClose={onClose}
                title="Fehler"
                width={ModalWidth.Medium}
            >
                <ErrorState onClose={onClose} />
            </BaseModal>
        )
    }

    return (
        <BaseModal
            isOpen={true}
            onClose={onClose}
            title={taskDetails.title}
            width={ModalWidth.XLarge}
            height={ModalHeight.Large}
            footer={
                <div className="flex justify-between">
                    <Button variant="secondary" onClick={onClose}>
                        <ArrowLeft className="mr-2 size-4" />
                        Zurück
                    </Button>
                    <Button onClick={onEditClick}>Bearbeiten</Button>
                </div>
            }
        >
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Main Content - Left 2 Columns */}
                <div className="space-y-6 lg:col-span-2">
                    {/* Description */}
                    <TaskDescription
                        description={taskDetails.description}
                    />

                    {/* Subtasks Section */}
                    <TaskSubtasks
                        groupId={groupId}
                        taskId={taskId}
                        subtasks={taskDetails.subtasks}
                    />

                    {/* Linked Tasks Section */}
                    <TaskLinks
                        groupId={groupId}
                        taskId={taskId}
                        linkedTasks={taskDetails.linkedTasks}
                        allTasks={allTasks}
                    />

                    {/* Comments Section */}
                    <TaskComments groupId={groupId} taskId={taskId} />
                </div>

                {/* Sidebar - Right Column */}
                <TaskDetailSidebar
                    groupId={groupId}
                    taskId={taskId}
                    taskDetails={{
                        status: taskDetails.status,
                        priority: taskDetails.priority,
                        assignedTo: taskDetails.assignedTo,
                        assignedToName: taskDetails.assignedToName,
                        dueDate: taskDetails.dueDate,
                        groupName: taskDetails.groupName,
                        createdBy: taskDetails.createdBy,
                        createdByName: taskDetails.createdByName,
                        createdAt: taskDetails.createdAt,
                    }}
                />
            </div>
        </BaseModal>
    )
}

/**
 * Loading spinner state
 */
const LoadingState = () => (
    <div className="flex items-center justify-center py-12">
        <div className="border-brand-500 h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
    </div>
)

/**
 * Error state with close button
 */
const ErrorState = ({ onClose }: { onClose: () => void }) => (
    <div className="flex flex-col items-center gap-4 py-8">
        <AlertCircle className="text-error-500 size-12" />
        <p className="text-neutral-500 dark:text-neutral-400">
            Aufgabe konnte nicht geladen werden.
        </p>
        <Button onClick={onClose}>Schließen</Button>
    </div>
)

/**
 * Task description section
 */
const TaskDescription = ({ description }: { description?: string }) => (
    <div>
        <h3 className="mb-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
            Beschreibung
        </h3>
        <p className="text-neutral-600 dark:text-neutral-400">
            {description || 'Keine Beschreibung vorhanden.'}
        </p>
    </div>
)
