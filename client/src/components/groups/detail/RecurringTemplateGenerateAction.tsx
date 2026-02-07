import { Loader2, Plus } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../../common'

interface RecurringTemplateGenerateActionProps {
    isActive: boolean
    isGenerating: boolean
    nextAssigneeName: string
    onGenerate: () => void
}

export const RecurringTemplateGenerateAction = ({
    isActive,
    isGenerating,
    nextAssigneeName,
    onGenerate,
}: RecurringTemplateGenerateActionProps) => {
    const [showConfirm, setShowConfirm] = useState(false)

    if (!isActive) return null

    return (
        <div className="mt-3 border-t border-neutral-100 pt-3 dark:border-neutral-700">
            {!showConfirm ? (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowConfirm(true)}
                    icon={<Plus className="size-4" />}
                    className="w-full"
                    disabled={isGenerating}
                >
                    Aufgabe erstellen
                </Button>
            ) : (
                <div className="space-y-2">
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        Aufgabe wird zugewiesen an: <strong>{nextAssigneeName}</strong>
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={() => {
                                onGenerate()
                                setShowConfirm(false)
                            }}
                            disabled={isGenerating}
                            className="flex-1"
                        >
                            {isGenerating ? (
                                <Loader2 className="size-4 animate-spin" />
                            ) : (
                                'Bestaetigen'
                            )}
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowConfirm(false)}
                        >
                            Abbrechen
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
