import {
    createContext,
    useContext,
    useState,
    useCallback,
    type ReactNode,
} from 'react'
import { Modal } from './Modal'
import { ModalBuilder } from './Builder'
import type { ModalOptions } from './types'

interface ModalContextValue {
    modal: () => ModalBuilder
    showModal: (options: ModalOptions) => void
    closeModal: () => void
}

const ModalContext = createContext<ModalContextValue | null>(null)

interface ModalProviderProps {
    children: ReactNode
}

export const ModalProvider = ({ children }: ModalProviderProps) => {
    const [isOpen, setIsOpen] = useState(false)
    const [options, setOptions] = useState<ModalOptions | null>(null)

    const showModal = useCallback((opts: ModalOptions) => {
        setOptions(opts)
        setIsOpen(true)
    }, [])

    const closeModal = useCallback(() => {
        setIsOpen(false)
        setOptions(null)
    }, [])

    const handleConfirm = useCallback(async () => {
        if (options?.onConfirm) {
            await options.onConfirm()
        }
        closeModal()
    }, [options, closeModal])

    const modal = useCallback(() => {
        return new ModalBuilder(showModal)
    }, [showModal])

    return (
        <ModalContext.Provider value={{ modal, showModal, closeModal }}>
            {children}
            <Modal
                isOpen={isOpen}
                options={options}
                onClose={closeModal}
                onConfirm={handleConfirm}
            />
        </ModalContext.Provider>
    )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useModal = (): ModalContextValue => {
    const context = useContext(ModalContext)
    if (!context) {
        throw new Error('useModal must be used within a ModalProvider')
    }
    return context
}
