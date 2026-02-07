interface ChatTypingIndicatorProps {
    isVisible: boolean
}

export const ChatTypingIndicator = ({ isVisible }: ChatTypingIndicatorProps) => {
    if (!isVisible) return null

    return (
        <div className="px-4 py-2 text-sm text-neutral-500 dark:text-neutral-400">
            <span className="italic">Jemand schreibt...</span>
        </div>
    )
}
