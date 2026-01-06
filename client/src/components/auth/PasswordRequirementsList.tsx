import { Check, X } from 'lucide-react'
import { PASSWORD_REQUIREMENTS } from '../../utils/passwordUtils'

interface PasswordRequirementsListProps {
    password: string
}

export const PasswordRequirementsList = ({
    password,
}: PasswordRequirementsListProps) => {
    const requirementsMet = PASSWORD_REQUIREMENTS.map((req) => ({
        ...req,
        met: req.validator(password),
    }))

    return (
        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-700 dark:bg-neutral-800/50">
            <p className="mb-2 text-xs font-medium text-neutral-600 dark:text-neutral-400">
                Passwort-Anforderungen:
            </p>
            <ul className="space-y-1">
                {requirementsMet.map((req) => (
                    <li
                        key={req.id}
                        className={`flex items-center gap-2 text-xs transition-colors duration-200 ${
                            req.met
                                ? 'text-success-600 dark:text-success-400'
                                : 'text-neutral-500 dark:text-neutral-400'
                        }`}
                    >
                        {req.met ? (
                            <Check size={14} className="flex-shrink-0" />
                        ) : (
                            <X size={14} className="flex-shrink-0" />
                        )}
                        <span>{req.label}</span>
                    </li>
                ))}
            </ul>
        </div>
    )
}
