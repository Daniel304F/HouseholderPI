import { Shield, Trash2 } from 'lucide-react'
import { Button } from '../../Button'
import { RoleIcon, RoleBadge } from '../RoleBadge'
import { cn } from '../../../utils/cn'
import type { GroupMember } from '../../../api/groups'

interface MemberListProps {
    members: GroupMember[]
    currentUserId: string
    isOwner: boolean
    isAdmin: boolean
    onRoleChange: (memberId: string, newRole: 'admin' | 'member') => void
    onRemoveMember: (memberId: string) => void
}

export const MemberList = ({
    members,
    currentUserId,
    isOwner,
    isAdmin,
    onRoleChange,
    onRemoveMember,
}: MemberListProps) => {
    return (
        <div className="mb-6">
            <h3 className="mb-3 font-semibold text-neutral-900 dark:text-white">
                Mitglieder
            </h3>
            <div className="space-y-2">
                {members.map((member) => (
                    <div
                        key={member.userId}
                        className={cn(
                            'flex items-center justify-between rounded-xl p-3',
                            'bg-neutral-50 dark:bg-neutral-700/50',
                            'transition-colors duration-200',
                            'hover:bg-neutral-100 dark:hover:bg-neutral-700'
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <div
                                className={cn(
                                    'flex size-10 items-center justify-center rounded-full',
                                    'bg-brand-100 dark:bg-brand-900/30'
                                )}
                            >
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
                                                onRoleChange(
                                                    member.userId,
                                                    member.role === 'admin'
                                                        ? 'member'
                                                        : 'admin'
                                                )
                                            }
                                            icon={<Shield className="size-4" />}
                                        />
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                            onRemoveMember(member.userId)
                                        }
                                        icon={
                                            <Trash2 className="size-4 text-red-500" />
                                        }
                                    />
                                </div>
                            )}
                    </div>
                ))}
            </div>
        </div>
    )
}
