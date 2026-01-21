import { Users } from 'lucide-react'
import type { GroupListItem } from '../../api/groups'
import { cn } from '../../utils/cn'
import { RoleBadge } from './RoleBadge'

interface GroupCardProps {
    group: GroupListItem
    onClick: () => void
}

const avatarBaseStyles = cn(
    'flex items-center justify-center',
    'size-14 rounded-xl',
    'bg-brand-100 dark:bg-brand-900/30'
)

const cardStyles = cn(
    'flex w-full items-center gap-4',
    'p-4 rounded-xl',
    'bg-white dark:bg-neutral-800',
    'border border-neutral-200 dark:border-neutral-700',
    'text-left',
    'transition-all',
    'hover:border-brand-300 dark:hover:border-brand-600',
    'hover:shadow-md'
)

export const GroupCard = ({ group, onClick }: GroupCardProps) => {
    return (
        <button onClick={onClick} className={cardStyles}>
            {/* Group Avatar */}
            <div className={avatarBaseStyles}>
                {group.picture ? (
                    <img
                        src={group.picture}
                        alt={group.name}
                        className="size-full rounded-xl object-cover"
                    />
                ) : (
                    <Users className="text-brand-600 dark:text-brand-400 size-7" />
                )}
            </div>

            {/* Group Info */}
            <div className="min-w-0 flex-1">
                <h3 className="truncate font-semibold text-neutral-900 dark:text-white">
                    {group.name}
                </h3>
                <p className="truncate text-sm text-neutral-500 dark:text-neutral-400">
                    {group.memberCount} Mitglieder •{' '}
                    {group.activeResidentsCount} aktiv
                </p>
            </div>

            {/* Role Badge */}
            <RoleBadge role={group.role} />
        </button>
    )
}
