import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    RefreshCw,
    Plus,
    Play,
    Pause,
    Trash2,
    Edit2,
    ChevronDown,
    ChevronUp,
    UserCircle,
    Loader2,
    Calendar,
    Paperclip,
    Upload,
    X,
    FileText,
    ImageIcon,
} from 'lucide-react'
import { cn } from '../../../utils/cn'
import { Button } from '../../common'
import { useToast } from '../../../contexts/ToastContext'
import {
    recurringTasksApi,
    type RecurringTaskTemplate,
    type CreateRecurringTaskInput,
} from '../../../api/recurringTasks'
import type { TaskAttachment } from '../../../api/tasks'
import type { GroupMember } from '../../../api/groups'
import { RecurringTaskForm } from './RecurringTaskForm'

interface RecurringTasksSectionProps {
    groupId: string
    members: GroupMember[]
    isAdmin: boolean
}

const FREQUENCY_LABELS: Record<string, string> = {
    daily: 'Täglich',
    weekly: 'Wöchentlich',
    biweekly: 'Alle 2 Wochen',
    monthly: 'Monatlich',
}

const WEEKDAY_LABELS = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']

export const RecurringTasksSection = ({
    groupId,
    members,
    isAdmin,
}: RecurringTasksSectionProps) => {
    const queryClient = useQueryClient()
    const toast = useToast()
    const [expanded, setExpanded] = useState(false)
    const [showForm, setShowForm] = useState(false)
    const [editingTemplate, setEditingTemplate] =
        useState<RecurringTaskTemplate | null>(null)

    const { data: templates = [], isLoading } = useQuery({
        queryKey: ['recurring-tasks', groupId],
        queryFn: () => recurringTasksApi.getTemplates(groupId),
        enabled: expanded,
    })

    const createMutation = useMutation({
        mutationFn: (data: CreateRecurringTaskInput) =>
            recurringTasksApi.createTemplate(groupId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['recurring-tasks', groupId],
            })
            setShowForm(false)
            toast.success('Vorlage erstellt!')
        },
        onError: () => {
            toast.error('Vorlage konnte nicht erstellt werden')
        },
    })

    const toggleMutation = useMutation({
        mutationFn: (templateId: string) =>
            recurringTasksApi.toggleTemplate(groupId, templateId),
        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: ['recurring-tasks', groupId],
            })
            toast.success(
                data.isActive ? 'Vorlage aktiviert' : 'Vorlage deaktiviert'
            )
        },
        onError: () => {
            toast.error('Status konnte nicht geändert werden')
        },
    })

    const deleteMutation = useMutation({
        mutationFn: (templateId: string) =>
            recurringTasksApi.deleteTemplate(groupId, templateId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['recurring-tasks', groupId],
            })
            toast.success('Vorlage gelöscht')
        },
        onError: () => {
            toast.error('Vorlage konnte nicht gelöscht werden')
        },
    })

    const generateMutation = useMutation({
        mutationFn: ({
            templateId,
            assignedTo,
        }: {
            templateId: string
            assignedTo?: string
        }) => recurringTasksApi.generateTask(groupId, templateId, assignedTo),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks', groupId] })
            queryClient.invalidateQueries({
                queryKey: ['recurring-tasks', groupId],
            })
            toast.success('Aufgabe aus Vorlage erstellt!')
        },
        onError: () => {
            toast.error('Aufgabe konnte nicht erstellt werden')
        },
    })

    const getMemberName = (userId: string) => {
        const member = members.find((m) => m.userId === userId)
        return member?.userName || 'Unbekannt'
    }

    const getDueDayLabel = (
        template: RecurringTaskTemplate
    ): string => {
        if (template.frequency === 'daily') return 'Jeden Tag'
        if (
            template.frequency === 'weekly' ||
            template.frequency === 'biweekly'
        ) {
            // Handle multiple weekdays
            const days = template.dueDays || []
            if (days.length === 0) return ''
            if (days.length === 7) return 'Jeden Tag'
            return days.map((d) => WEEKDAY_LABELS[d]).join(', ')
        }
        // Monthly: usually single day
        const monthDay = template.dueDays?.[0] || 1
        return `${monthDay}. des Monats`
    }

    if (!isAdmin) return null

    return (
        <div className="mb-6">
            <button
                onClick={() => setExpanded(!expanded)}
                className={cn(
                    'flex w-full items-center justify-between rounded-xl p-3',
                    'bg-neutral-50 dark:bg-neutral-800/50',
                    'transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800'
                )}
            >
                <div className="flex items-center gap-2">
                    <RefreshCw className="size-5 text-brand-500" />
                    <span className="font-medium text-neutral-900 dark:text-white">
                        Wiederkehrende Aufgaben
                    </span>
                    {templates.length > 0 && (
                        <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700 dark:bg-brand-900/30 dark:text-brand-400">
                            {templates.length}
                        </span>
                    )}
                </div>
                {expanded ? (
                    <ChevronUp className="size-5 text-neutral-500" />
                ) : (
                    <ChevronDown className="size-5 text-neutral-500" />
                )}
            </button>

            {expanded && (
                <div className="mt-3 space-y-3">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-4">
                            <Loader2 className="size-5 animate-spin text-neutral-400" />
                        </div>
                    ) : templates.length === 0 && !showForm ? (
                        <div className="rounded-lg border border-dashed border-neutral-200 p-4 text-center dark:border-neutral-700">
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                Keine wiederkehrenden Aufgaben
                            </p>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowForm(true)}
                                icon={<Plus className="size-4" />}
                                className="mt-2"
                            >
                                Vorlage erstellen
                            </Button>
                        </div>
                    ) : (
                        <>
                            {/* Templates list */}
                            {templates.map((template) => (
                                <TemplateCard
                                    key={template.id}
                                    groupId={groupId}
                                    template={template}
                                    getMemberName={getMemberName}
                                    getDueDayLabel={getDueDayLabel}
                                    onToggle={() =>
                                        toggleMutation.mutate(template.id)
                                    }
                                    onDelete={() =>
                                        deleteMutation.mutate(template.id)
                                    }
                                    onGenerate={(assignedTo) =>
                                        generateMutation.mutate({
                                            templateId: template.id,
                                            assignedTo,
                                        })
                                    }
                                    onEdit={() => setEditingTemplate(template)}
                                    isGenerating={generateMutation.isPending}
                                />
                            ))}

                            {/* Add button */}
                            {!showForm && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowForm(true)}
                                    icon={<Plus className="size-4" />}
                                    className="w-full"
                                >
                                    Neue Vorlage
                                </Button>
                            )}
                        </>
                    )}

                    {/* Create form */}
                    {showForm && (
                        <RecurringTaskForm
                            members={members}
                            onSubmit={(data) => createMutation.mutate(data)}
                            onCancel={() => setShowForm(false)}
                            isSubmitting={createMutation.isPending}
                        />
                    )}

                    {/* Edit form */}
                    {editingTemplate && (
                        <RecurringTaskForm
                            members={members}
                            template={editingTemplate}
                            onSubmit={async (data) => {
                                try {
                                    await recurringTasksApi.updateTemplate(
                                        groupId,
                                        editingTemplate.id,
                                        data
                                    )
                                    queryClient.invalidateQueries({
                                        queryKey: ['recurring-tasks', groupId],
                                    })
                                    setEditingTemplate(null)
                                    toast.success('Vorlage aktualisiert!')
                                } catch {
                                    toast.error('Vorlage konnte nicht aktualisiert werden')
                                }
                            }}
                            onCancel={() => setEditingTemplate(null)}
                            isSubmitting={false}
                        />
                    )}
                </div>
            )}
        </div>
    )
}

