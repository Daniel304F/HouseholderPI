import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { groupsApi, type Group } from '../../api/groups'
import { cn } from '../../utils/cn'
import { InviteCodeSection, MemberList, GroupActions } from './detail'

interface GroupDetailModalProps {
    group: Group | null
    onClose: () => void
    onUpdated: () => void
    currentUserId: string
}

export const GroupDetailModal = ({
    group,
    onClose,
    onUpdated,
    currentUserId,
}: GroupDetailModalProps) => {
    const [isRegenerating, setIsRegenerating] = useState(false)
    const [isLeaving, setIsLeaving] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [localGroup, setLocalGroup] = useState<Group | null>(group)

    useEffect(() => {
        setLocalGroup(group)
        setShowDeleteConfirm(false)
    }, [group])

    if (!localGroup) return null

    const currentMember = localGroup.members.find(
        (m) => m.userId === currentUserId
    )
    const isOwner = currentMember?.role === 'owner'
    const isAdmin = currentMember?.role === 'admin' || isOwner

    const handleRegenerateCode = async () => {
        setIsRegenerating(true)
        try {
            const newCode = await groupsApi.regenerateInviteCode(localGroup.id)
            setLocalGroup({ ...localGroup, inviteCode: newCode })
        } catch {
            // Error handling
        } finally {
            setIsRegenerating(false)
        }
    }

    const handleLeave = async () => {
        setIsLeaving(true)
        try {
            await groupsApi.leaveGroup(localGroup.id)
            onUpdated()
            onClose()
        } catch {
            // Error handling
        } finally {
            setIsLeaving(false)
        }
    }

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            await groupsApi.deleteGroup(localGroup.id)
            onUpdated()
            onClose()
        } catch {
            // Error handling
        } finally {
            setIsDeleting(false)
        }
    }

    const handleRoleChange = async (
        memberId: string,
        newRole: 'admin' | 'member'
    ) => {
        try {
            await groupsApi.updateMember(localGroup.id, memberId, {
                role: newRole,
            })
            setLocalGroup({
                ...localGroup,
                members: localGroup.members.map((m) =>
                    m.userId === memberId ? { ...m, role: newRole } : m
                ),
            })
        } catch {
            // Error handling
        }
    }

    const handleRemoveMember = async (memberId: string) => {
        try {
            await groupsApi.removeMember(localGroup.id, memberId)
            setLocalGroup({
                ...localGroup,
                members: localGroup.members.filter(
                    (m) => m.userId !== memberId
                ),
            })
        } catch {
            // Error handling
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div
                className={cn(
                    'max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl p-6',
                    'bg-white dark:bg-neutral-800'
                )}
            >
                {/* Header */}
                <div className="mb-6 flex items-start justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                            {localGroup.name}
                        </h2>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            {localGroup.members.length} Mitglieder •{' '}
                            {localGroup.activeResidentsCount} aktive Bewohner
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className={cn(
                            'rounded-lg p-2 transition-colors',
                            'hover:bg-neutral-100 dark:hover:bg-neutral-700'
                        )}
                    >
                        <X className="size-5" />
                    </button>
                </div>

                {/* Invite Code */}
                {isAdmin && (
                    <InviteCodeSection
                        inviteCode={localGroup.inviteCode}
                        onRegenerate={handleRegenerateCode}
                        isRegenerating={isRegenerating}
                    />
                )}

                {/* Members */}
                <MemberList
                    members={localGroup.members}
                    currentUserId={currentUserId}
                    isOwner={isOwner}
                    isAdmin={isAdmin}
                    onRoleChange={handleRoleChange}
                    onRemoveMember={handleRemoveMember}
                />

                {/* Actions */}
                <GroupActions
                    isOwner={isOwner}
                    isLeaving={isLeaving}
                    isDeleting={isDeleting}
                    showDeleteConfirm={showDeleteConfirm}
                    onLeave={handleLeave}
                    onDelete={handleDelete}
                    onToggleDeleteConfirm={setShowDeleteConfirm}
                />
            </div>
        </div>
    )
}
