import { useState, useEffect, useCallback } from 'react'
import { Plus, UserPlus } from 'lucide-react'
import { Button } from '../../components/Button'
import {
    GroupCard,
    GroupCardSkeleton,
    GroupsEmptyState,
    CreateGroupModal,
    JoinGroupModal,
    GroupDetailModal,
} from '../../components/groups'
import { groupsApi, type GroupListItem, type Group } from '../../api/groups'
import { useAuth } from '../../contexts/AuthContext'

export const Groups = () => {
    const { user } = useAuth()
    const [groups, setGroups] = useState<GroupListItem[]>([])
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showJoinModal, setShowJoinModal] = useState(false)

    const fetchGroups = useCallback(async () => {
        try {
            const data = await groupsApi.getMyGroups()
            setGroups(data)
        } catch {
            // Error handling
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchGroups()
    }, [fetchGroups])

    const handleGroupClick = async (groupId: string) => {
        try {
            const group = await groupsApi.getGroup(groupId)
            setSelectedGroup(group)
        } catch {
            // Error handling
        }
    }

    const handleUpdated = () => {
        fetchGroups()
        setSelectedGroup(null)
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                {/* Header Skeleton */}
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <div className="h-8 w-40 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
                        <div className="h-5 w-24 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
                    </div>
                </div>

                {/* Cards Skeleton */}
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <GroupCardSkeleton count={6} />
                </div>
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
                            icon={<UserPlus className="h-5 w-5" />}
                        >
                            <span className="hidden sm:inline">Beitreten</span>
                        </Button>
                        <Button
                            onClick={() => setShowCreateModal(true)}
                            icon={<Plus className="h-5 w-5" />}
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
                        <GroupCard
                            key={group.id}
                            group={group}
                            onClick={() => handleGroupClick(group.id)}
                        />
                    ))}
                </div>
            )}

            {/* Modals */}
            <CreateGroupModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onCreated={fetchGroups}
            />
            <JoinGroupModal
                isOpen={showJoinModal}
                onClose={() => setShowJoinModal(false)}
                onJoined={fetchGroups}
            />
            <GroupDetailModal
                group={selectedGroup}
                onClose={() => setSelectedGroup(null)}
                onUpdated={handleUpdated}
                currentUserId={user?.id || ''}
            />
        </div>
    )
}
