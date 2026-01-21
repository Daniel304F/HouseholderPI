import { UserPlus, Plus } from 'lucide-react'
import { Button } from '../Button'
import { useViewport } from '../../hooks/useViewport'
import { cn } from '../../utils/cn'

interface GroupsEmptyStateProps {
    onCreateClick: () => void
    onJoinClick: () => void
}

export const GroupsEmptyState = ({
    onCreateClick,
    onJoinClick,
}: GroupsEmptyStateProps) => {
    const { isDesktop } = useViewport()

    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <img
                src="/fallback-groups.png"
                alt="Keine Gruppen"
                className={cn(
                    'mb-6 w-full object-contain',
                    isDesktop ? 'max-w-4xl' : 'max-w-xs sm:max-w-sm md:max-w-md'
                )}
            />
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
                    icon={<UserPlus className="size-5" />}
                >
                    Beitreten
                </Button>
                <Button
                    onClick={onCreateClick}
                    icon={<Plus className="size-5" />}
                >
                    Erstellen
                </Button>
            </div>
        </div>
    )
}
