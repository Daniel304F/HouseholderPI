import { useQuery } from '@tanstack/react-query'
import {
    TrendingUp,
    CheckCircle2,
    Clock,
    Target,
    Flame,
    Users,
    Activity,
} from 'lucide-react'
import {
    StatCard,
    BarChart,
    DonutChart,
    LineChart,
    ProgressRing,
    ChartCard,
} from '../../components/charts'
import { PageHeaderSkeleton, StatCardsSkeleton, StatsErrorState } from '../../components/feedback'
import { PageHeader, Card } from '../../components/common'
import { ContributionGraph, ActivityLog } from '../../components/activity'
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

    const { data: heatmapData } = useQuery({
        queryKey: queryKeys.statistics.activityHeatmap,
        queryFn: () => statisticsApi.getActivityHeatmap(),
    })

    if (isLoading) {
        return (
            <div className="space-y-6">
                <PageHeaderSkeleton showBadge />
                <StatCardsSkeleton count={4} />
            </div>
        )
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

    const streakBadge =
        stats.streak > 0 ? (
            <div className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2 text-white">
                <Flame className="size-5" />
                <span className="font-bold">{stats.streak} Tage Streak!</span>
            </div>
        ) : null

    return (
        <div className="space-y-6">
            <PageHeader
                title="Meine Statistiken"
                subtitle="Dein persönlicher Fortschritt auf einen Blick"
                badge={streakBadge}
            />

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
                <ChartCard title="Monatlicher Fortschritt">
                    <LineChart series={lineChartSeries} height={220} />
                </ChartCard>

                <ChartCard title="Aufgaben nach Status" centerContent>
                    <DonutChart data={statusDonutData} totalLabel="Aufgaben" />
                </ChartCard>
            </div>

            {/* Completion Rate Ring & Tasks by Group */}
            <div className="grid gap-6 lg:grid-cols-2">
                <ChartCard title="Abschlussfortschritt" centerContent>
                    <div className="flex items-center gap-8">
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
                </ChartCard>

                <ChartCard
                    title="Aufgaben nach Gruppe"
                    icon={<Users className="size-5" />}
                >
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
                </ChartCard>
            </div>

            {/* Monthly Bar Chart */}
            <ChartCard title="Erledigte Aufgaben pro Monat">
                <BarChart data={monthlyChartData} height={200} />
            </ChartCard>

            {/* Activity Section */}
            <div className="space-y-6">
                {/* Contribution Graph */}
                <Card className="p-6">
                    <div className="mb-4 flex items-center gap-2">
                        <Activity className="size-5 text-brand-500" />
                        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                            Aktivitätsverlauf
                        </h2>
                    </div>
                    {heatmapData && heatmapData.length > 0 ? (
                        <ContributionGraph data={heatmapData} />
                    ) : (
                        <p className="py-8 text-center text-neutral-500 dark:text-neutral-400">
                            Noch keine Aktivitätsdaten vorhanden
                        </p>
                    )}
                </Card>

                {/* Activity Log */}
                <Card className="p-6">
                    <div className="mb-4 flex items-center gap-2">
                        <Activity className="size-5 text-brand-500" />
                        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                            Aktivitätslog
                        </h2>
                    </div>
                    <ActivityLog />
                </Card>
            </div>
        </div>
    )
}
