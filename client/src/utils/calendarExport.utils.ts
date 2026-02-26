import type { Task } from '../api/tasks'

const escapeIcsText = (value: string): string =>
    value
        .replace(/\\/g, '\\\\')
        .replace(/\n/g, '\\n')
        .replace(/,/g, '\\,')
        .replace(/;/g, '\\;')

const formatDateForIcs = (date: Date): string => {
    const year = date.getUTCFullYear()
    const month = String(date.getUTCMonth() + 1).padStart(2, '0')
    const day = String(date.getUTCDate()).padStart(2, '0')
    return `${year}${month}${day}`
}

const formatTimestampForIcs = (date: Date): string => {
    const year = date.getUTCFullYear()
    const month = String(date.getUTCMonth() + 1).padStart(2, '0')
    const day = String(date.getUTCDate()).padStart(2, '0')
    const hours = String(date.getUTCHours()).padStart(2, '0')
    const minutes = String(date.getUTCMinutes()).padStart(2, '0')
    const seconds = String(date.getUTCSeconds()).padStart(2, '0')
    return `${year}${month}${day}T${hours}${minutes}${seconds}Z`
}

const createEventDescription = (task: Task): string => {
    const lines = [
        `Status: ${task.status}`,
        `Prioritaet: ${task.priority}`,
        task.description ? `Beschreibung: ${task.description}` : '',
        task.notes ? `Notizen: ${task.notes}` : '',
    ].filter(Boolean)

    return escapeIcsText(lines.join('\n'))
}

const createEventBlock = (task: Task, exportedAt: Date): string => {
    const dueDate = new Date(task.dueDate)
    dueDate.setUTCHours(0, 0, 0, 0)

    const dueDateEnd = new Date(dueDate)
    dueDateEnd.setUTCDate(dueDateEnd.getUTCDate() + 1)

    const status = task.status === 'completed' ? 'COMPLETED' : 'CONFIRMED'

    return [
        'BEGIN:VEVENT',
        `UID:${task.id}@householderpi`,
        `DTSTAMP:${formatTimestampForIcs(exportedAt)}`,
        `DTSTART;VALUE=DATE:${formatDateForIcs(dueDate)}`,
        `DTEND;VALUE=DATE:${formatDateForIcs(dueDateEnd)}`,
        `SUMMARY:${escapeIcsText(task.title)}`,
        `DESCRIPTION:${createEventDescription(task)}`,
        `STATUS:${status}`,
        'END:VEVENT',
    ].join('\r\n')
}

const createIcsContent = (tasks: Task[]): string => {
    const exportedAt = new Date()
    const events = tasks.map((task) => createEventBlock(task, exportedAt)).join('\r\n')

    return [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//HouseholderPI//Task Export//DE',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        events,
        'END:VCALENDAR',
    ].join('\r\n')
}

const sanitizeFileSegment = (value: string): string =>
    value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')

export const exportTasksToCalendar = (tasks: Task[], groupName: string) => {
    if (tasks.length === 0) return

    const icsContent = createIcsContent(tasks)
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const safeGroupName = sanitizeFileSegment(groupName || 'gruppe')
    const fileDate = new Date().toISOString().slice(0, 10)

    link.href = url
    link.download = `householderpi-${safeGroupName}-${fileDate}.ics`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
}
