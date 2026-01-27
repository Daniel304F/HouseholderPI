/**
 * Zentralisierte Farbpalette für Charts
 */
export const CHART_COLORS = {
    completed: '#10B981', // emerald
    pending: '#F59E0B', // amber
    inProgress: '#3B82F6', // blue
    primary: '#6366F1', // indigo
} as const

export const MEMBER_COLORS = [
    '#6366F1', // indigo
    '#10B981', // emerald
    '#F59E0B', // amber
    '#EF4444', // red
    '#8B5CF6', // violet
    '#EC4899', // pink
    '#14B8A6', // teal
    '#F97316', // orange
] as const

/**
 * Hilfsfunktion um eine Farbe aus dem Array zu holen (zyklisch)
 */
export const getMemberColor = (index: number): string => {
    return MEMBER_COLORS[index % MEMBER_COLORS.length]
}
