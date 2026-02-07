import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Shield, Loader2 } from 'lucide-react'
import { cn } from '../../../utils/cn'
import { useToast } from '../../../contexts/ToastContext'
import { CollapsibleSection } from '../../ui'
import {
    groupsApi,
    type GroupPermissions,
    type PermissionLevel,
} from '../../../api/groups'

interface PermissionsSectionProps {
    groupId: string
    permissions: GroupPermissions
    isOwner: boolean
}

const PERMISSION_LABELS: Record<keyof GroupPermissions, string> = {
    createTask: 'Aufgaben erstellen',
    assignTask: 'Aufgaben zuweisen',
    editTask: 'Aufgaben bearbeiten',
    deleteTask: 'Aufgaben löschen',
    manageRecurringTasks: 'Wiederkehrende Aufgaben verwalten',
}

const LEVEL_LABELS: Record<PermissionLevel, string> = {
    owner: 'Nur Owner',
    admin: 'Admins & Owner',
    member: 'Alle Mitglieder',
    nobody: 'Niemand',
}

const LEVEL_ORDER: PermissionLevel[] = ['member', 'admin', 'owner', 'nobody']

export const PermissionsSection = ({
    groupId,
    permissions,
    isOwner,
}: PermissionsSectionProps) => {
    const queryClient = useQueryClient()
    const toast = useToast()
    const [localPermissions, setLocalPermissions] =
        useState<GroupPermissions>(permissions)

    const updateMutation = useMutation({
        mutationFn: (newPermissions: Partial<GroupPermissions>) =>
            groupsApi.updatePermissions(groupId, newPermissions),
        onSuccess: (data) => {
            setLocalPermissions(data)
            queryClient.invalidateQueries({ queryKey: ['group', groupId] })
            toast.success('Berechtigungen aktualisiert')
        },
        onError: () => {
            toast.error('Berechtigungen konnten nicht aktualisiert werden')
        },
    })

    const handlePermissionChange = (
        permission: keyof GroupPermissions,
        level: PermissionLevel
    ) => {
        const newPermissions = { ...localPermissions, [permission]: level }
        setLocalPermissions(newPermissions)
        updateMutation.mutate({ [permission]: level })
    }

    if (!isOwner) return null

    return (
        <CollapsibleSection
            icon={<Shield className="size-5 text-brand-500" />}
            title="Berechtigungen"
        >
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Lege fest, welche Rollen welche Aktionen durchführen
                können.
            </p>

            {(
                Object.keys(PERMISSION_LABELS) as Array<
                    keyof GroupPermissions
                >
            ).map((permission) => (
                <PermissionRow
                    key={permission}
                    label={PERMISSION_LABELS[permission]}
                    value={localPermissions[permission]}
                    onChange={(level) =>
                        handlePermissionChange(permission, level)
                    }
                    isUpdating={updateMutation.isPending}
                />
            ))}
        </CollapsibleSection>
    )
}

interface PermissionRowProps {
    label: string
    value: PermissionLevel
    onChange: (level: PermissionLevel) => void
    isUpdating: boolean
}

const PermissionRow = ({
    label,
    value,
    onChange,
    isUpdating,
}: PermissionRowProps) => {
    return (
        <div
            className={cn(
                'flex items-center justify-between gap-4 rounded-lg border p-3',
                'border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800'
            )}
        >
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {label}
            </span>
            <div className="flex items-center gap-2">
                {isUpdating && (
                    <Loader2 className="size-4 animate-spin text-neutral-400" />
                )}
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value as PermissionLevel)}
                    disabled={isUpdating}
                    className={cn(
                        'rounded-lg border px-3 py-1.5 text-sm',
                        'border-neutral-200 bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-700',
                        'focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500',
                        'text-neutral-900 dark:text-white',
                        'disabled:opacity-50'
                    )}
                >
                    {LEVEL_ORDER.map((level) => (
                        <option key={level} value={level}>
                            {LEVEL_LABELS[level]}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    )
}
