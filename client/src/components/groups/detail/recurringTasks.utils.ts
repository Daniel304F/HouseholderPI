import type { GroupMember } from '../../../api/groups'
import type { RecurringTaskTemplate } from '../../../api/recurringTasks'

const WEEKDAY_LABELS = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']

export const FREQUENCY_LABELS: Record<string, string> = {
    daily: 'Taeglich',
    weekly: 'Woechentlich',
    biweekly: 'Alle 2 Wochen',
    monthly: 'Monatlich',
}

export const getMemberName = (members: GroupMember[], userId: string) => {
    const member = members.find((item) => item.userId === userId)
    return member?.userName || 'Unbekannt'
}

export const getDueDayLabel = (template: RecurringTaskTemplate): string => {
    if (template.frequency === 'daily') return 'Jeden Tag'

    if (template.frequency === 'weekly' || template.frequency === 'biweekly') {
        const days = template.dueDays || []
        if (days.length === 0) return ''
        if (days.length === 7) return 'Jeden Tag'
        return days.map((day) => WEEKDAY_LABELS[day]).join(', ')
    }

    const monthDay = template.dueDays?.[0] || 1
    return `${monthDay}. des Monats`
}

export const getRecurringTemplatesQueryKey = (groupId: string) =>
    ['recurring-tasks', groupId] as const
