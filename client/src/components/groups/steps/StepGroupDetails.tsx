import { useRef } from 'react'
import { Camera } from 'lucide-react'
import { Input } from '../../common'
import { cn } from '../../../utils/cn'

export interface CreateGroupData {
    name: string
    description: string
    picture: string
}

interface StepGroupDetailsProps {
    formData: CreateGroupData
    updateFormData: <K extends keyof CreateGroupData>(
        key: K,
        value: CreateGroupData[K]
    ) => void
    error: string
}

export const StepGroupDetails = ({
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
                        'transition-all duration-300 ease-out',
                        'hover:border-brand-400 hover:bg-brand-50 dark:hover:border-brand-500 dark:hover:bg-brand-900/20',
                        'hover:shadow-brand-500/10 hover:scale-105 hover:shadow-lg',
                        'active:scale-100',
                        'overflow-hidden'
                    )}
                >
                    {formData.picture ? (
                        <>
                            <img
                                src={formData.picture}
                                alt="Gruppenbild"
                                className="size-full object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-all duration-300 group-hover:opacity-100">
                                <Camera className="size-6 text-white transition-transform duration-300 group-hover:scale-110" />
                            </div>
                        </>
                    ) : (
                        <div className="group-hover:text-brand-500 flex flex-col items-center gap-1 text-neutral-400 transition-all duration-300 group-hover:scale-110">
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
                        'hover:border-neutral-300 dark:hover:border-neutral-600',
                        'focus:border-brand-500 focus:ring-brand-500/20 focus:ring-2 focus:outline-none',
                        'resize-none transition-all duration-200'
                    )}
                />
            </div>
        </div>
    )
}
