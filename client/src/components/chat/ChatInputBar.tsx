import { useRef, type KeyboardEvent } from 'react'
import { ImagePlus, Loader2, Send, X } from 'lucide-react'
import { Button, Textarea } from '../common'

interface ChatInputBarProps {
    value: string
    isConnected: boolean
    isSending: boolean
    selectedImageName?: string
    onChange: (value: string) => void
    onKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void
    onSend: () => void
    onPickImage: (file: File) => void
    onClearImage: () => void
}

export const ChatInputBar = ({
    value,
    isConnected,
    isSending,
    selectedImageName,
    onChange,
    onKeyDown,
    onSend,
    onPickImage,
    onClearImage,
}: ChatInputBarProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null)

    const canSend = value.trim().length > 0 || Boolean(selectedImageName)

    return (
        <div className="border-t border-neutral-200 p-4 dark:border-neutral-700">
            {selectedImageName && (
                <div className="mb-2 flex items-center justify-between rounded-lg bg-neutral-100 px-3 py-2 text-sm text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                    <span className="truncate">Bild: {selectedImageName}</span>
                    <button
                        type="button"
                        onClick={onClearImage}
                        className="ml-2 rounded p-1 transition-colors hover:bg-neutral-200 dark:hover:bg-neutral-700"
                        aria-label="Bild entfernen"
                    >
                        <X className="size-4" />
                    </button>
                </div>
            )}

            <div className="flex items-end gap-2">
                <Textarea
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    onKeyDown={onKeyDown}
                    placeholder="Nachricht schreiben..."
                    className="min-h-[48px] flex-1 resize-none"
                    rows={2}
                    disabled={!isConnected}
                />

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => {
                        const file = event.target.files?.[0]
                        if (!file) return
                        onPickImage(file)
                        event.currentTarget.value = ''
                    }}
                />

                <Button
                    variant="secondary"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={!isConnected || isSending}
                    aria-label="Bild anhaengen"
                    className="h-[48px] shrink-0"
                >
                    <ImagePlus className="size-4" />
                </Button>

                <Button
                    onClick={onSend}
                    disabled={!canSend || isSending}
                    aria-label="Nachricht senden"
                    className="h-[48px] shrink-0"
                >
                    {isSending ? (
                        <Loader2 className="size-4 animate-spin" />
                    ) : (
                        <Send className="size-4" />
                    )}
                </Button>
            </div>
        </div>
    )
}
