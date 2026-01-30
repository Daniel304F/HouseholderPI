import { UserPlus, Users } from 'lucide-react'
import { cn } from '../../utils/cn'
import { Button } from '../common'

interface FriendsEmptyStateProps {
    onAddFriend: () => void
}

export const FriendsEmptyState = ({ onAddFriend }: FriendsEmptyStateProps) => {
    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center',
                'rounded-2xl border-2 border-dashed',
                'border-neutral-200 dark:border-neutral-700',
                'bg-neutral-50/50 dark:bg-neutral-800/50',
                'px-6 py-16'
            )}
        >
            <div
                className={cn(
                    'flex size-20 items-center justify-center rounded-full',
                    'bg-brand-100 dark:bg-brand-900/30',
                    'mb-6'
                )}
            >
                <Users className="text-brand-600 dark:text-brand-400 size-10" />
            </div>

            <h3 className="mb-2 text-xl font-semibold text-neutral-900 dark:text-white">
                Noch keine Freunde
            </h3>
            <p className="mb-6 max-w-sm text-center text-neutral-500 dark:text-neutral-400">
                Füge Freunde hinzu, um gemeinsam Aufgaben zu verwalten und euch
                gegenseitig zu Gruppen einzuladen.
            </p>

            <Button
                onClick={onAddFriend}
                icon={<UserPlus className="size-5" />}
            >
                Freund hinzufügen
            </Button>
        </div>
    )
}
