import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
    Calendar,
    Edit2,
    Paperclip,
    Pause,
    Play,
    Trash2,
    UserCircle,
} from 'lucide-react'
import { cn } from '../../../utils/cn'
import type { GroupMember } from '../../../api/groups'
import { recurringTasksApi, type RecurringTaskTemplate } from '../../../api/recurringTasks'
import { useToast } from '../../../contexts/ToastContext'
import { IconButton } from '../../common'
import { RecurringTemplateAttachments } from './RecurringTemplateAttachments'
import { RecurringTemplateGenerateAction } from './RecurringTemplateGenerateAction'
import {
    FREQUENCY_LABELS,
    getDueDayLabel,
    getMemberName,
    getRecurringTemplatesQueryKey,
} from './recurringTasks.utils'

interface RecurringTemplateCardProps {
    groupId: string
    template: RecurringTaskTemplate
    members: GroupMember[]
    isGenerating: boolean
    onToggle: () => void
    onDelete: () => void
    onEdit: () => void
    onGenerate: (assignedTo?: string) => void
}

export const RecurringTemplateCard = ({
    groupId,
    template,
    members,
    isGenerating,
    onToggle,
    onDelete,
    onEdit,
    onGenerate,
}: RecurringTemplateCardProps) => {
    const queryClient = useQueryClient()
    const toast = useToast()
    const [showAttachments, setShowAttachments] = useState(false)

    const uploadMutation = useMutation({
        mutationFn: (file: File) =>
            recurringTasksApi.uploadAttachment(groupId, template.id, file),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: getRecurringTemplatesQueryKey(groupId),
            })
            toast.success('Datei hochgeladen!')
        },
        onError: () => {
            toast.error('Datei konnte nicht hochgeladen werden')
        },
    })

    const deleteAttachmentMutation = useMutation({
        mutationFn: (attachmentId: string) =>
            recurringTasksApi.deleteAttachment(groupId, template.id, attachmentId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: getRecurringTemplatesQueryKey(groupId),
            })
            toast.success('Anhang geloescht')
        },
        onError: () => {
            toast.error('Anhang konnte nicht geloescht werden')
        },
    })

    const attachments = template.attachments || []
    const nextAssigneeName = template.nextSuggestedAssignee
        ? getMemberName(members, template.nextSuggestedAssignee)
        : 'Niemand'

    return (
        <article
            className={cn(
                'rounded-lg border p-3',
                template.isActive
                    ? 'border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800'
                    : 'border-neutral-200 bg-neutral-50 opacity-60 dark:border-neutral-700 dark:bg-neutral-800/50'
            )}
        >
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                    <h4 className="font-medium text-neutral-900 dark:text-white">
                        {template.title}
                    </h4>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                        <span className="flex items-center gap-1">
                            <Calendar className="size-3" />
                            {FREQUENCY_LABELS[template.frequency]} - {getDueDayLabel(template)}
                        </span>
                        {template.nextSuggestedAssignee && (
                            <span className="flex items-center gap-1">
                                <UserCircle className="size-3" />
                                Naechste: {nextAssigneeName}
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex gap-1">
                    <IconButton
                        icon={<Paperclip className="size-4" />}
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAttachments((prev) => !prev)}
                        className={cn(attachments.length > 0 && 'text-brand-500')}
                        aria-label={`Anhaenge${attachments.length > 0 ? ` (${attachments.length})` : ''}`}
                    />
                    <IconButton
                        icon={
                            template.isActive ? (
                                <Pause className="size-4" />
                            ) : (
                                <Play className="size-4 text-brand-500" />
                            )
                        }
                        variant="ghost"
                        size="sm"
                        onClick={onToggle}
                        aria-label={template.isActive ? 'Deaktivieren' : 'Aktivieren'}
                    />
                    <IconButton
                        icon={<Edit2 className="size-4" />}
                        variant="ghost"
                        size="sm"
                        onClick={onEdit}
                        aria-label="Bearbeiten"
                    />
                    <IconButton
                        icon={<Trash2 className="size-4 text-error-500" />}
                        variant="ghost"
                        size="sm"
                        onClick={onDelete}
                        aria-label="Loeschen"
                    />
                </div>
            </div>

            {showAttachments && (
                <RecurringTemplateAttachments
                    attachments={attachments}
                    isUploading={uploadMutation.isPending}
                    isDeleting={deleteAttachmentMutation.isPending}
                    onUploadFile={(file) => uploadMutation.mutate(file)}
                    onDeleteAttachment={(attachmentId) =>
                        deleteAttachmentMutation.mutate(attachmentId)
                    }
                />
            )}

            <RecurringTemplateGenerateAction
                isActive={template.isActive}
                isGenerating={isGenerating}
                nextAssigneeName={nextAssigneeName}
                onGenerate={() => onGenerate(template.nextSuggestedAssignee)}
            />
        </article>
    )
}
