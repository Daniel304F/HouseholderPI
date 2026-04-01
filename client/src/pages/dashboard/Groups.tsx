import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus, UserPlus, Users } from 'lucide-react'
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
import { PageIntro } from '../../components/ui'
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
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
            <PageIntro
                title="Meine Gruppen"
                description={`${groups.length} Gruppe${groups.length !== 1 ? 'n' : ''} · Erstellt und beigetreten`}
                icon={<Users className="size-5 text-brand-600 dark:text-brand-400" />}
                action={
                    groups.length > 0 ? (
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
                    ) : undefined
                }
            />

            {/* Groups List or Empty State */}
            {groups.length === 0 ? (
                <GroupsEmptyState
                    onCreateClick={() => setShowCreateModal(true)}
                    onJoinClick={() => setShowJoinModal(true)}
                />
            ) : (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
