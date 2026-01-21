import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
    ArrowLeft,
    Settings,
    Plus,
    Users,
    CheckCircle2,
    Clock,
    AlertCircle,
} from 'lucide-react'
import { Button } from '../../components/Button'
import { IconButton } from '../../components/IconButton'
import { groupsApi } from '../../api/groups'
import { cn } from '../../utils/cn'
import { TaskCard, TaskCardSkeleton } from '../../components/tasks'
import { GroupDetailModal } from '../../components/groups'
import { useAuth } from '../../contexts/AuthContext'
import { useState } from 'react'

// Temporäre Mock-Daten für Aufgaben
const mockTasks = [
    {
        id: '1',
        title: 'Küche putzen',
        description: 'Arbeitsflächen abwischen, Boden wischen',
        status: 'pending' as const,
        priority: 'high' as const,
        assignedTo: 'Max',
        dueDate: new Date(Date.now() + 86400000).toISOString(),
    },
    {
        id: '2',
        title: 'Müll rausbringen',
        description: 'Gelber Sack und Restmüll',
        status: 'in-progress' as const,
        priority: 'medium' as const,
        assignedTo: 'Anna',
        dueDate: new Date(Date.now() + 172800000).toISOString(),
    },
    {
        id: '3',
        title: 'Bad reinigen',
        description: 'Toilette, Waschbecken, Dusche',
        status: 'completed' as const,
        priority: 'low' as const,
        assignedTo: 'Tom',
        dueDate: new Date(Date.now() - 86400000).toISOString(),
    },
    {
        id: '4',
        title: 'Einkaufen gehen',
        description: 'Milch, Brot, Eier, Käse',
        status: 'pending' as const,
        priority: 'medium' as const,
        assignedTo: null,
        dueDate: new Date(Date.now() + 259200000).toISOString(),
    },
]

