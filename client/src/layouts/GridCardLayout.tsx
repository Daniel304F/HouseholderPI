import { type ReactNode } from 'react'

export interface GridCardLayoutProps {
    children: ReactNode
}

export const GridCardLayout = ({ children }: GridCardLayoutProps) => {
    return <div className="grid gap-6 sm:grid-cols-3">{children}</div>
}
