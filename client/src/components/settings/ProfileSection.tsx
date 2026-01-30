import { useState, useCallback } from 'react'
import { User, Mail, Save, Loader2 } from 'lucide-react'
import { Button, Input, Card } from '../common'
import { AvatarUpload } from './AvatarUpload'
import type { User as UserType } from '../../api/auth'

interface ProfileSectionProps {
    user: UserType
    onUpdateProfile: (data: { name?: string; avatar?: string | null }) => Promise<void>
    isUpdating: boolean
}

export const ProfileSection = ({
    user,
    onUpdateProfile,
    isUpdating,
}: ProfileSectionProps) => {
    const [name, setName] = useState(user.name)
    const [avatar, setAvatar] = useState<string | null>(user.avatar || null)
    const [hasChanges, setHasChanges] = useState(false)

    const handleNameChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setName(e.target.value)
            setHasChanges(true)
        },
        []
    )

    const handleAvatarChange = useCallback((newAvatar: string | null) => {
        setAvatar(newAvatar)
        setHasChanges(true)
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const updates: { name?: string; avatar?: string | null } = {}

        if (name !== user.name) {
            updates.name = name
        }

        if (avatar !== (user.avatar || null)) {
            updates.avatar = avatar
        }

        if (Object.keys(updates).length === 0) return

        await onUpdateProfile(updates)
        setHasChanges(false)
    }

    return (
        <Card className="p-6">
            <h2 className="mb-6 text-lg font-semibold text-neutral-900 dark:text-white">
                Profil
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Avatar Upload */}
                <div className="flex justify-center">
                    <AvatarUpload
                        currentAvatar={avatar || undefined}
                        userName={user.name}
                        onAvatarChange={handleAvatarChange}
                        isLoading={isUpdating}
                        size="xl"
                    />
                </div>

                {/* Name Field */}
                <div className="space-y-2">
                    <label
                        htmlFor="name"
                        className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300"
                    >
                        <User className="size-4" />
                        Name
                    </label>
                    <Input
                        id="name"
                        value={name}
                        onChange={handleNameChange}
                        placeholder="Dein Name"
                        disabled={isUpdating}
                    />
                </div>

                {/* Email Field (readonly) */}
                <div className="space-y-2">
                    <label
                        htmlFor="email"
                        className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300"
                    >
                        <Mail className="size-4" />
                        E-Mail
                    </label>
                    <Input
                        id="email"
                        value={user.email}
                        disabled
                        className="bg-neutral-50 dark:bg-neutral-800/50"
                    />
                    <p className="text-xs text-neutral-500">
                        E-Mail-Adresse kann nicht geändert werden
                    </p>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-4">
                    <Button
                        type="submit"
                        disabled={!hasChanges || isUpdating}
                        icon={
                            isUpdating ? (
                                <Loader2 className="size-4 animate-spin" />
                            ) : (
                                <Save className="size-4" />
                            )
                        }
                    >
                        {isUpdating ? 'Speichern...' : 'Speichern'}
                    </Button>
                </div>
            </form>
        </Card>
    )
}
