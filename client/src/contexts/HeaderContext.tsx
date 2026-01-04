import { createContext, useContext, useEffect, useState } from 'react'

interface HeaderContextProps {
    title: string
    setTitle: (title: string) => void
    subtitle: string
    setSubtitle: (subtitle: string) => void
}

const HeaderContext = createContext<HeaderContextProps | undefined>(undefined)

export const HeaderProvider = ({ children }: { children: React.ReactNode }) => {
    const [title, setTitle] = useState<string>('')
    const [subtitle, setSubtitle] = useState<string>('')

    useEffect(() => {
        document.title = title ? `HouseHolder | ${title}` : 'HouseHolder'
    }, [title])

    return (
        <HeaderContext.Provider
            value={{ title, setTitle, subtitle, setSubtitle }}
        >
            {children}
        </HeaderContext.Provider>
    )
}

export const useHeaderContext = () => {
    const context = useContext(HeaderContext)
    if (!context) {
        throw new Error('useHeaderContext must be used within a HeaderProvider')
    }
    return context
}
