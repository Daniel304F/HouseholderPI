import {
    Flame,
    Medal,
    ShieldCheck,
    Star,
    Trophy,
    Users,
    type LucideIcon,
} from 'lucide-react'
import { cn } from '../../utils/cn'
import { ProgressRing } from '../charts'
import { ChartCard } from '../charts'

interface MemberStat {
    userId: string
    userName: string
    completedTasks: number
    assignedTasks: number
    completionRate: number
    score?: number
    achievementIds?: string[]
}

interface MemberLeaderboardProps {
    members: MemberStat[]
    getMemberColor: (index: number) => string
    className?: string
}

interface Achievement {
    id: string
    label: string
    icon: LucideIcon
    className: string
}

interface RankedMember extends MemberStat {
    score: number
    achievements: Achievement[]
}

const getScore = (member: MemberStat): number =>
    member.completedTasks * 12 + member.completionRate * 2 + member.assignedTasks

const getAchievements = (member: MemberStat): Achievement[] => {
    if (member.achievementIds && member.achievementIds.length > 0) {
        const achievementMap = new Map<string, Achievement>([
            [
                'task-master',
                {
                    id: 'task-master',
                    label: 'Task Master',
                    icon: Trophy,
                    className:
                        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
                },
            ],
            [
                'reliable',
                {
                    id: 'reliable',
                    label: 'Zuverlaessig',
                    icon: ShieldCheck,
                    className:
                        'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
                },
            ],
            [
                'sprinter',
                {
                    id: 'sprinter',
                    label: 'Sprinter',
                    icon: Flame,
                    className:
                        'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
                },
            ],
            [
                'starter',
                {
                    id: 'starter',
                    label: 'Starter',
                    icon: Star,
                    className:
                        'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
                },
            ],
        ])

        return member.achievementIds
            .map((id) => achievementMap.get(id))
            .filter((item): item is Achievement => Boolean(item))
    }

    const achievements: Achievement[] = []

    if (member.completedTasks >= 25) {
        achievements.push({
            id: 'task-master',
            label: 'Task Master',
            icon: Trophy,
            className:
                'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
        })
    }

    if (member.completionRate >= 85 && member.assignedTasks >= 10) {
        achievements.push({
            id: 'reliable',
            label: 'Zuverlaessig',
            icon: ShieldCheck,
            className:
                'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
        })
    }

    if (member.completedTasks >= 10) {
        achievements.push({
            id: 'sprinter',
            label: 'Sprinter',
            icon: Flame,
            className:
                'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
        })
    }

    if (member.completedTasks >= 1) {
        achievements.push({
            id: 'starter',
            label: 'Starter',
            icon: Star,
            className:
                'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
        })
    }

    return achievements
}

const rankMembers = (members: MemberStat[]): RankedMember[] =>
    [...members]
        .map((member) => ({
            ...member,
            score: member.score ?? getScore(member),
            achievements: getAchievements(member),
        }))
        .sort((a, b) => b.score - a.score)

export const MemberLeaderboard = ({
    members,
    getMemberColor,
    className,
}: MemberLeaderboardProps) => {
    const rankedMembers = rankMembers(members)

    return (
        <ChartCard
            title="Mitglieder Rangliste"
            icon={<Users className="size-5" />}
            className={className}
        >
            <div className="space-y-3">
                {rankedMembers.map((member, index) => {
                    const isTop = index === 0
                    const isPodium = index < 3

                    return (
                        <div
                            key={member.userId}
                            className={cn(
                                'rounded-xl border p-3',
                                'border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800/50',
                                isTop &&
                                    'border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50 dark:border-yellow-800 dark:from-yellow-900/20 dark:to-orange-900/20'
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className={cn(
                                        'flex size-8 shrink-0 items-center justify-center rounded-full font-bold',
                                        isTop
                                            ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white'
                                            : 'bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200'
                                    )}
                                >
                                    {isPodium ? (
                                        <Medal className="size-4" />
                                    ) : (
                                        index + 1
                                    )}
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p className="truncate font-medium text-neutral-900 dark:text-white">
                                        {member.userName}
                                    </p>
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                        {member.completedTasks} erledigt von{' '}
                                        {member.assignedTasks} Aufgaben
                                    </p>
                                </div>

                                <div className="text-right">
                                    <ProgressRing
                                        value={member.completionRate}
                                        size={48}
                                        strokeWidth={6}
                                        showValue={false}
                                        color={getMemberColor(index)}
                                    />
                                    <p className="mt-1 text-xs font-medium text-neutral-600 dark:text-neutral-400">
                                        {member.completionRate}%
                                    </p>
                                </div>
                            </div>

                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                <span className="rounded-full bg-brand-100 px-2 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
                                    Score {member.score}
                                </span>
                                {member.achievements.slice(0, 3).map((achievement) => {
                                    const Icon = achievement.icon
                                    return (
                                        <span
                                            key={achievement.id}
                                            className={cn(
                                                'inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium',
                                                achievement.className
                                            )}
                                        >
                                            <Icon className="size-3.5" />
                                            {achievement.label}
                                        </span>
                                    )
                                })}
                            </div>
                        </div>
                    )
                })}
            </div>
        </ChartCard>
    )
}
