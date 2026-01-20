import { Users, UserPlus, Plus } from 'lucide-react'
import { Button } from '../Button'

interface GroupsEmptyStateProps {
    onCreateClick: () => void
    onJoinClick: () => void
}

export const GroupsEmptyState = ({
    onCreateClick,
    onJoinClick,
}: GroupsEmptyStateProps) => {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="bg-brand-100 dark:bg-brand-900/30 mb-4 flex h-20 w-20 items-center justify-center rounded-full">
                <Users className="text-brand-600 dark:text-brand-400 h-10 w-10" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-neutral-900 dark:text-white">
                Noch keine Gruppen
            </h3>
            <p className="mb-6 max-w-sm text-neutral-500 dark:text-neutral-400">
                Erstelle eine neue Gruppe oder tritt einer bestehenden bei, um
                gemeinsam Aufgaben zu verwalten.
            </p>
            <div className="flex gap-3">
                <Button
                    variant="secondary"
                    onClick={onJoinClick}
                    icon={<UserPlus className="h-5 w-5" />}
                >
                    Beitreten
                </Button>
                <Button
                    onClick={onCreateClick}
                    icon={<Plus className="h-5 w-5" />}
                >
                    Erstellen
                </Button>
            </div>
        </div>
    )
}
