import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus, UserPlus } from 'lucide-react'
import { Button } from '../../components/common'
import { ErrorState } from '../../components/feedback'
import { PageHeaderSkeleton } from '../../components/feedback'
import {
    GroupCard,
    GroupCardSkeleton,
    GroupsEmptyState,
    CreateGroupModal,
    JoinGroupModal,
} from '../../components/groups'
import { groupsApi } from '../../api/groups'
import { useToast } from '../../contexts/ToastContext'

const groupsQueryKey = ['groups'] as const

export const Groups = () => {
    const toast = useToast()
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
            <section className="space-y-6">
                <PageHeaderSkeleton />
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <GroupCardSkeleton count={6} />
                </div>
            </section>
        )
    }

    // Error State
    if (isError) {
        return (
            <ErrorState
                title="Gruppen konnten nicht geladen werden"
                onRetry={() => refetch()}
            />
        )
    }

    return (
        <section className="space-y-6">
            <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                    <h1 className="break-words text-2xl font-bold text-neutral-900 dark:text-white">
                        Meine Gruppen
                    </h1>
                    <p className="text-neutral-500 dark:text-neutral-400">
                        {groups.length} Gruppe{groups.length !== 1 ? 'n' : ''}
                    </p>
                </div>
                {groups.length > 0 && (
                    <div className="hide-scrollbar overflow-x-auto pb-1 sm:pb-0">
                        <div className="flex gap-2">
                            <Button
                                variant="secondary"
                                onClick={() => setShowJoinModal(true)}
                                icon={<UserPlus className="size-5" />}
                                className="shrink-0 whitespace-nowrap"
                            >
                                <span className="hidden sm:inline">Beitreten</span>
                                <span className="sm:hidden">Join</span>
                            </Button>
                            <Button
                                onClick={() => setShowCreateModal(true)}
                                icon={<Plus className="size-5" />}
                                className="shrink-0 whitespace-nowrap"
                            >
                                <span className="hidden sm:inline">Erstellen</span>
                                <span className="sm:hidden">Neu</span>
                            </Button>
                        </div>
                    </div>
                )}
            </header>

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
                onCreated={() => {
                    refetch()
                    toast.success('Gruppe erfolgreich erstellt!')
                }}
            />
            <JoinGroupModal
                isOpen={showJoinModal}
                onClose={() => setShowJoinModal(false)}
                onJoined={() => {
                    refetch()
                    toast.success('Gruppe erfolgreich beigetreten!')
                }}
            />
        </section>
    )
}
