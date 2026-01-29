import { Users } from 'lucide-react'
import { cn } from '../../utils/cn'
import { ProgressRing } from '../charts'
import { ChartCard } from '../ui/ChartCard'

interface MemberStat {
    userId: string
    userName: string
    completedTasks: number
    assignedTasks: number
    completionRate: number
}

interface MemberLeaderboardProps {
    members: MemberStat[]
    getMemberColor: (index: number) => string
    className?: string
}

export const MemberLeaderboard = ({
    members,
    getMemberColor,
    className,
}: MemberLeaderboardProps) => {
    return (
        <ChartCard
            title="Mitglieder Rangliste"
            icon={<Users className="size-5" />}
            className={className}
        >
            <div className="space-y-3">
                {members.map((member, index) => (
                    <div
                        key={member.userId}
                        className={cn(
                            'flex items-center gap-3 rounded-lg p-3',
                            index === 0
                                ? 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20'
                                : 'bg-neutral-50 dark:bg-neutral-800/50'
                        )}
                    >
                        <div
                            className={cn(
                                'flex size-8 shrink-0 items-center justify-center rounded-full font-bold',
                                index === 0
                                    ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white'
                                    : index === 1
                                      ? 'bg-neutral-300 text-neutral-700 dark:bg-neutral-600 dark:text-neutral-200'
                                      : index === 2
                                        ? 'bg-orange-200 text-orange-700 dark:bg-orange-900 dark:text-orange-200'
                                        : 'bg-neutral-200 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400'
                            )}
                        >
                            {index + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate font-medium text-neutral-900 dark:text-white">
                                {member.userName}
                            </p>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                {member.completedTasks} erledigt
                                {member.assignedTasks > 0 &&
                                    ` von ${member.assignedTasks}`}
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
                ))}
            </div>
        </ChartCard>
    )
}
