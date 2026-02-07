export const formatChatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('de-DE', {
        hour: '2-digit',
        minute: '2-digit',
    })
}

export const formatChatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()

    if (date.toDateString() === today.toDateString()) {
        return 'Heute'
    }

    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    if (date.toDateString() === yesterday.toDateString()) {
        return 'Gestern'
    }

    return date.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    })
}
