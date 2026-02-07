import type { KeyboardEvent } from 'react'
import { Loader2, Send } from 'lucide-react'
import { Button, Input } from '../common'

interface ChatInputBarProps {
    value: string
    isConnected: boolean
    isSending: boolean
    onChange: (value: string) => void
    onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void
    onSend: () => void
}

export const ChatInputBar = ({
    value,
    isConnected,
    isSending,
    onChange,
    onKeyDown,
    onSend,
}: ChatInputBarProps) => {
    return (
        <div className="border-t border-neutral-200 p-4 dark:border-neutral-700">
            <div className="flex gap-2">
                <Input
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    onKeyDown={onKeyDown}
                    placeholder="Nachricht schreiben..."
                    className="flex-1"
                    disabled={!isConnected}
                />
                <Button
                    onClick={onSend}
                    disabled={!value.trim() || isSending}
                    aria-label="Nachricht senden"
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
