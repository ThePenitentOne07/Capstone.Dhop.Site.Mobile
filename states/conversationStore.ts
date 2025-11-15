import { create } from "zustand";
import { ConversationService } from "../service/conversationService";
import type { ConversationRequest, ConversationResponse } from "../models/conversation";

interface ConversationState {
    conversations: ConversationResponse[];
    isLoading: boolean;
    error: string | null;
}

interface ConversationActions {
    fetchMyConversations: () => Promise<void>;
    createConversation: (request: ConversationRequest) => Promise<ConversationResponse>;
}

type ConversationStore = ConversationState & ConversationActions;

export const useConversationStore = create<ConversationStore>((set) => ({
    conversations: [],
    isLoading: false,
    error: null,

    fetchMyConversations: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await ConversationService.getMyConversations();
            // Sort conversations by modifiedDate in descending order (latest first)
            const sortedConversations = [...response].sort((a, b) => {
                const dateA = new Date(a.modifiedDate).getTime();
                const dateB = new Date(b.modifiedDate).getTime();
                return dateB - dateA; // Descending order (newest first)
            });
            set({ conversations: sortedConversations, isLoading: false });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : String(error),
                isLoading: false,
            });
        }
    },

    createConversation: async (request) => {
        set({ isLoading: true, error: null })
        try {
            const newConversation = await ConversationService.createConversation(request);

            set((state) => {
                // Add new conversation and sort by modifiedDate (latest first)
                const updatedConversations = [...state.conversations, newConversation].sort((a, b) => {
                    const dateA = new Date(a.modifiedDate).getTime();
                    const dateB = new Date(b.modifiedDate).getTime();
                    return dateB - dateA; // Descending order (newest first)
                });
                return {
                    conversations: updatedConversations,
                    isLoading: false
                };
            });

            return newConversation;
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : String(error),
                isLoading: false
            })
            throw error;
        }
    }
}))