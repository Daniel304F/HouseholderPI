import { useState } from 'react'
import { Button, Input } from '../common'
import { groupsApi } from '../../api/groups'
import { useToast } from '../../contexts/ToastContext'
import { cn } from '../../utils/cn'

interface JoinGroupModalProps {
    isOpen: boolean
    onClose: () => void
    onJoined: () => void
}

export const JoinGroupModal = ({
    isOpen,
    onClose,
    onJoined,
}: JoinGroupModalProps) => {
    const toast = useToast()
    const [inviteCode, setInviteCode] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!inviteCode.trim()) return

        setIsLoading(true)
        setError('')

        try {
            await groupsApi.joinGroup({
                inviteCode: inviteCode.trim().toUpperCase(),
            })
            onJoined()
            handleClose()
        } catch {
            setError('Ungültiger Invite-Code')
            toast.error('Ungültiger oder abgelaufener Invite-Code')
        } finally {
            setIsLoading(false)
        }
    }

    const handleClose = () => {
        setInviteCode('')
        setError('')
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
            <div className="from-brand-50/50 to-brand-100/50 dark:from-brand-950/30 dark:to-brand-900/30 pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br via-transparent dark:via-neutral-950/40" />
            <div
                className={cn(
                    'w-full max-w-md rounded-3xl p-6',
                    'shadow-brand-500/15 border border-neutral-200/70 bg-white/90 shadow-2xl backdrop-blur dark:border-neutral-800/70 dark:bg-neutral-900/80'
                )}
            >
                <h2 className="mb-4 text-xl font-semibold tracking-tight text-neutral-900 dark:text-white">
                    Gruppe beitreten
                </h2>
                <form onSubmit={handleSubmit}>
                    <Input
                        label="Invite-Code"
                        placeholder="z.B. A1B2C3D4"
                        value={inviteCode}
                        onChange={(e) =>
                            setInviteCode(e.target.value.toUpperCase())
                        }
                        error={error}
                        autoFocus
                        className="font-mono tracking-wider"
                    />
                    <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                        Frage den Gruppen-Admin nach dem Invite-Code
                    </p>
                    <div className="mt-6 flex gap-3">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={handleClose}
                            fullWidth
                        >
                            Abbrechen
                        </Button>
                        <Button
                            type="submit"
                            isLoading={isLoading}
                            disabled={!inviteCode.trim()}
                            fullWidth
                        >
                            Beitreten
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
