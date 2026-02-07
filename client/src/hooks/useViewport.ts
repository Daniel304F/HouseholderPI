import { useEffect, useMemo, useState } from 'react'

export const ViewportSize = {
    Mobile: 'mobile',
    Tablet: 'tablet',
    Desktop: 'desktop',
} as const

export type ViewportSize = (typeof ViewportSize)[keyof typeof ViewportSize]

interface ViewportConfig {
    size: ViewportSize
    width: number
    isMobile: boolean
    isTablet: boolean
    isDesktop: boolean
}

const BREAKPOINTS = {
    tablet: 768,
    desktop: 1024,
} as const

const getWindowWidth = () => {
    if (typeof window === 'undefined') {
        return BREAKPOINTS.desktop
    }
    return window.innerWidth
}

const getViewportSize = (width: number): ViewportSize => {
    if (width < BREAKPOINTS.tablet) return ViewportSize.Mobile
    if (width < BREAKPOINTS.desktop) return ViewportSize.Tablet
    return ViewportSize.Desktop
}

export const useViewport = (): ViewportConfig => {
    const [width, setWidth] = useState<number>(getWindowWidth)

    useEffect(() => {
        let frameId = 0

        const handleResize = () => {
            if (frameId) return

            frameId = window.requestAnimationFrame(() => {
                setWidth(window.innerWidth)
                frameId = 0
            })
        }

        window.addEventListener('resize', handleResize)
        return () => {
            window.removeEventListener('resize', handleResize)
            if (frameId) {
                window.cancelAnimationFrame(frameId)
            }
        }
    }, [])

    const size = useMemo(() => getViewportSize(width), [width])

    return {
        size,
        width,
        isMobile: size === ViewportSize.Mobile,
        isTablet: size === ViewportSize.Tablet,
        isDesktop: size === ViewportSize.Desktop,
    }
}
