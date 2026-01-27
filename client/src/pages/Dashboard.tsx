import { useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useHeaderContext } from '../contexts/HeaderContext'
import { Headline } from '../components/Headline'
import { DashboardLayout } from '../layouts/DashboardLayout'

export const Dashboard = () => {
    const { user } = useAuth()
    const { setTitle, setSubtitle } = useHeaderContext()

    useEffect(() => {
        setTitle('Dashboard')
        setSubtitle(`Willkommen, ${user?.name ?? 'User'}!`)
        return () => {
            setTitle('')
            setSubtitle('')
        }
    }, [setTitle, setSubtitle, user?.name])

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <Headline
                    title={`Hallo, ${user?.name ?? 'User'}!`}
                    subtitle="Willkommen in deinem Dashboard"
                />

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"></div>
            </div>
        </DashboardLayout>
    )
}