interface TemplateCardProps {
    groupId: string
    template: RecurringTaskTemplate
    getMemberName: (userId: string) => string
    getDueDayLabel: (template: RecurringTaskTemplate) => string
    onToggle: () => void
    onDelete: () => void
    onGenerate: (assignedTo?: string) => void
    onEdit: () => void
    isGenerating: boolean
}

const TemplateCard = ({
    groupId,
    template,
    getMemberName,
    getDueDayLabel,
    onToggle,
    onDelete,
    onGenerate,
    onEdit,
    isGenerating,
}: TemplateCardProps) => {
    const queryClient = useQueryClient()
    const toast = useToast()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [showGenerateConfirm, setShowGenerateConfirm] = useState(false)
    const [showAttachments, setShowAttachments] = useState(false)

    const uploadMutation = useMutation({
        mutationFn: (file: File) =>
            recurringTasksApi.uploadAttachment(groupId, template.id, file),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['recurring-tasks', groupId],
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
                queryKey: ['recurring-tasks', groupId],
            })
            toast.success('Anhang gelöscht')
        },
        onError: () => {
            toast.error('Anhang konnte nicht gelöscht werden')
        },
    })

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            uploadMutation.mutate(file)
        }
        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const isImageFile = (mimeType: string) => mimeType.startsWith('image/')
    const attachments = template.attachments || []

    return (
        <div
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
                            {FREQUENCY_LABELS[template.frequency]} •{' '}
                            {getDueDayLabel(template)}
                        </span>
                        {template.nextSuggestedAssignee && (
                            <span className="flex items-center gap-1">
                                <UserCircle className="size-3" />
                                Nächste: {getMemberName(template.nextSuggestedAssignee)}
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex gap-1">
                    <button
                        onClick={() => setShowAttachments(!showAttachments)}
                        className={cn(
                            'rounded-lg p-1.5 transition-colors',
                            'hover:bg-neutral-100 dark:hover:bg-neutral-700',
                            attachments.length > 0 && 'text-brand-500'
                        )}
                        title="Anhänge"
                    >
                        <Paperclip className="size-4" />
                        {attachments.length > 0 && (
                            <span className="sr-only">{attachments.length} Anhänge</span>
                        )}
                    </button>
                    <button
                        onClick={onToggle}
                        className={cn(
                            'rounded-lg p-1.5 transition-colors',
                            'hover:bg-neutral-100 dark:hover:bg-neutral-700'
                        )}
                        title={template.isActive ? 'Deaktivieren' : 'Aktivieren'}
                    >
                        {template.isActive ? (
                            <Pause className="size-4 text-neutral-500" />
                        ) : (
                            <Play className="size-4 text-brand-500" />
                        )}
                    </button>
                    <button
                        onClick={onEdit}
                        className={cn(
                            'rounded-lg p-1.5 transition-colors',
                            'hover:bg-neutral-100 dark:hover:bg-neutral-700'
                        )}
                        title="Bearbeiten"
                    >
                        <Edit2 className="size-4 text-neutral-500" />
                    </button>
                    <button
                        onClick={onDelete}
                        className={cn(
                            'rounded-lg p-1.5 transition-colors',
                            'hover:bg-error-50 dark:hover:bg-error-900/20'
                        )}
                        title="Löschen"
                    >
                        <Trash2 className="size-4 text-error-500" />
                    </button>
                </div>
            </div>

            {/* Attachments Section */}
            {showAttachments && (
                <div className="mt-3 border-t border-neutral-100 pt-3 dark:border-neutral-700">
                    <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                            Anhänge ({attachments.length})
                        </span>
                        <input
                            ref={fileInputRef}
                            type="file"
                            onChange={handleFileSelect}
                            className="hidden"
                            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploadMutation.isPending}
                            className={cn(
                                'flex items-center gap-1 rounded px-2 py-1 text-xs',
                                'bg-brand-50 text-brand-600 hover:bg-brand-100',
                                'dark:bg-brand-900/30 dark:text-brand-400 dark:hover:bg-brand-900/50',
                                'transition-colors disabled:opacity-50'
                            )}
                        >
                            {uploadMutation.isPending ? (
                                <Loader2 className="size-3 animate-spin" />
                            ) : (
                                <Upload className="size-3" />
                            )}
                            Hochladen
                        </button>
                    </div>
                    {attachments.length === 0 ? (
                        <p className="text-xs text-neutral-400 dark:text-neutral-500">
                            Keine Anhänge. Anhänge werden zu erstellten Aufgaben kopiert.
                        </p>
                    ) : (
                        <div className="space-y-1">
                            {attachments.map((attachment) => (
                                <div
                                    key={attachment.id}
                                    className={cn(
                                        'flex items-center gap-2 rounded-lg px-2 py-1.5',
                                        'bg-neutral-50 dark:bg-neutral-800/50'
                                    )}
                                >
                                    {isImageFile(attachment.mimeType) ? (
                                        <ImageIcon className="size-4 flex-shrink-0 text-brand-500" />
                                    ) : (
                                        <FileText className="size-4 flex-shrink-0 text-neutral-400" />
                                    )}
                                    <span className="min-w-0 flex-1 truncate text-xs text-neutral-700 dark:text-neutral-300">
                                        {attachment.originalName}
                                    </span>
                                    <button
                                        onClick={() => deleteAttachmentMutation.mutate(attachment.id)}
                                        disabled={deleteAttachmentMutation.isPending}
                                        className={cn(
                                            'rounded p-0.5 transition-colors',
                                            'hover:bg-error-100 dark:hover:bg-error-900/30',
                                            'text-neutral-400 hover:text-error-500'
                                        )}
                                        title="Anhang löschen"
                                    >
                                        <X className="size-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Generate button */}
            {template.isActive && (
                <div className="mt-3 border-t border-neutral-100 pt-3 dark:border-neutral-700">
                    {!showGenerateConfirm ? (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowGenerateConfirm(true)}
                            icon={<Plus className="size-4" />}
                            className="w-full"
                            disabled={isGenerating}
                        >
                            Aufgabe erstellen
                        </Button>
                    ) : (
                        <div className="space-y-2">
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                Aufgabe wird zugewiesen an:{' '}
                                <strong>
                                    {template.nextSuggestedAssignee
                                        ? getMemberName(template.nextSuggestedAssignee)
                                        : 'Niemand'}
                                </strong>
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => {
                                        onGenerate(template.nextSuggestedAssignee)
                                        setShowGenerateConfirm(false)
                                    }}
                                    disabled={isGenerating}
                                    className="flex-1"
                                >
                                    {isGenerating ? (
                                        <Loader2 className="size-4 animate-spin" />
                                    ) : (
                                        'Bestätigen'
                                    )}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowGenerateConfirm(false)}
                                >
                                    Abbrechen
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
