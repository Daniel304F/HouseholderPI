import { useEffect, useRef } from 'react'

type KeyboardEventHandler = (event: KeyboardEvent) => void

interface KeyHandlers {
    onEscape?: KeyboardEventHandler
    onEnter?: KeyboardEventHandler
    onArrowUp?: KeyboardEventHandler
    onArrowDown?: KeyboardEventHandler
    onArrowLeft?: KeyboardEventHandler
    onArrowRight?: KeyboardEventHandler
    onSpace?: KeyboardEventHandler
    onBackspace?: KeyboardEventHandler
    onTab?: KeyboardEventHandler
    onKey?: (key: string, event: KeyboardEvent) => void
}

interface useKeyboardShortcutOptions extends KeyHandlers {
    enabled?: boolean
    preventDefault?: boolean
    stopPropagation?: boolean
    target?: HTMLElement | null
}

const KEY_MAP: Record<string, keyof Omit<KeyHandlers, 'onKey'>> = {
    Escape: 'onEscape',
    Enter: 'onEnter',
    ArrowUp: 'onArrowUp',
    ArrowDown: 'onArrowDown',
    ArrowLeft: 'onArrowLeft',
    ArrowRight: 'onArrowRight',
    ' ': 'onSpace',
    Backspace: 'onBackspace',
    Tab: 'onTab',
}

export const useKeyboardShortcut = ({
    enabled = true,
    preventDefault = false,
    stopPropagation = false,
    target,
    onKey,
    ...handlers
}: useKeyboardShortcutOptions = {}) => {
    const handlersRef = useRef(handlers)
    const onKeyRef = useRef(onKey)

    useEffect(() => {
        handlersRef.current = handlers
        onKeyRef.current = onKey
    })

    useEffect(() => {
        if (!enabled) {
            return
        }

        const element = target || document

        const handleKeyDown = (event: KeyboardEvent) => {
            const { key } = event

            if (onKeyRef.current) {
                onKeyRef.current(key, event)
            }

            const handlerKey = KEY_MAP[key]
            const handler = handlerKey
                ? handlersRef.current[handlerKey]
                : undefined

            if (handler) {
                if (preventDefault) {
                    event.preventDefault()
                }
                if (stopPropagation) {
                    event.stopPropagation()
                }
                handler(event)
            }
        }

        element.addEventListener('keydown', handleKeyDown as EventListener)

        return () => {
            element.removeEventListener(
                'keydown',
                handleKeyDown as EventListener
            )
        }
    }, [enabled, preventDefault, stopPropagation, target])
}
