import { create } from "zustand";
import type { ChatMessageRequest, ChatMessageResponse } from "../models/chat";
import { ChatService } from "../service/chatService";

interface ChatState {
    chats: ChatMessageResponse[];
    isLoading: boolean;
    error: string | null;
}

interface ChatActions {
    fetchCurrentChat: (conversationId: string) => Promise<void>;
    sendMessage: (request: ChatMessageRequest) => Promise<void>;
    addMessage: (message: ChatMessageResponse) => void;
    addMessageToChat: (message: ChatMessageResponse) => void;
}

type ChatStore = ChatState & ChatActions

export const useChatStore = create<ChatStore>((set) => ({
    chats: [],
    isLoading: false,
    error: null,

    fetchCurrentChat: async (conversationId) => {
        set({ isLoading: true, error: null })
        try {
            const response = await ChatService.getMessages(conversationId)
            set({ chats: response, isLoading: false })
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : String(error),
                isLoading: false
            })
        }
    },

    sendMessage: async (request) => {
        set({ isLoading: true, error: null })
        try {
            const response = await ChatService.sendMessage(request);
            set((state) => ({
                chats: [...state.chats, response],
                isLoading: false
            }))
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : String(error),
                isLoading: false
            })
            throw Error
        }
    },

    addMessage: (message) => {
        set((state) => ({
            chats: [...state.chats, message]
        }))
    },

    addMessageToChat: (message: ChatMessageResponse) => {
        set((state) => {
            // Check if message already exists to avoid duplicates
            const messageExists = state.chats.some(chat => chat.id === message.id);

            if (!messageExists) {
                const updatedChats = [...state.chats, message].sort(
                    (a, b) => new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime()
                );

                return {
                    ...state,
                    chats: updatedChats
                };
            }

            return state;
        })
    },
}))