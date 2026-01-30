import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus, UserPlus, RefreshCw } from 'lucide-react'
import { Button } from '../../components/common'
import {
    GroupCard,
    GroupCardSkeleton,
    GroupsEmptyState,
    CreateGroupModal,
    JoinGroupModal,
} from '../../components/groups'
import { groupsApi } from '../../api/groups'

const groupsQueryKey = ['groups'] as const

export const Groups = () => {
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showJoinModal, setShowJoinModal] = useState(false)

    // Data fetching with React Query
    const {
        data: groups = [],
        isLoading,
        isError,
        refetch,
    } = useQuery({
        queryKey: groupsQueryKey,
        queryFn: groupsApi.getMyGroups,
    })

    // Loading State
    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <div className="h-8 w-40 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
                        <div className="h-5 w-24 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
                    </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <GroupCardSkeleton count={6} />
                </div>
            </div>
        )
    }

    // Error State
    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 py-12">
                <p className="text-neutral-500 dark:text-neutral-400">
                    Gruppen konnten nicht geladen werden.
                </p>
                <Button
                    variant="secondary"
                    onClick={() => refetch()}
                    icon={<RefreshCw className="size-5" />}
                >
                    Erneut versuchen
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                        Meine Gruppen
                    </h1>
                    <p className="text-neutral-500 dark:text-neutral-400">
                        {groups.length} Gruppe{groups.length !== 1 ? 'n' : ''}
                    </p>
                </div>
                {groups.length > 0 && (
                    <div className="flex gap-2">
                        <Button
                            variant="secondary"
                            onClick={() => setShowJoinModal(true)}
                            icon={<UserPlus className="size-5" />}
                        >
                            <span className="hidden sm:inline">Beitreten</span>
                        </Button>
                        <Button
                            onClick={() => setShowCreateModal(true)}
                            icon={<Plus className="size-5" />}
                        >
                            <span className="hidden sm:inline">Erstellen</span>
                        </Button>
                    </div>
                )}
            </div>

            {/* Groups List or Empty State */}
            {groups.length === 0 ? (
                <GroupsEmptyState
                    onCreateClick={() => setShowCreateModal(true)}
                    onJoinClick={() => setShowJoinModal(true)}
                />
            ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {groups.map((group) => (
                        <GroupCard key={group.id} group={group} />
                    ))}
                </div>
            )}

            {/* Modals */}
            <CreateGroupModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onCreated={() => refetch()}
            />
            <JoinGroupModal
                isOpen={showJoinModal}
                onClose={() => setShowJoinModal(false)}
                onJoined={() => refetch()}
            />
        </div>
    )
}
