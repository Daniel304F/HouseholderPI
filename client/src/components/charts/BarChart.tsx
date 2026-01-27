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
}

export const BarChart = ({
    data,
    height = 200,
    showValues = true,
    showLabels = true,
    className,
    barClassName,
    horizontal = false,
    maxValue: providedMax,
}: BarChartProps) => {
    const maxValue = providedMax || Math.max(...data.map((d) => d.value), 1)

    if (horizontal) {
        return (
            <div className={cn('flex flex-col gap-3', className)}>
                {data.map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                        {showLabels && (
                            <span className="text-muted-foreground w-24 shrink-0 truncate text-sm">
                                {item.label}
                            </span>
                        )}
                        <div className="bg-muted relative h-8 flex-1 overflow-hidden rounded-md">
                            <div
                                className={cn(
                                    'absolute inset-y-0 left-0 rounded-md transition-all duration-500 ease-out',
                                    barClassName
                                )}
                                style={{
                                    width: `${(item.value / maxValue) * 100}%`,
                                    backgroundColor:
                                        item.color || 'hsl(var(--primary))',
                                }}
                            />
                            {showValues && (
                                <span className="absolute inset-0 flex items-center justify-end pr-3 text-sm font-medium">
                                    {item.value}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div
            className={cn('flex items-end gap-2', className)}
            style={{ height }}
        >
            {data.map((item, index) => (
                <div
                    key={index}
                    className="flex flex-1 flex-col items-center gap-1"
                >
                    {showValues && (
                        <span className="text-muted-foreground text-xs font-medium">
                            {item.value}
                        </span>
                    )}
                    <div
                        className={cn(
                            'w-full rounded-t-md transition-all duration-500 ease-out',
                            barClassName
                        )}
                        style={{
                            height: `${(item.value / maxValue) * 100}%`,
                            minHeight: item.value > 0 ? '4px' : '0',
                            backgroundColor:
                                item.color || 'hsl(var(--primary))',
                        }}
                    />
                    {showLabels && (
                        <span className="text-muted-foreground max-w-full truncate text-xs">
                            {item.label}
                        </span>
                    )}
                </div>
            ))}
        </div>
    )
}
