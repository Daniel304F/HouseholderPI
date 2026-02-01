import { useState, useRef, useEffect } from 'react'
import { Pencil, Check, X, Loader2 } from 'lucide-react'
import { cn } from '../../utils/cn'

interface EditableTextProps {
    value: string
    onSave: (value: string) => Promise<void>
    placeholder?: string
    multiline?: boolean
    className?: string
    textClassName?: string
    label?: string
    emptyText?: string
    maxLength?: number
    disabled?: boolean
}

export const EditableText = ({
    value,
    onSave,
    placeholder = 'Text eingeben...',
    multiline = false,
    className,
    textClassName,
    label,
    emptyText = 'Nicht angegeben',
    maxLength,
    disabled = false,
}: EditableTextProps) => {
    const [isEditing, setIsEditing] = useState(false)
    const [editValue, setEditValue] = useState(value)
    const [isSaving, setIsSaving] = useState(false)
    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)

    useEffect(() => {
        setEditValue(value)
    }, [value])

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus()
            // Move cursor to end
            if (inputRef.current instanceof HTMLTextAreaElement) {
                inputRef.current.selectionStart = inputRef.current.value.length
            }
        }
    }, [isEditing])

    const handleSave = async () => {
        if (editValue === value) {
            setIsEditing(false)
            return
        }

        setIsSaving(true)
        try {
            await onSave(editValue.trim())
            setIsEditing(false)
        } catch {
            // Reset on error
            setEditValue(value)
        } finally {
            setIsSaving(false)
        }
    }

    const handleCancel = () => {
        setEditValue(value)
        setIsEditing(false)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            handleCancel()
        } else if (e.key === 'Enter' && !multiline) {
            e.preventDefault()
            handleSave()
        } else if (e.key === 'Enter' && e.ctrlKey && multiline) {
            e.preventDefault()
            handleSave()
        }
    }

    if (isEditing) {
        const InputComponent = multiline ? 'textarea' : 'input'
        return (
            <div className={cn('space-y-2', className)}>
                {label && (
                    <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                        {label}
                    </label>
                )}
                <div className="flex gap-2">
                    <InputComponent
                        ref={inputRef as React.RefObject<HTMLInputElement & HTMLTextAreaElement>}
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        maxLength={maxLength}
                        disabled={isSaving}
                        className={cn(
                            'flex-1 rounded-lg border px-3 py-2 text-sm',
                            'border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800',
                            'focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500',
                            'text-neutral-900 placeholder:text-neutral-400 dark:text-white',
                            'disabled:opacity-50',
                            multiline && 'min-h-[80px] resize-y'
                        )}
                    />
                    <div className="flex flex-col gap-1">
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={isSaving}
                            className={cn(
                                'rounded-lg p-2 transition-colors',
                                'bg-brand-500 text-white hover:bg-brand-600',
                                'disabled:opacity-50'
                            )}
                            title="Speichern (Enter)"
                        >
                            {isSaving ? (
                                <Loader2 className="size-4 animate-spin" />
                            ) : (
                                <Check className="size-4" />
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={handleCancel}
                            disabled={isSaving}
                            className={cn(
                                'rounded-lg p-2 transition-colors',
                                'bg-neutral-200 text-neutral-600 hover:bg-neutral-300',
                                'dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600',
                                'disabled:opacity-50'
                            )}
                            title="Abbrechen (Escape)"
                        >
                            <X className="size-4" />
                        </button>
                    </div>
                </div>
                {multiline && (
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        Strg+Enter zum Speichern
                    </p>
                )}
            </div>
        )
    }

    return (
        <div className={cn('group', className)}>
            {label && (
                <label className="mb-2 block text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                    {label}
                </label>
            )}
            <div
                className={cn(
                    'flex items-start gap-2 rounded-lg p-2 -m-2 transition-colors',
                    !disabled && 'cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                )}
                onClick={() => !disabled && setIsEditing(true)}
            >
                <p
                    className={cn(
                        'flex-1 text-sm',
                        value
                            ? 'text-neutral-700 dark:text-neutral-300'
                            : 'italic text-neutral-400 dark:text-neutral-500',
                        textClassName
                    )}
                >
                    {value || emptyText}
                </p>
                {!disabled && (
                    <Pencil className="size-4 text-neutral-400 opacity-0 transition-opacity group-hover:opacity-100" />
                )}
            </div>
        </div>
    )
}
