import { apiClient } from '../lib/axios'
import type { TaskAttachment } from './tasks'

export type RecurringFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly'
export type AssignmentStrategy = 'fixed' | 'rotation'
export type TaskPriority = 'low' | 'medium' | 'high'

export interface RecurringTaskTemplate {
    id: string
    groupId: string
    title: string
    description?: string
    priority: TaskPriority
    frequency: RecurringFrequency
    assignmentStrategy: AssignmentStrategy
    fixedAssignee?: string
    rotationOrder?: string[]
    currentRotationIndex: number
    dueDays: number[]
    isActive: boolean
    lastGeneratedAt?: string
    nextSuggestedAssignee?: string
    createdBy: string
    createdAt: string
    updatedAt: string
    attachments?: TaskAttachment[]
}

export interface CreateRecurringTaskInput {
    title: string
    description?: string
    priority?: TaskPriority
    frequency: RecurringFrequency
    assignmentStrategy: AssignmentStrategy
    fixedAssignee?: string
    rotationOrder?: string[]
    dueDays: number[]
}

export interface UpdateRecurringTaskInput {
    title?: string
    description?: string
    priority?: TaskPriority
    frequency?: RecurringFrequency
    assignmentStrategy?: AssignmentStrategy
    fixedAssignee?: string | null
    rotationOrder?: string[]
    dueDays?: number[]
}

interface ApiResponse<T> {
    success: boolean
    data: T
    message?: string
}

export const recurringTasksApi = {
    getTemplates: async (groupId: string): Promise<RecurringTaskTemplate[]> => {
        const response = await apiClient.get<
            ApiResponse<RecurringTaskTemplate[]>
        >(`/groups/${groupId}/recurring-tasks`)
        return response.data.data
    },

    getTemplate: async (
        groupId: string,
        templateId: string
    ): Promise<RecurringTaskTemplate> => {
        const response = await apiClient.get<
            ApiResponse<RecurringTaskTemplate>
        >(`/groups/${groupId}/recurring-tasks/${templateId}`)
        return response.data.data
    },

    createTemplate: async (
        groupId: string,
        data: CreateRecurringTaskInput
    ): Promise<RecurringTaskTemplate> => {
        const response = await apiClient.post<
            ApiResponse<RecurringTaskTemplate>
        >(`/groups/${groupId}/recurring-tasks`, data)
        return response.data.data
    },

    updateTemplate: async (
        groupId: string,
        templateId: string,
        data: UpdateRecurringTaskInput
    ): Promise<RecurringTaskTemplate> => {
        const response = await apiClient.patch<
            ApiResponse<RecurringTaskTemplate>
        >(`/groups/${groupId}/recurring-tasks/${templateId}`, data)
        return response.data.data
    },

    deleteTemplate: async (
        groupId: string,
        templateId: string
    ): Promise<void> => {
        await apiClient.delete(`/groups/${groupId}/recurring-tasks/${templateId}`)
    },

    toggleTemplate: async (
        groupId: string,
        templateId: string
    ): Promise<RecurringTaskTemplate> => {
        const response = await apiClient.post<
            ApiResponse<RecurringTaskTemplate>
        >(`/groups/${groupId}/recurring-tasks/${templateId}/toggle`)
        return response.data.data
    },

    generateTask: async (
        groupId: string,
        templateId: string,
        assignedTo?: string
    ): Promise<void> => {
        await apiClient.post(
            `/groups/${groupId}/recurring-tasks/${templateId}/generate`,
            { assignedTo }
        )
    },

    // Attachments
    getAttachments: async (
        groupId: string,
        templateId: string
    ): Promise<TaskAttachment[]> => {
        const response = await apiClient.get<ApiResponse<TaskAttachment[]>>(
            `/groups/${groupId}/recurring-tasks/${templateId}/attachments`
        )
        return response.data.data
    },

    uploadAttachment: async (
        groupId: string,
        templateId: string,
        file: File
    ): Promise<TaskAttachment> => {
        const formData = new FormData()
        formData.append('file', file)
        const response = await apiClient.post<ApiResponse<TaskAttachment>>(
            `/groups/${groupId}/recurring-tasks/${templateId}/attachments`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        )
        return response.data.data
    },

    deleteAttachment: async (
        groupId: string,
        templateId: string,
        attachmentId: string
    ): Promise<void> => {
        await apiClient.delete(
            `/groups/${groupId}/recurring-tasks/${templateId}/attachments/${attachmentId}`
        )
    },
}
