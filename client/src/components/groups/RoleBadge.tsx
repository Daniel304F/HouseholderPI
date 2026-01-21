import { Crown, Shield, User } from 'lucide-react'
import type { GroupMember } from '../../api/groups'
import { cn } from '../../utils/cn'

type Role = GroupMember['role']

const roleConfig: Record<
    Role,
    { icon: typeof Crown; label: string; styles: string }
> = {
    owner: {
        icon: Crown,
        label: 'Owner',
        styles: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    },
    admin: {
        icon: Shield,
        label: 'Admin',
        styles: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    },
    member: {
        icon: User,
        label: 'Mitglied',
        styles: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300',
    },
}

interface RoleIconProps {
    role: Role
    className?: string
}

export const RoleIcon = ({ role, className }: RoleIconProps) => {
    const Icon = roleConfig[role].icon
    return <Icon className={cn('size-4', className)} />
}

interface RoleBadgeProps {
    role: Role
}

export const RoleBadge = ({ role }: RoleBadgeProps) => {
    const { label, styles } = roleConfig[role]

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1 rounded-full px-2 py-0.5',
                'text-xs font-medium',
                styles
            )}
        >
            <RoleIcon role={role} />
            {label}
        </span>
    )
}
