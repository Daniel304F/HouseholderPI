import { useState } from 'react'
import { Mail, Loader2, CheckCircle } from 'lucide-react'
import { Button, Input, Card } from '../common'

interface EmailSectionProps {
    currentEmail: string
    onChangeEmail: (newEmail: string, password: string) => Promise<void>
    isUpdating: boolean
}

export const EmailSection = ({
    currentEmail,
    onChangeEmail,
    isUpdating,
}: EmailSectionProps) => {
    const [newEmail, setNewEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setSuccess(false)

        if (!newEmail.includes('@')) {
            setError('Bitte gib eine gültige E-Mail-Adresse ein')
            return
        }

        try {
            await onChangeEmail(newEmail, password)
            setNewEmail('')
            setPassword('')
            setSuccess(true)
            setTimeout(() => setSuccess(false), 3000)
        } catch {
            setError('E-Mail konnte nicht geändert werden. Überprüfe dein Passwort oder ob die E-Mail bereits verwendet wird.')
        }
    }

    return (
        <Card className="p-6">
            <div className="mb-4 flex items-center gap-2">
                <Mail className="size-5 text-brand-500" />
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                    E-Mail ändern
                </h2>
            </div>

            <p className="mb-4 text-sm text-neutral-500 dark:text-neutral-400">
                Aktuelle E-Mail: <span className="font-medium text-neutral-700 dark:text-neutral-300">{currentEmail}</span>
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="Neue E-Mail-Adresse"
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="neue@email.de"
                    required
                />

                <Input
                    label="Aktuelles Passwort"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Zur Bestätigung"
                    required
                />

                {error && (
                    <p className="text-sm text-error-600 dark:text-error-400">
                        {error}
                    </p>
                )}

                {success && (
                    <div className="flex items-center gap-2 text-sm text-success-600 dark:text-success-400">
                        <CheckCircle className="size-4" />
                        E-Mail erfolgreich geändert
                    </div>
                )}

                <Button
                    type="submit"
                    disabled={isUpdating || !newEmail || !password}
                    icon={isUpdating ? <Loader2 className="size-4 animate-spin" /> : undefined}
                >
                    {isUpdating ? 'Wird geändert...' : 'E-Mail ändern'}
                </Button>
            </form>
        </Card>
    )
}
