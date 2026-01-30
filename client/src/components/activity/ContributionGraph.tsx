import { useMemo } from 'react'
import { cn } from '../../utils/cn'
import type { DailyActivity } from '../../api/statistics'

interface ContributionGraphProps {
    data: DailyActivity[]
    className?: string
}

const MONTHS_DE = [
    'Jan',
    'Feb',
    'Mär',
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

const WEEKDAYS_DE = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

const levelColors = {
    0: 'bg-neutral-100 dark:bg-neutral-800',
    1: 'bg-brand-200 dark:bg-brand-900',
    2: 'bg-brand-400 dark:bg-brand-700',
    3: 'bg-brand-500 dark:bg-brand-500',
    4: 'bg-brand-600 dark:bg-brand-400',
}

export const ContributionGraph = ({
    data,
    className,
}: ContributionGraphProps) => {
    const { weeks, monthLabels, totalCount } = useMemo(() => {
        // Group data by weeks (starting Monday)
        const weeks: DailyActivity[][] = []
        let currentWeek: DailyActivity[] = []
        let total = 0

        // Track month positions for labels
        const monthPositions: { month: number; weekIndex: number }[] = []
        let lastMonth = -1

        data.forEach((day) => {
            const date = new Date(day.date)
            const dayOfWeek = (date.getDay() + 6) % 7 // Monday = 0

            // Start new week on Monday
            if (dayOfWeek === 0 && currentWeek.length > 0) {
                weeks.push(currentWeek)
                currentWeek = []
            }

            // Fill empty days at start of first week
            if (weeks.length === 0 && currentWeek.length === 0) {
                for (let i = 0; i < dayOfWeek; i++) {
                    currentWeek.push({ date: '', count: 0, level: 0 })
                }
            }

            currentWeek.push(day)
            total += day.count

            // Track month changes
            const month = date.getMonth()
            if (month !== lastMonth) {
                monthPositions.push({ month, weekIndex: weeks.length })
                lastMonth = month
            }
        })

        // Push the last week
        if (currentWeek.length > 0) {
            weeks.push(currentWeek)
        }

        // Create month labels with positions
        const labels = monthPositions.map(({ month, weekIndex }) => ({
            label: MONTHS_DE[month],
            position: weekIndex,
        }))

        return { weeks, monthLabels: labels, totalCount: total }
    }, [data])

    return (
        <div className={cn('space-y-2', className)}>
            {/* Month labels */}
            <div className="flex text-xs text-neutral-500 dark:text-neutral-400">
                <div className="w-8 flex-shrink-0" />
                <div className="relative flex-1">
                    {monthLabels.map(({ label, position }, idx) => (
                        <span
                            key={idx}
                            className="absolute text-[10px]"
                            style={{ left: `${(position / weeks.length) * 100}%` }}
                        >
                            {label}
                        </span>
                    ))}
                </div>
            </div>

            {/* Grid */}
            <div className="flex gap-0.5">
                {/* Weekday labels */}
                <div className="flex flex-col gap-0.5 pr-1 text-[10px] text-neutral-500 dark:text-neutral-400">
                    {WEEKDAYS_DE.map((day, idx) => (
                        <div
                            key={day}
                            className={cn(
                                'flex h-[11px] items-center justify-end',
                                idx % 2 === 1 && 'invisible'
                            )}
                        >
                            {day}
                        </div>
                    ))}
                </div>

                {/* Contribution cells */}
                <div className="flex gap-0.5 overflow-x-auto">
                    {weeks.map((week, weekIndex) => (
                        <div key={weekIndex} className="flex flex-col gap-0.5">
                            {week.map((day, dayIndex) => (
                                <div
                                    key={`${weekIndex}-${dayIndex}`}
                                    className={cn(
                                        'h-[11px] w-[11px] rounded-sm transition-colors',
                                        day.date ? levelColors[day.level] : 'bg-transparent',
                                        day.date && 'hover:ring-1 hover:ring-neutral-400'
                                    )}
                                    title={
                                        day.date
                                            ? `${day.count} Aktivität${day.count !== 1 ? 'en' : ''} am ${formatDate(day.date)}`
                                            : undefined
                                    }
                                />
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                <span>
                    {totalCount} Aktivität{totalCount !== 1 ? 'en' : ''} im letzten
                    Jahr
                </span>
                <div className="flex items-center gap-1">
                    <span>Weniger</span>
                    <div className="flex gap-0.5">
                        {([0, 1, 2, 3, 4] as const).map((level) => (
                            <div
                                key={level}
                                className={cn(
                                    'h-[11px] w-[11px] rounded-sm',
                                    levelColors[level]
                                )}
                            />
                        ))}
                    </div>
                    <span>Mehr</span>
                </div>
            </div>
        </div>
    )
}

function formatDate(dateStr: string): string {
    const date = new Date(dateStr)
    return date.toLocaleDateString('de-DE', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    })
}
