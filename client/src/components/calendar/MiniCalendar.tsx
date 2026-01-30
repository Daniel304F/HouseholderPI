import { Calendar as CalendarIcon } from 'lucide-react'
import { cn } from '../../utils/cn'
import { Card } from '../common'
import { TaskCalendar } from './TaskCalendar'
import type { Task } from '../../api/tasks'

interface MiniCalendarProps {
    tasks: Task[]
    onTaskClick?: (task: Task) => void
    className?: string
}

export const MiniCalendar = ({
    tasks,
    onTaskClick,
    className,
}: MiniCalendarProps) => {
    return (
        <Card className={cn('p-4', className)}>
            <div className="mb-3 flex items-center gap-2">
                <CalendarIcon className="size-5 text-brand-500" />
                <h3 className="font-semibold text-neutral-900 dark:text-white">
                    Kalender
                </h3>
            </div>
            <TaskCalendar
                tasks={tasks}
                onTaskClick={onTaskClick}
                compact={false}
            />
        </Card>
    )
}
