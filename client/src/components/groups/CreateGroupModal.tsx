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
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={handleClose}
            />
            <div className="from-brand-50/40 to-brand-100/50 dark:from-brand-950/30 dark:to-brand-900/30 pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br via-transparent dark:via-neutral-950/40" />

            {/* Modal */}
            <div className="animate-in slide-in-from-top-4 shadow-brand-500/15 relative mx-4 w-full max-w-lg rounded-3xl border border-neutral-200/70 bg-white/90 p-6 shadow-2xl backdrop-blur duration-300 dark:border-neutral-800/70 dark:bg-neutral-900/80">
                {/* Header */}
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-white">
                        Neue Gruppe erstellen
                    </h2>
                    <IconButton
                        icon={<X className="size-5" />}
                        onClick={handleClose}
                        variant="ghost"
                        aria-label="Modal schließen"
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
