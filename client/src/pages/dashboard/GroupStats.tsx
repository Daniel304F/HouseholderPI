import { useQuery } from '@tanstack/react-query'
import { useParams, Link } from 'react-router-dom'
import {
    TrendingUp,
    CheckCircle2,
    Target,
    Trophy,
    ArrowLeft,
    Timer,
} from 'lucide-react'
import { Button, PageHeader } from '../../components/common'
import {
    StatCard,
    BarChart,
    DonutChart,
    LineChart,
    ChartCard,
} from '../../components/charts'
import { PageHeaderSkeleton, StatCardsSkeleton, StatsErrorState } from '../../components/feedback'
import { MemberLeaderboard, FrequentTasksList } from '../../components/stats'
import { statisticsApi } from '../../api/statistics'
import { groupsApi } from '../../api/groups'
import { queryKeys } from '../../lib/queryKeys'
import { getMemberColor } from '../../constants'
import {
    buildMonthlyBarData,
    buildMonthlyLineSeries,
    buildStatusDonutData,
} from '../../utils/stats.utils'

export const GroupStats = () => {
    const { groupId } = useParams<{ groupId: string }>()

    const { data: group } = useQuery({
        queryKey: queryKeys.groups.detail(groupId!),
        queryFn: () => groupsApi.getGroup(groupId!),
        enabled: !!groupId,
    })

    const {
        data: stats,
        isLoading,
        isError,
    } = useQuery({
        queryKey: queryKeys.statistics.group(groupId!),
        queryFn: () => statisticsApi.getGroupStatistics(groupId!),
        enabled: !!groupId,
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
        return (
            <div className="space-y-6">
                <StatsErrorState />
                <Link to={`/dashboard/groups/${groupId}`}>
                    <Button variant="secondary">
                        <ArrowLeft className="mr-2 size-4" />
                        Zurück zur Gruppe
                    </Button>
                </Link>
            </div>
        )
    }

    const monthlyChartData = buildMonthlyBarData(stats.monthlyStats)
    const lineChartSeries = buildMonthlyLineSeries(stats.monthlyStats)
    const statusDonutData = buildStatusDonutData(stats)

    const memberChartData = stats.memberStats.map((m, i) => ({
        label: m.userName,
        value: m.completedTasks,
        color: getMemberColor(i),
    }))

    // Find top performer
    const topPerformer = stats.memberStats.reduce(
        (top, member) =>
            member.completedTasks > (top?.completedTasks || 0) ? member : top,
        stats.memberStats[0]
    )

    const topPerformerBadge =
        topPerformer && topPerformer.completedTasks > 0 ? (
            <div className="flex max-w-full items-center gap-2 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 px-3 py-2 text-white sm:px-4">
                <Trophy className="size-5" />
                <span className="truncate font-bold">Top: {topPerformer.userName}</span>
            </div>
        ) : null

    return (
        <div className="space-y-6">
            <PageHeader
                title={`${group?.name} - Statistiken`}
                subtitle="Gruppenaktivität und Leistungsübersicht"
                backButton={
                    <Link
                        to={`/dashboard/groups/${groupId}`}
                        className="flex size-8 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
                    >
                        <ArrowLeft className="size-5" />
                    </Link>
                }
                badge={topPerformerBadge}
            />

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
                <ChartCard title="Monatlicher Fortschritt">
                    <LineChart series={lineChartSeries} height={220} />
                </ChartCard>

                <ChartCard title="Aufgaben nach Status" centerContent>
                    <DonutChart data={statusDonutData} totalLabel="Aufgaben" />
                </ChartCard>
            </div>

            {/* Member Stats & Most Frequent Tasks */}
            <div className="grid gap-6 lg:grid-cols-2">
                <MemberLeaderboard
                    members={stats.memberStats}
                    getMemberColor={getMemberColor}
                />
                <FrequentTasksList tasks={stats.mostFrequentTasks} />
            </div>

            {/* Member Performance Bar Chart */}
            <ChartCard title="Erledigte Aufgaben pro Mitglied">
                <BarChart data={memberChartData} horizontal showValues />
            </ChartCard>

            {/* Monthly Bar Chart */}
            <ChartCard title="Erledigte Aufgaben pro Monat">
                <BarChart data={monthlyChartData} height={200} />
            </ChartCard>
        </div>
    )
}
