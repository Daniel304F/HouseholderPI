import { Link } from 'react-router-dom'
import { ChevronRight, Users } from 'lucide-react'
import type { GroupListItem } from '../../api/groups'
import { cn } from '../../utils/cn'
import { RoleBadge } from './RoleBadge'

interface GroupCardProps {
    group: GroupListItem
}

const avatarBaseStyles = cn(
    'flex items-center justify-center',
    'size-14 rounded-2xl',
    'bg-gradient-to-br from-brand-100 via-white to-brand-200',
    'dark:from-brand-900/50 dark:via-neutral-900/50 dark:to-brand-800/50',
    'transition-all duration-300',
    'shadow-md shadow-brand-500/15 ring-2 ring-brand-50/70 dark:ring-brand-900/40'
)

const cardStyles = cn(
    'group flex w-full flex-wrap items-center gap-4 rounded-3xl p-5 sm:flex-nowrap',
    'bg-white/90 dark:bg-neutral-900/70 backdrop-blur-sm',
    'border border-neutral-200/80 dark:border-neutral-800/70',
    'text-left shadow-md shadow-brand-500/10',
    'transition-all duration-300 ease-out',
    'hover:border-brand-300/80 dark:hover:border-brand-600/60',
    'hover:shadow-xl hover:shadow-brand-500/15',
    'hover:-translate-y-1',
    'hover:bg-gradient-to-r hover:from-white hover:via-brand-50/50 hover:to-brand-100/40',
    'dark:hover:from-neutral-900 dark:hover:via-brand-950/30 dark:hover:to-brand-900/30',
    'active:translate-y-0 active:shadow-lg active:scale-[0.99]'
)

export const GroupCard = ({ group }: GroupCardProps) => {
    return (
        <Link to={`/dashboard/groups/${group.id}`} className={cardStyles}>
            <div
                className={cn(
                    avatarBaseStyles,
                    'group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-brand-500/25'
                )}
            >
                {group.picture ? (
                    <img
                        src={group.picture}
                        alt={group.name}
                        className="size-full rounded-2xl object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                ) : (
                    <Users className="size-7 text-brand-600 transition-transform duration-300 group-hover:scale-110 dark:text-brand-300" />
                )}
            </div>

            <div className="min-w-0 flex-1">
                <h3 className="break-words text-base font-semibold tracking-tight text-neutral-900 transition-colors duration-300 group-hover:text-brand-600 dark:text-neutral-50 dark:group-hover:text-brand-300">
                    {group.name}
                </h3>
                <p className="mt-0.5 break-words text-sm text-neutral-500 dark:text-neutral-400">
                    <span className="font-semibold text-neutral-700 dark:text-neutral-200">
                        {group.memberCount}
                    </span>{' '}
                    Mitglieder |{' '}
                    <span className="font-semibold text-brand-600 dark:text-brand-300">
                        {group.activeResidentsCount}
                    </span>{' '}
                    aktiv
                </p>
            </div>

            <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
                <RoleBadge role={group.role} />
                <ChevronRight className="hidden size-5 text-neutral-300 transition-all duration-300 group-hover:translate-x-1 group-hover:text-brand-500 sm:block dark:text-neutral-600" />
            </div>
        </Link>
    )
}
