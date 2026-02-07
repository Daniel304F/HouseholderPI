import { FileText, ImageIcon, Loader2, Upload, X } from 'lucide-react'
import { useRef } from 'react'
import { cn } from '../../../utils/cn'
import type { TaskAttachment } from '../../../api/tasks'

interface RecurringTemplateAttachmentsProps {
    attachments: TaskAttachment[]
    isUploading: boolean
    isDeleting: boolean
    onUploadFile: (file: File) => void
    onDeleteAttachment: (attachmentId: string) => void
}

const isImageFile = (mimeType: string) => mimeType.startsWith('image/')

export const RecurringTemplateAttachments = ({
    attachments,
    isUploading,
    isDeleting,
    onUploadFile,
    onDeleteAttachment,
}: RecurringTemplateAttachmentsProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) onUploadFile(file)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    return (
        <div className="mt-3 border-t border-neutral-100 pt-3 dark:border-neutral-700">
            <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                    Anhaenge ({attachments.length})
                </span>

                <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                />
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className={cn(
                        'flex items-center gap-1 rounded px-2 py-1 text-xs transition-colors',
                        'bg-brand-50 text-brand-600 hover:bg-brand-100',
                        'dark:bg-brand-900/30 dark:text-brand-400 dark:hover:bg-brand-900/50',
                        'disabled:opacity-50'
                    )}
                >
                    {isUploading ? (
                        <Loader2 className="size-3 animate-spin" />
                    ) : (
                        <Upload className="size-3" />
                    )}
                    Hochladen
                </button>
            </div>

            {attachments.length === 0 ? (
                <p className="text-xs text-neutral-400 dark:text-neutral-500">
                    Keine Anhaenge. Anhaenge werden zu erstellten Aufgaben kopiert.
                </p>
            ) : (
                <div className="space-y-1">
                    {attachments.map((attachment) => (
                        <div
                            key={attachment.id}
                            className={cn(
                                'flex items-center gap-2 rounded-lg px-2 py-1.5',
                                'bg-neutral-50 dark:bg-neutral-800/50'
                            )}
                        >
                            {isImageFile(attachment.mimeType) ? (
                                <ImageIcon className="size-4 shrink-0 text-brand-500" />
                            ) : (
                                <FileText className="size-4 shrink-0 text-neutral-400" />
                            )}
                            <span className="min-w-0 flex-1 truncate text-xs text-neutral-700 dark:text-neutral-300">
                                {attachment.originalName}
                            </span>
                            <button
                                type="button"
                                onClick={() => onDeleteAttachment(attachment.id)}
                                disabled={isDeleting}
                                className={cn(
                                    'rounded p-0.5 text-neutral-400 transition-colors hover:text-error-500',
                                    'hover:bg-error-100 dark:hover:bg-error-900/30'
                                )}
                                title="Anhang loeschen"
                            >
                                <X className="size-3" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
