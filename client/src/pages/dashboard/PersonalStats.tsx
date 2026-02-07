import { useQuery } from '@tanstack/react-query'
import { TrendingUp, CheckCircle2, Clock, Target, Flame, Users } from 'lucide-react'
import {
    StatCard,
    BarChart,
    DonutChart,
    LineChart,
    ProgressRing,
    ChartCard,
} from '../../components/charts'
import {
    PageHeaderSkeleton,
    StatCardsSkeleton,
    StatsErrorState,
} from '../../components/feedback'
import { PageHeader } from '../../components/common'
import { ContributionGraph, ActivityLog } from '../../components/activity'
import { statisticsApi } from '../../api/statistics'
import { queryKeys } from '../../lib/queryKeys'
import { CHART_COLORS } from '../../constants'
import {
    buildMonthlyBarData,
    buildMonthlyLineSeries,
    buildStatusDonutData,
} from '../../utils/stats.utils'

export const PersonalStats = () => {
    const { data: stats, isLoading, isError } = useQuery({
        queryKey: queryKeys.statistics.personal,
        queryFn: () => statisticsApi.getPersonalStatistics(),
    })

    const { data: heatmapData = [] } = useQuery({
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

    const monthlyChartData = buildMonthlyBarData(stats.monthlyStats)
    const lineChartSeries = buildMonthlyLineSeries(stats.monthlyStats)
    const statusDonutData = buildStatusDonutData(stats)

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
                subtitle="Dein persoenlicher Fortschritt auf einen Blick"
                badge={streakBadge}
            />

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

            <div className="grid gap-6 lg:grid-cols-2">
                <ChartCard title="Monatlicher Fortschritt">
                    <LineChart series={lineChartSeries} height={220} />
                </ChartCard>

                <ChartCard title="Aufgaben nach Status" centerContent>
                    <DonutChart data={statusDonutData} totalLabel="Aufgaben" />
                </ChartCard>
            </div>

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
                            data={stats.tasksByGroup.map((group, index) => ({
                                label: group.groupName,
                                value: group.count,
                                color: [
                                    CHART_COLORS.primary,
                                    CHART_COLORS.completed,
                                    CHART_COLORS.inProgress,
                                    CHART_COLORS.pending,
                                ][index % 4],
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

            <ChartCard title="Erledigte Aufgaben pro Monat">
                <BarChart data={monthlyChartData} height={200} />
            </ChartCard>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                <ChartCard title="Aktivitaet im Jahresverlauf">
                    {heatmapData.length > 0 ? (
                        <ContributionGraph data={heatmapData} />
                    ) : (
                        <p className="py-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
                            Keine Aktivitaetsdaten vorhanden.
                        </p>
                    )}
                </ChartCard>

                <ChartCard title="Aktivitaetsprotokoll">
                    <ActivityLog />
                </ChartCard>
            </div>
        </div>
    )
}
