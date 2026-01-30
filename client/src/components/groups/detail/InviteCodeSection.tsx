import { useState } from 'react'
import { Copy, Check, RefreshCw } from 'lucide-react'
import { Button } from '../../common'
import { cn } from '../../../utils/cn'

interface InviteCodeSectionProps {
    inviteCode: string
    onRegenerate: () => Promise<void>
    isRegenerating: boolean
}

export const InviteCodeSection = ({
    inviteCode,
    onRegenerate,
    isRegenerating,
}: InviteCodeSectionProps) => {
    const [copied, setCopied] = useState(false)

    const handleCopy = async () => {
        await navigator.clipboard.writeText(inviteCode)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div
            className={cn(
                'mb-6 rounded-xl p-4',
                'bg-neutral-50 dark:bg-neutral-700/50'
            )}
        >
            <p className="mb-2 text-sm font-medium text-neutral-600 dark:text-neutral-300">
                Invite-Code
            </p>
            <div className="flex items-center gap-2">
                <code
                    className={cn(
                        'flex-1 rounded-lg px-4 py-2 font-mono text-lg tracking-widest',
                        'bg-white dark:bg-neutral-800'
                    )}
                >
                    {inviteCode}
                </code>
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleCopy}
                    icon={
                        copied ? (
                            <Check className="size-4" />
                        ) : (
                            <Copy className="size-4" />
                        )
                    }
                >
                    {copied ? 'Kopiert!' : 'Kopieren'}
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onRegenerate}
                    isLoading={isRegenerating}
                    icon={<RefreshCw className="size-4" />}
                />
            </div>
        </div>
    )
}
