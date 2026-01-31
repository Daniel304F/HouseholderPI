import { useState, useCallback } from 'react'
import { MultiStep, type Step } from '../multistep'
import { groupsApi, type Group } from '../../api/groups'
import { useToast } from '../../contexts/ToastContext'
import {
    StepGroupDetails,
    StepInviteMembers,
    type CreateGroupData,
} from './steps'

interface CreateGroupMultiStepProps {
    onComplete: (group: Group) => void
    onCancel: () => void
}

export const CreateGroupMultiStep = ({
    onComplete,
    onCancel,
}: CreateGroupMultiStepProps) => {
    const toast = useToast()
    const [isLoading, setIsLoading] = useState(false)
    const [createdGroup, setCreatedGroup] = useState<Group | null>(null)
    const [error, setError] = useState('')

    // Form Data
    const [formData, setFormData] = useState<CreateGroupData>({
        name: '',
        description: '',
        picture: '',
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

    const handleCreateGroup = async () => {
        if (createdGroup) return

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
            toast.error('Gruppe konnte nicht erstellt werden')
            throw new Error('Creation failed')
        } finally {
            setIsLoading(false)
        }
    }

    const handleComplete = async () => {
        if (!createdGroup) {
            await handleCreateGroup()
        }
        if (createdGroup) {
            onComplete(createdGroup)
        }
    }

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
