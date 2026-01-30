/**
 * Formatiert ein Datum relativ zum aktuellen Tag
 * @param dateStr - ISO Datum-String
 * @returns Formatierter String (z.B. "Heute", "Morgen", "In 3 Tagen", "15.03.")
 */
export const formatDueDate = (dateStr: string): string => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffDays = Math.ceil(
        (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (diffDays < 0) return `${Math.abs(diffDays)} Tag(e) überfällig`
    if (diffDays === 0) return 'Heute'
    if (diffDays === 1) return 'Morgen'
    if (diffDays < 7) return `In ${diffDays} Tagen`
    return date.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
    })
}

/**
 * Prüft ob ein Datum überfällig ist
 * @param dateStr - ISO Datum-String
 * @returns true wenn das Datum in der Vergangenheit liegt
 */
export const isOverdue = (dateStr: string): boolean => {
    return new Date(dateStr) < new Date()
}

/**
 * Formatiert ein Datum als ISO-String für date inputs (YYYY-MM-DD)
 * @param date - Date Objekt oder ISO String
 * @returns YYYY-MM-DD formatierter String
 */
export const toDateInputValue = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toISOString().split('T')[0]
}

/**
 * Gibt das morgige Datum als ISO-String für date inputs zurück
 * @returns YYYY-MM-DD formatierter String für morgen
 */
export const getTomorrowDateValue = (): string => {
    return toDateInputValue(new Date(Date.now() + 24 * 60 * 60 * 1000))
}

/**
 * Formatiert ein Datum im deutschen Format (DD.MM.YYYY)
 * @param dateStr - ISO Datum-String
 * @returns Formatierter String (z.B. "15.03.2024")
 */
export const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    })
}

/**
 * Formatiert ein Datum mit Uhrzeit im deutschen Format
 * @param dateStr - ISO Datum-String
 * @returns Formatierter String (z.B. "15.03.2024, 14:30")
 */
export const formatDateTime = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

/**
 * Berechnet die verbleibenden Tage bis zu einem Datum
 * @param dateStr - ISO Datum-String
 * @returns Anzahl der Tage (negativ wenn überfällig)
 */
export const getDaysUntil = (dateStr: string): number => {
    const date = new Date(dateStr)
    const now = new Date()
    return Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}
