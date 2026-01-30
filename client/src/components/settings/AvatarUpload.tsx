import { useCallback, useRef } from 'react'
import { Camera, X, Loader2 } from 'lucide-react'
import { cn } from '../../utils/cn'

interface AvatarUploadProps {
    currentAvatar?: string
    userName: string
    onAvatarChange: (avatar: string | null) => void
    isLoading?: boolean
    size?: 'md' | 'lg' | 'xl'
}

const sizeStyles = {
    md: 'size-20',
    lg: 'size-28',
    xl: 'size-36',
}

const textSizes = {
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl',
}

export const AvatarUpload = ({
    currentAvatar,
    userName,
    onAvatarChange,
    isLoading = false,
    size = 'xl',
}: AvatarUploadProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null)

    const initials = userName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)

    const handleFileChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0]
            if (!file) return

            // Max 5MB
            if (file.size > 5 * 1024 * 1024) {
                alert('Bild darf maximal 5MB groß sein')
                return
            }

            const reader = new FileReader()
            reader.onloadend = () => {
                onAvatarChange(reader.result as string)
            }
            reader.readAsDataURL(file)
        },
        [onAvatarChange]
    )

    const handleRemove = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation()
            onAvatarChange(null)
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        },
        [onAvatarChange]
    )

    const handleClick = () => {
        fileInputRef.current?.click()
    }

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="relative">
                <button
                    type="button"
                    onClick={handleClick}
                    disabled={isLoading}
                    className={cn(
                        'relative rounded-full overflow-hidden',
                        'ring-4 ring-neutral-100 dark:ring-neutral-800',
                        'transition-all duration-200',
                        'hover:ring-brand-200 dark:hover:ring-brand-800',
                        'focus:outline-none focus:ring-brand-300 dark:focus:ring-brand-700',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                        sizeStyles[size]
                    )}
                >
                    {currentAvatar ? (
                        <img
                            src={currentAvatar}
                            alt={userName}
                            className="size-full object-cover"
                        />
                    ) : (
                        <div
                            className={cn(
                                'size-full flex items-center justify-center',
                                'bg-brand-100 dark:bg-brand-900/30',
                                'text-brand-600 dark:text-brand-400 font-semibold',
                                textSizes[size]
                            )}
                        >
                            {initials}
                        </div>
                    )}

                    {/* Overlay on hover */}
                    <div
                        className={cn(
                            'absolute inset-0 flex items-center justify-center',
                            'bg-black/50 opacity-0 hover:opacity-100',
                            'transition-opacity duration-200'
                        )}
                    >
                        {isLoading ? (
                            <Loader2 className="size-8 text-white animate-spin" />
                        ) : (
                            <Camera className="size-8 text-white" />
                        )}
                    </div>
                </button>

                {/* Remove button */}
                {currentAvatar && !isLoading && (
                    <button
                        type="button"
                        onClick={handleRemove}
                        className={cn(
                            'absolute -right-1 -top-1 rounded-full p-1.5',
                            'bg-error-500 text-white shadow-md',
                            'hover:bg-error-600 transition-colors',
                            'focus:outline-none focus:ring-2 focus:ring-error-400'
                        )}
                    >
                        <X className="size-4" />
                    </button>
                )}
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
            />

            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Klicken zum Ändern
            </p>
        </div>
    )
}
