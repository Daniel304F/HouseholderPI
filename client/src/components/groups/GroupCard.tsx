import { Link } from 'react-router-dom'
import { Users } from 'lucide-react'
import type { GroupListItem } from '../../api/groups'
import { cn } from '../../utils/cn'
import { RoleBadge } from './RoleBadge'

interface GroupCardProps {
    group: GroupListItem
}

const avatarBaseStyles = cn(
    'flex items-center justify-center',
    'size-14 rounded-xl',
    'bg-brand-100 dark:bg-brand-900/30',
    'transition-transform duration-300'
)

const cardStyles = cn(
    'group flex w-full items-center gap-4',
    'p-4 rounded-xl',
    'bg-white dark:bg-neutral-800',
    'border border-neutral-200 dark:border-neutral-700',
    'text-left',
    'transition-all duration-300 ease-out',
    'hover:border-brand-300 dark:hover:border-brand-600',
    'hover:shadow-lg hover:shadow-brand-500/10',
    'hover:-translate-y-1',
    'active:translate-y-0 active:shadow-md'
)

export const GroupCard = ({ group }: GroupCardProps) => {
    return (
        <Link to={`/dashboard/groups/${group.id}`} className={cardStyles}>
            {/* Group Avatar */}
            <div className={cn(avatarBaseStyles, 'group-hover:scale-105')}>
                {group.picture ? (
                    <img
                        src={group.picture}
                        alt={group.name}
                        className="size-full rounded-xl object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                ) : (
                    <Users className="text-brand-600 dark:text-brand-400 size-7 transition-transform duration-300 group-hover:scale-110" />
                )}
            </div>

            {/* Group Info */}
            <div className="min-w-0 flex-1">
                <h3 className="group-hover:text-brand-600 dark:group-hover:text-brand-400 truncate font-semibold text-neutral-900 transition-colors duration-300 dark:text-white">
                    {group.name}
                </h3>
                <p className="truncate text-sm text-neutral-500 dark:text-neutral-400">
                    {group.memberCount} Mitglieder •{' '}
                    {group.activeResidentsCount} aktiv
                </p>
            </div>

            {/* Role Badge */}
            <RoleBadge role={group.role} />
        </Link>
    )
}
