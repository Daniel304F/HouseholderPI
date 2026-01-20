import { Crown, Shield, User } from 'lucide-react'
import type { GroupMember } from '../../api/groups'

interface RoleIconProps {
    role: GroupMember['role']
}

export const RoleIcon = ({ role }: RoleIconProps) => {
    switch (role) {
        case 'owner':
            return <Crown className="h-4 w-4 text-yellow-500" />
        case 'admin':
            return <Shield className="h-4 w-4 text-blue-500" />
        default:
            return <User className="h-4 w-4 text-neutral-400" />
    }
}

interface RoleBadgeProps {
    role: GroupMember['role']
}

export const RoleBadge = ({ role }: RoleBadgeProps) => {
    const styles = {
        owner: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
        admin: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        member: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300',
    }

    const labels = {
        owner: 'Owner',
        admin: 'Admin',
        member: 'Mitglied',
    }

    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${styles[role]}`}
        >
            <RoleIcon role={role} />
            {labels[role]}
        </span>
    )
}
