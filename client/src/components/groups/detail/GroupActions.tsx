import { Trash2, LogOut } from 'lucide-react'
import { Button } from '../../Button'

interface GroupActionsProps {
    isOwner: boolean
    isLeaving: boolean
    isDeleting: boolean
    showDeleteConfirm: boolean
    onLeave: () => void
    onDelete: () => void
    onToggleDeleteConfirm: (show: boolean) => void
}

export const GroupActions = ({
    isOwner,
    isLeaving,
    isDeleting,
    showDeleteConfirm,
    onLeave,
    onDelete,
    onToggleDeleteConfirm,
}: GroupActionsProps) => {
    return (
        <div className="flex flex-col gap-2">
            {!isOwner && (
                <Button
                    variant="secondary"
                    onClick={onLeave}
                    isLoading={isLeaving}
                    icon={<LogOut className="size-4" />}
                    fullWidth
                >
                    Gruppe verlassen
                </Button>
            )}
            {isOwner && (
                <>
                    {showDeleteConfirm ? (
                        <div className="flex gap-2">
                            <Button
                                variant="secondary"
                                onClick={() => onToggleDeleteConfirm(false)}
                                fullWidth
                            >
                                Abbrechen
                            </Button>
                            <Button
                                variant="primary"
                                onClick={onDelete}
                                isLoading={isDeleting}
                                className="!bg-red-500 hover:!bg-red-600"
                                fullWidth
                            >
                                Ja, löschen
                            </Button>
                        </div>
                    ) : (
                        <Button
                            variant="secondary"
                            onClick={() => onToggleDeleteConfirm(true)}
                            icon={<Trash2 className="size-4 text-red-500" />}
                            fullWidth
                        >
                            Gruppe löschen
                        </Button>
                    )}
                </>
            )}
        </div>
    )
}
