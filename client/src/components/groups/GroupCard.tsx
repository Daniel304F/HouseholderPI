import { Link } from 'react-router-dom'
import { ArrowRight, Users } from 'lucide-react'
import type { GroupListItem } from '../../api/groups'
import { cn } from '../../utils/cn'
import { RoleBadge } from './RoleBadge'

interface GroupCardProps {
    group: GroupListItem
}

export const GroupCard = ({ group }: GroupCardProps) => {
    return (
        <Link
            to={`/dashboard/groups/${group.id}`}
            className={cn(
                'group relative flex flex-col overflow-hidden rounded-3xl text-left',
                /* background */
                'bg-white/92 dark:bg-neutral-900/75 backdrop-blur-sm',
                /* border */
                'border border-neutral-200/80 dark:border-neutral-800/60',
                /* shadow */
                'shadow-[0_3px_18px_-4px_hsl(149,58%,50%,0.09),0_1px_3px_0_rgb(0_0_0_/0.04)]',
                'dark:shadow-[0_3px_18px_-4px_rgb(0_0_0_/0.3)]',
                /* transitions */
                'transition-all duration-300 ease-out',
                /* hover */
                'hover:-translate-y-1.5',
                'hover:border-brand-200/80 dark:hover:border-brand-600/55',
                'hover:shadow-[0_16px_40px_-8px_hsl(149,58%,50%,0.18),0_4px_12px_-2px_rgb(0_0_0_/0.07)]',
                'dark:hover:shadow-[0_16px_40px_-8px_rgb(0_0_0_/0.45)]',
                /* active */
                'active:translate-y-0 active:scale-[0.985]'
            )}
        >
            {/* ── Image / Avatar area ───────────────────────────────── */}
            <div className="relative h-44 w-full overflow-hidden">
                {group.picture ? (
                    <img
                        src={group.picture}
                        alt={group.name}
                        className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
                    />
                ) : (
                    /* Gradient placeholder when no picture is set */
                    <div
                        className={cn(
                            'flex h-full w-full items-center justify-center',
                            'bg-gradient-to-br from-brand-500 via-brand-600 to-teal-600',
                            'dark:from-brand-700 dark:via-brand-800 dark:to-teal-800',
                            'transition-transform duration-500 ease-out group-hover:scale-[1.06]'
                        )}
                    >
                        {/* Decorative dot grid */}
                        <div
                            className="absolute inset-0 opacity-[0.08]"
                            style={{
                                backgroundImage:
                                    'radial-gradient(circle, white 1.2px, transparent 1.2px)',
                                backgroundSize: '22px 22px',
                            }}
                        />
                        {/* Large initial letter */}
                        <span className="relative text-6xl font-black tracking-tighter text-white/30 select-none">
                            {group.name.charAt(0).toUpperCase()}
                        </span>
                        {/* Centered icon */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="flex size-16 items-center justify-center rounded-2xl bg-white/15 ring-2 ring-white/20 backdrop-blur-sm">
                                <Users className="size-8 text-white/85" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Subtle bottom fade for content readability */}
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/20 to-transparent" />

                {/* Role badge positioned top-right */}
                <div className="absolute right-3 top-3">
                    <RoleBadge role={group.role} />
                </div>
            </div>

            {/* ── Content area ─────────────────────────────────────── */}
            <div className="flex flex-1 flex-col gap-3 p-5">
                <div className="min-w-0">
                    <h3 className="truncate text-lg font-bold tracking-tight text-neutral-900 transition-colors duration-300 group-hover:text-brand-600 dark:text-neutral-50 dark:group-hover:text-brand-300">
                        {group.name}
                    </h3>
                    {group.description && (
                        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                            {group.description}
                        </p>
                    )}
                    <p className={cn('text-sm text-neutral-500 dark:text-neutral-400', group.description ? 'mt-2' : 'mt-1')}>
                        <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                            {group.memberCount}
                        </span>{' '}
                        {group.memberCount === 1 ? 'Mitglied' : 'Mitglieder'}
                        <span className="mx-1.5 text-neutral-300 dark:text-neutral-600">
                            ·
                        </span>
                        <span className="font-semibold text-teal-600 dark:text-teal-400">
                            {group.activeResidentsCount} aktiv
                        </span>
                    </p>
                </div>

                {/* Footer row */}
                <div className="mt-auto flex items-center justify-between border-t border-neutral-100/80 pt-3 dark:border-neutral-700/50">
                    <span className="text-xs font-medium text-neutral-400 dark:text-neutral-500">
                        Gruppe öffnen
                    </span>
                    <div className="flex size-7 items-center justify-center rounded-full bg-brand-50 text-brand-600 transition-all duration-300 group-hover:translate-x-0.5 group-hover:bg-brand-100 group-hover:text-brand-700 dark:bg-brand-900/30 dark:text-brand-400 dark:group-hover:bg-brand-900/50">
                        <ArrowRight className="size-3.5" />
                    </div>
                </div>
            </div>
        </Link>
    )
}
