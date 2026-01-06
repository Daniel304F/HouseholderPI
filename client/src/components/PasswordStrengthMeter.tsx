interface PasswordStrengthMeterProps {
    strength: number
}

export const PasswordStrengthMeter = ({
    strength,
}: PasswordStrengthMeterProps) => {
    const getStrengthColor = (s: number) => {
        if (s === 0) return 'bg-neutral-300 dark:bg-neutral-600'
        if (s <= 2) return 'bg-error-500'
        if (s <= 3) return 'bg-warning-500'
        if (s <= 4) return 'bg-info-500'
        return 'bg-success-500'
    }

    const getStrengthLabel = (s: number) => {
        if (s === 0) return ''
        if (s <= 2) return 'Schwach'
        if (s <= 3) return 'Mittel'
        if (s <= 4) return 'Gut'
        return 'Stark'
    }

    const getStrengthLabelColor = (s: number) => {
        if (s === 0) return 'text-neutral-500'
        if (s <= 2) return 'text-error-500'
        if (s <= 3) return 'text-warning-600 dark:text-warning-400'
        if (s <= 4) return 'text-info-600 dark:text-info-400'
        return 'text-success-600 dark:text-success-400'
    }

    if (strength === 0) return null

    return (
        <div className="space-y-2 pt-1">
            <div className="flex items-center gap-2">
                <div className="flex flex-1 gap-1">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <div
                            key={index}
                            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                                index < strength
                                    ? getStrengthColor(strength)
                                    : 'bg-neutral-200 dark:bg-neutral-700'
                            }`}
                        />
                    ))}
                </div>
                <span
                    className={`text-xs font-medium ${getStrengthLabelColor(strength)}`}
                >
                    {getStrengthLabel(strength)}
                </span>
            </div>
        </div>
    )
}
