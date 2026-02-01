import { useMutation, useQueryClient } from '@tanstack/react-query'
import { friendsApi } from '../../../api/friends'
import { useToast } from '../../../contexts/ToastContext'
import { QUERY_KEYS } from './constants'

export const useFriendsMutations = () => {
    const queryClient = useQueryClient()
    const toast = useToast()

    const sendRequestMutation = useMutation({
        mutationFn: (email: string) => friendsApi.sendRequest({ email }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.sent })
            toast.success('Freundschaftsanfrage gesendet!')
        },
        onError: () => {
            toast.error('Anfrage konnte nicht gesendet werden')
        },
    })

    const respondMutation = useMutation({
        mutationFn: ({
            requestId,
            accept,
        }: {
            requestId: string
            accept: boolean
        }) => friendsApi.respondToRequest(requestId, { accept }),
        onSuccess: (_, { accept }) => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.friends })
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.requests })
            toast.success(accept ? 'Anfrage angenommen!' : 'Anfrage abgelehnt')
        },
        onError: () => {
            toast.error('Fehler beim Bearbeiten der Anfrage')
        },
    })

    const cancelRequestMutation = useMutation({
        mutationFn: friendsApi.cancelRequest,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.sent })
            toast.success('Anfrage zurückgezogen')
        },
        onError: () => {
            toast.error('Anfrage konnte nicht zurückgezogen werden')
        },
    })

    const removeFriendMutation = useMutation({
        mutationFn: friendsApi.removeFriend,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.friends })
            toast.success('Freund entfernt')
        },
        onError: () => {
            toast.error('Freund konnte nicht entfernt werden')
        },
    })

    return {
        sendRequestMutation,
        respondMutation,
        cancelRequestMutation,
        removeFriendMutation,
    }
}
