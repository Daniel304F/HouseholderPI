import { useState } from 'react'
import { Button } from '../Button'
import { Input } from '../Input'
import { groupsApi } from '../../api/groups'

interface CreateGroupModalProps {
    isOpen: boolean
    onClose: () => void
    onCreated: () => void
}

export const CreateGroupModal = ({
    isOpen,
    onClose,
    onCreated,
}: CreateGroupModalProps) => {
    const [name, setName] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) return

        setIsLoading(true)
        setError('')

        try {
            await groupsApi.createGroup({ name: name.trim() })
            onCreated()
            handleClose()
        } catch {
            setError('Gruppe konnte nicht erstellt werden')
        } finally {
            setIsLoading(false)
        }
    }

    const handleClose = () => {
        setName('')
        setError('')
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 dark:bg-neutral-800">
                <h2 className="mb-4 text-xl font-bold text-neutral-900 dark:text-white">
                    Neue Gruppe erstellen
                </h2>
                <form onSubmit={handleSubmit}>
                    <Input
                        label="Gruppenname"
                        placeholder="z.B. Meine WG"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        error={error}
                        autoFocus
                    />
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
                            disabled={!name.trim()}
                            fullWidth
                        >
                            Erstellen
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
