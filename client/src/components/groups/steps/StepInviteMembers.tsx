import { useState } from 'react'
import { Copy, Check, Link2, UserPlus } from 'lucide-react'
import { Button } from '../../common'

interface StepInviteMembersProps {
    inviteCode: string | undefined
    onCreateGroup: () => Promise<void>
    isCreating: boolean
}

export const StepInviteMembers = ({
    inviteCode,
    onCreateGroup,
    isCreating,
}: StepInviteMembersProps) => {
    const [copied, setCopied] = useState(false)

    const handleGenerateCode = async () => {
        await onCreateGroup()
    }

    const handleCopyCode = async () => {
        if (!inviteCode) return
        await navigator.clipboard.writeText(inviteCode)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleShareLink = async () => {
        if (!inviteCode) return
        const shareUrl = `${window.location.origin}/join/${inviteCode}`

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Gruppeneinladung',
                    text: 'Tritt unserer Gruppe bei!',
                    url: shareUrl,
                })
            } catch {
                // User cancelled share
            }
        } else {
            await navigator.clipboard.writeText(shareUrl)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    return (
        <div className="space-y-6">
            {/* Invite Code Section */}
            <div className="hover:border-brand-200 dark:hover:border-brand-800 rounded-xl border border-neutral-200 bg-neutral-50 p-6 transition-all duration-300 hover:shadow-md dark:border-neutral-700 dark:bg-neutral-800/50">
                {inviteCode ? (
                    <>
                        <p className="mb-3 text-sm text-neutral-600 dark:text-neutral-400">
                            Teile diesen Code mit deinen Freunden:
                        </p>
                        <div className="flex items-center gap-3">
                            <code className="hover:bg-brand-50 dark:hover:bg-brand-950 flex-1 rounded-lg bg-white px-4 py-3 font-mono text-lg font-bold tracking-wider text-neutral-900 transition-all duration-200 dark:bg-neutral-900 dark:text-white">
                                {inviteCode}
                            </code>
                            <Button
                                variant="secondary"
                                onClick={handleCopyCode}
                                icon={
                                    copied ? (
                                        <Check className="size-4 text-green-500" />
                                    ) : (
                                        <Copy className="size-4" />
                                    )
                                }
                            >
                                {copied ? 'Kopiert!' : 'Kopieren'}
                            </Button>
                        </div>
                    </>
                ) : (
                    <div className="text-center">
                        <p className="mb-4 text-sm text-neutral-600 dark:text-neutral-400">
                            Generiere einen Einladungscode, um Freunde
                            einzuladen
                        </p>
                        <Button
                            onClick={handleGenerateCode}
                            isLoading={isCreating}
                            icon={<Link2 className="size-4" />}
                        >
                            Code generieren
                        </Button>
                    </div>
                )}
            </div>

            {/* Share Options */}
            {inviteCode && (
                <div className="space-y-3">
                    <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        Oder teile direkt:
                    </p>
                    <Button
                        variant="outline"
                        fullWidth
                        onClick={handleShareLink}
                        icon={<UserPlus className="size-4" />}
                    >
                        Einladungslink teilen
                    </Button>
                </div>
            )}

            {/* Friends List Placeholder */}
            <div className="group hover:border-brand-300 hover:bg-brand-50/50 dark:hover:border-brand-700 dark:hover:bg-brand-950/20 rounded-xl border border-dashed border-neutral-300 p-6 transition-all duration-300 dark:border-neutral-600">
                <div className="group-hover:text-brand-600 dark:group-hover:text-brand-400 text-center text-neutral-500 transition-colors duration-300 dark:text-neutral-400">
                    <UserPlus className="mx-auto mb-2 size-8 opacity-50 transition-all duration-300 group-hover:scale-110 group-hover:opacity-100" />
                    <p className="text-sm">Freundesliste kommt bald...</p>
                    <p className="group-hover:text-brand-500/70 text-xs text-neutral-400">
                        Hier kannst du später direkt Freunde einladen
                    </p>
                </div>
            </div>
        </div>
    )
}
