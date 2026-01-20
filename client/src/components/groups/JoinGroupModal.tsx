import { useState } from 'react'
import { Button } from '../Button'
import { Input } from '../Input'
import { groupsApi } from '../../api/groups'

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 dark:bg-neutral-800">
                <h2 className="mb-4 text-xl font-bold text-neutral-900 dark:text-white">
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
                    <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
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
