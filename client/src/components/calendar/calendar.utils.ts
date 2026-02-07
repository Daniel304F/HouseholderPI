import type { RecurringTaskTemplate } from '../../api/recurringTasks'

/**
 * Calculate recurring task dates for a given month.
 * Returns a Map from date string to array of recurring templates on that date.
 */
export const getRecurringDatesForMonth = (
    templates: RecurringTaskTemplate[],
    year: number,
    month: number
): Map<string, RecurringTaskTemplate[]> => {
    const map = new Map<string, RecurringTaskTemplate[]>()

    templates.forEach((template) => {
        if (!template.isActive) return

        const dates: Date[] = []
        const dueDays = template.dueDays || []

        switch (template.frequency) {
            case 'daily': {
                const daysInMonth = new Date(year, month + 1, 0).getDate()
                for (let d = 1; d <= daysInMonth; d++) {
                    dates.push(new Date(year, month, d))
                }
                break
            }

            case 'weekly':
                dueDays.forEach((dueDay) => {
                    const firstDay = new Date(year, month, 1)
                    const lastDay = new Date(year, month + 1, 0)
                    const current = new Date(firstDay)
                    while (current.getDay() !== dueDay) {
                        current.setDate(current.getDate() + 1)
                    }
                    while (current <= lastDay) {
                        dates.push(new Date(current))
                        current.setDate(current.getDate() + 7)
                    }
                })
                break

            case 'biweekly':
                dueDays.forEach((dueDay) => {
                    const firstDayBi = new Date(year, month, 1)
                    const lastDayBi = new Date(year, month + 1, 0)
                    const currentBi = new Date(firstDayBi)
                    while (currentBi.getDay() !== dueDay) {
                        currentBi.setDate(currentBi.getDate() + 1)
                    }
                    while (currentBi <= lastDayBi) {
                        dates.push(new Date(currentBi))
                        currentBi.setDate(currentBi.getDate() + 14)
                    }
                })
                break

            case 'monthly': {
                const dayOfMonth = Math.min(
                    dueDays[0] || 1,
                    new Date(year, month + 1, 0).getDate()
                )
                dates.push(new Date(year, month, dayOfMonth))
                break
            }
        }

        dates.forEach((date) => {
            const dateKey = date.toDateString()
            const existing = map.get(dateKey) || []
            existing.push(template)
            map.set(dateKey, existing)
        })
    })

    return map
}
