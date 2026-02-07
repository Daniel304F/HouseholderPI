import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2, Plus, RefreshCw } from 'lucide-react'
import type { GroupMember } from '../../../api/groups'
import {
    recurringTasksApi,
    type CreateRecurringTaskInput,
    type RecurringTaskTemplate,
} from '../../../api/recurringTasks'
import { useToast } from '../../../contexts/ToastContext'
import { Button } from '../../common'
import { CollapsibleSection } from '../../ui'
import { RecurringTaskForm } from './RecurringTaskForm'
import { RecurringTemplateCard } from './RecurringTemplateCard'
import { getRecurringTemplatesQueryKey } from './recurringTasks.utils'

interface RecurringTasksSectionProps {
    groupId: string
    members: GroupMember[]
    isAdmin: boolean
}

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

    const recurringTemplatesQueryKey = getRecurringTemplatesQueryKey(groupId)

    const { data: templates = [], isLoading } = useQuery({
        queryKey: recurringTemplatesQueryKey,
        queryFn: () => recurringTasksApi.getTemplates(groupId),
        enabled: expanded,
    })

    const invalidateTemplates = () => {
        queryClient.invalidateQueries({ queryKey: recurringTemplatesQueryKey })
    }

    const createMutation = useMutation({
        mutationFn: (data: CreateRecurringTaskInput) =>
            recurringTasksApi.createTemplate(groupId, data),
        onSuccess: () => {
            invalidateTemplates()
            setShowForm(false)
            toast.success('Vorlage erstellt!')
        },
        onError: () => {
            toast.error('Vorlage konnte nicht erstellt werden')
        },
    })

    const updateMutation = useMutation({
        mutationFn: ({
            templateId,
            data,
        }: {
            templateId: string
            data: CreateRecurringTaskInput
        }) => recurringTasksApi.updateTemplate(groupId, templateId, data),
        onSuccess: () => {
            invalidateTemplates()
            setEditingTemplate(null)
            toast.success('Vorlage aktualisiert!')
        },
        onError: () => {
            toast.error('Vorlage konnte nicht aktualisiert werden')
        },
    })

    const toggleMutation = useMutation({
        mutationFn: (templateId: string) =>
            recurringTasksApi.toggleTemplate(groupId, templateId),
        onSuccess: (template) => {
            invalidateTemplates()
            toast.success(
                template.isActive ? 'Vorlage aktiviert' : 'Vorlage deaktiviert'
            )
        },
        onError: () => {
            toast.error('Status konnte nicht geaendert werden')
        },
    })

    const deleteMutation = useMutation({
        mutationFn: (templateId: string) =>
            recurringTasksApi.deleteTemplate(groupId, templateId),
        onSuccess: () => {
            invalidateTemplates()
            toast.success('Vorlage geloescht')
        },
        onError: () => {
            toast.error('Vorlage konnte nicht geloescht werden')
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
            invalidateTemplates()
            toast.success('Aufgabe aus Vorlage erstellt!')
        },
        onError: () => {
            toast.error('Aufgabe konnte nicht erstellt werden')
        },
    })

    if (!isAdmin) return null

    return (
        <CollapsibleSection
            icon={<RefreshCw className="size-5 text-brand-500" />}
            title="Wiederkehrende Aufgaben"
            badge={
                templates.length > 0 ? (
                    <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700 dark:bg-brand-900/30 dark:text-brand-400">
                        {templates.length}
                    </span>
                ) : undefined
            }
            expanded={expanded}
            onExpandedChange={setExpanded}
        >
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
                    {templates.map((template) => (
                        <RecurringTemplateCard
                            key={template.id}
                            groupId={groupId}
                            template={template}
                            members={members}
                            onToggle={() => toggleMutation.mutate(template.id)}
                            onDelete={() => deleteMutation.mutate(template.id)}
                            onEdit={() => setEditingTemplate(template)}
                            onGenerate={(assignedTo) =>
                                generateMutation.mutate({
                                    templateId: template.id,
                                    assignedTo,
                                })
                            }
                            isGenerating={generateMutation.isPending}
                        />
                    ))}

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

            {showForm && (
                <RecurringTaskForm
                    members={members}
                    onSubmit={(data) => createMutation.mutate(data)}
                    onCancel={() => setShowForm(false)}
                    isSubmitting={createMutation.isPending}
                />
            )}

            {editingTemplate && (
                <RecurringTaskForm
                    members={members}
                    template={editingTemplate}
                    onSubmit={(data) =>
                        updateMutation.mutate({
                            templateId: editingTemplate.id,
                            data,
                        })
                    }
                    onCancel={() => setEditingTemplate(null)}
                    isSubmitting={updateMutation.isPending}
                />
            )}
        </CollapsibleSection>
    )
}
