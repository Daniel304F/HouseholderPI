import { cn } from '../../utils/cn'

export interface BarChartData {
    label: string
    value: number
    color?: string
}

interface BarChartProps {
    data: BarChartData[]
    height?: number
    showValues?: boolean
    showLabels?: boolean
    className?: string
    barClassName?: string
    horizontal?: boolean
    maxValue?: number
    title?: string
}

const defaultColors = [
    'var(--color-brand-500)',
    'var(--color-info-500)',
    'var(--color-success-500)',
    'var(--color-warning-500)',
    'var(--color-error-500)',
]

export const BarChart = ({
    data,
    height = 200,
    showValues = true,
    showLabels = true,
    className,
    barClassName,
    horizontal = false,
    maxValue: providedMax,
    title,
}: BarChartProps) => {
    const maxValue = providedMax || Math.max(...data.map((d) => d.value), 1)

    if (horizontal) {
        return (
            <div
                className={cn(
                    'rounded-2xl p-5',
                    'bg-white dark:bg-neutral-800',
                    'border border-neutral-200 dark:border-neutral-700',
                    'shadow-sm',
                    className
                )}
            >
                {title && (
                    <h3 className="mb-4 text-sm font-semibold text-neutral-700 dark:text-neutral-200">
                        {title}
                    </h3>
                )}
                <div className="flex flex-col gap-3">
                    {data.map((item, index) => (
                        <div key={index} className="group flex items-center gap-3">
                            {showLabels && (
                                <span className="w-20 shrink-0 truncate text-xs font-medium text-neutral-600 dark:text-neutral-400">
                                    {item.label}
                                </span>
                            )}
                            <div className="relative h-7 flex-1 overflow-hidden rounded-lg bg-neutral-100/80 dark:bg-neutral-800/60">
                                <div
                                    className={cn(
                                        'absolute inset-y-0 left-0 rounded-lg',
                                        'transition-all duration-700 ease-out',
                                        'group-hover:brightness-110',
                                        barClassName
                                    )}
                                    style={{
                                        width: `${(item.value / maxValue) * 100}%`,
                                        background: item.color || `linear-gradient(90deg, ${defaultColors[index % defaultColors.length]}, ${defaultColors[(index + 1) % defaultColors.length]}80)`,
                                        boxShadow: `0 2px 8px ${item.color || defaultColors[index % defaultColors.length]}40`,
                                    }}
                                />
                                {showValues && (
                                    <span className="absolute inset-0 flex items-center justify-end pr-3 text-xs font-bold text-neutral-700 dark:text-neutral-200">
                                        {item.value}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div
            className={cn(
                'rounded-2xl p-5',
                'bg-white dark:bg-neutral-800',
                'border border-neutral-200 dark:border-neutral-700',
                'shadow-sm',
                className
            )}
        >
            {title && (
                <h3 className="mb-4 text-sm font-semibold text-neutral-700 dark:text-neutral-200">
                    {title}
                </h3>
            )}
            <div className="flex items-end gap-3" style={{ height }}>
                {data.map((item, index) => (
                    <div
                        key={index}
                        className="group flex flex-1 flex-col items-center gap-2"
                    >
                        {showValues && (
                            <span className="text-xs font-bold text-neutral-600 dark:text-neutral-300 transition-colors group-hover:text-brand-600 dark:group-hover:text-brand-400">
                                {item.value}
                            </span>
                        )}
                        <div
                            className={cn(
                                'w-full rounded-t-xl',
                                'transition-all duration-700 ease-out',
                                'group-hover:brightness-110 group-hover:scale-[1.02]',
                                barClassName
                            )}
                            style={{
                                height: `${(item.value / maxValue) * 100}%`,
                                minHeight: item.value > 0 ? '8px' : '0',
                                background: item.color || `linear-gradient(180deg, ${defaultColors[index % defaultColors.length]}, ${defaultColors[index % defaultColors.length]}90)`,
                                boxShadow: `0 -4px 12px ${item.color || defaultColors[index % defaultColors.length]}30`,
                            }}
                        />
                        {showLabels && (
                            <span className="max-w-full truncate text-[10px] font-medium text-neutral-500 dark:text-neutral-400">
                                {item.label}
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
