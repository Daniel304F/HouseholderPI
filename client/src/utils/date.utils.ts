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
