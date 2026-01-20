import { apiClient } from '../lib/axios'

// Types
export interface GroupMember {
    userId: string
    role: 'owner' | 'admin' | 'member'
    isActiveResident: boolean
    joinedAt: string
}

export interface Group {
    id: string
    name: string
    inviteCode: string
    members: GroupMember[]
    activeResidentsCount: number
    picture?: string
    createdAt: string
    updatedAt: string
}

export interface GroupListItem {
    id: string
    name: string
    memberCount: number
    activeResidentsCount: number
    picture?: string
    role: GroupMember['role']
}

export interface CreateGroupRequest {
    name: string
    picture?: string
}

export interface UpdateGroupRequest {
    name?: string
    picture?: string
}

export interface JoinGroupRequest {
    inviteCode: string
}

export interface UpdateMemberRequest {
    role?: 'admin' | 'member'
    isActiveResident?: boolean
}

// API Response Types
interface ApiResponse<T> {
    success: boolean
    data: T
    message?: string
}

// API Functions
export const groupsApi = {
    // Alle meine Gruppen abrufen
    getMyGroups: async (): Promise<GroupListItem[]> => {
        const response =
            await apiClient.get<ApiResponse<GroupListItem[]>>('/groups')
        return response.data.data
    },

    // Gruppe per ID abrufen
    getGroup: async (groupId: string): Promise<Group> => {
        const response = await apiClient.get<ApiResponse<Group>>(
            `/groups/${groupId}`
        )
        return response.data.data
    },

    // Neue Gruppe erstellen
    createGroup: async (data: CreateGroupRequest): Promise<Group> => {
        const response = await apiClient.post<ApiResponse<Group>>(
            '/groups',
            data
        )
        return response.data.data
    },

    // Gruppe aktualisieren
    updateGroup: async (
        groupId: string,
        data: UpdateGroupRequest
    ): Promise<Group> => {
        const response = await apiClient.patch<ApiResponse<Group>>(
            `/groups/${groupId}`,
            data
        )
        return response.data.data
    },

    // Gruppe löschen
    deleteGroup: async (groupId: string): Promise<void> => {
        await apiClient.delete(`/groups/${groupId}`)
    },

    // Gruppe per Invite-Code beitreten
    joinGroup: async (data: JoinGroupRequest): Promise<Group> => {
        const response = await apiClient.post<ApiResponse<Group>>(
            '/groups/join',
            data
        )
        return response.data.data
    },

    // Gruppe verlassen
    leaveGroup: async (groupId: string): Promise<void> => {
        await apiClient.post(`/groups/${groupId}/leave`)
    },

    // Invite-Code neu generieren
    regenerateInviteCode: async (groupId: string): Promise<string> => {
        const response = await apiClient.post<
            ApiResponse<{ inviteCode: string }>
        >(`/groups/${groupId}/regenerate-invite`)
        return response.data.data.inviteCode
    },

    // Mitglied aktualisieren
    updateMember: async (
        groupId: string,
        memberId: string,
        data: UpdateMemberRequest
    ): Promise<GroupMember> => {
        const response = await apiClient.patch<ApiResponse<GroupMember>>(
            `/groups/${groupId}/members/${memberId}`,
            data
        )
        return response.data.data
    },

    // Mitglied entfernen
    removeMember: async (groupId: string, memberId: string): Promise<void> => {
        await apiClient.delete(`/groups/${groupId}/members/${memberId}`)
    },
}
