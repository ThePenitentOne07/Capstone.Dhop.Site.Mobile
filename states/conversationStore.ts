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
            set({ conversations: response, isLoading: false });
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

            set((state) => ({
                conversations: [...state.conversations, newConversation],
                isLoading: false
            }));

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