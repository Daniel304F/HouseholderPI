import { useEffect, useMemo, useState } from 'react'
import { cn } from '../../utils/cn'
import type { DailyActivity } from '../../api/statistics'

interface ContributionGraphProps {
    data: DailyActivity[]
    className?: string
}

const MONTHS_DE = [
    'Jan',
    'Feb',
    'Maer',
    'Apr',
    'Mai',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Okt',
    'Nov',
    'Dez',
]

// GitHub-style color levels
const LEVEL_COLORS = {
    0: 'bg-[#ebedf0] dark:bg-[#161b22]',
    1: 'bg-[#9be9a8] dark:bg-[#0e4429]',
    2: 'bg-[#40c463] dark:bg-[#006d32]',
    3: 'bg-[#30a14e] dark:bg-[#26a641]',
    4: 'bg-[#216e39] dark:bg-[#39d353]',
} as const

// Cell dimensions - GitHub style
const CELL_SIZE = 11
const CELL_GAP = 3

export const ContributionGraph = ({
    data,
    className,
}: ContributionGraphProps) => {
    const [hoveredDay, setHoveredDay] = useState<DailyActivity | null>(null)
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })

    const availableYears = useMemo(() => {
        const years = Array.from(
            new Set(data.map((entry) => new Date(entry.date).getFullYear()))
        )
        return years.sort((a, b) => b - a)
    }, [data])

    const [selectedYear, setSelectedYear] = useState<number | null>(
        availableYears[0] ?? null
    )

    useEffect(() => {
        if (!availableYears.length) {
            setSelectedYear(null)
            return
        }

        if (selectedYear === null || !availableYears.includes(selectedYear)) {
            setSelectedYear(availableYears[0])
        }
    }, [availableYears, selectedYear])

    const { weeks, monthLabels, totalCount } = useMemo(() => {
        if (!selectedYear) {
            return {
                weeks: [] as (DailyActivity | null)[][],
                monthLabels: [] as { month: number; weekIndex: number }[],
                totalCount: 0,
            }
        }

        const dataMap = new Map<string, DailyActivity>()
        data.forEach((d) => dataMap.set(d.date, d))

        const startOfYear = new Date(selectedYear, 0, 1)
        startOfYear.setHours(0, 0, 0, 0)

        const endOfYear = new Date(selectedYear, 11, 31)
        endOfYear.setHours(0, 0, 0, 0)

        // GitHub weeks start on Sunday and end on Saturday.
        const startDate = new Date(startOfYear)
        startDate.setDate(startDate.getDate() - startDate.getDay())

        const endDate = new Date(endOfYear)
        endDate.setDate(endDate.getDate() + (6 - endDate.getDay()))

        const weeks: (DailyActivity | null)[][] = []
        let currentWeek: (DailyActivity | null)[] = []
        let total = 0
        const monthPositions: { month: number; weekIndex: number }[] = []
        let lastMonth = -1

        const current = new Date(startDate)
        while (current <= endDate) {
            const isInSelectedYear =
                current.getFullYear() === selectedYear &&
                current >= startOfYear &&
                current <= endOfYear

            if (isInSelectedYear) {
                const dateStr = current.toISOString().split('T')[0]
                const dayData = dataMap.get(dateStr) || {
                    date: dateStr,
                    count: 0,
                    level: 0 as const,
                }

                currentWeek.push(dayData)
                total += dayData.count

                const month = current.getMonth()
                const dayOfMonth = current.getDate()
                if (month !== lastMonth && dayOfMonth <= 7) {
                    monthPositions.push({ month, weekIndex: weeks.length })
                    lastMonth = month
                }
            } else {
                currentWeek.push(null)
            }

            if (current.getDay() === 6) {
                weeks.push(currentWeek)
                currentWeek = []
            }

            current.setDate(current.getDate() + 1)
        }

        if (currentWeek.length > 0) {
            while (currentWeek.length < 7) {
                currentWeek.push(null)
            }
            weeks.push(currentWeek)
        }

        return { weeks, monthLabels: monthPositions, totalCount: total }
    }, [data, selectedYear])

    const handleMouseEnter = (
        day: DailyActivity,
        event: React.MouseEvent<HTMLDivElement>
    ) => {
        const rect = event.currentTarget.getBoundingClientRect()
        setHoveredDay(day)
        setTooltipPos({
            x: rect.left + rect.width / 2,
            y: rect.top - 8,
        })
    }

    const handleMouseLeave = () => {
        setHoveredDay(null)
    }

    const formatDate = (dateStr: string): string => {
        const date = new Date(dateStr)
        return date.toLocaleDateString('de-DE', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        })
    }

    const totalWidth = weeks.length * (CELL_SIZE + CELL_GAP)

    if (!availableYears.length || selectedYear === null) {
        return (
            <div
                className={cn(
                    'rounded-xl border border-neutral-200 bg-white p-4 text-sm text-neutral-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400',
                    className
                )}
            >
                Keine Aktivitaetsdaten verfuegbar.
            </div>
        )
    }

    return (
        <div className={cn('relative', className)}>
            <div className="mb-3 flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Contribution Graph
                </span>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    {availableYears.map((year) => (
                        <button
                            key={year}
                            type="button"
                            onClick={() => setSelectedYear(year)}
                            className={cn(
                                'rounded-md border px-2.5 py-1 text-xs font-semibold transition-colors duration-150',
                                selectedYear === year
                                    ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/25 dark:text-brand-200'
                                    : 'border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800'
                            )}
                        >
                            {year}
                        </button>
                    ))}
                </div>
            </div>

            {hoveredDay && (
                <div
                    className="pointer-events-none fixed z-[100] -translate-x-1/2 -translate-y-full"
                    style={{ left: tooltipPos.x, top: tooltipPos.y }}
                >
                    <div className="rounded-md bg-neutral-800 px-2.5 py-1.5 text-xs whitespace-nowrap text-white shadow-lg dark:bg-neutral-950">
                        <span className="font-semibold">
                            {hoveredDay.count === 0
                                ? 'Keine Aktivitäten'
                                : `${hoveredDay.count} Aktivitaet${hoveredDay.count !== 1 ? 'en' : ''}`}
                        </span>
                        <span className="text-neutral-400">
                            {' '}
                            am {formatDate(hoveredDay.date)}
                        </span>
                    </div>
                    <div className="mx-auto h-2 w-2 -translate-y-[3px] rotate-45 bg-neutral-800 dark:bg-neutral-950" />
                </div>
            )}

            <div className="overflow-x-auto">
                <div style={{ minWidth: `${totalWidth + 32}px` }}>
                    <div
                        className="relative mb-1 ml-8 text-xs text-neutral-600 dark:text-neutral-400"
                        style={{ height: '16px' }}
                    >
                        {monthLabels.map(({ month, weekIndex }, idx) => (
                            <span
                                key={idx}
                                className="absolute"
                                style={{
                                    left: `${weekIndex * (CELL_SIZE + CELL_GAP)}px`,
                                }}
                            >
                                {MONTHS_DE[month]}
                            </span>
                        ))}
                    </div>

                    <div className="flex">
                        <div
                            className="mr-1 flex w-7 flex-col text-[10px] text-neutral-600 dark:text-neutral-400"
                            style={{ gap: `${CELL_GAP}px` }}
                        >
                            <div style={{ height: CELL_SIZE }} />
                            <div
                                className="flex items-center"
                                style={{ height: CELL_SIZE }}
                            >
                                Mo
                            </div>
                            <div style={{ height: CELL_SIZE }} />
                            <div
                                className="flex items-center"
                                style={{ height: CELL_SIZE }}
                            >
                                Mi
                            </div>
                            <div style={{ height: CELL_SIZE }} />
                            <div
                                className="flex items-center"
                                style={{ height: CELL_SIZE }}
                            >
                                Fr
                            </div>
                            <div style={{ height: CELL_SIZE }} />
                        </div>

                        <div className="flex" style={{ gap: `${CELL_GAP}px` }}>
                            {weeks.map((week, weekIndex) => (
                                <div
                                    key={weekIndex}
                                    className="flex flex-col"
                                    style={{ gap: `${CELL_GAP}px` }}
                                >
                                    {week.map((day, dayIndex) => (
                                        <div
                                            key={`${weekIndex}-${dayIndex}`}
                                            className={cn(
                                                'rounded-sm',
                                                day
                                                    ? LEVEL_COLORS[day.level]
                                                    : 'bg-transparent',
                                                day &&
                                                    'cursor-pointer hover:ring-1 hover:ring-neutral-400 hover:ring-offset-1 dark:hover:ring-neutral-500'
                                            )}
                                            style={{
                                                width: CELL_SIZE,
                                                height: CELL_SIZE,
                                            }}
                                            onMouseEnter={
                                                day
                                                    ? (e) =>
                                                          handleMouseEnter(
                                                              day,
                                                              e
                                                          )
                                                    : undefined
                                            }
                                            onMouseLeave={
                                                day
                                                    ? handleMouseLeave
                                                    : undefined
                                            }
                                        />
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-600 dark:text-neutral-400">
                <span>
                    {totalCount.toLocaleString('de-DE')} Aktivitäten in{' '}
                    {selectedYear}
                </span>
                <div className="flex items-center gap-1">
                    <span className="mr-1">Weniger</span>
                    {([0, 1, 2, 3, 4] as const).map((level) => (
                        <div
                            key={level}
                            className={cn('rounded-sm', LEVEL_COLORS[level])}
                            style={{ width: CELL_SIZE, height: CELL_SIZE }}
                        />
                    ))}
                    <span className="ml-1">Mehr</span>
                </div>
            </div>
        </div>
    )
}
