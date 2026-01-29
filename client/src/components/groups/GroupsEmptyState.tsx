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
        <div className="relative flex flex-col items-center justify-center py-12 text-center">
            <div className="from-brand-50/60 to-brand-50/40 dark:from-brand-950/40 dark:to-brand-900/30 pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b via-white/80 dark:via-neutral-950/60" />
            <img
                src="/fallback-groups.png"
                alt="Keine Gruppen"
                className={cn(
                    'mb-6 w-full object-contain drop-shadow-md',
                    isDesktop ? 'max-w-4xl' : 'max-w-xs sm:max-w-sm md:max-w-md'
                )}
            />
            <h3 className="mb-2 text-lg font-semibold tracking-tight text-neutral-900 dark:text-white">
                Noch keine Gruppen
            </h3>
            <p className="mb-6 max-w-sm text-neutral-600 dark:text-neutral-300">
                Erstelle eine neue Gruppe oder tritt einer bestehenden bei, um
                gemeinsam Aufgaben zu verwalten.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
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
                    className="shadow-brand-500/15 hover:shadow-brand-500/20"
                >
                    Erstellen
                </Button>
            </div>
        </div>
    )
}
