import { type ReactNode, useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Brain, Loader2, Sparkles } from 'lucide-react'
import { useToast } from '../../../contexts/ToastContext'
import { cn } from '../../../utils/cn'
import { Button } from '../../common'
import { CollapsibleSection } from '../../ui'
import {
    groupsApi,
    type GroupLlmAgentFramework,
    type GroupLlmCoordinationMode,
    type GroupLlmIntent,
    type GroupLlmProvider,
} from '../../../api/groups'

interface LlmCoordinationSectionProps {
    groupId: string
    isAdmin: boolean
}

const PROVIDER_OPTIONS: Array<{ value: GroupLlmProvider; label: string }> = [
    { value: 'openai', label: 'OpenAI' },
    { value: 'anthropic', label: 'Anthropic' },
    { value: 'google', label: 'Google' },
    { value: 'openrouter', label: 'OpenRouter' },
    { value: 'custom', label: 'Custom' },
]

const MODE_OPTIONS: Array<{ value: GroupLlmCoordinationMode; label: string }> = [
    { value: 'planner', label: 'Planner' },
    { value: 'multi_agent', label: 'Multi-Agent' },
]

const FRAMEWORK_OPTIONS: Array<{ value: GroupLlmAgentFramework; label: string }> = [
    { value: 'langgraph', label: 'LangGraph' },
    { value: 'autogen', label: 'AutoGen' },
    { value: 'semantic-kernel', label: 'Semantic Kernel' },
    { value: 'custom', label: 'Custom' },
]

const INTENT_OPTIONS: Array<{ value: GroupLlmIntent; label: string }> = [
    { value: 'chat_summary', label: 'Chat Summary' },
    { value: 'task_creation', label: 'Task Creation' },
    { value: 'calendar_export', label: 'Calendar Export' },
    { value: 'moderation', label: 'Moderation' },
]

const LLM_QUERY_KEY = (groupId: string) => ['group-llm', groupId]

