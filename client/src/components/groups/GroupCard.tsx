import { Users } from 'lucide-react'
import type { GroupListItem } from '../../api/groups'
import { RoleBadge } from './RoleBadge'

interface GroupCardProps {
    group: GroupListItem
    onClick: () => void
}

export const GroupCard = ({ group, onClick }: GroupCardProps) => {
    return (
        <button
            onClick={onClick}
            className="hover:border-brand-300 dark:hover:border-brand-600 flex w-full items-center gap-4 rounded-xl border border-neutral-200 bg-white p-4 text-left transition-all hover:shadow-md dark:border-neutral-700 dark:bg-neutral-800"
        >
            {/* Group Avatar */}
            <div className="bg-brand-100 dark:bg-brand-900/30 flex h-14 w-14 items-center justify-center rounded-xl">
                {group.picture ? (
                    <img
                        src={group.picture}
                        alt={group.name}
                        className="h-full w-full rounded-xl object-cover"
                    />
                ) : (
                    <Users className="text-brand-600 dark:text-brand-400 h-7 w-7" />
                )}
            </div>

            {/* Group Info */}
            <div className="flex-1">
                <h3 className="font-semibold text-neutral-900 dark:text-white">
                    {group.name}
                </h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {group.memberCount} Mitglieder •{' '}
                    {group.activeResidentsCount} aktiv
                </p>
            </div>

            {/* Role Badge */}
            <RoleBadge role={group.role} />
        </button>
    )
}
