import { Link } from 'react-router-dom'
import {
    ArrowLeft,
    BarChart3,
    Settings,
    Share2,
    UserPlus,
    Users,
} from 'lucide-react'
import { Button, IconButton } from '../../common'
import type { Group } from '../../../api/groups'

interface PageHeaderProps {
    group: Group
    groupId: string
    isAdmin: boolean
    onBack: () => void
    onSettings: () => void
}

export const PageHeader = ({
    group,
    groupId,
    isAdmin,
    onBack,
    onSettings,
}: PageHeaderProps) => {
    const displayMembers = group.members.slice(0, 4)
    const extraCount = Math.max(0, group.members.length - 4)

    return (
        <header className="space-y-3">
            <div className="flex items-start gap-3 sm:gap-4">
                <IconButton
                    icon={<ArrowLeft className="size-5" />}
                    onClick={onBack}
                    variant="ghost"
                    aria-label="Zurueck"
                />

                <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-3">
                        {group.picture ? (
                            <img
                                src={group.picture}
                                alt={group.name}
                                className="size-10 rounded-xl object-cover"
                            />
                        ) : (
                            <div className="flex size-10 items-center justify-center rounded-xl bg-brand-100 dark:bg-brand-900/30">
                                <Users className="size-5 text-brand-600 dark:text-brand-400" />
                            </div>
                        )}

                        <div className="min-w-0">
                            <h1 className="break-words text-xl font-bold text-neutral-900 sm:text-2xl dark:text-white">
                                {group.name}
                            </h1>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                {group.members.length} Mitglieder - {group.activeResidentsCount}{' '}
                                aktive Bewohner
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="hide-scrollbar overflow-x-auto">
                    <div className="flex -space-x-2">
                        {displayMembers.map((member) => (
                            <MemberAvatar
                                key={member.userId}
                                name={member.userName}
                                avatar={member.userAvatar}
                            />
                        ))}
                        {extraCount > 0 && (
                            <div className="flex size-8 items-center justify-center rounded-full border-2 border-white bg-neutral-200 text-xs font-medium text-neutral-600 dark:border-neutral-900 dark:bg-neutral-700 dark:text-neutral-400">
                                +{extraCount}
                            </div>
                        )}
                    </div>
                </div>

                <div className="hide-scrollbar overflow-x-auto pb-1 sm:pb-0">
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            icon={<Share2 className="size-4" />}
                            className="hidden shrink-0 sm:inline-flex"
                        >
                            Teilen
                        </Button>
                        <Link to={`/dashboard/groups/${groupId}/stats`}>
                            <Button
                                variant="outline"
                                icon={<BarChart3 className="size-4" />}
                                className="shrink-0 whitespace-nowrap"
                            >
                                <span className="hidden sm:inline">Statistiken</span>
                                <span className="sm:hidden">Stats</span>
                            </Button>
                        </Link>
                        {isAdmin && (
                            <Button
                                variant="outline"
                                onClick={onSettings}
                                icon={<Settings className="size-4" />}
                                className="shrink-0 whitespace-nowrap"
                            >
                                <span className="hidden sm:inline">Einstellungen</span>
                            </Button>
                        )}
                        <Button
                            icon={<UserPlus className="size-4" />}
                            className="shrink-0 whitespace-nowrap"
                        >
                            <span className="hidden sm:inline">Einladen</span>
                        </Button>
                    </div>
                </div>
            </div>
        </header>
    )
}

const MemberAvatar = ({
    name,
    avatar,
}: {
    name?: string
    avatar?: string
}) => (
    <div className="flex size-8 items-center justify-center rounded-full border-2 border-white bg-brand-100 text-xs font-medium text-brand-600 dark:border-neutral-900 dark:bg-brand-900/30 dark:text-brand-400">
        {avatar ? (
            <img src={avatar} alt={name} className="size-full rounded-full object-cover" />
        ) : (
            (name || '?').charAt(0).toUpperCase()
        )}
    </div>
)