export const LlmCoordinationSection = ({
    groupId,
    isAdmin,
}: LlmCoordinationSectionProps) => {
    const toast = useToast()
    const queryClient = useQueryClient()

    const [form, setForm] = useState<{
        enabled: boolean
        provider: GroupLlmProvider
        model: string
        apiKey: string
        coordinationMode: GroupLlmCoordinationMode
        agentFramework: GroupLlmAgentFramework
        includeTasks: boolean
        includeMessages: boolean
        includeMemberProfiles: boolean
    } | null>(null)
    const [coordinationPrompt, setCoordinationPrompt] = useState(
        'Bitte erstelle einen fairen Wochenplan fuer die Gruppe und priorisiere offene Aufgaben.'
    )
    const [coordinationIntent, setCoordinationIntent] =
        useState<GroupLlmIntent>('task_creation')

    const { data: config, isLoading } = useQuery({
        queryKey: LLM_QUERY_KEY(groupId),
        queryFn: () => groupsApi.getLlmConfig(groupId),
        enabled: isAdmin,
    })

    useEffect(() => {
        if (!config) return
        setForm({
            enabled: config.enabled,
            provider: config.provider,
            model: config.model,
            apiKey: '',
            coordinationMode: config.coordinationMode,
            agentFramework: config.agentFramework,
            includeTasks: config.dataAccess.includeTasks,
            includeMessages: config.dataAccess.includeMessages,
            includeMemberProfiles: config.dataAccess.includeMemberProfiles,
        })
    }, [config])

    const saveMutation = useMutation({
        mutationFn: async () => {
            if (!form) throw new Error('Form nicht bereit')
            return groupsApi.updateLlmConfig(groupId, {
                enabled: form.enabled,
                provider: form.provider,
                model: form.model.trim(),
                ...(form.apiKey.trim() && { apiKey: form.apiKey.trim() }),
                coordinationMode: form.coordinationMode,
                agentFramework: form.agentFramework,
                dataAccess: {
                    includeTasks: form.includeTasks,
                    includeMessages: form.includeMessages,
                    includeMemberProfiles: form.includeMemberProfiles,
                },
            })
        },
        onSuccess: (updated) => {
            queryClient.setQueryData(LLM_QUERY_KEY(groupId), updated)
            setForm((previous) => {
                if (!previous) return previous
                return {
                    ...previous,
                    apiKey: '',
                }
            })
            toast.success('KI-Konfiguration gespeichert')
        },
        onError: () => {
            toast.error('KI-Konfiguration konnte nicht gespeichert werden')
        },
    })

    const coordinateMutation = useMutation({
        mutationFn: () =>
            groupsApi.coordinateLlm(groupId, {
                prompt: coordinationPrompt.trim(),
                intent: coordinationIntent,
            }),
        onError: () => {
            toast.error('Koordinationsplan konnte nicht erstellt werden')
        },
    })

    const summary = useMemo(() => {
        const result = coordinateMutation.data
        if (!result) return null
        return {
            agents: result.plan.agents,
            scopes: result.plan.toolScopes,
            tasks: result.context.tasks.length,
            messages: result.context.messages.length,
            profiles: result.context.memberProfiles.length,
            recommendation: result.runtime.frameworkRecommendation,
        }
    }, [coordinateMutation.data])

    if (!isAdmin) return null

    return (
        <CollapsibleSection
            icon={<Brain className="size-5 text-brand-500" />}
            title="KI-Koordination"
            defaultExpanded
        >
            {isLoading || !form || !config ? (
                <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
                    <Loader2 className="size-4 animate-spin" />
                    KI-Konfiguration wird geladen...
                </div>
            ) : (
                <>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        Hinterlege gruppenspezifisches Modell + API-Key und steuere, auf
                        welche Gruppendaten Agenten zugreifen duerfen.
                    </p>

                    <div className="grid gap-3">
                        <LlmToggle
                            label="KI aktivieren"
                            checked={form.enabled}
                            onChange={(checked) =>
                                setForm((previous) =>
                                    previous ? { ...previous, enabled: checked } : previous
                                )
                            }
                        />
                        <LlmField label="Provider">
                            <select
                                value={form.provider}
                                onChange={(event) =>
                                    setForm((previous) =>
                                        previous
                                            ? {
                                                  ...previous,
                                                  provider: event.target
                                                      .value as GroupLlmProvider,
                                              }
                                            : previous
                                    )
                                }
                                className={inputClassName}
                            >
                                {PROVIDER_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </LlmField>
                        <LlmField label="Model">
                            <input
                                value={form.model}
                                onChange={(event) =>
                                    setForm((previous) =>
                                        previous
                                            ? { ...previous, model: event.target.value }
                                            : previous
                                    )
                                }
                                placeholder="z. B. gpt-4.1-mini"
                                className={inputClassName}
                            />
                        </LlmField>
                        <LlmField
                            label={`API-Key (${config.hasApiKey ? `gesetzt: ${config.apiKeyHint || 'ja'}` : 'noch nicht gesetzt'})`}
                        >
                            <input
                                value={form.apiKey}
                                onChange={(event) =>
                                    setForm((previous) =>
                                        previous
                                            ? { ...previous, apiKey: event.target.value }
                                            : previous
                                    )
                                }
                                type="password"
                                placeholder="Neuen API-Key eingeben (optional)"
                                className={inputClassName}
                            />
                        </LlmField>
                        <LlmField label="Koordination">
                            <div className="grid gap-2 sm:grid-cols-2">
                                <select
                                    value={form.coordinationMode}
                                    onChange={(event) =>
                                        setForm((previous) =>
                                            previous
                                                ? {
                                                      ...previous,
                                                      coordinationMode: event.target
                                                          .value as GroupLlmCoordinationMode,
                                                  }
                                                : previous
                                        )
                                    }
                                    className={inputClassName}
                                >
                                    {MODE_OPTIONS.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    value={form.agentFramework}
                                    onChange={(event) =>
                                        setForm((previous) =>
                                            previous
                                                ? {
                                                      ...previous,
                                                      agentFramework: event.target
                                                          .value as GroupLlmAgentFramework,
                                                  }
                                                : previous
                                        )
                                    }
                                    className={inputClassName}
                                >
                                    {FRAMEWORK_OPTIONS.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </LlmField>
                        <LlmField label="Datenzugriffe">
                            <div className="grid gap-2 sm:grid-cols-3">
                                <LlmToggle
                                    label="Aufgaben"
                                    checked={form.includeTasks}
                                    onChange={(checked) =>
                                        setForm((previous) =>
                                            previous
                                                ? { ...previous, includeTasks: checked }
                                                : previous
                                        )
                                    }
                                />
                                <LlmToggle
                                    label="Gruppenchat"
                                    checked={form.includeMessages}
                                    onChange={(checked) =>
                                        setForm((previous) =>
                                            previous
                                                ? { ...previous, includeMessages: checked }
                                                : previous
                                        )
                                    }
                                />
                                <LlmToggle
                                    label="Profile"
                                    checked={form.includeMemberProfiles}
                                    onChange={(checked) =>
                                        setForm((previous) =>
                                            previous
                                                ? {
                                                      ...previous,
                                                      includeMemberProfiles: checked,
                                                  }
                                                : previous
                                        )
                                    }
                                />
                            </div>
                        </LlmField>
                    </div>

                    <div className="flex justify-end">
                        <Button
                            size="sm"
                            onClick={() => saveMutation.mutate()}
                            disabled={saveMutation.isPending || !form.model.trim()}
                        >
                            {saveMutation.isPending ? 'Speichere...' : 'KI speichern'}
                        </Button>
                    </div>

                    <div
                        className={cn(
                            'rounded-xl border p-3',
                            'border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900/30'
                        )}
                    >
                        <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-white">
                            <Sparkles className="size-4 text-brand-500" />
                            Agenten-Plan testen
                        </h4>
                        <div className="grid gap-2">
                            <select
                                value={coordinationIntent}
                                onChange={(event) =>
                                    setCoordinationIntent(
                                        event.target.value as GroupLlmIntent
                                    )
                                }
                                className={inputClassName}
                            >
                                {INTENT_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <textarea
                                value={coordinationPrompt}
                                onChange={(event) =>
                                    setCoordinationPrompt(event.target.value)
                                }
                                rows={3}
                                className={inputClassName}
                            />
                            <div className="flex justify-end">
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => coordinateMutation.mutate()}
                                    disabled={
                                        coordinateMutation.isPending ||
                                        !coordinationPrompt.trim()
                                    }
                                >
                                    {coordinateMutation.isPending
                                        ? 'Plane...'
                                        : 'Plan erzeugen'}
                                </Button>
                            </div>
                        </div>

                        {summary && (
                            <div className="mt-3 space-y-2 rounded-lg border border-brand-200 bg-white p-3 dark:border-brand-800 dark:bg-neutral-900">
                                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                    {summary.recommendation}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {summary.agents.map((agent) => (
                                        <span
                                            key={agent}
                                            className="rounded-full bg-brand-100 px-2 py-1 text-[11px] font-medium text-brand-700 dark:bg-brand-900/40 dark:text-brand-200"
                                        >
                                            {agent}
                                        </span>
                                    ))}
                                </div>
                                <div className="text-xs text-neutral-600 dark:text-neutral-300">
                                    Scopes: {summary.scopes.join(', ') || 'read-only'}
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-xs text-neutral-600 dark:text-neutral-300">
                                    <span>Tasks: {summary.tasks}</span>
                                    <span>Messages: {summary.messages}</span>
                                    <span>Profile: {summary.profiles}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </CollapsibleSection>
    )
}

interface LlmFieldProps {
    label: string
    children: ReactNode
}

const LlmField = ({ label, children }: LlmFieldProps) => (
    <div className="space-y-1">
        <label className="text-xs font-medium text-neutral-600 dark:text-neutral-300">
            {label}
        </label>
        {children}
    </div>
)

interface LlmToggleProps {
    label: string
    checked: boolean
    onChange: (checked: boolean) => void
}

const LlmToggle = ({ label, checked, onChange }: LlmToggleProps) => {
    return (
        <label
            className={cn(
                'inline-flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm',
                'border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800'
            )}
        >
            <span className="text-neutral-700 dark:text-neutral-200">{label}</span>
            <input
                type="checkbox"
                checked={checked}
                onChange={(event) => onChange(event.target.checked)}
                className="size-4 accent-brand-500"
            />
        </label>
    )
}

const inputClassName = cn(
    'w-full rounded-lg border px-3 py-2 text-sm',
    'border-neutral-200 bg-white text-neutral-900',
    'focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500',
    'dark:border-neutral-600 dark:bg-neutral-800 dark:text-white'
)
