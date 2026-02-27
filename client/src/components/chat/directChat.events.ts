export const DIRECT_CHAT_OPEN_EVENT = 'direct-chat:open'

interface OpenDirectChatPayload {
    friendId: string
}

export const openDirectChat = (payload: OpenDirectChatPayload) => {
    window.dispatchEvent(
        new CustomEvent<OpenDirectChatPayload>(DIRECT_CHAT_OPEN_EVENT, {
            detail: payload,
        })
    )
}
