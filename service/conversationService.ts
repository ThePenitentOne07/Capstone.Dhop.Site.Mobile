import api from "../config/axios";

import type { ConversationRequest, ConversationResponse } from "../models/conversation";

export const ConversationService = {
    createConversation: async (request: ConversationRequest): Promise<ConversationResponse> => {
        const response = await api.post<ConversationResponse>(
            "/conversation/create",
            request
        );
        return response.data;
    },

    getMyConversations: async (): Promise<ConversationResponse[]> => {
        const response = await api.get<ConversationResponse[]>(
            "/conversation/my-conversation"
        );
        return response.data;
    }
}