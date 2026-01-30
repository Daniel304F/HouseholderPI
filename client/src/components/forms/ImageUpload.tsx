import { useCallback } from 'react'
import { ImagePlus, X } from 'lucide-react'
import { cn } from '../../utils/cn'

interface ImageUploadProps {
    image: string | null
    onImageChange: (image: string | null) => void
    maxSizeMB?: number
    label?: string
    className?: string
}

export const ImageUpload = ({
    image,
    onImageChange,
    maxSizeMB = 5,
    label = 'Bild (optional)',
    className,
}: ImageUploadProps) => {
    const handleImageChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0]
            if (!file) return

            if (file.size > maxSizeMB * 1024 * 1024) {
                alert(`Bild darf maximal ${maxSizeMB}MB groß sein`)
                return
            }

            const reader = new FileReader()
            reader.onloadend = () => {
                onImageChange(reader.result as string)
            }
            reader.readAsDataURL(file)
        },
        [maxSizeMB, onImageChange]
    )

    const removeImage = useCallback(() => {
        onImageChange(null)
    }, [onImageChange])

    return (
        <div className={className}>
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                <ImagePlus className="size-4" />
                {label}
            </label>
            {image ? (
                <ImagePreview image={image} onRemove={removeImage} />
            ) : (
                <UploadArea onChange={handleImageChange} />
            )}
        </div>
    )
}

const ImagePreview = ({
    image,
    onRemove,
}: {
    image: string
    onRemove: () => void
}) => (
    <div className="relative inline-block">
        <img
            src={image}
            alt="Vorschau"
            className="h-32 w-auto rounded-lg object-cover"
        />
        <button
            type="button"
            onClick={onRemove}
            className={cn(
                'absolute -right-2 -top-2 rounded-full p-1',
                'bg-red-500 text-white',
                'hover:bg-red-600 transition-colors'
            )}
        >
            <X className="size-4" />
        </button>
    </div>
)

const UploadArea = ({
    onChange,
}: {
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}) => (
    <label
        className={cn(
            'flex cursor-pointer items-center justify-center gap-2',
            'h-24 rounded-xl border-2 border-dashed',
            'border-neutral-300 dark:border-neutral-600',
            'hover:border-brand-500 hover:bg-brand-50/50',
            'dark:hover:bg-brand-900/10',
            'transition-colors'
        )}
    >
        <ImagePlus className="size-6 text-neutral-400" />
        <span className="text-sm text-neutral-500">Bild hochladen</span>
        <input
            type="file"
            accept="image/*"
            onChange={onChange}
            className="hidden"
        />
    </label>
)
