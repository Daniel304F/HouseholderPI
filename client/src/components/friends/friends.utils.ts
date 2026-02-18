import { cn } from '../../utils/cn'

export const friendCardStyles = cn(
    'group flex w-full items-center gap-4 rounded-xl p-4',
    'border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800',
    'transition-all duration-300 ease-out',
    'hover:border-brand-300 hover:shadow-lg hover:shadow-brand-500/10 dark:hover:border-brand-600'
)

export const friendAvatarStyles = cn(
    'flex size-12 items-center justify-center rounded-full',
    'bg-brand-100 text-lg font-semibold text-brand-600 dark:bg-brand-900/30 dark:text-brand-400',
    'transition-transform duration-300 group-hover:scale-105'
)

export const requestCardStyles = cn(
    'flex w-full flex-wrap items-center gap-3 rounded-xl p-4 sm:flex-nowrap sm:gap-4',
    'border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800'
)

export const requestAvatarStyles = cn(
    'flex size-12 items-center justify-center rounded-full',
    'bg-amber-100 text-lg font-semibold text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
)

export const getInitials = (name: string) => {
    return name
        .split(' ')
        .map((chunk) => chunk[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
}

export const formatDate = (dateString: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    if (Number.isNaN(date.getTime())) return ''
    return date.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: 'short',
    })
}
