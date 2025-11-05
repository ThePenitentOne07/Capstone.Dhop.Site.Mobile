import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useChatStore } from '../states/chatStore';
import { useConversationStore } from '../states/conversationStore';
import type { ConversationResponse } from '../models/conversation';
import type { ChatMessageResponse, IncomingMessage } from '../models/chat';
import { io, type Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ORANGE2 = '#FF7A00';

export default function ChatDetail() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { fetchCurrentChat, sendMessage, chats, isLoading, addMessageToChat } = useChatStore();
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const socketRef = useRef<Socket | null>(null);
  const insets = useSafeAreaInsets();

  const conversation = useMemo((): ConversationResponse | null => {
    try {
      if (typeof params.conversation === 'string') {
        const raw = decodeURIComponent(params.conversation);
        return JSON.parse(raw) as ConversationResponse;
      }
      if (params.conversation && typeof params.conversation === 'object' && !Array.isArray(params.conversation)) {
        return params.conversation as ConversationResponse;
      }
      return null;
    } catch {
      return null;
    }
  }, [params.conversation]);

  // Handle incoming socket messages
  const handleIncomingMessage = useCallback((incomingMessage: IncomingMessage) => {
    // Only process messages for current conversation
    if (incomingMessage.conversationId !== conversation?.id) return;

    // Convert IncomingMessage to ChatMessageResponse format
    const chatMessage: ChatMessageResponse = {
      id: incomingMessage.id,
      conversationId: incomingMessage.conversationId,
      message: incomingMessage.message,
      me: !!incomingMessage.me,
      createdDate: incomingMessage.createdDate,
      sender: {
        userUUID: incomingMessage.sender?.id || '',
        name: incomingMessage.sender?.name || 'Unknown',
        avatar: '',
      },
    };

    // Add message to chat store
    addMessageToChat(chatMessage);
  }, [conversation?.id, addMessageToChat]);

  // Setup socket connection
  useEffect(() => {
    const setupSocket = async () => {
      if (socketRef.current || !conversation?.id) return;

      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          console.log('No token found, skipping socket connection');
          return;
        }

        // Get WebSocket URL from env or derive from API URL
        const explicitWsUrl = process.env.EXPO_PUBLIC_WS_URL;
        let connectionUrl = explicitWsUrl;

        if (!connectionUrl) {
          const apiUrl = process.env.EXPO_PUBLIC_API_URL || '';
          if (apiUrl) {
            try {
              const urlObj = new URL(apiUrl);
              const isSecure = urlObj.protocol === 'https:';
              const wsProtocol = isSecure ? 'wss:' : 'ws:';
              connectionUrl = `${wsProtocol}//${urlObj.host}`;
            } catch (e) {
              console.error('Invalid EXPO_PUBLIC_API_URL, cannot derive WS URL:', apiUrl);
            }
          }
        }

        if (!connectionUrl) {
          console.error('No WebSocket URL configured. Set EXPO_PUBLIC_WS_URL or EXPO_PUBLIC_API_URL');
          return;
        }

        socketRef.current = io(connectionUrl, {
            path: "/socket.io/",
            transports: ["websocket", "polling"],
            query: {
                token: token
            },
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        socketRef.current.on('connect', () => {
          console.log('Socket connected:', socketRef.current?.id);
        });

        socketRef.current.on('disconnect', (reason) => {
          console.log('Socket disconnected:', reason);
        });

        socketRef.current.on('connect_error', (err) => {
          console.error('Socket connection error:', err);
        });

        socketRef.current.on('message', (rawMessage: string) => {
          try {
            const messageObject: IncomingMessage = JSON.parse(rawMessage);
            if (messageObject?.conversationId && messageObject?.id) {
              handleIncomingMessage(messageObject);
            }
          } catch (err) {
            console.error('Failed to parse incoming message:', err);
          }
        });
      } catch (error) {
        console.error('Failed to setup socket:', error);
      }
    };

    setupSocket();

    return () => {
      if (socketRef.current) {
        console.log('Disconnecting socket...');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [conversation?.id, handleIncomingMessage]);

  useEffect(() => {
    if (conversation?.id) {
      fetchCurrentChat(conversation.id);
    }
  }, [conversation?.id]);

  useEffect(() => {
    // Scroll to bottom when messages are loaded or updated
    if (chats.length > 0 && !isLoading) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 100);
    }
  }, [chats.length, isLoading]);

  const handleSendMessage = async () => {
    if (!message.trim() || !conversation?.id || sending) return;

    const messageText = message.trim();
    setMessage('');
    setSending(true);

    try {
      await sendMessage({
        conversationId: conversation.id,
        message: messageText,
      });
      // Refetch messages to get updated list
      await fetchCurrentChat(conversation.id);
    } catch (error) {
      console.error('Failed to send message:', error);
      // Optionally show error message to user
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const formatMessageDate = (dateString: string, prevDateString?: string) => {
    try {
      const date = new Date(dateString);
      const prevDate = prevDateString ? new Date(prevDateString) : null;
      
      if (prevDate) {
        const diffTime = Math.abs(date.getTime() - prevDate.getTime());
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
          return null; // Same day, no need to show date
        }
      }

      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        return 'Hôm nay';
      } else if (diffDays === 1) {
        return 'Hôm qua';
      } else {
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
      }
    } catch {
      return null;
    }
  };

  const renderMessage = ({ item, index }: { item: ChatMessageResponse; index: number }) => {
    const prevMessage = index > 0 ? chats[index - 1] : null;
    const showDate = formatMessageDate(item.createdDate, prevMessage?.createdDate);
    const isMe = item.me;

    return (
      <View>
        {showDate && (
          <View style={styles.dateSeparator}>
            <Text style={styles.dateText}>{showDate}</Text>
          </View>
        )}
        <View style={[styles.messageContainer, isMe ? styles.messageRight : styles.messageLeft]}>
          {!isMe && (
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>
                {item.sender?.name?.[0]?.toUpperCase() || 'U'}
              </Text>
            </View>
          )}
          <View style={[styles.messageBubble, isMe ? styles.messageBubbleRight : styles.messageBubbleLeft]}>
            <Text style={[styles.messageText, isMe ? styles.messageTextRight : styles.messageTextLeft]}>
              {item.message}
            </Text>
            <Text style={[styles.messageTime, isMe ? styles.messageTimeRight : styles.messageTimeLeft]}>
              {formatTime(item.createdDate)}
            </Text>
          </View>
          {isMe && (
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarTextMe}>Me</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  if (!conversation) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Không tìm thấy cuộc trò chuyện</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={'padding'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 + insets.top : insets.bottom}
    >
      <Stack.Screen
        options={{
          title: conversation?.conversationName || 'Chat',
        }}
      />
      <View style={styles.chatContainer}>
        <FlatList
          ref={flatListRef}
          data={chats}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          inverted={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
        
        <View style={[styles.inputContainer, { paddingBottom: Math.max(8, insets.bottom) }]}>
          <TextInput
            style={styles.input}
            placeholder="Nhập tin nhắn..."
            placeholderTextColor="#9CA3AF"
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!message.trim() || sending) && styles.sendButtonDisabled]}
            onPress={handleSendMessage}
            disabled={!message.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.sendButtonText}>Gửi</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  chatContainer: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#C92A2A',
    marginBottom: 16,
    fontFamily: 'RobotoMono_400Regular',
  },
  backButton: {
    backgroundColor: ORANGE2,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'RobotoMono_700Bold',
  },
  messagesList: {
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  dateSeparator: {
    alignItems: 'center',
    marginVertical: 16,
  },
  dateText: {
    fontSize: 12,
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    fontFamily: 'RobotoMono_400Regular',
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-end',
  },
  messageLeft: {
    justifyContent: 'flex-start',
  },
  messageRight: {
    justifyContent: 'flex-end',
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF4E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: '#FFD8B4',
  },
  avatarText: {
    fontSize: 14,
    color: ORANGE2,
    fontFamily: 'RobotoMono_700Bold',
  },
  avatarTextMe: {
    fontSize: 10,
    color: ORANGE2,
    fontFamily: 'RobotoMono_700Bold',
  },
  messageBubble: {
    maxWidth: '70%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  messageBubbleLeft: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
  },
  messageBubbleRight: {
    backgroundColor: ORANGE2,
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 15,
    fontFamily: 'RobotoMono_400Regular',
  },
  messageTextLeft: {
    color: '#111827',
  },
  messageTextRight: {
    color: '#fff',
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
    fontFamily: 'RobotoMono_400Regular',
  },
  messageTimeLeft: {
    color: '#6B7280',
  },
  messageTimeRight: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
    fontFamily: 'RobotoMono_400Regular',
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: ORANGE2,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 60,
  },
  sendButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: 'RobotoMono_700Bold',
  },
});

