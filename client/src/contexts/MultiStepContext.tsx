import { createContext, useContext } from 'react'

export interface MultiStepContextValue {
    currentStep: number
    totalSteps: number
    goToStep: (step: number) => void
    nextStep: () => void
    prevStep: () => void
    isFirstStep: boolean
    isLastStep: boolean
}

export const MultiStepContext = createContext<MultiStepContextValue | null>(
    null
)

export const useMultiStep = () => {
    const context = useContext(MultiStepContext)
    if (!context) {
        throw new Error('useMultiStep must be used within MultiStepProvider')
    }
    return context
}
