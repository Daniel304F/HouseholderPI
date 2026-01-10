import { useState, useCallback, useEffect } from 'react'

interface UseSidebarOptions {
    defaultWidth?: number
    minWidth?: number
    maxWidth?: number
    storageKey?: string
}

interface UseSidebarReturn {
    width: number
    isCollapsed: boolean
    isResizing: boolean
    setWidth: (width: number) => void
    toggle: () => void
    collapse: () => void
    expand: () => void
    startResizing: () => void
    stopResizing: () => void
}

export const useSidebar = ({
    defaultWidth = 280,
    minWidth = 200,
    maxWidth = 480,
    storageKey = 'sidebar-width',
}: UseSidebarOptions = {}): UseSidebarReturn => {
    const [width, setWidthState] = useState<number>(() => {
        if (typeof window === 'undefined') return defaultWidth
        const stored = localStorage.getItem(storageKey)
        if (stored) {
            const parsed = parseInt(stored, 10)
            if (!isNaN(parsed) && parsed >= minWidth && parsed <= maxWidth) {
                return parsed
            }
        }
        return defaultWidth
    })

    const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
        if (typeof window === 'undefined') return false
        return localStorage.getItem(`${storageKey}-collapsed`) === 'true'
    })

    const [isResizing, setIsResizing] = useState(false)

    const setWidth = useCallback(
        (newWidth: number) => {
            const clampedWidth = Math.min(
                Math.max(newWidth, minWidth),
                maxWidth
            )
            setWidthState(clampedWidth)
            localStorage.setItem(storageKey, String(clampedWidth))
        },
        [minWidth, maxWidth, storageKey]
    )

    const toggle = useCallback(() => {
        setIsCollapsed((prev) => {
            const newValue = !prev
            localStorage.setItem(`${storageKey}-collapsed`, String(newValue))
            return newValue
        })
    }, [storageKey])

    const collapse = useCallback(() => {
        setIsCollapsed(true)
        localStorage.setItem(`${storageKey}-collapsed`, 'true')
    }, [storageKey])

    const expand = useCallback(() => {
        setIsCollapsed(false)
        localStorage.setItem(`${storageKey}-collapsed`, 'false')
    }, [storageKey])

    const startResizing = useCallback(() => {
        setIsResizing(true)
    }, [])

    const stopResizing = useCallback(() => {
        setIsResizing(false)
    }, [])

    useEffect(() => {
        if (!isResizing) return

        const handleMouseMove = (e: MouseEvent) => {
            const newWidth = e.clientX
            setWidth(newWidth)
        }

        const handleMouseUp = () => {
            stopResizing()
        }

        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)

        document.body.style.cursor = 'col-resize'
        document.body.style.userSelect = 'none'

        return () => {
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
            document.body.style.cursor = ''
            document.body.style.userSelect = ''
        }
    }, [isResizing, setWidth, stopResizing])

    return {
        width,
        isCollapsed,
        isResizing,
        setWidth,
        toggle,
        collapse,
        expand,
        startResizing,
        stopResizing,
    }
}
