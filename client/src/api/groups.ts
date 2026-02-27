import { apiClient } from '../lib/axios'

// Types
export type PermissionLevel = 'owner' | 'admin' | 'member' | 'nobody'

export interface GroupPermissions {
    createTask: PermissionLevel
    assignTask: PermissionLevel
    deleteTask: PermissionLevel
    editTask: PermissionLevel
    manageRecurringTasks: PermissionLevel
}

export type GroupLlmProvider =
    | 'openai'
    | 'anthropic'
    | 'google'
    | 'openrouter'
    | 'custom'

export type GroupLlmCoordinationMode = 'planner' | 'multi_agent'

export type GroupLlmAgentFramework =
    | 'langgraph'
    | 'autogen'
    | 'semantic-kernel'
    | 'custom'

export interface GroupLlmDataAccess {
    includeTasks: boolean
    includeMessages: boolean
    includeMemberProfiles: boolean
}

export interface GroupLlmConfig {
    groupId: string
    enabled: boolean
    provider: GroupLlmProvider
    model: string
    coordinationMode: GroupLlmCoordinationMode
    agentFramework: GroupLlmAgentFramework
    dataAccess: GroupLlmDataAccess
    hasApiKey: boolean
    apiKeyHint?: string
    updatedBy?: string
    updatedAt: string | null
}

export interface UpdateGroupLlmConfigRequest {
    enabled?: boolean
    provider?: GroupLlmProvider
    model?: string
    apiKey?: string
    coordinationMode?: GroupLlmCoordinationMode
    agentFramework?: GroupLlmAgentFramework
    dataAccess?: Partial<GroupLlmDataAccess>
}

export type GroupLlmIntent =
    | 'chat_summary'
    | 'task_creation'
    | 'calendar_export'
    | 'moderation'

export interface GroupLlmCoordinateRequest {
    prompt: string
    intent: GroupLlmIntent
    idempotencyKey?: string
}

export interface GroupLlmExecutionPlan {
    runId: string
    groupId: string
    userId: string
    intent: GroupLlmIntent
    mode: 'read' | 'write'
    canExecuteTools: boolean
    toolScopes: string[]
    agents: string[]
    createdAt: string
}

export interface GroupLlmCoordinateResponse {
    plan: GroupLlmExecutionPlan
    runtime: {
        provider: GroupLlmProvider
        model: string
        coordinationMode: GroupLlmCoordinationMode
        agentFramework: GroupLlmAgentFramework
        frameworkRecommendation: string
        hasApiKey: boolean
    }
    context: {
        group: {
            id: string
            name: string
            memberCount: number
            activeResidentsCount: number
        }
        tasks: Array<{
            id: string
            title: string
            status: string
            priority: string
            assignedTo: string | null
            dueDate: string
        }>
        messages: Array<{
            id: string
            userId: string
            userName: string
            content: string
            createdAt: string
        }>
        memberProfiles: Array<{
            userId: string
            name: string
            email: string
            bio?: string
            avatar?: string
            achievements: string[]
        }>
    }
}

export interface GroupMember {
    userId: string
    role: 'owner' | 'admin' | 'member'
    isActiveResident: boolean
    joinedAt: string
    userName?: string
    userAvatar?: string
}

export interface Group {
    id: string
    name: string
    description?: string
    inviteCode: string
    members: GroupMember[]
    activeResidentsCount: number
    picture?: string
    permissions?: GroupPermissions
    createdAt: string
    updatedAt: string
}

export interface GroupListItem {
    id: string
    name: string
    description?: string
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

    // Berechtigungen abrufen
    getPermissions: async (groupId: string): Promise<GroupPermissions> => {
        const response = await apiClient.get<ApiResponse<GroupPermissions>>(
            `/groups/${groupId}/permissions`
        )
        return response.data.data
    },

    // Berechtigungen aktualisieren
    updatePermissions: async (
        groupId: string,
        permissions: Partial<GroupPermissions>
    ): Promise<GroupPermissions> => {
        const response = await apiClient.patch<ApiResponse<GroupPermissions>>(
            `/groups/${groupId}/permissions`,
            permissions
        )
        return response.data.data
    },

    // KI-Konfiguration abrufen
    getLlmConfig: async (groupId: string): Promise<GroupLlmConfig> => {
        const response = await apiClient.get<ApiResponse<GroupLlmConfig>>(
            `/groups/${groupId}/llm`
        )
        return response.data.data
    },

    // KI-Konfiguration speichern
    updateLlmConfig: async (
        groupId: string,
        data: UpdateGroupLlmConfigRequest
    ): Promise<GroupLlmConfig> => {
        const response = await apiClient.patch<ApiResponse<GroupLlmConfig>>(
            `/groups/${groupId}/llm`,
            data
        )
        return response.data.data
    },

    // Koordinationsplan fuer Gruppen-KI erzeugen
    coordinateLlm: async (
        groupId: string,
        data: GroupLlmCoordinateRequest
    ): Promise<GroupLlmCoordinateResponse> => {
        const response = await apiClient.post<ApiResponse<GroupLlmCoordinateResponse>>(
            `/groups/${groupId}/llm/coordinate`,
            data
        )
        return response.data.data
    },
}
