interface ChatTypingIndicatorProps {
    typingCount: number
}

export const ChatTypingIndicator = ({ typingCount }: ChatTypingIndicatorProps) => {
    if (typingCount <= 0) return null

    const label =
        typingCount === 1
            ? 'Jemand schreibt...'
            : `${typingCount} Personen schreiben...`

    return (
        <div className="px-4 py-2 text-sm text-neutral-500 dark:text-neutral-400">
            <span className="italic">{label}</span>
        </div>
    )
}
