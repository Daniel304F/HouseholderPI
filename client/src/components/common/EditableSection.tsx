import { useState, type ReactNode } from 'react'
import { Pencil, X } from 'lucide-react'
import { cn } from '../../utils/cn'

interface EditableSectionProps {
    title: string
    icon?: ReactNode
    children: ReactNode
    editContent?: ReactNode
    onEditToggle?: (isEditing: boolean) => void
    className?: string
    disabled?: boolean
    badge?: ReactNode
    /** Always show edit content without toggle */
    alwaysEdit?: boolean
}

export const EditableSection = ({
    title,
    icon,
    children,
    editContent,
    onEditToggle,
    className,
    disabled = false,
    badge,
    alwaysEdit = false,
}: EditableSectionProps) => {
    const [isEditing, setIsEditing] = useState(false)

    const handleToggleEdit = () => {
        if (disabled) return
        const newState = !isEditing
        setIsEditing(newState)
        onEditToggle?.(newState)
    }

    const showEditMode = alwaysEdit || isEditing

    return (
        <div className={cn('space-y-3', className)}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {icon && (
                        <span className="text-neutral-500 dark:text-neutral-400">
                            {icon}
                        </span>
                    )}
                    <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                        {title}
                    </h3>
                    {badge}
                </div>
                {editContent && !disabled && !alwaysEdit && (
                    <button
                        type="button"
                        onClick={handleToggleEdit}
                        className={cn(
                            'rounded-lg p-1.5 transition-colors',
                            isEditing
                                ? 'bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400'
                                : 'text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-300'
                        )}
                        title={isEditing ? 'Bearbeitung beenden' : 'Bearbeiten'}
                    >
                        {isEditing ? <X className="size-4" /> : <Pencil className="size-4" />}
                    </button>
                )}
            </div>

            {/* Content */}
            {showEditMode && editContent ? editContent : children}
        </div>
    )
}
