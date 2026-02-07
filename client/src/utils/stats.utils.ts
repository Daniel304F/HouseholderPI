import { CHART_COLORS } from '../constants'
import type { BarChartData } from '../components/charts'
import type { DonutChartSegment } from '../components/charts'
import type { LineChartSeries } from '../components/charts'

interface MonthlyStats {
    monthName: string
    completed: number
    created: number
}

interface TaskCounts {
    completedTasks: number
    pendingTasks: number
    inProgressTasks: number
}

export const buildMonthlyBarData = (
    monthly: MonthlyStats[]
): BarChartData[] =>
    monthly.map((m) => ({
        label: m.monthName.substring(0, 3),
        value: m.completed,
        color: CHART_COLORS.completed,
    }))

export const buildMonthlyLineSeries = (
    monthly: MonthlyStats[]
): LineChartSeries[] => [
    {
        name: 'Erledigt',
        data: monthly.map((m) => ({
            label: m.monthName.substring(0, 3),
            value: m.completed,
        })),
        color: CHART_COLORS.completed,
    },
    {
        name: 'Erstellt',
        data: monthly.map((m) => ({
            label: m.monthName.substring(0, 3),
            value: m.created,
        })),
        color: CHART_COLORS.primary,
    },
]

export const buildStatusDonutData = (
    counts: TaskCounts
): DonutChartSegment[] => [
    {
        label: 'Erledigt',
        value: counts.completedTasks,
        color: CHART_COLORS.completed,
    },
    {
        label: 'Offen',
        value: counts.pendingTasks,
        color: CHART_COLORS.pending,
    },
    {
        label: 'In Bearbeitung',
        value: counts.inProgressTasks,
        color: CHART_COLORS.inProgress,
    },
]
