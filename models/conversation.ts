export interface ParticipantInfo {
    userUUID: string;
    avatar: string;
    name: string;
}

export interface ConversationResponse {
    id: string;
    type: string;
    participantsHash: string;
    conversationAvatar?: string;
    conversationName?: string;
    participants: Array<ParticipantInfo>;
    createdDate: string;
    modifiedDate: string;
    lastMessage?: string;
    unread?: number;
}

export interface ConversationRequest {
    type: string;
    participantIds: string[];
}

