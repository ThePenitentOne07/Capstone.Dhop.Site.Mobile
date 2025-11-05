import type { ParticipantInfo } from "./conversation";

export interface ChatMessageResponse {
    id: string;
    conversationId: string;
    me: boolean;
    message: string;
    sender: ParticipantInfo;
    createdDate: string
}

export interface ChatMessageRequest {
    conversationId: string;
    message: string;
}

export interface Message {
    id: string;
    message: string;
    createdDate: string;
    conversationId: string;
    me: boolean;
    pending?: boolean;
    failed?: boolean;
    sender?: {
        avatar?: string;
        name?: string;
    };
}

export interface IncomingMessage {
    id: string;
    conversationId: string;
    message: string;
    createdDate: string;
    sender?: { name: string; id: string };
    me?: boolean;
    pending?: boolean;
    failed?: boolean;
}
