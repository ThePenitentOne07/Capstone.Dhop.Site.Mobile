import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  ScrollView,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { chatBoxQuery, DancerData, ChoreographerData } from '../service/api';

const ORANGE2 = '#FF7A00';
const fallbackAvatar = require('../assets/logo-icon.png');

interface Message {
  id: string;
  message: string;
  isAI: boolean;
  timestamp: Date;
  type?: 'text' | 'dancer' | 'choreographer' | 'general';
  data?: DancerData[] | ChoreographerData[];
}

export default function ChatBoxAI() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      message: 'Xin chào! Tôi là trợ lý AI. Tôi có thể giúp bạn tìm biên đạo hoặc nhóm nhảy phù hợp. Bạn muốn tìm gì?',
      isAI: true,
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    // Scroll to bottom when messages change
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || sending) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      message: inputMessage.trim(),
      isAI: false,
      timestamp: new Date(),
    };

    const messageText = inputMessage.trim();
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setSending(true);

    try {
      const response = await chatBoxQuery({ message: messageText });
      const responseType = response.data.type;
      const isDancer = responseType === 'dancer';
      const isChoreographer = responseType === 'choreographer';
      const isGeneral = responseType === 'general';

      let aiMessageText = 'Phản hồi từ AI';
      if (isDancer && response.data.data) {
        aiMessageText = `Tìm thấy ${response.data.data.length} nhóm nhảy phù hợp`;
      } else if (isChoreographer && response.data.data) {
        aiMessageText = `Tìm thấy ${response.data.data.length} biên đạo phù hợp`;
      } else if (isGeneral && response.data.message) {
        aiMessageText = response.data.message;
      }

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        message: aiMessageText,
        isAI: true,
        timestamp: new Date(),
        type: isGeneral ? 'general' : (isDancer ? 'dancer' : 'choreographer'),
        data: response.data.data,
      };
      setMessages((prev) => [...prev, aiResponse]);
    } catch (error: any) {
      console.error('Failed to get AI response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        message: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.',
        isAI: true,
        timestamp: new Date(),
        type: 'general',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setSending(false);
    }
  };


  const renderDancerCard = (dancer: DancerData) => {
    return (
      <TouchableOpacity
        key={dancer.id}
        style={styles.resultCard}
        onPress={() => router.push({ pathname: '/DetailsDancer/[id]', params: { id: String(dancer.id) } })}
      >
        <View style={styles.cardHeader}>
          {dancer.avatar ? (
            <Image source={{ uri: dancer.avatar }} style={styles.cardAvatar} />
          ) : (
            <Image source={fallbackAvatar} style={styles.cardAvatar} />
          )}
          <View style={styles.cardInfo}>
            <Text style={styles.cardName}>{dancer.danceCrewName}</Text>
            <Text style={styles.cardExp}>{dancer.yearExperience} năm kinh nghiệm</Text>
          </View>
        </View>
        <View style={styles.cardDetails}>
          <View style={styles.cardTagsRow}>
            <Text style={styles.cardLabel}>LOẠI NHẢY:</Text>
            <View style={styles.cardTags}>
              {dancer.danceTypes.map((type, idx) => (
                <View key={idx} style={styles.cardTag}>
                  <Text style={styles.cardTagText}>{type}</Text>
                </View>
              ))}
            </View>
          </View>
          <View style={styles.cardTagsRow}>
            <Text style={styles.cardLabel}>KHU VỰC:</Text>
            <View style={styles.cardTags}>
              {dancer.areas.map((area, idx) => (
                <View key={idx} style={styles.cardTag}>
                  <Text style={styles.cardTagText}>{area}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderChoreographerCard = (choreographer: ChoreographerData) => {
    return (
      <TouchableOpacity
        key={choreographer.id}
        style={styles.resultCard}
        onPress={() => router.push({ pathname: '/DetailsChoreography/[id]', params: { id: String(choreographer.id) } })}
      >
        <View style={styles.cardHeader}>
          {choreographer.avatar ? (
            <Image source={{ uri: choreographer.avatar }} style={styles.cardAvatar} />
          ) : (
            <Image source={fallbackAvatar} style={styles.cardAvatar} />
          )}
          <View style={styles.cardInfo}>
            <Text style={styles.cardName}>{choreographer.nickName}</Text>
            <Text style={styles.cardExp}>{choreographer.yearExperience} năm kinh nghiệm</Text>
          </View>
        </View>
        <View style={styles.cardDetails}>
          <View style={styles.cardTagsRow}>
            <Text style={styles.cardLabel}>LOẠI NHẢY:</Text>
            <View style={styles.cardTags}>
              {choreographer.danceTypes.map((type, idx) => (
                <View key={idx} style={styles.cardTag}>
                  <Text style={styles.cardTagText}>{type}</Text>
                </View>
              ))}
            </View>
          </View>
          <View style={styles.cardTagsRow}>
            <Text style={styles.cardLabel}>KHU VỰC:</Text>
            <View style={styles.cardTags}>
              {choreographer.areas.map((area, idx) => (
                <View key={idx} style={styles.cardTag}>
                  <Text style={styles.cardTagText}>{area}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isAI = item.isAI;
    return (
      <View style={styles.messageWrapper}>
        <View
          style={[
            styles.messageContainer,
            isAI ? styles.messageLeft : styles.messageRight,
          ]}
        >
          {isAI && (
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>AI</Text>
            </View>
          )}
          <View
            style={[
              styles.messageBubble,
              isAI ? styles.messageBubbleLeft : styles.messageBubbleRight,
            ]}
          >
            <Text style={[styles.messageText, { color: isAI ? '#111827' : '#FFFFFF' }]}>
              {item.message}
            </Text>
          </View>
          {!isAI && (
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>Bạn</Text>
            </View>
          )}
        </View>

        {/* Render dancer results */}
        {item.type === 'dancer' && item.data && Array.isArray(item.data) && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.resultsContainer}
            contentContainerStyle={styles.resultsContent}
          >
            {(item.data as DancerData[]).map((dancer) => renderDancerCard(dancer))}
          </ScrollView>
        )}

        {/* Render choreographer results */}
        {item.type === 'choreographer' && item.data && Array.isArray(item.data) && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.resultsContainer}
            contentContainerStyle={styles.resultsContent}
          >
            {(item.data as ChoreographerData[]).map((choreographer) => renderChoreographerCard(choreographer))}
          </ScrollView>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Trợ lý AI',
          headerStyle: {
            backgroundColor: ORANGE2,
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontFamily: 'RobotoMono_700Bold',
          },
        }}
      />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={100}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }}
        />

        <View
          style={[
            styles.inputContainer,
            { paddingBottom: Math.max(8, insets.bottom) },
          ]}
        >
          <TextInput
            style={styles.input}
            value={inputMessage}
            onChangeText={setInputMessage}
            placeholder="Nhập câu hỏi của bạn..."
            placeholderTextColor="#9CA3AF"
            multiline
            maxLength={500}
            onSubmitEditing={handleSendMessage}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputMessage.trim() || sending) && styles.sendButtonDisabled,
            ]}
            onPress={handleSendMessage}
            disabled={!inputMessage.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.sendButtonText}>Gửi</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  keyboardView: {
    flex: 1,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 8,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 12,
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
    backgroundColor: ORANGE2,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'RobotoMono_700Bold',
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  messageBubbleLeft: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
  },
  messageBubbleRight: {
    backgroundColor: ORANGE2,
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 14,
    fontFamily: 'RobotoMono_400Regular',
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
    fontFamily: 'RobotoMono_400Regular',
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: ORANGE2,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'RobotoMono_700Bold',
  },
  messageWrapper: {
    marginBottom: 12,
  },
  resultsContainer: {
    marginTop: 8,
    marginLeft: 48,
  },
  resultsContent: {
    paddingRight: 16,
    paddingLeft: 0,
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    width: 280,
    marginRight: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor: '#F3F4F6',
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: 16,
    color: '#111827',
    fontFamily: 'RobotoMono_700Bold',
    marginBottom: 4,
  },
  cardExp: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'RobotoMono_400Regular',
  },
  cardDetails: {
    gap: 8,
  },
  cardTagsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  cardLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontFamily: 'RobotoMono_700Bold',
    minWidth: 70,
  },
  cardTags: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  cardTag: {
    backgroundColor: ORANGE2,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  cardTagText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontFamily: 'RobotoMono_700Bold',
  },
});
