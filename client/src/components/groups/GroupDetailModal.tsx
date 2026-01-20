import { useState, useEffect } from 'react'
import { X, Copy, Check, RefreshCw, Shield, Trash2, LogOut } from 'lucide-react'
import { Button } from '../Button'
import { groupsApi, type Group } from '../../api/groups'
import { RoleIcon, RoleBadge } from './RoleBadge'

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
    const [copied, setCopied] = useState(false)
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

    const copyInviteCode = async () => {
        await navigator.clipboard.writeText(localGroup.inviteCode)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

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
            <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 dark:bg-neutral-800">
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
                        className="rounded-lg p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Invite Code */}
                {isAdmin && (
                    <div className="mb-6 rounded-xl bg-neutral-50 p-4 dark:bg-neutral-700/50">
                        <p className="mb-2 text-sm font-medium text-neutral-600 dark:text-neutral-300">
                            Invite-Code
                        </p>
                        <div className="flex items-center gap-2">
                            <code className="flex-1 rounded-lg bg-white px-4 py-2 font-mono text-lg tracking-widest dark:bg-neutral-800">
                                {localGroup.inviteCode}
                            </code>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={copyInviteCode}
                                icon={
                                    copied ? (
                                        <Check className="h-4 w-4" />
                                    ) : (
                                        <Copy className="h-4 w-4" />
                                    )
                                }
                            >
                                {copied ? 'Kopiert!' : 'Kopieren'}
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleRegenerateCode}
                                isLoading={isRegenerating}
                                icon={<RefreshCw className="h-4 w-4" />}
                            />
                        </div>
                    </div>
                )}

                {/* Members */}
                <div className="mb-6">
                    <h3 className="mb-3 font-semibold text-neutral-900 dark:text-white">
                        Mitglieder
                    </h3>
                    <div className="space-y-2">
                        {localGroup.members.map((member) => (
                            <div
                                key={member.userId}
                                className="flex items-center justify-between rounded-xl bg-neutral-50 p-3 dark:bg-neutral-700/50"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="bg-brand-100 dark:bg-brand-900/30 flex h-10 w-10 items-center justify-center rounded-full">
                                        <RoleIcon role={member.role} />
                                    </div>
                                    <div>
                                        <p className="font-medium text-neutral-900 dark:text-white">
                                            {member.userId === currentUserId
                                                ? 'Du'
                                                : `User ${member.userId.slice(0, 8)}...`}
                                        </p>
                                        <RoleBadge role={member.role} />
                                    </div>
                                </div>

                                {/* Member Actions */}
                                {isAdmin &&
                                    member.userId !== currentUserId &&
                                    member.role !== 'owner' && (
                                        <div className="flex items-center gap-1">
                                            {isOwner && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleRoleChange(
                                                            member.userId,
                                                            member.role ===
                                                                'admin'
                                                                ? 'member'
                                                                : 'admin'
                                                        )
                                                    }
                                                    icon={
                                                        <Shield className="h-4 w-4" />
                                                    }
                                                />
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    handleRemoveMember(
                                                        member.userId
                                                    )
                                                }
                                                icon={
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                }
                                            />
                                        </div>
                                    )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                    {!isOwner && (
                        <Button
                            variant="secondary"
                            onClick={handleLeave}
                            isLoading={isLeaving}
                            icon={<LogOut className="h-4 w-4" />}
                            fullWidth
                        >
                            Gruppe verlassen
                        </Button>
                    )}
                    {isOwner && (
                        <>
                            {showDeleteConfirm ? (
                                <div className="flex gap-2">
                                    <Button
                                        variant="secondary"
                                        onClick={() =>
                                            setShowDeleteConfirm(false)
                                        }
                                        fullWidth
                                    >
                                        Abbrechen
                                    </Button>
                                    <Button
                                        variant="primary"
                                        onClick={handleDelete}
                                        isLoading={isDeleting}
                                        className="!bg-red-500 hover:!bg-red-600"
                                        fullWidth
                                    >
                                        Ja, löschen
                                    </Button>
                                </div>
                            ) : (
                                <Button
                                    variant="secondary"
                                    onClick={() => setShowDeleteConfirm(true)}
                                    icon={
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                    }
                                    fullWidth
                                >
                                    Gruppe löschen
                                </Button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
