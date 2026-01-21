import { useState, useCallback, useRef } from 'react'
import { Camera, Copy, Check, UserPlus, Link2 } from 'lucide-react'
import { MultiStep, type Step } from '../multistep'
import { Button } from '../Button'
import { Input } from '../Input'
import { groupsApi, type Group } from '../../api/groups'
import { cn } from '../../utils/cn'

interface CreateGroupData {
    name: string
    description: string
    picture: string | null
}

interface CreateGroupMultiStepProps {
    onComplete: (group: Group) => void
    onCancel: () => void
}

export const CreateGroupMultiStep = ({
    onComplete,
    onCancel,
}: CreateGroupMultiStepProps) => {
    const [isLoading, setIsLoading] = useState(false)
    const [createdGroup, setCreatedGroup] = useState<Group | null>(null)
    const [error, setError] = useState('')

    // Form Data
    const [formData, setFormData] = useState<CreateGroupData>({
        name: '',
        description: '',
        picture: null,
    })

    const updateFormData = useCallback(
        <K extends keyof CreateGroupData>(
            key: K,
            value: CreateGroupData[K]
        ) => {
            setFormData((prev) => ({ ...prev, [key]: value }))
        },
        []
    )

    // Create group on step 1 completion (so we have invite code for step 2)
    const handleCreateGroup = async () => {
        if (createdGroup) return // Already created

        setIsLoading(true)
        setError('')

        try {
            const group = await groupsApi.createGroup({
                name: formData.name.trim(),
                picture: formData.picture || undefined,
            })
            setCreatedGroup(group)
        } catch {
            setError('Gruppe konnte nicht erstellt werden')
            throw new Error('Creation failed')
        } finally {
            setIsLoading(false)
        }
    }

    const handleComplete = async () => {
        // If group not yet created, create it now
        if (!createdGroup) {
            await handleCreateGroup()
        }
        if (createdGroup) {
            onComplete(createdGroup)
        }
    }

    // Steps Definition
    const steps: Step[] = [
        {
            id: 'details',
            title: 'Gruppendetails',
            description: 'Gib deiner Gruppe einen Namen und ein Bild',
            content: (
                <StepGroupDetails
                    formData={formData}
                    updateFormData={updateFormData}
                    error={error}
                />
            ),
            isValid: formData.name.trim().length >= 2,
        },
        {
            id: 'invite',
            title: 'Mitglieder einladen',
            description: 'Teile den Einladungscode mit deinen Freunden',
            content: (
                <StepInviteMembers
                    inviteCode={createdGroup?.inviteCode}
                    onCreateGroup={handleCreateGroup}
                    isCreating={isLoading}
                />
            ),
            isValid: true,
        },
    ]

    return (
        <MultiStep
            steps={steps}
            onComplete={handleComplete}
            onCancel={onCancel}
            isLoading={isLoading}
            completeText="Fertig"
        />
    )
}

// ============================================================================
// Step 1: Group Details
// ============================================================================

interface StepGroupDetailsProps {
    formData: CreateGroupData
    updateFormData: <K extends keyof CreateGroupData>(
        key: K,
        value: CreateGroupData[K]
    ) => void
    error: string
}

const StepGroupDetails = ({
    formData,
    updateFormData,
    error,
}: StepGroupDetailsProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleImageClick = () => {
        fileInputRef.current?.click()
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                updateFormData('picture', reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    return (
        <div className="space-y-6">
            {/* Image Upload */}
            <div className="flex justify-center">
                <button
                    type="button"
                    onClick={handleImageClick}
                    className={cn(
                        'group relative flex size-28 items-center justify-center',
                        'rounded-2xl border-2 border-dashed',
                        'border-neutral-300 dark:border-neutral-600',
                        'bg-neutral-50 dark:bg-neutral-800/50',
                        'transition-all duration-200',
                        'hover:border-brand-400 hover:bg-brand-50 dark:hover:border-brand-500 dark:hover:bg-brand-900/20',
                        'overflow-hidden'
                    )}
                >
                    {formData.picture ? (
                        <>
                            <img
                                src={formData.picture}
                                alt="Gruppenbild"
                                className="size-full object-cover"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                                <Camera className="size-6 text-white" />
                            </div>
                        </>
                    ) : (
                        <div className="group-hover:text-brand-500 flex flex-col items-center gap-1 text-neutral-400">
                            <Camera className="size-8" />
                            <span className="text-xs font-medium">Bild</span>
                        </div>
                    )}
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                />
            </div>

            {/* Group Name */}
            <Input
                label="Gruppenname"
                placeholder="z.B. Unsere WG"
                value={formData.name}
                onChange={(e) => updateFormData('name', e.target.value)}
                error={error}
                autoFocus
            />

            {/* Description (optional) */}
            <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Beschreibung{' '}
                    <span className="text-neutral-400">(optional)</span>
                </label>
                <textarea
                    placeholder="Eine kurze Beschreibung deiner Gruppe..."
                    value={formData.description}
                    onChange={(e) =>
                        updateFormData('description', e.target.value)
                    }
                    rows={3}
                    className={cn(
                        'w-full rounded-xl border px-4 py-3 text-sm',
                        'border-neutral-200 dark:border-neutral-700',
                        'bg-white dark:bg-neutral-800',
                        'text-neutral-900 dark:text-white',
                        'placeholder:text-neutral-400',
                        'focus:border-brand-500 focus:ring-brand-500/20 focus:ring-2 focus:outline-none',
                        'resize-none transition-all'
                    )}
                />
            </div>
        </div>
    )
}

// ============================================================================
// Step 2: Invite Members
// ============================================================================

interface StepInviteMembersProps {
    inviteCode: string | undefined
    onCreateGroup: () => Promise<void>
    isCreating: boolean
}

const StepInviteMembers = ({
    inviteCode,
    onCreateGroup,
    isCreating,
}: StepInviteMembersProps) => {
    const [copied, setCopied] = useState(false)
    const [hasGeneratedCode, setHasGeneratedCode] = useState(false)

    const handleGenerateCode = async () => {
        await onCreateGroup()
        setHasGeneratedCode(true)
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
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-700 dark:bg-neutral-800/50">
                {inviteCode ? (
                    <>
                        <p className="mb-3 text-sm text-neutral-600 dark:text-neutral-400">
                            Teile diesen Code mit deinen Freunden:
                        </p>
                        <div className="flex items-center gap-3">
                            <code className="flex-1 rounded-lg bg-white px-4 py-3 font-mono text-lg font-bold tracking-wider text-neutral-900 dark:bg-neutral-900 dark:text-white">
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
            <div className="rounded-xl border border-dashed border-neutral-300 p-6 dark:border-neutral-600">
                <div className="text-center text-neutral-500 dark:text-neutral-400">
                    <UserPlus className="mx-auto mb-2 size-8 opacity-50" />
                    <p className="text-sm">Freundesliste kommt bald...</p>
                    <p className="text-xs text-neutral-400">
                        Hier kannst du später direkt Freunde einladen
                    </p>
                </div>
            </div>
        </div>
    )
}
