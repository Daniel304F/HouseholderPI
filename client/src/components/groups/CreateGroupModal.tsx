import { X } from 'lucide-react'
import { CreateGroupMultiStep } from './CreateGroupMultiStep'
import { IconButton } from '../IconButton'
import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut'
import type { Group } from '../../api/groups'

interface CreateGroupModalProps {
    isOpen: boolean
    onClose: () => void
    onCreated: (group?: Group) => void
}

export const CreateGroupModal = ({
    isOpen,
    onClose,
    onCreated,
}: CreateGroupModalProps) => {
    useKeyboardShortcut({
        enabled: isOpen,
        onEscape: onClose,
        preventDefault: true,
    })

    const handleComplete = (group: Group) => {
        onCreated(group)
        onClose()
    }

    const handleClose = () => {
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className="animate-in fade-in fixed inset-0 z-50 flex items-start justify-center pt-16 duration-200 sm:pt-24">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="animate-in slide-in-from-top-4 relative mx-4 w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl duration-300 dark:bg-neutral-800">
                {/* Header */}
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                        Neue Gruppe erstellen
                    </h2>
                    <IconButton
                        icon={X}
                        onClick={handleClose}
                        size={20}
                        variant="ghost"
                        ariaLabel="Modal schließen"
                    />
                </div>

                {/* MultiStep Content */}
                <CreateGroupMultiStep
                    onComplete={handleComplete}
                    onCancel={handleClose}
                />
            </div>
        </div>
    )
}