export const GroupDetail = () => {
    const { groupId } = useParams<{ groupId: string }>()
    const navigate = useNavigate()
    const { user } = useAuth()
    const [showSettingsModal, setShowSettingsModal] = useState(false)

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

    // Aufgaben-Statistiken berechnen
    const stats = {
        total: mockTasks.length,
        pending: mockTasks.filter((t) => t.status === 'pending').length,
        inProgress: mockTasks.filter((t) => t.status === 'in-progress').length,
        completed: mockTasks.filter((t) => t.status === 'completed').length,
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                {/* Header Skeleton */}
                <div className="flex items-center gap-4">
                    <div className="size-10 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-700" />
                    <div className="flex-1 space-y-2">
                        <div className="h-7 w-48 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
                        <div className="h-5 w-32 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
                    </div>
                </div>

                {/* Stats Skeleton */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-20 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-700"
                        />
                    ))}
                </div>

                {/* Tasks Skeleton */}
                <div className="space-y-3">
                    <TaskCardSkeleton count={4} />
                </div>
            </div>
        )
    }

    if (isError || !group) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 py-12">
                <AlertCircle className="size-12 text-red-500" />
                <p className="text-neutral-500 dark:text-neutral-400">
                    Gruppe konnte nicht geladen werden.
                </p>
                <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => navigate(-1)}>
                        Zurück
                    </Button>
                    <Button onClick={() => refetch()}>Erneut versuchen</Button>
                </div>
            </div>
        )
    }

    const currentMember = group.members.find((m) => m.userId === user?.id)
    const isAdmin =
        currentMember?.role === 'owner' || currentMember?.role === 'admin'

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <IconButton
                    icon={<ArrowLeft className="size-5" />}
                    onClick={() => navigate('/dashboard/groups')}
                    variant="ghost"
                    aria-label="Zurück zu Gruppen"
                />

                <div className="flex flex-1 items-center gap-4">
                    {/* Group Avatar */}
                    <div
                        className={cn(
                            'flex size-12 items-center justify-center rounded-xl',
                            'bg-brand-100 dark:bg-brand-900/30'
                        )}
                    >
                        {group.picture ? (
                            <img
                                src={group.picture}
                                alt={group.name}
                                className="size-full rounded-xl object-cover"
                            />
                        ) : (
                            <Users className="text-brand-600 dark:text-brand-400 size-6" />
                        )}
                    </div>

                    {/* Group Info */}
                    <div className="min-w-0 flex-1">
                        <h1 className="truncate text-xl font-bold text-neutral-900 sm:text-2xl dark:text-white">
                            {group.name}
                        </h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            {group.members.length} Mitglieder •{' '}
                            {group.activeResidentsCount} aktiv
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    {isAdmin && (
                        <IconButton
                            icon={<Settings className="size-5" />}
                            onClick={() => setShowSettingsModal(true)}
                            variant="ghost"
                            aria-label="Gruppeneinstellungen"
                        />
                    )}
                    <Button
                        onClick={() => {
                            /* TODO: Add task modal */
                        }}
                        icon={<Plus className="size-5" />}
                    >
                        <span className="hidden sm:inline">Aufgabe</span>
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatCard
                    label="Gesamt"
                    value={stats.total}
                    icon={<CheckCircle2 className="size-5" />}
                    color="brand"
                />
                <StatCard
                    label="Offen"
                    value={stats.pending}
                    icon={<AlertCircle className="size-5" />}
                    color="warning"
                />
                <StatCard
                    label="In Arbeit"
                    value={stats.inProgress}
                    icon={<Clock className="size-5" />}
                    color="info"
                />
                <StatCard
                    label="Erledigt"
                    value={stats.completed}
                    icon={<CheckCircle2 className="size-5" />}
                    color="success"
                />
            </div>

            {/* Tasks Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                        Aufgaben
                    </h2>
                    {/* TODO: Filter/Sort controls */}
                </div>

                {mockTasks.length === 0 ? (
                    <div
                        className={cn(
                            'flex flex-col items-center justify-center gap-4 rounded-xl py-12',
                            'border border-dashed border-neutral-300 dark:border-neutral-600'
                        )}
                    >
                        <CheckCircle2 className="size-12 text-neutral-400" />
                        <p className="text-neutral-500 dark:text-neutral-400">
                            Noch keine Aufgaben vorhanden
                        </p>
                        <Button icon={<Plus className="size-5" />}>
                            Erste Aufgabe erstellen
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {mockTasks.map((task) => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                onClick={() => {
                                    /* TODO: Open task detail */
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Settings Modal */}
            <GroupDetailModal
                group={showSettingsModal ? group : null}
                onClose={() => setShowSettingsModal(false)}
                onUpdated={() => {
                    refetch()
                    setShowSettingsModal(false)
                }}
                currentUserId={user?.id || ''}
            />
        </div>
    )
}

// Stat Card Component
interface StatCardProps {
    label: string
    value: number
    icon: React.ReactNode
    color: 'brand' | 'warning' | 'info' | 'success'
}

const colorStyles = {
    brand: 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400',
    warning:
        'bg-warning-50 dark:bg-warning-900/20 text-warning-600 dark:text-warning-400',
    info: 'bg-info-50 dark:bg-info-900/20 text-info-600 dark:text-info-400',
    success:
        'bg-success-50 dark:bg-success-900/20 text-success-600 dark:text-success-400',
}

const StatCard = ({ label, value, icon, color }: StatCardProps) => {
    return (
        <div
            className={cn(
                'flex items-center gap-3 rounded-xl p-4',
                'bg-white dark:bg-neutral-800',
                'border border-neutral-200 dark:border-neutral-700',
                'transition-all duration-300',
                'hover:-translate-y-0.5 hover:shadow-md'
            )}
        >
            <div
                className={cn(
                    'flex size-10 items-center justify-center rounded-lg',
                    colorStyles[color]
                )}
            >
                {icon}
            </div>
            <div>
                <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                    {value}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {label}
                </p>
            </div>
        </div>
    )
}
