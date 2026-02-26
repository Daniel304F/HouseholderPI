import { cn } from '../../utils/cn'

export const friendCardStyles = cn(
    'group flex w-full items-center gap-4 rounded-2xl p-4',
    /* background */
    'bg-white/92 dark:bg-neutral-900/70 backdrop-blur-sm',
    /* border */
    'border border-neutral-200/80 dark:border-neutral-700/60',
    /* shadow */
    'shadow-[0_2px_12px_-3px_hsl(149,58%,50%,0.07),0_1px_3px_0_rgb(0_0_0_/0.04)]',
    'dark:shadow-[0_2px_12px_-3px_rgb(0_0_0_/0.25)]',
    /* transitions */
    'transition-all duration-250 ease-out',
    /* hover */
    'hover:-translate-y-0.5',
    'hover:border-brand-200/70 dark:hover:border-brand-600/50',
    'hover:shadow-[0_8px_24px_-4px_hsl(149,58%,50%,0.12),0_2px_6px_0_rgb(0_0_0_/0.05)]',
    'dark:hover:shadow-[0_8px_24px_-4px_rgb(0_0_0_/0.3)]'
)

export const friendAvatarStyles = cn(
    'flex size-12 shrink-0 items-center justify-center rounded-full',
    'bg-gradient-to-br from-brand-100 to-teal-100 dark:from-brand-900/40 dark:to-teal-900/30',
    'text-base font-bold text-brand-700 dark:text-brand-300',
    'ring-2 ring-brand-200/50 dark:ring-brand-800/40',
    'transition-transform duration-250 group-hover:scale-105'
)

export const requestCardStyles = cn(
    'flex w-full flex-wrap items-center gap-3 rounded-2xl p-4 sm:flex-nowrap sm:gap-4',
    'bg-white/92 dark:bg-neutral-900/70 backdrop-blur-sm',
    'border border-neutral-200/80 dark:border-neutral-700/60',
    'shadow-[0_2px_12px_-3px_hsl(149,58%,50%,0.06),0_1px_3px_0_rgb(0_0_0_/0.04)]',
    'dark:shadow-[0_2px_12px_-3px_rgb(0_0_0_/0.2)]'
)

export const requestAvatarStyles = cn(
    'flex size-12 shrink-0 items-center justify-center rounded-full',
    'bg-gradient-to-br from-warning-100 to-amber-100 dark:from-warning-900/40 dark:to-amber-900/30',
    'text-base font-bold text-warning-700 dark:text-warning-300',
    'ring-2 ring-warning-200/50 dark:ring-warning-800/40'
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
