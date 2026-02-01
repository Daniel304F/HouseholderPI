import { Users, Inbox, Send } from 'lucide-react'
import type { Tab } from '../../../components/display'

export const TABS: Tab[] = [
    { id: 'friends', label: 'Freunde', icon: <Users className="size-4" /> },
    { id: 'requests', label: 'Anfragen', icon: <Inbox className="size-4" /> },
    { id: 'sent', label: 'Gesendet', icon: <Send className="size-4" /> },
]

export const QUERY_KEYS = {
    friends: ['friends'] as const,
    requests: ['friends', 'requests'] as const,
    sent: ['friends', 'sent'] as const,
}
