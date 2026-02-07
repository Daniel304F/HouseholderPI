import { useEffect, type RefObject } from 'react'

/**
 * Hook that calls a callback when a click occurs outside the referenced element.
 * @param ref - Reference to the element to detect outside clicks for
 * @param callback - Function to call when an outside click is detected
 * @param enabled - Whether the listener is active (default: true)
 */
export const useClickOutside = (
    ref: RefObject<HTMLElement | null>,
    callback: () => void,
    enabled: boolean = true
) => {
    useEffect(() => {
        if (!enabled) return

        const handleClickOutside = (event: MouseEvent) => {
            if (
                ref.current &&
                !ref.current.contains(event.target as Node)
            ) {
                callback()
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [ref, callback, enabled])
}
