import { useQuery } from '@tanstack/react-query'
import {
    TrendingUp,
    CheckCircle2,
    Clock,
    Target,
    Flame,
    Users,
} from 'lucide-react'
import {
    StatCard,
    BarChart,
    DonutChart,
    LineChart,
    ProgressRing,
} from '../../components/charts'
import { StatsPageSkeleton, StatsErrorState } from '../../components/ui'
import { statisticsApi } from '../../api/statistics'
import { queryKeys } from '../../lib/queryKeys'
import { CHART_COLORS } from '../../constants'

export const PersonalStats = () => {
    const {
        data: stats,
        isLoading,
        isError,
    } = useQuery({
        queryKey: queryKeys.statistics.personal,
        queryFn: () => statisticsApi.getPersonalStatistics(),
    })

    if (isLoading) {
        return <StatsPageSkeleton showBadge />
    }

    if (isError || !stats) {
        return <StatsErrorState />
    }

    const monthlyChartData = stats.monthlyStats.map((m) => ({
        label: m.monthName.substring(0, 3),
        value: m.completed,
        color: CHART_COLORS.completed,
    }))

    const lineChartSeries = [
        {
            name: 'Erledigt',
            data: stats.monthlyStats.map((m) => ({
                label: m.monthName.substring(0, 3),
                value: m.completed,
            })),
            color: CHART_COLORS.completed,
        },
        {
            name: 'Erstellt',
            data: stats.monthlyStats.map((m) => ({
                label: m.monthName.substring(0, 3),
                value: m.created,
            })),
            color: CHART_COLORS.primary,
        },
    ]

    const statusDonutData = [
        {
            label: 'Erledigt',
            value: stats.completedTasks,
            color: CHART_COLORS.completed,
        },
        {
            label: 'Offen',
            value: stats.pendingTasks,
            color: CHART_COLORS.pending,
        },
        {
            label: 'In Bearbeitung',
            value: stats.inProgressTasks,
            color: CHART_COLORS.inProgress,
        },
    ]

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                        Meine Statistiken
                    </h1>
                    <p className="text-neutral-500 dark:text-neutral-400">
                        Dein persönlicher Fortschritt auf einen Blick
                    </p>
                </div>
                {stats.streak > 0 && (
                    <div className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2 text-white">
                        <Flame className="size-5" />
                        <span className="font-bold">
                            {stats.streak} Tage Streak!
                        </span>
                    </div>
                )}
            </div>

            {/* Stat Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Zugewiesene Aufgaben"
                    value={stats.totalAssigned}
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
                    title="In Bearbeitung"
                    value={stats.inProgressTasks}
                    icon={Clock}
                    color="warning"
                />
                <StatCard
                    title="Abschlussrate"
                    value={`${stats.completionRate}%`}
                    icon={TrendingUp}
                    color="default"
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

            {/* Completion Rate Ring & Tasks by Group */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Completion Progress */}
                <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-800">
                    <h2 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">
                        Abschlussfortschritt
                    </h2>
                    <div className="flex items-center justify-center gap-8">
                        <ProgressRing
                            value={stats.completionRate}
                            size={140}
                            color={CHART_COLORS.completed}
                            label="Abschlussrate"
                        />
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="size-3 rounded-full bg-emerald-500" />
                                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                                    {stats.completedTasks} erledigt
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="size-3 rounded-full bg-amber-500" />
                                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                                    {stats.pendingTasks} offen
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="size-3 rounded-full bg-blue-500" />
                                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                                    {stats.inProgressTasks} in Bearbeitung
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tasks by Group */}
                <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-800">
                    <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-neutral-900 dark:text-white">
                        <Users className="size-5" />
                        Aufgaben nach Gruppe
                    </h2>
                    {stats.tasksByGroup.length > 0 ? (
                        <BarChart
                            data={stats.tasksByGroup.map((g, i) => ({
                                label: g.groupName,
                                value: g.count,
                                color: [
                                    CHART_COLORS.primary,
                                    CHART_COLORS.completed,
                                    CHART_COLORS.inProgress,
                                    CHART_COLORS.pending,
                                ][i % 4],
                            }))}
                            horizontal
                            showValues
                        />
                    ) : (
                        <p className="py-8 text-center text-neutral-500 dark:text-neutral-400">
                            Noch keine Aufgaben in Gruppen
                        </p>
                    )}
                </div>
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
