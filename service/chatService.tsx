import api from "../config/axios"
import { ChatMessageResponse, ChatMessageRequest } from "../models/chat"

export const ChatService={
    getMessages: async (conversationId: String): Promise<ChatMessageResponse[]>=>{
        const response = await api.get<ChatMessageResponse[]>(
            `/messages?conversationId=${conversationId}`
        )
        return response.data
    },

    sendMessage: async (request: ChatMessageRequest): Promise<ChatMessageResponse> => {
        const response = await api.post<ChatMessageResponse>(
            `/messages/send`,
            request
        )
        return response.data;
    }

    }
