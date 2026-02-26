import { useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
    Paperclip,
    Upload,
    Camera as CameraIcon,
    Trash2,
    Loader2,
    FileText,
    Image as ImageIcon,
    File,
    Download,
} from 'lucide-react'
import { cn } from '../../utils/cn'
import { Button, IconButton } from '../common'
import { tasksApi, type TaskAttachment } from '../../api/tasks'
import { useToast } from '../../contexts/ToastContext'
import { getUploadUrl } from '../../lib/axios'
import {
    capturePhotoWithCapacitor,
    isNativeCapacitorPlatform,
} from '../../utils/camera.utils'

interface TaskAttachmentsProps {
    groupId: string
    taskId: string
    attachments: TaskAttachment[]
    readOnly?: boolean
}

const isImageMimeType = (mimeType: string) => mimeType.startsWith('image/')

const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const getFileIcon = (mimeType: string) => {
    if (isImageMimeType(mimeType)) return ImageIcon
    if (mimeType.includes('pdf') || mimeType.includes('document')) return FileText
    return File
}

export const TaskAttachments = ({
    groupId,
    taskId,
    attachments,
    readOnly = false,
}: TaskAttachmentsProps) => {
    const queryClient = useQueryClient()
    const toast = useToast()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const cameraInputRef = useRef<HTMLInputElement>(null)
    const [isCapturing, setIsCapturing] = useState(false)

    const uploadMutation = useMutation({
        mutationFn: (file: File) => tasksApi.uploadAttachment(groupId, taskId, file),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['taskDetails', groupId, taskId],
            })
            queryClient.invalidateQueries({
                queryKey: ['tasks', groupId],
            })
            toast.success('Anhang hochgeladen')
        },
        onError: () => {
            toast.error('Anhang konnte nicht hochgeladen werden')
        },
    })

    const deleteMutation = useMutation({
        mutationFn: (attachmentId: string) =>
            tasksApi.deleteAttachment(groupId, taskId, attachmentId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['taskDetails', groupId, taskId],
            })
            queryClient.invalidateQueries({
                queryKey: ['tasks', groupId],
            })
            toast.success('Anhang geloescht')
        },
        onError: () => {
            toast.error('Anhang konnte nicht geloescht werden')
        },
    })

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        uploadMutation.mutate(file)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const handleUploadClick = () => {
        fileInputRef.current?.click()
    }

    const handleCameraFallbackSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        uploadMutation.mutate(file)
        if (cameraInputRef.current) {
            cameraInputRef.current.value = ''
        }
    }

    const handleCapturePhoto = async () => {
        if (uploadMutation.isPending || isCapturing) return

        if (!isNativeCapacitorPlatform()) {
            cameraInputRef.current?.click()
            return
        }

        setIsCapturing(true)
        try {
            const capturedFile = await capturePhotoWithCapacitor()
            if (!capturedFile) {
                toast.error('Foto konnte nicht aufgenommen werden')
                return
            }
            uploadMutation.mutate(capturedFile)
        } catch {
            toast.error('Kamera konnte nicht geoeffnet werden')
        } finally {
            setIsCapturing(false)
        }
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        })
    }

    return (
        <div>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                <Paperclip className="size-4" />
                Anhaenge
                {attachments.length > 0 && (
                    <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400">
                        {attachments.length}
                    </span>
                )}
            </h3>

            <div className="mb-4 space-y-2">
                {attachments.length === 0 ? (
                    <p className="py-4 text-center text-sm text-neutral-500 dark:text-neutral-400">
                        Keine Anhaenge vorhanden
                    </p>
                ) : (
                    attachments.map((attachment) => (
                        <AttachmentItem
                            key={attachment.id}
                            attachment={attachment}
                            onDelete={() => deleteMutation.mutate(attachment.id)}
                            isDeleting={deleteMutation.isPending}
                            formatDate={formatDate}
                            readOnly={readOnly}
                        />
                    ))
                )}
            </div>

            {!readOnly && (
                <>
                    <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleFileSelect}
                        className="hidden"
                        accept="image/*,.pdf,.doc,.docx,.txt"
                    />
                    <input
                        ref={cameraInputRef}
                        type="file"
                        onChange={handleCameraFallbackSelect}
                        className="hidden"
                        accept="image/*"
                        capture="environment"
                    />

                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={handleUploadClick}
                            disabled={uploadMutation.isPending || isCapturing}
                            icon={
                                uploadMutation.isPending ? (
                                    <Loader2 className="size-4 animate-spin" />
                                ) : (
                                    <Upload className="size-4" />
                                )
                            }
                        >
                            Anhang hinzufuegen
                        </Button>

                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={handleCapturePhoto}
                            disabled={uploadMutation.isPending || isCapturing}
                            icon={
                                isCapturing ? (
                                    <Loader2 className="size-4 animate-spin" />
                                ) : (
                                    <CameraIcon className="size-4" />
                                )
                            }
                        >
                            Foto aufnehmen
                        </Button>
                    </div>
                </>
            )}
        </div>
    )
}

interface AttachmentItemProps {
    attachment: TaskAttachment
    onDelete: () => void
    isDeleting: boolean
    formatDate: (date: string) => string
    readOnly?: boolean
}

const AttachmentItem = ({
    attachment,
    onDelete,
    isDeleting,
    formatDate,
    readOnly = false,
}: AttachmentItemProps) => {
    const FileIcon = getFileIcon(attachment.mimeType)
    const isImage = isImageMimeType(attachment.mimeType)
    const fullUrl = getUploadUrl(attachment.url)

    return (
        <div
            className={cn(
                'group flex items-center gap-3 rounded-lg border p-3',
                'border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800/50',
                'hover:border-neutral-300 dark:hover:border-neutral-600 transition-colors'
            )}
        >
            {isImage ? (
                <a
                    href={fullUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0"
                >
                    <img
                        src={fullUrl}
                        alt={attachment.originalName}
                        className="size-12 rounded-md object-cover transition-opacity hover:opacity-80"
                    />
                </a>
            ) : (
                <div className="flex size-12 shrink-0 items-center justify-center rounded-md bg-neutral-200 dark:bg-neutral-700">
                    <FileIcon className="size-6 text-neutral-500 dark:text-neutral-400" />
                </div>
            )}

            <div className="min-w-0 flex-1">
                <a
                    href={fullUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block truncate text-sm font-medium text-neutral-900 hover:text-brand-600 dark:text-white dark:hover:text-brand-400"
                    title={attachment.originalName}
                >
                    {attachment.originalName}
                </a>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {formatFileSize(attachment.size)} - {formatDate(attachment.uploadedAt)}
                </p>
            </div>

            <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <a
                    href={fullUrl}
                    download={attachment.originalName}
                    className={cn(
                        'rounded p-1.5 transition-colors',
                        'hover:bg-neutral-200 dark:hover:bg-neutral-700'
                    )}
                    title="Herunterladen"
                >
                    <Download className="size-4 text-neutral-500 dark:text-neutral-400" />
                </a>
                {!readOnly && (
                    <IconButton
                        icon={
                            isDeleting ? (
                                <Loader2 className="size-4 animate-spin" />
                            ) : (
                                <Trash2 className="size-4" />
                            )
                        }
                        variant="ghost"
                        size="sm"
                        onClick={onDelete}
                        disabled={isDeleting}
                        aria-label="Loeschen"
                    />
                )}
            </div>
        </div>
    )
}
