import { useQuery } from '@tanstack/react-query'
import { useParams, Link } from 'react-router-dom'
import {
    TrendingUp,
    CheckCircle2,
    Target,
    BarChart3,
    Users,
    Trophy,
    ArrowLeft,
    Timer,
    Star,
} from 'lucide-react'
import { cn } from '../../utils/cn'
import { Button } from '../../components/Button'
import {
    StatCard,
    BarChart,
    DonutChart,
    LineChart,
    ProgressRing,
} from '../../components/charts'
import { statisticsApi } from '../../api/statistics'
import { groupsApi } from '../../api/groups'

const COLORS = {
    completed: '#10B981', // emerald
    pending: '#F59E0B', // amber
    inProgress: '#3B82F6', // blue
    primary: '#6366F1', // indigo
}

const MEMBER_COLORS = [
    '#6366F1', // indigo
    '#10B981', // emerald
    '#F59E0B', // amber
    '#EF4444', // red
    '#8B5CF6', // violet
    '#EC4899', // pink
    '#14B8A6', // teal
    '#F97316', // orange
]

export const GroupStats = () => {
    const { groupId } = useParams<{ groupId: string }>()

    const { data: group } = useQuery({
        queryKey: ['group', groupId],
        queryFn: () => groupsApi.getGroup(groupId!),
        enabled: !!groupId,
    })

    const {
        data: stats,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ['groupStatistics', groupId],
        queryFn: () => statisticsApi.getGroupStatistics(groupId!),
        enabled: !!groupId,
    })

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="h-8 w-48 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-700" />
                        <div className="mt-2 h-5 w-64 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
                    </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <div
                            key={i}
                            className="h-32 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-700"
                        />
                    ))}
                </div>
            </div>
        )
    }

    if (isError || !stats) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-neutral-300 py-12 dark:border-neutral-600">
                <BarChart3 className="size-12 text-neutral-400" />
                <div className="text-center">
                    <p className="font-medium text-neutral-700 dark:text-neutral-300">
                        Statistiken konnten nicht geladen werden
                    </p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Bitte versuche es später erneut
                    </p>
                </div>
                <Link to={`/dashboard/groups/${groupId}`}>
                    <Button variant="secondary">
                        <ArrowLeft className="mr-2 size-4" />
                        Zurück zur Gruppe
                    </Button>
                </Link>
            </div>
        )
    }

    const monthlyChartData = stats.monthlyStats.map((m) => ({
        label: m.monthName.substring(0, 3),
        value: m.completed,
        color: COLORS.completed,
    }))

    const lineChartSeries = [
        {
            name: 'Erledigt',
            data: stats.monthlyStats.map((m) => ({
                label: m.monthName.substring(0, 3),
                value: m.completed,
            })),
            color: COLORS.completed,
        },
        {
            name: 'Erstellt',
            data: stats.monthlyStats.map((m) => ({
                label: m.monthName.substring(0, 3),
                value: m.created,
            })),
            color: COLORS.primary,
        },
    ]

    const statusDonutData = [
        {
            label: 'Erledigt',
            value: stats.completedTasks,
            color: COLORS.completed,
        },
        { label: 'Offen', value: stats.pendingTasks, color: COLORS.pending },
        {
            label: 'In Bearbeitung',
            value: stats.inProgressTasks,
            color: COLORS.inProgress,
        },
    ]

    const memberChartData = stats.memberStats.map((m, i) => ({
        label: m.userName,
        value: m.completedTasks,
        color: MEMBER_COLORS[i % MEMBER_COLORS.length],
    }))

    // Find top performer
    const topPerformer = stats.memberStats.reduce(
        (top, member) =>
            member.completedTasks > (top?.completedTasks || 0) ? member : top,
        stats.memberStats[0]
    )

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <Link to={`/dashboard/groups/${groupId}`}>
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="size-4" />
                            </Button>
                        </Link>
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                            {group?.name} - Statistiken
                        </h1>
                    </div>
                    <p className="mt-1 ml-11 text-neutral-500 dark:text-neutral-400">
                        Gruppenaktivität und Leistungsübersicht
                    </p>
                </div>
                {topPerformer && topPerformer.completedTasks > 0 && (
                    <div className="hidden items-center gap-2 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 px-4 py-2 text-white md:flex">
                        <Trophy className="size-5" />
                        <span className="font-bold">
                            Top: {topPerformer.userName}
                        </span>
                    </div>
                )}
            </div>

            {/* Stat Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Gesamte Aufgaben"
                    value={stats.totalTasks}
                    icon={Target}
                    color="info"
                />
                <StatCard
                    title="Erledigt"
                    value={stats.completedTasks}
                    icon={CheckCircle2}
                    color="success"
                />
                <StatCard
                    title="Abschlussrate"
                    value={`${stats.completionRate}%`}
                    icon={TrendingUp}
                    color="default"
                />
                <StatCard
                    title="Ø Bearbeitungszeit"
                    value={`${stats.averageCompletionTime} Tage`}
                    icon={Timer}
                    color="warning"
                />
            </div>

            {/* Charts Row */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Monthly Progress */}
                <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-800">
                    <h2 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">
                        Monatlicher Fortschritt
                    </h2>
                    <LineChart series={lineChartSeries} height={220} />
                </div>

                {/* Status Distribution */}
                <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-800">
                    <h2 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">
                        Aufgaben nach Status
                    </h2>
                    <div className="flex items-center justify-center">
                        <DonutChart
                            data={statusDonutData}
                            totalLabel="Aufgaben"
                        />
                    </div>
                </div>
            </div>

            {/* Member Stats & Most Frequent Tasks */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Member Leaderboard */}
                <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-800">
                    <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-neutral-900 dark:text-white">
                        <Users className="size-5" />
                        Mitglieder Rangliste
                    </h2>
                    <div className="space-y-3">
                        {stats.memberStats.map((member, index) => (
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
                                        color={
                                            MEMBER_COLORS[
                                                index % MEMBER_COLORS.length
                                            ]
                                        }
                                    />
                                    <p className="mt-1 text-xs font-medium text-neutral-600 dark:text-neutral-400">
                                        {member.completionRate}%
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Most Frequent Tasks */}
                <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-800">
                    <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-neutral-900 dark:text-white">
                        <Star className="size-5" />
                        Häufigste Aufgaben
                    </h2>
                    {stats.mostFrequentTasks.length > 0 ? (
                        <div className="space-y-3">
                            {stats.mostFrequentTasks
                                .slice(0, 8)
                                .map((task, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-3"
                                    >
                                        <div className="bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400 flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-medium">
                                            {task.count}x
                                        </div>
                                        <p className="truncate text-neutral-700 capitalize dark:text-neutral-300">
                                            {task.title}
                                        </p>
                                    </div>
                                ))}
                        </div>
                    ) : (
                        <p className="py-8 text-center text-neutral-500 dark:text-neutral-400">
                            Noch keine erledigten Aufgaben
                        </p>
                    )}
                </div>
            </div>

            {/* Member Performance Bar Chart */}
            <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-800">
                <h2 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">
                    Erledigte Aufgaben pro Mitglied
                </h2>
                <BarChart data={memberChartData} horizontal showValues />
            </div>

            {/* Monthly Bar Chart */}
            <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-800">
                <h2 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">
                    Erledigte Aufgaben pro Monat
                </h2>
                <BarChart data={monthlyChartData} height={200} />
            </div>
        </div>
    )
}
