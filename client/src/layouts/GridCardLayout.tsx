import { type ReactNode } from 'react'

export interface GridCardLayoutProps {
    children: ReactNode
    columns?: 2 | 3 | 4
}

export const GridCardLayout = ({
    children,
    columns = 3,
}: GridCardLayoutProps) => {
    const columnClasses = {
        2: 'sm:grid-cols-2',
        3: 'sm:grid-cols-2 lg:grid-cols-3',
        4: 'sm:grid-cols-2 lg:grid-cols-4',
    }

    return (
        <div className={`grid gap-6 ${columnClasses[columns]}`}>{children}</div>
    )
}
