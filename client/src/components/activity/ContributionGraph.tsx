import { useMemo, useState } from 'react'
import { cn } from '../../utils/cn'
import type { DailyActivity } from '../../api/statistics'

interface ContributionGraphProps {
    data: DailyActivity[]
    className?: string
}

const MONTHS_DE = [
    'Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun',
    'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez',
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

    const { weeks, monthLabels, totalCount } = useMemo(() => {
        // Create a map for quick lookup
        const dataMap = new Map<string, DailyActivity>()
        data.forEach((d) => dataMap.set(d.date, d))

        // Get date range (last 365 days)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const oneYearAgo = new Date(today)
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
        oneYearAgo.setDate(oneYearAgo.getDate() + 1)

        // Find the Sunday before oneYearAgo (GitHub starts weeks on Sunday)
        const startDate = new Date(oneYearAgo)
        const dayOfWeek = startDate.getDay()
        startDate.setDate(startDate.getDate() - dayOfWeek)

        // Build weeks array (53 weeks to cover a full year)
        const weeks: (DailyActivity | null)[][] = []
        let currentWeek: (DailyActivity | null)[] = []
        let total = 0
        const monthPositions: { month: number; weekIndex: number }[] = []
        let lastMonth = -1

        const current = new Date(startDate)
        while (current <= today || currentWeek.length > 0) {
            const dateStr = current.toISOString().split('T')[0]
            const isInRange = current >= oneYearAgo && current <= today

            if (isInRange) {
                const dayData = dataMap.get(dateStr) || { date: dateStr, count: 0, level: 0 as const }
                currentWeek.push(dayData)
                total += dayData.count

                // Track month changes (only for first day of each month shown)
                const month = current.getMonth()
                const dayOfMonth = current.getDate()
                if (month !== lastMonth && dayOfMonth <= 7) {
                    monthPositions.push({
                        month,
                        weekIndex: weeks.length,
                    })
                    lastMonth = month
                }
            } else if (current < oneYearAgo) {
                currentWeek.push(null) // Empty cell before range
            }

            // New week on Saturday (end of week)
            if (current.getDay() === 6) {
                if (currentWeek.length > 0) {
                    weeks.push(currentWeek)
                }
                currentWeek = []
                if (current > today) break
            }

            current.setDate(current.getDate() + 1)
        }

        // Push remaining days
        if (currentWeek.length > 0) {
            // Pad the last week if needed
            while (currentWeek.length < 7) {
                currentWeek.push(null)
            }
            weeks.push(currentWeek)
        }

        return { weeks, monthLabels: monthPositions, totalCount: total }
    }, [data])

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

    // Calculate total width
    const totalWidth = weeks.length * (CELL_SIZE + CELL_GAP)

    return (
        <div className={cn('relative', className)}>
            {/* Tooltip */}
            {hoveredDay && (
                <div
                    className="pointer-events-none fixed z-[100] -translate-x-1/2 -translate-y-full"
                    style={{ left: tooltipPos.x, top: tooltipPos.y }}
                >
                    <div className="whitespace-nowrap rounded-md bg-neutral-800 px-2.5 py-1.5 text-xs text-white shadow-lg dark:bg-neutral-950">
                        <span className="font-semibold">
                            {hoveredDay.count === 0
                                ? 'Keine Aktivitäten'
                                : `${hoveredDay.count} Aktivität${hoveredDay.count !== 1 ? 'en' : ''}`}
                        </span>
                        <span className="text-neutral-400"> am {formatDate(hoveredDay.date)}</span>
                    </div>
                    <div className="mx-auto h-2 w-2 -translate-y-[3px] rotate-45 bg-neutral-800 dark:bg-neutral-950" />
                </div>
            )}

            {/* Graph Container - Scrollable */}
            <div className="overflow-x-auto">
                <div style={{ minWidth: `${totalWidth + 32}px` }}>
                    {/* Month Labels */}
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

                    {/* Grid with weekday labels */}
                    <div className="flex">
                        {/* Weekday labels - Sun, Mon, Tue... only show Mon, Wed, Fri */}
                        <div
                            className="mr-1 flex w-7 flex-col text-[10px] text-neutral-600 dark:text-neutral-400"
                            style={{ gap: `${CELL_GAP}px` }}
                        >
                            <div style={{ height: CELL_SIZE }} /> {/* Sun - empty */}
                            <div className="flex items-center" style={{ height: CELL_SIZE }}>Mo</div>
                            <div style={{ height: CELL_SIZE }} /> {/* Tue - empty */}
                            <div className="flex items-center" style={{ height: CELL_SIZE }}>Mi</div>
                            <div style={{ height: CELL_SIZE }} /> {/* Thu - empty */}
                            <div className="flex items-center" style={{ height: CELL_SIZE }}>Fr</div>
                            <div style={{ height: CELL_SIZE }} /> {/* Sat - empty */}
                        </div>

                        {/* Contribution cells */}
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
                                                day ? LEVEL_COLORS[day.level] : 'bg-transparent',
                                                day && 'cursor-pointer hover:ring-1 hover:ring-neutral-400 hover:ring-offset-1 dark:hover:ring-neutral-500'
                                            )}
                                            style={{
                                                width: CELL_SIZE,
                                                height: CELL_SIZE,
                                            }}
                                            onMouseEnter={day ? (e) => handleMouseEnter(day, e) : undefined}
                                            onMouseLeave={day ? handleMouseLeave : undefined}
                                        />
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-600 dark:text-neutral-400">
                <span>
                    {totalCount.toLocaleString('de-DE')} Aktivitäten im letzten Jahr
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
