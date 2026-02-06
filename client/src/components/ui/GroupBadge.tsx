export interface GroupBadgeProps {
    name: string
}

export const GroupBadge = ({ name }: GroupBadgeProps) => {
    return (
        <span className="inline-block rounded bg-brand-100 px-1.5 py-0.5 text-xs font-medium text-brand-700 dark:bg-brand-900/30 dark:text-brand-400">
            {name}
        </span>
    )
}
