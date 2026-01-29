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
        styles: cn(
            'bg-gradient-to-r from-amber-50 via-white to-yellow-100',
            'dark:from-amber-900/40 dark:via-neutral-900/40 dark:to-yellow-900/35',
            'text-amber-700 dark:text-amber-200',
            'border border-amber-200/70 dark:border-amber-800/60',
            'shadow-md shadow-amber-500/15 ring-1 ring-amber-100/60 dark:ring-amber-900/40'
        ),
    },
    admin: {
        icon: Shield,
        label: 'Admin',
        styles: cn(
            'bg-gradient-to-r from-blue-50 via-white to-indigo-100',
            'dark:from-blue-900/45 dark:via-neutral-900/40 dark:to-indigo-900/35',
            'text-blue-700 dark:text-blue-200',
            'border border-blue-200/70 dark:border-blue-800/60',
            'shadow-md shadow-blue-500/15 ring-1 ring-blue-100/60 dark:ring-blue-900/40'
        ),
    },
    member: {
        icon: User,
        label: 'Mitglied',
        styles: cn(
            'bg-white/80 dark:bg-neutral-800/70 backdrop-blur-sm',
            'text-neutral-600 dark:text-neutral-200',
            'border border-neutral-200/70 dark:border-neutral-700/70',
            'shadow-sm shadow-neutral-400/10 dark:shadow-black/20'
        ),
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
    const { icon: Icon, label, styles } = roleConfig[role]

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-3 py-1',
                'text-xs font-semibold tracking-tight',
                'transition-all duration-250',
                'hover:scale-[1.04] hover:shadow-lg',
                styles
            )}
        >
            <Icon className="size-3.5" />
            {label}
        </span>
    )
}
