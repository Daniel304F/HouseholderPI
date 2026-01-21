import { useState, type ReactNode } from 'react'
import { ChevronLeft, ChevronRight, Check } from 'lucide-react'
import { cn } from '../../utils/cn'
import { Button } from '../Button'
import {
    MultiStepContext,
    type MultiStepContextValue,
} from '../../contexts/MultiStepContext'

// ============================================================================
// Types
// ============================================================================

export interface Step {
    id: string
    title: string
    description?: string
    content: ReactNode
    isValid?: boolean
}

// ============================================================================
// Props
// ============================================================================

interface MultiStepProps {
    steps: Step[]
    onComplete: () => void | Promise<void>
    onCancel: () => void
    isLoading?: boolean
    completeText?: string
    className?: string
}

// ============================================================================
// Component
// ============================================================================

export const MultiStep = ({
    steps,
    onComplete,
    onCancel,
    isLoading = false,
    completeText = 'Abschließen',
    className,
}: MultiStepProps) => {
    const [currentStep, setCurrentStep] = useState(0)

    const totalSteps = steps.length
    const isFirstStep = currentStep === 0
    const isLastStep = currentStep === totalSteps - 1
    const currentStepData = steps[currentStep]
    const canProceed = currentStepData?.isValid !== false

    const goToStep = (step: number) => {
        if (step >= 0 && step < totalSteps) {
            setCurrentStep(step)
        }
    }

    const nextStep = () => {
        if (!isLastStep && canProceed) {
            setCurrentStep((prev) => prev + 1)
        }
    }

    const prevStep = () => {
        if (!isFirstStep) {
            setCurrentStep((prev) => prev - 1)
        }
    }

    const handleComplete = async () => {
        if (canProceed) {
            await onComplete()
        }
    }

    const contextValue: MultiStepContextValue = {
        currentStep,
        totalSteps,
        goToStep,
        nextStep,
        prevStep,
        isFirstStep,
        isLastStep,
    }

    return (
        <MultiStepContext.Provider value={contextValue}>
            <div className={cn('flex flex-col', className)}>
                <div className="mb-6">
                    <StepIndicator steps={steps} currentStep={currentStep} />
                </div>

                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                        {currentStepData?.title}
                    </h3>
                    {currentStepData?.description && (
                        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                            {currentStepData.description}
                        </p>
                    )}
                </div>

                <div className="min-h-[200px] flex-1">
                    {currentStepData?.content}
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-neutral-200 pt-4 dark:border-neutral-700">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={isFirstStep ? onCancel : prevStep}
                        icon={
                            isFirstStep ? undefined : (
                                <ChevronLeft className="size-4" />
                            )
                        }
                    >
                        {isFirstStep ? 'Abbrechen' : 'Zurück'}
                    </Button>

                    <div className="text-sm text-neutral-500 dark:text-neutral-400">
                        Schritt {currentStep + 1} von {totalSteps}
                    </div>

                    {isLastStep ? (
                        <Button
                            type="button"
                            onClick={handleComplete}
                            disabled={!canProceed}
                            isLoading={isLoading}
                            icon={<Check className="size-4" />}
                        >
                            {completeText}
                        </Button>
                    ) : (
                        <Button
                            type="button"
                            onClick={nextStep}
                            disabled={!canProceed}
                            icon={<ChevronRight className="size-4" />}
                            iconPosition="right"
                        >
                            Weiter
                        </Button>
                    )}
                </div>
            </div>
        </MultiStepContext.Provider>
    )
}

interface StepIndicatorProps {
    steps: Step[]
    currentStep: number
}

const StepIndicator = ({ steps, currentStep }: StepIndicatorProps) => {
    return (
        <div className="flex items-center justify-center gap-2">
            {steps.map((step, index) => {
                const isActive = index === currentStep
                const isCompleted = index < currentStep
                const isUpcoming = index > currentStep

                return (
                    <div key={step.id} className="flex items-center">
                        <div
                            className={cn(
                                'flex size-8 items-center justify-center rounded-full text-sm font-medium',
                                'transition-all duration-300',
                                isCompleted && 'bg-brand-500 text-white',
                                isActive &&
                                    'bg-brand-500 ring-brand-500/20 text-white ring-4',
                                isUpcoming &&
                                    'bg-neutral-200 text-neutral-500 dark:bg-neutral-700 dark:text-neutral-400'
                            )}
                        >
                            {isCompleted ? (
                                <Check className="size-4" />
                            ) : (
                                index + 1
                            )}
                        </div>

                        {index < steps.length - 1 && (
                            <div
                                className={cn(
                                    'mx-2 h-0.5 w-8 rounded-full transition-colors duration-300',
                                    index < currentStep
                                        ? 'bg-brand-500'
                                        : 'bg-neutral-200 dark:bg-neutral-700'
                                )}
                            />
                        )}
                    </div>
                )
            })}
        </div>
    )
}
