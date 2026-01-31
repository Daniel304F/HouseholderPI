import { Calendar as CalendarIcon } from 'lucide-react'
import { cn } from '../../utils/cn'
import { Card } from '../common'
import { TaskCalendar } from './TaskCalendar'
import type { Task } from '../../api/tasks'
import type { RecurringTaskTemplate } from '../../api/recurringTasks'

interface MiniCalendarProps {
    tasks: Task[]
    recurringTasks?: RecurringTaskTemplate[]
    onTaskClick?: (task: Task) => void
    className?: string
    /** Show task list when a date is selected (default: false) */
    showTaskList?: boolean
}

export const MiniCalendar = ({
    tasks,
    recurringTasks,
    onTaskClick,
    className,
    showTaskList = false,
}: MiniCalendarProps) => {
    return (
        <Card className={cn('p-5', className)}>
            <div className="mb-4 flex items-center gap-2">
                <CalendarIcon className="size-5 text-brand-500" />
                <h3 className="font-semibold text-neutral-900 dark:text-white">
                    Kalender
                </h3>
            </div>
            <TaskCalendar
                tasks={tasks}
                recurringTasks={recurringTasks}
                onTaskClick={onTaskClick}
                compact={!showTaskList}
            />
        </Card>
    )
}
